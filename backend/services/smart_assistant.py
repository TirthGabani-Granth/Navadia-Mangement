import datetime
from typing import Dict, List, Optional, Tuple

from sqlmodel import Session, select

from models.models import (
    ActivityLog,
    Appointment,
    AutomationSettings,
    Patient,
    Reminder,
    Staff,
    Task,
    TaskLink,
)


def get_or_create_automation_settings(session: Session) -> AutomationSettings:
    settings = session.exec(select(AutomationSettings)).first()
    if not settings:
        settings = AutomationSettings(reminders_enabled=True, reminder_channel="WhatsApp")
        session.add(settings)
        session.commit()
        session.refresh(settings)
    return settings


def update_automation_settings(session: Session, enabled: bool, channel: str) -> AutomationSettings:
    settings = get_or_create_automation_settings(session)
    settings.reminders_enabled = enabled
    settings.reminder_channel = channel
    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings


def enqueue_appointment_reminders(session: Session, appointment: Appointment) -> None:
    reminder_24h = Reminder(
        patient_id=appointment.patient_id,
        reminder_date=appointment.appointment_time - datetime.timedelta(hours=24),
        reminder_type=f"APPOINTMENT:24H:{appointment.id}",
        status="Pending",
    )
    reminder_2h = Reminder(
        patient_id=appointment.patient_id,
        reminder_date=appointment.appointment_time - datetime.timedelta(hours=2),
        reminder_type=f"APPOINTMENT:2H:{appointment.id}",
        status="Pending",
    )
    session.add(reminder_24h)
    session.add(reminder_2h)


def enqueue_followup_reminders(session: Session, appointment: Appointment) -> None:
    followup_3d = Reminder(
        patient_id=appointment.patient_id,
        reminder_date=datetime.datetime.utcnow() + datetime.timedelta(days=3),
        reminder_type=f"FOLLOWUP:3D:{appointment.id}",
        status="Pending",
    )
    followup_7d = Reminder(
        patient_id=appointment.patient_id,
        reminder_date=datetime.datetime.utcnow() + datetime.timedelta(days=7),
        reminder_type=f"FOLLOWUP:7D:{appointment.id}",
        status="Pending",
    )
    session.add(followup_3d)
    session.add(followup_7d)


def _pick_staff_for_task(session: Session, preferred_role: Optional[str] = None) -> Optional[int]:
    staff_members = session.exec(select(Staff).where(Staff.status == "Active")).all()
    if not staff_members:
        return None
    if preferred_role:
        matched = [s for s in staff_members if preferred_role.lower() in s.role.lower()]
        if matched:
            return matched[0].id
    return staff_members[0].id


def _create_task_with_link(
    session: Session,
    title: str,
    description: str,
    patient_id: int,
    appointment_id: Optional[int],
    due_date: datetime.datetime,
    priority: str,
    category: str,
    preferred_role: Optional[str] = None,
) -> Task:
    task = Task(
        title=title,
        description=description,
        assigned_to=_pick_staff_for_task(session, preferred_role=preferred_role),
        priority=priority,
        status="To Do",
        due_date=due_date,
        category=category,
    )
    session.add(task)
    session.flush()

    task_link = TaskLink(task_id=task.id, patient_id=patient_id, appointment_id=appointment_id)
    session.add(task_link)
    return task


def generate_auto_tasks_for_patient(session: Session, patient: Patient) -> None:
    now = datetime.datetime.utcnow()
    _create_task_with_link(
        session,
        title="Prepare chair",
        description=f"Prepare dental chair for new patient {patient.name}",
        patient_id=patient.id,
        appointment_id=None,
        due_date=now + datetime.timedelta(hours=1),
        priority="Medium",
        category="Patient Care",
        preferred_role="Assistant",
    )
    _create_task_with_link(
        session,
        title="Check equipment",
        description=f"Verify equipment setup for patient {patient.name}",
        patient_id=patient.id,
        appointment_id=None,
        due_date=now + datetime.timedelta(hours=2),
        priority="Medium",
        category="Equipment",
        preferred_role="Assistant",
    )
    _create_task_with_link(
        session,
        title="Patient follow-up",
        description=f"Plan onboarding follow-up for patient {patient.name}",
        patient_id=patient.id,
        appointment_id=None,
        due_date=now + datetime.timedelta(days=1),
        priority="Low",
        category="Admin",
        preferred_role="Receptionist",
    )


def generate_auto_tasks_for_appointment(session: Session, appointment: Appointment, patient: Patient) -> None:
    _create_task_with_link(
        session,
        title="Prepare chair",
        description=f"Prepare chair for appointment #{appointment.id} ({patient.name})",
        patient_id=patient.id,
        appointment_id=appointment.id,
        due_date=appointment.appointment_time - datetime.timedelta(minutes=30),
        priority="High",
        category="Patient Care",
        preferred_role="Assistant",
    )
    _create_task_with_link(
        session,
        title="Check equipment",
        description=f"Check equipment before appointment #{appointment.id}",
        patient_id=patient.id,
        appointment_id=appointment.id,
        due_date=appointment.appointment_time - datetime.timedelta(minutes=20),
        priority="Medium",
        category="Equipment",
        preferred_role="Assistant",
    )
    _create_task_with_link(
        session,
        title="Patient follow-up",
        description=f"Follow-up call after appointment #{appointment.id}",
        patient_id=patient.id,
        appointment_id=appointment.id,
        due_date=appointment.appointment_time + datetime.timedelta(days=1),
        priority="Medium",
        category="Patient Care",
        preferred_role="Receptionist",
    )


def _compute_ai_priority(task: Task, linked_appointment: Optional[Appointment]) -> Tuple[str, int]:
    score = 0
    now = datetime.datetime.utcnow()

    if task.priority == "Urgent":
        score += 100
    elif task.priority == "High":
        score += 75
    elif task.priority == "Medium":
        score += 45
    else:
        score += 20

    if task.due_date:
        if task.due_date < now:
            score += 40
        elif task.due_date <= now + datetime.timedelta(hours=2):
            score += 25
        elif task.due_date <= now + datetime.timedelta(hours=8):
            score += 15

    age_hours = max(0, int((now - task.created_at).total_seconds() / 3600))
    score += min(20, age_hours // 3)

    if linked_appointment and linked_appointment.status == "Waiting":
        score += 35

    if score >= 90:
        return "Urgent", score
    return "Normal", score


def get_tasks_with_ai_priority(session: Session) -> List[Dict]:
    tasks = session.exec(select(Task)).all()
    links = session.exec(select(TaskLink)).all()
    link_map = {l.task_id: l for l in links}

    enriched = []
    for task in tasks:
        assignee = session.get(Staff, task.assigned_to) if task.assigned_to else None
        creator = session.get(Staff, task.created_by) if task.created_by else None
        link = link_map.get(task.id)
        patient = session.get(Patient, link.patient_id) if link and link.patient_id else None
        linked_appointment = session.get(Appointment, link.appointment_id) if link and link.appointment_id else None

        ai_priority, ai_score = _compute_ai_priority(task, linked_appointment)
        enriched.append(
            {
                **task.dict(),
                "assigned_to_name": assignee.name if assignee else None,
                "assigned_to_color": assignee.avatar_color if assignee else None,
                "created_by_name": creator.name if creator else None,
                "patient_id": link.patient_id if link else None,
                "patient_name": patient.name if patient else None,
                "appointment_id": link.appointment_id if link else None,
                "ai_priority": ai_priority,
                "ai_score": ai_score,
            }
        )

    return sorted(enriched, key=lambda t: (t["status"] == "Done", -t["ai_score"], t["created_at"]))


def get_smart_insights(session: Session) -> List[str]:
    now = datetime.datetime.utcnow()
    today = now.date()
    start = datetime.datetime.combine(today, datetime.time.min)
    end = datetime.datetime.combine(today, datetime.time.max)

    todays_apps = session.exec(
        select(Appointment).where(Appointment.appointment_time >= start, Appointment.appointment_time <= end)
    ).all()
    missed_today = len([a for a in todays_apps if a.appointment_time < now and a.status in {"Scheduled", "Waiting"}])

    followups_pending = len(
        session.exec(
            select(Reminder).where(Reminder.status == "Pending", Reminder.reminder_type.contains("FOLLOWUP:"))
        ).all()
    )

    hour_load: Dict[int, int] = {}
    for app in todays_apps:
        hour_load[app.appointment_time.hour] = hour_load.get(app.appointment_time.hour, 0) + 1
    peak_hour = max(hour_load, key=hour_load.get) if hour_load else None
    peak_load = hour_load.get(peak_hour, 0) if peak_hour is not None else 0

    insights = [
        f"{missed_today} patients missed appointments today",
        f"{followups_pending} follow-ups pending",
    ]
    if peak_hour is not None:
        display_hour = datetime.time(hour=peak_hour).strftime("%I:%M %p").lstrip("0")
        insights.append(f"High patient load at {display_hour} ({peak_load} appointments)")
    else:
        insights.append("No high-load time detected today")
    return insights


def answer_assistant_query(session: Session, message: str) -> str:
    q = message.lower().strip()
    now = datetime.datetime.utcnow()
    today = now.date()

    if "patients today" in q or ("how many" in q and "today" in q and "patient" in q):
        start = datetime.datetime.combine(today, datetime.time.min)
        end = datetime.datetime.combine(today, datetime.time.max)
        apps = session.exec(
            select(Appointment).where(Appointment.appointment_time >= start, Appointment.appointment_time <= end)
        ).all()
        unique_patients = len(set(a.patient_id for a in apps))
        return f"Today you have {unique_patients} unique patients with {len(apps)} appointments."

    if "tomorrow" in q and "schedule" in q:
        tomorrow = today + datetime.timedelta(days=1)
        start = datetime.datetime.combine(tomorrow, datetime.time.min)
        end = datetime.datetime.combine(tomorrow, datetime.time.max)
        apps = session.exec(
            select(Appointment).where(Appointment.appointment_time >= start, Appointment.appointment_time <= end)
        ).all()
        if not apps:
            return "Tomorrow schedule is currently empty."
        apps_sorted = sorted(apps, key=lambda a: a.appointment_time)
        preview = ", ".join(a.appointment_time.strftime("%I:%M %p").lstrip("0") for a in apps_sorted[:4])
        return f"Tomorrow has {len(apps)} appointments. First slots: {preview}."

    if "follow-up" in q or "followup" in q:
        pending = len(
            session.exec(
                select(Reminder).where(Reminder.status == "Pending", Reminder.reminder_type.contains("FOLLOWUP:"))
            ).all()
        )
        return f"You have {pending} pending follow-up reminders."

    if "missed" in q:
        start = datetime.datetime.combine(today, datetime.time.min)
        end = datetime.datetime.combine(today, datetime.time.max)
        apps = session.exec(
            select(Appointment).where(Appointment.appointment_time >= start, Appointment.appointment_time <= end)
        ).all()
        missed = len([a for a in apps if a.appointment_time < now and a.status in {"Scheduled", "Waiting"}])
        return f"{missed} appointments appear missed today."

    return "I can help with: patients today, tomorrow schedule, follow-ups, and missed appointments."


def process_due_reminders(session: Session) -> int:
    settings = get_or_create_automation_settings(session)
    if not settings.reminders_enabled:
        return 0

    now = datetime.datetime.utcnow()
    due = session.exec(select(Reminder).where(Reminder.status == "Pending", Reminder.reminder_date <= now)).all()
    sent_count = 0

    for reminder in due:
        patient = session.get(Patient, reminder.patient_id)
        patient_name = patient.name if patient else "Patient"
        patient_phone = patient.phone if patient else "Unknown"
        channel = settings.reminder_channel

        # Mock WhatsApp/SMS send
        print(f"[MOCK {channel}] to {patient_phone}: {patient_name} - {reminder.reminder_type}")

        reminder.status = "Sent"
        session.add(reminder)
        session.add(
            ActivityLog(
                staff_id=None,
                action="auto_reminder_sent",
                detail=f"{channel} reminder sent to {patient_name}: {reminder.reminder_type}",
            )
        )
        sent_count += 1

    if sent_count > 0:
        session.commit()
    return sent_count

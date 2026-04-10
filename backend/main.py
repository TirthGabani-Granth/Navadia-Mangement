from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
import datetime
import threading

from database.database import create_db_and_tables, get_session, engine
from models.models import Patient, Appointment, TreatmentPlan, Bill, Payment, Reminder, Review, DoctorNote, Staff, Task, ActivityLog, TaskLink, Attendance, LeaveRequest, Notification, VoiceMail
from models.schemas import (
    StaffLoginRequest,
    AttendanceCheckIn,
    AttendanceCheckOut,
    LeaveRequestCreate,
    LeaveStatusUpdate,
    NotificationCreate,
    VoiceMailCreate,
    VoiceMailBroadcast,
    AppointmentCreate,
    PaymentCreate,
    ReviewCreate,
    DoctorNoteCreate,
    StaffCreate,
    StaffUpdate,
    TaskCreate,
    TaskUpdate,
    AutomationSettingsUpdate,
    SlotSuggestionRequest,
    AssistantChatRequest,
)
from services.automation import book_appointment, handle_treatment_completion, TREATMENT_CATALOG, suggest_optimal_slot
from services.smart_assistant import (
    answer_assistant_query,
    enqueue_appointment_reminders,
    enqueue_followup_reminders,
    generate_auto_tasks_for_appointment,
    generate_auto_tasks_for_patient,
    get_or_create_automation_settings,
    get_smart_insights,
    get_tasks_with_ai_priority,
    process_due_reminders,
    update_automation_settings,
)

app = FastAPI(title="Dentist Clinic Automation System")
_automation_worker_stop = threading.Event()
_automation_worker_thread = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    with Session(engine) as session:
        get_or_create_automation_settings(session)
    _start_automation_worker()


@app.on_event("shutdown")
def on_shutdown():
    _automation_worker_stop.set()


def _automation_worker_loop():
    while not _automation_worker_stop.is_set():
        try:
            with Session(engine) as session:
                process_due_reminders(session)
        except Exception as exc:
            print(f"[AUTOMATION_WORKER_ERROR] {exc}")
        _automation_worker_stop.wait(60)


def _start_automation_worker():
    global _automation_worker_thread
    if _automation_worker_thread and _automation_worker_thread.is_alive():
        return
    _automation_worker_thread = threading.Thread(target=_automation_worker_loop, daemon=True)
    _automation_worker_thread.start()

# =========================================================
# PATIENTS
# =========================================================
@app.get("/api/patients", response_model=List[Patient])
def get_patients(session: Session = Depends(get_session)):
    return session.exec(select(Patient)).all()

@app.post("/api/patients", response_model=Patient)
def create_patient(patient: Patient, session: Session = Depends(get_session)):
    session.add(patient)
    session.commit()
    session.refresh(patient)
    generate_auto_tasks_for_patient(session, patient)
    session.add(
        ActivityLog(
            staff_id=None,
            action="auto_tasks_created",
            detail=f"Auto tasks created for new patient {patient.name}",
        )
    )
    session.commit()
    return patient

@app.get("/api/patients/{patient_id}")
def get_patient_detail(patient_id: int, session: Session = Depends(get_session)):
    patient = session.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    appointments = session.exec(
        select(Appointment).where(Appointment.patient_id == patient_id)
    ).all()
    treatments = session.exec(
        select(TreatmentPlan).where(TreatmentPlan.patient_id == patient_id)
    ).all()
    notes = session.exec(
        select(DoctorNote).where(DoctorNote.patient_id == patient_id)
    ).all()
    reviews = session.exec(
        select(Review).where(Review.patient_id == patient_id)
    ).all()
    return {
        "patient": patient,
        "appointments": appointments,
        "treatments": treatments,
        "notes": [{"id": n.id, "note": n.note, "appointment_id": n.appointment_id, "created_at": n.created_at} for n in notes],
        "reviews": reviews
    }

# =========================================================
# APPOINTMENTS
# =========================================================
@app.get("/api/appointments", response_model=List[Appointment])
def get_appointments(session: Session = Depends(get_session)):
    return session.exec(select(Appointment)).all()

@app.post("/api/appointments")
def schedule_appointment(app_req: AppointmentCreate, session: Session = Depends(get_session)):
    patient_was_new = False
    patient = session.exec(select(Patient).where(Patient.name == app_req.patient_name, Patient.phone == app_req.phone)).first()
    if not patient:
        patient = Patient(name=app_req.patient_name, phone=app_req.phone)
        session.add(patient)
        session.commit()
        session.refresh(patient)
        patient_was_new = True
    try:
        new_app = book_appointment(session, patient.id, app_req.treatment_type, app_req.preferred_time)
        enqueue_appointment_reminders(session, new_app)
        if patient_was_new:
            generate_auto_tasks_for_patient(session, patient)
        generate_auto_tasks_for_appointment(session, new_app, patient)
        session.add(
            ActivityLog(
                staff_id=None,
                action="automation_triggered",
                detail=f"Appointment automation run for appointment #{new_app.id}",
            )
        )
        session.commit()
        return new_app
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/appointments/{appointment_id}/complete")
def complete_appointment(appointment_id: int, session: Session = Depends(get_session)):
    try:
        app_obj = handle_treatment_completion(session, appointment_id)
        enqueue_followup_reminders(session, app_obj)
        session.add(
            ActivityLog(
                staff_id=None,
                action="followup_automation",
                detail=f"3-day and 7-day follow-ups queued for appointment #{appointment_id}",
            )
        )
        session.commit()
        return app_obj
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/appointments/{appointment_id}/status")
def update_appointment_status(appointment_id: int, status: dict, session: Session = Depends(get_session)):
    app_obj = session.get(Appointment, appointment_id)
    if not app_obj:
        raise HTTPException(status_code=404, detail="Appointment not found")
    old_status = app_obj.status
    app_obj.status = status.get("status", app_obj.status)
    session.add(app_obj)
    session.commit()
    if old_status != "Completed" and app_obj.status == "Completed":
        enqueue_followup_reminders(session, app_obj)
        session.commit()
    return app_obj


@app.post("/api/appointments/suggest-slot")
def suggest_time_slot(payload: SlotSuggestionRequest, session: Session = Depends(get_session)):
    treatment = TREATMENT_CATALOG.get(payload.treatment_type)
    if not treatment:
        raise HTTPException(status_code=400, detail="Unknown treatment type")
    suggested = suggest_optimal_slot(session, payload.preferred_time, treatment["duration"])
    return {
        "suggested_time": suggested,
        "message": f"Best available slot: {suggested.strftime('%I:%M %p').lstrip('0')}",
    }

# =========================================================
# TREATMENTS
# =========================================================
@app.get("/api/treatments/active", response_model=List[TreatmentPlan])
def get_active_treatments(session: Session = Depends(get_session)):
    return session.exec(select(TreatmentPlan).where(TreatmentPlan.status != "Completed")).all()

@app.get("/api/treatments/catalog")
def get_treatment_catalog():
    return TREATMENT_CATALOG

# =========================================================
# BILLS & PAYMENTS
# =========================================================
@app.get("/api/bills", response_model=List[Bill])
def get_bills(session: Session = Depends(get_session)):
    return session.exec(select(Bill)).all()

@app.post("/api/payments")
def record_payment(payment: PaymentCreate, session: Session = Depends(get_session)):
    bill = session.get(Bill, payment.bill_id)
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    new_payment = Payment(bill_id=bill.id, payment_method=payment.payment_method, paid_amount=payment.paid_amount)
    session.add(new_payment)
    bill.status = "Paid"
    session.add(bill)
    session.commit()
    return new_payment

# =========================================================
# REVIEWS
# =========================================================
@app.get("/api/reviews")
def get_reviews(session: Session = Depends(get_session)):
    reviews = session.exec(select(Review)).all()
    result = []
    for r in reviews:
        patient = session.get(Patient, r.patient_id)
        result.append({
            "id": r.id,
            "patient_id": r.patient_id,
            "patient_name": patient.name if patient else "Unknown",
            "appointment_id": r.appointment_id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at
        })
    return result

@app.post("/api/reviews")
def submit_review(review: ReviewCreate, session: Session = Depends(get_session)):
    new_review = Review(**review.dict())
    session.add(new_review)
    session.commit()
    session.refresh(new_review)
    return new_review

# =========================================================
# DOCTOR NOTES
# =========================================================
@app.post("/api/notes")
def add_doctor_note(note: DoctorNoteCreate, session: Session = Depends(get_session)):
    new_note = DoctorNote(**note.dict())
    session.add(new_note)
    session.commit()
    session.refresh(new_note)
    return new_note

# =========================================================
# REMINDERS
# =========================================================
@app.get("/api/reminders")
def get_reminders(session: Session = Depends(get_session)):
    reminders = session.exec(
        select(Reminder).where(Reminder.status == "Pending").order_by(Reminder.reminder_date)
    ).all()
    result = []
    for r in reminders:
        patient = session.get(Patient, r.patient_id)
        is_overdue = r.reminder_date < datetime.datetime.utcnow()
        result.append({
            "id": r.id,
            "patient_id": r.patient_id,
            "patient_name": patient.name if patient else "Unknown",
            "reminder_date": r.reminder_date,
            "reminder_type": r.reminder_type,
            "status": r.status,
            "overdue": is_overdue
        })
    return result

@app.post("/api/reminders/{reminder_id}/dismiss")
def dismiss_reminder(reminder_id: int, session: Session = Depends(get_session)):
    reminder = session.get(Reminder, reminder_id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    reminder.status = "Sent"
    session.add(reminder)
    session.commit()
    return reminder


@app.get("/api/settings/automation")
def get_automation_settings(session: Session = Depends(get_session)):
    settings = get_or_create_automation_settings(session)
    return {
        "reminders_enabled": settings.reminders_enabled,
        "reminder_channel": settings.reminder_channel,
    }


@app.put("/api/settings/automation")
def put_automation_settings(payload: AutomationSettingsUpdate, session: Session = Depends(get_session)):
    if payload.reminder_channel not in {"WhatsApp", "SMS"}:
        raise HTTPException(status_code=400, detail="reminder_channel must be WhatsApp or SMS")
    settings = update_automation_settings(session, payload.reminders_enabled, payload.reminder_channel)
    return {
        "reminders_enabled": settings.reminders_enabled,
        "reminder_channel": settings.reminder_channel,
    }

# =========================================================
# DASHBOARD
# =========================================================
@app.get("/api/dashboard")
def get_dashboard_data(session: Session = Depends(get_session)):
    today = datetime.date.today()
    start_of_today = datetime.datetime.combine(today, datetime.time.min)
    end_of_today = datetime.datetime.combine(today, datetime.time.max)

    apps_today = session.exec(
        select(Appointment).where(
            Appointment.appointment_time >= start_of_today,
            Appointment.appointment_time <= end_of_today
        )
    ).all()

    revenue_today = sum(p.paid_amount for p in session.exec(
        select(Payment).where(
            Payment.payment_date >= start_of_today,
            Payment.payment_date <= end_of_today
        )
    ).all())

    ongoing_treatments = len(session.exec(
        select(TreatmentPlan).where(TreatmentPlan.status == "In Progress")
    ).all())

    pending_reminders = len(session.exec(
        select(Reminder).where(Reminder.status == "Pending")
    ).all())
    pending_followups = len(session.exec(
        select(Reminder).where(Reminder.status == "Pending", Reminder.reminder_type.contains("FOLLOWUP:"))
    ).all())

    total_reviews = session.exec(select(Review)).all()
    avg_rating = round(sum(r.rating for r in total_reviews) / len(total_reviews), 1) if total_reviews else 0

    todays_appointments_formatted = []
    for a in apps_today:
        patient = session.get(Patient, a.patient_id)
        todays_appointments_formatted.append({
            "id": a.id,
            "patient_id": a.patient_id,
            "patient_name": patient.name if patient else "Unknown",
            "treatment_type": a.treatment_type,
            "appointment_time": a.appointment_time,
            "status": a.status
        })

    return {
        "total_patients_today": len(set(a.patient_id for a in apps_today)),
        "appointments_today": len(apps_today),
        "revenue_today": revenue_today,
        "ongoing_treatments": ongoing_treatments,
        "pending_reminders": pending_reminders,
        "pending_followups": pending_followups,
        "avg_rating": avg_rating,
        "todays_appointments": todays_appointments_formatted,
        "smart_insights": get_smart_insights(session),
    }


# =========================================================
# STAFF / TEAM MANAGEMENT
# =========================================================

def _log_activity(session: Session, staff_id, action: str, detail: str):
    log = ActivityLog(staff_id=staff_id, action=action, detail=detail)
    session.add(log)

@app.get("/api/staff")
def get_all_staff(session: Session = Depends(get_session)):
    staff = session.exec(select(Staff).order_by(Staff.name)).all()
    result = []
    for s in staff:
        active_tasks = len(session.exec(
            select(Task).where(Task.assigned_to == s.id, Task.status != "Done")
        ).all())
        result.append({
            **s.dict(),
            "active_tasks": active_tasks
        })
    return result

@app.post("/api/staff")
def add_staff(staff_data: StaffCreate, session: Session = Depends(get_session)):
    new_staff = Staff(**staff_data.dict())
    session.add(new_staff)
    session.commit()
    session.refresh(new_staff)
    _log_activity(session, new_staff.id, "member_added", f"{new_staff.name} joined as {new_staff.role}")
    session.commit()
    return new_staff

@app.get("/api/staff/{staff_id}")
def get_staff_detail(staff_id: int, session: Session = Depends(get_session)):
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    tasks = session.exec(select(Task).where(Task.assigned_to == staff_id)).all()
    completed = [t for t in tasks if t.status == "Done"]
    pending = [t for t in tasks if t.status != "Done"]
    return {
        "staff": staff,
        "total_tasks": len(tasks),
        "completed_tasks": len(completed),
        "pending_tasks": pending
    }

@app.put("/api/staff/{staff_id}")
def update_staff(staff_id: int, updates: StaffUpdate, session: Session = Depends(get_session)):
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    update_data = updates.dict(exclude_unset=True)
    for key, val in update_data.items():
        if val is not None:
            setattr(staff, key, val)
    session.add(staff)
    _log_activity(session, staff_id, "member_updated", f"{staff.name}'s profile updated")
    session.commit()
    session.refresh(staff)
    return staff

@app.delete("/api/staff/{staff_id}")
def deactivate_staff(staff_id: int, session: Session = Depends(get_session)):
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    staff.status = "Inactive"
    session.add(staff)
    _log_activity(session, staff_id, "member_deactivated", f"{staff.name} was deactivated")
    session.commit()
    return {"message": f"{staff.name} has been deactivated"}


# =========================================================
# TASKS
# =========================================================
@app.get("/api/tasks")
def get_tasks(session: Session = Depends(get_session)):
    return get_tasks_with_ai_priority(session)

@app.post("/api/tasks")
def create_task(task_data: TaskCreate, session: Session = Depends(get_session)):
    payload = task_data.dict()
    patient_id = payload.pop("patient_id", None)
    appointment_id = payload.pop("appointment_id", None)
    new_task = Task(**payload)
    session.add(new_task)
    session.commit()
    session.refresh(new_task)
    if patient_id is not None or appointment_id is not None:
        session.add(TaskLink(task_id=new_task.id, patient_id=patient_id, appointment_id=appointment_id))
        session.commit()
    assignee_name = "Unassigned"
    if new_task.assigned_to:
        assignee = session.get(Staff, new_task.assigned_to)
        assignee_name = assignee.name if assignee else "Unknown"
        # Notify the staff member
        notif = Notification(staff_id=new_task.assigned_to, title="New Task", message=f"You have been assigned a task: {new_task.title}", notification_type="task")
        session.add(notif)
    _log_activity(session, new_task.created_by, "task_created", f"Task '{new_task.title}' created, assigned to {assignee_name}")
    session.commit()
    return new_task

@app.put("/api/tasks/{task_id}")
def update_task(task_id: int, updates: TaskUpdate, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    update_data = updates.dict(exclude_unset=True)
    old_status = task.status
    for key, val in update_data.items():
        if val is not None:
            setattr(task, key, val)
    if task.status == "Done" and old_status != "Done":
        task.completed_at = datetime.datetime.utcnow()
    session.add(task)
    _log_activity(session, task.assigned_to, "task_updated", f"Task '{task.title}' updated to {task.status}")
    session.commit()
    session.refresh(task)
    return task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    title = task.title
    links = session.exec(select(TaskLink).where(TaskLink.task_id == task.id)).all()
    for link in links:
        session.delete(link)
    _log_activity(session, task.assigned_to, "task_deleted", f"Task '{title}' was deleted")
    session.delete(task)
    session.commit()
    return {"message": f"Task '{title}' deleted"}


# =========================================================
# ACTIVITY LOG
# =========================================================
@app.get("/api/activity")
def get_activity_log(session: Session = Depends(get_session)):
    logs = session.exec(select(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(50)).all()
    result = []
    for log in logs:
        staff = session.get(Staff, log.staff_id) if log.staff_id else None
        result.append({
            **log.dict(),
            "staff_name": staff.name if staff else "System",
            "staff_color": staff.avatar_color if staff else "#64748b"
        })
    return result


# =========================================================
# TEAM DASHBOARD STATS
# =========================================================
@app.get("/api/team/stats")
def get_team_stats(session: Session = Depends(get_session)):
    all_staff = session.exec(select(Staff).where(Staff.status == "Active")).all()
    all_tasks = session.exec(select(Task)).all()

    tasks_todo = len([t for t in all_tasks if t.status == "To Do"])
    tasks_in_progress = len([t for t in all_tasks if t.status == "In Progress"])
    tasks_done = len([t for t in all_tasks if t.status == "Done"])

    overdue = 0
    now = datetime.datetime.utcnow()
    for t in all_tasks:
        if t.due_date and t.due_date < now and t.status != "Done":
            overdue += 1

    return {
        "total_members": len(all_staff),
        "total_tasks": len(all_tasks),
        "tasks_todo": tasks_todo,
        "tasks_in_progress": tasks_in_progress,
        "tasks_done": tasks_done,
        "overdue_tasks": overdue
    }


@app.get("/api/insights")
def smart_insights(session: Session = Depends(get_session)):
    return {"items": get_smart_insights(session)}


@app.post("/api/assistant/chat")
def assistant_chat(payload: AssistantChatRequest, session: Session = Depends(get_session)):
    answer = answer_assistant_query(session, payload.message)
    return {"answer": answer}

# =========================================================
# NEW STAFF PORTAL ENDPOINTS
# =========================================================

@app.post("/api/staff/login")
def staff_login(payload: StaffLoginRequest, session: Session = Depends(get_session)):
    query = select(Staff).where(Staff.phone == payload.phone, Staff.status == "Active")
    staff = session.exec(query).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found with this phone number")
    return staff

# ----------------- ATTENDANCE -----------------

@app.post("/api/attendance/checkin")
def check_in(payload: AttendanceCheckIn, session: Session = Depends(get_session)):
    staff = session.get(Staff, payload.staff_id)
    if not staff: raise HTTPException(status_code=404, detail="Staff not found")
    
    today_str = datetime.date.today().isoformat()
    existing = session.exec(select(Attendance).where(Attendance.staff_id == payload.staff_id, Attendance.date == today_str)).first()
    
    if existing:
        return existing
        
    att = Attendance(staff_id=payload.staff_id, date=today_str, check_in=datetime.datetime.utcnow())
    session.add(att)
    session.commit()
    session.refresh(att)
    return att

@app.post("/api/attendance/checkout")
def check_out(payload: AttendanceCheckOut, session: Session = Depends(get_session)):
    today_str = datetime.date.today().isoformat()
    att = session.exec(select(Attendance).where(Attendance.staff_id == payload.staff_id, Attendance.date == today_str)).first()
    if not att: raise HTTPException(status_code=404, detail="No check-in found for today")
    if att.check_out: return att

    att.check_out = datetime.datetime.utcnow()
    diff = att.check_out - att.check_in
    att.hours_worked = round(diff.total_seconds() / 3600.0, 2)
    session.add(att)
    session.commit()
    session.refresh(att)
    return att

@app.get("/api/attendance/today")
def get_attendance_today(session: Session = Depends(get_session)):
    today_str = datetime.date.today().isoformat()
    atts = session.exec(select(Attendance).where(Attendance.date == today_str)).all()
    result = []
    for a in atts:
        staff = session.get(Staff, a.staff_id)
        result.append({"attendance": a, "staff": staff})
    return result

@app.get("/api/attendance/{staff_id}")
def get_staff_attendance(staff_id: int, session: Session = Depends(get_session)):
    atts = session.exec(select(Attendance).where(Attendance.staff_id == staff_id).order_by(Attendance.date.desc())).all()
    return atts

# ----------------- LEAVE REQUESTS -----------------

@app.post("/api/leave")
def request_leave(payload: LeaveRequestCreate, session: Session = Depends(get_session)):
    req = LeaveRequest(**payload.dict())
    session.add(req)
    session.commit()
    session.refresh(req)
    # Notify Admin
    notif = Notification(staff_id=1, title="New Leave Request", message=f"A new leave request was submitted.", notification_type="leave")
    session.add(notif)
    session.commit()
    return req

@app.get("/api/leave/all")
def get_all_leave(session: Session = Depends(get_session)):
    leaves = session.exec(select(LeaveRequest).order_by(LeaveRequest.created_at.desc())).all()
    res = []
    for l in leaves:
        staff = session.get(Staff, l.staff_id)
        res.append({"leave": l, "staff": staff})
    return res

@app.get("/api/leave/{staff_id}")
def get_staff_leave(staff_id: int, session: Session = Depends(get_session)):
    leaves = session.exec(select(LeaveRequest).where(LeaveRequest.staff_id == staff_id).order_by(LeaveRequest.created_at.desc())).all()
    return leaves

@app.put("/api/leave/{leave_id}")
def update_leave_status(leave_id: int, payload: LeaveStatusUpdate, session: Session = Depends(get_session)):
    req = session.get(LeaveRequest, leave_id)
    if not req: raise HTTPException(status_code=404, detail="Leave request not found")
    req.status = payload.status
    if payload.admin_note: req.admin_note = payload.admin_note
    session.add(req)
    
    # Send notification to staff
    notif = Notification(staff_id=req.staff_id, title=f"Leave {req.status}", message=f"Your leave from {req.start_date} to {req.end_date} has been {req.status}.", notification_type="leave")
    session.add(notif)
    session.commit()
    return req

# ----------------- NOTIFICATIONS -----------------

@app.get("/api/notifications/{staff_id}")
def get_notifications(staff_id: int, session: Session = Depends(get_session)):
    notifs = session.exec(select(Notification).where(Notification.staff_id == staff_id).order_by(Notification.created_at.desc())).all()
    return notifs

@app.put("/api/notifications/{notification_id}/read")
def read_notification(notification_id: int, session: Session = Depends(get_session)):
    n = session.get(Notification, notification_id)
    if n:
        n.is_read = True
        session.add(n)
        session.commit()
    return n

# ----------------- VOICEMAIL -----------------

@app.post("/api/voicemail")
def send_voicemail(payload: VoiceMailCreate, session: Session = Depends(get_session)):
    vm = VoiceMail(**payload.dict())
    session.add(vm)
    
    sender_name = "Admin"
    if vm.from_staff_id:
        s = session.get(Staff, vm.from_staff_id)
        if s: sender_name = s.name
        
    msg = f"New{' emergency' if vm.is_emergency else ''} voicemail from {sender_name}."
    notif = Notification(staff_id=vm.to_staff_id, title="New Voicemail", message=msg, notification_type="voicemail")
    session.add(notif)
    session.commit()
    session.refresh(vm)
    return vm

@app.post("/api/voicemail/broadcast")
def broadcast_voicemail(payload: VoiceMailBroadcast, session: Session = Depends(get_session)):
    targets = []
    if payload.to_all:
        staffs = session.exec(select(Staff).where(Staff.status == "Active")).all()
        targets = [s.id for s in staffs if s.id != payload.from_staff_id]
    elif payload.to_staff_ids:
        targets = payload.to_staff_ids
        
    vms = []
    for tid in targets:
        vm = VoiceMail(from_staff_id=payload.from_staff_id, to_staff_id=tid, audio_data=payload.audio_data, message=payload.message, is_emergency=payload.is_emergency)
        session.add(vm)
        vms.append(vm)
        
        sender_name = "Admin"
        if vm.from_staff_id:
            s = session.get(Staff, vm.from_staff_id)
            if s: sender_name = s.name
        notif = Notification(staff_id=tid, title="New Voicemail", message=f"Broadcast from {sender_name}.", notification_type="voicemail")
        session.add(notif)
        
    session.commit()
    return {"message": f"Sent to {len(targets)} staff members"}

@app.get("/api/voicemail/{staff_id}")
def get_staff_voicemail(staff_id: int, session: Session = Depends(get_session)):
    vms = session.exec(select(VoiceMail).where(VoiceMail.to_staff_id == staff_id).order_by(VoiceMail.created_at.desc())).all()
    res = []
    for v in vms:
        sender = session.get(Staff, v.from_staff_id) if v.from_staff_id else None
        res.append({"voicemail": v, "sender": sender})
    return res

@app.put("/api/voicemail/{vm_id}/listened")
def read_voicemail(vm_id: int, session: Session = Depends(get_session)):
    vm = session.get(VoiceMail, vm_id)
    if vm:
        vm.is_listened = True
        session.add(vm)
        session.commit()
    return vm

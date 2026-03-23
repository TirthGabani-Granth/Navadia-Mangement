from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List
import datetime

from database.database import create_db_and_tables, get_session
from models.models import Patient, Appointment, TreatmentPlan, Bill, Payment, Reminder, Review, DoctorNote, Staff, Task, ActivityLog
from models.schemas import AppointmentCreate, PaymentCreate, ReviewCreate, DoctorNoteCreate, StaffCreate, StaffUpdate, TaskCreate, TaskUpdate
from services.automation import book_appointment, handle_treatment_completion, TREATMENT_CATALOG

app = FastAPI(title="Dentist Clinic Automation System")

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
    patient = session.exec(select(Patient).where(Patient.name == app_req.patient_name, Patient.phone == app_req.phone)).first()
    if not patient:
        patient = Patient(name=app_req.patient_name, phone=app_req.phone)
        session.add(patient)
        session.commit()
        session.refresh(patient)
    try:
        new_app = book_appointment(session, patient.id, app_req.treatment_type, app_req.preferred_time)
        return new_app
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/appointments/{appointment_id}/complete")
def complete_appointment(appointment_id: int, session: Session = Depends(get_session)):
    try:
        app_obj = handle_treatment_completion(session, appointment_id)
        return app_obj
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/appointments/{appointment_id}/status")
def update_appointment_status(appointment_id: int, status: dict, session: Session = Depends(get_session)):
    app_obj = session.get(Appointment, appointment_id)
    if not app_obj:
        raise HTTPException(status_code=404, detail="Appointment not found")
    app_obj.status = status.get("status", app_obj.status)
    session.add(app_obj)
    session.commit()
    return app_obj

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
        "avg_rating": avg_rating,
        "todays_appointments": todays_appointments_formatted
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
    tasks = session.exec(select(Task).order_by(Task.created_at.desc())).all()
    result = []
    for t in tasks:
        assignee = session.get(Staff, t.assigned_to) if t.assigned_to else None
        creator = session.get(Staff, t.created_by) if t.created_by else None
        result.append({
            **t.dict(),
            "assigned_to_name": assignee.name if assignee else None,
            "assigned_to_color": assignee.avatar_color if assignee else None,
            "created_by_name": creator.name if creator else None
        })
    return result

@app.post("/api/tasks")
def create_task(task_data: TaskCreate, session: Session = Depends(get_session)):
    new_task = Task(**task_data.dict())
    session.add(new_task)
    session.commit()
    session.refresh(new_task)
    assignee_name = "Unassigned"
    if new_task.assigned_to:
        assignee = session.get(Staff, new_task.assigned_to)
        assignee_name = assignee.name if assignee else "Unknown"
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

from datetime import datetime, timedelta
from sqlmodel import Session, select
from models.models import Patient, Appointment, TreatmentPlan, Bill, Reminder

TREATMENT_CATALOG = {
    "Dental Checkup": {"duration": 15, "price": 300},
    "Tooth Cleaning": {"duration": 30, "price": 1500},
    "Cavity Filling": {"duration": 40, "price": 2000},
    "Root Canal": {"duration": 60, "price": 4000, "sessions": 3},
    "Extraction": {"duration": 30, "price": 2500},
    "Teeth Whitening": {"duration": 45, "price": 3500}
}

def calculate_next_available_slot(session: Session, target_time: datetime, duration: int) -> datetime:
    """Finds the next available non-overlapping time slot for a given duration starting at target_time."""
    start_of_day = target_time.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = target_time.replace(hour=23, minute=59, second=59, microsecond=0)
    
    apps = session.exec(
        select(Appointment)
        .where(Appointment.appointment_time >= start_of_day)
        .where(Appointment.appointment_time <= end_of_day)
        .where(Appointment.status != "Completed")
        .order_by(Appointment.appointment_time)
    ).all()
    
    proposed_time = target_time
    for app in apps:
        app_end = app.appointment_time + timedelta(minutes=app.duration_minutes)
        proposed_end = proposed_time + timedelta(minutes=duration)
        
        # If proposed time overlaps with existing app
        if proposed_time < app_end and proposed_end > app.appointment_time:
            proposed_time = app_end # push to the end of the existing appointment
            
    return proposed_time

def book_appointment(session: Session, patient_id: int, treatment_type: str, preferred_time: datetime) -> Appointment:
    catalog_info = TREATMENT_CATALOG.get(treatment_type)
    if not catalog_info:
        raise ValueError(f"Unknown treatment type: {treatment_type}")
        
    duration = catalog_info["duration"]
    actual_time = calculate_next_available_slot(session, preferred_time, duration)
    
    new_app = Appointment(
        patient_id=patient_id,
        treatment_type=treatment_type,
        appointment_time=actual_time,
        duration_minutes=duration,
        status="Scheduled"
    )
    session.add(new_app)
    
    # Check if a reminder should be created
    if treatment_type == "Dental Checkup":
        # Follow-up reminder 6 months later
        follow_up_date = actual_time + timedelta(days=180)
        reminder = Reminder(
            patient_id=patient_id,
            reminder_date=follow_up_date,
            reminder_type="6-month Routine Checkup"
        )
        session.add(reminder)
        
    session.commit()
    session.refresh(new_app)
    return new_app

def handle_treatment_completion(session: Session, appointment_id: int, notes: str = ""):
    app = session.get(Appointment, appointment_id)
    if not app:
        raise ValueError("Appointment not found")
        
    app.status = "Completed"
    session.add(app)
    
    catalog_info = TREATMENT_CATALOG.get(app.treatment_type)
    price = catalog_info["price"] if catalog_info else 0
    sessions_needed = catalog_info.get("sessions", 1) if catalog_info else 1
    
    is_treatment_finished = True
    
    # Handle multi-session (e.g., Root Canal)
    if sessions_needed > 1:
        # Check for existing treatment plan
        plan = session.exec(
            select(TreatmentPlan)
            .where(TreatmentPlan.patient_id == app.patient_id)
            .where(TreatmentPlan.treatment_name == app.treatment_type)
            .where(TreatmentPlan.status != "Completed")
        ).first()
        
        if not plan:
            plan = TreatmentPlan(
                patient_id=app.patient_id,
                treatment_name=app.treatment_type,
                total_sessions=sessions_needed,
                completed_sessions=0,
                status="In Progress"
            )
            session.add(plan)
            session.commit()
            session.refresh(plan)
            
        plan.completed_sessions += 1
        
        if plan.completed_sessions >= plan.total_sessions:
            plan.status = "Completed"
        else:
            plan.status = "In Progress"
            is_treatment_finished = False
            # Create a reminder for next session (e.g. 7 days from now)
            next_date = app.appointment_time + timedelta(days=7)
            reminder = Reminder(
                patient_id=app.patient_id,
                reminder_date=next_date,
                reminder_type=f"Next Session: {app.treatment_type} (Session {plan.completed_sessions + 1})"
            )
            session.add(reminder)
            plan.next_appointment = next_date
        
        session.add(plan)

    # Billing - Generate bill only if treatment is fully finished
    if is_treatment_finished and price > 0:
        bill = Bill(
            patient_id=app.patient_id,
            treatment_name=app.treatment_type,
            amount=price
        )
        session.add(bill)

    session.commit()
    return app

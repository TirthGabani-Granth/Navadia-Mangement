from sqlmodel import Field, SQLModel, Relationship
from typing import List, Optional
from datetime import datetime

class Patient(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    phone: str = Field(index=True)
    
    appointments: List["Appointment"] = Relationship(back_populates="patient")
    treatments: List["TreatmentPlan"] = Relationship(back_populates="patient")

class Appointment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    treatment_type: str
    appointment_time: datetime
    duration_minutes: int
    status: str = Field(default="Scheduled") # Scheduled, Waiting, In Treatment, Completed
    
    patient: "Patient" = Relationship(back_populates="appointments")

class TreatmentPlan(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    treatment_name: str
    total_sessions: int
    completed_sessions: int = Field(default=0)
    next_appointment: Optional[datetime] = None
    status: str = Field(default="Pending") # Pending, In Progress, Completed
    
    patient: "Patient" = Relationship(back_populates="treatments")

class Bill(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    treatment_name: str
    amount: float
    status: str = Field(default="Unpaid") # Unpaid, Paid
    
class Payment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    bill_id: int = Field(foreign_key="bill.id")
    payment_method: str # UPI, Card, Cash
    paid_amount: float
    payment_date: datetime = Field(default_factory=datetime.utcnow)

class Reminder(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    reminder_date: datetime
    reminder_type: str
    status: str = Field(default="Pending") # Pending, Sent

class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    appointment_id: int = Field(foreign_key="appointment.id")
    rating: int  # 1-5
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DoctorNote(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    appointment_id: int = Field(foreign_key="appointment.id")
    note: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Staff(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    role: str  # Dentist, Hygienist, Receptionist, Assistant
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    status: str = Field(default="Active")  # Active, On Leave, Inactive
    joined_date: datetime = Field(default_factory=datetime.utcnow)
    avatar_color: str = Field(default="#0d9488")


class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = Field(default=None, foreign_key="staff.id")
    created_by: Optional[int] = Field(default=None, foreign_key="staff.id")
    priority: str = Field(default="Medium")  # Low, Medium, High, Urgent
    status: str = Field(default="To Do")  # To Do, In Progress, Done
    due_date: Optional[datetime] = None
    category: str = Field(default="General")  # General, Patient Care, Equipment, Admin, Cleaning
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


class ActivityLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    staff_id: Optional[int] = Field(default=None, foreign_key="staff.id")
    action: str  # e.g. "completed task", "added member", "updated status"
    detail: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

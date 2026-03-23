from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AppointmentCreate(BaseModel):
    patient_name: str
    phone: str
    treatment_type: str
    preferred_time: datetime

class PaymentCreate(BaseModel):
    bill_id: int
    payment_method: str
    paid_amount: float
    
class NextSessionCreate(BaseModel):
    treatment_plan_id: int
    next_appointment_time: datetime

class ReviewCreate(BaseModel):
    patient_id: int
    appointment_id: int
    rating: int
    comment: Optional[str] = None

class DoctorNoteCreate(BaseModel):
    patient_id: int
    appointment_id: int
    note: str


class StaffCreate(BaseModel):
    name: str
    role: str
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    avatar_color: Optional[str] = "#0d9488"


class StaffUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    status: Optional[str] = None
    avatar_color: Optional[str] = None


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    priority: str = "Medium"
    category: str = "General"
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = None

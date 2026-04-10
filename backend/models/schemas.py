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
    patient_id: Optional[int] = None
    appointment_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[int] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    due_date: Optional[datetime] = None


class AutomationSettingsUpdate(BaseModel):
    reminders_enabled: bool
    reminder_channel: str


class SlotSuggestionRequest(BaseModel):
    treatment_type: str
    preferred_time: datetime


class AssistantChatRequest(BaseModel):
    message: str


# =========================================================
# NEW SCHEMAS — Staff Management Features
# =========================================================

class StaffLoginRequest(BaseModel):
    phone: str
    name: Optional[str] = None  # optional for disambiguation


class AttendanceCheckIn(BaseModel):
    staff_id: int


class AttendanceCheckOut(BaseModel):
    staff_id: int


class LeaveRequestCreate(BaseModel):
    staff_id: int
    start_date: str   # YYYY-MM-DD
    end_date: str     # YYYY-MM-DD
    reason: str
    leave_type: str = "Casual"


class LeaveStatusUpdate(BaseModel):
    status: str       # Approved or Rejected
    admin_note: Optional[str] = None


class NotificationCreate(BaseModel):
    staff_id: int
    title: str
    message: str
    notification_type: str = "general"


class VoiceMailCreate(BaseModel):
    from_staff_id: Optional[int] = None
    to_staff_id: int
    audio_data: Optional[str] = None    # base64
    message: Optional[str] = None
    is_emergency: bool = False


class VoiceMailBroadcast(BaseModel):
    from_staff_id: Optional[int] = None
    to_all: bool = False
    to_staff_ids: Optional[List[int]] = None
    audio_data: Optional[str] = None
    message: Optional[str] = None
    is_emergency: bool = False

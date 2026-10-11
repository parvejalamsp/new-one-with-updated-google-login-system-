from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

InvoiceStatus = Literal["draft", "pending", "due_soon", "overdue", "paid"]
FollowUpStatus = Literal["planned", "completed"]


class ClientInput(BaseModel):
    business_name: str = Field(min_length=1, max_length=160)
    gstin: str = Field(default="", max_length=15)
    contact_name: str = Field(default="", max_length=120)
    email: EmailStr | None = None
    phone: str = Field(default="", max_length=30)
    address: str = Field(default="", max_length=500)
    state: str = Field(default="", max_length=80)

    @field_validator("business_name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Business name is required")
        return value

    @field_validator("gstin")
    @classmethod
    def validate_gstin(cls, value: str) -> str:
        value = value.strip().upper()
        if value and (len(value) != 15 or not value.isalnum()):
            raise ValueError("GSTIN must be 15 letters and numbers")
        return value


class ClientUpdate(ClientInput):
    archived: bool = False


class Client(ClientUpdate):
    id: str
    balance: float = 0
    invoice_count: int = 0
    created_at: datetime
    updated_at: datetime


class InvoiceInput(BaseModel):
    client_id: str
    description: str = Field(min_length=1, max_length=500)
    invoice_date: str
    due_date: str
    subtotal: float = Field(gt=0)
    gst_rate: float = Field(default=0, ge=0, le=28)
    hsn_sac: str = Field(default="", max_length=20)
    notes: str = Field(default="", max_length=1000)
    status: Literal["draft", "pending"] = "draft"

    @field_validator("description", "client_id")
    @classmethod
    def clean_required(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Required field cannot be empty")
        return value

    @model_validator(mode="after")
    def validate_dates(self):
        try:
            invoice_date = datetime.strptime(self.invoice_date, "%Y-%m-%d").date()
            due_date = datetime.strptime(self.due_date, "%Y-%m-%d").date()
        except ValueError as exc:
            raise ValueError("Dates must use YYYY-MM-DD") from exc
        if due_date < invoice_date:
            raise ValueError("Due date must be on or after invoice date")
        return self


class Invoice(InvoiceInput):
    id: str
    invoice_number: str
    client_name: str
    tax: float
    total: float
    amount_paid: float
    balance: float
    status: InvoiceStatus
    created_at: datetime
    updated_at: datetime


class PaymentInput(BaseModel):
    amount: float = Field(gt=0)
    paid_on: str
    method: Literal["bank_transfer", "upi", "cash", "cheque", "other"] = "bank_transfer"
    reference: str = Field(default="", max_length=120)
    notes: str = Field(default="", max_length=500)

    @field_validator("paid_on")
    @classmethod
    def validate_paid_on(cls, value: str) -> str:
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError as exc:
            raise ValueError("Payment date must use YYYY-MM-DD") from exc
        return value


class Payment(PaymentInput):
    id: str
    invoice_id: str
    invoice_number: str
    created_at: datetime


class FollowUpInput(BaseModel):
    invoice_id: str
    note: str = Field(min_length=1, max_length=1000)
    due_date: str
    status: FollowUpStatus = "planned"

    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, value: str) -> str:
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError as exc:
            raise ValueError("Follow-up date must use YYYY-MM-DD") from exc
        return value


class FollowUp(FollowUpInput):
    id: str
    client_id: str
    created_at: datetime
    updated_at: datetime


class FollowUpUpdate(BaseModel):
    note: str = Field(min_length=1, max_length=1000)
    due_date: str
    status: FollowUpStatus

    @field_validator("due_date")
    @classmethod
    def validate_due_date(cls, value: str) -> str:
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError as exc:
            raise ValueError("Follow-up date must use YYYY-MM-DD") from exc
        return value


class WorkspaceSummary(BaseModel):
    client_count: int
    invoice_count: int
    total_invoiced: float
    total_outstanding: float
    total_overdue: float
    total_paid: float


class Workspace(BaseModel):
    today: str
    clients: list[Client]
    invoices: list[Invoice]
    payments: list[Payment]
    follow_ups: list[FollowUp]
    summary: WorkspaceSummary
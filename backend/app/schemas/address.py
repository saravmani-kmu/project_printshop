from pydantic import BaseModel, field_validator
import re


class AddressBase(BaseModel):
    full_name: str
    mobile: str
    line1: str
    line2: str | None = None
    city: str
    district: str
    state: str = "Tamil Nadu"
    pincode: str

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if len(digits) != 10:
            raise ValueError("Mobile number must be 10 digits")
        return digits

    @field_validator("pincode")
    @classmethod
    def validate_pincode(cls, v: str) -> str:
        if not re.match(r"^\d{6}$", v):
            raise ValueError("Pincode must be 6 digits")
        return v


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    full_name: str | None = None
    mobile: str | None = None
    line1: str | None = None
    line2: str | None = None
    city: str | None = None
    district: str | None = None
    state: str | None = None
    pincode: str | None = None


class AddressOut(AddressBase):
    id: str
    is_default: bool

    model_config = {"from_attributes": True}

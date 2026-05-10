from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.address import Address
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.address import AddressCreate, AddressUpdate, AddressOut

router = APIRouter(prefix="/addresses", tags=["addresses"])


@router.get("", response_model=list[AddressOut])
def list_addresses(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Address).filter(Address.user_id == user.id).order_by(Address.is_default.desc()).all()


@router.post("", response_model=AddressOut)
def create_address(body: AddressCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Address).filter(Address.user_id == user.id).count()
    addr = Address(**body.model_dump(), user_id=user.id, is_default=(existing == 0))
    db.add(addr)
    db.commit()
    db.refresh(addr)
    return addr


@router.put("/{address_id}", response_model=AddressOut)
def update_address(address_id: str, body: AddressUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(addr, k, v)
    db.commit()
    db.refresh(addr)
    return addr


@router.delete("/{address_id}")
def delete_address(address_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    db.delete(addr)
    db.commit()
    return {"ok": True}


@router.patch("/{address_id}/default")
def set_default_address(address_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    addr = db.query(Address).filter(Address.id == address_id, Address.user_id == user.id).first()
    if not addr:
        raise HTTPException(status_code=404, detail="Address not found")
    db.query(Address).filter(Address.user_id == user.id).update({"is_default": False})
    addr.is_default = True
    db.commit()
    return {"ok": True}

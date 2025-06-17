from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.Group)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    # Verify all users exist
    users = db.query(models.User).filter(models.User.id.in_(group.user_ids)).all()
    if len(users) != len(group.user_ids):
        raise HTTPException(status_code=404, detail="One or more users not found")

    # Create group
    db_group = models.Group(name=group.name)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)

    # Add users to group
    for user in users:
        db_group.members.append(user)
    db.commit()
    db.refresh(db_group)

    return db_group

@router.get("/{group_id}", response_model=schemas.Group)
def get_group(group_id: int, db: Session = Depends(get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")

    total_expenses_amount = db.query(func.sum(models.Expense.amount)).filter(models.Expense.group_id == group_id).scalar() or 0.0
    group.total_expenses = total_expenses_amount

    return group

@router.get("/", response_model=List[schemas.Group])
def get_groups(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    groups = db.query(models.Group).offset(skip).limit(limit).all()
    return groups 
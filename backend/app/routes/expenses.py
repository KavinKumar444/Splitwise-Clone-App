from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.post("/groups/{group_id}/expenses", response_model=schemas.Expense)
def create_expense(
    group_id: int,
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db)
):
    # Verify group exists
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Verify paid_by user is in the group
    if not any(member.id == expense.paid_by for member in group.members):
        raise HTTPException(status_code=400, detail="Payer is not a member of the group")

    # Create expense
    db_expense = models.Expense(
        description=expense.description,
        amount=expense.amount,
        split_type=expense.split_type,
        group_id=group_id,
        paid_by=expense.paid_by
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    # Create expense splits
    for split in expense.splits:
        # Verify user is in the group
        if not any(member.id == split.user_id for member in group.members):
            raise HTTPException(status_code=400, detail=f"User {split.user_id} is not a member of the group")

        db_split = models.ExpenseSplit(
            expense_id=db_expense.id,
            user_id=split.user_id,
            amount=split.amount,
            percentage=split.percentage
        )
        db.add(db_split)

    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.get("/groups/{group_id}/expenses", response_model=List[schemas.Expense])
def get_group_expenses(group_id: int, db: Session = Depends(get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    expenses = db.query(models.Expense).filter(models.Expense.group_id == group_id).all()
    return expenses 
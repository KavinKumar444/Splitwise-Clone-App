from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from app.database import get_db
from app.models import models
from app.schemas import schemas

router = APIRouter()

@router.get("/groups/{group_id}", response_model=schemas.GroupBalance)
def get_group_balances(group_id: int, db: Session = Depends(get_db)):
    # Verify group exists
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Calculate balances for each user
    balances = []
    for member in group.members:
        # Calculate total paid
        total_paid = db.query(func.sum(models.Expense.amount))\
            .filter(models.Expense.group_id == group_id)\
            .filter(models.Expense.paid_by == member.id)\
            .scalar() or 0

        # Calculate total owed
        total_owed = db.query(func.sum(models.ExpenseSplit.amount))\
            .join(models.Expense)\
            .filter(models.Expense.group_id == group_id)\
            .filter(models.ExpenseSplit.user_id == member.id)\
            .scalar() or 0

        # Calculate net balance
        net_balance = total_paid - total_owed

        balances.append(schemas.Balance(
            user_id=member.id,
            amount=net_balance,
            user_name=member.name
        ))

    return schemas.GroupBalance(
        group_id=group.id,
        group_name=group.name,
        balances=balances
    )

@router.get("/users/{user_id}", response_model=schemas.UserBalance)
def get_user_balances(user_id: int, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get all groups the user is part of
    groups = db.query(models.Group)\
        .join(models.Group.members)\
        .filter(models.User.id == user_id)\
        .all()

    # Calculate balances for each group
    group_balances = []
    for group in groups:
        # Calculate total paid
        total_paid = db.query(func.sum(models.Expense.amount))\
            .filter(models.Expense.group_id == group.id)\
            .filter(models.Expense.paid_by == user_id)\
            .scalar() or 0

        # Calculate total owed
        total_owed = db.query(func.sum(models.ExpenseSplit.amount))\
            .join(models.Expense)\
            .filter(models.Expense.group_id == group.id)\
            .filter(models.ExpenseSplit.user_id == user_id)\
            .scalar() or 0

        # Calculate net balance
        net_balance = total_paid - total_owed

        group_balances.append(schemas.GroupBalance(
            group_id=group.id,
            group_name=group.name,
            balances=[schemas.Balance(
                user_id=user_id,
                amount=net_balance,
                user_name=user.name
            )]
        ))

    return schemas.UserBalance(
        user_id=user.id,
        user_name=user.name,
        group_balances=group_balances
    ) 
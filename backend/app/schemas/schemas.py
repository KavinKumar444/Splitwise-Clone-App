from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.models import SplitType

class UserBase(BaseModel):
    name: str
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class GroupBase(BaseModel):
    name: str

class GroupCreate(GroupBase):
    user_ids: List[int]

class Group(GroupBase):
    id: int
    members: List[User]
    total_expenses: float = 0.0

    class Config:
        from_attributes = True

class ExpenseSplitBase(BaseModel):
    user_id: int
    amount: float
    percentage: Optional[float] = None

class ExpenseSplitCreate(ExpenseSplitBase):
    pass

class ExpenseSplit(ExpenseSplitBase):
    id: int
    expense_id: int

    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    description: str
    amount: float
    split_type: SplitType
    paid_by: int

class ExpenseCreate(ExpenseBase):
    splits: List[ExpenseSplitCreate]

class Expense(ExpenseBase):
    id: int
    group_id: int
    splits: List[ExpenseSplit]

    class Config:
        from_attributes = True

class Balance(BaseModel):
    user_id: int
    amount: float
    user_name: str

class GroupBalance(BaseModel):
    group_id: int
    group_name: str
    balances: List[Balance]

class UserBalance(BaseModel):
    user_id: int
    user_name: str
    group_balances: List[GroupBalance] 
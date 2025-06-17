from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class SplitType(str, enum.Enum):
    EQUAL = "equal"
    PERCENTAGE = "percentage"

# Association table for group members
group_members = Table(
    'group_members',
    Base.metadata,
    Column('group_id', Integer, ForeignKey('groups.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)

    # Relationships
    groups = relationship("Group", secondary=group_members, back_populates="members")
    expenses_paid = relationship("Expense", back_populates="paid_by_user")
    expense_splits = relationship("ExpenseSplit", back_populates="user")

class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)

    # Relationships
    members = relationship("User", secondary=group_members, back_populates="groups")
    expenses = relationship("Expense", back_populates="group")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    amount = Column(Float)
    split_type = Column(Enum(SplitType))
    group_id = Column(Integer, ForeignKey("groups.id"))
    paid_by = Column(Integer, ForeignKey("users.id"))

    # Relationships
    group = relationship("Group", back_populates="expenses")
    paid_by_user = relationship("User", back_populates="expenses_paid")
    splits = relationship("ExpenseSplit", back_populates="expense")

class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    percentage = Column(Float, nullable=True)

    # Relationships
    expense = relationship("Expense", back_populates="splits")
    user = relationship("User", back_populates="expense_splits") 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import groups, expenses, users, balances
from app.database import engine
from app.models import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Splitwise Clone API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(groups.router, prefix="/groups", tags=["groups"])
app.include_router(expenses.router, prefix="/expenses", tags=["expenses"])
app.include_router(balances.router, prefix="/balances", tags=["balances"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Splitwise Clone API"} 
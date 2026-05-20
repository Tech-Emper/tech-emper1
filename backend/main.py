# FORCE UNBUFFERED PRINT FOR RAILWAY LOGS
import sys
import os
import logging
import traceback

# Load environment variables early
from dotenv import load_dotenv
load_dotenv()

from datetime import datetime

def log_now(msg):
    print(f"--- [STARTUP LOG] {msg}", file=sys.stdout, flush=True)

log_now("--- BACKEND MODULE LOADING ---")

# Diagnostic for Railway import issues
try:
    import google
    log_now(f"Google package found at: {getattr(google, '__path__', 'Unknown')}")
    from google.genai import Client
    log_now("Google GenAI Client imported successfully.")
except Exception as diag_e:
    log_now(f"DIAGNOSTIC: GenAI import failed early: {diag_e}")
    try:
        import pkgutil
        log_now(f"Google submodules: {[m.name for m in pkgutil.iter_modules(google.__path__)]}")
    except:
        pass

try:
    from fastapi import FastAPI, HTTPException, Request
    from fastapi.exceptions import RequestValidationError
    from fastapi.responses import JSONResponse
    from fastapi.middleware.cors import CORSMiddleware
    
    from database import init_db
    
    # Import Routers
    from policy_service.router import router as policy_router
    from routers.auth import router as auth_router
    from routers.users import router as users_router
    from routers.recommendations import router as recommendations_router
    from routers.superadmin import router as superadmin_router
    from routers.portability import router as portability_router
    
    log_now("Modules imported successfully.")
except Exception as e:
    log_now(f"FATAL: Module import failed: {str(e)}")
    traceback.print_exc()
    sys.exit(1)

from contextlib import asynccontextmanager

# Initialize Database on Startup using modern lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    log_now("Starting startup lifespan sequence...")
    try:
        log_now("Initializing database...")
        init_db()
        log_now("Database initialized successfully.")
        
        try:
            from scheduler import start_scheduler
            start_scheduler()
            log_now("Scheduler started successfully.")
        except Exception as e:
            log_now(f"WARNING: Scheduler failed to start: {str(e)}")
    except Exception as e:
        log_now(f"FATAL: Database initialization failed: {str(e)}")
        traceback.print_exc()
        sys.exit(1)
    
    yield # Application runs here
    
    log_now("--- BACKEND SHUTTING DOWN ---")

app = FastAPI(lifespan=lifespan)

log_now("Configuring CORS...")
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]
raw_frontend_url = os.getenv("FRONTEND_URL", "").strip()
if raw_frontend_url:
    # AUTOMATICALLY FIX MISSING PROTOCOL
    if not raw_frontend_url.startswith('http'):
        frontend_url = f"https://{raw_frontend_url}"
    else:
        frontend_url = raw_frontend_url
    
    # Remove trailing slash for Starlette compatibility
    frontend_url = frontend_url.rstrip('/')
    
    origins.append(frontend_url)
    log_now(f"Added CORS origin: {frontend_url}")
else:
    log_now("No FRONTEND_URL found, using defaults.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(policy_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(recommendations_router)
app.include_router(superadmin_router)
app.include_router(portability_router)

log_now(f"CORS configured with origins: {origins}")
log_now("CORS configuration complete.")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    log_now(f"VALIDATION ERROR: {exc.errors()}")
    log_now(f"BODY: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(await request.body())},
    )

@app.get("/")
def read_root():
    return {"message": "Insurance Wizard Backend is Running!"}

if __name__ == "__main__":
    import uvicorn
    # Use the port assigned by Railway or default to 8000
    port = int(os.getenv("PORT", 8000))
    log_now(f"Starting Uvicorn manual runner on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)

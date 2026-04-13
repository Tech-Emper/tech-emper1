import io
import csv
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db, Organization, User
from auth import get_current_user, send_welcome_email
from schemas import OrganizationResponse, OrganizationCreate

router = APIRouter(prefix="/api/superadmin", tags=["superadmin"])

def verify_superadmin(user_payload=Depends(get_current_user), db: Session=Depends(get_db)):
    email = user_payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Forbidden. Superadmin access required.")
    return user

@router.get("/organizations", response_model=List[OrganizationResponse])
def get_organizations(db: Session = Depends(get_db), admin: User = Depends(verify_superadmin)):
    # Count employees per organization
    orgs = db.query(Organization).all()
    
    response = []
    for org in orgs:
        # Count users belonging to this org
        employee_count = db.query(User).filter(User.organization_id == org.id).count()
        response.append(OrganizationResponse(
            id=org.id,
            name=org.name,
            employees=employee_count
        ))
    
    return response

@router.post("/organizations", response_model=OrganizationResponse)
def create_organization(org_in: OrganizationCreate, db: Session = Depends(get_db), admin: User = Depends(verify_superadmin)):
    existing = db.query(Organization).filter(func.lower(Organization.name) == org_in.name.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Organization with this name already exists.")
        
    new_org = Organization(name=org_in.name)
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    
    return OrganizationResponse(
        id=new_org.id,
        name=new_org.name,
        employees=0
    )

@router.put("/organizations/{org_id}", response_model=OrganizationResponse)
def update_organization(org_id: int, org_in: OrganizationCreate, db: Session = Depends(get_db), admin: User = Depends(verify_superadmin)):
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    existing = db.query(Organization).filter(func.lower(Organization.name) == org_in.name.lower(), Organization.id != org_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Name taken by another organization.")
    
    org.name = org_in.name
    db.commit()
    db.refresh(org)
    
    employee_count = db.query(User).filter(User.organization_id == org.id).count()
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        employees=employee_count
    )

@router.post("/organizations/{org_id}/upload")
async def upload_employees_csv(org_id: int, background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db), admin: User = Depends(verify_superadmin)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
        
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    content = await file.read()
    try:
        decoded_content = content.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Failed to decode file. Please ensure it is UTF-8 encoded.")
        
    csv_reader = csv.DictReader(io.StringIO(decoded_content))
    added_count = 0
    updated_count = 0
    
    # Process each row
    for row in csv_reader:
        # Assuming CSV has headers like "email", "first_name", "mobile"
        email = row.get("email", "").strip().lower()
        if not email:
            continue # skip empty emails
            
        first_name = row.get("first_name", row.get("name", "")).strip()
        mobile = row.get("mobile", row.get("phone", "")).strip()
        
        user = db.query(User).filter(User.email == email).first()
        if user:
            # Update existing user to belong to this org, and update details
            is_new_org = user.organization_id != org.id
            user.organization_id = org.id
            if first_name and not user.first_name:
                user.first_name = first_name
            if mobile and not user.mobile:
                user.mobile = mobile
            updated_count += 1
            
            if is_new_org:
                background_tasks.add_task(send_welcome_email, email, first_name, org.name)
        else:
            # Create new user
            new_user = User(
                email=email,
                first_name=first_name,
                mobile=mobile,
                organization_id=org.id
            )
            db.add(new_user)
            added_count += 1
            background_tasks.add_task(send_welcome_email, email, first_name, org.name)
            
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error during CSV import: {str(e)}")
        
    employee_count = db.query(User).filter(User.organization_id == org.id).count()
    
    return {
        "message": f"Successfully processed CSV. Added {added_count} new users, updated {updated_count} existing users.",
        "organization": OrganizationResponse(
            id=org.id,
            name=org.name,
            employees=employee_count
        )
    }

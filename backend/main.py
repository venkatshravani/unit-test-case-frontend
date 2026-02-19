from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import logging
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from backend.services.dashboard import DashboardService
from backend.services.health_check import health_check

app = FastAPI(title="Invoice Dashboard API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)
dashboard_service = DashboardService()


# ==========================================
# Pydantic Models
# ==========================================
class InvoiceDetail(BaseModel):
    id: str
    customer_name: str
    customer_account: Optional[str] = None
    customer_group: Optional[str] = None
    voucher: str
    invoice: str
    date: str
    due_date: str
    description: Optional[str] = None
    currency: str
    amount_in_transaction: float
    balance: float
    accounting_currency_balance: Optional[float] = None
    reporting_currency_balance: Optional[float] = None
    business_unit: Optional[str] = None
    cost_center: Optional[str] = None
    project: Optional[str] = None
    vendor: Optional[str] = None
    worker: Optional[str] = None
    onsite_offshore: Optional[str] = None
    geo: Optional[str] = None
    company: Optional[str] = None
    revised_overdue_bucket: Optional[str] = None
    closed_date: Optional[str] = None
    email_address: Optional[str] = None
    credit_terms: Optional[str] = None
    credit_note: Optional[str] = None
    axapta_document: Optional[str] = None
    customer_reference_sofo: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    service: str


# ==========================================
# Health Check Endpoint
# ==========================================
@app.get("/api/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    try:
        result = health_check()
        return HealthResponse(
            status=result.get('status', 'healthy'),
            timestamp=datetime.utcnow().isoformat(),
            service="Invoice Dashboard API"
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail=str(e))


# ==========================================
# Dashboard Data Endpoint
# ==========================================
@app.get("/api/dashboard-data")
async def get_dashboard_data(
    business_unit: Optional[str] = Query("all"),
    entity: Optional[str] = Query("all"),
    currency: Optional[str] = Query("USD"),
    action: Optional[str] = Query(None),
):
    """
    Get dashboard data with filtering and currency conversion
    
    Query Parameters:
    - business_unit: Filter by business unit (default: 'all')
    - entity: Filter by entity/company (default: 'all')
    - currency: Display currency - USD or INR (default: 'USD')
    - action: 'data' for invoices, 'metadata' for filter options
    
    Returns:
    - action=data: List of invoices with aggregations and summary
    - action=metadata: Available filter values
    """
    try:
        if action == "metadata":
            metadata = dashboard_service.get_metadata()
            return metadata
        
        # Validate currency
        if currency not in ["USD", "INR"]:
            raise HTTPException(status_code=400, detail="Currency must be USD or INR")
        
        data = dashboard_service.get_dashboard_data(
            business_unit=business_unit,
            entity=entity,
            currency=currency
        )
        
        return data
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching dashboard data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# Customer Detail Endpoint
# ==========================================
@app.get("/api/customer/{customer_name}")
async def get_customer_detail(
    customer_name: str,
    currency: Optional[str] = Query("USD")
):
    """
    Get all invoices for a specific customer with currency conversion
    
    Path Parameters:
    - customer_name: Name of the customer
    
    Query Parameters:
    - currency: Display currency - USD or INR (default: 'USD')
    
    Returns:
    - List of invoices for the customer with totals
    """
    try:
        if currency not in ["USD", "INR"]:
            raise HTTPException(status_code=400, detail="Currency must be USD or INR")
        
        # Get all invoices filtered by customer
        data = dashboard_service.get_dashboard_data(currency=currency)
        
        customer_invoices = [
            inv for inv in data.get("invoices", []) 
            if inv.get("customer_name", "").lower() == customer_name.lower()
        ]
        
        if not customer_invoices:
            raise HTTPException(status_code=404, detail=f"No invoices found for customer: {customer_name}")
        
        return {
            "customer": customer_name,
            "invoices": customer_invoices,
            "total_amount": sum([inv.get("amount_in_transaction", 0) for inv in customer_invoices]),
            "total_balance": sum([inv.get("balance", 0) for inv in customer_invoices]),
            "currency": currency,
            "count": len(customer_invoices)
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching customer detail: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# Invoice Detail Endpoint
# ==========================================
@app.get("/api/invoice/{voucher_id}")
async def get_invoice_detail(
    voucher_id: str,
    currency: Optional[str] = Query("USD")
):
    """
    Get complete details for a specific invoice
    
    Path Parameters:
    - voucher_id: Invoice voucher number
    
    Query Parameters:
    - currency: Display currency - USD or INR (default: 'USD')
    
    Returns:
    - Complete invoice record with all 27 fields
    """
    try:
        if currency not in ["USD", "INR"]:
            raise HTTPException(status_code=400, detail="Currency must be USD or INR")
        
        data = dashboard_service.get_dashboard_data(currency=currency)
        
        invoice = next(
            (inv for inv in data.get("invoices", []) if inv.get("voucher") == voucher_id),
            None
        )
        
        if not invoice:
            raise HTTPException(status_code=404, detail=f"Invoice not found: {voucher_id}")
        
        return invoice
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching invoice detail: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# Metadata Endpoints
# ==========================================
@app.get("/api/business-units")
async def get_business_units():
    """Get list of available business units"""
    try:
        metadata = dashboard_service.get_metadata()
        return {"business_units": metadata.get("business_units", [])}
    except Exception as e:
        logger.error(f"Error fetching business units: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/entities")
async def get_entities():
    """Get list of available entities"""
    try:
        metadata = dashboard_service.get_metadata()
        return {"entities": metadata.get("entities", [])}
    except Exception as e:
        logger.error(f"Error fetching entities: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/fx-rates")
async def get_fx_rates():
    """Get current FX rates for currency conversion"""
    try:
        metadata = dashboard_service.get_metadata()
        return {"fx_rates": metadata.get("fx_rates", {})}
    except Exception as e:
        logger.error(f"Error fetching FX rates: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# Main
# ==========================================
if __name__ == "__main__":
    import uvicorn
    debug = os.getenv("DEBUG", "False").lower() == "true"
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=port,
        reload=debug
    )

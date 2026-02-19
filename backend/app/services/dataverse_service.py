"""
Dataverse Service - Handles all communication with Dynamics 365 Dataverse
"""
import requests
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from backend.app.utils.auth_service import get_dataverse_headers
import os

logger = logging.getLogger(__name__)

# Configuration
DATAVERSE_ORG_URL = os.getenv("DATAVERSE_ORG_URL", "https://your-org.crm.dynamics.com")
CUSTOMER_ACCOUNT_TRANSACTION_TABLE = "cr16e_customeraccounttransactions"  # Actual table name

# All 27 columns from Customer Account Transaction table
INVOICE_COLUMNS = [
    "cr16e_customeraccounttransactionid",  # ID
    "cr16e_customeraccount",  # Customer account
    "cr16e_customername",  # Customer name
    "cr16e_customergroup",  # Customer group
    "cr16e_date",  # Date
    "cr16e_voucher",  # Voucher
    "cr16e_invoice",  # Invoice
    "cr16e_description",  # Description
    "cr16e_duedate",  # Due date
    "cr16e_currency",  # Currency
    "cr16e_amountintransaction",  # Amount in transaction
    "cr16e_balance",  # Balance
    "cr16e_accountingcurrencybalance",  # Accounting currency balance
    "cr16e_reportingcurrencybalance",  # Reporting currency balance
    "cr16e_businessunit",  # Business unit
    "cr16e_costcenter",  # Cost center
    "cr16e_project",  # Project
    "cr16e_vendor",  # Vendor
    "cr16e_worker",  # Worker
    "cr16e_onsiteoffshore",  # Onsite/Offshore
    "cr16e_geo",  # Geo
    "cr16e_company",  # Company
    "cr16e_revisedoverduebucket",  # Revised overdue bucket
    "cr16e_closeddate",  # Closed date
    "cr16e_emailaddress",  # Email address
    "cr16e_creditterms",  # Credit terms
    "cr16e_creditnote",  # Credit note
    "cr16e_axaptadocument",  # Axapta document
    "cr16e_customerreferencesopo",  # Customer reference SO-PO
]


class DataverseService:
    """Service to interact with Dataverse Customer Account Transaction table"""

    def __init__(self):
        self.base_url = f"{DATAVERSE_ORG_URL}/api/data/v9.2"
        self.headers = get_dataverse_headers()

    def get_all_transactions(
        self,
        filters: Optional[Dict[str, str]] = None,
        limit: int = 5000
    ) -> List[Dict[str, Any]]:
        """
        Fetch all customer account transactions from Dataverse
        
        Args:
            filters: Optional dict with filter criteria (business_unit, entity, currency)
            limit: Maximum number of records to fetch
            
        Returns:
            List of transaction records
        """
        try:
            # Build OData query
            columns = ",".join(INVOICE_COLUMNS)
            query = f"{self.base_url}/{CUSTOMER_ACCOUNT_TRANSACTION_TABLE}?$select={columns}&$top={limit}"
            
            # Add filters if provided
            filter_conditions = []
            if filters:
                if filters.get("business_unit") and filters["business_unit"] != "all":
                    filter_conditions.append(f"cr16e_businessunit eq '{filters['business_unit']}'")
                
                if filters.get("entity") and filters["entity"] != "all":
                    filter_conditions.append(f"cr16e_company eq '{filters['entity']}'")
                
                if filters.get("currency") and filters["currency"] != "all":
                    filter_conditions.append(f"cr16e_currency eq '{filters['currency']}'")
            
            if filter_conditions:
                filter_string = " and ".join(filter_conditions)
                query += f"&$filter={filter_string}"
            
            logger.info(f"[v0] Dataverse query: {query}")
            
            response = requests.get(query, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            records = data.get("value", [])
            logger.info(f"[v0] Retrieved {len(records)} records from Dataverse")
            
            return records
        
        except requests.exceptions.RequestException as e:
            logger.error(f"[v0] Dataverse API error: {str(e)}")
            raise Exception(f"Failed to fetch transactions from Dataverse: {str(e)}")

    def get_unique_values(self, column_name: str) -> List[str]:
        """
        Get unique values for a specific column (for filter dropdowns)
        
        Args:
            column_name: Column name to get unique values for
            
        Returns:
            List of unique values
        """
        try:
            query = (
                f"{self.base_url}/{CUSTOMER_ACCOUNT_TRANSACTION_TABLE}"
                f"?$select={column_name}&$top=1000"
            )
            
            response = requests.get(query, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            records = data.get("value", [])
            
            # Extract unique values
            unique_values = list(set([
                record.get(column_name) for record in records
                if record.get(column_name)
            ]))
            
            return sorted(unique_values)
        
        except Exception as e:
            logger.error(f"[v0] Error fetching unique values for {column_name}: {str(e)}")
            return []

    def get_business_units(self) -> List[str]:
        """Get list of unique business units"""
        return self.get_unique_values("cr16e_businessunit")

    def get_entities(self) -> List[str]:
        """Get list of unique companies/entities"""
        return self.get_unique_values("cr16e_company")

    def get_fx_rates(self) -> Dict[str, float]:
        """
        Get FX rates for currency conversion
        For now, returns hardcoded rates. Can be updated to fetch from Dataverse FX table
        """
        return {
            "USD_to_INR": 83.0,  # 1 USD = 83 INR
            "INR_to_USD": 0.012,  # 1 INR = 0.012 USD
            "default_rate": 1.0
        }

    def convert_currency(
        self,
        amount: float,
        from_currency: str,
        to_currency: str,
        fx_rates: Dict[str, float]
    ) -> float:
        """
        Convert amount from one currency to another
        
        Args:
            amount: Amount to convert
            from_currency: Source currency (USD or INR)
            to_currency: Target currency (USD or INR)
            fx_rates: FX rates dictionary
            
        Returns:
            Converted amount
        """
        if from_currency == to_currency:
            return amount
        
        rate_key = f"{from_currency}_to_{to_currency}"
        rate = fx_rates.get(rate_key, fx_rates.get("default_rate", 1.0))
        
        return amount * rate

    def format_transaction(
        self,
        record: Dict[str, Any],
        target_currency: str = "USD",
        fx_rates: Optional[Dict[str, float]] = None
    ) -> Dict[str, Any]:
        """
        Format raw Dataverse record into Invoice object
        
        Args:
            record: Raw Dataverse record
            target_currency: Target currency for conversion (USD or INR)
            fx_rates: FX rates for conversion
            
        Returns:
            Formatted invoice dictionary
        """
        if not fx_rates:
            fx_rates = self.get_fx_rates()
        
        source_currency = record.get("cr16e_currency", "USD")
        
        # Convert amounts if needed
        amount = record.get("cr16e_amountintransaction", 0)
        balance = record.get("cr16e_balance", 0)
        
        if source_currency != target_currency:
            amount = self.convert_currency(amount, source_currency, target_currency, fx_rates)
            balance = self.convert_currency(balance, source_currency, target_currency, fx_rates)
        
        return {
            "id": record.get("cr16e_customeraccounttransactionid", ""),
            "customer_account": record.get("cr16e_customeraccount", ""),
            "customer_name": record.get("cr16e_customername", ""),
            "customer_group": record.get("cr16e_customergroup", ""),
            "date": record.get("cr16e_date", ""),
            "voucher": record.get("cr16e_voucher", ""),
            "invoice": record.get("cr16e_invoice", ""),
            "description": record.get("cr16e_description", ""),
            "due_date": record.get("cr16e_duedate", ""),
            "currency": target_currency,
            "amount_in_transaction": amount,
            "balance": balance,
            "accounting_currency_balance": record.get("cr16e_accountingcurrencybalance", 0),
            "reporting_currency_balance": record.get("cr16e_reportingcurrencybalance", 0),
            "business_unit": record.get("cr16e_businessunit", ""),
            "cost_center": record.get("cr16e_costcenter", ""),
            "project": record.get("cr16e_project", ""),
            "vendor": record.get("cr16e_vendor", ""),
            "worker": record.get("cr16e_worker", ""),
            "onsite_offshore": record.get("cr16e_onsiteoffshore", ""),
            "geo": record.get("cr16e_geo", ""),
            "company": record.get("cr16e_company", ""),
            "revised_overdue_bucket": record.get("cr16e_revisedoverduebucket", ""),
            "closed_date": record.get("cr16e_closeddate", ""),
            "email_address": record.get("cr16e_emailaddress", ""),
            "credit_terms": record.get("cr16e_creditterms", ""),
            "credit_note": record.get("cr16e_creditnote", ""),
            "axapta_document": record.get("cr16e_axaptadocument", ""),
            "customer_reference_sofo": record.get("cr16e_customerreferencesopo", ""),
        }

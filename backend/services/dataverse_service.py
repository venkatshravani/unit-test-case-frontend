import requests
from typing import Dict, List, Any, Optional
from datetime import datetime
import os
from ..config import DATAVERSE_URL, CLIENT_ID, CLIENT_SECRET, TENANT_ID
from .auth_service import get_access_token

class DataverseService:
    def __init__(self):
        self.base_url = DATAVERSE_URL
        self.token = None
        self.refresh_token()
    
    def refresh_token(self):
        """Refresh the access token"""
        self.token = get_access_token()
    
    def _get_headers(self) -> Dict[str, str]:
        """Get request headers with auth token"""
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        }
    
    def query_records(self, table_name: str, filters: Optional[Dict[str, Any]] = None, select_columns: Optional[List[str]] = None) -> List[Dict]:
        """
        Query records from Dataverse table
        
        Args:
            table_name: Dataverse table logical name (e.g., 'cr16e_basedatas')
            filters: Dictionary of column filters
            select_columns: List of columns to select
        
        Returns:
            List of record dictionaries
        """
        try:
            url = f"{self.base_url}/api/data/v9.2/{table_name}"
            
            # Build select query
            if select_columns:
                url += f"?$select={','.join(select_columns)}"
            
            # Build filter query
            if filters:
                filter_conditions = []
                for key, value in filters.items():
                    if isinstance(value, str):
                        filter_conditions.append(f"{key} eq '{value}'")
                    elif isinstance(value, (int, float)):
                        filter_conditions.append(f"{key} eq {value}")
                    elif isinstance(value, bool):
                        filter_conditions.append(f"{key} eq {str(value).lower()}")
                
                if filter_conditions:
                    filter_query = " and ".join(filter_conditions)
                    separator = "&" if select_columns else "?"
                    url += f"{separator}$filter={filter_query}"
            
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            
            data = response.json()
            return data.get('value', [])
        
        except requests.exceptions.RequestException as e:
            print(f"[v0] Dataverse query error: {str(e)}")
            return []
    
    def get_base_data_invoices(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict]:
        """
        Fetch invoices from BaseData table with all 27 fields
        
        Args:
            filters: Optional filters (e.g., business_unit, entity, currency)
        
        Returns:
            List of invoice records with all fields
        """
        # All 27 columns to fetch from BaseData table
        columns = [
            'cr16e_basedataid',  # ID
            'cr16e_customeraccount',
            'cr16e_customername',
            'cr16e_customergroup',
            'cr16e_date',
            'cr16e_voucher',
            'cr16e_invoice',
            'cr16e_description',
            'cr16e_duedate',
            'cr16e_currency',
            'cr16e_amountintransaction',
            'cr16e_balance',
            'cr16e_accountingcurrencybalance',
            'cr16e_reportingcurrencybalance',
            'cr16e_axaptadocument',
            'cr16e_customerreferencesofo',
            'cr16e_businessunit',
            'cr16e_costcenter',
            'cr16e_geo',
            'cr16e_project',
            'cr16e_vendor',
            'cr16e_worker',
            'cr16e_onsiteoffshore',
            'cr16e_revisedoverduebucket',
            'cr16e_closeddate',
            'cr16e_company',
            'cr16e_emailaddress'
        ]
        
        return self.query_records('cr16e_basedatas', filters=filters, select_columns=columns)
    
    def get_unique_values(self, table_name: str, column_name: str) -> List[str]:
        """
        Get unique values for a column (for filter dropdowns)
        
        Args:
            table_name: Dataverse table name
            column_name: Column to get unique values from
        
        Returns:
            List of unique values
        """
        try:
            url = f"{self.base_url}/api/data/v9.2/{table_name}?$select={column_name}&$filter={column_name} ne null"
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            
            data = response.json()
            records = data.get('value', [])
            
            # Extract unique values
            unique_values = list(set([record.get(column_name) for record in records if record.get(column_name)]))
            return sorted(unique_values)
        
        except requests.exceptions.RequestException as e:
            print(f"[v0] Error getting unique values: {str(e)}")
            return []
    
    def get_business_units(self) -> List[str]:
        """Get all unique business units"""
        return self.get_unique_values('cr16e_basedatas', 'cr16e_businessunit')
    
    def get_entities(self) -> List[str]:
        """Get all unique entities (customer names or company)"""
        return self.get_unique_values('cr16e_basedatas', 'cr16e_company')
    
    def get_fx_rates(self, from_currency: str, to_currency: str, date: Optional[str] = None) -> float:
        """
        Get exchange rate between two currencies
        
        Args:
            from_currency: Source currency (e.g., 'USD')
            to_currency: Target currency (e.g., 'INR')
            date: Optional date for historical rates
        
        Returns:
            Exchange rate or 1.0 if not found
        """
        try:
            # Query FX rates table
            filters = {
                'cr16e_fromcurrency': from_currency,
                'cr16e_tocurrency': to_currency
            }
            
            if date:
                filters['cr16e_effectivedate'] = date
            
            rates = self.query_records('cr16e_fxrates', filters=filters)
            
            if rates:
                return float(rates[0].get('cr16e_rate', 1.0))
            
            return 1.0
        
        except Exception as e:
            print(f"[v0] Error fetching FX rate: {str(e)}")
            return 1.0

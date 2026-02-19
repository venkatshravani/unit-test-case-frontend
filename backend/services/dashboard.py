from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from .dataverse_service import DataverseService
from .parse_date import parse_date

class DashboardService:
    def __init__(self):
        self.dataverse = DataverseService()
    
    def calculate_aging_bucket(self, due_date: str, today: Optional[datetime] = None) -> str:
        """
        Calculate aging bucket based on due date
        
        Args:
            due_date: Due date string
            today: Reference date (defaults to today)
        
        Returns:
            Aging bucket string (e.g., "1-4 Days", "90+ Days")
        """
        if not today:
            today = datetime.now()
        
        try:
            due = parse_date(due_date)
            days_overdue = (today - due).days
            
            if days_overdue < 0:
                return "Not Due"
            elif days_overdue <= 4:
                return "1-4 Days"
            elif days_overdue <= 15:
                return "5-15 Days"
            elif days_overdue <= 30:
                return "16-30 Days"
            elif days_overdue <= 60:
                return "31-60 Days"
            elif days_overdue <= 90:
                return "61-90 Days"
            else:
                return "90+ Days"
        except:
            return "Unknown"
    
    def calculate_days_overdue(self, due_date: str, today: Optional[datetime] = None) -> int:
        """Calculate number of days overdue"""
        if not today:
            today = datetime.now()
        
        try:
            due = parse_date(due_date)
            days = (today - due).days
            return max(0, days)
        except:
            return 0
    
    def convert_currency(self, amount: float, from_currency: str, to_currency: str) -> float:
        """
        Convert amount from one currency to another
        
        Args:
            amount: Amount to convert
            from_currency: Source currency
            to_currency: Target currency
        
        Returns:
            Converted amount
        """
        if from_currency == to_currency:
            return amount
        
        rate = self.dataverse.get_fx_rates(from_currency, to_currency)
        return amount * rate
    
    def format_invoice(self, record: Dict[str, Any], target_currency: str = "USD") -> Dict[str, Any]:
        """
        Format a Dataverse record into invoice object with currency conversion
        
        Args:
            record: Raw Dataverse record
            target_currency: Currency to convert amounts to
        
        Returns:
            Formatted invoice dictionary
        """
        source_currency = record.get('cr16e_currency', 'USD')
        
        # Convert amounts if needed
        amount = float(record.get('cr16e_amountintransaction', 0))
        balance = float(record.get('cr16e_balance', 0))
        
        if source_currency != target_currency:
            amount = self.convert_currency(amount, source_currency, target_currency)
            balance = self.convert_currency(balance, source_currency, target_currency)
        
        due_date = record.get('cr16e_duedate', record.get('cr16e_date'))
        
        return {
            'id': record.get('cr16e_basedataid'),
            'customerAccount': record.get('cr16e_customeraccount'),
            'customer': record.get('cr16e_customername'),
            'customerGroup': record.get('cr16e_customergroup'),
            'invoiceDate': record.get('cr16e_date'),
            'voucher': record.get('cr16e_voucher'),
            'invoiceNo': record.get('cr16e_invoice'),
            'description': record.get('cr16e_description'),
            'dueDate': due_date,
            'currency': target_currency,  # Display currency after conversion
            'originalCurrency': source_currency,
            'amount': amount,
            'balance': balance,
            'accountingCurrencyBalance': float(record.get('cr16e_accountingcurrencybalance', 0)),
            'reportingCurrencyBalance': float(record.get('cr16e_reportingcurrencybalance', 0)),
            'businessUnit': record.get('cr16e_businessunit'),
            'costCenter': record.get('cr16e_costcenter'),
            'geo': record.get('cr16e_geo'),
            'project': record.get('cr16e_project'),
            'vendor': record.get('cr16e_vendor'),
            'worker': record.get('cr16e_worker'),
            'onsiteOffshore': record.get('cr16e_onsiteoffshore'),
            'revisedOverdueBucket': record.get('cr16e_revisedoverduebucket'),
            'closedDate': record.get('cr16e_closeddate'),
            'company': record.get('cr16e_company'),
            'emailAddress': record.get('cr16e_emailaddress'),
            'axaptaDocument': record.get('cr16e_axaptadocument'),
            'customerReference': record.get('cr16e_customerreferencesofo'),
            'agingBucket': self.calculate_aging_bucket(due_date),
            'daysOverdue': self.calculate_days_overdue(due_date),
        }
    
    def get_dashboard_data(self, 
                          business_unit: Optional[str] = None,
                          entity: Optional[str] = None,
                          currency: str = "USD") -> Dict[str, Any]:
        """
        Get dashboard data with filtering and currency conversion
        
        Args:
            business_unit: Filter by business unit ('all' or specific BU)
            entity: Filter by entity/company ('all' or specific entity)
            currency: Target currency for display (USD or INR)
        
        Returns:
            Dictionary with invoices, summary stats, and aggregations
        """
        # Build filters
        filters = {}
        
        if business_unit and business_unit != "all":
            filters['cr16e_businessunit'] = business_unit
        
        if entity and entity != "all":
            filters['cr16e_company'] = entity
        
        # Fetch raw records from Dataverse
        raw_records = self.dataverse.get_base_data_invoices(filters=filters if filters else None)
        
        # Format and convert currency
        invoices = [self.format_invoice(record, currency) for record in raw_records]
        
        # Calculate summary stats
        total_amount = sum([inv['amount'] for inv in invoices])
        total_balance = sum([inv['balance'] for inv in invoices])
        
        # Group by customer and aging bucket
        customer_aging = {}
        for invoice in invoices:
            customer = invoice['customer']
            aging = invoice['agingBucket']
            
            if customer not in customer_aging:
                customer_aging[customer] = {
                    'customer': customer,
                    'totalAmount': 0,
                    'totalBalance': 0,
                    'agingBuckets': {
                        'Not Due': 0,
                        '1-4 Days': 0,
                        '5-15 Days': 0,
                        '16-30 Days': 0,
                        '31-60 Days': 0,
                        '61-90 Days': 0,
                        '90+ Days': 0,
                    },
                    'count': 0,
                }
            
            customer_aging[customer]['totalAmount'] += invoice['amount']
            customer_aging[customer]['totalBalance'] += invoice['balance']
            customer_aging[customer]['agingBuckets'][aging] += invoice['balance']
            customer_aging[customer]['count'] += 1
        
        return {
            'invoices': invoices,
            'summary': {
                'totalInvoices': len(invoices),
                'totalAmount': total_amount,
                'totalBalance': total_balance,
                'currency': currency,
            },
            'customerAging': list(customer_aging.values()),
        }
    
    def get_metadata(self) -> Dict[str, List[str]]:
        """
        Get filter options (business units, entities, currencies)
        
        Returns:
            Dictionary with available filter values
        """
        return {
            'businessUnits': ['all'] + self.dataverse.get_business_units(),
            'entities': ['all'] + self.dataverse.get_entities(),
            'currencies': ['USD', 'INR'],
        }

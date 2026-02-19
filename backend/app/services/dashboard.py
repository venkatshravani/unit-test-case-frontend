"""
Dashboard Service - Handles dashboard data aggregation and calculations
"""
import logging
from typing import Dict, List, Any, Optional
from collections import defaultdict
from datetime import datetime
from backend.app.services.dataverse_service import DataverseService
from backend.app.utils.parse_date import parse_date, format_date, get_days_overdue
import os

logger = logging.getLogger(__name__)
dataverse_service = DataverseService()


class DashboardService:
    """Service to aggregate and process dashboard data"""

    def __init__(self):
        self.dataverse_service = dataverse_service

    def get_metadata(self) -> Dict[str, Any]:
        """
        Get metadata for dashboard filters (Business Units, Entities, FX Rates)
        
        Returns:
            Dictionary with metadata for all filter dropdowns
        """
        try:
            business_units = self.dataverse_service.get_business_units()
            entities = self.dataverse_service.get_entities()
            fx_rates = self.dataverse_service.get_fx_rates()
            
            return {
                "business_units": [
                    {"value": "all", "label": "All BUs"},
                    *[{"value": bu, "label": bu} for bu in business_units if bu]
                ],
                "entities": [
                    {"value": "all", "label": "All Entities"},
                    *[{"value": entity, "label": entity} for entity in entities if entity]
                ],
                "fx_rates": fx_rates,
                "currencies": ["USD", "INR"]
            }
        except Exception as e:
            logger.error(f"[v0] Error fetching metadata: {str(e)}")
            return {
                "business_units": [{"value": "all", "label": "All BUs"}],
                "entities": [{"value": "all", "label": "All Entities"}],
                "fx_rates": {"USD_to_INR": 83.0, "INR_to_USD": 0.012},
                "currencies": ["USD", "INR"]
            }

    def get_dashboard_data(
        self,
        business_unit: str = "all",
        entity: str = "all",
        currency: str = "USD"
    ) -> Dict[str, Any]:
        """
        Get complete dashboard data with invoices, aggregations, and aging buckets
        
        Args:
            business_unit: Filter by business unit
            entity: Filter by entity/company
            currency: Display currency (USD or INR)
            
        Returns:
            Dictionary with invoices, summary stats, and aging bucket data
        """
        try:
            # Get metadata including FX rates
            metadata = self.get_metadata()
            fx_rates = metadata.get("fx_rates", {})
            
            # Fetch transactions from Dataverse
            filters = {
                "business_unit": business_unit,
                "entity": entity,
                "currency": currency if currency in ["USD", "INR"] else "all"
            }
            
            raw_records = self.dataverse_service.get_all_transactions(filters=filters)
            logger.info(f"[v0] Fetched {len(raw_records)} raw records from Dataverse")
            
            # Format records into invoices
            invoices = []
            for record in raw_records:
                try:
                    invoice = self.dataverse_service.format_transaction(
                        record,
                        target_currency=currency,
                        fx_rates=fx_rates
                    )
                    invoices.append(invoice)
                except Exception as e:
                    logger.warning(f"[v0] Error formatting record {record.get('cr16e_customeraccounttransactionid')}: {str(e)}")
                    continue
            
            logger.info(f"[v0] Formatted {len(invoices)} invoices")
            
            # Calculate summary statistics
            summary = self._calculate_summary(invoices, currency)
            
            # Group by customer and calculate aging buckets
            customer_summary = self._calculate_customer_aging(invoices, currency)
            
            return {
                "invoices": invoices,
                "summary": summary,
                "customer_summary": customer_summary,
                "currency": currency,
                "total_records": len(invoices),
                "metadata": metadata,
                "timestamp": datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"[v0] Error in get_dashboard_data: {str(e)}")
            return {
                "invoices": [],
                "summary": {},
                "customer_summary": [],
                "currency": currency,
                "error": str(e)
            }

    def _calculate_summary(self, invoices: List[Dict], currency: str) -> Dict[str, Any]:
        """
        Calculate dashboard summary statistics
        
        Args:
            invoices: List of invoice records
            currency: Display currency
            
        Returns:
            Dictionary with summary metrics
        """
        if not invoices:
            return {
                "total_outstanding": 0,
                "overdue_amount": 0,
                "partially_paid": 0,
                "committed_payments": 0,
                "dso_weighted_avg": 0,
                "avg_days_to_pay": 0,
                "currency": currency,
                "invoice_count": 0
            }
        
        total_outstanding = sum([inv.get("balance", 0) for inv in invoices])
        overdue_invoices = [inv for inv in invoices if self._is_overdue(inv)]
        overdue_amount = sum([inv.get("balance", 0) for inv in overdue_invoices])
        
        # Calculate average days to pay
        days_to_pay = []
        for inv in invoices:
            due_date = parse_date(inv.get("due_date"))
            if due_date:
                days = (datetime.now() - due_date).days
                if days > 0:
                    days_to_pay.append(days)
        
        avg_days = sum(days_to_pay) / len(days_to_pay) if days_to_pay else 0
        
        return {
            "total_outstanding": round(total_outstanding, 2),
            "overdue_amount": round(overdue_amount, 2),
            "overdue_percentage": round((overdue_amount / total_outstanding * 100), 2) if total_outstanding > 0 else 0,
            "partially_paid": 0,  # Calculate if needed
            "committed_payments": 0,  # Calculate if needed
            "dso_weighted_avg": 54,  # Placeholder
            "avg_days_to_pay": round(avg_days, 0),
            "currency": currency,
            "invoice_count": len(invoices),
            "overdue_count": len(overdue_invoices)
        }

    def _calculate_customer_aging(self, invoices: List[Dict], currency: str) -> List[Dict[str, Any]]:
        """
        Group invoices by customer and calculate aging bucket distribution
        
        Args:
            invoices: List of invoice records
            currency: Display currency
            
        Returns:
            List of customer summary records with aging bucket breakdown
        """
        customer_groups = defaultdict(list)
        
        # Group invoices by customer
        for invoice in invoices:
            customer = invoice.get("customer_name", "Unknown")
            customer_groups[customer].append(invoice)
        
        customer_summaries = []
        for customer, customer_invoices in customer_groups.items():
            aging_buckets = self._calculate_aging_buckets(customer_invoices)
            
            summary = {
                "customer_name": customer,
                "total_amount": round(sum([inv.get("balance", 0) for inv in customer_invoices]), 2),
                "invoice_count": len(customer_invoices),
                "aging_buckets": aging_buckets,
                "currency": currency
            }
            customer_summaries.append(summary)
        
        return sorted(customer_summaries, key=lambda x: x["total_amount"], reverse=True)

    def _calculate_aging_buckets(self, invoices: List[Dict]) -> Dict[str, float]:
        """
        Calculate aging bucket distribution for a customer
        
        Args:
            invoices: List of invoice records for a customer
            
        Returns:
            Dictionary with aging bucket amounts
        """
        buckets = {
            "1_4_days": 0,
            "5_15_days": 0,
            "16_30_days": 0,
            "31_60_days": 0,
            "61_90_days": 0,
            "90_plus_days": 0
        }
        
        for invoice in invoices:
            due_date = parse_date(invoice.get("due_date"))
            if due_date:
                days_overdue = get_days_overdue(due_date)
                balance = invoice.get("balance", 0)
                
                if days_overdue <= 4:
                    buckets["1_4_days"] += balance
                elif days_overdue <= 15:
                    buckets["5_15_days"] += balance
                elif days_overdue <= 30:
                    buckets["16_30_days"] += balance
                elif days_overdue <= 60:
                    buckets["31_60_days"] += balance
                elif days_overdue <= 90:
                    buckets["61_90_days"] += balance
                else:
                    buckets["90_plus_days"] += balance
        
        # Round all values
        return {k: round(v, 2) for k, v in buckets.items()}

    def _is_overdue(self, invoice: Dict[str, Any]) -> bool:
        """
        Check if invoice is overdue
        
        Args:
            invoice: Invoice record
            
        Returns:
            True if invoice is overdue
        """
        due_date = parse_date(invoice.get("due_date"))
        if not due_date:
            return False
        
        return get_days_overdue(due_date) > 0

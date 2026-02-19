from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from backend.services.dashboard import DashboardService
from backend.services.health_check import health_check

app = Flask(__name__)
CORS(app)

dashboard_service = DashboardService()

# ==========================================
# Health Check Endpoint
# ==========================================
@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    try:
        result = health_check()
        return jsonify(result), 200 if result.get('status') == 'healthy' else 503
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# ==========================================
# Dashboard Data Endpoint
# ==========================================
@app.route('/api/dashboard-data', methods=['GET'])
def get_dashboard_data():
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
        action = request.args.get('action', 'data')
        
        if action == 'metadata':
            return jsonify(dashboard_service.get_metadata()), 200
        
        business_unit = request.args.get('business_unit', 'all')
        entity = request.args.get('entity', 'all')
        currency = request.args.get('currency', 'USD')
        
        # Validate currency
        if currency not in ['USD', 'INR']:
            return jsonify({'error': 'Currency must be USD or INR'}), 400
        
        data = dashboard_service.get_dashboard_data(
            business_unit=business_unit,
            entity=entity,
            currency=currency
        )
        
        return jsonify(data), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# ==========================================
# Customer Detail Endpoint
# ==========================================
@app.route('/api/customer/<customer_name>', methods=['GET'])
def get_customer_detail(customer_name):
    """
    Get all invoices for a specific customer with currency conversion
    
    Query Parameters:
    - currency: Display currency - USD or INR (default: 'USD')
    
    Returns:
    - List of invoices for the customer
    """
    try:
        currency = request.args.get('currency', 'USD')
        
        if currency not in ['USD', 'INR']:
            return jsonify({'error': 'Currency must be USD or INR'}), 400
        
        # Get all invoices filtered by customer
        data = dashboard_service.get_dashboard_data(currency=currency)
        
        customer_invoices = [inv for inv in data['invoices'] if inv['customer'].lower() == customer_name.lower()]
        
        return jsonify({
            'customer': customer_name,
            'invoices': customer_invoices,
            'totalAmount': sum([inv['amount'] for inv in customer_invoices]),
            'totalBalance': sum([inv['balance'] for inv in customer_invoices]),
            'currency': currency,
        }), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# ==========================================
# Invoice Detail Endpoint
# ==========================================
@app.route('/api/invoice/<voucher_id>', methods=['GET'])
def get_invoice_detail(voucher_id):
    """
    Get complete details for a specific invoice
    
    Query Parameters:
    - currency: Display currency - USD or INR (default: 'USD')
    
    Returns:
    - Complete invoice record with all 27 fields
    """
    try:
        currency = request.args.get('currency', 'USD')
        
        if currency not in ['USD', 'INR']:
            return jsonify({'error': 'Currency must be USD or INR'}), 400
        
        data = dashboard_service.get_dashboard_data(currency=currency)
        
        invoice = next((inv for inv in data['invoices'] if inv['voucher'] == voucher_id), None)
        
        if not invoice:
            return jsonify({'error': 'Invoice not found'}), 404
        
        return jsonify(invoice), 200
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

# ==========================================
# Error Handlers
# ==========================================
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error', 'timestamp': datetime.now().isoformat()}), 500

# ==========================================
# Main
# ==========================================
if __name__ == '__main__':
    debug = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.getenv('PORT', 5000))
    
    app.run(debug=debug, host='0.0.0.0', port=port)

from flask import Flask, request, jsonify
from datetime import datetime
import os
import logging
import random
import time
from typing import Dict, Any, Optional
import json

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

BASE44_API_KEY = os.environ.get('BASE44_API_KEY')
BASE44_API_URL = os.environ.get('BASE44_API_URL', 'https://api.base44.com')

class Base44Client:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
    
    async def get_user_from_request(self, req) -> Optional[Dict[str, Any]]:
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/auth/me",
                headers={"Authorization": auth_header}
            ) as response:
                if response.status == 200:
                    return await response.json()
                return None
    
    async def create_payment(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/entities/Payment",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=payment_data
            ) as response:
                if response.status == 200:
                    return await response.json()
                return {}
    
    async def create_challenge(self, challenge_data: Dict[str, Any]) -> Dict[str, Any]:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/entities/Challenge",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=challenge_data
            ) as response:
                if response.status == 200:
                    return await response.json()
                return {}
    
    async def update_payment(self, payment_id: str, updates: Dict[str, Any]) -> bool:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.put(
                f"{self.base_url}/entities/Payment/{payment_id}",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=updates
            ) as response:
                return response.status == 200

base44_client = Base44Client(
    api_key=BASE44_API_KEY,
    base_url=BASE44_API_URL
)

@app.route('/process_payment', methods=['POST'])
async def process_payment():
    try:
        user = await base44_client.get_user_from_request(request)
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400

        plan_type = data.get('planType')
        payment_method = data.get('paymentMethod')
        
        if not plan_type or not payment_method:
            return jsonify({
                'error': 'planType and paymentMethod are required',
                'success': False
            }), 400

        # Pricing
        pricing = {
            'starter': 200,
            'pro': 500,
            'elite': 1000
        }

        amount = pricing.get(plan_type)
        if not amount:
            return jsonify({
                'error': 'Invalid plan type',
                'success': False
            }), 400

        # Simulate payment processing delay
        import asyncio
        await asyncio.sleep(2)

        # Generate transaction ID
        transaction_id = f"TXN-{int(time.time() * 1000)}-{random.randint(1000, 9999)}"

        # Create payment record
        payment = await base44_client.create_payment({
            'plan_type': plan_type,
            'amount': amount,
            'currency': 'DH',
            'payment_method': payment_method,
            'status': 'completed',
            'transaction_id': transaction_id
        })

        if not payment:
            return jsonify({
                'error': 'Failed to create payment record',
                'success': False
            }), 500

        # Determine starting balance based on plan
        balances = {
            'starter': 5000,
            'pro': 10000,
            'elite': 20000
        }

        starting_balance = balances.get(plan_type, 5000)

        # Create challenge
        challenge = await base44_client.create_challenge({
            'plan_type': plan_type,
            'starting_balance': starting_balance,
            'current_balance': starting_balance,
            'equity': starting_balance,
            'daily_start_balance': starting_balance,
            'daily_pnl': 0,
            'total_pnl': 0,
            'total_pnl_pct': 0,
            'daily_pnl_pct': 0,
            'max_daily_loss_pct': 5,
            'max_total_loss_pct': 10,
            'profit_target_pct': 10,
            'status': 'active',
            'total_trades': 0,
            'winning_trades': 0
        })

        if not challenge:
            return jsonify({
                'error': 'Failed to create challenge',
                'success': False
            }), 500

        # Link payment to challenge
        await base44_client.update_payment(payment['id'], {
            'challenge_id': challenge['id']
        })

        return jsonify({
            'success': True,
            'payment': payment,
            'challenge': challenge,
            'message': 'Payment processed successfully'
        })

    except Exception as error:
        logging.error(f'Payment processing error: {error}', exc_info=True)
        return jsonify({
            'error': str(error),
            'success': False
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3007))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
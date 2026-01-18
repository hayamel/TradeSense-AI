from flask import Flask, request, jsonify
from datetime import datetime
import os
import logging
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
    
    async def filter_challenges(self, filters: Dict[str, Any]) -> list:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/entities/Challenge/filter",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=filters
            ) as response:
                if response.status == 200:
                    return await response.json()
                return []
    
    async def create_trade(self, trade_data: Dict[str, Any]) -> Dict[str, Any]:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/entities/Trade",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=trade_data
            ) as response:
                if response.status == 200:
                    return await response.json()
                return {}
    
    async def update_challenge(self, challenge_id: str, updates: Dict[str, Any]) -> bool:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.put(
                f"{self.base_url}/entities/Challenge/{challenge_id}",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=updates
            ) as response:
                return response.status == 200
    
    async def invoke_function(self, function_name: str, data: Dict[str, Any]) -> Dict[str, Any]:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/functions/{function_name}",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=data
            ) as response:
                if response.status == 200:
                    return await response.json()
                return {}

base44_client = Base44Client(
    api_key=BASE44_API_KEY,
    base_url=BASE44_API_URL
)

@app.route('/execute_trade', methods=['POST'])
async def execute_trade():
    try:
        user = await base44_client.get_user_from_request(request)
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400

        # Validate inputs
        required_fields = ['challengeId', 'symbol', 'side', 'quantity', 'price']
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}',
                'success': False
            }), 400

        challenge_id = data['challengeId']
        symbol = data['symbol']
        side = data['side']
        quantity = float(data['quantity'])
        price = float(data['price'])

        # Get the challenge
        challenges = await base44_client.filter_challenges({
            'id': challenge_id,
            'created_by': user.get('email')
        })

        if not challenges:
            return jsonify({
                'error': 'Challenge not found',
                'success': False
            }), 404

        challenge = challenges[0]

        # Check if challenge is active
        if challenge.get('status') != 'active':
            return jsonify({
                'error': 'Challenge is not active',
                'success': False
            }), 400

        # Calculate trade cost
        trade_cost = quantity * price

        # Check if user has enough balance
        if trade_cost > challenge.get('current_balance', 0):
            return jsonify({
                'error': 'Insufficient balance',
                'success': False
            }), 400

        # Create the trade
        trade = await base44_client.create_trade({
            'challenge_id': challenge_id,
            'symbol': symbol,
            'side': side,
            'quantity': quantity,
            'entry_price': price,
            'status': 'open',
            'open_time': datetime.utcnow().isoformat()
        })

        # Update challenge balance
        new_balance = challenge.get('current_balance', 0) - trade_cost

        await base44_client.update_challenge(challenge_id, {
            'current_balance': new_balance,
            'equity': new_balance,
            'total_trades': (challenge.get('total_trades') or 0) + 1,
            'last_trade_date': datetime.utcnow().isoformat()
        })

        # Trigger challenge evaluation
        eval_response = await base44_client.invoke_function('evaluateChallenge', {
            'challengeId': challenge_id
        })

        return jsonify({
            'success': True,
            'trade': trade,
            'evaluation': eval_response.get('data', {})
        })

    except Exception as error:
        logging.error(f'Trade execution error: {error}', exc_info=True)
        return jsonify({
            'error': str(error),
            'success': False
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3002))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
from flask import Flask, request, jsonify
from datetime import datetime
import os
import logging
from typing import Dict, Any, Optional
from enum import Enum
import json

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

# Enums
class TradeStatus(str, Enum):
    OPEN = 'open'
    CLOSED = 'closed'

class TradeSide(str, Enum):
    BUY = 'buy'
    SELL = 'sell'

# Initialize Base44 client
# You'll need to install the Base44 Python SDK or use HTTP requests
BASE44_API_KEY = os.environ.get('BASE44_API_KEY')
BASE44_API_URL = os.environ.get('BASE44_API_URL', 'https://api.base44.com')

class Base44Client:
    """Base44 client wrapper - replace with actual SDK initialization"""
    
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        # Initialize actual Base44 SDK client here
        # Example: self.client = Base44Client(api_key=api_key, base_url=base_url)
    
    async def get_user_from_request(self, req) -> Optional[Dict[str, Any]]:
        """Get authenticated user from request"""
        # Replace with actual Base44 SDK authentication
        # Example: return await self.client.auth.me()
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        # Make API call to Base44 auth endpoint
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/auth/me",
                headers={"Authorization": auth_header}
            ) as response:
                if response.status == 200:
                    return await response.json()
                return None
    
    async def filter_trades(self, filters: Dict[str, Any]) -> list:
        """Filter trades using Base44 SDK"""
        # Replace with actual SDK call: base44.entities.Trade.filter(filters)
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/entities/Trade/filter",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=filters
            ) as response:
                if response.status == 200:
                    return await response.json()
                return []
    
    async def filter_challenges(self, filters: Dict[str, Any]) -> list:
        """Filter challenges using Base44 SDK"""
        # Replace with actual SDK call: base44.entities.Challenge.filter(filters)
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
    
    async def update_trade(self, trade_id: str, updates: Dict[str, Any]) -> bool:
        """Update trade using Base44 SDK"""
        # Replace with actual SDK call: base44.entities.Trade.update(trade_id, updates)
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.put(
                f"{self.base_url}/entities/Trade/{trade_id}",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=updates
            ) as response:
                return response.status == 200
    
    async def update_challenge(self, challenge_id: str, updates: Dict[str, Any]) -> bool:
        """Update challenge using Base44 SDK"""
        # Replace with actual SDK call: base44.entities.Challenge.update(challenge_id, updates)
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.put(
                f"{self.base_url}/entities/Challenge/{challenge_id}",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=updates
            ) as response:
                return response.status == 200
    
    async def invoke_function(self, function_name: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Invoke Base44 function"""
        # Replace with actual SDK call: base44.functions.invoke(function_name, data)
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

# Initialize Base44 client
base44_client = Base44Client(
    api_key=BASE44_API_KEY,
    base_url=BASE44_API_URL
)

@app.route('/close_trade', methods=['POST'])
async def close_trade():
    try:
        # Authentication
        user = await base44_client.get_user_from_request(request)
        if not user:
            return jsonify({
                'error': 'Unauthorized',
                'success': False
            }), 401

        # Parse request data
        data = request.get_json()
        if not data:
            return jsonify({
                'error': 'Invalid JSON data',
                'success': False
            }), 400

        trade_id = data.get('tradeId')
        exit_price = data.get('exitPrice')

        if not trade_id:
            return jsonify({
                'error': 'Missing tradeId',
                'success': False
            }), 400
        
        if exit_price is None:
            return jsonify({
                'error': 'Missing exitPrice',
                'success': False
            }), 400

        # Get the trade
        trades = await base44_client.filter_trades({'id': trade_id})
        
        if not trades:
            return jsonify({
                'error': 'Trade not found',
                'success': False
            }), 404

        trade = trades[0]

        # Check if trade is open
        if trade.get('status') != TradeStatus.OPEN:
            return jsonify({
                'error': 'Trade is already closed',
                'success': False
            }), 400

        # Get the challenge
        challenges = await base44_client.filter_challenges({
            'id': trade.get('challenge_id'),
            'created_by': user.get('email')
        })

        if not challenges:
            return jsonify({
                'error': 'Challenge not found',
                'success': False
            }), 404

        challenge = challenges[0]

        # Calculate P&L
        entry_price = trade.get('entry_price', 0)
        quantity = trade.get('quantity', 0)
        side = trade.get('side')
        
        if side == TradeSide.BUY:
            price_diff = exit_price - entry_price
        else:  # SELL
            price_diff = entry_price - exit_price
        
        pnl = price_diff * quantity
        pnl_pct = (price_diff / entry_price) * 100 if entry_price != 0 else 0

        # Close the trade
        close_time = datetime.utcnow().isoformat()
        
        trade_updates = {
            'exit_price': exit_price,
            'pnl': pnl,
            'pnl_pct': pnl_pct,
            'status': TradeStatus.CLOSED,
            'close_time': close_time
        }
        
        success = await base44_client.update_trade(trade_id, trade_updates)
        
        if not success:
            return jsonify({
                'error': 'Failed to update trade',
                'success': False
            }), 500

        # Update challenge
        trade_cost = quantity * entry_price
        current_balance = challenge.get('current_balance', 0)
        starting_balance = challenge.get('starting_balance', 0)
        total_pnl = challenge.get('total_pnl', 0) + pnl
        daily_start_balance = challenge.get('daily_start_balance', starting_balance)
        winning_trades = challenge.get('winning_trades', 0)
        
        new_balance = current_balance + trade_cost + pnl
        total_pnl_pct = (total_pnl / starting_balance) * 100 if starting_balance != 0 else 0
        
        # Update daily P&L
        daily_pnl = total_pnl - (challenge.get('total_pnl') or 0)
        daily_pnl_pct = (daily_pnl / daily_start_balance) * 100 if daily_start_balance != 0 else 0

        # Update winning trades count
        if pnl > 0:
            winning_trades += 1

        challenge_updates = {
            'current_balance': new_balance,
            'equity': new_balance,
            'total_pnl': total_pnl,
            'total_pnl_pct': total_pnl_pct,
            'daily_pnl': daily_pnl,
            'daily_pnl_pct': daily_pnl_pct,
            'winning_trades': winning_trades
        }
        
        success = await base44_client.update_challenge(
            trade.get('challenge_id'), 
            challenge_updates
        )
        
        if not success:
            return jsonify({
                'error': 'Failed to update challenge',
                'success': False
            }), 500

        # Trigger challenge evaluation
        eval_response = await base44_client.invoke_function('evaluateChallenge', {
            'challengeId': trade.get('challenge_id')
        })

        # Prepare response
        trade_response = {
            **trade,
            **trade_updates
        }

        return jsonify({
            'success': True,
            'trade': trade_response,
            'evaluation': eval_response.get('data', {})
        })

    except json.JSONDecodeError:
        return jsonify({
            'error': 'Invalid JSON in request body',
            'success': False
        }), 400
    except KeyError as e:
        return jsonify({
            'error': f'Missing required field: {str(e)}',
            'success': False
        }), 400
    except Exception as error:
        logging.error(f'Close trade error: {error}', exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'success': False
        }), 500

# Helper functions for P&L calculation
def calculate_pnl(entry_price: float, exit_price: float, quantity: float, side: str) -> Dict[str, float]:
    """Calculate profit and loss for a trade"""
    if side == TradeSide.BUY:
        price_diff = exit_price - entry_price
    else:
        price_diff = entry_price - exit_price
    
    pnl = price_diff * quantity
    pnl_pct = (price_diff / entry_price) * 100 if entry_price != 0 else 0
    
    return {'pnl': pnl, 'pnl_pct': pnl_pct}

def validate_trade_data(data: Dict[str, Any]) -> tuple[bool, str]:
    """Validate trade closure data"""
    if 'tradeId' not in data:
        return False, 'tradeId is required'
    if 'exitPrice' not in data:
        return False, 'exitPrice is required'
    
    try:
        exit_price = float(data['exitPrice'])
        if exit_price <= 0:
            return False, 'exitPrice must be positive'
    except (ValueError, TypeError):
        return False, 'exitPrice must be a valid number'
    
    return True, ''

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

if __name__ == '__main__':
    # Check for required environment variables
    if not BASE44_API_KEY:
        logging.warning("BASE44_API_KEY environment variable is not set")
    
    # Run Flask app
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
from flask import Flask, request, jsonify
import os
import logging
from typing import Dict, Any, Optional, List
import json

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

BASE44_API_KEY = os.environ.get('BASE44_API_KEY')
BASE44_API_URL = os.environ.get('BASE44_API_URL', 'https://api.base44.com')

# Test user data
USERS = [
    {
        "email": "youssef.alami@gmail.com",
        "name": "Youssef Alami",
        "challenge": {
            "plan_type": "elite",
            "starting_balance": 20000,
            "current_balance": 23200,
            "equity": 23200,
            "daily_start_balance": 22800,
            "daily_pnl": 400,
            "total_pnl": 3200,
            "total_pnl_pct": 16,
            "daily_pnl_pct": 1.75,
            "max_daily_loss_pct": 5,
            "max_total_loss_pct": 10,
            "profit_target_pct": 10,
            "status": "passed",
            "total_trades": 34,
            "winning_trades": 24
        }
    },
    {
        "email": "fatima.benali@gmail.com",
        "name": "Fatima Benali",
        "challenge": {
            "plan_type": "pro",
            "starting_balance": 10000,
            "current_balance": 11450,
            "equity": 11450,
            "daily_start_balance": 11200,
            "daily_pnl": 250,
            "total_pnl": 1450,
            "total_pnl_pct": 14.5,
            "daily_pnl_pct": 2.23,
            "max_daily_loss_pct": 5,
            "max_total_loss_pct": 10,
            "profit_target_pct": 10,
            "status": "passed",
            "total_trades": 28,
            "winning_trades": 19
        }
    },
    {
        "email": "omar.khalil@gmail.com",
        "name": "Omar Khalil",
        "challenge": {
            "plan_type": "starter",
            "starting_balance": 5000,
            "current_balance": 5620,
            "equity": 5620,
            "daily_start_balance": 5580,
            "daily_pnl": 40,
            "total_pnl": 620,
            "total_pnl_pct": 12.4,
            "daily_pnl_pct": 0.72,
            "max_daily_loss_pct": 5,
            "max_total_loss_pct": 10,
            "profit_target_pct": 10,
            "status": "passed",
            "total_trades": 22,
            "winning_trades": 16
        }
    },
    {
        "email": "amina.moussa@gmail.com",
        "name": "Amina Moussa",
        "challenge": {
            "plan_type": "pro",
            "starting_balance": 10000,
            "current_balance": 10850,
            "equity": 10850,
            "daily_start_balance": 10700,
            "daily_pnl": 150,
            "total_pnl": 850,
            "total_pnl_pct": 8.5,
            "daily_pnl_pct": 1.4,
            "max_daily_loss_pct": 5,
            "max_total_loss_pct": 10,
            "profit_target_pct": 10,
            "status": "active",
            "total_trades": 18,
            "winning_trades": 12
        }
    },
    {
        "email": "karim.tazi@gmail.com",
        "name": "Karim Tazi",
        "challenge": {
            "plan_type": "elite",
            "starting_balance": 20000,
            "current_balance": 21200,
            "equity": 21200,
            "daily_start_balance": 21000,
            "daily_pnl": 200,
            "total_pnl": 1200,
            "total_pnl_pct": 6,
            "daily_pnl_pct": 0.95,
            "max_daily_loss_pct": 5,
            "max_total_loss_pct": 10,
            "profit_target_pct": 10,
            "status": "active",
            "total_trades": 15,
            "winning_trades": 10
        }
    }
]

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
    
    async def filter_challenges(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
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
    
    async def delete_challenge(self, challenge_id: str) -> bool:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.delete(
                f"{self.base_url}/entities/Challenge/{challenge_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            ) as response:
                return response.status == 200
    
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

base44_client = Base44Client(
    api_key=BASE44_API_KEY,
    base_url=BASE44_API_URL
)

@app.route('/populate_leaderboard', methods=['POST'])
async def populate_leaderboard():
    try:
        user = await base44_client.get_user_from_request(request)
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403

        # Delete existing challenges created by these test users
        user_emails = [u['email'] for u in USERS]
        existing_challenges = await base44_client.filter_challenges({
            'created_by': {'$in': user_emails}
        })

        for challenge in existing_challenges:
            await base44_client.delete_challenge(challenge['id'])

        # Create new challenges with display names
        created_challenges = []
        for user_data in USERS:
            challenge_data = {
                **user_data['challenge'],
                'display_name': user_data['name']
            }
            challenge = await base44_client.create_challenge(challenge_data)
            if challenge:
                created_challenges.append(challenge)

        return jsonify({
            'success': True,
            'message': f'Created {len(created_challenges)} challenges',
            'challenges': created_challenges
        })

    except Exception as error:
        logging.error(f'Error populating leaderboard: {error}', exc_info=True)
        return jsonify({'error': str(error)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3006))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
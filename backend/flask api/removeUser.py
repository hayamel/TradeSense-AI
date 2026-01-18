from flask import Flask, request, jsonify
import os
import logging
from typing import Dict, Any, Optional, List
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
    
    async def filter_trades(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
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
    
    async def delete_trade(self, trade_id: str) -> bool:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.delete(
                f"{self.base_url}/entities/Trade/{trade_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            ) as response:
                return response.status == 200
    
    async def delete_challenge(self, challenge_id: str) -> bool:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.delete(
                f"{self.base_url}/entities/Challenge/{challenge_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            ) as response:
                return response.status == 200

base44_client = Base44Client(
    api_key=BASE44_API_KEY,
    base_url=BASE44_API_URL
)

@app.route('/remove_user', methods=['POST'])
async def remove_user():
    try:
        user = await base44_client.get_user_from_request(request)
        if not user or user.get('role') != 'admin':
            return jsonify({'error': 'Unauthorized: Admin access required'}), 403

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400

        user_email = data.get('userEmail')
        if not user_email:
            return jsonify({'error': 'User email is required'}), 400

        # Get all challenges for this user
        user_challenges = await base44_client.filter_challenges({'created_by': user_email})

        # Delete all trades associated with user's challenges
        deleted_trades = 0
        for challenge in user_challenges:
            trades = await base44_client.filter_trades({'challenge_id': challenge['id']})
            for trade in trades:
                await base44_client.delete_trade(trade['id'])
                deleted_trades += 1
            # Delete the challenge
            await base44_client.delete_challenge(challenge['id'])

        return jsonify({
            'success': True,
            'message': 'User and all associated data deleted successfully',
            'deletedChallenges': len(user_challenges),
            'deletedTrades': deleted_trades
        })

    except Exception as error:
        logging.error(f'Error removing user: {error}', exc_info=True)
        return jsonify({'error': str(error)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3008))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
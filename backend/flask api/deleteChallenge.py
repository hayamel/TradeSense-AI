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
    
    async def get_challenge(self, challenge_id: str) -> Optional[Dict[str, Any]]:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.base_url}/entities/Challenge/{challenge_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            ) as response:
                if response.status == 200:
                    return await response.json()
                return None
    
    async def delete_challenge(self, challenge_id: str) -> bool:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.delete(
                f"{self.base_url}/entities/Challenge/{challenge_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            ) as response:
                return response.status == 200
    
    async def filter_trades(self, filters: Dict[str, Any]) -> list:
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

base44_client = Base44Client(
    api_key=BASE44_API_KEY,
    base_url=BASE44_API_URL
)

@app.route('/delete_challenge', methods=['POST'])
async def delete_challenge():
    try:
        user = await base44_client.get_user_from_request(request)
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400

        challenge_id = data.get('challengeId')
        if not challenge_id:
            return jsonify({'error': 'Challenge ID is required'}), 400

        challenge = await base44_client.get_challenge(challenge_id)
        if not challenge:
            return jsonify({'error': 'Challenge not found'}), 404

        # Delete associated trades
        trades = await base44_client.filter_trades({'challenge_id': challenge_id})
        for trade in trades:
            await base44_client.delete_trade(trade['id'])

        # Delete the challenge
        await base44_client.delete_challenge(challenge_id)

        return jsonify({
            'success': True,
            'message': 'Challenge and associated trades have been deleted successfully'
        })

    except Exception as error:
        logging.error(f'Error deleting challenge: {error}', exc_info=True)
        return jsonify({'error': str(error)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3000))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
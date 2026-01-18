from flask import Flask, request, jsonify
from datetime import datetime
import os
import logging
from typing import Dict, Any
import json

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

BASE44_API_KEY = os.environ.get('BASE44_API_KEY')
BASE44_API_URL = os.environ.get('BASE44_API_URL', 'https://api.base44.com')

class Base44Client:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
    
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
    
    async def update_challenge(self, challenge_id: str, updates: Dict[str, Any]) -> bool:
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.put(
                f"{self.base_url}/entities/Challenge/{challenge_id}",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=updates
            ) as response:
                return response.status == 200

base44_client = Base44Client(
    api_key=BASE44_API_KEY,
    base_url=BASE44_API_URL
)

@app.route('/evaluate_challenge', methods=['POST'])
async def evaluate_challenge():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400

        challenge_id = data.get('challengeId')
        if not challenge_id:
            return jsonify({'error': 'Challenge ID is required'}), 400

        # Get the challenge
        challenges = await base44_client.filter_challenges({'id': challenge_id})
        if not challenges:
            return jsonify({
                'error': 'Challenge not found',
                'success': False
            }), 404

        challenge = challenges[0]

        # Skip evaluation if already passed or failed
        if challenge.get('status') != 'active':
            return jsonify({
                'success': True,
                'status': challenge.get('status'),
                'message': f"Challenge already {challenge.get('status')}"
            })

        # Calculate metrics
        total_pnl_pct = challenge.get('total_pnl_pct', 0) or 0
        daily_pnl_pct = challenge.get('daily_pnl_pct', 0) or 0
        max_daily_loss_pct = challenge.get('max_daily_loss_pct', 5)
        max_total_loss_pct = challenge.get('max_total_loss_pct', 10)
        profit_target_pct = challenge.get('profit_target_pct', 10)

        new_status = 'active'
        failure_reason = None

        # Rule 1: Check Max Daily Loss (5%)
        if daily_pnl_pct <= -max_daily_loss_pct:
            new_status = 'failed'
            failure_reason = f"Max Daily Loss Exceeded: {daily_pnl_pct:.2f}% (Limit: -{max_daily_loss_pct}%)"

        # Rule 2: Check Max Total Loss (10%)
        if total_pnl_pct <= -max_total_loss_pct:
            new_status = 'failed'
            failure_reason = f"Max Total Loss Exceeded: {total_pnl_pct:.2f}% (Limit: -{max_total_loss_pct}%)"

        # Rule 3: Check Profit Target (10%)
        if total_pnl_pct >= profit_target_pct:
            new_status = 'passed'
            failure_reason = None

        # Update challenge if status changed
        if new_status != 'active':
            await base44_client.update_challenge(challenge_id, {
                'status': new_status,
                'failure_reason': failure_reason
            })

        return jsonify({
            'success': True,
            'challengeId': challenge_id,
            'status': new_status,
            'metrics': {
                'totalPnlPct': total_pnl_pct,
                'dailyPnlPct': daily_pnl_pct,
                'currentBalance': challenge.get('current_balance'),
                'startingBalance': challenge.get('starting_balance')
            },
            'failureReason': failure_reason,
            'rulesViolated': new_status == 'failed',
            'targetAchieved': new_status == 'passed'
        })

    except Exception as error:
        logging.error(f'Challenge evaluation error: {error}', exc_info=True)
        return jsonify({
            'error': str(error),
            'success': False
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
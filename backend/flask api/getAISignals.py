from flask import Flask, request, jsonify
import os
import logging
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
    
    async def invoke_llm(self, prompt: str, schema: Dict[str, Any] = None) -> Dict[str, Any]:
        import aiohttp
        payload = {'prompt': prompt}
        
        if schema:
            payload['response_json_schema'] = schema
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/integrations/Core/InvokeLLM",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json=payload
            ) as response:
                if response.status == 200:
                    return await response.json()
                return {}

base44_client = Base44Client(
    api_key=BASE44_API_KEY,
    base_url=BASE44_API_URL
)

@app.route('/get_ai_signals', methods=['POST'])
async def get_ai_signals():
    try:
        user = await base44_client.get_user_from_request(request)
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400

        symbol = data.get('symbol')
        market_data = data.get('marketData')
        
        if not symbol or not market_data:
            return jsonify({'error': 'Symbol and marketData are required'}), 400

        # Use AI to generate trading signals
        prompt = f"""You are an expert trading AI analyzing {symbol}.

Current Market Data:
- Current Price: {market_data.get('price', 'N/A')}
- Change: {market_data.get('change', 'N/A')} ({market_data.get('changePercent', 0):.2f}%)
- Volume: {market_data.get('volume', 'N/A')}

Based on this data, provide:
1. Signal recommendation (BUY, SELL, or HOLD)
2. Confidence level (0-100%)
3. Risk level (LOW, MEDIUM, HIGH)
4. Brief reasoning (max 2 sentences)
5. Suggested stop loss percentage
6. Suggested take profit percentage

Respond in JSON format only."""

        schema = {
            "type": "object",
            "properties": {
                "signal": {"type": "string", "enum": ["BUY", "SELL", "HOLD"]},
                "confidence": {"type": "number"},
                "risk": {"type": "string", "enum": ["LOW", "MEDIUM", "HIGH"]},
                "reasoning": {"type": "string"},
                "stopLoss": {"type": "number"},
                "takeProfit": {"type": "number"}
            }
        }

        ai_response = await base44_client.invoke_llm(prompt=prompt, schema=schema)

        return jsonify({
            'success': True,
            'symbol': symbol,
            'signal': ai_response,
            'timestamp': int(time.time() * 1000)
        })

    except Exception as error:
        logging.error(f'AI signals error: {error}', exc_info=True)
        return jsonify({
            'error': str(error),
            'success': False
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3005))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
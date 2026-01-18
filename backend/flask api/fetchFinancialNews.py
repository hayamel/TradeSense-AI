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
    
    async def invoke_llm(self, prompt: str, add_context: bool = False, schema: Dict[str, Any] = None) -> Dict[str, Any]:
        import aiohttp
        payload = {
            'prompt': prompt,
            'add_context_from_internet': add_context
        }
        
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

@app.route('/fetch_financial_news', methods=['POST'])
async def fetch_financial_news():
    try:
        user = await base44_client.get_user_from_request(request)
        if not user:
            return jsonify({'error': 'Unauthorized'}), 401

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Invalid JSON data'}), 400

        category = data.get('category', '')

        # Generate AI-powered financial news based on category
        if category:
            prompt = f"""Generate 6 recent financial news articles about {category}. 
            For each article provide: 
            - title
            - summary (2-3 sentences)
            - category
            - timeAgo (like "2 hours ago")
            - sentiment (positive/negative/neutral)
            - url (use # as placeholder)
            """
        else:
            prompt = """Generate 9 recent financial news articles covering crypto, stocks, forex, and commodities.
            For each article provide:
            - title
            - summary (2-3 sentences)
            - category
            - timeAgo (like "2 hours ago")
            - sentiment (positive/negative/neutral)
            - url (use # as placeholder)
            """

        schema = {
            "type": "object",
            "properties": {
                "news": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string"},
                            "summary": {"type": "string"},
                            "category": {"type": "string"},
                            "timeAgo": {"type": "string"},
                            "sentiment": {"type": "string", "enum": ["positive", "negative", "neutral"]},
                            "url": {"type": "string"}
                        },
                        "required": ["title", "summary", "category", "timeAgo", "sentiment"]
                    }
                }
            },
            "required": ["news"]
        }

        news_data = await base44_client.invoke_llm(
            prompt=prompt,
            add_context=True,
            schema=schema
        )

        return jsonify({
            'success': True,
            'news': news_data.get('news', [])
        })

    except Exception as error:
        logging.error(f'Error fetching news: {error}', exc_info=True)
        return jsonify({
            'success': False,
            'error': str(error)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3003))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False').lower() == 'true')
from emergentintegrations.llm.chat import LlmChat, UserMessage
from core.config import settings
from typing import Dict, Any

class GeminiService:
    """Gemini AI voice assistant for astrology insights"""
    
    def __init__(self):
        self.chat = None
    
    async def initialize(self):
        """Initialize Gemini chat"""
        if not self.chat:
            self.chat = LlmChat(
                api_key=settings.emergent_llm_key,
                session_id="zenith_oracle_assistant",
                system_message="You are an elite astrology advisor for Zenith Oracle. Provide strategic, dominant insights based on astrological data. Your tone is confident, witty, and actionable. You help users understand their cosmic advantages and strategic opportunities."
            ).with_model("gemini", "gemini-3-flash")
    
    async def get_chart_insights(self, chart_data: Dict[str, Any], user_question: str = None) -> str:
        """Get AI insights on astrological chart"""
        await self.initialize()
        
        prompt = f"""Analyze this astrological chart data and provide strategic insights:

Chart Data:
- Ascendant: {chart_data.get('ascendant_sign', 'N/A')}
- Sun Sign: {next((p['sign'] for p in chart_data.get('planets', []) if p['name'] == 'Sun'), 'N/A')}
- Moon Sign: {next((p['sign'] for p in chart_data.get('planets', []) if p['name'] == 'Moon'), 'N/A')}
- Current Dasha: {chart_data.get('dasha_lord', 'N/A')}
- Power Score: {chart_data.get('power_score', 0)}/100

{f'User Question: {user_question}' if user_question else 'Provide a strategic overview.'}

Give a concise, actionable response in 2-3 sentences."""
        
        try:
            response = await self.chat.send_message(UserMessage(text=prompt))
            return response
        except Exception as e:
            return f"Strategic Analysis: Your current cosmic configuration shows {chart_data.get('power_score', 50)}% dominance. Focus on leveraging your {chart_data.get('dasha_lord', 'planetary')} period for maximum impact."
    
    async def get_daily_briefing(self, user_profile: Dict[str, Any]) -> str:
        """Generate alpha daily briefing"""
        await self.initialize()
        
        prompt = f"""Generate a 60-second 'Alpha Daily Briefing' for this user:

Name: {user_profile.get('name', 'Elite User')}
Power Score: {user_profile.get('power_score', 50)}/100
Current Transit: {user_profile.get('current_transit', 'Favorable')}

Provide 3 tactical moves for today in a confident, strategic tone. Keep it under 100 words."""
        
        try:
            response = await self.chat.send_message(UserMessage(text=prompt))
            return response
        except Exception as e:
            return f"Alpha Brief: Your power score is at {user_profile.get('power_score', 50)}%. Today: 1) Assert leadership early, 2) Make financial decisions before noon, 3) Strategic partnerships are favored. Dominate your domain."
    
    async def answer_question(self, question: str, context: str = "") -> str:
        """Answer user question about their chart"""
        await self.initialize()
        
        prompt = f"{context}\n\nUser Question: {question}\n\nProvide a strategic, insightful answer."
        
        try:
            response = await self.chat.send_message(UserMessage(text=prompt))
            return response
        except Exception as e:
            return "The cosmic intelligence suggests a strategic approach. Consider your current planetary transits and take calculated action."
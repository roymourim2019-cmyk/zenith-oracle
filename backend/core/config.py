import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # MongoDB
    mongo_url: str = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
    db_name: str = os.getenv('DB_NAME', 'zenith_oracle')
    
    # Redis
    redis_url: str = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
    
    # Razorpay (Test Keys)
    razorpay_key_id: str = os.getenv('RAZORPAY_KEY_ID', 'rzp_test_1DP5mmOlF5G5ag')
    razorpay_key_secret: str = os.getenv('RAZORPAY_KEY_SECRET', '')
    
    # Emergent LLM Key (for Gemini)
    emergent_llm_key: str = os.getenv('EMERGENT_LLM_KEY', '')
    
    # CORS
    cors_origins: str = os.getenv('CORS_ORIGINS', '*')
    
    class Config:
        env_file = '.env'

settings = Settings()
from redis.asyncio import Redis, ConnectionPool
from typing import Optional
import os

class RedisClient:
    """Singleton Redis client with connection pooling"""
    _instance: Optional["RedisClient"] = None
    _pool: Optional[ConnectionPool] = None
    _client: Optional[Redis] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def connect(self) -> None:
        """Initialize Redis connection pool"""
        if self._pool is None:
            redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
            try:
                self._pool = ConnectionPool.from_url(
                    redis_url,
                    max_connections=50,
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_keepalive=True
                )
                self._client = Redis(connection_pool=self._pool)
                await self._client.ping()
                print("✓ Redis client connected")
            except Exception as e:
                print(f"⚠ Redis connection failed (running without cache): {e}")
                self._client = None
                self._pool = None
    
    async def disconnect(self) -> None:
        """Close Redis connections"""
        if self._client:
            await self._client.close()
        if self._pool:
            await self._pool.disconnect()
        self._client = None
        self._pool = None
        print("✓ Redis client disconnected")
    
    def get_client(self) -> Redis:
        """Get the Redis client instance"""
        if self._client is None:
            return None
        return self._client

redis_client = RedisClient()
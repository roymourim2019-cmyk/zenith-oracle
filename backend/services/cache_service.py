import json
import asyncio
from typing import Any, Optional, Callable, TypeVar
from redis.asyncio import Redis

T = TypeVar('T')

class CacheService:
    """Advanced caching service with TTL and versioning"""
    
    def __init__(self, redis: Redis, prefix: str = "zenith"):
        self.redis = redis
        self.prefix = prefix
        self.version = 1
    
    def _key(self, name: str) -> str:
        """Build cache key with prefix"""
        return f"{self.prefix}:v{self.version}:{name}"
    
    async def get(self, key: str) -> Optional[Any]:
        """Retrieve value from cache"""
        if not self.redis:
            return None
        try:
            data = await self.redis.get(self._key(key))
            if data:
                return json.loads(data) if isinstance(data, str) else data
        except json.JSONDecodeError:
            await self.delete(key)
        except Exception as e:
            print(f"Cache get error for {key}: {e}")
        return None
    
    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Store value in cache with TTL"""
        if not self.redis:
            return False
        try:
            serialized = json.dumps(value, default=str)
            await self.redis.setex(self._key(key), ttl, serialized)
            return True
        except Exception as e:
            print(f"Cache set error for {key}: {e}")
            return False
    
    async def get_or_set(self, key: str, callback: Callable[[], T], ttl: int = 300) -> T:
        """Get from cache or execute callback and cache result"""
        cached = await self.get(key)
        if cached is not None:
            return cached
        
        if asyncio.iscoroutinefunction(callback):
            result = await callback()
        else:
            result = callback()
        
        await self.set(key, result, ttl)
        return result
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        try:
            result = await self.redis.delete(self._key(key))
            return result > 0
        except Exception as e:
            print(f"Cache delete error for {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists"""
        try:
            return await self.redis.exists(self._key(key)) > 0
        except Exception as e:
            print(f"Cache exists error for {key}: {e}")
            return False
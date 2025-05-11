import uuid
from src.config import config
from src.utils.errors import SessionNotFoundError
import json
from typing import List
from src.models.chat import ChatMessage

class SessionService:
    def __init__(self):
        self.redis_client = config.redis_client
        self.ttl_seconds = 3600  # 1 hour TTL
    
    def generate_session_token(self) -> str:
        """Generate a new session token and initialize empty history."""
        token = str(uuid.uuid4())
        self.redis_client.setex(
            f"session:{token}:history",
            self.ttl_seconds,
            json.dumps([])
        )
        return token
    
    def get_session_history(self, session_token: str) -> List[ChatMessage]:
        """Retrieve chat history for a session."""
        history = self.redis_client.get(f"session:{session_token}:history")
        if not history:
            raise SessionNotFoundError("Session not found or expired")
        return [ChatMessage(**msg) for msg in json.loads(history)]
    
    def append_to_history(self, session_token: str, message: ChatMessage) -> None:
        """Append a message to the session history and refresh TTL."""
        history = self.redis_client.get(f"session:{session_token}:history")
        if not history:
            raise SessionNotFoundError("Session not found or expired")
        history_list = json.loads(history)  # List of dicts
        history_list.append(message.dict())  # Append new message as dict
        self.redis_client.setex(
            f"session:{session_token}:history",
            self.ttl_seconds,
            json.dumps(history_list)
        )
    
    def clear_session(self, session_token: str) -> None:
        """Delete a session's history."""
        key = f"session:{session_token}:history"
        if not self.redis_client.exists(key):
            raise SessionNotFoundError("Session not found or expired")
        self.redis_client.delete(key)
    
    def validate_session(self, session_token: str) -> bool:
        """Validate if a session token exists."""
        return bool(self.redis_client.exists(f"session:{session_token}:history"))

# Singleton service instance
session_service = SessionService()
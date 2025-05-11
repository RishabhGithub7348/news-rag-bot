from pydantic import BaseModel
from typing import Optional

class QueryRequest(BaseModel):
    query: str
    session_token: Optional[str] = None

class SessionResponse(BaseModel):
    session_token: str
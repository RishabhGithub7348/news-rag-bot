from fastapi import APIRouter, HTTPException
from src.services.session import session_service
from src.models.session import SessionResponse
from src.utils.errors import SessionNotFoundError

router = APIRouter()

@router.post("/start", response_model=SessionResponse)
async def start_session():
    """Generate a new session token."""
    session_token = session_service.generate_session_token()
    return SessionResponse(session_token=session_token)

@router.get("/history/{session_token}")
async def get_session_history(session_token: str):
    """Retrieve chat history for a session."""
    try:
        history = session_service.get_session_history(session_token)
        return {"history": history}
    except SessionNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/clear/{session_token}")
async def clear_session(session_token: str):
    """Clear a session's history."""
    try:
        session_service.clear_session(session_token)
        return {"message": "Session cleared successfully"}
    except SessionNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
from fastapi import APIRouter, WebSocket, HTTPException, Query
from src.models.session import QueryRequest
from src.services.rag import process_query
from src.services.session import session_service
from src.services.websocket import handle_websocket
from src.models.chat import ChatMessage

router = APIRouter()

@router.post("/query")
async def query(request: QueryRequest):
    """Process a query, generating a session token if none provided."""
    if not request.session_token:
        request.session_token = session_service.generate_session_token()
    
    if not session_service.validate_session(request.session_token):
        raise HTTPException(status_code=401, detail="Invalid or expired session token")
    
    # Append user message to history
    user_message = ChatMessage(role="user", content=request.query)
    session_service.append_to_history(request.session_token, user_message)
    
    # Process query
    answer = await process_query(request.query, request.session_token)
    
    # Append bot response to history
    bot_message = ChatMessage(role="bot", content=answer)
    session_service.append_to_history(request.session_token, bot_message)
    
    return {"session_token": request.session_token, "answer": answer}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    """WebSocket endpoint for real-time chat."""
    await handle_websocket(websocket, token)
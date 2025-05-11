from fastapi import WebSocket, WebSocketDisconnect
from src.services.session import session_service
from src.services.rag import process_query
from src.utils.logger import logger
from src.models.chat import ChatMessage
import json

async def handle_websocket(websocket: WebSocket, session_token: str):
    """Handle WebSocket connection for real-time chat."""
    # Validate session token
    if not session_service.validate_session(session_token):
        await websocket.close(code=1008, reason="Invalid or expired session token")
        return
    
    await websocket.accept()
    try:
        while True:
            query = await websocket.receive_text()
            # Append user message to history
            user_message = ChatMessage(role="user", content=query)
            session_service.append_to_history(session_token, user_message)
            
            # Process query with session token
            answer = await process_query(query, session_token)
            
            # Append bot response to history
            bot_message = ChatMessage(role="bot", content=answer)
            session_service.append_to_history(session_token, bot_message)
            
            # Send response as JSON
            await websocket.send_json(bot_message.dict())
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_token}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        bot_message = ChatMessage(role="bot", content="An error occurred")
        await websocket.send_json(bot_message.dict())
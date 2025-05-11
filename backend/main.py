from fastapi import FastAPI
from src.routes import session, chat
from fastapi.middleware.cors import CORSMiddleware
from src.services.rag import ingest_news_articles
import logging
from contextlib import asynccontextmanager

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define lifespan handler for startup and shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    logger.info("Starting up FastAPI app...")
    try:
        await ingest_news_articles()
        logger.info("News articles ingested successfully")
    except Exception as e:
        logger.error(f"Error during startup: {e}")
    
    yield  # Application runs here
    
    # Shutdown logic
    logger.info("Shutting down FastAPI app...")
    logger.info("Shutdown complete.")

# Initialize FastAPI app with lifespan
app = FastAPI(title="News Chatbot Backend", lifespan=lifespan)

# Include routers
app.include_router(session.router, prefix="/session", tags=["session"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])

# Root endpoint
@app.get("/")
async def root():
    return {"message": "News Chatbot Backend is running!"}
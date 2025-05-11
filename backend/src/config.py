from dotenv import load_dotenv
import os
import redis
from langchain_community.vectorstores import TimescaleVector
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Load environment variables
load_dotenv()

# Configuration
class Config:
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    REDIS_URL = os.getenv("REDIS_URL")
    RSS_FEED_URL = os.getenv("RSS_FEED_URL", "http://feeds.bbci.co.uk/news/rss.xml")
    TIMESCALE_CONNECTION_STRING = os.getenv("TIMESCALE_CONNECTION_STRING")
    
    # Redis client
    redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
    
    # LangChain components
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=GOOGLE_API_KEY
    )
    
    vector_store = TimescaleVector(
        collection_name="news_articles",
        embedding=embeddings,
        service_url=TIMESCALE_CONNECTION_STRING
    )
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-preview-04-17",
        google_api_key=GOOGLE_API_KEY
    )
    
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=100,
        length_function=len
    )

# Singleton config instance
config = Config()
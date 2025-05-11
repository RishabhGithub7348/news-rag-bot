import feedparser
from langchain_core.documents import Document
from src.config import config
from src.utils.logger import logger
from langchain.chains import RetrievalQA
from typing import List
import psycopg2
import redis
import json

redis_client = redis.Redis.from_url(config.REDIS_URL, decode_responses=True)

async def ingest_news_articles():
    """Ingest news articles, generate embeddings, and store in Timescale Vector."""
    try:
        # Parse RSS feed
        feed = feedparser.parse(config.RSS_FEED_URL)
        articles = feed.entries[:50]  # Limit to 50 articles
        
        # Convert to LangChain Documents
        documents = [
            Document(
                page_content=article.get('summary', article.get('description', '')),
                metadata={
                    "title": article.title,
                    "link": article.link
                }
            )
            for article in articles
            if article.get('summary') or article.get('description')
        ]
        
        # Split documents
        split_docs = config.text_splitter.split_documents(documents)
        
        # Drop existing collection to reset dimensions
        conn = psycopg2.connect(config.TIMESCALE_CONNECTION_STRING)
        cursor = conn.cursor()
        cursor.execute("DROP TABLE IF EXISTS news_articles CASCADE")
        conn.commit()
        cursor.close()
        conn.close()
        
        # Store in Timescale Vector
        config.vector_store.from_documents(
            documents=split_docs,
            embedding=config.embeddings,
            collection_name="news_articles",
            service_url=config.TIMESCALE_CONNECTION_STRING
        )
        
        logger.info(f"Ingested and embedded {len(split_docs)} document chunks")
    except Exception as e:
        logger.error(f"Error ingesting articles: {e}")
        raise

async def process_query(query: str, session_token: str) -> str:
    """Process a query by retrieving relevant context and generating a response with Gemini, maintaining conversation history."""
    try:
        # Retrieve conversation history from Redis
        history_key = f"session:{session_token}:history"
        history_raw = redis_client.get(history_key)
        history = json.loads(history_raw) if history_raw else []
        
        # Log the retrieved history for debugging
        logger.info(f"Retrieved history for session {session_token}: {history}")
        
        # Format conversation history as a dialogue
        history_text = ""
        for msg in history[-5:]:  # Limit to last 5 messages to avoid token overflow
            role = "User" if msg["role"] == "user" else "Bot"
            history_text += f"{role}: {msg['content']}\n"
        if not history_text.strip():
            history_text = "No previous conversation history."
        
        # Determine if the query is news-related or conversational
        news_keywords = ["news", "headlines", "latest", "update", "current events"]
        is_news_query = any(keyword in query.lower() for keyword in news_keywords)
        
        # Set up retriever (retrieve fewer documents for non-news queries)
        k = 5 if is_news_query else 2  # Fewer documents for conversational queries
        retriever = config.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": k}
        )
        
        # Retrieve relevant documents
        docs = retriever.invoke(query)
        
        # Log retrieved documents for debugging
        logger.info(f"Retrieved {len(docs)} documents for query: {query}")
        for i, doc in enumerate(docs):
            logger.info(f"Document {i+1}: Title: {doc.metadata.get('title', 'N/A')}, Content: {doc.page_content[:100]}...")
        
        # Format the retrieved context
        context = "\n\n".join(
            f"Title: {doc.metadata.get('title', 'N/A')}\nLink: {doc.metadata.get('link', 'N/A')}\nContent: {doc.page_content}"
            for doc in docs
        )
        if not context.strip():
            context = "No relevant context found."
        
        # Create a custom prompt for Gemini with history
        prompt = (
            "You are a helpful assistant maintaining a coherent conversation and providing the latest news updates when requested, using the conversation history and provided news articles. "
            "Use the conversation history to maintain context and ensure coherent responses. "
            "Prioritize the conversation history for personal or conversational queries (e.g., 'What’s my name?', 'Tell me more'). "
            "For such queries, directly reference the history to provide a relevant response (e.g., if asked 'What’s my name?', look for the name in the history and respond with 'Your name is [name].'). "
            "For queries about recent news (e.g., containing keywords like 'news', 'headlines', 'latest'), respond with: 'Here are some of the top news headlines: * [Headline 1] * [Headline 2] * [Headline 3]...' "
            "Ensure all headlines are in a single line, separated by a space after each '*'. "
            "Focus on recent, geopolitically significant news (e.g., involving countries like India, Pakistan, Russia, Ukraine) and avoid outdated or irrelevant topics (e.g., royal funding from years ago). "
            "Generalize specific names where appropriate (e.g., use 'The US president' instead of naming the president, 'another nation' instead of naming a specific country unless necessary). "
            "If the history or context is insufficient to provide a relevant answer, say so and provide a general answer if possible.\n\n"
            "Conversation History:\n"
            f"{history_text}\n\n"
            "Context from News Articles:\n"
            f"{context}\n\n"
            "User Query:\n"
            f"{query}\n\n"
            "Answer:"
        )
        
        # Generate response using Gemini model directly
        response = config.llm.invoke(prompt)
        
        # Extract the text from the response (Gemini returns an AIMessage object)
        answer = response.content if hasattr(response, "content") else str(response)
        
        return answer
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        return "Sorry, an error occurred while processing your query."
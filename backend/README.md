# News Chatbot Backend (FastAPI)

This is the backend for the News Chatbot application, built with **FastAPI**, **Python**, and **TimescaleDB**. It provides APIs to start chat sessions, process user queries, and deliver real-time responses via WebSocket. The backend ingests news articles from an RSS feed, stores them in TimescaleDB with embeddings, and uses Redis to maintain conversation history. Responses are generated using Google’s Gemini model via LangChain.

## Features

- Start chat sessions and generate unique session tokens.
- Ingest news articles from an RSS feed and store them in TimescaleDB with embeddings.
- Process user queries with context from news articles and conversation history.
- Deliver real-time responses via WebSocket.
- Maintain conversation history in Redis.
- Optimized ingestion: skips re-ingestion if articles are recent (within 1 hour).

## Prerequisites

- **Python** (v3.10 or later)
- **pip** (v22 or later)
- **PostgreSQL** with **TimescaleDB** extension
- **Redis** (v7 or later)
- A **Google API Key** for Gemini model access

## Project Structure

```
rag-backend/
├── app/                    # Main application code
│   ├── main.py             # FastAPI app setup with lifespan handler
│   ├── config.py           # Configuration (e.g., vector store, embeddings)
│   ├── routes/             # API routes
│   │   ├── session.py      # Session management endpoints
│   │   └── chat.py         # Chat and WebSocket endpoints
│   ├── services/           # Business logic
│   │   └── rag.py          # News ingestion and query processing
│   └── utils/              # Utilities
│       └── logger.py       # Logging setup
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables
└── README.md               # This file
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rag-backend
```

### 2. Set Up a Virtual Environment

Create and activate a virtual environment:

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

#### Key Dependencies

- `fastapi==0.115.0`: Framework for building the API.
- `uvicorn==0.23.1`: ASGI server to run FastAPI.
- `redis==5.0.8`: For storing conversation history.
- `psycopg2-binary==2.9.9`: For connecting to TimescaleDB.
- `langchain==0.2.16` and related: For document processing and Gemini model integration.
- See `requirements.txt` for the full list.

### 4. Install and Configure TimescaleDB

TimescaleDB is used to store news article embeddings. Install and set it up:

#### Install TimescaleDB

- **Ubuntu/Debian**:

  ```bash
  sudo apt update
  sudo apt install timescaledb-postgresql-14
  sudo timescaledb-tune
  sudo service postgresql restart
  ```

- **macOS (via Homebrew)**:

  ```bash
  brew install timescaledb
  brew services restart postgresql
  ```

- For other systems, refer to the [TimescaleDB installation guide](https://docs.timescale.com/install/latest/).

#### Create a Database

```bash
psql -U postgres
```

```sql
CREATE DATABASE chatbot_db;
\c chatbot_db
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
\q
```

### 5. Install and Configure Redis

Redis is used for conversation history.

#### Install Redis

- **Ubuntu/Debian**:

  ```bash
  sudo apt install redis-server
  sudo service redis-server start
  ```

- **macOS (via Homebrew)**:

  ```bash
  brew install redis
  brew services start redis
  ```

#### Enable Persistence

Ensure Redis persists data:

```bash
redis-cli
CONFIG SET appendonly yes
CONFIG SET save "900 1 300 10 60 10000"
exit
```

### 6. Configure Environment Variables

Create a `.env` file in the root directory:

```
RSS_FEED_URL=http://feeds.bbci.co.uk/news/rss.xml
TIMESCALE_CONNECTION_STRING=postgres://postgres:your_password@localhost:5432/chatbot_db
GOOGLE_API_KEY=your-google-api-key
REDIS_URL=redis://localhost:6379/0
```

- `RSS_FEED_URL`: RSS feed for news articles.
- `TIMESCALE_CONNECTION_STRING`: Connection string for TimescaleDB.
- `GOOGLE_API_KEY`: API key for Google Gemini model.
- `REDIS_URL`: URL for Redis.

### 7. Run the Backend

Start the FastAPI server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

- The server will start at `http://localhost:8000`.
- On startup, it ingests news articles into TimescaleDB (skips if recent).

## Usage

1. **Start a Session**:
   - Endpoint: `POST /session/start`
   - Response: `{ "session_token": "uuid" }`
   - The frontend uses this token to manage sessions.

2. **Send Messages**:
   - WebSocket: `ws://localhost:8000/chat/websocket?token=<session_token>`
   - Send messages as plain text; receive responses as JSON (e.g., `{ "role": "bot", "content": "Your name is Rishabh." }`).

3. **Fetch History**:
   - Endpoint: `GET /session/history?token=<session_token>`
   - Returns the conversation history for the session.

4. **Root Endpoint**:
   - `GET /`: Returns `{ "message": "News Chatbot Backend is running!" }`.

## Development Notes

- **FastAPI Lifespan**:
  - Uses the modern `lifespan` handler for startup/shutdown (`app/main.py`).
  - On startup, ingests news articles; on shutdown, logs the event.
- **TimescaleDB**:
  - Stores news articles in the `news_articles` table with embeddings.
  - Skips re-ingestion if the last ingestion was within 1 hour.
- **Redis**:
  - Stores conversation history as `session:<token>:history`.
- **LangChain**:
  - Uses LangChain for document splitting, embedding, and retrieval.
  - Integrates with Google Gemini for response generation.

## Troubleshooting

- **Timescale Connection Error**:
  - Log: `ERROR: Error ingesting articles: could not connect to server`
  - Fix: Ensure PostgreSQL/TimescaleDB is running (`sudo service postgresql status`) and `TIMESCALE_CONNECTION_STRING` is correct.
- **Redis Connection Error**:
  - Log: `ERROR: Error processing query: Connection refused`
  - Fix: Ensure Redis is running (`redis-cli ping`) and `REDIS_URL` is correct.
- **Gemini API Error**:
  - Log: `ERROR: Error processing query: Invalid API key`
  - Fix: Verify `GOOGLE_API_KEY` in `.env`.
- **Ingestion Skipped Incorrectly**:
  - Log: `INFO: News articles are up-to-date`
  - Fix: Check the `ingested_at` timestamp in the `news_articles` table (`SELECT MAX(metadata->>'ingested_at') FROM news_articles;`).

## Deployment

To deploy to a hosting service like Render:

1. Push code to a GitHub repository.
2. Create a new Web Service on Render.
3. Set environment variables in Render:
   - `RSS_FEED_URL`, `TIMESCALE_CONNECTION_STRING`, `GOOGLE_API_KEY`, `REDIS_URL`
4. Set the start command:

   ```
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

5. Deploy the app and access it at the Render-provided URL.

#### Database Setup on Render

- Use Render’s PostgreSQL service with TimescaleDB enabled.
- Update `TIMESCALE_CONNECTION_STRING` with the Render database URL.
- Use Render’s Redis service for `REDIS_URL`.

## Contributing

- Create a branch: `git checkout -b feature-name`.
- Make changes and test: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
- Commit: `git commit -m "Add feature-name"`.
- Push: `git push origin feature-name`.
- Open a pull request on GitHub.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

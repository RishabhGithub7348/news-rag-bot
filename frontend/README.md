# News Chatbot Frontend (Next.js)

This is the frontend for the News Chatbot application, built with **Next.js** (using the **App Router**), **TypeScript**, **React**, and **TanStack Query**. It provides a user interface to interact with the News Chatbot Backend, enabling users to start chat sessions, send messages, and receive real-time responses via WebSocket. The app fetches chat history, maintains conversation state, and handles reconnection logic for a seamless user experience.

## Features

- Start a new chat session with a unique session token.
- Send messages and receive real-time bot responses via WebSocket.
- Display conversation history fetched from the backend using TanStack Query.
- Handle WebSocket reconnection with retry logic (up to 5 attempts, every 3 seconds).
- Show a "thinking" animation while the bot processes responses.
- Responsive UI with Tailwind CSS for styling.

## Prerequisites

- **Node.js** (v18 or later)
- **npm** (v9 or later)
- A running instance of the **News Chatbot Backend** (see backend README for setup instructions)

## Project Structure

```
rag-frontend/
├── app/                    # App Router directory for Next.js
│   ├── layout.tsx          # Root layout for the app
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles (Tailwind CSS)
|   └── api/                # API routes (if any)
│      └── [[...subroute]]/# API route proxy handler for backend requests
│          └── route.ts    # Handles proxying requests to python backend
├── components/             # React components
│   ├── Chat.tsx            # Main chat component with WebSocket and message handling
|   ├── SessionControl.tsx  # Manage session creation and deletion
│   └── Message.tsx         # Component to render individual chat messages
├── lib/                   # Utility functions
│   └── websocket.ts       # WebSocket connection logic
├── providers/             # TanStack Query setup for API calls
│   └── chatbot.tsx        # API client for session and chat history
├── types/                 # TypeScript type definitions
│   └── chatbot.ts         # Types for ChatMessage and API responses
├── public/                # Static assets
├── next.config.mjs        # Next.js configuration
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── README.md              # This file
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rag-frontend
```

### 2. Install Dependencies

```bash
npm install
```

#### Key Dependencies

- `next`: Next.js framework.
- `react` and `react-dom`: Core React libraries.
- `@tanstack/react-query`: For fetching and caching chat history.
- `typescript`: For type safety.
- `tailwindcss`: For styling.

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- `NEXT_PUBLIC_API_URL`: The URL of the News Chatbot Backend. Update if hosted elsewhere (e.g., Heroku/Render).

### 4. Run the Development Server

```bash
npm run dev
```

- The app will start at `http://localhost:3000`.
- Open `http://localhost:3000` in your browser to access the chat interface.

## Usage

1. **Start a Session**:
   - Click the "Start New Session" button in the chat interface.
   - This calls the backend `/session/start` endpoint, stores the `session_token` in `localStorage`, and reloads the page.

2. **Send Messages**:
   - Type a message (e.g., "My name is Rishabh." or "What's the latest news?").
   - Press "Enter" or click "Send" to send the message via WebSocket.
   - The bot responds in real-time, and messages appear in the chat window.

3. **View History**:
   - Chat history is fetched automatically using TanStack Query (`useGetChatsBySessionToken`).
   - Messages are displayed with user messages on the right and bot messages on the left.

4. **Reconnection**:
   - If the backend server disconnects, the app attempts to reconnect to the WebSocket (5 attempts, every 3 seconds).
   - A "Connecting to server..." message appears during reconnection.

## Development Notes

- **Next.js App Router**:
  - Uses the App Router (`app/` directory). Pages and layouts are defined in `app/`.
  - `Chat.tsx` is a client component (marked with `"use client"`) for WebSocket and state management.
- **WebSocket Handling**:
  - Managed in `lib/websocket.ts` and integrated into `Chat.tsx`.
  - Messages are received as JSON (e.g., `{ "role": "bot", "content": "Your name is Rishabh." }`) and parsed into `ChatMessage` objects.
- **TanStack Query**:
  - Chat history is fetched via `useGetChatsBySessionToken` in `providers/chatbot.tsx`, calling `/session/history`.
- **Styling**:
  - Uses Tailwind CSS. Customize styles in `tailwind.config.js` or `app/globals.css`.
- **Error Handling**:
  - Session creation errors show "Session token not received." or "Failed to start session due to a server error."
  - WebSocket reconnection failures show "Connection lost" after max attempts.

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build for production.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint for code issues.

## Troubleshooting

- **"Failed to start session due to a server error."**:
  - Ensure the backend is running at `http://localhost:8000` (or the URL in `NEXT_PUBLIC_API_URL`).
  - Check backend logs for errors (e.g., Redis/Timescale issues).
- **"Session token not received. Please try again."**:
  - The `/session/start` endpoint returned a response without a `session_token`.
  - Verify the backend implementation (`app/routes/session.py`).
- **"Connecting to server..." persists**:
  - Verify the WebSocket URL (`ws://localhost:8000/chat/websocket`).
  - Check browser console logs for WebSocket errors.
- **Chat history not loading**:
  - Ensure the `session_token` in `localStorage` matches an active session in Redis.
  - Verify the `/session/history` endpoint (use browser DevTools Network tab).

## Deployment

To deploy to Vercel (recommended for Next.js):

1. Build the app:

   ```bash
   npm run build
   ```

2. Deploy to Vercel:
   - Push code to a GitHub repository.
   - Import the repository into Vercel.
   - Set the environment variable `NEXT_PUBLIC_API_URL` to your backend URL.
   - Vercel will detect the Next.js app and deploy it.
3. Access the deployed app at the Vercel-provided URL.

## Contributing

- Create a branch: `git checkout -b feature-name`.
- Make changes and test: `npm run dev`.
- Commit: `git commit -m "Add feature-name"`.
- Push: `git push origin feature-name`.
- Open a pull request on GitHub.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

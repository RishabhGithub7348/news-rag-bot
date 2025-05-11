import Chat from "@/components/chat";
import SessionControls from "@/components/session-controls";


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">News Chatbot</h1>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <SessionControls />
        <Chat />
      </div>
    </main>
  );
}
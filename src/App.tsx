import { MessageList } from "@/components/message/MessageList";
import { mockGroups, mockNow } from "@/mocks/messages";
import "./index.css";

export function App() {
  return (
    <div className="min-h-screen w-full bg-chat">
      <main className="mx-auto max-w-3xl">
        <MessageList groups={mockGroups} now={mockNow} />
      </main>
    </div>
  );
}

export default App;

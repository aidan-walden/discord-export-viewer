import { MessageList } from "@/components/message/MessageList";
import { MemberList } from "@/components/member/MemberList";
import { mockGroups, mockNow } from "@/mocks/messages";
import { mockMembers, mockRoles } from "@/mocks/members";
import "./index.css";

export function App() {
  return (
    <div className="flex min-h-screen w-full bg-chat">
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-3xl">
          <MessageList groups={mockGroups} now={mockNow} />
        </div>
      </main>
      <MemberList members={mockMembers} roles={mockRoles} />
    </div>
  );
}

export default App;

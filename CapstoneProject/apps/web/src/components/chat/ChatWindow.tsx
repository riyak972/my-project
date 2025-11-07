import MessageList from './MessageList';
import Composer from './Composer';

export default function ChatWindow() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MessageList />
      </div>
      <div className="border-t border-gray-200">
        <Composer />
      </div>
    </div>
  );
}



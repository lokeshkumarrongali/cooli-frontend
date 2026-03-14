import MessageBubble from "./MessageBubble";
import { useEffect, useRef } from "react";

function MessageList({ messages, profileData, loading }) {
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "gray" }}>Loading messages...</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "#adb5bd" }}>
        <span style={{ fontSize: "3rem", marginBottom: "8px" }}>👋</span>
        <p>Say hello to start the conversation!</p>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        flex: 1, 
        overflowY: "auto", 
        display: "flex", 
        flexDirection: "column", 
        gap: "12px", 
        padding: "20px 16px",
        background: "#fafafa"
      }}
    >
      {messages.map((msg) => {
        const senderIdString = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
        const isMine = senderIdString === (profileData?._id || profileData?.id);
        return <MessageBubble key={msg._id} msg={msg} isMine={isMine} />;
      })}
      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;

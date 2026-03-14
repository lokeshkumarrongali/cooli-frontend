function MessageBubble({ msg, isMine }) {
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      className={`message-bubble ${isMine ? "right" : "left"}`}
      style={{ 
        alignSelf: isMine ? "flex-end" : "flex-start", 
        maxWidth: "60%",
        display: "flex",
        flexDirection: "column",
        gap: "4px"
      }}
    >
      <div style={{
        background: isMine ? "#ff7a18" : "#f1f1f1",
        color: isMine ? "white" : "var(--color-text)",
        padding: "10px 14px",
        borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        wordBreak: "break-word",
        fontSize: "14px",
        lineHeight: "1.4"
      }}>
        {msg.text}
      </div>
      <div style={{ 
        fontSize: "11px", 
        color: "var(--color-text-muted)", 
        textAlign: isMine ? "right" : "left",
        opacity: 0.6
      }}>
        {time}
        {isMine && msg.read && <span style={{ marginLeft: "4px", color: "#0ca678" }}>✓✓</span>}
        {isMine && !msg.read && <span style={{ marginLeft: "4px" }}>✓</span>}
      </div>
    </div>
  );
}

export default MessageBubble;

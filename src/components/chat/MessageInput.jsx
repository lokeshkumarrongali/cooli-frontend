function MessageInput({ text, setText, onSendMessage }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSendMessage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div 
      className="chat-input-container"
      style={{
        borderTop: "1px solid var(--color-border)",
        background: "white",
        padding: "16px",
        position: "sticky",
        bottom: 0,
        borderBottomLeftRadius: "12px",
        borderBottomRightRadius: "12px"
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <input 
          className="input" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..." 
          style={{ 
            flex: 1, 
            borderRadius: "24px", 
            padding: "12px 24px",
            background: "#f8f9fa",
            border: "1px solid var(--color-primary)" 
          }}
          autoFocus 
          maxLength={1000}
        />
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ 
            borderRadius: "24px", 
            padding: "12px 24px",
            fontWeight: "600"
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default MessageInput;

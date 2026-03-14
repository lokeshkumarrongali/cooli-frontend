import { useNavigate } from "react-router-dom";

function ChatHeader({ otherUser, isOnline }) {
  const navigate = useNavigate();

  // Handle fallback if otherUser is missing
  const name = otherUser?.sharedProfile?.name || otherUser?.employerProfile?.businessName || "Worker";
  const avatar = otherUser?.sharedProfile?.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;

  const getAvailabilityStatus = () => {
    const availability = otherUser?.workerProfile?.availability;
    if (availability === "available") return { text: "Available", color: "#2ecc71" };
    if (availability === "busy") return { text: "Busy", color: "#f1c40f" };
    if (availability === "offline") return { text: "Not Available", color: "#e74c3c" };
    return null;
  };

  const statusObj = getAvailabilityStatus();

  return (
    <div 
      className="chat-header" 
      style={{
        display: "flex", 
        alignItems: "center", 
        height: "70px", 
        padding: "0 16px",
        background: "white", 
        borderBottom: "1px solid var(--color-border)",
        borderTopLeftRadius: "12px",
        borderTopRightRadius: "12px",
        gap: "12px"
      }}
    >
      <button 
        onClick={() => navigate("/messages")} 
        style={{ 
          background: "none", 
          border: "none", 
          fontSize: "20px", 
          cursor: "pointer",
          padding: "8px",
          color: "var(--color-primary)"
        }}
      >
        ←
      </button>

      <img 
        src={avatar} 
        alt="avatar" 
        style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
      />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <h4 style={{ margin: 0, fontSize: "16px", color: "var(--color-text)" }}>{name}</h4>
        {statusObj ? (
          <span style={{ fontSize: "12px", color: statusObj.color, display: "flex", alignItems: "center", gap: "4px", fontWeight: "500" }}>
            <span style={{ fontSize: "10px" }}>●</span> {statusObj.text}
          </span>
        ) : isOnline ? (
          <span style={{ fontSize: "12px", color: "#0ca678", display: "flex", alignItems: "center", gap: "4px", fontWeight: "500" }}>
            <span style={{ fontSize: "10px" }}>●</span> Online
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default ChatHeader;

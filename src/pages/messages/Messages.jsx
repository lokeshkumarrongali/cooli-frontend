import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useUserProfile } from "../../context/useUserProfile";
import { sanitizeImageUrl } from "../../api/imageUtils";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { profileData } = useUserProfile();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get("/chat/conversations");
      setConversations(data.data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (participants) => {
    if (!profileData?._id) return participants[0];
    return participants.find(p => p._id !== profileData._id) || participants[0];
  };

  if (loading) return <div className="page-container"><p>Loading messages...</p></div>;

  return (
    <div className="page-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-6)" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Messages</h1>
      </div>

      {conversations.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "var(--space-8)" }}>
          <span style={{ fontSize: "3rem" }}>💬</span>
          <h3 className="mt-4">Your inbox is empty</h3>
          <p className="text-muted">When you interact with employers or workers, your chats will appear here.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1px", background: "var(--color-border)", borderRadius: "12px", overflow: "hidden" }}>
          {conversations.map((convo) => {
            const otherUser = getOtherParticipant(convo.participants);
            const title = otherUser?.employerProfile?.businessName || otherUser?.sharedProfile?.name || "Cooli User";
            const avatar = sanitizeImageUrl(otherUser?.sharedProfile?.photo, `https://api.dicebear.com/7.x/initials/svg?seed=${title}`);
            
            return (
              <div 
                key={convo._id} 
                onClick={() => navigate(`/messages/${convo._id}`)}
                style={{ 
                  display: "flex", padding: "var(--space-4)", background: "white", 
                  cursor: "pointer", gap: "16px", alignItems: "center",
                  transition: "background 0.2s"
                }}
                onMouseOver={(e) => e.currentTarget.style.background = "var(--color-bg-muted)"}
                onMouseOut={(e) => e.currentTarget.style.background = "white"}
              >
                <img 
                  src={avatar} 
                  alt="avatar" 
                  style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
                    <h4 style={{ margin: 0, fontSize: "16px", color: "var(--color-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {title}
                    </h4>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      {new Date(convo.lastMessageAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {convo.jobId && (
                    <div style={{ fontSize: "11px", background: "#e9ecef", display: "inline-block", padding: "2px 8px", borderRadius: "10px", marginBottom: "6px" }}>
                      Regarding: {convo.jobId.title}
                    </div>
                  )}
                  <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {convo.lastMessage || "Started a conversation"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Messages;

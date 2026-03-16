import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useUserProfile } from "../../context/useUserProfile";
import socket from "../../services/socket";

import ChatHeader from "../../components/chat/ChatHeader";
import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";

function ChatPage() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { profileData } = useUserProfile();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState(null);
  const [isOnline, setIsOnline] = useState(false); // Can be tied to socket presence later

  useEffect(() => {
    fetchConversationContext();
    fetchMessages();
    markRead();

    if (!socket.connected) {
      socket.auth.token = localStorage.getItem("token");
      socket.connect();
    }
    socket.emit("joinConversation", conversationId);

    const handleReceiveMessage = (newMessage) => {
      setMessages((prev) => {
        if (prev.some(m => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
      if (newMessage.senderId !== profileData?._id) markRead();
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.emit("leaveConversation", conversationId);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [conversationId]);

  const fetchConversationContext = async () => {
    try {
      // Find the specific conversation to get otherUser details
      const { data } = await api.get("/chat/conversations");
      const currentConvo = data.data.find(c => c._id === conversationId);
      if (currentConvo) {
        const otherParticipant = currentConvo.participants.find(p => p._id !== profileData?._id) || currentConvo.participants[0];
        setOtherUser(otherParticipant);
        // Can add online check here
        setIsOnline(true);
      }
    } catch(err) {
      console.error(err);
    }
  }

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/messages/${conversationId}`);
      setMessages(res.data.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async () => {
    try {
      await api.patch(`/chat/messages/${conversationId}/read`);
    } catch (e) { /* ignore */ }
  };

  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await api.post("/chat/messages", {
        conversationId,
        text
      });
      setMessages(prev => {
        if (prev.some(m => m._id === res.data.data._id)) return prev;
        return [...prev, res.data.data];
      });
      setText("");
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  return (
    <div 
      className="page-container chat-page-wrapper" 
      style={{ 
        maxWidth: "800px", 
        margin: "0 auto", 
        height: "calc(100vh - 100px)",
        display: "flex", 
        flexDirection: "column",
        padding: "0 10px 20px 10px"
      }}
    >
      <div 
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          borderRadius: "12px",
          background: "white",
          overflow: "hidden"
        }}
      >
        <ChatHeader otherUser={otherUser} isOnline={isOnline} />
        
        <MessageList 
          messages={messages} 
          profileData={profileData} 
          loading={loading} 
        />

        <MessageInput 
          text={text} 
          setText={setText} 
          onSendMessage={sendMessage} 
        />
      </div>
    </div>
  );
}
export default ChatPage;

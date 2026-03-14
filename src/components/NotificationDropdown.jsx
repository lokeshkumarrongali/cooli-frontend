import { useNavigate } from "react-router-dom";

// ---- Config maps ----
const TYPE_CONFIG = {
  job_posted:      { icon: "briefcase",   color: "#1c7ed6", label: "New Job"       },
  job_applied:     { icon: "user-check",  color: "#0ca678", label: "Application"   },
  worker_hired:    { icon: "check-circle",color: "#2f9e44", label: "Hired"         },
  job_completed:   { icon: "award",       color: "#e67700", label: "Completed"     },
  review_received: { icon: "star",        color: "#f59f00", label: "Review"        },
};

// ---- Inline SVG icon ----
function Icon({ name, size = 16, color = "currentColor" }) {
  const paths = {
    "briefcase":    <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
    "user-check":   <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></>,
    "check-circle": <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
    "award":        <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>,
    "star":         <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    "bell":         <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    "arrow-right":  <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0 }}>
      {paths[name] || paths["bell"]}
    </svg>
  );
}

// ---- Time-ago helper ----
function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ---- Main component ----
function NotificationDropdown({ notifications, onMarkRead, onMarkAllRead, unreadCount }) {
  const navigate = useNavigate();

  const handleClick = async (notif) => {
    // Mark as read first
    if (!notif.read && !notif.isRead) {
      await onMarkRead(notif._id);
    }
    // Deep link navigate
    if (notif.redirectUrl) {
      navigate(notif.redirectUrl);
    }
  };

  return (
    <div style={{
      position: "absolute",
      top: "calc(100% + 10px)",
      right: "0",
      width: "360px",
      backgroundColor: "var(--color-bg, #fff)",
      boxShadow: "0 10px 40px rgba(0,0,0,0.16)",
      borderRadius: "14px",
      border: "1px solid var(--color-border, #e9ecef)",
      zIndex: 10000,
      overflow: "hidden",
    }}>

      {/* ---- Header ---- */}
      <div style={{
        padding: "14px 18px",
        borderBottom: "1px solid var(--color-border, #e9ecef)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(135deg, var(--color-bg-muted, #f8f9fa) 0%, #fff 100%)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Icon name="bell" size={16} color="#e67700" />
          <strong style={{ fontSize: "14px", fontWeight: 700 }}>Notifications</strong>
          {unreadCount > 0 && (
            <span style={{
              background: "#e03131", color: "white",
              fontSize: "10px", fontWeight: "700",
              borderRadius: "20px", padding: "2px 8px"
            }}>
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "12px", color: "var(--color-primary, #1c7ed6)",
              fontWeight: "600", padding: "3px 8px",
              borderRadius: "6px", transition: "background 0.15s"
            }}
            onMouseEnter={e => e.target.style.background = "rgba(28,126,214,0.08)"}
            onMouseLeave={e => e.target.style.background = "none"}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* ---- List ---- */}
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <div style={{ padding: "40px 18px", textAlign: "center" }}>
            <Icon name="bell" size={32} color="#ced4da" />
            <p style={{ margin: "12px 0 0 0", color: "#868e96", fontSize: "13px", lineHeight: 1.5 }}>
              You are all caught up!<br/>
              <span style={{ fontSize: "11px" }}>Notifications will appear here</span>
            </p>
          </div>
        ) : (
          notifications.map(notif => {
            const isUnread = !notif.read && !notif.isRead;
            const cfg = TYPE_CONFIG[notif.type] || { icon: "bell", color: "#868e96", label: "" };
            const isClickable = !!notif.redirectUrl;

            return (
              <div
                key={notif._id}
                onClick={() => handleClick(notif)}
                style={{
                  padding: "12px 18px",
                  borderBottom: "1px solid var(--color-border, #f1f3f5)",
                  backgroundColor: isUnread ? `${cfg.color}0d` : "transparent",
                  cursor: isClickable ? "pointer" : "default",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  transition: "background 0.15s",
                  position: "relative"
                }}
                onMouseEnter={e => {
                  if (isClickable) e.currentTarget.style.backgroundColor = isUnread ? `${cfg.color}1a` : "var(--color-bg-muted, #f8f9fa)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = isUnread ? `${cfg.color}0d` : "transparent";
                }}
              >
                {/* Type icon */}
                <div style={{
                  width: "38px", height: "38px", borderRadius: "50%",
                  backgroundColor: `${cfg.color}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: "1px"
                }}>
                  <Icon name={cfg.icon} size={16} color={cfg.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Type label */}
                  <span style={{
                    fontSize: "10px", fontWeight: "700", textTransform: "uppercase",
                    color: cfg.color, letterSpacing: "0.5px"
                  }}>
                    {cfg.label}
                  </span>
                  {/* Message */}
                  <p style={{
                    margin: "2px 0 4px 0",
                    fontSize: "13px",
                    fontWeight: isUnread ? "600" : "400",
                    color: isUnread ? "var(--color-text, #212529)" : "#495057",
                    lineHeight: "1.4",
                    wordBreak: "break-word"
                  }}>
                    {notif.message}
                  </p>
                  {/* Footer row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#adb5bd" }}>
                      {timeAgo(notif.createdAt)}
                    </span>
                    {isClickable && (
                      <span style={{
                        fontSize: "11px", color: cfg.color,
                        display: "flex", alignItems: "center", gap: "2px", fontWeight: "600"
                      }}>
                        <Icon name="arrow-right" size={10} color={cfg.color} />
                        View
                      </span>
                    )}
                  </div>
                </div>

                {/* Unread dot */}
                {isUnread && (
                  <div style={{
                    width: "8px", height: "8px", borderRadius: "50%",
                    backgroundColor: cfg.color, flexShrink: 0, marginTop: "8px"
                  }} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ---- Footer ---- */}
      {notifications.length > 0 && (
        <div style={{
          padding: "10px 18px",
          borderTop: "1px solid var(--color-border, #e9ecef)",
          textAlign: "center",
          background: "var(--color-bg-muted, #f8f9fa)"
        }}>
          <span style={{ fontSize: "11px", color: "#adb5bd" }}>
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""} total
          </span>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;

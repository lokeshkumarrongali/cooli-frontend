import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const TYPE_COLORS = {
  job_posted:      "#1c7ed6",
  job_applied:     "#0ca678",
  worker_hired:    "#2f9e44",
  job_completed:   "#e67700",
  review_received: "#f59f00",
};

let _addToast = null;

/**
 * Call this from anywhere (including outside React) to fire a toast.
 * Used by the socket listener in NotificationBell.
 */
export function showToast(notification) {
  if (_addToast) _addToast(notification);
}

function ToastItem({ toast, onDismiss }) {
  const navigate = useNavigate();
  const color = TYPE_COLORS[toast.type] || "#495057";

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      onClick={() => {
        if (toast.redirectUrl) navigate(toast.redirectUrl);
        onDismiss(toast.id);
      }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 16px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.14)",
        border: `1px solid ${color}30`,
        borderLeft: `4px solid ${color}`,
        cursor: toast.redirectUrl ? "pointer" : "default",
        minWidth: "280px",
        maxWidth: "340px",
        animation: "slideInRight 0.3s ease",
        position: "relative",
        userSelect: "none"
      }}
    >
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        background: `${color}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0
      }}>
        <span style={{ fontSize: "14px" }}>
          {{
            job_posted: "U",
            job_applied: "A",
            worker_hired: "H",
            job_completed: "C",
            review_received: "R"
          }[toast.type] || "N"}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: "0 0 2px 0", fontSize: "13px", fontWeight: "600", color: "#212529", lineHeight: 1.4 }}>
          {toast.message}
        </p>
        {toast.redirectUrl && (
          <span style={{ fontSize: "11px", color, fontWeight: "600" }}>Tap to view</span>
        )}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#adb5bd", fontSize: "16px", padding: "0", lineHeight: 1,
          position: "absolute", top: "8px", right: "10px"
        }}
      >
        x
      </button>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((notif) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...notif, id }].slice(-5)); // max 5
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
      <div style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none"
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: "all" }}>
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </>
  );
}

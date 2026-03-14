import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

function LeaveReview() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const receiverId = searchParams.get("receiverId");
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/reviews", {
        jobId,
        receiverId,
        rating,
        comment
      });
      alert("Review submitted successfully!");
      navigate(-1);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit review");
    }
  };

  if (!jobId || !receiverId) {
    return <p className="page-container text-muted">Invalid review link.</p>;
  }

  return (
    <div className="page-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: "var(--space-4)" }}>← Back</button>
      
      <div className="card">
        <h2 style={{ marginBottom: "var(--space-2)", color: "var(--color-primary)" }}>Leave a Review</h2>
        <p className="text-muted" style={{ marginBottom: "var(--space-6)" }}>Your feedback helps build trust in the Cooli community.</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--space-4)" }}>
          <div>
            <label className="prop-label">Rating</label>
            <div style={{ display: "flex", gap: "10px", fontSize: "2rem", cursor: "pointer" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span 
                  key={star} 
                  onClick={() => setRating(star)}
                  style={{ color: star <= rating ? "gold" : "#e0e0e0", transition: "color 0.2s" }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="prop-label">Comments (Optional)</label>
            <textarea 
              className="input" 
              placeholder="How was your experience?" 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              style={{ minHeight: "120px" }}
              maxLength={500}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: "var(--space-4)" }}>Submit Review</button>
        </form>
      </div>
    </div>
  );
}

export default LeaveReview;

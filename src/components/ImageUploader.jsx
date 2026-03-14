import { useState } from "react";
import api from "../api/axios";

export default function ImageUploader({ label, onUploadSuccess, accept = "image/*" }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Max size is 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const imageUrl = response.data.data.imageUrl;
      onUploadSuccess(imageUrl);
    } catch (error) {
      console.error("Upload error", error);
      alert("Failed to upload the file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ border: "2px dashed var(--color-border)", padding: "20px", textAlign: "center", borderRadius: "8px", position: "relative" }}>
      <label style={{ cursor: "pointer", display: "block" }}>
        {uploading ? "Uploading..." : `Drag & Drop or Click to Upload ${label}`}
        <input 
          type="file" 
          accept={accept}
          style={{ display: "none" }}
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
    </div>
  );
}

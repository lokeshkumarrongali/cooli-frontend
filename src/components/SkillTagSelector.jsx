import { useState } from "react";

export default function SkillTagSelector({ selectedSkills, onChange }) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = input.trim().toLowerCase();
      if (val && !selectedSkills.includes(val)) {
        onChange([...selectedSkills, val]);
      }
      setInput("");
    }
  };

  const removeSkill = (skill) => {
    onChange(selectedSkills.filter(s => s !== skill));
  };

  return (
    <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--border-radius-md)", padding: "10px", display: "flex", flexWrap: "wrap", gap: "5px" }}>
      {selectedSkills.map(skill => (
        <span key={skill} className="badge badge-role" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          {skill}
          <button 
            type="button"
            onClick={() => removeSkill(skill)}
            style={{ background: "none", border: "none", color: "var(--color-primary)", cursor: "pointer", fontSize: "14px", lineHeight: "1" }}
          >
            &times;
          </button>
        </span>
      ))}
      <input 
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a skill and press Enter..."
        style={{ flex: 1, border: "none", outline: "none", marginLeft: "5px", background: "transparent" }}
      />
    </div>
  );
}

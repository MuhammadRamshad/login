import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; 

type Props = {
  onSwitch?: () => void;
};

export default function Signup({ onSwitch }: Props) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);    
  const [cooldown, setCooldown] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (!email || !username || !password) {
    setMessage("Please fill all fields");
    return;
  }

  setLoading(true);
  setMessage(null);

  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });
    if (response.status === 429) {
      let seconds = 10; 
      setCooldown(seconds);

      const interval = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setLoading(false);
      return;
    }

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || "Signup failed");
      setLoading(false);
      return;
    }
    setMessage(data.message);
    setEmail("");
    setUsername("");
    setPassword("");

  } catch (error) {
    console.error("Signup error:", error);
    setMessage("Network error. Please try again.");
  } finally {
    setLoading(false);
  }
}

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup</h2>

      <label>Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        disabled={loading}
        required
      />

      <label>Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />

      <label>Password</label>

      <div style={{ position: "relative", width: "100%" }}>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
          style={{
            width: "100%",
            padding: "10px",
            paddingRight: "40px", 
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxSizing: "border-box",
          }}
        />

        <span
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            fontSize: "20px",
            color: "#666",
          }}
        >
          {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
        </span>
      </div>

      <button type="submit" disabled={loading || cooldown > 0}>
        {cooldown > 0
          ? `Please wait ${cooldown}s`
          : loading
          ? "Creating account..."
          : "Create account"}
      </button>


      {message && (
        <p
          className={`message ${
            message.includes("Verification") ? "success" : "error"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}

import React, { useState } from 'react'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'   

type Props = {
  onLogin: (username: string, token: string) => void
  onSwitch?: () => void
}

export default function Login({ onLogin, onSwitch }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)    

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    if (!username || !password) {
      setError('Please provide username and password')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Login failed')
        return
      }

      onLogin(data.username, data.token)
    } catch (err) {
      setError('Unable to connect to server')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      <label>Username</label>
      <input 
        value={username} 
        onChange={e => setUsername(e.target.value)}
        disabled={loading}
      />

      <label>Password</label>

<div style={{ position: "relative", width: "100%" }}>
  <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    disabled={loading}
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

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {error && <p className="error">{error}</p>}
    </form>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BASE_URL = `${window.location.protocol}//${window.location.hostname}:8080`

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required")
      return
    }

    try {
      const endpoint = isRegistering ? '/register' : '/login'
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        'ngrok-skip-browser-warning': 'true'
      })

      if (response.ok) {
        const token = await response.text()
        
        // Clear any old token
        sessionStorage.clear()
        
        // Save new token
        sessionStorage.setItem('jwt', token)  // Changed 'token' to 'jwt'

        // Extract username from JWT
        console.log("Received token:", token)
        const tokenPayload = JSON.parse(atob(token.split('.')[1]))
        const extractedUsername = tokenPayload.username || tokenPayload.sub

       // SAVE USERNAME TO LOCALSTORAGE
       sessionStorage.setItem('username', extractedUsername)

       console.log("Logged in as:", extractedUsername)

       // Navigate to chat
       navigate('/chat', { state: { username: extractedUsername } })
      } else {
        const errorText = await response.text()
        setError(errorText || `${isRegistering ? 'Registration' : 'Login'} failed`)
      }
    } catch (err) {
      console.error(err)
      setError("Connection error. Please try again.")
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          {isRegistering ? 'Register' : 'Login'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Enter username"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Enter password"
            />
          </div>

          {error && (
            <div style={{
              padding: '10px',
              marginBottom: '20px',
              backgroundColor: '#fee',
              color: '#c00',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#0084ff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={() => {
              setIsRegistering(!isRegistering)
              setError("")
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#0084ff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    </div>
  )
}
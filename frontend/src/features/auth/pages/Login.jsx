import React, { useState } from 'react'
import { NavLink , useNavigate} from 'react-router-dom'
import axios from 'axios'
import './Auth.scss'

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
        await axios.post(
        'http://localhost:8000/user/login',
        { email, password },
        { withCredentials: true }
      )
      setLoading(false)
      navigate('/')
    } catch (err) {
      setLoading(false)
      const msg = err?.response?.data?.msg || 'Login failed. Check credentials.'
      setError(msg)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit} noValidate>
        <h2 className="title">Welcome Back</h2>

        {error && <div className="error">{error}</div>}

        <label className="field">
          <span className="label-text">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="field">
          <span className="label-text">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </label>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>

        <div className="footer">
          <span>Don't have an account?</span>
          <NavLink className="link" to="/register">Register</NavLink>
        </div>
      </form>
    </div>
  )
}

export default Login

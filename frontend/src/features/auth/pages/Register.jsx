import React, { useState } from 'react'
import { NavLink , useNavigate} from 'react-router-dom'
import axios from 'axios'
import './Auth.scss'

const Register = () => {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await axios.post(
        `${API_URL}/user/register`,
        { fullname, email, password },
        { withCredentials: true }
      )
      setLoading(false)
      setSuccess(res?.data?.msg || 'Registration successful.')
      setTimeout(() => navigate('/') , 1000)
    } catch (err) {
      setLoading(false)
      const msg = err?.response?.data?.msg || 'Registration failed. Try again.'
      console.log(msg);
      setError(msg)
    }
  }

  return (
    <div className="register-page">
      <form className="register-card" onSubmit={handleSubmit} noValidate>
        <h2 className="title">Create Account</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <label className="field">
          <span className="label-text">Full name</span>
          <input
            type="text"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            placeholder="Your full name"
            required
          />
        </label>

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
            placeholder="Choose a strong password"
            required
          />
        </label>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Creating…' : 'Register'}
        </button>

        <div className="footer">
          <span>Already have an account?</span>
          <NavLink className="link" to="/login">Login</NavLink>
        </div>
      </form>
    </div>
  )
}

export default Register

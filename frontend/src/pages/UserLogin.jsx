import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext'
import axios from 'axios'

const UserLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { setUser } = useContext(UserDataContext)
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault()

    const userData = { email, password }

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`, userData)

    if (response.status === 200) {
      const data = response.data
      setUser(data.user)
      localStorage.setItem('token', data.token)
      navigate('/home')
    }

    setEmail('')
    setPassword('')
  }

  return (
    <div
      className="h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1602481098343-e2a7c4c34e3f?auto=format&fit=crop&w=1470&q=80')",
      }}
    >
      <div className="bg-white bg-opacity-90 max-w-xl w-full rounded-2xl p-10 shadow-2xl">
        <img
          className="w-20 mb-6"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYQy-OIkA6In0fTvVwZADPmFFibjmszu2A0g&s"
          alt="logo"
        />

        <form onSubmit={submitHandler}>
          <h3 className="text-xl font-medium mb-2">What's your email</h3>
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#eeeeee] mb-6 rounded-lg px-4 py-3 border w-full text-lg"
            type="email"
            placeholder="email@example.com"
          />

          <h3 className="text-xl font-medium mb-2">Enter Password</h3>
          <input
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#eeeeee] mb-6 rounded-lg px-4 py-3 border w-full text-lg"
            type="password"
            placeholder="password"
          />

          <button
            className="bg-[#111] text-white font-semibold rounded-lg px-4 py-3 w-full text-lg"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-4">
          New here?{' '}
          <Link to="/signup" className="text-blue-600">
            Create new Account
          </Link>
        </p>

        <Link
          to="/captain-login"
          className="bg-[#10b461] mt-6 flex items-center justify-center text-white font-semibold rounded-lg px-4 py-3 w-full text-lg"
        >
          Sign in as Captain
        </Link>
      </div>
    </div>
  )
}

export default UserLogin

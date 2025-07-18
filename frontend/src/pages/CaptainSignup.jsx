import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CaptainDataContext } from '../context/CapatainContext';
import axios from 'axios';

const CaptainSignup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleCapacity, setVehicleCapacity] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const { setCaptain } = useContext(CaptainDataContext);

  const submitHandler = async (e) => {
    e.preventDefault();

    const captainData = {
      fullname: { firstname: firstName, lastname: lastName },
      email,
      password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
        vehicleType,
      },
    };

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, captainData);

    if (response.status === 201) {
      const data = response.data;
      setCaptain(data.captain);
      localStorage.setItem('token', data.token);
      navigate('/captain-home');
    }

    setEmail('');
    setFirstName('');
    setLastName('');
    setPassword('');
    setVehicleColor('');
    setVehiclePlate('');
    setVehicleCapacity('');
    setVehicleType('');
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center px-4 py-6"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=1470&q=80')"
      }}
    >
      <div className="w-full max-w-xl bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg overflow-y-auto max-h-screen">
        <img
          className="w-16 mb-6"
          src="https://www.svgrepo.com/show/505031/uber-driver.svg"
          alt="Uber Logo"
        />

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">What's our Captain's name</h3>
            <div className="flex gap-4">
              <input
                required
                className="w-1/2 h-14 px-4 rounded-md border bg-gray-100 placeholder:text-base"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                required
                className="w-1/2 h-14 px-4 rounded-md border bg-gray-100 placeholder:text-base"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Email</h3>
            <input
              required
              className="w-full h-14 px-4 rounded-md border bg-gray-100 placeholder:text-base"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Password</h3>
            <input
              required
              className="w-full h-14 px-4 rounded-md border bg-gray-100 placeholder:text-base"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
            <div className="flex gap-4 mb-4">
              <input
                required
                className="w-1/2 h-14 px-4 rounded-md border bg-gray-100 placeholder:text-base"
                type="text"
                placeholder="Vehicle Color"
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
              />
              <input
                required
                className="w-1/2 h-14 px-4 rounded-md border bg-gray-100 placeholder:text-base"
                type="text"
                placeholder="Vehicle Plate"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <input
                required
                className="w-1/2 h-14 px-4 rounded-md border bg-gray-100 placeholder:text-base"
                type="number"
                placeholder="Capacity"
                value={vehicleCapacity}
                onChange={(e) => setVehicleCapacity(e.target.value)}
              />
              <select
                required
                className="w-1/2 h-14 px-4 rounded-md border bg-gray-100 text-base"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="" disabled>Select Vehicle Type</option>
                <option value="car">Car</option>
                <option value="auto">Auto</option>
                <option value="moto">Moto</option>
              </select>
            </div>
          </div>

          <button className="w-full h-14 bg-black text-white rounded-md font-semibold text-lg hover:bg-gray-800 transition">
            Create Captain Account
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Already have an account? <Link to="/captain-login" className="text-blue-600 underline">Login here</Link>
        </p>

        <p className="text-[10px] text-center mt-4 leading-tight text-gray-500">
          This site is protected by reCAPTCHA and the <span className="underline">Google Privacy Policy</span> and <span className="underline">Terms of Service</span> apply.
        </p>
      </div>
    </div>
  );
};

export default CaptainSignup;

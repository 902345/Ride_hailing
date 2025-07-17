import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import CaptainDetails from '../components/CaptainDetails'
import RidePopUp from '../components/RidePopUp'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ConfirmRidePopUp from '../components/ConfirmRidePopUp'
import { useEffect, useContext } from 'react'
import { SocketContext } from '../context/SocketContext'
import { CaptainDataContext } from '../context/CapatainContext'
import axios from 'axios'

const CaptainHome = () => {

    const [ridePopupPanel, setRidePopupPanel] = useState(false)
    const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false)
    const [isActive, setIsActive] = useState(true)
    const [locationError, setLocationError] = useState(null)

    const ridePopupPanelRef = useRef(null)
    const confirmRidePopupPanelRef = useRef(null)
    const [ride, setRide] = useState(null)

    const { socket } = useContext(SocketContext)
    const { captain } = useContext(CaptainDataContext)

    useEffect(() => {
        if (!captain?._id || !socket) return

        console.log('Captain joining with ID:', captain._id)
        
        // Join socket room
        socket.emit('join', {
            userId: captain._id,
            userType: 'captain'
        })

        // Location update function
        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const locationData = {
                            userId: captain._id,
                            location: {
                                ltd: position.coords.latitude,
                                lng: position.coords.longitude
                            }
                        }
                        
                        console.log('Sending location update:', locationData)
                        socket.emit('update-location-captain', locationData)
                        setLocationError(null)
                    },
                    error => {
                        console.error('Location error:', error)
                        setLocationError(error.message)
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    }
                )
            } else {
                setLocationError('Geolocation is not supported by this browser')
            }
        }

        // Update location immediately and then every 10 seconds
        const locationInterval = setInterval(updateLocation, 10000)
        updateLocation()

        // Socket event listeners
        const handleNewRide = (data) => {
            console.log('New ride received:', data)
            setRide(data)
            setRidePopupPanel(true)
            
            // Optional: Play notification sound
            // new Audio('/notification.mp3').play().catch(console.error)
        }

        const handleSocketConnect = () => {
            console.log('Socket connected')
        }

        const handleSocketDisconnect = () => {
            console.log('Socket disconnected')
        }

        const handleSocketError = (error) => {
            console.error('Socket error:', error)
        }

        // Add socket event listeners
        socket.on('new-ride', handleNewRide)
        socket.on('connect', handleSocketConnect)
        socket.on('disconnect', handleSocketDisconnect)
        socket.on('error', handleSocketError)

        // Cleanup function
        return () => {
            clearInterval(locationInterval)
            socket.off('new-ride', handleNewRide)
            socket.off('connect', handleSocketConnect)
            socket.off('disconnect', handleSocketDisconnect)
            socket.off('error', handleSocketError)
        }
    }, [captain._id, socket])

    // Toggle captain status
    const toggleStatus = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captain/toggle-status`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            setIsActive(response.data.captain.status === 'active')
            console.log('Status toggled:', response.data.captain.status)
        } catch (error) {
            console.error('Error toggling status:', error)
        }
    }

    // Confirm ride function
    async function confirmRide() {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {
                rideId: ride._id,
                captainId: captain._id,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })

            console.log('Ride confirmed:', response.data)
            setRidePopupPanel(false)
            setConfirmRidePopupPanel(true)
        } catch (error) {
            console.error('Error confirming ride:', error)
            alert('Error confirming ride. Please try again.')
        }
    }

    // Test socket connection
    const testSocket = () => {
        socket.emit('test-message', { 
            message: 'Hello from captain',
            captainId: captain._id,
            timestamp: new Date().toISOString()
        })
        console.log('Test message sent')
    }

    useGSAP(function () {
        if (ridePopupPanel) {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(ridePopupPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ridePopupPanel])

    useGSAP(function () {
        if (confirmRidePopupPanel) {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(confirmRidePopupPanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [confirmRidePopupPanel])

    return (
        <div className='h-screen'>
            <div className='fixed p-6 top-0 flex items-center justify-between w-screen'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
                <div className='flex items-center gap-3'>
                    {/* Status Toggle Button */}
                    <button 
                        onClick={toggleStatus}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}
                    >
                        {isActive ? 'Active' : 'Inactive'}
                    </button>
                    
                    {/* Test Socket Button (Remove in production) */}
                    <button 
                        onClick={testSocket}
                        className='px-3 py-1 bg-blue-500 text-white rounded-full text-sm'
                    >
                        Test
                    </button>
                    
                    <Link to='/captain-home' className='h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                        <i className="text-lg font-medium ri-logout-box-r-line"></i>
                    </Link>
                </div>
            </div>

            {/* Location Error Display */}
            {locationError && (
                <div className='fixed top-20 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50'>
                    Location Error: {locationError}
                </div>
            )}

            {/* Socket Connection Status */}
            <div className='fixed top-24 right-4 z-50'>
                <div className={`w-3 h-3 rounded-full ${
                    socket?.connected ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
            </div>

            <div className='h-3/5'>
                <img className='h-full w-full object-cover' src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif" alt="" />
            </div>
            
            <div className='h-2/5 p-6'>
                <CaptainDetails />
            </div>
            
            <div ref={ridePopupPanelRef} className='fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <RidePopUp
                    ride={ride}
                    setRidePopupPanel={setRidePopupPanel}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                    confirmRide={confirmRide}
                />
            </div>
            
            <div ref={confirmRidePopupPanelRef} className='fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                <ConfirmRidePopUp
                    ride={ride}
                    setConfirmRidePopupPanel={setConfirmRidePopupPanel} 
                    setRidePopupPanel={setRidePopupPanel} 
                />
            </div>
        </div>
    )
}

export default CaptainHome
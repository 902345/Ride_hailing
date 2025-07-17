import React, { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

// Mock components - replace with your actual components
const FinishRide = ({ ride, setFinishRidePanel, onEndRide }) => (
    <div className="p-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold">Complete Ride</h3>
            <button 
                onClick={() => setFinishRidePanel(false)}
                className="text-gray-500 hover:text-gray-700"
            >
                <i className="ri-close-line text-2xl"></i>
            </button>
        </div>
        
        {ride && (
            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Ride Details</h4>
                    <p className="text-sm text-gray-600">Pickup: {ride.pickup}</p>
                    <p className="text-sm text-gray-600">Destination: {ride.destination}</p>
                    <p className="text-sm text-gray-600">Fare: ₹{ride.fare}</p>
                    <p className="text-sm text-gray-600">Distance: {ride.distance} km</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Passenger Details</h4>
                    <p className="text-sm text-gray-600">Name: {ride.user?.fullname?.firstname} {ride.user?.fullname?.lastname}</p>
                    <p className="text-sm text-gray-600">Phone: {ride.user?.phone}</p>
                </div>
                
                <button 
                    onClick={onEndRide}
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                    End Ride
                </button>
            </div>
        )}
    </div>
)

const LiveTracking = () => (
    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
        <div className="text-center">
            <div className="animate-pulse">
                <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Live Tracking Active</p>
            </div>
        </div>
    </div>
)

const CaptainRiding = () => {
    const [finishRidePanel, setFinishRidePanel] = useState(false)
    const [rideStatus, setRideStatus] = useState('ongoing')
    const [currentLocation, setCurrentLocation] = useState(null)
    const [distanceToDestination, setDistanceToDestination] = useState('4 KM')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [socketConnected, setSocketConnected] = useState(true)
    
    const finishRidePanelRef = useRef(null)
    
    // Mock ride data - replace with actual data from props or context
    const rideData = {
        _id: '675abc123def456789',
        pickup: 'Sector 17, Chandigarh',
        destination: 'Sector 35, Chandigarh',
        fare: 180,
        distance: 4.2,
        user: {
            fullname: {
                firstname: 'John',
                lastname: 'Doe'
            },
            phone: '+91 9876543210'
        },
        vehicleType: 'car',
        status: 'ongoing'
    }

    // Location tracking
    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser')
            return
        }

        const updateLocation = () => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                    setCurrentLocation(newLocation)
                    
                    // Mock socket emit for location update
                    console.log('Location updated:', newLocation)
                    
                    // Simulate distance calculation
                    const randomDistance = (Math.random() * 5 + 1).toFixed(1)
                    setDistanceToDestination(`${randomDistance} KM`)
                },
                (error) => {
                    console.error('Geolocation error:', error)
                    setError('Unable to get current location')
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            )
        }

        // Update location immediately and then every 10 seconds
        updateLocation()
        const locationInterval = setInterval(updateLocation, 10000)

        return () => clearInterval(locationInterval)
    }, [])

    // Simulate socket connection status
    useEffect(() => {
        const interval = setInterval(() => {
            setSocketConnected(prev => Math.random() > 0.1 ? true : prev)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    // End ride function
    const handleEndRide = async () => {
        if (!rideData?._id) {
            setError('No ride data available')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            console.log('Ride ended successfully')
            setRideStatus('completed')
            setFinishRidePanel(false)
            
            // Show success message
            setTimeout(() => {
                alert('Ride completed successfully!')
            }, 500)

        } catch (error) {
            console.error('Error ending ride:', error)
            setError('Failed to end ride')
        } finally {
            setIsLoading(false)
        }
    }

    // GSAP animations
    useGSAP(() => {
        if (finishRidePanel) {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(0)',
                duration: 0.3,
                ease: 'power2.out'
            })
        } else {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(100%)',
                duration: 0.3,
                ease: 'power2.in'
            })
        }
    }, [finishRidePanel])

    return (
        <div className='h-screen relative flex flex-col justify-end'>
            {/* Header */}
            <div className='fixed p-6 top-0 flex items-center justify-between w-screen z-50 bg-white shadow-sm'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber" />
                <div className='flex items-center gap-4'>
                    {/* Ride Status Indicator */}
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        rideStatus === 'ongoing' ? 'bg-green-100 text-green-800' :
                        rideStatus === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {rideStatus.charAt(0).toUpperCase() + rideStatus.slice(1)}
                    </div>
                    
                    {/* Connection Status */}
                    <div className={`w-3 h-3 rounded-full ${
                        socketConnected ? 'bg-green-500' : 'bg-red-500'
                    }`} title={socketConnected ? 'Connected' : 'Disconnected'}></div>
                    
                    <button 
                        onClick={() => console.log('Navigate to captain home')}
                        className='h-10 w-10 bg-white flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50'
                    >
                        <i className="text-lg font-medium ri-logout-box-r-line"></i>
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className='fixed top-20 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50'>
                    <div className='flex items-center justify-between'>
                        <span>{error}</span>
                        <button 
                            onClick={() => setError(null)}
                            className='text-red-500 hover:text-red-700'
                        >
                            <i className="ri-close-line"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Main Action Panel */}
            <div className='h-1/5 p-6 flex items-center justify-between relative bg-gradient-to-r from-yellow-400 to-orange-400 pt-10 shadow-lg cursor-pointer hover:from-yellow-500 hover:to-orange-500 transition-all'
                onClick={() => setFinishRidePanel(true)}
            >
                <h5 className='p-1 text-center w-[90%] absolute top-2 cursor-pointer hover:text-gray-700'>
                    <i className="text-3xl text-gray-800 ri-arrow-up-wide-line"></i>
                </h5>
                
                <div className='flex flex-col'>
                    <h4 className='text-xl font-semibold text-gray-800'>{distanceToDestination} away</h4>
                    <p className='text-sm text-gray-700'>Tap to complete ride</p>
                </div>
                
                <button 
                    className={`font-semibold p-3 px-8 rounded-lg transition-all ${
                        isLoading 
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                            : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                    }`}
                    disabled={isLoading}
                    onClick={(e) => {
                        e.stopPropagation()
                        setFinishRidePanel(true)
                    }}
                >
                    {isLoading ? (
                        <div className='flex items-center gap-2'>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Processing...</span>
                        </div>
                    ) : (
                        'Complete Ride'
                    )}
                </button>
            </div>

            {/* Finish Ride Panel */}
            <div ref={finishRidePanelRef} className='fixed w-full z-[500] bottom-0 translate-y-full bg-white px-3 py-10 pt-12 shadow-2xl rounded-t-2xl'>
                <FinishRide
                    ride={rideData}
                    setFinishRidePanel={setFinishRidePanel}
                    onEndRide={handleEndRide}
                />
            </div>

            {/* Live Tracking Background */}
            <div className='h-screen fixed w-screen top-0 z-[-1]'>
                <LiveTracking />
            </div>

            {/* Ride Info Overlay */}
            {rideData && (
                <div className='fixed top-24 left-4 right-4 z-40'>
                    <div className='bg-white rounded-lg shadow-lg p-4 border border-gray-200'>
                        <div className='flex items-center justify-between mb-2'>
                            <h3 className='font-semibold text-gray-800'>Current Ride</h3>
                            <span className='text-sm text-gray-500'>#{rideData._id?.slice(-8)}</span>
                        </div>
                        <div className='space-y-1 text-sm'>
                            <p className='text-gray-600'>
                                <i className="ri-map-pin-line mr-1 text-green-600"></i>
                                From: {rideData.pickup}
                            </p>
                            <p className='text-gray-600'>
                                <i className="ri-map-pin-2-line mr-1 text-red-600"></i>
                                To: {rideData.destination}
                            </p>
                            <p className='text-gray-600'>
                                <i className="ri-money-rupee-circle-line mr-1 text-blue-600"></i>
                                Fare: ₹{rideData.fare}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className='fixed bottom-32 right-4 z-40 flex flex-col gap-2'>
                <button 
                    onClick={() => console.log('Call passenger')}
                    className='w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center'
                >
                    <i className="ri-phone-line text-lg"></i>
                </button>
                <button 
                    onClick={() => console.log('Send message')}
                    className='w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 flex items-center justify-center'
                >
                    <i className="ri-message-line text-lg"></i>
                </button>
                <button 
                    onClick={() => console.log('Emergency')}
                    className='w-12 h-12 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 flex items-center justify-center'
                >
                    <i className="ri-alarm-warning-line text-lg"></i>
                </button>
            </div>
        </div>
    )
}

export default CaptainRiding
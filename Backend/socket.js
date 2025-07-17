const socketIo = require('socket.io');
const userModel = require('./models/user.model');
const captainModel = require('./models/captain.model');

let io;

function initializeSocket(server) {
    io = socketIo(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('join', async (data) => {
            const { userId, userType } = data;
            console.log(`${userType} joined:`, userId);

            try {
                if (userType === 'captain') {
                    // Check if captain exists before updating
                    const captain = await captainModel.findById(userId);
                    
                    if (!captain) {
                        console.error('Captain not found:', userId);
                        return;
                    }

                    console.log('Captain found, updating socketId:', {
                        captainId: captain._id,
                        oldSocketId: captain.socketId,
                        newSocketId: socket.id
                    });

                    // Update captain's socketId and set to active
                    const updatedCaptain = await captainModel.findByIdAndUpdate(
                        userId,
                        {
                            socketId: socket.id,
                            status: 'active' // Set to active when they join
                        },
                        { new: true }
                    );

                    console.log('Captain updated:', {
                        id: updatedCaptain._id,
                        socketId: updatedCaptain.socketId,
                        status: updatedCaptain.status
                    });

                    // Join captain to their room
                    socket.join(userId);
                }

                // Handle user join as well
                if (userType === 'user') {
                    const user = await userModel.findById(userId);
                    
                    if (!user) {
                        console.error('User not found:', userId);
                        return;
                    }

                    console.log('User found, updating socketId:', {
                        userId: user._id,
                        oldSocketId: user.socketId,
                        newSocketId: socket.id
                    });

                    const updatedUser = await userModel.findByIdAndUpdate(
                        userId,
                        { socketId: socket.id },
                        { new: true }
                    );

                    console.log('User updated:', {
                        id: updatedUser._id,
                        socketId: updatedUser.socketId
                    });

                    // Join user to their room
                    socket.join(userId);
                }
            } catch (error) {
                console.error('Error in join event:', error);
            }
        });

        // Handle captain location updates
        socket.on('update-location-captain', async (data) => {
            const { userId, location } = data;
            console.log('Captain location update:', userId, location);

            if (!userId || !location) {
                console.error('Missing userId or location in update');
                return;
            }

            try {
                // Update captain location and ensure socketId is maintained
                const updatedCaptain = await captainModel.findByIdAndUpdate(
                    userId,
                    {
                        location: {
                            ltd: location.ltd,
                            lng: location.lng
                        },
                        socketId: socket.id, // Make sure socketId is maintained
                        status: 'active'
                    },
                    { new: true }
                );

                if (updatedCaptain) {
                    console.log('Captain location and socket updated:', {
                        id: updatedCaptain._id,
                        location: updatedCaptain.location,
                        socketId: updatedCaptain.socketId,
                        status: updatedCaptain.status
                    });
                } else {
                    console.error('Captain not found for location update:', userId);
                }
            } catch (error) {
                console.error('Error updating captain location:', error);
            }
        });

        // Handle user location updates (if needed)
        socket.on('update-location-user', async (data) => {
            const { userId, location } = data;
            console.log('User location update:', userId, location);

            if (!userId || !location) {
                console.error('Missing userId or location in user update');
                return;
            }

            try {
                const updatedUser = await userModel.findByIdAndUpdate(
                    userId,
                    {
                        location: {
                            ltd: location.ltd,
                            lng: location.lng
                        },
                        socketId: socket.id // Make sure socketId is maintained
                    },
                    { new: true }
                );

                if (updatedUser) {
                    console.log('User location updated:', {
                        id: updatedUser._id,
                        location: updatedUser.location
                    });
                } else {
                    console.error('User not found for location update:', userId);
                }
            } catch (error) {
                console.error('Error updating user location:', error);
            }
        });

        // Handle ride status updates from captain
        socket.on('ride-status-update', async (data) => {
            const { rideId, status, userId } = data;
            console.log('Ride status update:', { rideId, status, userId });

            try {
                // You can emit this to the user
                if (userId) {
                    const user = await userModel.findById(userId);
                    if (user && user.socketId) {
                        io.to(user.socketId).emit('ride-status-changed', {
                            rideId,
                            status
                        });
                    }
                }
            } catch (error) {
                console.error('Error handling ride status update:', error);
            }
        });

        // Handle disconnect
        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);

            try {
                // Set captain to inactive when they disconnect
                const captain = await captainModel.findOneAndUpdate(
                    { socketId: socket.id },
                    {
                        socketId: null,
                        status: 'inactive'
                    },
                    { new: true }
                );

                if (captain) {
                    console.log('Captain set to inactive:', captain._id);
                }

                // Clear user socketId when they disconnect
                const user = await userModel.findOneAndUpdate(
                    { socketId: socket.id },
                    { socketId: null },
                    { new: true }
                );

                if (user) {
                    console.log('User socketId cleared:', user._id);
                }
            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        });

        // Handle custom events for ride flow
        socket.on('captain-accept-ride', async (data) => {
            const { rideId, captainId } = data;
            console.log('Captain accepting ride:', { rideId, captainId });
            
            // You can add additional logic here if needed
            // The main acceptance logic should be in your ride controller
        });

        socket.on('captain-decline-ride', async (data) => {
            const { rideId, captainId } = data;
            console.log('Captain declining ride:', { rideId, captainId });
            
            // You can add additional logic here if needed
        });

        // Handle captain going online/offline manually
        socket.on('captain-status-change', async (data) => {
            const { captainId, status } = data;
            console.log('Captain status change:', { captainId, status });

            try {
                const updatedCaptain = await captainModel.findByIdAndUpdate(
                    captainId,
                    { status: status },
                    { new: true }
                );

                if (updatedCaptain) {
                    console.log('Captain status updated:', {
                        id: updatedCaptain._id,
                        status: updatedCaptain.status
                    });
                }
            } catch (error) {
                console.error('Error updating captain status:', error);
            }
        });
    });
}

const sendMessageToSocketId = (socketId, messageObject) => {
    console.log('Sending message to socket:', socketId, messageObject);

    if (io) {
        io.to(socketId).emit(messageObject.event, messageObject.data);
        console.log('Message sent successfully');
    } else {
        console.log('Socket.io not initialized.');
    }
};

// Additional utility functions
const sendMessageToUser = async (userId, messageObject) => {
    try {
        const user = await userModel.findById(userId);
        if (user && user.socketId) {
            sendMessageToSocketId(user.socketId, messageObject);
        } else {
            console.log('User not found or not connected:', userId);
        }
    } catch (error) {
        console.error('Error sending message to user:', error);
    }
};

const sendMessageToCaptain = async (captainId, messageObject) => {
    try {
        const captain = await captainModel.findById(captainId);
        if (captain && captain.socketId) {
            sendMessageToSocketId(captain.socketId, messageObject);
        } else {
            console.log('Captain not found or not connected:', captainId);
        }
    } catch (error) {
        console.error('Error sending message to captain:', error);
    }
};

// Broadcast to all active captains in a radius (if needed)
const broadcastToActiveCaptains = async (messageObject, excludeCaptainId = null) => {
    try {
        const query = { 
            status: 'active', 
            socketId: { $ne: null, $ne: '' } 
        };
        
        if (excludeCaptainId) {
            query._id = { $ne: excludeCaptainId };
        }

        const activeCaptains = await captainModel.find(query);
        
        activeCaptains.forEach(captain => {
            if (captain.socketId) {
                sendMessageToSocketId(captain.socketId, messageObject);
            }
        });

        console.log(`Broadcasted to ${activeCaptains.length} active captains`);
    } catch (error) {
        console.error('Error broadcasting to captains:', error);
    }
};

module.exports = { 
    initializeSocket, 
    sendMessageToSocketId,
    sendMessageToUser,
    sendMessageToCaptain,
    broadcastToActiveCaptains
};
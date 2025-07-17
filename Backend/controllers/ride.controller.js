const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const mapService = require('../services/maps.service');
const { sendMessageToSocketId } = require('../socket');
const rideModel = require('../models/ride.model');

module.exports.createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pickup, destination, vehicleType } = req.body;

    try {
        console.log('Creating ride for user:', req.user._id);
        console.log('Pickup:', pickup, 'Destination:', destination, 'Vehicle Type:', vehicleType);

        const ride = await rideService.createRide({ 
            user: req.user._id, 
            pickup, 
            destination, 
            vehicleType 
        });

        res.status(201).json(ride);

        // Get pickup coordinates
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        console.log('Pickup coordinates:', pickupCoordinates);

        if (!pickupCoordinates || !pickupCoordinates.ltd || !pickupCoordinates.lng) {
            console.error('Invalid pickup coordinates');
            return;
        }

        // Get captains in radius
        const captainsInRadius = await mapService.getCaptainsInTheRadius(
            pickupCoordinates.ltd, 
            pickupCoordinates.lng, 
            2
        );

        console.log(`Total captains in radius: ${captainsInRadius.length}`);
        console.log('Captains in radius:', captainsInRadius.map(c => ({
            id: c._id,
            status: c.status,
            socketId: c.socketId,
            location: c.location
        })));

        // Filter only ACTIVE captains with valid socketId
        const activeCaptains = captainsInRadius.filter(captain => 
            captain.status === 'active' && 
            captain.socketId && 
            captain.socketId.trim() !== ''
        );

        console.log(`Found ${activeCaptains.length} active captains with valid socket connections`);

        if (activeCaptains.length === 0) {
            console.log('No active captains found in the area');
            // You might want to notify the user or expand the search radius
            return;
        }

        // Clear OTP for security
        ride.otp = "";

        // Get ride with user details
        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

        if (!rideWithUser) {
            console.error('Error: Could not find ride with user details');
            return;
        }

        console.log('Ride with user details:', {
            rideId: rideWithUser._id,
            userId: rideWithUser.user._id,
            pickup: rideWithUser.pickup,
            destination: rideWithUser.destination
        });

        // Send to active captains
        let successfulSends = 0;
        activeCaptains.forEach(captain => {
            try {
                console.log(`Sending ride request to captain: ${captain._id} with socket: ${captain.socketId}`);
                
                sendMessageToSocketId(captain.socketId, {
                    event: 'new-ride',
                    data: rideWithUser
                });
                
                successfulSends++;
            } catch (error) {
                console.error(`Error sending ride to captain ${captain._id}:`, error);
            }
        });

        console.log(`Successfully sent ride requests to ${successfulSends} captains`);

    } catch (err) {
        console.error('Error in createRide:', err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.getFare = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickup, destination } = req.query;

    try {
        console.log('Getting fare for:', { pickup, destination });
        
        const fare = await rideService.getFare(pickup, destination);
        console.log('Calculated fare:', fare);
        
        return res.status(200).json(fare);
    } catch (err) {
        console.error('Error in getFare:', err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.confirmRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        console.log('Confirming ride:', rideId, 'by captain:', req.captain._id);

        const ride = await rideService.confirmRide({ rideId, captain: req.captain });

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found or already confirmed' });
        }

        console.log('Ride confirmed successfully:', {
            rideId: ride._id,
            captainId: ride.captain,
            userId: ride.user._id || ride.user,
            userSocketId: ride.user.socketId
        });

        // Send confirmation to user
        if (ride.user.socketId) {
            try {
                sendMessageToSocketId(ride.user.socketId, {
                    event: 'ride-confirmed',
                    data: ride
                });
                console.log('Confirmation sent to user successfully');
            } catch (error) {
                console.error('Error sending confirmation to user:', error);
            }
        } else {
            console.error('User socket ID not found, cannot send confirmation');
        }

        return res.status(200).json(ride);
    } catch (err) {
        console.error('Error in confirmRide:', err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.startRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;

    try {
        console.log('Starting ride:', rideId, 'with OTP:', otp, 'by captain:', req.captain._id);

        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found or invalid OTP' });
        }

        console.log('Ride started successfully:', {
            rideId: ride._id,
            status: ride.status,
            captainId: ride.captain,
            userId: ride.user._id || ride.user
        });

        // Send ride started notification to user
        if (ride.user.socketId) {
            try {
                sendMessageToSocketId(ride.user.socketId, {
                    event: 'ride-started',
                    data: ride
                });
                console.log('Ride started notification sent to user successfully');
            } catch (error) {
                console.error('Error sending ride started notification to user:', error);
            }
        } else {
            console.error('User socket ID not found, cannot send ride started notification');
        }

        return res.status(200).json(ride);
    } catch (err) {
        console.error('Error in startRide:', err);
        return res.status(500).json({ message: err.message });
    }
};

module.exports.endRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        console.log('Ending ride:', rideId, 'by captain:', req.captain._id);

        const ride = await rideService.endRide({ rideId, captain: req.captain });

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found or not authorized' });
        }

        console.log('Ride ended successfully:', {
            rideId: ride._id,
            status: ride.status,
            captainId: ride.captain,
            userId: ride.user._id || ride.user
        });

        // Send ride ended notification to user
        if (ride.user.socketId) {
            try {
                sendMessageToSocketId(ride.user.socketId, {
                    event: 'ride-ended',
                    data: ride
                });
                console.log('Ride ended notification sent to user successfully');
            } catch (error) {
                console.error('Error sending ride ended notification to user:', error);
            }
        } else {
            console.error('User socket ID not found, cannot send ride ended notification');
        }

        return res.status(200).json(ride);
    } catch (err) {
        console.error('Error in endRide:', err);
        return res.status(500).json({ message: err.message });
    }
};

// Additional helper function to get all rides for a captain
module.exports.getCaptainRides = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const query = { captain: req.captain._id };
        if (status) {
            query.status = status;
        }

        const rides = await rideModel.find(query)
            .populate('user', 'fullname email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await rideModel.countDocuments(query);

        return res.status(200).json({
            rides,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error('Error in getCaptainRides:', err);
        return res.status(500).json({ message: err.message });
    }
};

// Get active/pending rides for captain
module.exports.getActiveCaptainRides = async (req, res) => {
    try {
        const activeRides = await rideModel.find({
            captain: req.captain._id,
            status: { $in: ['accepted', 'ongoing'] }
        }).populate('user', 'fullname email phone');

        return res.status(200).json(activeRides);
    } catch (err) {
        console.error('Error in getActiveCaptainRides:', err);
        return res.status(500).json({ message: err.message });
    }
};
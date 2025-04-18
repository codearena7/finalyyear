const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/users
// @desc    Get all users (for admin purposes)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Only allow director to view all users
        if (req.user.role !== 'director') {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const Grievance = require('../models/Grievance');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb('Error: Invalid file type!');
    }
});

// @route   POST api/grievances
// @desc    Submit a new grievance
// @access  Private
router.post('/', [auth, upload.array('attachments', 5)], async (req, res) => {
    try {
        const { title, description, department, category, priority, isAnonymous } = req.body;
        
        const attachments = req.files ? req.files.map(file => ({
            filename: file.originalname,
            path: file.path
        })) : [];

        // Get user details for initial resolution step
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const grievance = new Grievance({
            title,
            description,
            department,
            category,
            priority: priority || 'medium',
            isAnonymous: isAnonymous === 'true' || isAnonymous === true,
            submittedBy: req.user.id,
            attachments,
            resolutionSteps: [{
                status: 'pending',
                resolvedBy: {
                    name: user.name,
                    role: user.role,
                    id: user._id
                },
                comment: 'Grievance submitted',
                date: new Date()
            }]
        });

        await grievance.save();
        res.json(grievance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/grievances
// @desc    Get role-specific grievances
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let query = {};

        // Filter grievances based on user role
        switch (user.role) {
            case 'student':
                query = { submittedBy: req.user.id };
                break;
            case 'department_admin':
                query = { 
                    department: user.department,
                    currentLevel: 'department_admin'
                };
                break;
            case 'hod':
                query = { 
                    department: user.department,
                    currentLevel: 'hod'
                };
                break;
            case 'dean':
            case 'director':
                query = { currentLevel: 'director' };
                break;
            default:
                return res.status(403).json({ msg: 'Unauthorized role' });
        }

        const grievances = await Grievance.find(query)
            .populate('submittedBy', ['name', 'email', 'department'])
            .sort({ createdAt: -1 });

        // Handle anonymous grievances by removing student details
        const processedGrievances = grievances.map(g => {
            const grievance = g.toObject();
            if (grievance.isAnonymous && user.role !== 'student') {
                grievance.submittedBy = {
                    name: 'Anonymous Student',
                    email: 'anonymous@stu.manit.ac.in',
                    department: grievance.department
                };
            }
            return grievance;
        });

        res.json(processedGrievances);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/grievances/:id
// @desc    Get a specific grievance by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const grievance = await Grievance.findById(req.params.id)
            .populate('submittedBy', ['name', 'email', 'department']);

        if (!grievance) {
            return res.status(404).json({ msg: 'Grievance not found' });
        }

        // Check if user has permission to view this grievance
        if (user.role === 'student' && grievance.submittedBy._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to view this grievance' });
        }

        if (['department_admin', 'hod'].includes(user.role) && 
            (grievance.department !== user.department || grievance.currentLevel !== user.role)) {
            return res.status(401).json({ msg: 'Not authorized to view this grievance' });
        }

        if (user.role === 'director' && grievance.currentLevel !== 'director') {
            return res.status(401).json({ msg: 'Not authorized to view this grievance' });
        }

        // Handle anonymous grievances
        const result = grievance.toObject();
        if (result.isAnonymous && user.role !== 'student') {
            result.submittedBy = {
                name: 'Anonymous Student',
                email: 'anonymous@stu.manit.ac.in',
                department: result.department
            };
        }

        res.json(result);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT api/grievances/:id
// @desc    Update grievance status and add resolution steps
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const grievance = await Grievance.findById(req.params.id);

        if (!grievance) {
            return res.status(404).json({ msg: 'Grievance not found' });
        }

        // Check if user has permission to update
        if (user.role === 'student') {
            return res.status(401).json({ msg: 'Students cannot update grievance status' });
        }

        if (['department_admin', 'hod'].includes(user.role) && 
            (grievance.department !== user.department || grievance.currentLevel !== user.role)) {
            return res.status(401).json({ msg: 'Not authorized to update this grievance' });
        }

        if (user.role === 'director' && grievance.currentLevel !== 'director') {
            return res.status(401).json({ msg: 'Not authorized to update this grievance' });
        }

        const { status, comment } = req.body;

        // Update grievance status
        grievance.status = status;
        
        // Add resolution step
        grievance.resolutionSteps.push({
            status,
            resolvedBy: {
                name: user.name,
                role: user.role,
                id: user._id
            },
            comment,
            date: new Date()
        });

        await grievance.save();
        res.json(grievance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/grievances/:id/escalate
// @desc    Manually escalate a grievance
// @access  Private
router.post('/:id/escalate', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const grievance = await Grievance.findById(req.params.id);

        if (!grievance) {
            return res.status(404).json({ msg: 'Grievance not found' });
        }

        // Check if user has permission to escalate
        if (!['department_admin', 'hod'].includes(user.role)) {
            return res.status(401).json({ msg: 'Not authorized to escalate grievances' });
        }

        if (grievance.department !== user.department || grievance.currentLevel !== user.role) {
            return res.status(401).json({ msg: 'Not authorized to escalate this grievance' });
        }

        const { reason } = req.body;
        
        // Determine next level
        let nextLevel;
        if (user.role === 'department_admin') {
            nextLevel = 'hod';
        } else if (user.role === 'hod') {
            nextLevel = 'director';
        }

        // Update grievance
        grievance.status = 'escalated';
        grievance.currentLevel = nextLevel;
        
        // Add to escalation history
        grievance.escalationHistory.push({
            from: { 
                level: user.role,
                user: user._id
            },
            to: { level: nextLevel },
            reason,
            isAutomatic: false,
            date: new Date()
        });
        
        // Add to resolution steps
        grievance.resolutionSteps.push({
            status: 'escalated',
            resolvedBy: {
                name: user.name,
                role: user.role,
                id: user._id
            },
            comment: `Manually escalated to ${nextLevel === 'hod' ? 'HOD' : 'Director'}: ${reason}`,
            date: new Date()
        });

        await grievance.save();
        res.json(grievance);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/grievances/:id/comments
// @desc    Add a comment to a grievance
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const grievance = await Grievance.findById(req.params.id);
        
        if (!grievance) {
            return res.status(404).json({ msg: 'Grievance not found' });
        }

        // Check if user has permission to comment
        if (user.role === 'student' && grievance.submittedBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to comment on this grievance' });
        }

        if (['department_admin', 'hod'].includes(user.role) && 
            (grievance.department !== user.department || grievance.currentLevel !== user.role)) {
            return res.status(401).json({ msg: 'Not authorized to comment on this grievance' });
        }

        if (user.role === 'director' && grievance.currentLevel !== 'director') {
            return res.status(401).json({ msg: 'Not authorized to comment on this grievance' });
        }

        const newComment = {
            text: req.body.text,
            postedBy: req.user.id
        };

        grievance.comments.unshift(newComment);
        await grievance.save();

        // Return the populated comments
        const populatedGrievance = await Grievance.findById(req.params.id)
            .populate('comments.postedBy', ['name', 'role']);

        res.json(populatedGrievance.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/grievances/statistics
// @desc    Get grievance statistics based on user role
// @access  Private
router.get('/statistics', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        let query = {};

        // Filter grievances based on user role
        switch (user.role) {
            case 'student':
                query = { submittedBy: req.user.id };
                break;
            case 'department_admin':
                query = { 
                    department: user.department,
                    currentLevel: 'department_admin'
                };
                break;
            case 'hod':
                query = { 
                    department: user.department,
                    currentLevel: 'hod'
                };
                break;
            case 'dean':
            case 'director':
                query = { currentLevel: 'director' };
                break;
            default:
                return res.status(403).json({ msg: 'Unauthorized role' });
        }

        // Get counts by status
        const pending = await Grievance.countDocuments({ ...query, status: 'pending' });
        const inProgress = await Grievance.countDocuments({ ...query, status: 'in_progress' });
        const escalated = await Grievance.countDocuments({ ...query, status: 'escalated' });
        const resolved = await Grievance.countDocuments({ ...query, status: 'resolved' });
        const rejected = await Grievance.countDocuments({ ...query, status: 'rejected' });
        
        // Get counts by priority
        const high = await Grievance.countDocuments({ ...query, priority: 'high' });
        const medium = await Grievance.countDocuments({ ...query, priority: 'medium' });
        const low = await Grievance.countDocuments({ ...query, priority: 'low' });
        
        // Get overdue grievances
        const overdue = await Grievance.countDocuments({ 
            ...query, 
            dueDate: { $lt: new Date() },
            status: { $nin: ['resolved', 'rejected'] }
        });

        res.json({
            total: pending + inProgress + escalated + resolved + rejected,
            byStatus: { pending, inProgress, escalated, resolved, rejected },
            byPriority: { high, medium, low },
            overdue
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

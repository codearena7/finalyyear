const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'escalated', 'resolved', 'rejected'],
        default: 'pending'
    },
    currentLevel: {
        type: String,
        enum: ['department_admin', 'hod', 'director'],
        default: 'department_admin'
    },
    dueDate: {
        type: Date
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attachments: [{
        filename: String,
        path: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        text: String,
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        postedAt: {
            type: Date,
            default: Date.now
        }
    }],
    resolutionSteps: [{
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'escalated', 'resolved', 'rejected']
        },
        resolvedBy: {
            name: String,
            role: String,
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        },
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    escalationHistory: [{
        from: {
            level: String,
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        },
        to: {
            level: String
        },
        reason: String,
        isAutomatic: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate due date based on priority
grievanceSchema.pre('save', function(next) {
    // Only set due date on creation
    if (this.isNew) {
        const now = new Date();
        switch(this.priority) {
            case 'high':
                // 24 hours
                this.dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                break;
            case 'medium':
                // 2 days
                this.dueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
                break;
            case 'low':
                // 3 days
                this.dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
                break;
            default:
                // Default to 2 days
                this.dueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
        }
    }
    next();
});

// Auto-escalation middleware
grievanceSchema.pre('save', function(next) {
    const now = new Date();
    
    // Skip for new grievances or already resolved/rejected ones
    if (this.isNew || this.status === 'resolved' || this.status === 'rejected') {
        this.lastUpdatedAt = now;
        return next();
    }
    
    // Check for auto-escalation (5 days of inactivity)
    const daysSinceLastUpdate = (now - this.lastUpdatedAt) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastUpdate >= 5) {
        // Auto-escalate based on current level
        if (this.currentLevel === 'department_admin') {
            this.currentLevel = 'hod';
            this.status = 'escalated';
            
            // Add to escalation history
            this.escalationHistory.push({
                from: { level: 'department_admin' },
                to: { level: 'hod' },
                reason: 'Auto-escalated due to inactivity for 5 days',
                isAutomatic: true,
                date: now
            });
            
            // Add to resolution steps
            this.resolutionSteps.push({
                status: 'escalated',
                resolvedBy: {
                    name: 'System',
                    role: 'system'
                },
                comment: 'Automatically escalated to HOD due to inactivity for 5 days',
                date: now
            });
            
        } else if (this.currentLevel === 'hod') {
            this.currentLevel = 'director';
            this.status = 'escalated';
            
            // Add to escalation history
            this.escalationHistory.push({
                from: { level: 'hod' },
                to: { level: 'director' },
                reason: 'Auto-escalated due to inactivity for 5 days',
                isAutomatic: true,
                date: now
            });
            
            // Add to resolution steps
            this.resolutionSteps.push({
                status: 'escalated',
                resolvedBy: {
                    name: 'System',
                    role: 'system'
                },
                comment: 'Automatically escalated to Director due to inactivity for 5 days',
                date: now
            });
        }
    }
    
    // Check if grievance is past due date and not escalated yet
    if (this.dueDate && now > this.dueDate && this.status !== 'escalated') {
        // Mark as overdue by updating status
        this.status = 'escalated';
        
        // Add to resolution steps
        this.resolutionSteps.push({
            status: 'escalated',
            resolvedBy: {
                name: 'System',
                role: 'system'
            },
            comment: `Grievance has passed its due date (${this.dueDate.toLocaleDateString()})`,
            date: now
        });
    }

    this.lastUpdatedAt = now;
    next();
});

module.exports = mongoose.model('Grievance', grievanceSchema);

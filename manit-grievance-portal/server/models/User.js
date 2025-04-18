const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetOTP: String,
    passwordResetOTPExpires: Date,
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function(v) {
                console.log('Validating email:', v, 'for role:', this.role);
                if (this.role === 'student') {
                    const isValid = /@stu\.manit\.ac\.in$/.test(v);
                    console.log('Student email validation result:', isValid);
                    return isValid;
                }
                const isValid = /@manit\.ac\.in$/.test(v);
                console.log('Staff email validation result:', isValid);
                return isValid;
            },
            message: props => `${props.value} is not a valid MANIT email address!`
        }
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'department_admin', 'hod', 'director'],
        required: true
    },
    department: {
        type: String,
        required: function() {
            return ['student', 'department_admin', 'hod'].includes(this.role);
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);

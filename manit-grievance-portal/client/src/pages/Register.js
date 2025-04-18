import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import manitLogo from '../assets/manitLogo.jpg';

const departments = [
    'Computer Science',
    'Electronics & Communication',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Mathematics',
    'Physics',
    'Humanities',
];

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        department: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateEmail = (email) => {
        if (formData.role === 'student') {
            return email.endsWith('@stu.manit.ac.in');
        }
        return email.endsWith('@manit.ac.in');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Please use a valid MANIT email address');
            return;
        }

        if (['student', 'department_admin', 'hod'].includes(formData.role) && !formData.department) {
            setError('Department is required for this role');
            return;
        }

        try {
            console.log('Submitting registration data:', {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                department: formData.department
            });
            
            const userData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                department: formData.department,
            };

            await register(userData);
            setSuccess(true);
            setError('');
            // Do not navigate to dashboard - user needs to verify email first
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <img src={manitLogo} alt="MANIT Logo" style={{ height: '80px' }} />
                    </Box>
                    {success ? (
                        <>
                            <Typography variant="h4" align="center" gutterBottom color="primary">
                                Registration Successful!
                            </Typography>
                            <Typography variant="body1" align="center" paragraph>
                                A verification email has been sent to {formData.email}.
                                Please check your email and click the verification link to activate your account.
                            </Typography>
                            <Typography variant="body2" align="center" color="textSecondary">
                                Note: The verification link will expire in 24 hours.
                            </Typography>
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/login')}
                                >
                                    Go to Login
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Typography variant="h4" align="center" gutterBottom>
                                Register
                            </Typography>
                            <Typography
                                variant="body2"
                                align="center"
                                color="textSecondary"
                                paragraph
                            >
                                Create your MANIT Grievance Portal account
                            </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="name"
                            label="Full Name"
                            type="text"
                            id="name"
                            autoFocus
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="email"
                            label="Email Address"
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            helperText={
                                formData.role === 'student'
                                    ? 'Use your @stu.manit.ac.in email'
                                    : 'Use your @manit.ac.in email'
                            }
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Role</InputLabel>
                            <Select
                                name="role"
                                value={formData.role}
                                label="Role"
                                onChange={handleChange}
                            >
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="department_admin">
                                    Department Admin
                                </MenuItem>
                                <MenuItem value="hod">Head of Department</MenuItem>
                                <MenuItem value="director">Director</MenuItem>
                            </Select>
                        </FormControl>

                        {['student', 'department_admin', 'hod'].includes(formData.role) && (
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Department</InputLabel>
                                <Select
                                    name="department"
                                    value={formData.department}
                                    label="Department"
                                    onChange={handleChange}
                                >
                                    {departments.map((dept) => (
                                        <MenuItem key={dept} value={dept}>
                                            {dept}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Register
                        </Button>
                    </form>
                        </>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;

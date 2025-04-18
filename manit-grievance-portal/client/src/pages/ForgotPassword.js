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
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import axios from 'axios';
import manitLogo from '../assets/manitLogo.jpg';

const steps = ['Request OTP', 'Verify OTP & Reset Password'];

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            setSuccess(res.data.msg);
            setActiveStep(1);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post('/api/auth/reset-password', {
                email,
                otp,
                newPassword,
            });
            setSuccess(res.data.msg);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <img src={manitLogo} alt="MANIT Logo" style={{ height: '80px' }} />
                    </Box>
                    <Typography variant="h4" align="center" gutterBottom>
                        Forgot Password
                    </Typography>

                    <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    {activeStep === 0 ? (
                        <form onSubmit={handleRequestOTP}>
                            <Typography variant="body2" paragraph>
                                Enter your email address to receive a password reset OTP
                            </Typography>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </Button>
                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Button
                                    variant="text"
                                    onClick={() => navigate('/login')}
                                    disabled={loading}
                                >
                                    Back to Login
                                </Button>
                            </Box>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <Typography variant="body2" paragraph>
                                Enter the OTP sent to your email and your new password
                            </Typography>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="otp"
                                label="OTP Code"
                                name="otp"
                                autoFocus
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                disabled={loading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="newPassword"
                                label="New Password"
                                type="password"
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={loading}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm New Password"
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                            <Box sx={{ textAlign: 'center', mt: 1 }}>
                                <Button
                                    variant="text"
                                    onClick={() => {
                                        setActiveStep(0);
                                        setError('');
                                        setSuccess('');
                                    }}
                                    disabled={loading}
                                >
                                    Back to Request OTP
                                </Button>
                            </Box>
                        </form>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default ForgotPassword;

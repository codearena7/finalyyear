import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Button,
    Alert,
} from '@mui/material';
import axios from 'axios';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const res = await axios.get(`/api/auth/verify-email/${token}`);
                setSuccess(true);
                setError('');
            } catch (err) {
                setError(err.response?.data?.msg || 'Verification failed');
            } finally {
                setVerifying(false);
            }
        };

        verifyEmail();
    }, [token]);

    const handleNavigate = () => {
        navigate('/login');
    };

    if (verifying) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="80vh"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    {success ? (
                        <>
                            <Typography variant="h4" gutterBottom color="primary">
                                Email Verified!
                            </Typography>
                            <Typography paragraph>
                                Your email has been successfully verified. You can now log in to your account.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={handleNavigate}
                                sx={{ mt: 2 }}
                            >
                                Go to Login
                            </Button>
                        </>
                    ) : (
                        <>
                            <Typography variant="h4" gutterBottom color="error">
                                Verification Failed
                            </Typography>
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                            <Typography paragraph>
                                The verification link may have expired or is invalid.
                                Please try registering again or request a new verification email.
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/register')}
                                sx={{ mt: 2 }}
                            >
                                Register Again
                            </Button>
                        </>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default VerifyEmail;

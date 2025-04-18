import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    TextField,
    Button,
    Alert,
    CircularProgress,
    MenuItem,
    Chip,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import {
    Timeline,
    TimelineItem,
    TimelineSeparator,
    TimelineConnector,
    TimelineContent,
    TimelineDot
} from '@mui/lab';
import { useAuth } from '../context/AuthContext';

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'rejected', label: 'Rejected' }
];

const getStatusColor = (status) => {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'in_progress':
            return 'info';
        case 'escalated':
            return 'error';
        case 'resolved':
            return 'success';
        case 'rejected':
            return 'error';
        default:
            return 'default';
    }
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high':
            return 'error';
        case 'medium':
            return 'warning';
        case 'low':
            return 'info';
        default:
            return 'default';
    }
};

const isPastDue = (dueDate) => {
    if (!dueDate) return false;
    return new Date() > new Date(dueDate);
};

const GrievanceDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [grievance, setGrievance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comment, setComment] = useState('');
    const [status, setStatus] = useState('');
    const [updating, setUpdating] = useState(false);
    const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
    const [escalationReason, setEscalationReason] = useState('');
    const [escalating, setEscalating] = useState(false);

    useEffect(() => {
        const fetchGrievance = async () => {
            try {
                const response = await axios.get(`/api/grievances/${id}`);
                setGrievance(response.data);
                setStatus(response.data.status);
            } catch (err) {
                setError(err.response?.data?.msg || 'Error fetching grievance details');
            } finally {
                setLoading(false);
            }
        };

        fetchGrievance();
    }, [id]);

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        if (!comment || !status) {
            setError('Please provide both status and comment');
            return;
        }

        setUpdating(true);
        try {
            await axios.put(`/api/grievances/${id}`, { status, comment });
            const response = await axios.get(`/api/grievances/${id}`);
            setGrievance(response.data);
            setComment('');
            setError('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error updating grievance');
        } finally {
            setUpdating(false);
        }
    };

    const canUpdateStatus = () => {
        if (!user || !grievance) return false;
        if (user.role === 'student') return false;
        
        // Check if the user is at the current level of the grievance
        if (user.role === grievance.currentLevel) {
            return true;
        }
        
        return false;
    };
    
    const canEscalate = () => {
        if (!user || !grievance) return false;
        if (user.role === 'student' || user.role === 'director') return false;
        
        // Only department_admin and hod can escalate, and only if they are at the current level
        return ['department_admin', 'hod'].includes(user.role) && user.role === grievance.currentLevel;
    };
    
    const handleEscalateDialog = () => {
        setEscalateDialogOpen(true);
    };
    
    const handleEscalate = async () => {
        if (!escalationReason) {
            setError('Please provide a reason for escalation');
            return;
        }
        
        setEscalating(true);
        try {
            await axios.post(`/api/grievances/${id}/escalate`, { reason: escalationReason });
            const response = await axios.get(`/api/grievances/${id}`);
            setGrievance(response.data);
            setEscalateDialogOpen(false);
            setEscalationReason('');
            setError('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error escalating grievance');
        } finally {
            setEscalating(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment) {
            setError('Please provide a comment');
            return;
        }

        try {
            await axios.post(`/api/grievances/${id}/comments`, { text: comment });
            setComment('');
            const response = await axios.get(`/api/grievances/${id}`);
            setGrievance(response.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error adding comment');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (!grievance) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Alert severity="error">
                    Grievance not found
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h4" component="h1">
                        Grievance Details
                    </Typography>
                    <Chip
                        label={grievance.status.replace('_', ' ')}
                        color={getStatusColor(grievance.status)}
                    />
                </Box>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Title
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Department
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {grievance.department}
                        </Typography>

                        <Typography variant="subtitle2" color="textSecondary">
                            Submitted By
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {grievance.user?.name}
                        </Typography>

                        <Typography variant="subtitle2" color="textSecondary">
                            Submitted On
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {new Date(grievance.date).toLocaleDateString()}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                            Description
                        </Typography>
                        <Typography variant="body1" paragraph>
                            {grievance.description}
                        </Typography>
                    </Grid>

                    {grievance.attachments?.length > 0 && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                Attachments
                            </Typography>
                            <Box display="flex" gap={1}>
                                {grievance.attachments.map((file, index) => (
                                    <Button
                                        key={index}
                                        variant="outlined"
                                        size="small"
                                        href={`/api/grievances/attachment/${file}`}
                                        target="_blank"
                                    >
                                        View File {index + 1}
                                    </Button>
                                ))}
                            </Box>
                        </Grid>
                    )}
                </Grid>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                        Resolution Timeline
                    </Typography>
                    <Timeline>
                        {grievance.resolutionSteps?.map((step, index) => (
                            <TimelineItem key={index}>
                                <TimelineSeparator>
                                    <TimelineDot color={getStatusColor(step.status)} />
                                    {index < grievance.resolutionSteps.length - 1 && <TimelineConnector />}
                                </TimelineSeparator>
                                <TimelineContent>
                                    <Typography variant="subtitle2">
                                        {step.resolvedBy.name} ({step.resolvedBy.role.replace('_', ' ')})
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        {new Date(step.date).toLocaleString()}
                                    </Typography>
                                    <Typography variant="body1">
                                        {step.comment}
                                    </Typography>
                                </TimelineContent>
                            </TimelineItem>
                        ))}
                    </Timeline>
                </Box>
                
                {grievance.escalationHistory && grievance.escalationHistory.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Escalation History
                        </Typography>
                        <Timeline>
                            {grievance.escalationHistory.map((escalation, index) => (
                                <TimelineItem key={index}>
                                    <TimelineSeparator>
                                        <TimelineDot color="error" />
                                        {index < grievance.escalationHistory.length - 1 && <TimelineConnector />}
                                    </TimelineSeparator>
                                    <TimelineContent>
                                        <Typography variant="subtitle2">
                                            Escalated from {escalation.from.level.replace('_', ' ')} to {escalation.to.level.replace('_', ' ')}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {new Date(escalation.date).toLocaleString()} {escalation.isAutomatic && '(Automatic)'}
                                        </Typography>
                                        <Typography variant="body1">
                                            {escalation.reason}
                                        </Typography>
                                    </TimelineContent>
                                </TimelineItem>
                            ))}
                        </Timeline>
                    </Box>
                )}

                {canUpdateStatus() && (
                    <Box component="form" onSubmit={handleUpdateStatus} sx={{ mt: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Update Status
                        </Typography>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    disabled={updating}
                                >
                                    {statusOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    label="Comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    disabled={updating}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={updating}
                                    sx={{ mr: 2 }}
                                >
                                    {updating ? 'Updating...' : 'Update Status'}
                                </Button>
                                
                                {canEscalate() && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={handleEscalateDialog}
                                        disabled={updating}
                                    >
                                        Escalate Grievance
                                    </Button>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                )}
                
                {/* Escalation Dialog */}
                <Dialog open={escalateDialogOpen} onClose={() => setEscalateDialogOpen(false)}>
                    <DialogTitle>Escalate Grievance</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to escalate this grievance? This will move it to the next level in the hierarchy.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Reason for Escalation"
                            fullWidth
                            multiline
                            rows={3}
                            value={escalationReason}
                            onChange={(e) => setEscalationReason(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEscalateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEscalate} color="error">
                            Escalate
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </Container>
    );
};

export default GrievanceDetails;

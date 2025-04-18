import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    LinearProgress,
} from '@mui/material';
import {
    PendingActions,
    CheckCircle,
    Settings,
    Schedule,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color, percentage = 0 }) => (
    <Paper elevation={2} sx={{ 
        p: 3, 
        height: '100%', 
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }
    }}>
        <Box display="flex" alignItems="center" mb={1.5}>
            <Box sx={{ 
                mr: 2, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 1.5,
                borderRadius: '50%',
                bgcolor: `${color}.light`,
                color: `${color}.main`
            }}>
                {icon}
            </Box>
            <Box flexGrow={1}>
                <Typography variant="h6" component="div" fontWeight="600">
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
            </Box>
        </Box>
        <LinearProgress 
            variant="determinate" 
            value={percentage} 
            color={color} 
            sx={{ height: 6, borderRadius: 3 }} 
        />
    </Paper>
);

const DashboardStats = ({ grievances, loading }) => {
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    const stats = {
        total: grievances.length,
        pending: grievances.filter(g => g.status === 'pending').length,
        inProgress: grievances.filter(g => g.status === 'in_progress').length,
        resolved: grievances.filter(g => g.status === 'resolved').length,
    };

    // Calculate percentages for progress bars
    const totalGrievances = stats.total || 1; // Avoid division by zero
    const pendingPercentage = (stats.pending / totalGrievances) * 100;
    const inProgressPercentage = (stats.inProgress / totalGrievances) * 100;
    const resolvedPercentage = (stats.resolved / totalGrievances) * 100;

    return (
        <Grid container spacing={4} sx={{ mb: 5, mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Total Grievances"
                    value={stats.total}
                    icon={<PendingActions fontSize="medium" />}
                    color="primary"
                    percentage={100}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={<Schedule fontSize="medium" />}
                    color="warning"
                    percentage={pendingPercentage}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="In Progress"
                    value={stats.inProgress}
                    icon={<Settings fontSize="medium" />}
                    color="info"
                    percentage={inProgressPercentage}
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Resolved"
                    value={stats.resolved}
                    icon={<CheckCircle fontSize="medium" />}
                    color="success"
                    percentage={resolvedPercentage}
                />
            </Grid>
        </Grid>
    );
};

export default DashboardStats;

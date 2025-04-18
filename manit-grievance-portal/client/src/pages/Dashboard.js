import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
    Tab,
    Tabs,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery,
    Divider
} from '@mui/material';
import { Add as AddIcon, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import DashboardStats from '../components/dashboard/DashboardStats';
import GrievanceTable from '../components/dashboard/GrievanceTable';

// Status color mapping for different grievance statuses
const statusColors = {
    pending: 'warning',
    in_progress: 'info',
    escalated: 'error',
    resolved: 'success',
    rejected: 'error',
};

const Dashboard = () => {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        fetchGrievances();
    }, []);

    const fetchGrievances = async () => {
        try {
            const response = await axios.get('/api/grievances');
            setGrievances(response.data);
        } catch (err) {
            setError('Failed to fetch grievances');
            console.error('Error fetching grievances:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const filterGrievances = (status) => {
        if (status === 'all') return grievances;
        return grievances.filter(g => g.status === status);
    };

    const getRoleTitle = () => {
        switch (user.role) {
            case 'student':
                return 'My Grievances';
            case 'department_admin':
                return `${user.department} Department Grievances`;
            case 'hod':
                return `${user.department} Department HOD Dashboard`;
            case 'dean':
                return 'Dean Dashboard';
            case 'director':
                return 'Director Dashboard';
            default:
                return 'Dashboard';
        }
    };

    const handleViewGrievance = (id) => {
        navigate(`/grievance/${id}`);
    };

    if (loading) {
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
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 3, 
                    mb: 4, 
                    background: 'linear-gradient(to right, #1E3A8A, #3B82F6)',
                    borderRadius: 2,
                    color: 'white'
                }}
            >
                <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={isMobile ? 'flex-start' : 'center'} gap={2}>
                    <Box display="flex" alignItems="center">
                        <DashboardIcon sx={{ fontSize: 32, mr: 2 }} />
                        <Typography variant="h4" component="h1" fontWeight="600">
                            {getRoleTitle()}
                        </Typography>
                    </Box>
                    {user.role === 'student' && (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/new-grievance')}
                            sx={{ 
                                bgcolor: '#10B981', 
                                color: 'white',
                                px: 3,
                                py: 1,
                                '&:hover': {
                                    bgcolor: '#059669'
                                }
                            }}
                        >
                            New Grievance
                        </Button>
                    )}
                </Box>
            </Paper>

            <DashboardStats grievances={grievances} loading={loading} />

            <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    sx={{
                        '& .MuiTab-root': {
                            py: 2,
                            fontWeight: 500,
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: 'rgba(59, 130, 246, 0.08)'
                            }
                        },
                        '& .Mui-selected': {
                            fontWeight: 600
                        }
                    }}
                >
                    <Tab label="All" />
                    <Tab label="Pending" />
                    <Tab label="In Progress" />
                    <Tab label="Resolved" />
                </Tabs>
            </Paper>

            {error && (
                <Box sx={{ mb: 3 }}>
                    <Alert severity="error" onClose={() => setError('')}>
                        {error}
                    </Alert>
                </Box>
            )}
            {loading ? (
                <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                </Box>
            ) : (
                <GrievanceTable
                    grievances={filterGrievances(
                        tabValue === 0 ? 'all' :
                        tabValue === 1 ? 'pending' :
                        tabValue === 2 ? 'in_progress' : 'resolved'
                    )}
                />
            )}
        </Container>
    );
};

export default Dashboard;

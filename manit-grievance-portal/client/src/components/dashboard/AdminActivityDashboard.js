import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Card,
    CardContent,
    Divider,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Tooltip,
    LinearProgress,
    useTheme
} from '@mui/material';
import {
    PendingActions,
    CheckCircle,
    Settings,
    Schedule,
    ErrorOutline,
    Visibility,
    TrendingUp,
    AccessTime,
    CalendarToday,
    Notifications,
    Person,
    School,
    Assignment,
    SupervisorAccount,
    Timeline,
    BarChart,
    DonutLarge
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    ArcElement, 
    ChartTooltip, 
    Legend, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    Title
);

// Format date helper function
const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        console.error('Date formatting error:', error);
        return 'Invalid Date';
    }
};

// Get status info helper function
const getStatusInfo = (status) => {
    switch (status) {
        case 'pending':
            return { 
                color: 'warning', 
                icon: <Schedule fontSize="small" />, 
                progress: 25,
                label: 'Pending' 
            };
        case 'in_progress':
            return { 
                color: 'info', 
                icon: <Settings fontSize="small" />, 
                progress: 50,
                label: 'In Progress' 
            };
        case 'escalated':
            return { 
                color: 'error', 
                icon: <ErrorOutline fontSize="small" />, 
                progress: 75,
                label: 'Escalated' 
            };
        case 'resolved':
            return { 
                color: 'success', 
                icon: <CheckCircle fontSize="small" />, 
                progress: 100,
                label: 'Resolved' 
            };
        case 'rejected':
            return { 
                color: 'error', 
                icon: <ErrorOutline fontSize="small" />, 
                progress: 0,
                label: 'Rejected' 
            };
        default:
            return { 
                color: 'default', 
                icon: null, 
                progress: 0,
                label: status.charAt(0).toUpperCase() + status.slice(1) 
            };
    }
};

// Activity Item Component
const ActivityItem = ({ activity }) => {
    const statusInfo = activity.type === 'status_change' ? getStatusInfo(activity.newStatus) : null;
    
    const getActivityIcon = () => {
        switch (activity.type) {
            case 'new_grievance':
                return <Assignment color="primary" />;
            case 'status_change':
                return statusInfo?.icon || <Settings color="info" />;
            case 'comment':
                return <Person color="secondary" />;
            case 'escalation':
                return <TrendingUp color="error" />;
            case 'user_login':
                return <Person color="success" />;
            default:
                return <Notifications color="default" />;
        }
    };
    
    return (
        <ListItem 
            alignItems="flex-start" 
            sx={{ 
                py: 1.5, 
                borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
            }}
        >
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: activity.type === 'status_change' ? `${statusInfo?.color}.light` : 'primary.light' }}>
                    {getActivityIcon()}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={
                    <Typography variant="subtitle1" component="span" fontWeight="500">
                        {activity.title}
                    </Typography>
                }
                secondary={
                    <>
                        <Typography variant="body2" color="text.secondary" component="span">
                            {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            {formatDate(activity.timestamp)}
                        </Typography>
                        {activity.grievanceId && (
                            <Chip 
                                size="small" 
                                label={`ID: ${activity.grievanceId.substring(0, 8)}...`} 
                                color="primary" 
                                variant="outlined" 
                                sx={{ mt: 0.5, mr: 0.5 }} 
                            />
                        )}
                        {activity.type === 'status_change' && (
                            <Chip 
                                size="small" 
                                icon={statusInfo?.icon} 
                                label={statusInfo?.label} 
                                color={statusInfo?.color} 
                                sx={{ mt: 0.5 }} 
                            />
                        )}
                    </>
                }
            />
        </ListItem>
    );
};

// Main Dashboard Component
const AdminActivityDashboard = ({ grievances, users, loading }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [tabValue, setTabValue] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [activities, setActivities] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [activityFilter, setActivityFilter] = useState('all');

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Handle pagination
    const handleChangePage = (event, newValue) => {
        setPage(newValue);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Generate activities from grievances data
    useEffect(() => {
        if (grievances && grievances.length > 0) {
            const generatedActivities = [];
            
            // New grievances
            grievances.forEach(grievance => {
                // New grievance activity
                generatedActivities.push({
                    id: `new-${grievance._id}`,
                    type: 'new_grievance',
                    title: 'New Grievance Submitted',
                    description: `${grievance.title} submitted to ${grievance.department} department`,
                    timestamp: grievance.createdAt,
                    grievanceId: grievance._id,
                    userId: grievance.submittedBy?._id,
                    department: grievance.department
                });
                
                // Status changes from resolution steps
                grievance.resolutionSteps?.forEach((step, index) => {
                    generatedActivities.push({
                        id: `step-${grievance._id}-${index}`,
                        type: 'status_change',
                        title: 'Status Changed',
                        description: `Grievance status changed to ${step.status} by ${step.resolvedBy?.name || 'System'}`,
                        timestamp: step.date,
                        grievanceId: grievance._id,
                        newStatus: step.status,
                        userId: step.resolvedBy?.id,
                        department: grievance.department
                    });
                });
                
                // Comments
                grievance.comments?.forEach((comment, index) => {
                    generatedActivities.push({
                        id: `comment-${grievance._id}-${index}`,
                        type: 'comment',
                        title: 'New Comment',
                        description: `${comment.postedBy?.name || 'Anonymous'} commented on grievance`,
                        timestamp: comment.postedAt,
                        grievanceId: grievance._id,
                        userId: comment.postedBy,
                        department: grievance.department
                    });
                });
                
                // Escalations
                grievance.escalationHistory?.forEach((escalation, index) => {
                    generatedActivities.push({
                        id: `escalation-${grievance._id}-${index}`,
                        type: 'escalation',
                        title: 'Grievance Escalated',
                        description: `Escalated from ${escalation.from.level} to ${escalation.to.level}${escalation.isAutomatic ? ' (Automatic)' : ''}`,
                        timestamp: escalation.date,
                        grievanceId: grievance._id,
                        userId: escalation.from.user,
                        department: grievance.department
                    });
                });
            });
            
            // Sort activities by timestamp (newest first)
            generatedActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            setActivities(generatedActivities);
            setFilteredActivities(generatedActivities);
        }
    }, [grievances]);

    // Filter activities based on selected filter
    useEffect(() => {
        if (activities.length > 0) {
            if (activityFilter === 'all') {
                setFilteredActivities(activities);
            } else {
                setFilteredActivities(activities.filter(activity => activity.type === activityFilter));
            }
        }
    }, [activityFilter, activities]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    // Calculate statistics
    const stats = {
        total: grievances.length,
        pending: grievances.filter(g => g.status === 'pending').length,
        inProgress: grievances.filter(g => g.status === 'in_progress').length,
        escalated: grievances.filter(g => g.status === 'escalated').length,
        resolved: grievances.filter(g => g.status === 'resolved').length,
        rejected: grievances.filter(g => g.status === 'rejected').length,
        departments: {},
        categories: {},
        priorities: {
            high: grievances.filter(g => g.priority === 'high').length,
            medium: grievances.filter(g => g.priority === 'medium').length,
            low: grievances.filter(g => g.priority === 'low').length
        },
        overdue: grievances.filter(g => new Date() > new Date(g.dueDate) && g.status !== 'resolved' && g.status !== 'rejected').length
    };

    // Calculate department statistics
    grievances.forEach(grievance => {
        if (grievance.department) {
            if (!stats.departments[grievance.department]) {
                stats.departments[grievance.department] = 1;
            } else {
                stats.departments[grievance.department]++;
            }
        }
        
        if (grievance.category) {
            if (!stats.categories[grievance.category]) {
                stats.categories[grievance.category] = 1;
            } else {
                stats.categories[grievance.category]++;
            }
        }
    });

    // Calculate average resolution time (in days)
    const resolvedGrievances = grievances.filter(g => g.status === 'resolved');
    const totalResolutionTime = resolvedGrievances.reduce((total, g) => {
        const createdDate = new Date(g.createdAt);
        const resolvedDate = new Date(g.resolutionSteps?.find(step => step.status === 'resolved')?.date || g.lastUpdatedAt);
        return total + (resolvedDate - createdDate) / (1000 * 60 * 60 * 24); // Convert to days
    }, 0);
    
    const avgResolutionTime = resolvedGrievances.length > 0 
        ? (totalResolutionTime / resolvedGrievances.length).toFixed(1) 
        : 0;

    // Prepare chart data
    const statusChartData = {
        labels: ['Pending', 'In Progress', 'Escalated', 'Resolved', 'Rejected'],
        datasets: [
            {
                data: [stats.pending, stats.inProgress, stats.escalated, stats.resolved, stats.rejected],
                backgroundColor: [
                    theme.palette.warning.main,
                    theme.palette.info.main,
                    theme.palette.error.main,
                    theme.palette.success.main,
                    theme.palette.grey[500],
                ],
                borderWidth: 1,
            },
        ],
    };

    const priorityChartData = {
        labels: ['High', 'Medium', 'Low'],
        datasets: [
            {
                data: [stats.priorities.high, stats.priorities.medium, stats.priorities.low],
                backgroundColor: [
                    theme.palette.error.main,
                    theme.palette.warning.main,
                    theme.palette.success.main,
                ],
                borderWidth: 1,
            },
        ],
    };

    // Department chart data
    const departmentLabels = Object.keys(stats.departments);
    const departmentValues = Object.values(stats.departments);
    
    const departmentChartData = {
        labels: departmentLabels,
        datasets: [
            {
                label: 'Grievances by Department',
                data: departmentValues,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Category chart data
    const categoryLabels = Object.keys(stats.categories);
    const categoryValues = Object.values(stats.categories);
    
    const categoryChartData = {
        labels: categoryLabels,
        datasets: [
            {
                label: 'Grievances by Category',
                data: categoryValues,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" fontWeight="600" sx={{ mb: 3, color: '#1E3A8A' }}>
                Admin Activity Dashboard
            </Typography>
            
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2} sx={{ 
                        borderRadius: 2,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid rgba(224, 224, 224, 0.5)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                        }
                    }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <Box sx={{ 
                                    mr: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    p: 1.5,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.light',
                                    color: 'primary.main'
                                }}>
                                    <PendingActions />
                                </Box>
                                <Box>
                                    <Typography variant="h4" component="div" fontWeight="600" sx={{ color: '#1E3A8A' }}>
                                        {stats.total}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Total Grievances
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2} sx={{ 
                        borderRadius: 2,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid rgba(224, 224, 224, 0.5)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                        }
                    }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <Box sx={{ 
                                    mr: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    p: 1.5,
                                    borderRadius: '50%',
                                    bgcolor: 'success.light',
                                    color: 'success.main'
                                }}>
                                    <CheckCircle />
                                </Box>
                                <Box>
                                    <Typography variant="h4" component="div" fontWeight="600" sx={{ color: '#1E3A8A' }}>
                                        {stats.resolved}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Resolved
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2} sx={{ 
                        borderRadius: 2,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid rgba(224, 224, 224, 0.5)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                        }
                    }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <Box sx={{ 
                                    mr: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    p: 1.5,
                                    borderRadius: '50%',
                                    bgcolor: 'error.light',
                                    color: 'error.main'
                                }}>
                                    <ErrorOutline />
                                </Box>
                                <Box>
                                    <Typography variant="h4" component="div" fontWeight="600" sx={{ color: '#1E3A8A' }}>
                                        {stats.overdue}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Overdue
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Card elevation={2} sx={{ 
                        borderRadius: 2,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        border: '1px solid rgba(224, 224, 224, 0.5)',
                        '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                        }
                    }}>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={1}>
                                <Box sx={{ 
                                    mr: 2, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    p: 1.5,
                                    borderRadius: '50%',
                                    bgcolor: 'info.light',
                                    color: 'info.main'
                                }}>
                                    <AccessTime />
                                </Box>
                                <Box>
                                    <Typography variant="h4" component="div" fontWeight="600" sx={{ color: '#1E3A8A' }}>
                                        {avgResolutionTime}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary">
                                        Avg. Days to Resolve
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ 
                        p: 2, 
                        height: '100%', 
                        borderRadius: 2,
                        border: '1px solid rgba(224, 224, 224, 0.5)'
                    }}>
                        <Typography variant="h6" component="h3" fontWeight="600" sx={{ mb: 2, color: '#1E3A8A' }}>
                            Grievance Status Distribution
                        </Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
                        </Box>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ 
                        p: 2, 
                        height: '100%', 
                        borderRadius: 2,
                        border: '1px solid rgba(224, 224, 224, 0.5)'
                    }}>
                        <Typography variant="h6" component="h3" fontWeight="600" sx={{ mb: 2, color: '#1E3A8A' }}>
                            Grievance Priority Distribution
                        </Typography>
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                            <Pie data={priorityChartData} options={{ maintainAspectRatio: false }} />
                        </Box>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ 
                        p: 2, 
                        height: '100%', 
                        borderRadius: 2,
                        border: '1px solid rgba(224, 224, 224, 0.5)'
                    }}>
                        <Typography variant="h6" component="h3" fontWeight="600" sx={{ mb: 2, color: '#1E3A8A' }}>
                            Grievances by Department
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <Bar 
                                data={departmentChartData} 
                                options={{ 
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                precision: 0
                                            }
                                        }
                                    }
                                }} 
                            />
                        </Box>
                    </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                    <Card elevation={2} sx={{ 
                        p: 2, 
                        height: '100%', 
                        borderRadius: 2,
                        border: '1px solid rgba(224, 224, 224, 0.5)'
                    }}>
                        <Typography variant="h6" component="h3" fontWeight="600" sx={{ mb: 2, color: '#1E3A8A' }}>
                            Grievances by Category
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <Bar 
                                data={categoryChartData} 
                                options={{ 
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            ticks: {
                                                precision: 0
                                            }
                                        }
                                    }
                                }} 
                            />
                        </Box>
                    </Card>
                </Grid>
            </Grid>
            
            {/* Activity Feed */}
            <Card elevation={2} sx={{ 
                borderRadius: 2,
                border: '1px solid rgba(224, 224, 224, 0.5)'
            }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Typography variant="h6" component="h3" fontWeight="600" sx={{ my: 2, color: '#1E3A8A' }}>
                        Activity Feed
                    </Typography>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange} 
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ mb: 1 }}
                    >
                        <Tab 
                            label="All Activities" 
                            icon={<Timeline />} 
                            iconPosition="start" 
                            onClick={() => setActivityFilter('all')}
                        />
                        <Tab 
                            label="New Grievances" 
                            icon={<Assignment />} 
                            iconPosition="start" 
                            onClick={() => setActivityFilter('new_grievance')}
                        />
                        <Tab 
                            label="Status Changes" 
                            icon={<Settings />} 
                            iconPosition="start" 
                            onClick={() => setActivityFilter('status_change')}
                        />
                        <Tab 
                            label="Comments" 
                            icon={<Person />} 
                            iconPosition="start" 
                            onClick={() => setActivityFilter('comment')}
                        />
                        <Tab 
                            label="Escalations" 
                            icon={<TrendingUp />} 
                            iconPosition="start" 
                            onClick={() => setActivityFilter('escalation')}
                        />
                    </Tabs>
                </Box>
                
                <List sx={{ p: 0 }}>
                    {filteredActivities.length > 0 ? (
                        filteredActivities
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((activity) => (
                                <ActivityItem key={activity.id} activity={activity} />
                            ))
                    ) : (
                        <ListItem>
                            <ListItemText 
                                primary={
                                    <Typography variant="body1" align="center" sx={{ py: 4 }}>
                                        No activities found
                                    </Typography>
                                } 
                            />
                        </ListItem>
                    )}
                </List>
                
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredActivities.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Card>
        </Box>
    );
};

export default AdminActivityDashboard;

import React, { useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Tooltip,
    Box,
    Typography,
    LinearProgress,
    useMediaQuery,
    useTheme,
    Card,
    CardContent,
    Grid,
    Stack,
} from '@mui/material';
import { 
    Visibility, 
    Schedule, 
    Settings, 
    CheckCircle, 
    ErrorOutline,
    ArrowForward 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
        default:
            return { 
                color: 'default', 
                icon: null, 
                progress: 0,
                label: status.charAt(0).toUpperCase() + status.slice(1) 
            };
    }
};

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

const MobileGrievanceCard = ({ grievance, onView }) => {
    const statusInfo = getStatusInfo(grievance.status);
    
    return (
        <Card sx={{ 
            mb: 2, 
            borderRadius: 2,
            transition: 'transform 0.2s, box-shadow 0.2s',
            border: '1px solid rgba(224, 224, 224, 0.5)',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
            }
        }}>
            <CardContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h6" component="div" noWrap fontWeight="500" sx={{ color: '#1E3A8A' }}>
                            {grievance.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" gutterBottom sx={{ letterSpacing: '0.01em' }}>
                            ID: {grievance._id.substring(0, 8)}...
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                            Department
                        </Typography>
                        <Typography variant="body1">
                            {grievance.department}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                            Submitted By
                        </Typography>
                        <Typography variant="body1">
                            {grievance.submittedBy ? (
                                <>
                                    {grievance.submittedBy.name}
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        {grievance.submittedBy.email}
                                    </Typography>
                                </>
                            ) : 'N/A'}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                            Date
                        </Typography>
                        <Typography variant="body1">
                            {formatDate(grievance.createdAt)}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                            Status
                        </Typography>
                        <Chip
                            icon={statusInfo.icon}
                            label={statusInfo.label}
                            color={statusInfo.color}
                            size="small"
                            sx={{ mt: 0.5 }}
                        />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <Box sx={{ width: '100%', mr: 1 }}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={statusInfo.progress} 
                                    color={statusInfo.color}
                                    sx={{ height: 6, borderRadius: 3 }}
                                />
                            </Box>
                            <IconButton 
                                color="primary" 
                                onClick={() => onView(grievance._id)}
                                size="small"
                            >
                                <ArrowForward />
                            </IconButton>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const GrievanceTable = ({ grievances }) => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewGrievance = (id) => {
        navigate(`/grievance/${id}`);
    };

    if (isMobile) {
        return (
            <Box sx={{ p: 1 }}>
                <Stack spacing={2}>
                    {grievances
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((grievance) => (
                            <MobileGrievanceCard 
                                key={grievance._id} 
                                grievance={grievance} 
                                onView={handleViewGrievance} 
                            />
                        ))}
                </Stack>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={grievances.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
        );
    }

    return (
        <Paper elevation={2} sx={{ overflow: 'hidden', borderRadius: 2 }}>
            <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'rgba(30, 58, 138, 0.04)' }}>
                            <TableCell sx={{ fontWeight: 600, py: 2 }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 2 }}>Title</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 2 }}>Department</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 2 }}>Submitted By</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 2 }}>Progress</TableCell>
                            <TableCell sx={{ fontWeight: 600, py: 2 }}>Date</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, py: 2 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {grievances
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((grievance) => {
                                const statusInfo = getStatusInfo(grievance.status);
                                return (
                                    <TableRow key={grievance._id} sx={{ 
                                        '&:hover': { 
                                            backgroundColor: 'rgba(59, 130, 246, 0.04)',
                                            cursor: 'pointer' 
                                        },
                                        '&:nth-of-type(odd)': {
                                            backgroundColor: 'rgba(249, 250, 251, 0.8)',
                                        },
                                        borderBottom: '1px solid rgba(224, 224, 224, 0.5)'
                                    }}>
                                        <TableCell>
                                            {grievance._id.substring(0, 8)}...
                                        </TableCell>
                                        <TableCell>{grievance.title}</TableCell>
                                        <TableCell>{grievance.department}</TableCell>
                                        <TableCell>
                                            {grievance.submittedBy ? (
                                                <>
                                                    {grievance.submittedBy.name}
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {grievance.submittedBy.email}
                                                    </Typography>
                                                </>
                                            ) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={statusInfo.icon}
                                                label={statusInfo.label}
                                                color={statusInfo.color}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Box sx={{ width: '100%', mr: 1 }}>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={statusInfo.progress} 
                                                        color={statusInfo.color}
                                                        sx={{ height: 6, borderRadius: 3 }}
                                                    />
                                                </Box>
                                                <Box sx={{ minWidth: 35 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {`${Math.round(statusInfo.progress)}%`}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(grievance.createdAt)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewGrievance(grievance._id)}
                                                    sx={{ 
                                                        color: 'primary.main',
                                                        '&:hover': { 
                                                            backgroundColor: 'primary.light', 
                                                            color: 'white' 
                                                        }
                                                    }}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={grievances.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
};

export default GrievanceTable;

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
import axios from 'axios';

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

const categories = [
    'Academic',
    'Administrative',
    'Infrastructure',
    'Hostel',
    'Library',
    'Laboratory',
    'Other',
];

const NewGrievance = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        department: '',
        category: '',
        priority: 'medium',
        isAnonymous: false,
    });
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formDataObj = new FormData();
            formDataObj.append('title', formData.title);
            formDataObj.append('description', formData.description);
            formDataObj.append('department', formData.department);
            formDataObj.append('category', formData.category);
            formDataObj.append('priority', formData.priority);
            formDataObj.append('isAnonymous', formData.isAnonymous);

            files.forEach((file) => {
                formDataObj.append('attachments', file);
            });

            await axios.post('/api/grievances', formDataObj, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to submit grievance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Submit New Grievance
                    </Typography>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        paragraph
                    >
                        Please provide detailed information about your grievance
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
                            name="title"
                            label="Grievance Title"
                            value={formData.title}
                            onChange={handleChange}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="description"
                            label="Description"
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleChange}
                        />

                        <FormControl fullWidth margin="normal" required>
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

                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                label="Category"
                                onChange={handleChange}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat} value={cat}>
                                        {cat}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth margin="normal" required>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                name="priority"
                                value={formData.priority}
                                label="Priority"
                                onChange={handleChange}
                            >
                                <MenuItem value="low">Low (Resolve in 3 days)</MenuItem>
                                <MenuItem value="medium">Medium (Resolve in 2 days)</MenuItem>
                                <MenuItem value="high">High (Resolve in 24 hours)</MenuItem>
                            </Select>
                        </FormControl>
                        
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Anonymous Submission
                            </Typography>
                            <FormControl component="fieldset">
                                <Select
                                    name="isAnonymous"
                                    value={formData.isAnonymous}
                                    onChange={handleChange}
                                    size="small"
                                >
                                    <MenuItem value={false}>No - Show my identity</MenuItem>
                                    <MenuItem value={true}>Yes - Hide my identity</MenuItem>
                                </Select>
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                                    If anonymous, your name and email will be hidden from department admins and other officials.
                                </Typography>
                            </FormControl>
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <input
                                accept="image/*,.pdf,.doc,.docx"
                                style={{ display: 'none' }}
                                id="attachments"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />
                            <label htmlFor="attachments">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    fullWidth
                                >
                                    Upload Attachments (Optional)
                                </Button>
                            </label>
                            {files.length > 0 && (
                                <Typography
                                    variant="caption"
                                    display="block"
                                    sx={{ mt: 1 }}
                                >
                                    {files.length} file(s) selected
                                </Typography>
                            )}
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3 }}
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit Grievance'}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default NewGrievance;

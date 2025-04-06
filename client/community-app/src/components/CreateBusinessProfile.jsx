import { Container, Box, Typography, Button, TextField, Paper, Grid, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import { gql, useMutation } from "@apollo/client";

const CREATE_BUSINESS = gql`
    mutation CreateBusinessProfile($userId: ID!, $name: String!, $address: String!, $description: String, $image: String) {
    createBusinessProfile(userId: $userId, name: $name, address: $address, description: $description, image: $image) 
    }
`


const CreateBusinessProfile = ({ userId }) => {
    const [file, setSelectedFile] = useState()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
    })
    const [alert, setAlert] = useState({})
    const [createBusiness] = useMutation(CREATE_BUSINESS, {
        onCompleted: (res) => {
            console.log(res)
        },
        onError: (err) => {
            console.error(err)
        }
    });
    // Set the timeout function to clear alert after 5 seconds
    useEffect(() => {
        if (alert?.type) {
            const timeoutId = setTimeout(() => {
                setAlert({});
                console.log("alert cleared")
            }, 5000);
            return () => clearTimeout(timeoutId);
        }


    }, [createBusiness]);
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData?.name || !formData.address || !userId) {
            setAlert({
                type: 'error',
                message: 'Name & Address are required'
            })
            return
        }
        await createBusiness({ variables: { userId, name: formData.name, address: formData.address, description: formData.description,image: formData.image   } })

        setAlert({
            type: 'success',
            message: 'Business profile created successfully'
        });
    }
    const handleTextChange = (e) => {
        const { name, value } = e.target; // Get name and value from the input field
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleFileChange = (e) => {
        const file = e.target.files ? e.target.files[0] : e.dataTransfer.files[0];
        setSelectedFile(file);
    
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Image = reader.result;
            setFormData((prevState) => ({
                ...prevState,
                image: base64Image,  // Add the base64 string to form data
            }));
        };
        reader.readAsDataURL(file);  // This converts the file to base64
    };

    // Handle drag over and drop for the drag-and-drop zone
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFileChange(e);
    };
    return (<>
        <Paper sx={{ padding: 2 }}>
            {alert?.message && <Alert severity={alert?.type}>{alert?.message}</Alert>}
            <Typography variant="h6" gutterBottom>Create a Community Post</Typography>
            {/* Drag and Drop Area */}
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Business Name"
                            name="name"
                            variant="outlined"
                            fullWidth
                            value={formData.name}
                            onChange={handleTextChange}

                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Describe your business"
                            variant="outlined"
                            name="description"
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={handleTextChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Your bussiness Address"
                            variant="outlined"
                            name="address"
                            fullWidth
                            rows={4}
                            value={formData.address}
                            onChange={handleTextChange}

                        />
                    </Grid>

                    <Grid item xs={12}
                        sx={{
                            padding: '20px',
                            textAlign: 'center',
                            marginTop: '20px',
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: '#e3f2fd',
                            },
                            minWidth: "98%", // Prevent shrinkage
                            maxWidth: '98%', // Allow expansion
                        }}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        <Typography variant="body1" color="textSecondary">
                            Drag and drop your image here, or click to select.
                        </Typography>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="file-input"
                        />
                        <label htmlFor="file-input">
                            <Button variant="contained" component="span" sx={{ marginTop: 2 }}>
                                Select Image
                            </Button>
                        </label>
                    </Grid>
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <Button type="submit" variant="contained" color="primary" fullWidth>
                            Create Post
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>


    </>)
}
export default CreateBusinessProfile;
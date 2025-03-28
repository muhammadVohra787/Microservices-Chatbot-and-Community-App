import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { TextField, Button, Grid, Paper, Typography, Alert } from '@mui/material';

// GraphQL mutation for creating a help request
const CREATE_HELP_REQUEST = gql`
  mutation CreateHelpRequest($author: ID!, $description: String!, $location: String!) {
    createHelpRequest(author: $author, description: $description, location: $location)
  }
`;



const CreateHelpRequest = ({ userId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(''); 
  const [currentAlert, setCurrentAlert] = useState({});

  const [createHelpRequest] = useMutation(CREATE_HELP_REQUEST);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const author = userId; // Replace with actual user ID from context or props

    try {
      console.log(author, title, description, location)
      const { data } = await createHelpRequest({
        variables: { author, title, description, location },
      });

      setCurrentAlert({ message: 'Help request created successfully!', type: 'success' });
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
    } catch (error) { 
      console.error('Error creating help request:', error);
      setCurrentAlert({
        message: `Error creating help request: ${error.message}`,
        type: 'error',
      });
    }
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>Create a Help Request</Typography>
      <br />
      {currentAlert?.message && <Alert severity={currentAlert?.type}>{currentAlert?.message}</Alert>}
      <br />
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Location"
              variant="outlined"
              fullWidth
              rows={4}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit Help Request
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CreateHelpRequest;

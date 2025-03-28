import React, { useState, useEffect } from 'react';
import { gql, useMutation } from '@apollo/client'; // Assuming you're using Apollo Client for GraphQL
import { TextField, Button, Grid, Paper, Typography, Alert } from '@mui/material';

const CREATE_COMMUNITY_POST = gql`
  mutation CreateCommunityPost($author: ID!, $title: String!, $content: String!, $category: String!, $aiSummary: String) {
    createCommunityPost(author: $author, title: $title, content: $content, category: $category, aiSummary: $aiSummary) {
      id
      title
      content
      category
      aiSummary
    }
  }
`;

const GET_COMMUNITY_POSTS = gql`
  query GetCommunityPosts {
    getCommunityPosts {
      id
      title
      content
      category
      aiSummary
      author {
        username
        id
      }
    }
  }
`;

const CreateCommunityPost = ({ userId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('news');
  const [currentAlert, setCurrentAlert] = useState({});
  const [createCommunityPost] = useMutation(CREATE_COMMUNITY_POST, {
    refetchQueries: [{ query: GET_COMMUNITY_POSTS }], // Automatically refreshes the list
  });
  const [aiSummary, setAiSummary] = useState('');
  // Set the timeout function to clear alert after 5 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentAlert({});
    }, 5000); 

    return () => clearTimeout(timeoutId);
  }, [currentAlert]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const author = userId; // Replace with actual user ID

    try {
      console.log({author: author, title: title, content:content, category: category, aiSummary: aiSummary})
      const { data } = await createCommunityPost({ variables: { author: author, title: title, content:content, category: category, aiSummary: aiSummary } });
      console.log('Post created:', data.createCommunityPost);
      setTitle('')
      setContent('')
      setCategory('')
      setAiSummary('')
      setCurrentAlert({ message: "Post created", type: "success" });
    } catch (error) {
      console.error('Error creating post:', error);
      setCurrentAlert({ message: `Error creating post: ${error}`, type: "error" });
    }
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>Create a Community Post</Typography>
      {currentAlert?.message && <Alert severity={currentAlert?.type}>{currentAlert?.message}</Alert>}
      
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
              label="Content"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Ai Summary"
              variant="outlined"
              fullWidth
              multiline
              rows={4}
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Category"
              variant="outlined"
              fullWidth
              select
              SelectProps={{
                native: true,
              }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="news">News</option>
              <option value="discussion">Discussion</option>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Create Post
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default CreateCommunityPost;

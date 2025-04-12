import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import {
  List,
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  Paper,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

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

const UPDATE_COMMUNITY_POST = gql`
  mutation UpdateCommunityPost($id: ID!, $title: String, $content: String, $category: String, $aiSummary: String) {
    updateCommunityPost(id: $id, title: $title, content: $content, category: $category, aiSummary: $aiSummary) {
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

const DELETE_COMMUNITY_POST = gql`
  mutation DeleteCommunityPost($id: ID!) {
    deleteCommunityPost(id: $id)
  }
`;

const ListCommunityPosts = ({ userId }) => {
  const { data, loading, error, refetch } = useQuery(GET_COMMUNITY_POSTS);
  refetch()
  const [updateCommunityPost] = useMutation(UPDATE_COMMUNITY_POST);
  const [deleteCommunityPost] = useMutation(DELETE_COMMUNITY_POST);

  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState({ title: '', content: '', category: '', aiSummary: '' });

  if (loading) return <Typography>Loading posts...</Typography>;
  if (error) return <Typography color="error">Error fetching posts: {error.message}</Typography>;

  const handleEdit = (post) => {
    setEditMode(post.id);
    setEditData({ title: post.title, content: post.content, category: post.category, aiSummary: post.aiSummary });
  };

  const handleSave = async (postId) => {
    await updateCommunityPost({ variables: { id: postId, ...editData } });
    setEditMode(null);
    refetch();
  };

  const handleDelete = async (postId) => {
    await deleteCommunityPost({ variables: { id: postId } });
    refetch();
  };

  return (
    <Box sx={{ }}>
      <List>
        {data.getCommunityPosts.map((post) => (
          <Paper key={post.id}  sx={{ p: 2, mb: 3, borderRadius: 3 }}>
            {editMode === post.id ? (
              <Box>
                <TextField
                  label="Title"
                  fullWidth
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Category"
                  select
                  fullWidth
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="news">News</MenuItem>
                  <MenuItem value="discussion">Discussion</MenuItem>
                </TextField>
                <TextField
                  label="Content"
                  fullWidth
                  multiline
                  rows={4}
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="AI Summary"
                  fullWidth
                  multiline
                  rows={3}
                  value={editData.aiSummary}
                  onChange={(e) => setEditData({ ...editData, aiSummary: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button onClick={() => handleSave(post.id)} variant="contained" color="primary">Save</Button>
                  <Button onClick={() => setEditMode(null)} variant="outlined" color="secondary">Cancel</Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6">{post.author?.username} — {post.title}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Type: {post.category}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{post.content}</Typography>
                <Box sx={{ backgroundColor: '#f4f6f8', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2" color="primary" gutterBottom>AI Summary</Typography>
                  <Typography variant="body2">
                    {post.aiSummary || "No AI summary available!"}
                  </Typography>
                </Box>
                {userId === post.author.id && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <IconButton color="primary" onClick={() => handleEdit(post)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(post.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default ListCommunityPosts;

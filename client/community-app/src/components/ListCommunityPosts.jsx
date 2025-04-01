import React, { useEffect, useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { List, ListItem, ListItemText, Typography, Button, TextField, Box, Divider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// GraphQL query to get all community posts
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

// GraphQL mutation to update a community post
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

// GraphQL mutation to delete a community post
const DELETE_COMMUNITY_POST = gql`
  mutation DeleteCommunityPost($id: ID!) {
    deleteCommunityPost(id: $id)
  }
`;

const ListCommunityPosts = ({ userId }) => {
  const { data, loading, error, refetch } = useQuery(GET_COMMUNITY_POSTS);
  
  const [updateCommunityPost] = useMutation(UPDATE_COMMUNITY_POST);
  const [deleteCommunityPost] = useMutation(DELETE_COMMUNITY_POST);

  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState({ title: '', content: '', category: '' });

  if (loading) return <Typography>Loading posts...</Typography>;
  if (error) return <Typography color="error">Error fetching posts: {error.message}</Typography>;

  const handleEdit = (post) => {
    setEditMode(post.id);
    console.log(post)
    setEditData({ title: post.title, content: post.content, category: post.category, aiSummary: post?.aiSummary});
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
    <Box sx={{ maxWidth: '800px', margin: 'auto', padding: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>All Community Posts</Typography>
      <List>
        {data.getCommunityPosts.map((post) => (
          <ListItem key={post.id} sx={{ mb: 2, p: 2, borderBottom: '1px solid #ddd', alignItems: 'flex-start' }}>
            {editMode === post.id ? (
              <Box sx={{ width: '100%' }}>
                <TextField
                  label="Title"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  fullWidth
                  sx={{ mb: 1 }}
                />
                <TextField
                  label="Category"
                  variant="outlined"
                  fullWidth
                  select
                  SelectProps={{
                    native: true,
                  }}
                  value={editData.category}
                  onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  sx={{ mb: 1 }}
                >
                  <option value="news">News</option>
                  <option value="discussion">Discussion</option>
                </TextField>
                <TextField
                  label="Content"
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                  multiline
                  rows={3}
                  fullWidth
                  sx={{ mb: 1 }}
                />

                <TextField
                  label="Ai Summary"
                  value={editData.aiSummary}
                  onChange={(e) => setEditData({ ...editData, aiSummary: e.target.value })}
                  multiline
                  rows={3}
                  fullWidth
                  sx={{ mb: 1 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button onClick={() => handleSave(post.id)} variant="contained" color="primary">Save</Button>
                  <Button onClick={() => setEditMode(null)} variant="outlined" color="secondary">Cancel</Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ width: '100%' }}>
                <ListItemText
                  primary={
                    <Typography variant="h6">
                      {post?.author?.username} - {post.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="primary">Type: {post.category}</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>{post.content}</Typography>
                      
                      <Typography variant="body2" color="primary" sx={{mt:0.2}}>AI Summary:</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>{post.aiSummary || "No ai summary available!"}</Typography>
                    </>
                  }
                />
                {userId === post.author.id && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <EditIcon onClick={() => handleEdit(post)}/>
                    <DeleteIcon onClick={() => handleDelete(post.id)} />
                  </Box>
                )}
              </Box>
            )}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ListCommunityPosts;
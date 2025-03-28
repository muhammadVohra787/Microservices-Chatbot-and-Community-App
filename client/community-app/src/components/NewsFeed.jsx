  import React, { useEffect, useState } from 'react';
  import { gql, useQuery, useMutation } from '@apollo/client';
  import { Card, CardContent, Typography, Paper, Grid, CircularProgress,Box } from '@mui/material';
  import EditIcon from '@mui/icons-material/Edit';
  import DeleteIcon from '@mui/icons-material/Delete';

  const GET_COMMUNITY_POSTS = gql`
    query GetCommunityPosts {
      getCommunityPosts {
        id
        title
        content
        category
        createdAt
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


  const NewsFeed = ({userId}) => {
    console.log(userId)
    const { loading, error, data, refetch } = useQuery(GET_COMMUNITY_POSTS);
    const [posts, setPosts] = useState([]);
    const [deleteCommunityPost] = useMutation(DELETE_COMMUNITY_POST);

    useEffect(() => {
      if (data) {
        //only news items
        setPosts(data.getCommunityPosts.filter(post => post.category === "news"));
        console.log(data)
      }
    }, [data]);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">Error: {error.message}</Typography>;
    const handleDelete = async (postId) => {
      console.log(postId)
      await deleteCommunityPost({ variables: { id: postId } });
      refetch();
    };

    return (
      <Paper sx={{ padding: 2 }}>
        <Typography variant="h6" gutterBottom>News Feed</Typography>
        <Grid container spacing={2}>
          {posts.map((post) => (
            <Grid item xs={100} sm={100} md={100} key={post.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{`${post?.author?.username} - ${post.title}`}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(parseInt(post.createdAt)).toLocaleDateString()} | {post.category}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {post.content}
                  </Typography>

                  {userId === post.author.id && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <DeleteIcon onClick={() => handleDelete(post.id)} />
                      
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };

  export default NewsFeed;

import { gql, useQuery } from "@apollo/client";
import {
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Box,
  Rating
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const GET_BUSINESSES = gql`
  query GetBusinsessByUserId($userId: ID!) {
    getBusinsessByUserId(userId: $userId) {
      address
      _id
      name
      description
      image
      reviews {
        id
        createdAt
        comment
        rating
        user {
          username
        }
      }
    }
  }
`;

const BusinessDashboard = ({ userId }) => {
  const { data: businessData, loading, error, refetch } = useQuery(GET_BUSINESSES, {
    variables: { userId }
  });
  refetch()
  const navigate = useNavigate();

  const handleClick = (id) => {
    if (!id) return;
    navigate(`/business/${id}`);
  };

  if (loading) return <Typography>Loading businesses...</Typography>;
  if (error) return <Typography color="error">Error loading businesses</Typography>;

  const businesses = businessData?.getBusinsessByUserId || [];

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Businesses
      </Typography>
      {businesses.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1">No businesses found. Create one!</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {businesses.map((business) => {
            const totalReviews = business.reviews.length;
            const averageRating =
              totalReviews > 0
                ? business.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                : 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={business._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="160"
                    image={
                      business?.image?.length > 0
                        ? `http://localhost:4000/uploads/${business.image.split("\\").pop()}`
                        : "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={business.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>{business.name}</Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {business.description}
                    </Typography>
                    <Rating value={averageRating} readOnly precision={0.5} size="small" />
                  </CardContent>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleClick(business._id)}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      View Details
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default BusinessDashboard;

import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Box, Button, Card, CardContent, CardMedia, Collapse, Container, Grid,
  Rating, TextField, Typography
} from "@mui/material";
import { useState } from "react"

const GET_ALL_BUSINESSES = gql`
query GetAllBusinesses {
  getAllBusinesses {
    _id
    address
    description
    image
    name
    products {
      image
      name
      price
      specialOffer
    }
    reviews {
      comment
      createdAt
      id
      rating
      ownerReply
      sentiment
    }  
  }
}
`;

const CREATE_REVIEW = gql`
mutation Mutation($businessId: ID!, $userId: ID!, $rating: Float!, $comment: String) {
  createReview(businessId: $businessId, userId: $userId, rating: $rating, comment: $comment)
}
`;

const BusinessView = ({ userId }) => {
  const { data, loading, error, refetch } = useQuery(GET_ALL_BUSINESSES);
  const [createReview] = useMutation(CREATE_REVIEW);
  refetch()
  const [expandedBusiness, setExpandedBusiness] = useState(null);
  const [reviewInputs, setReviewInputs] = useState({}); // per-business rating/comments

  if (loading) return <Typography>Loading businesses...</Typography>;
  if (error) return <Typography>Error loading businesses</Typography>;

  const handleToggleExpand = (businessId) => {
    setExpandedBusiness(prev => prev === businessId ? null : businessId);
  };

  const handleReviewChange = (businessId, field, value) => {
    setReviewInputs(prev => ({
      ...prev,
      [businessId]: {
        ...prev[businessId],
        [field]: value
      }
    }));
  };

  const handleSubmitReview = async (businessId) => {
    const { rating, comment } = reviewInputs[businessId] || {};
    if (!rating) return;

    await createReview({
      variables: {
        businessId,
        userId,
        rating,
        comment: comment || "",
      },
      onCompleted: () => refetch()
    });

    setReviewInputs(prev => ({ ...prev, [businessId]: {} }));
  };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>All Businesses</Typography>

      <Grid container spacing={3}>
        {data.getAllBusinesses.map(business => (
          <Grid item xs={12} key={business._id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={business?.image !=null > 0 ? `http://localhost:4000/uploads/${business.image.split("\\").pop()}` : "https://via.placeholder.com/150"}
                alt={business.name}
              />
              <CardContent>
                <Typography variant="h5">{business.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">{business.address}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{business.description}</Typography>
                <Button onClick={() => handleToggleExpand(business._id)}>
                  {expandedBusiness === business._id ? "Hide Details" : "View Details"}
                </Button>
              </CardContent>

              {/* Expanded Content */}
              <Collapse in={expandedBusiness === business._id} timeout="auto" unmountOnExit>
                <CardContent>
                  {/* Products */}
                  <Typography variant="h6" sx={{ mb: 1 }}>Products</Typography>
                  <Grid container spacing={2}>
                    {business.products.map((product, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Box border="1px solid #ccc" borderRadius="8px" p={2}>
                          {product.image ? (
                            <img
                              src={product.image ? `http://localhost:4000/uploads/${product.image.split("\\").pop()}` : "https://placehold.co/600x400?text=No+Image"}
                              alt={product.name}
                              style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 4 }}
                            />
                          ) : (
                            <Box height={100} bgcolor="#eee" borderRadius={2} display="flex" alignItems="center" justifyContent="center">
                              No Image
                            </Box>
                          )}
                          <Typography fontWeight="bold">{product.name}</Typography>
                          <Typography>${product.price}</Typography>
                          {product.specialOffer && <Typography color="error">Special Offer!</Typography>}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Reviews */}
                  <Typography variant="h6" sx={{ mt: 4 }}>Reviews</Typography>
                  {business.reviews.length > 0 ? (
                    business.reviews.map((review) => (
                      <Box key={review.id} mt={2} p={2} border="1px solid #ccc" borderRadius={2}>
                        <Rating value={review.rating} readOnly />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(parseInt(review.createdAt)).toLocaleDateString()}
                        </Typography>
                        {review.comment && <Typography>{review.comment}</Typography>}
                        {review.ownerReply && (
                          <Typography sx={{ mt: 1 }} color="primary">Owner Reply: {review.ownerReply}</Typography>
                        )}
                        <Typography sx={{ mt: 1 }} color="primary">Sentiment: {review.sentiment}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography>No reviews yet</Typography>
                  )}

                  {/* Add Review */}
                  <Box mt={4}>
                    <Typography variant="h6">Leave a Review</Typography>
                    <Rating
                      value={reviewInputs[business._id]?.rating || 0}
                      onChange={(_, value) => handleReviewChange(business._id, "rating", value)}
                    />
                    <TextField
                      label="Comment (optional)"
                      multiline
                      fullWidth
                      minRows={2}
                      sx={{ my: 2 }}
                      value={reviewInputs[business._id]?.comment || ""}
                      onChange={(e) => handleReviewChange(business._id, "comment", e.target.value)}
                    />
                    <Button variant="contained" onClick={() => handleSubmitReview(business._id)}>
                      Submit Review
                    </Button>
                  </Box>
                </CardContent>
              </Collapse>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default BusinessView;

// This is a large file, so instead of inlining everything, here's a clean and styled version:

import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Container,
  Box,
  Typography,
  Grid,
  Alert,
  Rating,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Paper
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
const GET_BUSINESS = gql
`query GetBusinessById($getBusinessById: ID!) {
  getBusinessById(id: $getBusinessById) {
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
      id
      createdAt
      description
    }
    reviews {
      comment
      createdAt
      id
      rating
      ownerReply
      user {
        username
      }
    }
  }
}`
;

const ADD_PRODUCT = gql
`mutation CreateProduct($businessId: ID!, $name: String!, $price: Float!, $specialOffer: Boolean) {
  createProduct(businessId: $businessId, name: $name, price: $price, specialOffer: $specialOffer)
}`
;

const POST_REPLY = gql
`mutation Mutation($replyReviewId: ID!, $reply: String!) {
  replyReview(id: $replyReviewId, reply: $reply)
}`

const BusinessPage = () => {
  const navigate = useNavigate();
  const { id: businessId } = useParams();
  const { data, loading, error, refetch } = useQuery(GET_BUSINESS, {
    variables: { getBusinessById: businessId }
    });
    refetch()
  const [addProduct] = useMutation(ADD_PRODUCT);
  const [postReply] = useMutation(POST_REPLY);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', specialOffer: false });
  const [replies, setReplies] = useState({});

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">Error: {error.message}</Alert>;

  const business = data?.getBusinessById;
  const avgRating = business.reviews.length
    ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / business.reviews.length
    : 0;

  const handleReply = (id) => postReply({ variables: { replyReviewId: id, reply: replies[id] }, onCompleted: refetch });

  const handleAddProduct = () => {
    addProduct({
      variables: {
        businessId,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        specialOffer: newProduct.specialOffer
      },
      onCompleted: refetch
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIosIcon />} onClick={() => navigate('/')} variant="outlined" sx={{ mb: 4 }}>
        Back to Listings
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <img
          src={`http://localhost:4000/uploads/${business.image.split("\\").pop()}`}
          alt={business.name}
          style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 8 }}
        />
        <Typography variant="h4" mt={2}>{business.name}</Typography>
        <Typography color="text.secondary">{business.address}</Typography>
        <Typography sx={{ mt: 1 }}>{business.description}</Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Rating value={avgRating} readOnly precision={0.5} />
          <Typography sx={{ ml: 1 }} color="text.secondary">
            {business.reviews.length} {business.reviews.length === 1 ? 'review' : 'reviews'}
          </Typography>
        </Box>
      </Paper>

      <Typography variant="h6">Products</Typography>
      <Grid container spacing={3} mt={1}>
        {business.products.length ? business.products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Paper sx={{ p: 2 }}>
              <img
                src={`http://localhost:4000/uploads/${product.image?.split("\\").pop()}`}
                alt={product.name}
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: 4 }}
              />
              <Typography variant="subtitle1" fontWeight="bold" mt={1}>{product.name}</Typography>
              <Typography variant="body2" color="text.secondary">{product.description}</Typography>
              <Typography variant="body1" mt={1}>${product.price}</Typography>
              <Typography variant="caption" color={product.specialOffer ? 'primary' : 'text.secondary'}>
                {product.specialOffer ? 'Special Offer!' : 'Base Price'}
              </Typography>
            </Paper>
          </Grid>
        )) : (
          <Typography sx={{ml: 4}}>No products yet.</Typography>
        )}
      </Grid>

      <Box mt={4}>
        <Typography variant="h6">Add Product</Typography>
        <TextField fullWidth label="Product Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} sx={{ mt: 2 }} />
        <TextField fullWidth label="Price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} sx={{ mt: 2 }} />
        <FormControlLabel
          control={<Checkbox checked={newProduct.specialOffer} onChange={(e) => setNewProduct({ ...newProduct, specialOffer: e.target.checked })} />}
          label="Special Offer"
        />
        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleAddProduct}>Add Product</Button>
      </Box>

      <Box mt={5}>
        <Typography variant="h6">Reviews</Typography>
        {business.reviews.length ? business.reviews.map((review) => (
          <Paper key={review.id} sx={{ p: 2, mt: 2 }}>
            <Typography fontWeight="bold">{review.user.username}</Typography>
            <Typography variant="caption" color="text.secondary">{new Date(parseInt(review.createdAt)).toLocaleDateString()}</Typography>
            <Typography sx={{ mt: 1 }}>{review.comment}</Typography>
            <Rating value={review.rating} readOnly size="small" />
            {review.ownerReply ? (
              <Typography sx={{ mt: 1 }}>Your Reply: {review.ownerReply}</Typography>
            ) : (
              <Box mt={2}>
                <TextField
                  fullWidth
                  label="Reply to this comment"
                  value={replies[review.id] || ''}
                  onChange={(e) => setReplies({ ...replies, [review.id]: e.target.value })}
                />
                <Button sx={{ mt: 1 }} variant="contained" onClick={() => handleReply(review.id)}>Reply</Button>
              </Box>
            )}
          </Paper>
        )) : <Typography mt={2}>No reviews yet.</Typography>}
      </Box>
    </Container>
  );
};

export default BusinessPage;

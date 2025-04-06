import { gql, useMutation, useQuery } from "@apollo/client";
import { Container, Box, Typography, Grid, Alert, Rating, Button, Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
const GET_BUSINESS = gql`
query GetBusinessById($getBusinessById: ID!) {
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
}
`;

const ADD_PRODUCT = gql`
mutation CreateProduct($businessId: ID!, $name: String!, $price: Float!, $specialOffer: Boolean) {
  createProduct(businessId: $businessId, name: $name, price: $price, specialOffer: $specialOffer)
}
`;

const POST_REPLY = gql`
mutation Mutation($replyReviewId: ID!, $reply: String!) {
  replyReview(id: $replyReviewId, reply: $reply)
}
`

const BusinessPage = () => {
    const navigate = useNavigate()
    const { id: businessId } = useParams();
    const { data: businessData, loading, error, refetch } = useQuery(GET_BUSINESS, {
        variables: { getBusinessById: businessId },
        onCompleted: (res) => {
            console.log("fetch complete");
            console.log(res);
        },
        onError: (err) => {
            console.error(err);
        }
    });

    const [addProduct] = useMutation(ADD_PRODUCT);
    const [postReply] = useMutation(POST_REPLY)
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        image: '',
        specialOffer: false,
    });
    const [reply, setReply] = useState();

    // Loading state
    if (loading) return <Typography>Loading...</Typography>;

    // Error handling
    if (error) return <Alert severity="error">Error: {error.message}</Alert>;

    // Business data
    const { getBusinessById } = businessData;

    // Calculate average rating
    const totalReviews = getBusinessById.reviews.length;
    const averageRating = totalReviews > 0
        ? getBusinessById.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;


    const handleReply = (id) => {
        postReply({
            variables: { replyReviewId: id, reply: reply },
            onCompleted: (e) => {
                refetch()
            }
        })
    }
    // Handle product addition
    const handleAddProduct = () => {
        // Trigger the mutation to add a product
        addProduct({
            variables: {
                businessId,
                name: newProduct.name,
                price: parseFloat(newProduct.price),
                specialOffer: newProduct.specialOffer,
            },
            onCompleted: () => {
                console.log("Product added successfully!");
                // Refetch the data to get updated products and reviews
                refetch();
            },
            onError: (error) => {
                console.error("Error adding product:", error);
            }
        });
    };

    return (
        <Container maxWidth="md" sx={{ mb: 10 }}>
            <Button fullWidth variant="outlined" color="primary" onClick={()=>navigate("/")} sx={{mt:4, mb:4}}>Go back to listings</Button>
            {/* Business Info */}
            <Box sx={{ mb: 4 }}>
                <img
                    src={`http://localhost:4000/uploads/${getBusinessById.image.split("\\").pop()}`}
                    alt={getBusinessById.name}
                    style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                    }}
                />
                <Typography variant="h4" gutterBottom>{getBusinessById.name}</Typography>
                <Typography variant="h6" color="text.secondary">{getBusinessById.address}</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{getBusinessById.description}</Typography>

                {/* Average Rating */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating name="read-only" value={averageRating} readOnly precision={0.5} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </Typography>
                </Box>
            </Box>

            {/* Products Section */}
            <Typography variant="h6" gutterBottom>Products</Typography>
            <Grid container spacing={2}>
                {getBusinessById.products.length > 0 ? (
                    getBusinessById.products.map((product) => (
                        <Grid item xs={12} sm={6} md={4} key={product.id}>
                            <Box sx={{ p: 2, borderRadius: '8px', border: '1px solid #ddd' }}>
                                <img
                                    src={!product.iamge ? "" : `http://localhost:4000/uploads/${product.image.split("\\").pop()}`}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                                />
                                <Typography variant="body1" sx={{ mt: 2 }}>{product.name}</Typography>
                                <Typography variant="body2" color="text.secondary">{product.description}</Typography>
                                <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>${product.price}</Typography>
                                {product.specialOffer ? (
                                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>Special Offer!</Typography>
                                ) : <Typography variant="body2" color="primary" sx={{ mt: 1 }}>Base Price</Typography>}
                            </Box>
                        </Grid>
                    ))
                ) : (
                    <Typography>No products available.</Typography>
                )}
            </Grid>
            {/* TODO: Image upload left FE & BE */}
            {/* Add Product Form */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Add Product</Typography>
                <TextField
                    label="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={newProduct.specialOffer}
                            onChange={(e) => setNewProduct({ ...newProduct, specialOffer: e.target.checked })}
                        />
                    }
                    label="Special Offer"
                />
                <Button fullWidth variant="contained" color="primary" sx={{ mt: 2, mb: 2 }} onClick={handleAddProduct}>Add Product</Button>
            </Box>

            {/* Reviews Section */}
            <Typography variant="h6" gutterBottom>Reviews</Typography>
            {getBusinessById.reviews.length > 0 ? (
                getBusinessById.reviews.map((review) => {
                    const replied = review?.ownerReply != null
                    return ((
                        <Box key={review.id} sx={{ p: 2, mb: 2, borderRadius: '8px', border: '1px solid #ddd' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{review.user.username}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {new Date(parseInt(review.createdAt)).toLocaleDateString()}
                            </Typography>
                            {replied ? <Typography variant="body2">{review.comment}</Typography> :
                                <Box sx={{display:'flex', gap:10}}>

                                    <TextField
                                        label="Reply to this comment"

                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        fullWidth
                                    />
                                    <Button variant="contained" onClick={() => { handleReply(review.id) }}>Reply</Button>
                                </Box>
                            }
                            <Rating name="read-only" value={review.rating} readOnly />
                            <Typography variant="body2">Your Reply: {review.ownerReply}</Typography>
                        </Box>
                    ))
                })
            ) : (
                <Typography>No reviews yet.</Typography>
            )}
        </Container>
    );
};

export default BusinessPage;

import { gql, useMutation, useQuery } from "@apollo/client";
import { Container, Box, Typography, Button, TextField, Paper, Grid, Alert, Rating } from "@mui/material";
import { useEffect, useState } from "react";
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
`

const BusinessDashboard = ({ userId }) => {
    const { data: businessData, loading, error, refetch } = useQuery(GET_BUSINESSES, {
        variables: { userId },
        onCompleted: (res) => {
            console.log(res)
        },
        onError: (err) => {
            console.error(err)
        }
    });
    const navigate = useNavigate()
    const [alert, setAlert] = useState({});
    const handleClick =(id)=>{
        if(!id) return

        navigate(`/business/${id}`)
    }
    return (
        <Container>
            {businessData?.getBusinsessByUserId?.length > 0 ? (
                businessData.getBusinsessByUserId.map(item => {
                    // Calculate average rating
                    const totalReviews = item.reviews.length;
                    const averageRating = totalReviews > 0
                        ? item.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
                        : 0;

                    return (
                        <Paper key={item._id} sx={{ p: 2, mb: 2 }} onClick={()=>handleClick(item._id)}>
                            <img
                                src={`http://localhost:4000/uploads/${item.image.split("\\").pop()}`}
                                alt={item.name}
                                style={{
                                    width: '100%',
                                    height: '100px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    borderBlock: '1px solid black'
                                }}
                            />
                            <Typography variant="h6">{item.name}</Typography>
                            <Typography>{item.description}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {item.address}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Rating name="read-only" value={averageRating} readOnly precision={0.5} />
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                    {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                                </Typography>
                            </Box>
                        </Paper>
                    );
                })
            ) : (
                <Typography>No businesses found. Create one!</Typography>
            )}
        </Container>
    );
};

export default BusinessDashboard
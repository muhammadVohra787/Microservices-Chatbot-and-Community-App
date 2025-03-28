import React, { useEffect, useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Checkbox, List, ListItem, ListItemText, ListItemAvatar, Avatar, Paper, Typography, CircularProgress, IconButton, TextField, Icon } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventSeatIcon from '@mui/icons-material/EventSeat';
// GraphQL query to fetch help requests
// GraphQL query to fetch help requests
const GET_HELP_REQUESTS = gql`
  query GetHelpRequests {
    getHelpRequests {
      id
      description
      location
      isResolved
      author {
        username
        id
      }
      volunteers {
        username
        id
      }
    }
  }
`;

// Mutation to mark a help request as resolved
const MARK_AS_RESOLVED = gql`
  mutation MarkHelpRequestResolved($id :ID!){
    markHelpRequestResolved(id: $id)
  }
`;

// Mutation to update a help request
const UPDATE_HELP_REQUEST = gql`
mutation UpdateHelpRequest($updateHelpRequestId: ID!, $description: String, $location: String, $isResolved: Boolean) {
  updateHelpRequest(id: $updateHelpRequestId, description: $description, location: $location, isResolved: $isResolved) {
    id
    description
    location
    isResolved
    author {
      username
      id
    }
  }
}

`;



// Mutation to delete a help request
const DELETE_HELP_REQUEST = gql`
  mutation DeleteHelpRequest($id: ID!) {
    deleteHelpRequest(id: $id)
  }
`;

// Mutation to add a volunteer to a help request
const ADD_AS_VOLUNTEER = gql`
  mutation AddVolunteerToHelpRequest($id: ID!, $volunteerId: ID!){
    addVolunteerToHelpRequest(id: $id, volunteerId: $volunteerId)
  }
`

const HelpRequestList = ({ userId, role }) => {
  let isOrganizer = role == "community_organizer"
  const { loading, error, data, refetch } = useQuery(GET_HELP_REQUESTS, {
    onCompleted: (data) => {
      console.log(data)
    }
  });

  const [requests, setRequests] = useState([]);
  const [editing, setEditing] = useState(null);

  const [markHelpRequestResolved] = useMutation(MARK_AS_RESOLVED)
  const [updatedRequest, setUpdatedRequest] = useState({
    description: '',
    location: '',
    isResolved: false,
  });
  const handleSetResolved = async (postId) => {
    console.log()
    await markHelpRequestResolved({ variables: { id: postId } })
    refetch()
  }
  // Mutation hooks for update and delete
  const [updateHelpRequest] = useMutation(UPDATE_HELP_REQUEST, {
    onCompleted: (data) => {
      // Handle successful update
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === data.updateHelpRequest.id ? data.updateHelpRequest : request
        )
      );
      setEditing(null); // Close the edit mode
      refetch()
    },
  });
  const [addVolunteerToHelpRequest] = useMutation(ADD_AS_VOLUNTEER, {
    onCompleted: (data) => {
      console.log("volunteer added", data)
      refetch()
    },
    onError: (data) => {
      console.log("error", data)
    }
  })

  const [deleteHelpRequest] = useMutation(DELETE_HELP_REQUEST, {
    onCompleted: (data) => {
      // Handle successful delete
      setRequests((prevRequests) =>
        prevRequests.filter((request) => request.id !== data.deleteHelpRequest.id)
      );
      refetch()
    },
  });

  useEffect(() => {
    if (data) {
      setRequests(data.getHelpRequests);
    }
  }, [data]);

  // Handle update
  const handleUpdate = (requestId) => {
    setEditing(requestId);
    console.log(requestId)
    const request = requests.find((req) => req.id === requestId);
    setUpdatedRequest({
      description: request.description,
      location: request.location,
      isResolved: request.isResolved,
    });
    refetch()
  };

  // Handle delete
  const handleDelete = (requestId) => {
    deleteHelpRequest({ variables: { id: requestId } });
    refetch()
  };

  const handleSaveUpdate = (requestId) => {
    const parsedIsResolved = updatedRequest.isResolved === "true" || updatedRequest.isResolved === true;
    console.log({
      updateHelpRequestId: requestId,
      description: updatedRequest.description,
      location: updatedRequest.location,
      isResolved: parsedIsResolved
    })
    updateHelpRequest({
      variables: {
        updateHelpRequestId: requestId,
        description: updatedRequest.description,
        location: updatedRequest.location,
        isResolved: parsedIsResolved
      },
    });
    refetch()
  };

  const handleVolunteer = async (requestId) => {
    console.log(
      {
        id: requestId,
        volunteerId: userId
      }
    )
    addVolunteerToHelpRequest({
      variables: {
        id: requestId,
        volunteerId: userId
      }
    })
    refetch()
  }

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>Help Requests</Typography>
      <List>
        {requests.map((request) => (
          <ListItem key={request.id}>
            <ListItemAvatar>
              <Avatar>{request.author.username[0]}</Avatar>
            </ListItemAvatar>
            {editing === request.id ? (
              <>
                <TextField
                  label="Description"
                  fullWidth
                  value={updatedRequest.description}
                  onChange={(e) => setUpdatedRequest({ ...updatedRequest, description: e.target.value })}
                  sx={{ marginBottom: 1 }}
                />
                <TextField
                  label="Location"
                  fullWidth
                  value={updatedRequest.location}
                  onChange={(e) => setUpdatedRequest({ ...updatedRequest, location: e.target.value })}
                  sx={{ marginBottom: 1 }}
                />

                <TextField
                  label="Resolved"
                  variant="outlined"
                  fullWidth
                  select
                  SelectProps={{
                    native: true,
                  }}
                  value={updatedRequest.isResolved}
                  onChange={(e) => setUpdatedRequest({ ...updatedRequest, isResolved: e.target.value })}
                  sx={{ mb: 1 }}
                >
                  <option value={true}>True</option>
                  <option value={false}>False</option>
                </TextField>
                <IconButton onClick={() => handleSaveUpdate(request.id)}>
                  <Typography variant="button">Save</Typography>
                </IconButton>


              </>
            ) : (
              <>
                <ListItemText
                  primary={request.description}
                  secondary={
                    <>
                      {`Number of volunteers: ${request?.volunteers?.length || 0}`}
                      <br />
                      {`${request.location} | ${request.isResolved ? 'Resolved' : 'Pending'}`}
                    </>
                  }
                />
                {isOrganizer && !request?.volunteers?.some(volunteer => volunteer.id === userId) &&


                  <EventSeatIcon onClick={() => handleVolunteer(request.id)} />
                }
                {userId === request.author.id && (
                  <>
                    <EditIcon onClick={() => handleUpdate(request.id)} />
                    <DeleteIcon onClick={() => handleDelete(request.id)} />
                    <Checkbox checked={request?.isResolved} onClick={() => handleSetResolved(request.id)} />
                  </>
                )}
              </>
            )}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default HelpRequestList;
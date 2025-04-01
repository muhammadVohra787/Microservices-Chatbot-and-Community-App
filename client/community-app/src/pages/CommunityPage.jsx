import React, { useEffect, useState } from 'react';
import { CircularProgress, Container, List, ListItem, ListItemText, Box, Drawer, Toolbar, Typography, Button } from '@mui/material';
import CreateCommunityPost from '../components/CreateCommunityPost.jsx';
import CreateHelpRequest from '../components/CreateHelpRequest.jsx';
import HelpRequestList from '../components/HelpRequestList.jsx';
import ListCommunityPosts from '../components/ListCommunityPosts.jsx';
import NewsFeed from '../components/NewsFeed.jsx';
import { useQuery, useMutation, gql } from '@apollo/client';
import CommunityChatbot from '../components/CommunityChatBot.jsx';
const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const CommunityPage = ({ role, userId }) => {
  console.log("Community page: ", { role, userId })
  if (!role || !userId) {
    return <h1>Role or user Id not found, check login</h1>
  }

  const [logout] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      window.location.reload();
    },
  });

  // Define available sections based on roles
  const sectionsByRole = {
    resident: [
      { name: 'Create Post', component: <CreateCommunityPost userId={userId} /> },
      { name: 'Create Help Request', component: <CreateHelpRequest userId={userId} /> },
      { name: 'Help Requests', component: <HelpRequestList userId={userId} role={role} /> },
      { name: 'Community Posts', component: <ListCommunityPosts userId={userId} /> },
 
    ],
    business_owner: [
      { name: 'Create Post', component: <CreateCommunityPost userId={userId} /> },
      { name: 'News Feed', component: <NewsFeed userId={userId} /> },
      { name: 'Help Requests', component: <HelpRequestList userId={userId} role={role} /> },
      { name: 'Community Posts', component: <ListCommunityPosts userId={userId} /> },
    ],
    community_organizer: [
      { name: 'Create Post', component: <CreateCommunityPost userId={userId} /> },
      { name: 'Create Help Request', component: <CreateHelpRequest userId={userId} /> },
      { name: 'Help Requests', component: <HelpRequestList userId={userId} role={role} /> },
      { name: 'News Feed', component: <NewsFeed userId={userId} /> },
      { name: 'Community Posts', component: <ListCommunityPosts userId={userId} /> },
    ],
  };

  const handleLogout = () => {
    logout();
  };

  const sections = sectionsByRole[role] || [];
  const [selectedIndex, setSelectedIndex] = useState(0); // Track the selected tab by index

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            width: "30%",
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: "30%", boxSizing: 'border-box' },
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Community Panel
            </Typography>
          </Toolbar>
          <List>
            {sections.map((section, index) => (
              <ListItem
                button
                key={index}
                onClick={() => {
                  setSelectedIndex(index); // Set the selected tab index
                }}
                sx={{
                  backgroundColor: selectedIndex === index ? 'rgba(0, 0, 0, 0.08)' : 'transparent', // Highlight active tab
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.16)', // Hover effect
                  },
                }}
              >
                <ListItemText primary={section.name} />
              </ListItem>
            ))}
            <ListItem button key="logout" onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
          
        </Drawer>

        {/* Main Content Area */}
        <Container sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Community Page
          </Typography>
          {sections[selectedIndex]?.component}
        </Container>
      </Box>
    </>
  );
};

export default CommunityPage;

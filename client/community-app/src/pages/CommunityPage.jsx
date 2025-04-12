import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Container,
  Box,
  Paper,
  Button
} from '@mui/material';
import { gql, useMutation } from '@apollo/client';

import CreateCommunityPost from '../components/CreateCommunityPost.jsx';
import CreateHelpRequest from '../components/CreateHelpRequest.jsx';
import HelpRequestList from '../components/HelpRequestList.jsx';
import ListCommunityPosts from '../components/ListCommunityPosts.jsx';
import NewsFeed from '../components/NewsFeed.jsx';
import CreateBusinessProfile from '../components/CreateBusinessProfile.jsx';
import BusinessDashboard from '../components/BusinessDashboard.jsx';
import BusinessView from '../components/BusinessView.jsx';

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

const CommunityPage = ({ role, userId }) => {
  if (!role || !userId) {
    return <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>Role or user ID not found. Please log in.</Typography>;
  }

  const [logout] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => window.location.reload()
  });

  const sectionsByRole = {
    resident: [
      { name: 'Businesses', component: <BusinessView userId={userId} /> },
      { name: 'Create Post', component: <CreateCommunityPost userId={userId} /> },
      { name: 'Create Help Request', component: <CreateHelpRequest userId={userId} /> },
      { name: 'Help Requests', component: <HelpRequestList userId={userId} role={role} /> },
      { name: 'News Feed', component: <NewsFeed userId={userId} /> },
      { name: 'Community Posts', component: <ListCommunityPosts userId={userId} /> }
    ],
    business_owner: [
      { name: 'Create Business', component: <CreateBusinessProfile userId={userId} /> },
      { name: 'Dashboard', component: <BusinessDashboard userId={userId} /> },
      { name: 'Create Post', component: <CreateCommunityPost userId={userId} /> },
      { name: 'News Feed', component: <NewsFeed userId={userId} /> },
      { name: 'Help Requests', component: <HelpRequestList userId={userId} role={role} /> },
      { name: 'Community Posts', component: <ListCommunityPosts userId={userId} /> }
    ],
    community_organizer: [
      { name: 'Businesses', component: <BusinessView userId={userId} /> },
      { name: 'Create Post', component: <CreateCommunityPost userId={userId} /> },
      { name: 'Create Help Request', component: <CreateHelpRequest userId={userId} /> },
      { name: 'Help Requests', component: <HelpRequestList userId={userId} role={role} /> },
      { name: 'News Feed', component: <NewsFeed userId={userId} /> },
      { name: 'Community Posts', component: <ListCommunityPosts userId={userId} /> }
    ]
  };

  const sections = sectionsByRole[role] || [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#1e1e1e' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Community Portal
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
        <Tabs
          value={selectedIndex}
          onChange={(e, newIndex) => setSelectedIndex(newIndex)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, backgroundColor: '#2e2e2e' }}
          textColor="inherit"
          indicatorColor="secondary"
        >
          {sections.map((section, index) => (
            <Tab key={index} label={section.name} />
          ))}
        </Tabs>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ mt: 4, mb: 8 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {sections[selectedIndex]?.name}
          </Typography>
          <Box mt={3}>{sections[selectedIndex]?.component}</Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CommunityPage;

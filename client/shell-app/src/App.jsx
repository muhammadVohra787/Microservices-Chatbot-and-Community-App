import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useQuery, gql } from '@apollo/client';

// Dynamically import components
const UserApp = lazy(() => import('userApp/App'));
const ProductApp = lazy(() => import('communityApp/App'));

// GraphQL query to check the current user's authentication status
const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      username
      email
      role
      id
    }
  }
`;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const { loading, error, data } = useQuery(CURRENT_USER_QUERY, {
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    // Log the data coming from the GraphQL query to check for any issues
    console.log('GraphQL Data:', data);
    console.log('Loading state:', loading);
    console.log('Error state:', error);

    // Listen for the custom loginSuccess event from the UserApp
    const handleLoginSuccess = (event) => {
      console.log('Login Success Event:', event);  // Log the login success event
      setIsLoggedIn(event.detail.isLoggedIn);
    };

    window.addEventListener('loginSuccess', handleLoginSuccess);

    if (!loading && !error) {
      console.log('Checking if user is logged in...');
      setIsLoggedIn(!!data?.currentUser); // Setting the login state based on currentUser data
      console.log("Shell app user logged in:", { data });
    }

    return () => {
      window.removeEventListener('loginSuccess', handleLoginSuccess);
    };
  }, [loading, error, data]);

  if (loading) {
    console.log('Loading state is true, still fetching user data');
    return <div>Loading...</div>;
  }

  if (error) {
    console.error('Error fetching user data:', error);
    return <div>Error! {error.message}</div>;
  }

  const userRole = data?.currentUser?.role;
  const userId = data?.currentUser?.id;

  // Log the user information for debugging
  console.log('User Role:', userRole);
  console.log('User ID:', userId);

  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
        {!isLoggedIn ? (
          <>
            <UserApp />
          </>
        ) : (
          <>
            <ProductApp role={userRole} userId={userId} />
          </>
        )}
      </Suspense>
    </div>
  );
}

export default App;

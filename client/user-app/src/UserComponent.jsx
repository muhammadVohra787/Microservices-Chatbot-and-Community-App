// user-app/src/UserComponent.jsx
import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Alert, Button, Form, Container, Nav, Spinner } from 'react-bootstrap';
import "./UserComponent.css"
import { useEffect } from 'react';
// GraphQL mutations

const LOGIN_MUTATION = gql`
mutation Login($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    username
    email
    role
  }
}
`;



const REGISTER_MUTATION = gql`
mutation Register($username: String!, $email: String!, $password: String!, $role: String!) {
  register(username: $username, email: $email, password: $password, role: $role)
}
`;

function UserComponent() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('resident'); // Default role as 'resident'
  const [activeTab, setActiveTab] = useState('login');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userInfo,setUserInfo]=useState({})
  // GraphQL mutation hooks
  useEffect(()=>{
    console.log(userInfo)
  },[userInfo,setUserInfo])
  // const [login] = useMutation(LOGIN_MUTATION, {
  //   onCompleted: () => {
  //     console.log("Login successful, reloading page...");
      
  //     window.dispatchEvent(new CustomEvent('loginSuccess', {
  //       detail: { isLoggedIn: true, userRole: userInfo?.role }
  //     }));
  //   },
  //   onError: (error) => setAuthError(error.message || 'Login failed'),
  // });
//Force reload to fix login issue where role or user id is not found
const [login] = useMutation(LOGIN_MUTATION, {
  onCompleted: (data) => {
    console.log("Login successful, reloading page...", data);
    // Dispatch the custom loginSuccess event if needed.
    window.dispatchEvent(new CustomEvent("loginSuccess", {
      detail: { isLoggedIn: true, userRole: data.login.role, userId: data.login.id }
    }));
    // Immediately force a reload—this ensures that the UI won’t show the error state.
    window.location.reload();
  },
  onError: (error) => setAuthError(error.message || "Login failed"),
});


  const [register] = useMutation(REGISTER_MUTATION, {
    onCompleted: () => {
      alert("Registration successful! Please log in.");
      setActiveTab('login'); // Switch to login view after successful registration
    },
    onError: (error) => setAuthError(error.message || 'Registration failed'),
  });

  // Handle form submission for both login and registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError('');

    // Ensure username and password are provided
    if (!username || !password) {
      setAuthError('Username and password are required.');
      setIsSubmitting(false);
      return;
    }

    if (activeTab === 'login') {
      await login({ variables: { username, password } }).then((res)=>{
        setUserInfo(res?.data?.login)
      })
      
    } else {
      // Check if email and role are provided for registration
      if (!email || !role) {
        setAuthError('Email and role are required for registration.');
        setIsSubmitting(false);
        return;
      }
      await register({ variables: { username, email, password, role } });
    }

    setIsSubmitting(false);
  };

  return (
    <Container className="p-5">
      <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
        <Nav.Item>
          <Nav.Link eventKey="login">Login</Nav.Link>
        </Nav.Item>
        <br></br>
        <Nav.Item>
          <Nav.Link eventKey="signup">Sign Up</Nav.Link>
        </Nav.Item>
      </Nav>
      <br></br>
      <Form onSubmit={handleSubmit} className="mt-3">
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <br></br>
          <Form.Control
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <br></br>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>

        {/* Show email and role inputs only for signup */}
        {activeTab === 'signup' && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <br></br>
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <br></br>
              <Form.Control
                as="select"
                value={role}
                onChange={(e) => setRole(e.target.value)}>
                <option value="resident">Resident</option>
                <option value="business_owner">Business Owner</option>
                <option value="community_organizer">Community Organizer</option>
              </Form.Control>
            </Form.Group>
          </>
        )}

        {authError && <Alert variant="danger">{authError}</Alert>}
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : activeTab === 'login' ? 'Login' : 'Sign Up'}
        </Button>
      </Form>
    </Container>
  );
}

export default UserComponent;

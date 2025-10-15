import React from 'react';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';

function Dashboard() {

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Logout successful, App.js will handle the redirect to the login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div>
      <h2>Welcome to the Admin Dashboard</h2>
      <p>You are logged in as: {auth.currentUser?.email}</p>
      <button onClick={handleLogout}>Logout</button>
      <hr />
      {/* User list will go here */}
    </div>
  );
}

export default Dashboard;

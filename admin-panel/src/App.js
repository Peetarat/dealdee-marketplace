import React, { useState, useEffect } from 'react';
  import './App.css';
  import { auth } from './firebaseConfig';
  import { onAuthStateChanged } from 'firebase/auth';
  import Login from './Login';
  import Dashboard from './Dashboard';

  function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }, []);

    if (loading) {
      return <div>Loading...</div>; // Or a spinner component
    }

    return (
      <div className="App">
        {user ? <Dashboard /> : <Login />}
      </div>
    );
  }

  export default App;
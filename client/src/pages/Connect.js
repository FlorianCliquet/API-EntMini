// Import React and necessary hooks from React library
import React, { useState } from 'react';
// Import useNavigate hook from react-router-dom for navigation
import { useNavigate } from 'react-router-dom'; 
// Import CSS styles for the Connect component
import './Connect.css';

// Function to verify credentials by using the backend API
async function Calendar(login, password) {
 try {
    // Fetch the calendar data from the backend API
    const response = await fetch('/api/calendar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ login: login, password: password }) 
    });
    const data = await response.json();
    // If the response is not OK, log an error message and return the data
    if (!response.ok) {
      console.log("Failed to get calendar");
      return data.isValid;
    }
    return data.isValid;
 } catch (error) {
    console.error('Error getting calendar:', error.message);
    throw new Error('An error occurred while getting calendar');
 }
}

// Function to add credentials to the database
async function addCredentials(login, password) {
 try {
    const response = await fetch('/api/db/add_logins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ login, password }) 
    });
    const data = await response.json();
    if (!response.ok) {
      console.log("Failed to add credentials to DB");
      return data.isValid;
    }

    return data.isValid;
 } catch (error) {
    console.error('Error adding credentials:', error.message);
    throw new Error('An error occurred while adding credentials');
 }
}

// Function to check credentials in the database
async function checkCredentialsInDB(login, password) {
 try {
    const response = await fetch('/api/db/check_logins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ login, password }) 
    });
    const data = await response.json();

    if (!response.ok) {
      console.log("Failed to check credentials in DB");
      return data.isValid;
    }

    return data.isValid;
 } catch (error) {
    console.error('Error checking credentials:', error.message);
    throw new Error('An error occurred while checking credentials');
 }
}

// Function to verify credentials by webscrapping
async function verifyCredentials(login, password) {
 try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ login, password })
    });

    if (!response.ok) {
      throw new Error('Failed to verify credentials');
    }

    const data = await response.json();
    return data.isValid;
 } catch (error) {
    console.error('Error verifying credentials:', error.message);
    throw new Error('The credentials are invalid');
 }
}

// Function to render the Connect page
function Connect() {
 // State variables
 const [login, setLogin] = useState('');
 const [password, setPassword] = useState('');
 const [errorMessage, setErrorMessage] = useState('');
 const [isLoading, setIsLoading] = useState(false);
 const [isFirstConnection, setIsFirstConnection] = useState(false); 
 const navigate = useNavigate(); 

 // Function to handle the login
 const handleLogin = async () => {
    console.log("Attempting to verify credentials...");
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Check if the credentials exist in the database
      const credentialsExistInDB = await checkCredentialsInDB(login, password);
      if (credentialsExistInDB) {
        // If the credentials exist in the database, set the session variables and navigate to the calendar page
        sessionStorage.setItem('isLoggedIn', true);
        sessionStorage.setItem('username', login);
        setIsLoading(false);
        navigate("/calendar");
      } else {
        // If the credentials do not exist in the database, verify the credentials by webscrapping
        const isValid = await verifyCredentials(login, password);

        if (isValid) {
          // If the credentials are valid, add the credentials to the database and navigate to the calendar page
          setIsLoading(false);
          setIsFirstConnection(true); 
          sessionStorage.setItem('isLoggedIn', true);
          sessionStorage.setItem('username', login);
          await addCredentials(login, password);
          console.log("TRIPLE MONSTRE");
          // Fetch the calendar data from the backend API in order to complete the user db
          await Calendar(login, password);

          setIsLoading(false);
          navigate("/calendar");
        } else {
          // If the credentials are invalid, display an error message
          setIsLoading(false);
          setErrorMessage('Invalid login or password');
        }
      }
    } catch (error) {
      console.error('Error during login:', error.message);
      setIsLoading(false);
      setErrorMessage(`Error during login: ${error.message}`);
    } finally {
      setIsFirstConnection(false); 
    }
 };

 return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="text-center mt-5">Connect</h2>
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
          {isFirstConnection && (
            <div className="text-center">
              <img src="/assets/smol-illegally-smol-cat.gif" alt="Loading" />
              <p>First connection, you must wait, we're setting things up...</p>
            </div>
          )}
          <form onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }} className="mt-4">
            <div className="form-group">
              <label>Login:</label>
              <input
                type="text"
                className="form-control"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Login</button>
            {isLoading && <span className="text-center mt-3">Loading...</span>}
          </form>
        </div>
      </div>
    </div>
 );
}

export default Connect;

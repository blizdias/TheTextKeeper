import React, { useState } from 'react';
import './login.css'; 


const Login = ({ onLogin, onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await window.electron.login(username, password);
    if (result.isLogged) {
      onLogin(result.isAdmin);
    } else {
      setValidationMessage('Invalid username or password.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
        const result = await window.electron.createUser(username, password, isAdmin);
        if (result.username) {
        setValidationMessage('User created successfully. Please log in.');
        onRegister(true);
        } else {
        setValidationMessage('Failed to create user.');
        onRegister(true);
        }
    } catch (error) {
        console.error('Error creating user:', error);
        setValidationMessage('Error creating user.');
        onRegister(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="title">The Text Keeper</h1>
      <h2 className="subtitle">Login / Register</h2>
      <form className="login-form" onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          className="login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="login-button">Login</button>
        <button type="button" className="register-button" onClick={handleRegister}>Register</button>
        {validationMessage && (
          <div className="validation-message">{validationMessage}</div>
        )}
      </form>
    </div>
  );

};

export default Login;

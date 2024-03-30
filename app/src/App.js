import React, { useState } from "react";
import Login from './Login'; 
import Dashboard from "./Dashboard";



export default function MainApp() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
  
    const handleLogin = (e) => {
        setIsAdmin(e);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setIsAdmin(false);
    }
  
    const handleRegister = () => {
      
      console.log('Registration successful');
    };

    const handleAdminStatus  = () => {
        return isAdmin;
    }
  
    return (
      <div className="app">
        {!isLoggedIn ? (
          <Login onLogin={handleLogin} onRegister={handleRegister} />
        ) : (
          <Dashboard isAdmin={handleAdminStatus} onLogout={handleLogout}/>
        )}
      </div>
    );
  }


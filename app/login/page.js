import React, { useState } from "react";
import Footer from "@/components/DefaultFix/Footer";
import NavBar from "@/components/DefaultFix/NavBar";
import Login from "@/components/LoginPage/Login";

export default function LoginPage() {
  const [isConnected, setIsConnected] = useState(null);

  const checkDatabaseConnection = async () => {
    try {
      const response = await fetch('/checkDatabaseConnection');
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
        if (data.connected) {
          window.alert("Connected to the database");
        } else {
          window.alert("Not connected to the database");
        }
      } else {
        setIsConnected(false);
        window.alert("Failed to check the database connection.");
      }
    } catch (error) {
      console.error('Error checking database connection:', error);
      setIsConnected(false);
      window.alert("An error occurred while checking the database connection.");
    }
  };

  return (
    <main>
      <div>
        <NavBar />
      </div>
      <div>
        <Login />
        <button onClick={checkDatabaseConnection}>Check Database Connection</button>
        {isConnected === null ? (
          <p>Click the button to check the connection.</p>
        ) : isConnected ? (
          <p>Connected to the database</p>
        ) : (
          <p>Not connected to the database</p>
        )}
      </div>
      <div>
        <Footer />
      </div>
    </main>
  );
}

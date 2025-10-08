import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Remove JWT token from localStorage
    localStorage.removeItem("token");

    // Redirect to homepage
    navigate("/");
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <p>Logging out...</p>
    </div>
  );
}

export default Logout;
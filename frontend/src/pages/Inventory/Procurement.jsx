import React from "react";
import { Link } from "react-router-dom";

const Procurement = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Link 
        to="/procurement/suppliers" 
        style={{ 
          color: "blue", 
          textDecoration: "underline", 
          cursor: "pointer",
          fontSize: "18px",
          fontWeight: "bold"
        }}
      >
        Procurement Page
      </Link>
    </div>
  );
};

export default Procurement;

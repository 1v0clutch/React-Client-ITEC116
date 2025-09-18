import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Procurement from './Procurement/Procurement'; // Assuming you created the folder and file as instructed

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/procurement">Procurement Module</Link>
          </li>
          {/* You can add more links for other modules here */}
        </ul>
      </nav>
      <Routes>
        <Route path="/procurement" element={<Procurement />} />
        {/* Add routes for other modules here */}
      </Routes>
    </Router>
  );
}

export default App;
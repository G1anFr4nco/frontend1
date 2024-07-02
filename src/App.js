import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import VideoList from './components/VideoList';
import VideoResults from './components/VideoResults';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/">Home</Link>
          <Link to="/results">Results</Link>
        </nav>
        <Routes>
          <Route exact path="/" element={<VideoList />} />
          <Route path="/results" element={<VideoResults />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

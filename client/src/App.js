import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import FeedbackForm from './components/FeedbackForm';
import FeedbackAnalysis from './components/FeedbackAnalysis';

const App = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/feedback" element={<FeedbackForm />} />
  </Routes>
);

export default App;

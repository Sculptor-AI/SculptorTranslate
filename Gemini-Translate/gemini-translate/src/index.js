import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Make sure environment variables are loaded
if (process.env.NODE_ENV !== 'production') {
  console.log('Running in development mode');
  // Verify Gemini API key is available (without exposing the actual key in logs)
  if (!process.env.REACT_APP_GEMINI_API_KEY) {
    console.warn('Warning: REACT_APP_GEMINI_API_KEY is not set in .env file');
  } else {
    console.log('Gemini API key is configured');
  }
}

// Create a root for the React application
const container = document.getElementById('root');
const root = createRoot(container);

// Render the application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
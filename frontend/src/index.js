// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './Component/ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthProvider>
    <ErrorBoundary>
      <AppWrapper />
    </ErrorBoundary>
  </AuthProvider>
);
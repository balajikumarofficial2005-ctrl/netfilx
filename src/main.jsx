import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

// Only the separately generated, offline HTML preview uses an in-memory router.
const Router = window.__LOGIN_LAB_PREVIEW__ ? MemoryRouter : BrowserRouter;
createRoot(document.getElementById('root')).render(
  <React.StrictMode><Router><App /></Router></React.StrictMode>,
);

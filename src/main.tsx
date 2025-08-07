import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import QRConfirm from './pages/QRConfirm.tsx';
import './index.css';

import { injectSpeedInsights } from '@vercel/speed-insights';
injectSpeedInsights(); // inject BEFORE render, also fine

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/qr-confirm" element={<QRConfirm />} />
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>
);


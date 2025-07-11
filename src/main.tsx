import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { injectSpeedInsights } from '@vercel/speed-insights';
injectSpeedInsights(); // inject BEFORE render, also fine

createRoot(document.getElementById("root")!).render(<App />);


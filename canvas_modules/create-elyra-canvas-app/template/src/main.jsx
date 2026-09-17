import React from 'react';
import { createRoot } from 'react-dom/client';
import ElyraApp from './elyra-canvas-app.jsx';

const root = createRoot(document.getElementById('root'));
root.render(<ElyraApp />);

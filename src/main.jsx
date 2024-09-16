import React, { createRoot } from 'react-dom/client';
import App from './components/App.jsx'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const root = createRoot(document.getElementById('app'));
root.render(<App />);
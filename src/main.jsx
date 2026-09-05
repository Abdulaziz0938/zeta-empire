import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ZetaProvider } from './context/ZetaContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ZetaProvider>
      <App />
    </ZetaProvider>
  </React.StrictMode>,
);

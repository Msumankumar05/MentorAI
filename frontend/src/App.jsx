import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Chat from './pages/Chat';
import History from './pages/History';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#111b22',
            color: '#f0f7f4',
            border: '1px solid #1e2d38',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            padding: '14px 18px',
            fontSize: '14px',
            fontFamily: "'Inter', sans-serif",
          },
          success: {
            style: {
              background: '#111b22',
              border: '1px solid rgba(0,229,192,0.3)',
              color: '#f0f7f4',
            },
            iconTheme: {
              primary: '#00e5c0',
              secondary: '#111b22',
            },
          },
          error: {
            style: {
              background: '#111b22',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f0f7f4',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#111b22',
            },
          },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/chat/:chatId" element={<Chat />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
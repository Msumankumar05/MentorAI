import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen" style={{ background: '#0c1419' }}>
      {/* Sidebar — hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 overflow-hidden relative"
        style={{ background: '#0c1419' }}
      >
        {children}
      </motion.main>
    </div>
  );
};

export default Layout;
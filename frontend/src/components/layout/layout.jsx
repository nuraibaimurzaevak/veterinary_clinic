import React from 'react';
import Header from './Header/Header';
import './layout.css';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="main-content">
        <div className="page-container">
          {children}
        </div>
      </main>
    </>
  );
};

export default Layout;
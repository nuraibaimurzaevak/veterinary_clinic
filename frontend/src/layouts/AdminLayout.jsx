import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AdminHeader />
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - 240px)`,
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
        }}
      >
        <Toolbar /> {/* Для отступа под фиксированным Header */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
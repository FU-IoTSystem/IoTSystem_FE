import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import AdminPortal from './AdminPortal';
import LeaderPortal from './LeaderPortal';
import LecturerPortal from './LecturerPortal';
import MemberPortal from './MemberPortal';
import AcademicAffairsPortal from './AcademicAffairsPortal';
import RentalRequestPage from './RentalRequestPage';
import AdminRentalApprovalPage from './AdminRentalApprovalPage';
import AdminRefundApprovalPage from './AdminRefundApprovalPage';
import TopUpPage from './TopUpPage';
import PenaltyPaymentPage from './PenaltyPaymentPage';
import { motion, AnimatePresence } from 'framer-motion';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InventoryIcon from '@mui/icons-material/Inventory';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ReplayIcon from '@mui/icons-material/Replay';
import GroupIcon from '@mui/icons-material/Group';
import { mockWallet, mockKits, mockGroups, mockLogin } from './mocks';

function Home({ onLogin, user }) {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      switch (user.role.toLowerCase()) {
        case 'admin':
          navigate('/admin');
          break;
        case 'leader':
          navigate('/leader');
          break;
        case 'lecturer':
          navigate('/lecturer');
          break;
        case 'member':
          navigate('/member');
          break;
        case 'academic':
          navigate('/academic');
          break;
        default:
          break;
      }
    }
  }, [user, navigate]);

  const handleLoginAs = async (userObj) => {
    try {
      setError('');
      // Use mockLogin to validate credentials
      const authenticatedUser = await mockLogin(userObj.email, userObj.password);
      onLogin(authenticatedUser);
      
      // Navigate to appropriate portal based on role
      switch (authenticatedUser.role.toLowerCase()) {
        case 'admin':
          navigate('/admin');
          break;
        case 'leader':
          navigate('/leader');
          break;
        case 'lecturer':
          navigate('/lecturer');
          break;
        case 'member':
          navigate('/member');
          break;
        case 'academic':
          navigate('/academic');
          break;
        default:
          // Stay on home page if role is not recognized
          break;
      }
    } catch (error) {
      setError('Login failed: ' + error.message);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 2
    }}>
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card sx={{ 
            borderRadius: 4, 
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom sx={{ 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  IoT Kit Rental System
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Welcome to the IoT Kit Rental Management System
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  Quick Login
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Click on any role below to login with demo credentials:
                </Typography>
              </Box>
              
              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto' }}>
                {[
                  { email: 'admin@fpt.edu.vn', password: 'admin', role: 'Admin', color: '#e74c3c' },
                  { email: 'leader@fpt.edu.vn', password: 'leader', role: 'Leader', color: '#3498db' },
                  { email: 'lecturer@fpt.edu.vn', password: 'lecturer', role: 'Lecturer', color: '#2ecc71' },
                  { email: 'member@fpt.edu.vn', password: 'member', role: 'Member', color: '#f39c12' },
                  { email: 'academic@fpt.edu.vn', password: 'academic', role: 'Academic', color: '#9b59b6' }
                ].map((user, index) => (
                  <motion.div
                    key={user.role}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleLoginAs(user)}
                      sx={{
                        py: 2,
                        background: `linear-gradient(135deg, ${user.color} 0%, ${user.color}dd 100%)`,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${user.color}dd 0%, ${user.color} 100%)`,
                          boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
                        }
                      }}
                    >
                      Login as {user.role}
                    </Button>
                  </motion.div>
                ))}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}

// LecturerPortal component moved to separate file: src/LecturerPortal.js
// MemberPortal component moved to separate file: src/MemberPortal.js

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<Home onLogin={handleLogin} user={user} />} />
      <Route path="/admin" element={<AdminPortal user={user} onLogout={handleLogout} />} />
      <Route path="/leader" element={<LeaderPortal user={user} onLogout={handleLogout} />} />
      <Route path="/lecturer" element={<LecturerPortal user={user} onLogout={handleLogout} />} />
      <Route path="/member" element={<MemberPortal user={user} onLogout={handleLogout} />} />
      <Route path="/academic" element={<AcademicAffairsPortal user={user} onLogout={handleLogout} />} />
      <Route path="/rental-request" element={<RentalRequestPage user={user} onLogout={handleLogout} />} />
      <Route path="/admin/rental-approval" element={<AdminRentalApprovalPage user={user} onLogout={handleLogout} />} />
      <Route path="/admin/refund-approval" element={<AdminRefundApprovalPage user={user} onLogout={handleLogout} />} />
      <Route path="/top-up" element={<TopUpPage user={user} onLogout={handleLogout} />} />
      <Route path="/penalty-payment" element={<PenaltyPaymentPage user={user} onLogout={handleLogout} />} />
    </Routes>
  );
}

function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter; 
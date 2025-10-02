import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Divider
} from '@mui/material';
import { rentalAPI, notificationAPI } from './api';

function AdminRentalApprovalPage() {
  const [rentalRequests, setRentalRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRentalRequests();
  }, []);

  const fetchRentalRequests = async () => {
    try {
      const data = await rentalAPI.getRentalRequests();
      setRentalRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching rental requests:', error);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await rentalAPI.approveRentalRequest(requestId);
      setMessage('Rental request approved successfully!');
      fetchRentalRequests();
      // Send notification to user
      await sendNotification(requestId, 'APPROVED');
    } catch (error) {
      setMessage(error.message || 'Error approving request');
    }
  };

  const handleReject = async (requestId, reason) => {
    try {
      await rentalAPI.rejectRentalRequest(requestId, reason);
      setMessage('Rental request rejected successfully!');
      fetchRentalRequests();
      // Send notification to user
      await sendNotification(requestId, 'REJECTED', reason);
    } catch (error) {
      setMessage(error.message || 'Error rejecting request');
    }
  };

  const sendNotification = async (requestId, status, reason = '') => {
    try {
      await notificationAPI.sendNotification({
        requestId,
        status,
        reason,
        type: 'RENTAL_REQUEST'
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'BORROWED': return 'info';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Rental Request Management</Typography>
      
      {message && (
        <Alert sx={{ mb: 2, width: '100%', maxWidth: 1200 }} severity="info">
          {message}
        </Alert>
      )}

      <Card sx={{ maxWidth: 1200, width: '100%' }}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Request ID</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Kit</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Total Cost</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Request Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentalRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>#{request.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{request.userName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.userEmail}
                      </Typography>
                    </TableCell>
                    <TableCell>{request.kitName}</TableCell>
                    <TableCell>{request.duration} days</TableCell>
                    <TableCell>{request.totalCost.toLocaleString()} VND</TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status.replace('_', ' ')} 
                        color={getStatusColor(request.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{formatDate(request.requestDate)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedRequest(request);
                            setDetailDialog(true);
                          }}
                        >
                          View
                        </Button>
                        {request.status === 'PENDING_APPROVAL' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleApprove(request.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => handleReject(request.id, 'Request rejected by admin')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Rental Request Details</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>User Information</Typography>
                  <Typography><strong>Name:</strong> {selectedRequest.userName}</Typography>
                  <Typography><strong>Email:</strong> {selectedRequest.userEmail}</Typography>
                  <Typography><strong>Role:</strong> {selectedRequest.userRole}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Kit Information</Typography>
                  <Typography><strong>Kit Name:</strong> {selectedRequest.kitName}</Typography>
                  <Typography><strong>Kit ID:</strong> {selectedRequest.kitId}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>Rental Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography><strong>Reason:</strong></Typography>
                  <Typography variant="body2" sx={{ pl: 2, mb: 1 }}>
                    {selectedRequest.reason}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><strong>Purpose:</strong></Typography>
                  <Typography variant="body2" sx={{ pl: 2, mb: 1 }}>
                    {selectedRequest.purpose}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography><strong>Duration:</strong> {selectedRequest.duration} days</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography><strong>Start Date:</strong> {formatDate(selectedRequest.startDate)}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography><strong>End Date:</strong> {formatDate(selectedRequest.endDate)}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>Financial Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography><strong>Total Cost:</strong> {selectedRequest.totalCost.toLocaleString()} VND</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography><strong>Status:</strong> 
                    <Chip 
                      label={selectedRequest.status.replace('_', ' ')} 
                      color={getStatusColor(selectedRequest.status)} 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>Request Information</Typography>
              <Typography><strong>Request Date:</strong> {formatDate(selectedRequest.requestDate)}</Typography>
              {selectedRequest.approvalDate && (
                <Typography><strong>Approval Date:</strong> {formatDate(selectedRequest.approvalDate)}</Typography>
              )}
              {selectedRequest.approvedBy && (
                <Typography><strong>Approved By:</strong> {selectedRequest.approvedBy}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Close</Button>
          {selectedRequest && selectedRequest.status === 'PENDING_APPROVAL' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  handleApprove(selectedRequest.id);
                  setDetailDialog(false);
                }}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  handleReject(selectedRequest.id, 'Request rejected by admin');
                  setDetailDialog(false);
                }}
              >
                Reject
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminRentalApprovalPage; 
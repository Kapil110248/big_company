import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  Stack,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Search as SearchIcon,
  AccountBalance as LoanIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/apiService';

interface Loan {
  id: string;
  user_id: string;
  user_name: string;
  user_type: 'retailer' | 'wholesaler';
  amount: number;
  interest_rate: number;
  duration_months: number;
  monthly_payment: number;
  total_repayable: number;
  amount_paid: number;
  amount_remaining: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted' | 'rejected';
  created_at: string;
  approved_at?: string;
  due_date?: string;
}

const LoanManagementPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [detailsDialog, setDetailsDialog] = useState<Loan | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getLoans({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      if (response.data.success) {
        setLoans(response.data.loans || []);
      }
    } catch (err: any) {
      console.error('Error fetching loans:', err);
      setError('Failed to load loans. Using mock data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoanAction = async (loanId: string, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await adminApi.approveLoan(loanId);
      } else {
        await adminApi.rejectLoan(loanId, 'Rejected by admin');
      }

      setSuccess(`Loan ${action}d successfully`);
      fetchLoans();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error(`Error ${action}ing loan:`, err);
      setError(`Failed to ${action} loan`);
    }
  };

  const filteredLoans = loans.filter(
    (loan) =>
      loan.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'defaulted':
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const calculateProgress = (loan: Loan) => {
    return ((loan.amount_paid / loan.total_repayable) * 100).toFixed(1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          <LoanIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Loan Management
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2}>
          <TextField
            placeholder="Search loans by user or loan ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="defaulted">Defaulted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Loan ID</strong></TableCell>
              <TableCell><strong>Borrower</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Duration</strong></TableCell>
              <TableCell><strong>Progress</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredLoans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary">No loans found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredLoans.map((loan) => (
                <TableRow key={loan.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                      {loan.id.substring(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {loan.user_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={loan.user_type}
                      size="small"
                      color={loan.user_type === 'retailer' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {loan.amount.toLocaleString()} RWF
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      @ {loan.interest_rate}% interest
                    </Typography>
                  </TableCell>
                  <TableCell>{loan.duration_months} months</TableCell>
                  <TableCell>
                    <Box sx={{ width: '100%', minWidth: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={parseFloat(calculateProgress(loan))}
                        sx={{ mb: 0.5 }}
                      />
                      <Typography variant="caption" color="textSecondary">
                        {loan.amount_paid.toLocaleString()} / {loan.total_repayable.toLocaleString()} RWF
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={loan.status}
                      color={getStatusColor(loan.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setDetailsDialog(loan)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {loan.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleLoanAction(loan.id, 'approve')}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleLoanAction(loan.id, 'reject')}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Dialog */}
      <Dialog open={!!detailsDialog} onClose={() => setDetailsDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>Loan Details</DialogTitle>
        <DialogContent>
          {detailsDialog && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Loan ID"
                value={detailsDialog.id}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Borrower Name"
                value={detailsDialog.user_name}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Borrower Type"
                value={detailsDialog.user_type}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Loan Amount"
                value={`${detailsDialog.amount.toLocaleString()} RWF`}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Interest Rate"
                value={`${detailsDialog.interest_rate}%`}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Duration"
                value={`${detailsDialog.duration_months} months`}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Monthly Payment"
                value={`${detailsDialog.monthly_payment.toLocaleString()} RWF`}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Total Repayable"
                value={`${detailsDialog.total_repayable.toLocaleString()} RWF`}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Amount Paid"
                value={`${detailsDialog.amount_paid.toLocaleString()} RWF`}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Amount Remaining"
                value={`${detailsDialog.amount_remaining.toLocaleString()} RWF`}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Status"
                value={detailsDialog.status}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Applied On"
                value={new Date(detailsDialog.created_at).toLocaleString()}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              {detailsDialog.approved_at && (
                <TextField
                  label="Approved On"
                  value={new Date(detailsDialog.approved_at).toLocaleString()}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
              {detailsDialog.due_date && (
                <TextField
                  label="Due Date"
                  value={new Date(detailsDialog.due_date).toLocaleDateString()}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoanManagementPage;

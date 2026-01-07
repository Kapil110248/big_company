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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Store as StoreIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/apiService';

interface Retailer {
  id: string;
  store_name: string;
  owner_name: string;
  phone: string;
  email: string;
  location: string;
  status: 'active' | 'suspended' | 'pending';
  credit_limit: number;
  current_balance: number;
  created_at: string;
}

const RetailerManagementPage: React.FC = () => {
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [detailsDialog, setDetailsDialog] = useState<Retailer | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchRetailers();
  }, [statusFilter]);

  const fetchRetailers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getRetailers({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      if (response.data.success) {
        setRetailers(response.data.retailers || []);
      }
    } catch (err: any) {
      console.error('Error fetching retailers:', err);
      setError('Failed to load retailers. Using mock data.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (retailerId: string, newStatus: string) => {
    try {
      await adminApi.updateRetailerStatus(retailerId, newStatus === 'active');

      setSuccess(`Retailer status updated to ${newStatus}`);
      fetchRetailers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  const filteredRetailers = retailers.filter(
    (retailer) =>
      retailer.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      retailer.owner_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      retailer.phone?.includes(searchQuery)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'suspended':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          <StoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Retailer Management
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
            placeholder="Search retailers..."
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Store Name</strong></TableCell>
              <TableCell><strong>Owner</strong></TableCell>
              <TableCell><strong>Contact</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Credit Limit</strong></TableCell>
              <TableCell><strong>Balance</strong></TableCell>
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
            ) : filteredRetailers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary">No retailers found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRetailers.map((retailer) => (
                <TableRow key={retailer.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {retailer.store_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{retailer.owner_name}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {retailer.phone}
                      </Typography>
                      {retailer.email && (
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {retailer.email}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {retailer.location}
                    </Typography>
                  </TableCell>
                  <TableCell>{(retailer.credit_limit || 0).toLocaleString()} RWF</TableCell>
                  <TableCell>{(retailer.current_balance || 0).toLocaleString()} RWF</TableCell>
                  <TableCell>
                    <Chip
                      label={retailer.status}
                      color={getStatusColor(retailer.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setDetailsDialog(retailer)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {retailer.status === 'active' ? (
                        <Tooltip title="Suspend">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleStatusChange(retailer.id, 'suspended')}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Activate">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStatusChange(retailer.id, 'active')}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
        <DialogTitle>Retailer Details</DialogTitle>
        <DialogContent>
          {detailsDialog && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Store Name"
                value={detailsDialog.store_name}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Owner Name"
                value={detailsDialog.owner_name}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Phone"
                value={detailsDialog.phone}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Email"
                value={detailsDialog.email || 'N/A'}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Location"
                value={detailsDialog.location}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Credit Limit"
                value={`${detailsDialog.credit_limit.toLocaleString()} RWF`}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Current Balance"
                value={`${detailsDialog.current_balance.toLocaleString()} RWF`}
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
                label="Joined"
                value={new Date(detailsDialog.created_at).toLocaleDateString()}
                fullWidth
                InputProps={{ readOnly: true }}
              />
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

export default RetailerManagementPage;

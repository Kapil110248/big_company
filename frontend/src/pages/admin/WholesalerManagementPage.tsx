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
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/apiService';

interface Wholesaler {
  id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  location: string;
  status: 'active' | 'suspended' | 'pending';
  credit_limit: number;
  current_balance: number;
  created_at: string;
}

const WholesalerManagementPage: React.FC = () => {
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [detailsDialog, setDetailsDialog] = useState<Wholesaler | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchWholesalers();
  }, [statusFilter]);

  const fetchWholesalers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getWholesalers({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      if (response.data.success) {
        setWholesalers(response.data.wholesalers || []);
      }
    } catch (err: any) {
      console.error('Error fetching wholesalers:', err);
      setError('Failed to load wholesalers. Using mock data.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (wholesalerId: string, newStatus: string) => {
    try {
      await adminApi.updateWholesalerStatus(wholesalerId, newStatus === 'active');

      setSuccess(`Wholesaler status updated to ${newStatus}`);
      fetchWholesalers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  const filteredWholesalers = wholesalers.filter(
    (wholesaler) =>
      wholesaler.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wholesaler.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wholesaler.phone?.includes(searchQuery)
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
          <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Wholesaler Management
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
            placeholder="Search wholesalers..."
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
              <TableCell><strong>Business Name</strong></TableCell>
              <TableCell><strong>Contact Person</strong></TableCell>
              <TableCell><strong>Contact Info</strong></TableCell>
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
            ) : filteredWholesalers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary">No wholesalers found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredWholesalers.map((wholesaler) => (
                <TableRow key={wholesaler.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {wholesaler.business_name}
                    </Typography>
                  </TableCell>
                  <TableCell>{wholesaler.contact_person}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {wholesaler.phone}
                      </Typography>
                      {wholesaler.email && (
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {wholesaler.email}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {wholesaler.location}
                    </Typography>
                  </TableCell>
                  <TableCell>{(wholesaler.credit_limit || 0).toLocaleString()} RWF</TableCell>
                  <TableCell>{(wholesaler.current_balance || 0).toLocaleString()} RWF</TableCell>
                  <TableCell>
                    <Chip
                      label={wholesaler.status}
                      color={getStatusColor(wholesaler.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setDetailsDialog(wholesaler)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {wholesaler.status === 'active' ? (
                        <Tooltip title="Suspend">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleStatusChange(wholesaler.id, 'suspended')}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Activate">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleStatusChange(wholesaler.id, 'active')}
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
        <DialogTitle>Wholesaler Details</DialogTitle>
        <DialogContent>
          {detailsDialog && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Business Name"
                value={detailsDialog.business_name}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Contact Person"
                value={detailsDialog.contact_person}
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

export default WholesalerManagementPage;

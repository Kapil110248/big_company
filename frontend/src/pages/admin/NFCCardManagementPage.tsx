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
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  Search as SearchIcon,
  CreditCard as CardIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon,
  LinkOff as UnlinkIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/apiService';

interface NFCCard {
  id: string;
  card_number: string;
  user_id?: string;
  user_name?: string;
  user_type?: 'retailer' | 'wholesaler';
  status: 'active' | 'inactive' | 'blocked' | 'unassigned';
  balance: number;
  last_used?: string;
  created_at: string;
  assigned_at?: string;
}

const NFCCardManagementPage: React.FC = () => {
  const [cards, setCards] = useState<NFCCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [detailsDialog, setDetailsDialog] = useState<NFCCard | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialog, setCreateDialog] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');

  useEffect(() => {
    fetchCards();
  }, [statusFilter]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getNFCCards({
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      if (response.data.success) {
        setCards(response.data.cards || []);
      }
    } catch (err: any) {
      console.error('Error fetching NFC cards:', err);
      setError('Failed to load NFC cards. Using mock data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async () => {
    if (!newCardNumber.trim()) {
      setError('Card number is required');
      return;
    }

    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(
        `${API_URL}/admin/nfc-cards`,
        { card_number: newCardNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('NFC card created successfully');
      setCreateDialog(false);
      setNewCardNumber('');
      fetchCards();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error creating card:', err);
      setError(err.response?.data?.error || 'Failed to create card');
    }
  };

  const handleCardAction = async (cardId: string, action: 'activate' | 'block' | 'unlink') => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${API_URL}/admin/nfc-cards/${cardId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(`Card ${action}d successfully`);
      fetchCards();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error(`Error ${action}ing card:`, err);
      setError(err.response?.data?.error || `Failed to ${action} card`);
    }
  };

  const filteredCards = cards.filter(
    (card) =>
      card.card_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (card.user_name && card.user_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'blocked':
        return 'error';
      case 'unassigned':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          <CardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          NFC Card Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialog(true)}
        >
          Register New Card
        </Button>
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
            placeholder="Search by card number or user name..."
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
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
              <MenuItem value="unassigned">Unassigned</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><strong>Card Number</strong></TableCell>
              <TableCell><strong>Assigned To</strong></TableCell>
              <TableCell><strong>User Type</strong></TableCell>
              <TableCell><strong>Balance</strong></TableCell>
              <TableCell><strong>Last Used</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredCards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">No NFC cards found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCards.map((card) => (
                <TableRow key={card.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                      {card.card_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {card.user_name ? (
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                        {card.user_name}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {card.user_type ? (
                      <Chip
                        label={card.user_type}
                        size="small"
                        color={card.user_type === 'retailer' ? 'primary' : 'secondary'}
                      />
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {card.balance.toLocaleString()} RWF
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {card.last_used ? (
                      <Typography variant="caption">
                        {new Date(card.last_used).toLocaleDateString()}
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        Never
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={card.status}
                      color={getStatusColor(card.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setDetailsDialog(card)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {card.status === 'active' && (
                        <Tooltip title="Block">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCardAction(card.id, 'block')}
                          >
                            <BlockIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(card.status === 'inactive' || card.status === 'blocked') && (
                        <Tooltip title="Activate">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleCardAction(card.id, 'activate')}
                          >
                            <ActivateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {card.user_id && (
                        <Tooltip title="Unlink from User">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleCardAction(card.id, 'unlink')}
                          >
                            <UnlinkIcon fontSize="small" />
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

      {/* Create Card Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New NFC Card</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Card Number"
              value={newCardNumber}
              onChange={(e) => setNewCardNumber(e.target.value)}
              placeholder="Enter NFC card number"
              autoFocus
              helperText="Enter the unique NFC card identifier"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateCard}
            variant="contained"
            disabled={!newCardNumber.trim()}
          >
            Register Card
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={!!detailsDialog} onClose={() => setDetailsDialog(null)} maxWidth="md" fullWidth>
        <DialogTitle>NFC Card Details</DialogTitle>
        <DialogContent>
          {detailsDialog && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <TextField
                label="Card Number"
                value={detailsDialog.card_number}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Assigned To"
                value={detailsDialog.user_name || 'Unassigned'}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              {detailsDialog.user_type && (
                <TextField
                  label="User Type"
                  value={detailsDialog.user_type}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
              <TextField
                label="Balance"
                value={`${detailsDialog.balance.toLocaleString()} RWF`}
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
                label="Created On"
                value={new Date(detailsDialog.created_at).toLocaleString()}
                fullWidth
                InputProps={{ readOnly: true }}
              />
              {detailsDialog.assigned_at && (
                <TextField
                  label="Assigned On"
                  value={new Date(detailsDialog.assigned_at).toLocaleString()}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
              )}
              {detailsDialog.last_used && (
                <TextField
                  label="Last Used"
                  value={new Date(detailsDialog.last_used).toLocaleString()}
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

export default NFCCardManagementPage;

// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Divider,
} from '@mui/material';
import {
  Assessment as ReportsIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as SalesIcon,
  People as UsersIcon,
  Inventory as InventoryIcon,
  Download as DownloadIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { adminApi } from '../../services/apiService';

interface ReportSummary {
  total_sales: number;
  total_orders: number;
  total_revenue: number;
  total_retailers: number;
  total_wholesalers: number;
  total_products: number;
  active_loans: number;
  total_loan_amount: number;
  pending_approvals: number;
}

interface SalesData {
  date: string;
  sales: number;
  orders: number;
  revenue: number;
}

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [dateRange, setDateRange] = useState<string>('7days');
  const [reportType, setReportType] = useState<string>('overview');

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getDashboard(); // Fallback to dashboard info for general reports

      if (response.data.success) {
        setSummary(response.data.summary || response.data);
        setSalesData(response.data.salesData || []);
      }
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Using mock data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format: 'csv' | 'pdf') => {
    try {
      // For mock mode, we just show a success message
      setSuccess(`Report exported successfully as ${format.toUpperCase()} (Mock Mode)`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error exporting report:', err);
      setError('Failed to export report');
    }
  };

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card sx={{ p: 3, height: '100%' }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="textSecondary">
            {title}
          </Typography>
          <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        </Stack>
        <Typography variant="h4" fontWeight="bold">
          {value}
        </Typography>
      </Stack>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          <ReportsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Reports & Analytics
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

      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <DateRangeIcon />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Date Range</InputLabel>
            <Select
              value={dateRange}
              label="Date Range"
              onChange={(e) => setDateRange(e.target.value)}
            >
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="7days">Last 7 Days</MenuItem>
              <MenuItem value="30days">Last 30 Days</MenuItem>
              <MenuItem value="90days">Last 90 Days</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={reportType}
              label="Report Type"
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="overview">Overview</MenuItem>
              <MenuItem value="sales">Sales Report</MenuItem>
              <MenuItem value="inventory">Inventory Report</MenuItem>
              <MenuItem value="users">User Report</MenuItem>
              <MenuItem value="loans">Loan Report</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flex: 1 }} />

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleExportReport('csv')}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => handleExportReport('pdf')}
          >
            Export PDF
          </Button>
        </Stack>
      </Card>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : summary ? (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Revenue"
                value={`${(summary?.total_revenue || 0).toLocaleString()} RWF`}
                icon={<TrendingUpIcon />}
                color="#4caf50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Sales"
                value={(summary?.total_sales || 0).toLocaleString()}
                icon={<SalesIcon />}
                color="#2196f3"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Orders"
                value={(summary?.total_orders || 0).toLocaleString()}
                icon={<SalesIcon />}
                color="#ff9800"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Products"
                value={(summary?.total_products || 0).toLocaleString()}
                icon={<InventoryIcon />}
                color="#9c27b0"
              />
            </Grid>
          </Grid>

          {/* User Stats */}
          <Card sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <UsersIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              User Statistics
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {summary.total_retailers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Retailers
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="secondary">
                    {summary.total_wholesalers}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Wholesalers
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {summary.pending_approvals}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending Approvals
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Card>

          {/* Loan Stats */}
          <Card sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Loan Statistics
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {summary.active_loans}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Loans
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {(summary?.total_loan_amount || 0).toLocaleString()} RWF
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Loan Amount
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Card>

          {/* Sales Chart Placeholder */}
          {salesData.length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Sales Trend
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ p: 4, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  Sales chart visualization will be displayed here
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Integration with charting library (e.g., Chart.js, Recharts) needed
                </Typography>
              </Box>
            </Card>
          )}
        </>
      ) : (
        <Alert severity="info">No report data available</Alert>
      )}
    </Box>
  );
};

export default ReportsPage;

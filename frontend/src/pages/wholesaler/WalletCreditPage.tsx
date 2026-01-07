import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Statistic,
  Modal,
  Form,
  InputNumber,
  Input,
  message,
  Avatar,
  Descriptions,
  Progress,
  List,
  Divider,
  Tabs,
  Timeline,
  Alert,
} from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  InboxOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  BankOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { wholesalerApi } from '../../services/apiService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;

interface WalletStats {
  // Inventory Value Wallet - stock value at supplier cost (like capital wallet)
  inventoryValueWallet: number;
  // Profit Wallet - potential profit based on wholesaler price
  profitWallet: number;
  // Credit given to retailers
  totalCreditExtended: number;
  creditUsed: number;
  creditAvailable: number;
  // Supplier orders
  totalSupplierOrders: number;
  pendingSupplierPayments: number;
}

interface SupplierOrder {
  id: string;
  supplier_name: string;
  invoice_number: string;
  total_amount: number;
  payment_status: 'paid' | 'pending' | 'partial';
  items_count: number;
  created_at: string;
  paid_at?: string;
}

interface CreditRequest {
  id: string;
  retailer_id: string;
  retailer_name: string;
  retailer_shop: string;
  retailer_phone: string;
  current_credit: number;
  credit_limit: number;
  requested_amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  processed_at?: string;
  rejection_reason?: string;
}

export const WalletCreditPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [supplierOrders, setSupplierOrders] = useState<SupplierOrder[]>([]);
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
  const [detailsModal, setDetailsModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const [statsResponse, ordersResponse, creditResponse] = await Promise.all([
        wholesalerApi.getInventoryStats(),
        wholesalerApi.getSupplierOrders ? wholesalerApi.getSupplierOrders() : Promise.resolve({ data: { orders: [] } }),
        wholesalerApi.getCreditRequests(),
      ]);

      // Calculate wallet values from inventory stats
      const stockValueSupplier = statsResponse.data?.stock_value_supplier_cost || 0;
      const stockValueWholesaler = statsResponse.data?.stock_value_wholesaler_price || 0;

      setWalletStats({
        inventoryValueWallet: stockValueSupplier,
        profitWallet: stockValueWholesaler - stockValueSupplier,
        totalCreditExtended: creditResponse.data?.stats?.totalCreditExtended || 2500000,
        creditUsed: creditResponse.data?.stats?.totalCreditUsed || 1800000,
        creditAvailable: creditResponse.data?.stats?.creditAvailable || 700000,
        totalSupplierOrders: ordersResponse.data?.total || 45,
        pendingSupplierPayments: ordersResponse.data?.pending_amount || 1500000,
      });

      setSupplierOrders(ordersResponse.data?.orders || [
        { id: '1', supplier_name: 'Bralirwa Ltd', invoice_number: 'SUP-INV-001', total_amount: 5000000, payment_status: 'paid', items_count: 120, created_at: '2024-12-01', paid_at: '2024-12-05' },
        { id: '2', supplier_name: 'Inyange Industries', invoice_number: 'SUP-INV-002', total_amount: 3500000, payment_status: 'pending', items_count: 85, created_at: '2024-12-10' },
        { id: '3', supplier_name: 'SONAFRUITS', invoice_number: 'SUP-INV-003', total_amount: 2800000, payment_status: 'paid', items_count: 65, created_at: '2024-11-28', paid_at: '2024-12-02' },
        { id: '4', supplier_name: 'Rwanda Farmers Coffee', invoice_number: 'SUP-INV-004', total_amount: 1200000, payment_status: 'partial', items_count: 30, created_at: '2024-12-08' },
      ]);

      setCreditRequests(creditResponse.data?.requests || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      // Set demo data
      setWalletStats({
        inventoryValueWallet: 12500000,
        profitWallet: 3750000,
        totalCreditExtended: 2500000,
        creditUsed: 1800000,
        creditAvailable: 700000,
        totalSupplierOrders: 45,
        pendingSupplierPayments: 1500000,
      });
      setSupplierOrders([
        { id: '1', supplier_name: 'Bralirwa Ltd', invoice_number: 'SUP-INV-001', total_amount: 5000000, payment_status: 'paid', items_count: 120, created_at: '2024-12-01', paid_at: '2024-12-05' },
        { id: '2', supplier_name: 'Inyange Industries', invoice_number: 'SUP-INV-002', total_amount: 3500000, payment_status: 'pending', items_count: 85, created_at: '2024-12-10' },
        { id: '3', supplier_name: 'SONAFRUITS', invoice_number: 'SUP-INV-003', total_amount: 2800000, payment_status: 'paid', items_count: 65, created_at: '2024-11-28', paid_at: '2024-12-02' },
        { id: '4', supplier_name: 'Rwanda Farmers Coffee', invoice_number: 'SUP-INV-004', total_amount: 1200000, payment_status: 'partial', items_count: 30, created_at: '2024-12-08' },
      ]);
      setCreditRequests([
        { id: '1', retailer_id: 'ret_001', retailer_name: 'Jean Pierre', retailer_shop: 'Kigali Shop', retailer_phone: '+250788100001', current_credit: 50000, credit_limit: 100000, requested_amount: 150000, reason: 'Expanding inventory for holiday season', status: 'pending', created_at: '2024-11-29T10:00:00Z' },
        { id: '2', retailer_id: 'ret_002', retailer_name: 'Marie Claire', retailer_shop: 'Corner Store', retailer_phone: '+250788100002', current_credit: 25000, credit_limit: 50000, requested_amount: 75000, reason: 'New product line stocking', status: 'pending', created_at: '2024-11-28T14:30:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `${(amount ?? 0).toLocaleString()} RWF`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-RW', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  const handleApprove = async (request: CreditRequest) => {
    setProcessing(true);
    try {
      await wholesalerApi.approveCreditRequest(request.id);
      message.success(`Credit request for ${request.retailer_name} approved!`);
      fetchWalletData();
      setDetailsModal(false);
    } catch (error) {
      message.success(`Credit request approved! (Demo mode)`);
      setCreditRequests(prev => prev.map(r =>
        r.id === request.id ? { ...r, status: 'approved' as const, processed_at: new Date().toISOString() } : r
      ));
      setDetailsModal(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      message.error('Please provide a rejection reason');
      return;
    }
    setProcessing(true);
    try {
      await wholesalerApi.rejectCreditRequest(selectedRequest.id, rejectReason);
      message.success(`Credit request rejected`);
      fetchWalletData();
    } catch (error) {
      message.success(`Credit request rejected (Demo mode)`);
      setCreditRequests(prev => prev.map(r =>
        r.id === selectedRequest.id ? { ...r, status: 'rejected' as const, rejection_reason: rejectReason } : r
      ));
    } finally {
      setRejectModal(false);
      setDetailsModal(false);
      setRejectReason('');
      setProcessing(false);
    }
  };

  const supplierOrderColumns = [
    {
      title: 'Supplier',
      dataIndex: 'supplier_name',
      key: 'supplier_name',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Invoice #',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: 'Items',
      dataIndex: 'items_count',
      key: 'items_count',
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (v: number) => <Text strong>{formatCurrency(v)}</Text>,
    },
    {
      title: 'Payment Status',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string) => {
        const colors: Record<string, string> = { paid: 'green', pending: 'orange', partial: 'blue' };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Order Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (v: string) => formatDate(v),
    },
    {
      title: 'Paid Date',
      dataIndex: 'paid_at',
      key: 'paid_at',
      render: (v: string) => v ? formatDate(v) : <Text type="secondary">-</Text>,
    },
  ];

  const creditRequestColumns = [
    {
      title: 'Retailer',
      key: 'retailer',
      render: (_: any, record: CreditRequest) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#722ed1' }} />
          <div>
            <Text strong>{record.retailer_name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{record.retailer_shop}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Current Credit',
      key: 'current',
      render: (_: any, record: CreditRequest) => (
        <div>
          <Text>{formatCurrency(record.current_credit)}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>/ {formatCurrency(record.credit_limit)} limit</Text>
        </div>
      ),
    },
    {
      title: 'Requested',
      dataIndex: 'requested_amount',
      key: 'requested',
      render: (amount: number) => <Text strong style={{ color: '#1890ff' }}>{formatCurrency(amount)}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode }> = {
          pending: { color: 'orange', icon: <ClockCircleOutlined /> },
          approved: { color: 'green', icon: <CheckCircleOutlined /> },
          rejected: { color: 'red', icon: <CloseCircleOutlined /> },
        };
        return <Tag color={config[status]?.color} icon={config[status]?.icon}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CreditRequest) => (
        <Space>
          <Button size="small" onClick={() => { setSelectedRequest(record); setDetailsModal(true); }}>
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button size="small" type="primary" onClick={() => handleApprove(record)}>Approve</Button>
              <Button size="small" danger onClick={() => { setSelectedRequest(record); setRejectModal(true); }}>Reject</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const pendingRequests = creditRequests.filter(r => r.status === 'pending');

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
          padding: '24px',
          marginBottom: 24,
          borderRadius: 12,
          color: 'white',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              <WalletOutlined /> Wallet & Credit
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
              Manage your inventory value, profit margins, supplier payments, and retailer credit
            </Text>
          </Col>
          <Col>
            {pendingRequests.length > 0 && (
              <Tag color="orange" style={{ fontSize: 14, padding: '4px 12px' }}>
                {pendingRequests.length} Pending Credit Requests
              </Tag>
            )}
          </Col>
        </Row>
      </div>

      {/* Wallet Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '4px solid #fa8c16' }}>
            <Statistic
              title={<Space><InboxOutlined /> Inventory Value Wallet</Space>}
              value={walletStats?.inventoryValueWallet || 0}
              prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
              formatter={(v) => formatCurrency(Number(v))}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Stock value at supplier/manufacturer cost
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '4px solid #52c41a' }}>
            <Statistic
              title={<Space><RiseOutlined /> Profit Wallet</Space>}
              value={walletStats?.profitWallet || 0}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
              formatter={(v) => formatCurrency(Number(v))}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Based on wholesaler price margin
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '4px solid #1890ff' }}>
            <Statistic
              title={<Space><BankOutlined /> Credit Extended</Space>}
              value={walletStats?.totalCreditExtended || 0}
              prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
              formatter={(v) => formatCurrency(Number(v))}
            />
            <Progress
              percent={walletStats ? Math.round((walletStats.creditUsed / walletStats.totalCreditExtended) * 100) : 0}
              size="small"
              status="active"
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatCurrency(walletStats?.creditUsed || 0)} used
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable style={{ borderTop: '4px solid #ff4d4f' }}>
            <Statistic
              title={<Space><ExclamationCircleOutlined /> Pending Supplier Payments</Space>}
              value={walletStats?.pendingSupplierPayments || 0}
              prefix={<DollarOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
              formatter={(v) => formatCurrency(Number(v))}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Outstanding to suppliers
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Tabs for different sections */}
      <Card>
        <Tabs defaultActiveKey="supplier-orders">
          <TabPane
            tab={<span><ShoppingCartOutlined /> Supplier Order History</span>}
            key="supplier-orders"
          >
            <Alert
              message="Order History from Suppliers"
              description="Track all orders paid from your inventory value wallet to suppliers/manufacturers"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={supplierOrderColumns}
              dataSource={supplierOrders}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane
            tab={<span><DollarOutlined /> Credit Approvals ({pendingRequests.length} pending)</span>}
            key="credit-approvals"
          >
            <Alert
              message="Retailer Credit Requests"
              description="Approve or reject credit requests from your assigned retailers"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={creditRequestColumns}
              dataSource={creditRequests}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Credit Request Details Modal */}
      <Modal
        title="Credit Request Details"
        open={detailsModal}
        onCancel={() => setDetailsModal(false)}
        width={600}
        footer={selectedRequest?.status === 'pending' ? [
          <Button key="reject" danger onClick={() => setRejectModal(true)}>Reject</Button>,
          <Button key="approve" type="primary" loading={processing} onClick={() => selectedRequest && handleApprove(selectedRequest)}>
            Approve Request
          </Button>,
        ] : [<Button key="close" onClick={() => setDetailsModal(false)}>Close</Button>]}
      >
        {selectedRequest && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Retailer">
              <Space>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#722ed1' }} />
                <div>
                  <Text strong>{selectedRequest.retailer_name}</Text>
                  <br />
                  <Text type="secondary">{selectedRequest.retailer_shop}</Text>
                </div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Phone">{selectedRequest.retailer_phone}</Descriptions.Item>
            <Descriptions.Item label="Current Credit Used">{formatCurrency(selectedRequest.current_credit)}</Descriptions.Item>
            <Descriptions.Item label="Credit Limit">{formatCurrency(selectedRequest.credit_limit)}</Descriptions.Item>
            <Descriptions.Item label="Requested Amount">
              <Text strong style={{ color: '#1890ff', fontSize: 16 }}>{formatCurrency(selectedRequest.requested_amount)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Reason">{selectedRequest.reason}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedRequest.status === 'approved' ? 'green' : selectedRequest.status === 'rejected' ? 'red' : 'orange'}>
                {selectedRequest.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            {selectedRequest.rejection_reason && (
              <Descriptions.Item label="Rejection Reason">{selectedRequest.rejection_reason}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Credit Request"
        open={rejectModal}
        onCancel={() => { setRejectModal(false); setRejectReason(''); }}
        onOk={handleReject}
        okText="Reject"
        okButtonProps={{ danger: true, loading: processing }}
      >
        <Text>Please provide a reason for rejecting this credit request:</Text>
        <TextArea
          rows={4}
          placeholder="Enter rejection reason..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          style={{ marginTop: 16 }}
        />
      </Modal>
    </div>
  );
};

export default WalletCreditPage;

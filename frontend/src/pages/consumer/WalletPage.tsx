import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Statistic,
  message,
  Tabs,
  Alert,
  Empty,
  Spin,
  Divider,
  Badge,
  Tooltip,
  Radio,
} from 'antd';
import {
  WalletOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  PlusOutlined,
  SendOutlined,
  PhoneOutlined,
  BankOutlined,
  SafetyOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  StarOutlined,
  StarFilled,
  QrcodeOutlined,
  MobileOutlined,
  FileTextOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShoppingOutlined,
  EyeOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { nfcApi, consumerApi } from '../../services/apiService';

const { Title, Text, Paragraph } = Typography;

// Updated Types for 3-balance structure
interface WalletBalance {
  dashboardBalance: number;
  creditBalance: number;
  availableBalance: number; // dashboardBalance + creditBalance
  currency: string;
}

interface NFCCard {
  id: string;
  uid: string;
  card_number: string;
  status: 'active' | 'blocked' | 'inactive';
  is_primary: boolean;
  linked_at: string;
  last_used?: string;
  nickname?: string;
}

interface CardOrder {
  id: string;
  order_number: string;
  shop_name: string;
  shop_location: string;
  amount: number;
  items_count: number;
  date: string;
  status: string;
}

interface Transaction {
  id: string;
  type: 'top_up' | 'gas_payment' | 'order_payment' | 'refund' | 'credit_payment' | 'loan_disbursement';
  amount: number;
  balance_type: 'dashboard' | 'credit';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  merchant_name?: string;
  meter_id?: string;
  order_id?: string;
  reference_number?: string;
}

interface CreditInfo {
  credit_limit: number;
  available_credit: number;
  used_credit: number;
  outstanding_balance: number;
  payment_status: 'current' | 'overdue' | 'pending';
  next_payment_date?: string;
  next_payment_amount?: number;
}

interface CreditOrder {
  id: string;
  order_number: string;
  amount: number;
  date: string;
  status: string;
}

interface CreditApproval {
  id: string;
  amount_requested: number;
  status: 'submitted' | 'reviewing' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reason?: string;
}

const ConsumerWalletPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [cards, setCards] = useState<NFCCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [creditOrders, setCreditOrders] = useState<CreditOrder[]>([]);
  const [creditApprovals, setCreditApprovals] = useState<CreditApproval[]>([]);
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [linkCardModalVisible, setLinkCardModalVisible] = useState(false);
  const [changePinModalVisible, setChangePinModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<NFCCard | null>(null);
  const [activeTab, setActiveTab] = useState('transactions');
  const [cardOrdersModalVisible, setCardOrdersModalVisible] = useState(false);
  const [cardOrders, setCardOrders] = useState<{ [key: string]: CardOrder[] }>({});

  const [topUpForm] = Form.useForm();
  const [refundForm] = Form.useForm();
  const [loanForm] = Form.useForm();
  const [linkCardForm] = Form.useForm();
  const [changePinForm] = Form.useForm();



  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load wallet balances
      const walletsResponse = await walletApi.getWallets();
      const wallets = walletsResponse.data.data || [];

      const dashboardWallet = wallets.find((w: any) => w.type === 'dashboard_wallet');
      const creditWallet = wallets.find((w: any) => w.type === 'credit_wallet');

      const dashboardBal = dashboardWallet?.balance || 0;
      const creditBal = creditWallet?.balance || 0;

      setBalance({
        dashboardBalance: dashboardBal,
        creditBalance: creditBal,
        availableBalance: dashboardBal + creditBal,
        currency: 'RWF'
      });

      // Load NFC cards
      const cardsResponse = await nfcApi.getMyCards();
      setCards(cardsResponse.data.data || []);

      // Load transactions
      const transactionsResponse = await walletApi.getWalletTransactions();
      setTransactions(transactionsResponse.data.data || []);

      // TODO: Load credit info, credit orders, credit approvals when APIs are available
      setCreditInfo(null);
      setCreditOrders([]);
      setCreditApprovals([]);
      setCardOrders({});
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      message.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTopUp = async (values: any) => {
    try {
      setLoading(true);
      message.success(`Top-up request of ${values.amount.toLocaleString()} RWF submitted!`);
      setTopUpModalVisible(false);
      topUpForm.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Top-up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefundRequest = async (values: any) => {
    try {
      setLoading(true);
      message.success('Refund request submitted successfully! We will review and process it.');
      setRefundModalVisible(false);
      refundForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to submit refund request');
    } finally {
      setLoading(false);
    }
  };

  const handleLoanRequest = async (values: any) => {
    try {
      setLoading(true);
      message.success('Loan request submitted successfully! We will review your application.');
      setLoanModalVisible(false);
      loanForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to submit loan request');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkCard = async (values: any) => {
    if (cards.length >= 3) {
      message.error('You can only link a maximum of 3 cards. Please remove a card first.');
      return;
    }
    try {
      setLoading(true);
      message.success('NFC card linked successfully!');
      setLinkCardModalVisible(false);
      linkCardForm.resetFields();
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to link card');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePin = async (values: any) => {
    if (!selectedCard) return;
    try {
      setLoading(true);
      message.success('Card PIN changed successfully!');
      setChangePinModalVisible(false);
      changePinForm.resetFields();
      setSelectedCard(null);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to change PIN');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPrimary = async (card: NFCCard) => {
    try {
      message.success(`${card.nickname || card.card_number} set as primary card`);
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to set primary card');
    }
  };

  const handleViewCardOrders = (card: NFCCard) => {
    setSelectedCard(card);
    setCardOrdersModalVisible(true);
  };

  const handleUnlinkCard = async (card: NFCCard) => {
    Modal.confirm({
      title: 'Unlink Card',
      content: `Are you sure you want to unlink ${card.nickname || card.card_number}?`,
      okText: 'Unlink',
      okType: 'danger',
      onOk: async () => {
        try {
          message.success('Card unlinked successfully');
          loadData();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to unlink card');
        }
      },
    });
  };

  const transactionColumns: ColumnsType<Transaction> = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
      width: 100,
    },
    {
      title: 'Description',
      key: 'description',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.description}</Text>
          {record.merchant_name && (
            <Text type="secondary" style={{ fontSize: 12 }}>{record.merchant_name}</Text>
          )}
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.balance_type === 'dashboard' ? 'Dashboard' : 'Credit'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const config: Record<string, { color: string; label: string }> = {
          order_payment: { color: 'red', label: 'Purchase' },
          gas_payment: { color: 'orange', label: 'Gas' },
          top_up: { color: 'green', label: 'Top-up' },
          refund: { color: 'cyan', label: 'Refund' },
          loan_disbursement: { color: 'purple', label: 'Loan' },
          credit_payment: { color: 'blue', label: 'Credit' },
        };
        const { color, label } = config[type] || { color: 'default', label: type };
        return <Tag color={color}>{label}</Tag>;
      },
      width: 100,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: amount > 0 ? '#52c41a' : '#ff4d4f' }}>
          {amount > 0 ? '+' : ''}{amount.toLocaleString()} RWF
        </Text>
      ),
      align: 'right',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const color = status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'error';
        return <Tag color={color}>{status}</Tag>;
      },
      width: 100,
    },
  ];

  return (
    <div style={{ padding: '16px' }} className="wallet-page">
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
        <Col flex="auto">
          <Title level={3} style={{ margin: 0 }}>
            <WalletOutlined style={{ marginRight: 12 }} />
            Wallet & Cards
          </Title>
          <Text type="secondary">Manage your balances and NFC payment cards</Text>
        </Col>
      </Row>

      {/* 3 Balance Cards Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Available Balance - NO TOP-UP BUTTON */}
        <Col xs={24} md={8}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 16,
            }}
          >
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                Available Balance
              </Text>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                {balance?.availableBalance?.toLocaleString() || 0} RWF
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                Dashboard + Credit Balance
              </Text>
            </Space>
          </Card>
        </Col>

        {/* Dashboard Balance - Replaces "Linked NFC Cards" */}
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 12 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <WalletOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Dashboard Balance</Text>
                    <div>
                      <Text strong style={{ fontSize: 18 }}>
                        {balance?.dashboardBalance?.toLocaleString() || 0} RWF
                      </Text>
                    </div>
                  </div>
                </Space>
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>Main wallet</Text>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setTopUpModalVisible(true)}
                  block
                  size="small"
                >
                  Top Up
                </Button>
                <Button
                  icon={<ArrowUpOutlined />}
                  onClick={() => setRefundModalVisible(true)}
                  block
                  size="small"
                >
                  Request Refund
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>

        {/* Credit Balance - Replaces "This Month's Spending" */}
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 12 }}>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <CreditCardOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Credit Balance</Text>
                    <div>
                      <Text strong style={{ fontSize: 18 }}>
                        {balance?.creditBalance?.toLocaleString() || 0} RWF
                      </Text>
                    </div>
                  </div>
                </Space>
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>Available credit</Text>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setLoanModalVisible(true)}
                  block
                  size="small"
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  Request Loan
                </Button>
                <Button
                  icon={<FileTextOutlined />}
                  block
                  size="small"
                >
                  View Details
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* USSD Info */}
      <Alert
        message="Access your wallet via USSD"
        description={
          <span>
            Dial <Text strong code>*939#</Text> from your registered phone to check balance without internet.
          </span>
        }
        type="info"
        showIcon
        icon={<MobileOutlined />}
        style={{ marginBottom: 24 }}
      />

      {/* Tabs for Transactions and Cards */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'transactions',
              label: (
                <span>
                  <HistoryOutlined /> Transactions
                </span>
              ),
              children: (
                <>
                  <Alert
                    message="Dashboard & Credit Transactions"
                    description="All transactions from both Dashboard and Credit balances are shown below."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Table
                    columns={transactionColumns}
                    dataSource={transactions}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 700 }}
                    size="small"
                    pagination={{
                      showSizeChanger: true,
                      showTotal: (total) => `${total} transactions`,
                      size: 'small',
                    }}
                  />
                </>
              ),
            },
            {
              key: 'cards',
              label: (
                <span>
                  <CreditCardOutlined /> My NFC Cards ({cards.length}/3)
                </span>
              ),
              children: (
                <>
                  {cards.length >= 3 && (
                    <Alert
                      message="Maximum cards reached"
                      description="You've linked the maximum of 3 cards. Remove a card to add a new one."
                      type="warning"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  )}
                  {cards.length > 0 ? (
                    <Row gutter={[16, 16]}>
                      {cards.map((card) => (
                        <Col xs={24} sm={12} lg={8} key={card.id}>
                          <Card
                            style={{
                              background: card.is_primary
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                              color: 'white',
                              borderRadius: 12,
                            }}
                            actions={[
                              <Tooltip title={card.is_primary ? 'Primary Card' : 'Set as Primary'}>
                                <Button
                                  type="text"
                                  icon={card.is_primary ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined />}
                                  onClick={() => !card.is_primary && handleSetPrimary(card)}
                                  style={{ color: 'white' }}
                                />
                              </Tooltip>,
                              <Tooltip title="Change PIN">
                                <Button
                                  type="text"
                                  icon={<LockOutlined />}
                                  onClick={() => {
                                    setSelectedCard(card);
                                    setChangePinModalVisible(true);
                                  }}
                                  style={{ color: 'white' }}
                                />
                              </Tooltip>,
                              <Tooltip title="View Order History">
                                <Button
                                  type="text"
                                  icon={<ShoppingOutlined />}
                                  onClick={() => handleViewCardOrders(card)}
                                  style={{ color: 'white' }}
                                />
                              </Tooltip>,
                              <Tooltip title="Unlink Card">
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  onClick={() => handleUnlinkCard(card)}
                                  style={{ color: '#ff7875' }}
                                />
                              </Tooltip>,
                            ]}
                          >
                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <CreditCardOutlined style={{ fontSize: 32 }} />
                                {card.is_primary && (
                                  <Tag color="gold">Primary</Tag>
                                )}
                              </div>
                              <div style={{ marginTop: 16 }}>
                                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                                  {card.nickname || 'NFC Card'}
                                </Text>
                                <Title level={4} style={{ color: 'white', margin: 0, letterSpacing: 2 }}>
                                  {card.card_number}
                                </Title>
                              </div>
                              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                                UID: {card.uid}
                              </Text>
                            </Space>
                          </Card>
                        </Col>
                      ))}
                      {cards.length < 3 && (
                        <Col xs={24} sm={12} lg={8}>
                          <Card
                            style={{
                              height: '100%',
                              minHeight: 200,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px dashed #d9d9d9',
                              cursor: 'pointer',
                            }}
                            onClick={() => setLinkCardModalVisible(true)}
                          >
                            <Space direction="vertical" align="center">
                              <PlusOutlined style={{ fontSize: 32, color: '#999' }} />
                              <Text type="secondary">Link New Card</Text>
                            </Space>
                          </Card>
                        </Col>
                      )}
                    </Row>
                  ) : (
                    <Empty
                      image={<CreditCardOutlined style={{ fontSize: 64, color: '#ccc' }} />}
                      description="No NFC cards linked yet"
                    >
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setLinkCardModalVisible(true)}
                      >
                        Link Your First Card
                      </Button>
                    </Empty>
                  )}
                </>
              ),
            },
            {
              key: 'dashboard_ledger',
              label: (
                <span>
                  <WalletOutlined /> Dashboard Ledger
                </span>
              ),
              children: (
                <>
                  <Alert
                    message="Dashboard Balance Transactions"
                    description="Detailed view of all Dashboard balance transactions including top-ups, gas payments, and order payments."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Table
                    columns={[
                      {
                        title: 'Date',
                        dataIndex: 'created_at',
                        key: 'created_at',
                        render: (date) => new Date(date).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }),
                        width: 150,
                      },
                      {
                        title: 'Type',
                        dataIndex: 'type',
                        key: 'type',
                        render: (type) => {
                          const config: Record<string, { color: string; label: string }> = {
                            order_payment: { color: 'red', label: 'Order Payment' },
                            gas_payment: { color: 'orange', label: 'Gas Payment' },
                            top_up: { color: 'green', label: 'Top-up' },
                            refund: { color: 'cyan', label: 'Refund' },
                          };
                          const { color, label } = config[type] || { color: 'default', label: type };
                          return <Tag color={color}>{label}</Tag>;
                        },
                        width: 120,
                      },
                      {
                        title: 'Description',
                        key: 'description',
                        render: (_, record) => (
                          <Space direction="vertical" size={0}>
                            <Text>{record.description}</Text>
                            {record.merchant_name && (
                              <Text type="secondary" style={{ fontSize: 12 }}>Merchant: {record.merchant_name}</Text>
                            )}
                            {record.order_id && (
                              <Text type="secondary" style={{ fontSize: 12 }}>Order: {record.order_id}</Text>
                            )}
                            {record.meter_id && (
                              <Text type="secondary" style={{ fontSize: 12 }}>Meter: {record.meter_id}</Text>
                            )}
                            {record.reference_number && (
                              <Text type="secondary" style={{ fontSize: 12 }}>Ref: {record.reference_number}</Text>
                            )}
                          </Space>
                        ),
                      },
                      {
                        title: 'Amount',
                        dataIndex: 'amount',
                        key: 'amount',
                        render: (amount) => (
                          <Text strong style={{ color: amount > 0 ? '#52c41a' : '#ff4d4f' }}>
                            {amount > 0 ? '+' : ''}{amount.toLocaleString()} RWF
                          </Text>
                        ),
                        align: 'right',
                        width: 120,
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status) => {
                          const color = status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'error';
                          return <Tag color={color}>{status.toUpperCase()}</Tag>;
                        },
                        width: 100,
                      },
                    ]}
                    dataSource={transactions.filter(t => t.balance_type === 'dashboard')}
                    rowKey="id"
                    loading={loading}
                    scroll={{ x: 800 }}
                    size="small"
                    pagination={{
                      showSizeChanger: true,
                      showTotal: (total) => `${total} dashboard transactions`,
                      size: 'small',
                    }}
                  />
                </>
              ),
            },
            {
              key: 'credit_ledger',
              label: (
                <span>
                  <DollarOutlined /> Credit Ledger
                </span>
              ),
              children: (
                <>
                  {/* Credit Overview */}
                  {creditInfo && (
                    <Card style={{ marginBottom: 16 }}>
                      <Row gutter={16}>
                        <Col span={6}>
                          <Statistic
                            title="Credit Limit"
                            value={creditInfo.credit_limit}
                            suffix="RWF"
                            valueStyle={{ color: '#1890ff', fontSize: 20 }}
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title="Available Credit"
                            value={creditInfo.available_credit}
                            suffix="RWF"
                            valueStyle={{ color: '#52c41a', fontSize: 20 }}
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title="Used Credit"
                            value={creditInfo.used_credit}
                            suffix="RWF"
                            valueStyle={{ color: '#fa8c16', fontSize: 20 }}
                          />
                        </Col>
                        <Col span={6}>
                          <Statistic
                            title="Outstanding Balance"
                            value={creditInfo.outstanding_balance}
                            suffix="RWF"
                            valueStyle={{ color: '#ff4d4f', fontSize: 20 }}
                          />
                        </Col>
                      </Row>
                      <Divider />
                      <Row gutter={16} align="middle">
                        <Col span={8}>
                          <Text type="secondary">Current Loan Date: </Text>
                          <Text strong>{new Date('2024-11-25').toLocaleDateString()}</Text>
                        </Col>
                        <Col span={8}>
                          <Text type="secondary">Next Payment Due: </Text>
                          <Text strong style={{ color: '#fa8c16' }}>
                            {creditInfo.next_payment_date ? new Date(creditInfo.next_payment_date).toLocaleDateString() : 'N/A'}
                          </Text>
                          <Text type="secondary"> - </Text>
                          <Text strong style={{ color: '#ff4d4f' }}>
                            {creditInfo.next_payment_amount?.toLocaleString()} RWF
                          </Text>
                        </Col>
                        <Col span={8} style={{ textAlign: 'right' }}>
                          <Button
                            type="primary"
                            danger
                            icon={<DollarOutlined />}
                            onClick={() => {
                              Modal.confirm({
                                title: 'Pay Loan',
                                content: (
                                  <div>
                                    <Text>Outstanding Balance: <strong>{creditInfo.outstanding_balance.toLocaleString()} RWF</strong></Text>
                                    <Divider />
                                    <Text type="secondary">Select Payment Method:</Text>
                                    <div style={{ marginTop: 16 }}>
                                      <Radio.Group defaultValue="dashboard" style={{ width: '100%' }}>
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                          <Radio value="dashboard">
                                            <Space>
                                              <WalletOutlined style={{ color: '#1890ff' }} />
                                              <span>Dashboard Balance ({balance?.dashboardBalance?.toLocaleString()} RWF available)</span>
                                            </Space>
                                          </Radio>
                                          <Radio value="mtn">
                                            <Space>
                                              <MobileOutlined style={{ color: '#ffcc00' }} />
                                              <span>MTN Mobile Money</span>
                                            </Space>
                                          </Radio>
                                          <Radio value="airtel">
                                            <Space>
                                              <MobileOutlined style={{ color: '#ff0000' }} />
                                              <span>Airtel Money</span>
                                            </Space>
                                          </Radio>
                                        </Space>
                                      </Radio.Group>
                                    </div>
                                  </div>
                                ),
                                okText: 'Pay Now',
                                cancelText: 'Cancel',
                                onOk: () => {
                                  message.success('Loan payment initiated! Check your phone to confirm.');
                                },
                              });
                            }}
                          >
                            Pay Loan
                          </Button>
                        </Col>
                      </Row>
                      <Divider style={{ margin: '12px 0' }} />
                      <Row>
                        <Col span={24}>
                          <Text type="secondary">Payment Status: </Text>
                          <Tag color={creditInfo.payment_status === 'current' ? 'success' : creditInfo.payment_status === 'overdue' ? 'error' : 'warning'}>
                            {creditInfo.payment_status.toUpperCase()}
                          </Tag>
                        </Col>
                      </Row>
                    </Card>
                  )}

                  {/* Credit Transactions */}
                  <Card title="Credit Transactions" size="small" style={{ marginBottom: 16 }}>
                    <Table
                      columns={[
                        {
                          title: 'Date',
                          dataIndex: 'created_at',
                          key: 'created_at',
                          render: (date) => new Date(date).toLocaleDateString(),
                          width: 100,
                        },
                        {
                          title: 'Type',
                          dataIndex: 'type',
                          key: 'type',
                          render: (type) => {
                            const config: Record<string, { color: string; label: string }> = {
                              order_payment: { color: 'red', label: 'Purchase' },
                              loan_disbursement: { color: 'purple', label: 'Loan' },
                              credit_payment: { color: 'blue', label: 'Payment' },
                            };
                            const { color, label } = config[type] || { color: 'default', label: type };
                            return <Tag color={color}>{label}</Tag>;
                          },
                          width: 100,
                        },
                        {
                          title: 'Description',
                          dataIndex: 'description',
                          key: 'description',
                        },
                        {
                          title: 'Amount',
                          dataIndex: 'amount',
                          key: 'amount',
                          render: (amount) => (
                            <Text strong style={{ color: amount > 0 ? '#52c41a' : '#ff4d4f' }}>
                              {amount > 0 ? '+' : ''}{amount.toLocaleString()} RWF
                            </Text>
                          ),
                          align: 'right',
                          width: 120,
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          render: (status) => {
                            const color = status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'error';
                            return <Tag color={color}>{status}</Tag>;
                          },
                          width: 100,
                        },
                      ]}
                      dataSource={transactions.filter(t => t.balance_type === 'credit')}
                      rowKey="id"
                      loading={loading}
                      size="small"
                      pagination={false}
                    />
                  </Card>

                  {/* Orders Paid by Credit */}
                  <Card title="Orders Paid by Credit" size="small" style={{ marginBottom: 16 }}>
                    <Table
                      columns={[
                        {
                          title: 'Order Number',
                          dataIndex: 'order_number',
                          key: 'order_number',
                          render: (order_number) => (
                            <Button type="link" size="small" onClick={() => message.info(`View order ${order_number}`)}>
                              {order_number}
                            </Button>
                          ),
                        },
                        {
                          title: 'Amount',
                          dataIndex: 'amount',
                          key: 'amount',
                          render: (amount) => `${amount.toLocaleString()} RWF`,
                          align: 'right',
                        },
                        {
                          title: 'Date',
                          dataIndex: 'date',
                          key: 'date',
                          render: (date) => new Date(date).toLocaleDateString(),
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          render: (status) => <Tag color="success">{status}</Tag>,
                        },
                        {
                          title: 'Invoice',
                          key: 'invoice',
                          render: (_, record) => (
                            <Button
                              type="link"
                              size="small"
                              icon={<FileTextOutlined />}
                              onClick={() => message.info(`View invoice for ${record.order_number}`)}
                            >
                              View
                            </Button>
                          ),
                        },
                      ]}
                      dataSource={creditOrders}
                      rowKey="id"
                      loading={loading}
                      size="small"
                      pagination={false}
                    />
                  </Card>

                  {/* Credit Approval History */}
                  <Card title="Credit Approval History" size="small">
                    <Table
                      columns={[
                        {
                          title: 'Amount Requested',
                          dataIndex: 'amount_requested',
                          key: 'amount_requested',
                          render: (amount) => `${amount.toLocaleString()} RWF`,
                        },
                        {
                          title: 'Status',
                          dataIndex: 'status',
                          key: 'status',
                          render: (status) => {
                            const colors: Record<string, string> = {
                              submitted: 'default',
                              reviewing: 'processing',
                              approved: 'success',
                              rejected: 'error',
                            };
                            return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
                          },
                        },
                        {
                          title: 'Submitted',
                          dataIndex: 'submitted_at',
                          key: 'submitted_at',
                          render: (date) => new Date(date).toLocaleDateString(),
                        },
                        {
                          title: 'Reviewed',
                          dataIndex: 'reviewed_at',
                          key: 'reviewed_at',
                          render: (date) => date ? new Date(date).toLocaleDateString() : '-',
                        },
                        {
                          title: 'Reason',
                          dataIndex: 'reason',
                          key: 'reason',
                          render: (reason) => reason || '-',
                        },
                      ]}
                      dataSource={creditApprovals}
                      rowKey="id"
                      loading={loading}
                      size="small"
                      pagination={false}
                    />
                  </Card>
                </>
              ),
            },
          ]}
        />
      </Card>

      {/* Top Up Modal */}
      <Modal
        title="Top Up Dashboard Balance"
        open={topUpModalVisible}
        onCancel={() => {
          setTopUpModalVisible(false);
          topUpForm.resetFields();
        }}
        footer={null}
        width={480}
      >
        <Form
          form={topUpForm}
          layout="vertical"
          onFinish={handleTopUp}
        >
          <Form.Item
            name="provider"
            label="Payment Method"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select payment method"
              options={[
                { value: 'mtn', label: 'MTN Mobile Money (078)' },
                { value: 'airtel', label: 'Airtel Money (073)' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true },
              { pattern: /^(\+?250)?(78|73|72)\d{7}$/, message: 'Invalid phone number' },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="+250788123456" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Amount (RWF)"
            rules={[
              { required: true },
              { type: 'number', min: 100 },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block icon={<PlusOutlined />}>
              Top Up Now
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Refund Request Modal */}
      <Modal
        title="Request Refund"
        open={refundModalVisible}
        onCancel={() => {
          setRefundModalVisible(false);
          refundForm.resetFields();
        }}
        footer={null}
        width={480}
      >
        <Alert
          message="Refund from Dashboard Balance"
          description="Submit a refund request. Our team will review and process it."
          type="info"
          style={{ marginBottom: 16 }}
        />
        <Form
          form={refundForm}
          layout="vertical"
          onFinish={handleRefundRequest}
        >
          <Form.Item
            name="amount"
            label="Amount (RWF)"
            rules={[{ required: true }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              max={balance?.dashboardBalance || 0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
          <Form.Item
            name="phoneNumber"
            label="Phone Number (linked to account)"
            rules={[{ required: true }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="+250788123456" />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Reason for Refund"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={3} placeholder="Explain why you need a refund..." />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Submit Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Loan Request Modal */}
      <Modal
        title="Request Loan"
        open={loanModalVisible}
        onCancel={() => {
          setLoanModalVisible(false);
          loanForm.resetFields();
        }}
        footer={null}
        width={480}
      >
        <Alert
          message="Apply for Credit Loan"
          description="Your application will be reviewed by our team."
          type="info"
          style={{ marginBottom: 16 }}
        />
        <Form
          form={loanForm}
          layout="vertical"
          onFinish={handleLoanRequest}
        >
          <Form.Item
            name="amount"
            label="Loan Amount (RWF)"
            rules={[{ required: true }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>
          <Form.Item
            name="repayment_frequency"
            label="Repayment Frequency"
            rules={[{ required: true, message: 'Please select repayment frequency' }]}
            initialValue="weekly"
          >
            <Radio.Group buttonStyle="solid" style={{ width: '100%' }}>
              <Radio.Button value="daily" style={{ width: '50%', textAlign: 'center' }}>
                Daily
              </Radio.Button>
              <Radio.Button value="weekly" style={{ width: '50%', textAlign: 'center' }}>
                Weekly
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Submit Request
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Link Card Modal */}
      <Modal
        title="Link NFC Card"
        open={linkCardModalVisible}
        onCancel={() => {
          setLinkCardModalVisible(false);
          linkCardForm.resetFields();
        }}
        footer={null}
        width={480}
      >
        <Form
          form={linkCardForm}
          layout="vertical"
          onFinish={handleLinkCard}
        >
          <Form.Item
            name="uid"
            label="NFC Card UID"
            rules={[{ required: true }]}
          >
            <Input prefix={<CreditCardOutlined />} placeholder="04:A1:B2:C3:D4:E5:F6" />
          </Form.Item>
          <Form.Item
            name="pin"
            label="Set 4-Digit PIN"
            rules={[
              { required: true },
              { pattern: /^\d{4}$/, message: 'PIN must be 4 digits' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} maxLength={4} />
          </Form.Item>
          <Form.Item
            name="nickname"
            label="Card Nickname (Optional)"
          >
            <Input placeholder="e.g., My Main Card" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Link Card
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Change PIN Modal */}
      <Modal
        title="Change Card PIN"
        open={changePinModalVisible}
        onCancel={() => {
          setChangePinModalVisible(false);
          changePinForm.resetFields();
          setSelectedCard(null);
        }}
        footer={null}
        width={400}
      >
        {selectedCard && (
          <Form
            form={changePinForm}
            layout="vertical"
            onFinish={handleChangePin}
          >
            <Form.Item
              name="old_pin"
              label="Current PIN"
              rules={[{ required: true }]}
            >
              <Input.Password prefix={<LockOutlined />} maxLength={4} />
            </Form.Item>
            <Form.Item
              name="new_pin"
              label="New PIN"
              rules={[{ required: true }, { pattern: /^\d{4}$/ }]}
            >
              <Input.Password prefix={<LockOutlined />} maxLength={4} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Change PIN
              </Button>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Card Orders Modal */}
      <Modal
        title={
          <Space>
            <ShoppingOutlined style={{ color: '#722ed1' }} />
            <span>Order History - {selectedCard?.nickname || selectedCard?.card_number}</span>
          </Space>
        }
        open={cardOrdersModalVisible}
        onCancel={() => {
          setCardOrdersModalVisible(false);
          setSelectedCard(null);
        }}
        footer={null}
        width={900}
      >
        {selectedCard && (
          <div>
            {/* Card Info Header */}
            <Card
              size="small"
              style={{
                marginBottom: 16,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              <Row gutter={16} align="middle">
                <Col>
                  <CreditCardOutlined style={{ fontSize: 32, color: 'white' }} />
                </Col>
                <Col flex={1}>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Card ID</Text>
                  <div>
                    <Text strong style={{ color: 'white', fontSize: 16, letterSpacing: 1 }}>
                      {selectedCard.uid}
                    </Text>
                  </div>
                </Col>
                <Col>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>Card Number</Text>
                  <div>
                    <Text strong style={{ color: 'white' }}>{selectedCard.card_number}</Text>
                  </div>
                </Col>
              </Row>
            </Card>

            {cardOrders[selectedCard.id] && cardOrders[selectedCard.id].length > 0 ? (
              <>
                <Alert
                  message={`${cardOrders[selectedCard.id].length} order${cardOrders[selectedCard.id].length > 1 ? 's' : ''} made with this card`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Table
                  dataSource={cardOrders[selectedCard.id]}
                  rowKey="id"
                  size="small"
                  pagination={{
                    pageSize: 5,
                    showSizeChanger: false,
                    showTotal: (total) => `${total} orders`,
                  }}
                  columns={[
                    {
                      title: 'Card ID',
                      key: 'card_id',
                      width: 120,
                      render: () => (
                        <Text code style={{ fontSize: 11 }}>
                          {selectedCard.uid.substring(0, 11)}...
                        </Text>
                      ),
                    },
                    {
                      title: 'Order ID',
                      dataIndex: 'order_number',
                      key: 'order_number',
                      width: 130,
                      render: (orderNumber: string) => (
                        <Text strong style={{ color: '#722ed1' }}>{orderNumber}</Text>
                      ),
                    },
                    {
                      title: 'Shop Name',
                      key: 'shop',
                      render: (_, record: CardOrder) => (
                        <Space direction="vertical" size={0}>
                          <Text strong>{record.shop_name}</Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            <EnvironmentOutlined /> {record.shop_location}
                          </Text>
                        </Space>
                      ),
                    },
                    {
                      title: 'Amount',
                      dataIndex: 'amount',
                      key: 'amount',
                      width: 120,
                      align: 'right',
                      render: (amount: number) => (
                        <Text strong style={{ color: '#52c41a' }}>
                          {amount.toLocaleString()} RWF
                        </Text>
                      ),
                    },
                    {
                      title: 'Date',
                      dataIndex: 'date',
                      key: 'date',
                      width: 130,
                      render: (date: string) => (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(date).toLocaleDateString('en-RW', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      ),
                    },
                    {
                      title: 'Invoice',
                      key: 'invoice',
                      width: 80,
                      align: 'center',
                      render: (_, record: CardOrder) => (
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => message.info(`Viewing invoice for ${record.order_number}`)}
                        >
                          View
                        </Button>
                      ),
                    },
                  ]}
                />
              </>
            ) : (
              <Empty
                image={<ShoppingOutlined style={{ fontSize: 64, color: '#ccc' }} />}
                description="No orders found for this card"
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConsumerWalletPage;

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Space,
  Modal,
  message,
  Spin,
  Empty,
  Input,
  Divider,
  Table,
  Badge,
  Radio,
  Form,
  Select,
  Tabs,
  Descriptions,
  Alert,
} from 'antd';
import {
  FireOutlined,
  PlusOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
  WalletOutlined,
  MobileOutlined,
  UserOutlined,
  IdcardOutlined,
  PhoneOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { consumerApi } from '../../services/apiService';

const { Title, Text, Paragraph } = Typography;

interface GasMeter {
  id: string;
  meter_number: string;
  alias: string;
  owner_name: string;
  id_number: string;
  phone_number: string;
  customer_id: string;
  created_at: string;
}

interface GasTopup {
  id: string;
  meter_number: string;
  meter_alias: string;
  amount: number;
  units_purchased: number;
  token: string;
  payment_method: string;
  created_at: string;
}

interface GasUsage {
  id: string;
  meter_number: string;
  date: string;
  units_from_topups: number;
  units_from_rewards: number;
  total_units: number;
}

const predefinedAmounts = [300, 500, 1000, 2000, 5000, 10000];

export const GasPage: React.FC = () => {
  const [meters, setMeters] = useState<GasMeter[]>([]);
  const [history, setHistory] = useState<GasTopup[]>([]);
  const [usageHistory, setUsageHistory] = useState<GasUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [balance, setBalance] = useState(0);

  // Modals
  const [showAddMeter, setShowAddMeter] = useState(false);
  const [showTopup, setShowTopup] = useState(false);
  const [showUsageHistory, setShowUsageHistory] = useState(false);
  const [selectedMeterForUsage, setSelectedMeterForUsage] = useState<GasMeter | null>(null);

  // Add Meter Form
  const [addMeterForm] = Form.useForm();

  // Top-up Form
  const [topupForm] = Form.useForm();
  const [selectedMeter, setSelectedMeter] = useState<GasMeter | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'mobile_money'>('wallet');
  const [topupResult, setTopupResult] = useState<any>(null);

  // Mock data
  const mockMeters: GasMeter[] = [
    {
      id: '1',
      meter_number: 'MTR-001234',
      alias: 'Home Kitchen',
      owner_name: 'Jean Paul Niyonzima',
      id_number: '1198780123456789',
      phone_number: '+250788123456',
      customer_id: 'current-user',
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      meter_number: 'MTR-005678',
      alias: 'Restaurant - Main',
      owner_name: 'Marie Claire Mukandutiye',
      id_number: '1199680234567890',
      phone_number: '+250788234567',
      customer_id: 'current-user',
      created_at: '2024-06-20T14:00:00Z',
    },
  ];

  const mockHistory: GasTopup[] = [
    {
      id: '1',
      meter_number: 'MTR-001234',
      meter_alias: 'Home Kitchen',
      amount: 5000,
      units_purchased: 4166,
      token: '1234-5678-9012-3456',
      payment_method: 'Dashboard Balance',
      created_at: '2024-11-30T10:00:00Z',
    },
    {
      id: '2',
      meter_number: 'MTR-005678',
      meter_alias: 'Restaurant - Main',
      amount: 10000,
      units_purchased: 8333,
      token: '9876-5432-1098-7654',
      payment_method: 'MTN Mobile Money',
      created_at: '2024-11-28T15:30:00Z',
    },
    {
      id: '3',
      meter_number: 'MTR-001234',
      meter_alias: 'Home Kitchen',
      amount: 3000,
      units_purchased: 2500,
      token: '1111-2222-3333-4444',
      payment_method: 'Airtel Money',
      created_at: '2024-11-25T09:15:00Z',
    },
  ];

  const mockUsageHistory: GasUsage[] = [
    {
      id: '1',
      meter_number: 'MTR-001234',
      date: '2024-11-30',
      units_from_topups: 4166,
      units_from_rewards: 500,
      total_units: 4666,
    },
    {
      id: '2',
      meter_number: 'MTR-001234',
      date: '2024-11-25',
      units_from_topups: 2500,
      units_from_rewards: 300,
      total_units: 2800,
    },
    {
      id: '3',
      meter_number: 'MTR-005678',
      date: '2024-11-28',
      units_from_topups: 8333,
      units_from_rewards: 1200,
      total_units: 9533,
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Use mock data
      setMeters(mockMeters);
      setHistory(mockHistory);
      setUsageHistory(mockUsageHistory);
      setBalance(25000); // Dashboard balance
    } catch (error) {
      console.error('Failed to fetch gas data:', error);
      setMeters(mockMeters);
      setHistory(mockHistory);
      setUsageHistory(mockUsageHistory);
      setBalance(25000);
    } finally {
      setLoading(false);
    }
  };

  // State for auto-fill meter info
  const [meterLookupLoading, setMeterLookupLoading] = useState(false);
  const [meterInfo, setMeterInfo] = useState<{
    owner_name: string;
    id_number: string;
    phone_number: string;
  } | null>(null);

  const handleMeterLookup = async (meterNumber: string) => {
    if (!meterNumber || meterNumber.length < 6) {
      setMeterInfo(null);
      return;
    }

    setMeterLookupLoading(true);
    try {
      // TODO: Replace with real API call to gas meter provider
      // const response = await fetch(`/api/gas/meter-info/${meterNumber}`);
      // const data = await response.json();

      // Simulate API call - auto-fill meter information
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock auto-fill data from gas provider API
      const mockMeterInfo = {
        owner_name: 'Jean Paul Niyonzima',
        id_number: '1198780123456789',
        phone_number: '+250788123456',
      };

      setMeterInfo(mockMeterInfo);
      message.success('Meter information retrieved successfully!');
    } catch (error) {
      message.error('Failed to retrieve meter information. Please check the meter ID.');
      setMeterInfo(null);
    } finally {
      setMeterLookupLoading(false);
    }
  };

  const handleAddMeter = async (values: any) => {
    if (!meterInfo) {
      message.error('Please enter a valid meter ID to auto-fill owner information');
      return;
    }

    setProcessing(true);
    try {
      const newMeter: GasMeter = {
        id: Date.now().toString(),
        meter_number: values.meter_number,
        alias: values.alias,
        owner_name: meterInfo.owner_name,
        id_number: meterInfo.id_number,
        phone_number: meterInfo.phone_number,
        customer_id: 'current-user',
        created_at: new Date().toISOString(),
      };
      setMeters([...meters, newMeter]);
      message.success('Meter added successfully!');
      setShowAddMeter(false);
      addMeterForm.resetFields();
      setMeterInfo(null);
    } catch (error: any) {
      message.error('Failed to add meter');
    } finally {
      setProcessing(false);
    }
  };

  const handleTopup = async (values: any) => {
    if (!selectedMeter || !selectedAmount) {
      message.error('Please select a meter and amount');
      return;
    }

    if (selectedAmount < 300) {
      message.error('Minimum top-up amount is 300 RWF');
      return;
    }

    if (paymentMethod === 'wallet' && balance < selectedAmount) {
      message.error('Insufficient dashboard balance. Please top up your wallet first.');
      return;
    }

    setProcessing(true);
    try {
      // Simulate top-up
      const units = Math.floor(selectedAmount / 1.2);
      const token = Math.random().toString().slice(2, 22).match(/.{1,4}/g)?.join('-') || '1234-5678-9012-3456';

      const paymentMethodLabel = paymentMethod === 'wallet'
        ? 'Dashboard Balance'
        : values.mobile_provider === 'mtn'
        ? 'MTN Mobile Money'
        : 'Airtel Money';

      const mockResult = {
        meter_number: selectedMeter.meter_number,
        units,
        token,
        amount: selectedAmount,
        payment_method: paymentMethodLabel,
      };

      setTopupResult(mockResult);

      if (paymentMethod === 'wallet') {
        setBalance(balance - selectedAmount);
      }

      const newHistory: GasTopup = {
        id: Date.now().toString(),
        meter_number: selectedMeter.meter_number,
        meter_alias: selectedMeter.alias,
        amount: selectedAmount,
        units_purchased: units,
        token,
        payment_method: paymentMethodLabel,
        created_at: new Date().toISOString(),
      };
      setHistory([newHistory, ...history]);
      message.success('Gas top-up successful!');
    } catch (error: any) {
      message.error('Gas top-up failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewUsage = (meter: GasMeter) => {
    setSelectedMeterForUsage(meter);
    setShowUsageHistory(true);
  };

  const handleDeleteMeter = (meter: GasMeter) => {
    Modal.confirm({
      title: 'Remove Meter',
      content: `Are you sure you want to remove meter ${meter.meter_number} (${meter.alias})?`,
      okText: 'Remove',
      okType: 'danger',
      onOk: () => {
        setMeters(meters.filter(m => m.id !== meter.id));
        message.success('Meter removed successfully');
      },
    });
  };

  const resetTopup = () => {
    setShowTopup(false);
    setSelectedMeter(null);
    setSelectedAmount(null);
    setCustomAmount(null);
    setTopupResult(null);
    setPaymentMethod('wallet');
    topupForm.resetFields();
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    message.success('Token copied to clipboard!');
  };

  const formatPrice = (amount: number) => `${amount.toLocaleString()} RWF`;

  const historyColumns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      title: 'Meter',
      dataIndex: 'meter_alias',
      key: 'meter_alias',
      render: (alias: string, record: GasTopup) => (
        <div>
          <Text strong>{alias}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.meter_number}
          </Text>
        </div>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong style={{ color: '#ff7300' }}>
          {formatPrice(amount)}
        </Text>
      ),
    },
    {
      title: 'Units',
      dataIndex: 'units_purchased',
      key: 'units_purchased',
      render: (units: number) => `${units} units`,
    },
    {
      title: 'Payment Method',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method: string) => <Tag color="blue">{method}</Tag>,
    },
    {
      title: 'Token',
      dataIndex: 'token',
      key: 'token',
      render: (token: string) => (
        <Button
          size="small"
          icon={<CopyOutlined />}
          onClick={() => copyToken(token)}
        >
          Copy
        </Button>
      ),
    },
  ];

  const usageColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    },
    {
      title: 'Units from Top-ups',
      dataIndex: 'units_from_topups',
      key: 'units_from_topups',
      render: (units: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {units} units
        </Text>
      ),
    },
    {
      title: 'Units from Rewards',
      dataIndex: 'units_from_rewards',
      key: 'units_from_rewards',
      render: (units: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {units} units
        </Text>
      ),
    },
    {
      title: 'Total Units',
      dataIndex: 'total_units',
      key: 'total_units',
      render: (units: number) => (
        <Text strong style={{ color: '#ff7300', fontSize: 16 }}>
          {units} units
        </Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
        <p>Loading gas service...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ff7300 0%, #ff5500 100%)',
          padding: '20px 24px',
          marginBottom: 16,
          borderRadius: 8,
          color: 'white',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <FireOutlined style={{ fontSize: 40 }} />
              <div>
                <Title level={3} style={{ color: 'white', margin: 0 }}>
                  Gas Top-up
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
                  Buy prepaid gas for your meter
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="end">
              <Text style={{ color: 'rgba(255,255,255,0.85)', display: 'block', fontSize: 12 }}>
                Dashboard Balance
              </Text>
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
                {formatPrice(balance)}
              </Text>
            </Space>
          </Col>
        </Row>
      </div>

      {/* My Gas Meters */}
      <Card
        title={
          <Space>
            <FireOutlined />
            <span>My Gas Meters</span>
            <Badge count={meters.length} style={{ backgroundColor: '#52c41a' }} />
          </Space>
        }
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAddMeter(true)}
          >
            Add Meter
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        {meters.length > 0 ? (
          <Row gutter={[16, 16]}>
            {meters.map((meter) => (
              <Col xs={24} md={12} lg={8} key={meter.id}>
                <Card
                  size="small"
                  style={{
                    background: 'linear-gradient(135deg, #ff7300 0%, #ff5500 100%)',
                    color: 'white',
                    borderRadius: 12,
                  }}
                  actions={[
                    <Button
                      type="text"
                      style={{ color: 'white' }}
                      onClick={() => {
                        setSelectedMeter(meter);
                        setShowTopup(true);
                      }}
                    >
                      Buy Gas
                    </Button>,
                    <Button
                      type="text"
                      icon={<HistoryOutlined />}
                      style={{ color: 'white' }}
                      onClick={() => handleViewUsage(meter)}
                    >
                      Usage
                    </Button>,
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      style={{ color: '#ff7875' }}
                      onClick={() => handleDeleteMeter(meter)}
                    >
                      Remove
                    </Button>,
                  ]}
                >
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                        {meter.alias}
                      </Text>
                      <Title level={4} style={{ color: 'white', margin: '4px 0', letterSpacing: 1 }}>
                        {meter.meter_number}
                      </Title>
                    </div>
                    <Divider style={{ margin: '8px 0', borderColor: 'rgba(255,255,255,0.3)' }} />
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <div>
                        <UserOutlined style={{ marginRight: 8 }} />
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                          {meter.owner_name}
                        </Text>
                      </div>
                      <div>
                        <IdcardOutlined style={{ marginRight: 8 }} />
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                          {meter.id_number}
                        </Text>
                      </div>
                      <div>
                        <PhoneOutlined style={{ marginRight: 8 }} />
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12 }}>
                          {meter.phone_number}
                        </Text>
                      </div>
                    </Space>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            image={<FireOutlined style={{ fontSize: 64, color: '#ccc' }} />}
            description="No gas meters added yet"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowAddMeter(true)}
            >
              Add Your First Meter
            </Button>
          </Empty>
        )}
      </Card>

      {/* Recent Top-ups */}
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span>Recent Top-ups</span>
          </Space>
        }
      >
        <Table
          columns={historyColumns}
          dataSource={history}
          rowKey="id"
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showTotal: (total) => `${total} top-ups`,
          }}
          size="small"
        />
      </Card>

      {/* Add Meter Modal */}
      <Modal
        title={<><FireOutlined /> Add Gas Meter</>}
        open={showAddMeter}
        onCancel={() => {
          setShowAddMeter(false);
          addMeterForm.resetFields();
          setMeterInfo(null);
        }}
        footer={null}
        width={500}
      >
        <Alert
          message="Meter Registration"
          description="Enter the meter ID and nickname. Owner information will be automatically retrieved from the gas provider."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={addMeterForm}
          layout="vertical"
          onFinish={handleAddMeter}
        >
          <Form.Item
            name="meter_number"
            label="Meter ID"
            rules={[
              { required: true, message: 'Please enter meter ID' },
              { min: 6, message: 'Meter ID must be at least 6 characters' },
            ]}
          >
            <Input.Search
              prefix={<FireOutlined />}
              placeholder="Enter meter ID (e.g., MTR-001234)"
              size="large"
              enterButton="Lookup"
              loading={meterLookupLoading}
              onSearch={handleMeterLookup}
              onChange={(e) => {
                if (meterInfo) setMeterInfo(null);
              }}
            />
          </Form.Item>
          <Form.Item
            name="alias"
            label="Nickname"
            rules={[{ required: true, message: 'Please enter a nickname for this meter' }]}
          >
            <Input
              prefix={<EditOutlined />}
              placeholder="e.g., Home Kitchen, Restaurant"
              size="large"
            />
          </Form.Item>

          {/* Auto-filled Information Display */}
          {meterInfo && (
            <Card
              size="small"
              style={{
                marginBottom: 16,
                background: '#f6ffed',
                borderColor: '#b7eb8f',
              }}
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span style={{ color: '#52c41a' }}>Owner Information (Auto-filled)</span>
                </Space>
              }
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label={<><UserOutlined /> Owner Name</>}>
                  <Text strong>{meterInfo.owner_name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<><IdcardOutlined /> ID Number</>}>
                  <Text strong>{meterInfo.id_number}</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Phone Number</>}>
                  <Text strong>{meterInfo.phone_number}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {!meterInfo && !meterLookupLoading && (
            <Alert
              message="Enter meter ID and click 'Lookup' to auto-fill owner information"
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setShowAddMeter(false);
                addMeterForm.resetFields();
                setMeterInfo(null);
              }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={processing}
                disabled={!meterInfo}
              >
                Add Meter
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Top-up Modal */}
      <Modal
        title={<><FireOutlined /> Buy Gas</>}
        open={showTopup}
        onCancel={resetTopup}
        footer={null}
        width={600}
      >
        {!topupResult ? (
          <Form
            form={topupForm}
            layout="vertical"
            onFinish={handleTopup}
          >
            {selectedMeter && (
              <Card size="small" style={{ marginBottom: 16, background: '#f0f2f5' }}>
                <Space direction="vertical" size={4}>
                  <Text strong>{selectedMeter.alias}</Text>
                  <Text type="secondary">{selectedMeter.meter_number}</Text>
                </Space>
              </Card>
            )}

            {/* Amount Selection */}
            <Form.Item label="Select Amount">
              <Row gutter={[8, 8]}>
                {predefinedAmounts.map((amount) => (
                  <Col span={8} key={amount}>
                    <Button
                      block
                      size="large"
                      type={selectedAmount === amount ? 'primary' : 'default'}
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount(null);
                      }}
                    >
                      {formatPrice(amount)}
                    </Button>
                  </Col>
                ))}
              </Row>
            </Form.Item>

            <Form.Item label="Or Enter Custom Amount" help="Minimum: 300 RWF">
              <Input
                type="number"
                size="large"
                placeholder="Enter amount in RWF (min: 300)"
                value={customAmount || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    setCustomAmount(val);
                    setSelectedAmount(val);
                  }
                }}
                suffix="RWF"
                status={customAmount && customAmount < 300 ? 'error' : ''}
              />
            </Form.Item>

            {selectedAmount && (
              <Alert
                message={`Estimated Units: ~${Math.floor(selectedAmount / 1.2)} units`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Payment Method Selection */}
            <Form.Item label="Payment Method" required>
              <Radio.Group
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                size="large"
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="wallet" style={{ width: '100%' }}>
                    <Card size="small" style={{ margin: '8px 0' }}>
                      <Space>
                        <WalletOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        <div>
                          <Text strong>Dashboard Balance</Text>
                          <br />
                          <Text type="secondary">Available: {formatPrice(balance)}</Text>
                        </div>
                      </Space>
                    </Card>
                  </Radio>
                  <Radio value="mobile_money" style={{ width: '100%' }}>
                    <Card size="small" style={{ margin: '8px 0' }}>
                      <Space>
                        <MobileOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                        <div>
                          <Text strong>Mobile Money</Text>
                          <br />
                          <Text type="secondary">MTN or Airtel</Text>
                        </div>
                      </Space>
                    </Card>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>

            {/* Mobile Money Fields */}
            {paymentMethod === 'mobile_money' && (
              <>
                <Form.Item
                  name="mobile_provider"
                  label="Mobile Provider"
                  rules={[{ required: true, message: 'Please select provider' }]}
                >
                  <Select size="large" placeholder="Select provider">
                    <Select.Option value="mtn">
                      <Space>
                        <MobileOutlined />
                        MTN Mobile Money
                      </Space>
                    </Select.Option>
                    <Select.Option value="airtel">
                      <Space>
                        <MobileOutlined />
                        Airtel Money
                      </Space>
                    </Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="mobile_number"
                  label="Mobile Number"
                  rules={[
                    { required: true, message: 'Please enter mobile number' },
                    { pattern: /^\+250\d{9}$/, message: 'Enter valid Rwanda phone (+250...)' },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="+250788123456"
                    size="large"
                  />
                </Form.Item>
                <Alert
                  message="You will receive a notification on your phone to confirm payment"
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              </>
            )}

            {/* Wallet PIN */}
            {paymentMethod === 'wallet' && (
              <>
                <Form.Item
                  name="pin"
                  label="Enter PIN to Confirm"
                  rules={[
                    { required: true, message: 'Please enter PIN' },
                    { len: 4, message: 'PIN must be 4 digits' },
                  ]}
                >
                  <Input.Password
                    size="large"
                    maxLength={4}
                    placeholder="Enter 4-digit PIN"
                  />
                </Form.Item>
              </>
            )}

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={resetTopup}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={processing}
                  disabled={!selectedAmount}
                >
                  Confirm Purchase
                </Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircleOutlined
              style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }}
            />
            <Title level={3} style={{ color: '#52c41a' }}>
              Top-up Successful!
            </Title>
            <Card style={{ marginTop: 24, textAlign: 'left' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Meter">
                  {topupResult.meter_number}
                </Descriptions.Item>
                <Descriptions.Item label="Amount">
                  <Text strong style={{ color: '#ff7300', fontSize: 16 }}>
                    {formatPrice(topupResult.amount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Units">
                  <Text strong>{topupResult.units} units</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  <Tag color="blue">{topupResult.payment_method}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Token">
                  <Space>
                    <Text code strong style={{ fontSize: 16 }}>
                      {topupResult.token}
                    </Text>
                    <Button
                      icon={<CopyOutlined />}
                      onClick={() => copyToken(topupResult.token)}
                    >
                      Copy
                    </Button>
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>
            <Paragraph type="secondary" style={{ marginTop: 16 }}>
              Enter this token on your gas meter to load the units.
            </Paragraph>
            <Button type="primary" size="large" onClick={resetTopup} style={{ marginTop: 16 }}>
              Done
            </Button>
          </div>
        )}
      </Modal>

      {/* Gas Usage History Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            <span>Gas Usage History - {selectedMeterForUsage?.alias}</span>
          </Space>
        }
        open={showUsageHistory}
        onCancel={() => {
          setShowUsageHistory(false);
          setSelectedMeterForUsage(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowUsageHistory(false);
            setSelectedMeterForUsage(null);
          }}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedMeterForUsage && (
          <>
            <Alert
              message="Gas Usage Tracking"
              description={`Showing gas usage history for meter ${selectedMeterForUsage.meter_number}. Blue units are from direct top-ups, green units are from shopping rewards.`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={usageColumns}
              dataSource={usageHistory.filter(u => u.meter_number === selectedMeterForUsage.meter_number)}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </>
        )}
      </Modal>
    </div>
  );
};

export default GasPage;

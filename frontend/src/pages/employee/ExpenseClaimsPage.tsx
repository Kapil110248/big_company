import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Input,
  Select,
  Statistic,
  Modal,
  Form,
  Upload,
  DatePicker,
  InputNumber,
  message,
} from 'antd';
import {
  DollarOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface ExpenseClaim {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  description: string;
  merchant?: string;
  receipt?: string;
  submittedDate: string;
  approvedDate?: string;
  approvedBy?: string;
  paidDate?: string;
  rejectionReason?: string;
}

export const ExpenseClaimsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form] = Form.useForm();

  const expenses: ExpenseClaim[] = [
    {
      id: '1',
      title: 'Client Meeting Lunch',
      category: 'Meals & Entertainment',
      amount: 45000,
      currency: 'RWF',
      date: '2025-11-28',
      status: 'approved',
      description: 'Business lunch with ABC Corporation client',
      merchant: 'The Manor Hotel Restaurant',
      receipt: '/receipts/receipt-001.pdf',
      submittedDate: '2025-11-29',
      approvedDate: '2025-11-30',
      approvedBy: 'Jane Manager',
    },
    {
      id: '2',
      title: 'Taxi to Airport',
      category: 'Transportation',
      amount: 15000,
      currency: 'RWF',
      date: '2025-11-30',
      status: 'pending',
      description: 'Taxi ride to Kigali International Airport for business trip',
      merchant: 'Yego Cab',
      receipt: '/receipts/receipt-002.pdf',
      submittedDate: '2025-11-30',
    },
    {
      id: '3',
      title: 'Office Supplies',
      category: 'Office Expenses',
      amount: 12500,
      currency: 'RWF',
      date: '2025-11-25',
      status: 'paid',
      description: 'Notebooks, pens, and folders for team',
      merchant: 'Kigali City Stationers',
      receipt: '/receipts/receipt-003.pdf',
      submittedDate: '2025-11-26',
      approvedDate: '2025-11-27',
      approvedBy: 'Jane Manager',
      paidDate: '2025-11-29',
    },
    {
      id: '4',
      title: 'Hotel Accommodation',
      category: 'Lodging',
      amount: 85000,
      currency: 'RWF',
      date: '2025-11-20',
      status: 'rejected',
      description: 'Hotel stay for client visit',
      merchant: 'Radisson Blu',
      receipt: '/receipts/receipt-004.pdf',
      submittedDate: '2025-11-22',
      rejectionReason: 'Missing itemized receipt. Please resubmit with detailed bill.',
    },
    {
      id: '5',
      title: 'Mobile Internet Data',
      category: 'Communication',
      amount: 8500,
      currency: 'RWF',
      date: '2025-11-15',
      status: 'approved',
      description: 'Mobile data for field work',
      merchant: 'MTN Rwanda',
      receipt: '/receipts/receipt-005.pdf',
      submittedDate: '2025-11-16',
      approvedDate: '2025-11-17',
      approvedBy: 'Jane Manager',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'processing',
      approved: 'success',
      rejected: 'error',
      paid: 'default',
    };
    return colors[status] || 'default';
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(searchText.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchText.toLowerCase()) ||
      expense.merchant?.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalClaimed = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalApproved = expenses
    .filter((e) => e.status === 'approved' || e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPending = expenses
    .filter((e) => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalRejected = expenses
    .filter((e) => e.status === 'rejected')
    .reduce((sum, e) => sum + e.amount, 0);

  const handleCreateClaim = async (values: any) => {
    try {
      console.log('Creating expense claim:', values);
      message.success('Expense claim submitted successfully!');
      setShowCreateModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to submit expense claim');
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: ExpenseClaim, b: ExpenseClaim) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: ExpenseClaim) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.category}
          </Text>
        </div>
      ),
    },
    {
      title: 'Merchant',
      dataIndex: 'merchant',
      key: 'merchant',
      render: (merchant?: string) => merchant || '-',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: ExpenseClaim) => (
        <Text strong>
          {amount.toLocaleString()} {record.currency}
        </Text>
      ),
      sorter: (a: ExpenseClaim, b: ExpenseClaim) => a.amount - b.amount,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedDate',
      key: 'submittedDate',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ExpenseClaim) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/employee/expense-claims/${record.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <DollarOutlined /> Expense Claims
      </Title>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Claimed"
              value={totalClaimed}
              prefix="RWF"
              valueStyle={{ color: '#1890ff', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Approved"
              value={totalApproved}
              prefix="RWF"
              valueStyle={{ color: '#52c41a', fontSize: 18 }}
              suffix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Pending"
              value={totalPending}
              prefix="RWF"
              valueStyle={{ color: '#faad14', fontSize: 18 }}
              suffix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={totalRejected}
              prefix="RWF"
              valueStyle={{ color: '#ff4d4f', fontSize: 18 }}
              suffix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Expense Claims Table */}
      <Card
        title="My Expense Claims"
        extra={
          <Space>
            <Input
              placeholder="Search claims..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 120 }}>
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
              <Option value="paid">Paid</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowCreateModal(true)}>
              New Claim
            </Button>
          </Space>
        }
      >
        <Table dataSource={filteredExpenses} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      {/* Create Expense Claim Modal */}
      <Modal
        title="Submit New Expense Claim"
        open={showCreateModal}
        onCancel={() => {
          setShowCreateModal(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateClaim}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="title" label="Expense Title" rules={[{ required: true }]}>
                <Input placeholder="e.g., Client Meeting Lunch" size="large" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select placeholder="Select category" size="large">
                  <Option value="Meals & Entertainment">Meals & Entertainment</Option>
                  <Option value="Transportation">Transportation</Option>
                  <Option value="Lodging">Lodging</Option>
                  <Option value="Office Expenses">Office Expenses</Option>
                  <Option value="Communication">Communication</Option>
                  <Option value="Travel">Travel</Option>
                  <Option value="Training">Training</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="date" label="Expense Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="amount" label="Amount (RWF)" rules={[{ required: true }]}>
                <InputNumber
                  placeholder="Enter amount"
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="merchant" label="Merchant/Vendor" rules={[{ required: true }]}>
                <Input placeholder="e.g., The Manor Hotel" size="large" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                <TextArea rows={3} placeholder="Provide details about this expense" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="receipt"
                label="Receipt Upload"
                rules={[{ required: true, message: 'Please upload receipt' }]}
              >
                <Upload beforeUpload={() => false} maxCount={1}>
                  <Button icon={<UploadOutlined />} block>
                    Upload Receipt (PDF, JPG, PNG)
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setShowCreateModal(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Submit Claim
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExpenseClaimsPage;

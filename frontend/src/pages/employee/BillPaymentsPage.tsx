import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Statistic,
  Alert,
  Divider,
  Empty,
  Tabs,
  DatePicker,
  Switch,
  Tooltip,
  Progress,
  Badge,
} from 'antd';
import {
  CreditCardOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  BankOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// Bill Payment Company (employee's setup)
interface BillPaymentCompany {
  id: string;
  companyId: string;
  companyName: string;
  companyType: string;
  accountNumber: string;
  accountHolderName: string;
  monthlyAmount: number;
  paymentDay: number;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  notes?: string;
}

// Master bill company (available companies to add)
interface MasterBillCompany {
  id: string;
  name: string;
  type: string;
  logo?: string;
  accountFormat: string;
}

// Payment transaction
interface BillTransaction {
  id: string;
  companyName: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  payrollId: string;
  reference: string;
}

const COMPANY_TYPES = [
  'Utility - Water',
  'Utility - Electricity',
  'Telecom - Mobile',
  'Telecom - Internet',
  'Insurance - Health',
  'Insurance - Life',
  'Insurance - Vehicle',
  'Loan - Bank',
  'Loan - Microfinance',
  'Rent',
  'School Fees',
  'Savings Account',
  'Investment',
  'Other',
];

export const BillPaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [myBillPayments, setMyBillPayments] = useState<BillPaymentCompany[]>([]);
  const [availableCompanies, setAvailableCompanies] = useState<MasterBillCompany[]>([]);
  const [transactions, setTransactions] = useState<BillTransaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<BillPaymentCompany | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const MAX_COMPANIES = 2000;

  useEffect(() => {
    fetchBillPaymentData();
  }, []);

  const fetchBillPaymentData = async () => {
    setLoading(true);
    try {
      // Mock available companies
      setAvailableCompanies([
        { id: '1', name: 'WASAC (Water)', type: 'Utility - Water', accountFormat: '10-15 digits' },
        { id: '2', name: 'REG (Electricity)', type: 'Utility - Electricity', accountFormat: '10-12 digits' },
        { id: '3', name: 'MTN Rwanda', type: 'Telecom - Mobile', accountFormat: 'Phone number' },
        { id: '4', name: 'Airtel Rwanda', type: 'Telecom - Mobile', accountFormat: 'Phone number' },
        { id: '5', name: 'Liquid Telecom', type: 'Telecom - Internet', accountFormat: 'Account number' },
        { id: '6', name: 'RSSB (Social Security)', type: 'Insurance - Health', accountFormat: '12 digits' },
        { id: '7', name: 'SORAS Insurance', type: 'Insurance - Life', accountFormat: 'Policy number' },
        { id: '8', name: 'Bank of Kigali Loan', type: 'Loan - Bank', accountFormat: 'Loan account number' },
        { id: '9', name: 'Equity Bank Loan', type: 'Loan - Bank', accountFormat: 'Loan account number' },
        { id: '10', name: 'Umwalimu SACCO', type: 'Savings Account', accountFormat: 'Member number' },
      ]);

      // Mock employee's bill payments
      setMyBillPayments([
        {
          id: '1',
          companyId: '1',
          companyName: 'WASAC (Water)',
          companyType: 'Utility - Water',
          accountNumber: '123456789012',
          accountHolderName: user?.name || 'Employee',
          monthlyAmount: 15000,
          paymentDay: 1,
          isActive: true,
          startDate: '2025-01-01',
        },
        {
          id: '2',
          companyId: '2',
          companyName: 'REG (Electricity)',
          companyType: 'Utility - Electricity',
          accountNumber: '987654321098',
          accountHolderName: user?.name || 'Employee',
          monthlyAmount: 35000,
          paymentDay: 1,
          isActive: true,
          startDate: '2025-01-01',
        },
        {
          id: '3',
          companyId: '3',
          companyName: 'MTN Rwanda',
          companyType: 'Telecom - Mobile',
          accountNumber: '250788200001',
          accountHolderName: user?.name || 'Employee',
          monthlyAmount: 25000,
          paymentDay: 1,
          isActive: true,
          startDate: '2025-01-01',
        },
        {
          id: '4',
          companyId: '8',
          companyName: 'Bank of Kigali Loan',
          companyType: 'Loan - Bank',
          accountNumber: 'LOAN456789',
          accountHolderName: user?.name || 'Employee',
          monthlyAmount: 50000,
          paymentDay: 1,
          isActive: true,
          startDate: '2025-01-01',
          endDate: '2027-12-31',
          notes: 'Personal loan - 36 months',
        },
      ]);

      // Mock transactions
      setTransactions([
        {
          id: '1',
          companyName: 'WASAC (Water)',
          amount: 15000,
          date: '2025-11-01',
          status: 'completed',
          payrollId: 'PAY-NOV-2025',
          reference: 'WTR-1234567',
        },
        {
          id: '2',
          companyName: 'REG (Electricity)',
          amount: 35000,
          date: '2025-11-01',
          status: 'completed',
          payrollId: 'PAY-NOV-2025',
          reference: 'ELEC-9876543',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch bill payment data:', error);
      message.error('Failed to load bill payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async (values: any) => {
    setLoading(true);
    try {
      const selectedCompany = availableCompanies.find((c) => c.id === values.companyId);

      const newCompany: BillPaymentCompany = {
        id: Date.now().toString(),
        companyId: values.companyId,
        companyName: selectedCompany?.name || values.customCompanyName,
        companyType: values.companyType,
        accountNumber: values.accountNumber,
        accountHolderName: values.accountHolderName || user?.name || '',
        monthlyAmount: values.monthlyAmount,
        paymentDay: values.paymentDay || 1,
        isActive: true,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
        notes: values.notes,
      };

      setMyBillPayments([...myBillPayments, newCompany]);
      message.success(`Added ${newCompany.companyName} successfully!`);
      setShowAddModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to add bill payment company');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCompany = async (values: any) => {
    setLoading(true);
    try {
      if (!editingCompany) return;

      const updatedCompanies = myBillPayments.map((company) =>
        company.id === editingCompany.id
          ? {
              ...company,
              accountNumber: values.accountNumber,
              accountHolderName: values.accountHolderName,
              monthlyAmount: values.monthlyAmount,
              paymentDay: values.paymentDay,
              isActive: values.isActive,
              endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
              notes: values.notes,
            }
          : company
      );

      setMyBillPayments(updatedCompanies);
      message.success('Bill payment updated successfully!');
      setEditingCompany(null);
      form.resetFields();
    } catch (error) {
      message.error('Failed to update bill payment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = (company: BillPaymentCompany) => {
    Modal.confirm({
      title: 'Delete Bill Payment',
      content: `Are you sure you want to remove ${company.companyName}? Future payments will not be deducted.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        setMyBillPayments(myBillPayments.filter((c) => c.id !== company.id));
        message.success('Bill payment removed successfully');
      },
    });
  };

  const toggleActiveStatus = (company: BillPaymentCompany) => {
    const updatedCompanies = myBillPayments.map((c) =>
      c.id === company.id ? { ...c, isActive: !c.isActive } : c
    );
    setMyBillPayments(updatedCompanies);
    message.success(
      company.isActive ? 'Bill payment paused' : 'Bill payment activated'
    );
  };

  const totalMonthlyDeduction = myBillPayments
    .filter((c) => c.isActive)
    .reduce((sum, c) => sum + c.monthlyAmount, 0);

  const columns = [
    {
      title: 'Company',
      dataIndex: 'companyName',
      key: 'companyName',
      render: (name: string, record: BillPaymentCompany) => (
        <Space direction="vertical" size="small">
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.companyType}
          </Text>
        </Space>
      ),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value: any, record: BillPaymentCompany) =>
        record.companyName.toLowerCase().includes(value.toLowerCase()) ||
        record.companyType.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Account',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      render: (accountNumber: string, record: BillPaymentCompany) => (
        <Space direction="vertical" size="small">
          <Text>{accountNumber}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.accountHolderName}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Monthly Amount',
      dataIndex: 'monthlyAmount',
      key: 'monthlyAmount',
      render: (amount: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {amount.toLocaleString()} RWF
        </Text>
      ),
      sorter: (a: BillPaymentCompany, b: BillPaymentCompany) => a.monthlyAmount - b.monthlyAmount,
    },
    {
      title: 'Payment Day',
      dataIndex: 'paymentDay',
      key: 'paymentDay',
      render: (day: number) => `Day ${day} of month`,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: BillPaymentCompany) => (
        <Space>
          <Switch
            checked={isActive}
            onChange={() => toggleActiveStatus(record)}
            checkedChildren="Active"
            unCheckedChildren="Paused"
          />
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: BillPaymentCompany) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCompany(record);
              form.setFieldsValue({
                ...record,
                startDate: dayjs(record.startDate),
                endDate: record.endDate ? dayjs(record.endDate) : undefined,
              });
            }}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCompany(record)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Company',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount.toLocaleString()} RWF`,
    },
    {
      title: 'Payroll',
      dataIndex: 'payrollId',
      key: 'payrollId',
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          completed: 'success',
          pending: 'processing',
          failed: 'error',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
  ];

  const capacityPercentage = (myBillPayments.length / MAX_COMPANIES) * 100;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CreditCardOutlined style={{ marginRight: 8 }} />
          Bill Payments
        </Title>
        <Paragraph type="secondary">
          Manage your bill payments - automatically deducted from your monthly salary.
          <br />
          <Text strong>You can add up to {MAX_COMPANIES.toLocaleString()} bill payment companies!</Text>
        </Paragraph>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Companies"
              value={myBillPayments.length}
              suffix={`/ ${MAX_COMPANIES}`}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress
              percent={capacityPercentage}
              showInfo={false}
              strokeColor="#1890ff"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Payments"
              value={myBillPayments.filter((c) => c.isActive).length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Monthly Deduction"
              value={totalMonthlyDeduction}
              suffix="RWF"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#ff7300' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Next Deduction"
              value="Dec 15"
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alert for next deduction */}
      <Alert
        message="Upcoming Salary Deduction"
        description={
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>
              Your next salary payment on <Text strong>December 15, 2025</Text> will have{' '}
              <Text strong style={{ color: '#ff7300' }}>
                {totalMonthlyDeduction.toLocaleString()} RWF
              </Text>{' '}
              deducted for {myBillPayments.filter((c) => c.isActive).length} bill payments.
            </Text>
          </Space>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
      />

      {/* Tabs */}
      <Card>
        <Tabs defaultActiveKey="my-payments">
          <TabPane tab="My Bill Payments" key="my-payments">
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Search and Add */}
              <Row justify="space-between" align="middle">
                <Col>
                  <Input
                    placeholder="Search companies..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                    allowClear
                  />
                </Col>
                <Col>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      if (myBillPayments.length >= MAX_COMPANIES) {
                        message.warning(`Maximum limit of ${MAX_COMPANIES} companies reached`);
                        return;
                      }
                      setShowAddModal(true);
                      setEditingCompany(null);
                      form.resetFields();
                    }}
                    size="large"
                    style={{ background: '#f59e0b', border: 'none' }}
                  >
                    Add Bill Payment
                  </Button>
                </Col>
              </Row>

              {/* Table */}
              {myBillPayments.length === 0 ? (
                <Empty
                  description="No bill payments added yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAddModal(true)}>
                    Add Your First Bill Payment
                  </Button>
                </Empty>
              ) : (
                <Table
                  dataSource={myBillPayments}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} companies` }}
                />
              )}
            </Space>
          </TabPane>

          <TabPane tab="Payment History" key="history">
            <Table
              dataSource={transactions}
              columns={transactionColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingCompany ? 'Edit Bill Payment' : 'Add Bill Payment'}
        open={showAddModal || editingCompany !== null}
        onCancel={() => {
          setShowAddModal(false);
          setEditingCompany(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingCompany ? handleEditCompany : handleAddCompany}
        >
          {!editingCompany && (
            <>
              <Form.Item
                name="companyId"
                label="Select Company"
                rules={[{ required: true, message: 'Please select a company' }]}
              >
                <Select
                  showSearch
                  placeholder="Search and select a company"
                  optionFilterProp="children"
                  size="large"
                >
                  {availableCompanies.map((company) => (
                    <Option key={company.id} value={company.id}>
                      {company.name} - {company.type}
                    </Option>
                  ))}
                  <Option value="custom">+ Add Custom Company</Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.companyId !== currentValues.companyId}
              >
                {({ getFieldValue }) =>
                  getFieldValue('companyId') === 'custom' ? (
                    <>
                      <Form.Item
                        name="customCompanyName"
                        label="Company Name"
                        rules={[{ required: true, message: 'Please enter company name' }]}
                      >
                        <Input placeholder="Enter company name" size="large" />
                      </Form.Item>
                      <Form.Item
                        name="companyType"
                        label="Company Type"
                        rules={[{ required: true, message: 'Please select type' }]}
                      >
                        <Select placeholder="Select type" size="large">
                          {COMPANY_TYPES.map((type) => (
                            <Option key={type} value={type}>
                              {type}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </>
                  ) : null
                }
              </Form.Item>
            </>
          )}

          {editingCompany && (
            <Alert
              message={`Editing: ${editingCompany.companyName}`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            name="accountNumber"
            label="Your Account Number"
            rules={[{ required: true, message: 'Please enter your account number' }]}
          >
            <Input placeholder="Enter your account number with this company" size="large" />
          </Form.Item>

          <Form.Item
            name="accountHolderName"
            label="Account Holder Name"
            initialValue={user?.name}
          >
            <Input placeholder="Account holder name" size="large" />
          </Form.Item>

          <Form.Item
            name="monthlyAmount"
            label="Monthly Payment Amount (RWF)"
            rules={[{ required: true, message: 'Please enter amount' }]}
          >
            <InputNumber
              placeholder="Enter monthly amount"
              style={{ width: '100%' }}
              size="large"
              min={0}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>

          <Form.Item
            name="paymentDay"
            label="Payment Day of Month"
            initialValue={1}
            rules={[{ required: true, message: 'Please select payment day' }]}
          >
            <Select size="large">
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <Option key={day} value={day}>
                  Day {day}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Start Date">
                <DatePicker style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="End Date (Optional)">
                <DatePicker style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          {editingCompany && (
            <Form.Item name="isActive" label="Status" valuePropName="checked" initialValue={true}>
              <Switch checkedChildren="Active" unCheckedChildren="Paused" />
            </Form.Item>
          )}

          <Form.Item name="notes" label="Notes (Optional)">
            <Input.TextArea
              placeholder="Add any notes about this payment"
              rows={3}
            />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCompany(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingCompany ? 'Update' : 'Add'} Bill Payment
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BillPaymentsPage;

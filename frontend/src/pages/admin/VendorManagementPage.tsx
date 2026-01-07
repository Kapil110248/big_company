import React, { useState } from 'react';
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
  Modal,
  Form,
  InputNumber,
  message,
  Statistic,
  Dropdown,
} from 'antd';
import {
  ShopOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
  type: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  paymentTerms: string;
  totalPaid: number;
  bankAccount: string;
}

export const VendorManagementPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form] = Form.useForm();

  const vendors: Vendor[] = [
    {
      id: '1',
      vendorCode: 'VEN001',
      name: 'Office Supplies Ltd',
      type: 'Office Equipment',
      contactPerson: 'James Smith',
      email: 'james@officesupplies.rw',
      phone: '250788400001',
      address: 'KN 4 Ave, Kigali',
      status: 'active',
      paymentTerms: 'Net 30',
      totalPaid: 5200000,
      bankAccount: '**** **** 1111',
    },
    {
      id: '2',
      vendorCode: 'VEN002',
      name: 'Tech Solutions Rwanda',
      type: 'IT Services',
      contactPerson: 'Maria Garcia',
      email: 'maria@techsolutions.rw',
      phone: '250788400002',
      address: 'KG 7 Ave, Kigali',
      status: 'active',
      paymentTerms: 'Net 15',
      totalPaid: 12500000,
      bankAccount: '**** **** 2222',
    },
    {
      id: '3',
      vendorCode: 'VEN003',
      name: 'Cleaning Services Pro',
      type: 'Facility Services',
      contactPerson: 'David Wilson',
      email: 'david@cleaningpro.rw',
      phone: '250788400003',
      address: 'KK 12 Ave, Kigali',
      status: 'active',
      paymentTerms: 'Monthly',
      totalPaid: 3600000,
      bankAccount: '**** **** 3333',
    },
  ];

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchText.toLowerCase()) ||
      vendor.vendorCode.toLowerCase().includes(searchText.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = typeFilter === 'all' || vendor.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalVendors = vendors.length;
  const activeVendors = vendors.filter((v) => v.status === 'active').length;
  const totalSpent = vendors.reduce((sum, v) => sum + v.totalPaid, 0);

  const handleAddVendor = async (values: any) => {
    try {
      console.log('Adding vendor:', values);
      message.success('Vendor added successfully!');
      setShowAddModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to add vendor');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete Vendor',
      content: 'Are you sure you want to delete this vendor?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        message.success('Vendor deleted successfully');
      },
    });
  };

  const columns = [
    {
      title: 'Vendor',
      key: 'vendor',
      render: (_: any, record: Vendor) => (
        <div>
          <Text strong>{record.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.vendorCode} • {record.type}
          </Text>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_: any, record: Vendor) => (
        <div>
          <Text>{record.contactPerson}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.email}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.phone}
          </Text>
        </div>
      ),
    },
    {
      title: 'Payment Terms',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      render: (terms: string) => <Tag>{terms}</Tag>,
    },
    {
      title: 'Total Paid',
      dataIndex: 'totalPaid',
      key: 'totalPaid',
      render: (amount: number) => `${amount.toLocaleString()} RWF`,
    },
    {
      title: 'Bank Account',
      dataIndex: 'bankAccount',
      key: 'bankAccount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Vendor) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
              },
              {
                key: 'pay',
                icon: <DollarOutlined />,
                label: 'Make Payment',
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <ShopOutlined /> Vendor Management
      </Title>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="Total Vendors"
              value={totalVendors}
              prefix={<ShopOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title="Active Vendors"
              value={activeVendors}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Spent"
              value={totalSpent}
              prefix="RWF"
              valueStyle={{ color: '#722ed1', fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Vendor List */}
      <Card
        title="All Vendors"
        extra={
          <Space>
            <Input
              placeholder="Search vendors..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select value={typeFilter} onChange={setTypeFilter} style={{ width: 150 }}>
              <Option value="all">All Types</Option>
              <Option value="Office Equipment">Office Equipment</Option>
              <Option value="IT Services">IT Services</Option>
              <Option value="Facility Services">Facility Services</Option>
            </Select>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAddModal(true)}>
              Add Vendor
            </Button>
          </Space>
        }
      >
        <Table dataSource={filteredVendors} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      {/* Add Vendor Modal */}
      <Modal
        title="Add New Vendor"
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleAddVendor}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="Vendor Name" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Vendor Type" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="Office Equipment">Office Equipment</Option>
                  <Option value="IT Services">IT Services</Option>
                  <Option value="Facility Services">Facility Services</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contactPerson" label="Contact Person" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="paymentTerms" label="Payment Terms" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="Net 15">Net 15</Option>
                  <Option value="Net 30">Net 30</Option>
                  <Option value="Net 60">Net 60</Option>
                  <Option value="Monthly">Monthly</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="address" label="Address">
                <TextArea rows={2} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="bankAccount" label="Bank Account (Direct Deposit)" rules={[{ required: true }]}>
                <Input size="large" placeholder="For automated payments" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setShowAddModal(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Add Vendor
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VendorManagementPage;

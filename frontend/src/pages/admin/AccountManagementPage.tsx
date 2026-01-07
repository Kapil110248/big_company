import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Row,
  Col,
  Tabs,
  Select,
  Divider,
  Alert,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  ShopOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../../services/apiService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Types
interface RetailerAccount {
  id: string;
  email: string;
  business_name: string;
  phone: string;
  address?: string;
  credit_limit: number;
  status: 'pending' | 'active' | 'inactive' | 'blocked';
  verified: boolean;
  created_at: string;
}

interface WholesalerAccount {
  id: string;
  email: string;
  company_name: string;
  phone: string;
  address?: string;
  status: 'pending' | 'active' | 'inactive' | 'blocked';
  verified: boolean;
  created_at: string;
}

const AccountManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [retailers, setRetailers] = useState<RetailerAccount[]>([]);
  const [wholesalers, setWholesalers] = useState<WholesalerAccount[]>([]);
  const [createRetailerModalVisible, setCreateRetailerModalVisible] = useState(false);
  const [createWholesalerModalVisible, setCreateWholesalerModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('retailers');

  const [retailerForm] = Form.useForm();
  const [wholesalerForm] = Form.useForm();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      // Load retailers and wholesalers
      const [retailersRes, wholesalersRes] = await Promise.all([
        adminApi.getRetailers(),
        adminApi.getWholesalers(),
      ]);

      if (retailersRes.data?.retailers) {
        setRetailers(retailersRes.data.retailers);
      }
      if (wholesalersRes.data?.wholesalers) {
        setWholesalers(wholesalersRes.data.wholesalers);
      }
    } catch (error: any) {
      console.error('Failed to load accounts:', error);
      message.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  // Create Retailer Account
  const handleCreateRetailer = async (values: any) => {
    try {
      setLoading(true);
      await adminApi.createRetailer({
        email: values.email,
        password: values.password,
        business_name: values.business_name,
        phone: values.phone,
        address: values.address,
        credit_limit: values.credit_limit || 0,
      });

      message.success('Retailer account created successfully! Activation email sent.');
      setCreateRetailerModalVisible(false);
      retailerForm.resetFields();
      loadAccounts();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create retailer account');
    } finally {
      setLoading(false);
    }
  };

  // Create Wholesaler Account
  const handleCreateWholesaler = async (values: any) => {
    try {
      setLoading(true);
      await adminApi.createWholesaler({
        email: values.email,
        password: values.password,
        company_name: values.company_name,
        phone: values.phone,
        address: values.address,
      });

      message.success('Wholesaler account created successfully! Activation email sent.');
      setCreateWholesalerModalVisible(false);
      wholesalerForm.resetFields();
      loadAccounts();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to create wholesaler account');
    } finally {
      setLoading(false);
    }
  };

  // Toggle account status
  const handleToggleStatus = async (id: string, type: 'retailer' | 'wholesaler', currentStatus: string) => {
    const isActive = currentStatus !== 'active';

    Modal.confirm({
      title: `${isActive ? 'Activate' : 'Deactivate'} Account`,
      content: `Are you sure you want to ${isActive ? 'activate' : 'deactivate'} this ${type} account?`,
      okText: 'Confirm',
      onOk: async () => {
        try {
          if (type === 'retailer') {
            await adminApi.updateRetailerStatus(id, isActive);
          } else {
            await adminApi.updateWholesalerStatus(id, isActive);
          }
          message.success(`Account ${isActive ? 'activated' : 'deactivated'} successfully`);
          loadAccounts();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to update account status');
        }
      },
    });
  };

  // Verify account
  const handleVerifyAccount = async (id: string, type: 'retailer' | 'wholesaler') => {
    Modal.confirm({
      title: 'Verify Account',
      content: `Are you sure you want to verify this ${type} account?`,
      okText: 'Verify',
      onOk: async () => {
        try {
          if (type === 'retailer') {
            await adminApi.verifyRetailer(id);
          } else {
            await adminApi.verifyWholesaler(id);
          }
          message.success('Account verified successfully');
          loadAccounts();
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Failed to verify account');
        }
      },
    });
  };

  // Retailer Table Columns
  const retailerColumns: ColumnsType<RetailerAccount> = [
    {
      title: 'Business Name',
      dataIndex: 'business_name',
      key: 'business_name',
      render: (text) => (
        <Space>
          <ShopOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Credit Limit',
      dataIndex: 'credit_limit',
      key: 'credit_limit',
      render: (value) => `${value?.toLocaleString() || 0} RWF`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'active' ? 'green' :
          status === 'pending' ? 'orange' :
          status === 'blocked' ? 'red' : 'default'
        }>
          {status?.toUpperCase() || 'UNKNOWN'}
        </Tag>
      ),
    },
    {
      title: 'Verified',
      dataIndex: 'verified',
      key: 'verified',
      render: (verified) => (
        verified ?
          <Tag color="green" icon={<CheckCircleOutlined />}>Verified</Tag> :
          <Tag color="orange" icon={<CloseCircleOutlined />}>Unverified</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {!record.verified && (
            <Button
              type="link"
              size="small"
              onClick={() => handleVerifyAccount(record.id, 'retailer')}
            >
              Verify
            </Button>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleStatus(record.id, 'retailer', record.status)}
          >
            {record.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </Space>
      ),
    },
  ];

  // Wholesaler Table Columns
  const wholesalerColumns: ColumnsType<WholesalerAccount> = [
    {
      title: 'Company Name',
      dataIndex: 'company_name',
      key: 'company_name',
      render: (text) => (
        <Space>
          <BankOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'active' ? 'green' :
          status === 'pending' ? 'orange' :
          status === 'blocked' ? 'red' : 'default'
        }>
          {status?.toUpperCase() || 'UNKNOWN'}
        </Tag>
      ),
    },
    {
      title: 'Verified',
      dataIndex: 'verified',
      key: 'verified',
      render: (verified) => (
        verified ?
          <Tag color="green" icon={<CheckCircleOutlined />}>Verified</Tag> :
          <Tag color="orange" icon={<CloseCircleOutlined />}>Unverified</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {!record.verified && (
            <Button
              type="link"
              size="small"
              onClick={() => handleVerifyAccount(record.id, 'wholesaler')}
            >
              Verify
            </Button>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => handleToggleStatus(record.id, 'wholesaler', record.status)}
          >
            {record.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Account Management</Title>
          <Text type="secondary">Create and manage retailer & wholesaler accounts</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadAccounts}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <ShopOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{retailers.length}</div>
              <div style={{ color: '#8c8c8c' }}>Total Retailers</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {retailers.filter(r => r.status === 'active').length}
              </div>
              <div style={{ color: '#8c8c8c' }}>Active Retailers</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <BankOutlined style={{ fontSize: 32, color: '#722ed1', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>{wholesalers.length}</div>
              <div style={{ color: '#8c8c8c' }}>Total Wholesalers</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {wholesalers.filter(w => w.status === 'active').length}
              </div>
              <div style={{ color: '#8c8c8c' }}>Active Wholesalers</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'retailers',
              label: (
                <span>
                  <ShopOutlined /> Retailers
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setCreateRetailerModalVisible(true)}
                    >
                      Create Retailer Account
                    </Button>
                  </div>
                  <Table
                    columns={retailerColumns}
                    dataSource={retailers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} retailers`,
                    }}
                  />
                </div>
              ),
            },
            {
              key: 'wholesalers',
              label: (
                <span>
                  <BankOutlined /> Wholesalers
                </span>
              ),
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => setCreateWholesalerModalVisible(true)}
                    >
                      Create Wholesaler Account
                    </Button>
                  </div>
                  <Table
                    columns={wholesalerColumns}
                    dataSource={wholesalers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} wholesalers`,
                    }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* Create Retailer Modal */}
      <Modal
        title={
          <Space>
            <ShopOutlined />
            <span>Create Retailer Account</span>
          </Space>
        }
        open={createRetailerModalVisible}
        onCancel={() => {
          setCreateRetailerModalVisible(false);
          retailerForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Alert
          message="Account Activation"
          description="An activation email will be sent to the retailer. They must activate their account and set a new password before logging in."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Form
          form={retailerForm}
          layout="vertical"
          onFinish={handleCreateRetailer}
        >
          <Form.Item
            name="business_name"
            label="Business Name"
            rules={[{ required: true, message: 'Please enter business name' }]}
          >
            <Input prefix={<ShopOutlined />} placeholder="e.g., Kigali Shop Ltd" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="retailer@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="+250788123456" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password"
            label="Initial Password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
            extra="User will be required to change this password on first login"
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Temporary password" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Business Address"
          >
            <TextArea rows={2} placeholder="Street, District, City" />
          </Form.Item>

          <Form.Item
            name="credit_limit"
            label="Initial Credit Limit (RWF)"
            initialValue={0}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={10000}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
            />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => {
                setCreateRetailerModalVisible(false);
                retailerForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Retailer Account
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Wholesaler Modal */}
      <Modal
        title={
          <Space>
            <BankOutlined />
            <span>Create Wholesaler Account</span>
          </Space>
        }
        open={createWholesalerModalVisible}
        onCancel={() => {
          setCreateWholesalerModalVisible(false);
          wholesalerForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Alert
          message="Account Activation"
          description="An activation email will be sent to the wholesaler. They must activate their account and set a new password before logging in."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Form
          form={wholesalerForm}
          layout="vertical"
          onFinish={handleCreateWholesaler}
        >
          <Form.Item
            name="company_name"
            label="Company Name"
            rules={[{ required: true, message: 'Please enter company name' }]}
          >
            <Input prefix={<BankOutlined />} placeholder="e.g., BIG Company Rwanda Ltd" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="wholesaler@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="+250788123456" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password"
            label="Initial Password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
            extra="User will be required to change this password on first login"
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Temporary password" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Business Address"
          >
            <TextArea rows={2} placeholder="Street, District, City" />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => {
                setCreateWholesalerModalVisible(false);
                wholesalerForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Wholesaler Account
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountManagementPage;

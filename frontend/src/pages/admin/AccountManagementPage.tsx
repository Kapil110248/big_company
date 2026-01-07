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
  SearchOutlined,
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
  const [searchText, setSearchText] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);

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
        // Map nested backend structure to flat interface
        const mappedRetailers = retailersRes.data.retailers.map((r: any) => ({
          id: r.id,
          business_name: r.shopName,
          email: r.user?.email,
          phone: r.user?.phone,
          address: r.address,
          credit_limit: r.creditLimit,
          status: r.user?.isActive ? 'active' : 'inactive',
          verified: r.isVerified,
          created_at: r.createdAt
        }));
        setRetailers(mappedRetailers);
      }
      if (wholesalersRes.data?.wholesalers) {
        // Map nested backend structure to flat interface
        const mappedWholesalers = wholesalersRes.data.wholesalers.map((w: any) => ({
          id: w.id,
          company_name: w.companyName,
          email: w.user?.email,
          phone: w.user?.phone,
          address: w.address,
          status: w.user?.isActive ? 'active' : 'inactive',
          verified: w.isVerified,
          created_at: w.createdAt
        }));
        setWholesalers(mappedWholesalers);
      }
    } catch (error: any) {
      console.error('Failed to load accounts:', error);
      message.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  // Create or Update Retailer Account
  const handleSaveRetailer = async (values: any) => {
    try {
      setLoading(true);
      if (editingId) {
        await adminApi.updateRetailer(editingId, {
          ...values,
          credit_limit: values.credit_limit || 0,
        });
        message.success('Retailer account updated successfully');
      } else {
        await adminApi.createRetailer({
          ...values,
          credit_limit: values.credit_limit || 0,
        });
        message.success('Retailer account created successfully! Activation email sent.');
      }

      setCreateRetailerModalVisible(false);
      setEditingId(null);
      retailerForm.resetFields();
      loadAccounts();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save retailer account');
    } finally {
      setLoading(false);
    }
  };

  // Create or Update Wholesaler Account
  const handleSaveWholesaler = async (values: any) => {
    try {
      setLoading(true);
      if (editingId) {
        await adminApi.updateWholesaler(editingId, values);
        message.success('Wholesaler account updated successfully');
      } else {
        await adminApi.createWholesaler(values);
        message.success('Wholesaler account created successfully! Activation email sent.');
      }

      setCreateWholesalerModalVisible(false);
      setEditingId(null);
      wholesalerForm.resetFields();
      loadAccounts();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save wholesaler account');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRetailer = (record: RetailerAccount) => {
    setEditingId(record.id);
    retailerForm.setFieldsValue(record);
    setCreateRetailerModalVisible(true);
  };

  const handleDeleteRetailer = (id: string) => {
    Modal.confirm({
      title: 'Delete Retailer',
      content: 'Are you sure you want to delete this retailer? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await adminApi.deleteRetailer(id);
          message.success('Retailer deleted successfully');
          loadAccounts();
        } catch (error: any) {
          message.error('Failed to delete retailer');
        }
      }
    });
  };

  const handleEditWholesaler = (record: WholesalerAccount) => {
    setEditingId(record.id);
    wholesalerForm.setFieldsValue(record);
    setCreateWholesalerModalVisible(true);
  };

  const handleDeleteWholesaler = (id: string) => {
    Modal.confirm({
      title: 'Delete Wholesaler',
      content: 'Are you sure you want to delete this wholesaler?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await adminApi.deleteWholesaler(id);
          message.success('Wholesaler deleted successfully');
          loadAccounts();
        } catch (error: any) {
          message.error('Failed to delete wholesaler');
        }
      }
    });
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
          <Button type="link" size="small" onClick={() => handleEditRetailer(record)}>Edit</Button>
          <Button type="link" danger size="small" onClick={() => handleDeleteRetailer(record.id)}>Delete</Button>
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
          <Button type="link" size="small" onClick={() => handleEditWholesaler(record)}>Edit</Button>
          <Button type="link" danger size="small" onClick={() => handleDeleteWholesaler(record.id)}>Delete</Button>
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


  const filteredRetailers = retailers.filter(r =>
    r.business_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    r.phone?.includes(searchText)
  );

  const filteredWholesalers = wholesalers.filter(w =>
    w.company_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    w.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    w.phone?.includes(searchText)
  );

  // ... (existing helper functions)

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Account Management</Title>
          <Text type="secondary">Create and manage retailer & wholesaler accounts</Text>
        </div>
        <Space>
          <Input
            placeholder="Search accounts..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              if (activeTab === 'retailers') {
                retailerForm.resetFields();
                setEditingId(null);
                setCreateRetailerModalVisible(true);
              } else {
                wholesalerForm.resetFields();
                setEditingId(null);
                setCreateWholesalerModalVisible(true);
              }
            }}
          >
            {activeTab === 'retailers' ? 'Add Retailer' : 'Add Wholesaler'}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadAccounts}>
            Refresh
          </Button>
        </Space>
      </div>

      {/* Stats Cards ... */}

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
                  <Table
                    columns={retailerColumns}
                    dataSource={filteredRetailers}
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
                  <Table
                    columns={wholesalerColumns}
                    dataSource={filteredWholesalers}
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

      {/* ... Modals ... */}


      {/* Create/Edit Retailer Modal */}
      <Modal
        title={
          <Space>
            <ShopOutlined />
            <span>{editingId ? 'Edit' : 'Create'} Retailer Account</span>
          </Space>
        }
        open={createRetailerModalVisible}
        onCancel={() => {
          setCreateRetailerModalVisible(false);
          retailerForm.resetFields();
          setEditingId(null); // Reset editingId on cancel
        }}
        footer={null}
        width={600}
      >
        <Alert
          message={editingId ? "Update Account" : "Account Activation"}
          description={editingId ? "Modify retailer details." : "An activation email will be sent to the retailer. They must activate their account and set a new password before logging in."}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Form
          form={retailerForm}
          layout="vertical"
          onFinish={handleSaveRetailer}
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

          {!editingId && (
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
          )}

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
                setEditingId(null); // Reset editingId on cancel
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingId ? 'Update' : 'Create'} Retailer Account
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create/Edit Wholesaler Modal */}
      <Modal
        title={
          <Space>
            <BankOutlined />
            <span>{editingId ? 'Edit' : 'Create'} Wholesaler Account</span>
          </Space>
        }
        open={createWholesalerModalVisible}
        onCancel={() => {
          setCreateWholesalerModalVisible(false);
          wholesalerForm.resetFields();
          setEditingId(null); // Reset editingId on cancel
        }}
        footer={null}
        width={600}
      >
        <Alert
          message={editingId ? "Update Account" : "Account Activation"}
          description={editingId ? "Modify wholesaler details." : "An activation email will be sent to the wholesaler. They must activate their account and set a new password before logging in."}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        <Form
          form={wholesalerForm}
          layout="vertical"
          onFinish={handleSaveWholesaler}
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

          {!editingId && (
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
          )}

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
                setEditingId(null); // Reset editingId on cancel
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingId ? 'Update' : 'Create'} Wholesaler Account
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountManagementPage;

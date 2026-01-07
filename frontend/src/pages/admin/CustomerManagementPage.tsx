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
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../../services/apiService';

const { Title, Text } = Typography;
const { Option } = Select;

interface Customer {
  id: string; // ConsumerProfile ID
  fullName: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    isActive: boolean;
  };
}

const CustomerManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getCustomers();
      if (response.data?.customers) {
        setCustomers(response.data.customers);
      }
    } catch (error: any) {
      console.error('Failed to load customers:', error);
      message.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      if (editingId) {
        await adminApi.updateCustomer(editingId, values);
        message.success('Customer updated successfully');
      } else {
        await adminApi.createCustomer(values);
        message.success('Customer created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      loadCustomers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (record: Customer) => {
    // Flatten data for form
    // Priority: ConsumerProfile.fullName -> User.name
    const displayName = record.fullName || record.user?.name || '';
    const [firstName, ...lastNameParts] = displayName.split(' ');
    const lastName = lastNameParts.join(' ');

    setEditingId(record.id);
    form.setFieldsValue({
      firstName,
      lastName,
      email: record.user?.email,
      phone: record.user?.phone,
      status: record.user?.isActive ? 'active' : 'inactive'
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Customer',
      content: `Are you sure you want to delete ${name}? This will delete their account and profile.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await adminApi.deleteCustomer(id);
          message.success('Customer deleted successfully');
          loadCustomers();
        } catch (error: any) {
          message.error('Failed to delete customer');
        }
      },
    });
  };

  const filteredCustomers = customers.filter(c => {
    const name = c.fullName || c.user?.name || '';
    const email = c.user?.email || '';
    const phone = c.user?.phone || '';
    return (
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      email.toLowerCase().includes(searchText.toLowerCase()) ||
      phone.includes(searchText)
    );
  });

  const columns: ColumnsType<Customer> = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <strong>{record.fullName || record.user?.name || 'N/A'}</strong>
        </Space>
      ),
    },
    {
      title: 'Email',
      key: 'email',
      render: (_, record) => record.user?.email || 'N/A',
    },
    {
      title: 'Phone',
      key: 'phone',
      render: (_, record) => record.user?.phone || 'N/A',
    },
    {
      title: 'Status',
      key: 'isActive',
      render: (_, record) => (
        <Tag color={record.user?.isActive ? 'green' : 'red'}>
          {record.user?.isActive ? 'ACTIVE' : 'INACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id || '', record.fullName || record.user?.name || 'Customer')}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Customer Management</Title>
          <Text type="secondary">Manage consumer accounts</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadCustomers}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}>
            Add Customer
          </Button>
        </Space>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search by name, email, or phone"
            style={{ width: 300 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id" // User ID
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit Customer' : 'Add Customer'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="John" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="Doe" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email' }]}
          >
            <Input placeholder="john@example.com" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true }]}
          >
            <Input placeholder="+250..." />
          </Form.Item>

          {!editingId && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, min: 6 }]}
            >
              <Input.Password placeholder="******" />
            </Form.Item>
          )}

          {editingId && (
            <Form.Item name="status" label="Status" initialValue="active">
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingId ? 'Update' : 'Create'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerManagementPage;

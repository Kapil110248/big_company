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
  InputNumber,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StopOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../../services/apiService';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface Retailer {
  id: string;
  store_name: string;
  owner_name: string;
  phone: string;
  email: string;
  location: string;
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  credit_limit: number;
  current_balance: number;
  created_at: string;
}

const RetailerManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadRetailers();
  }, [statusFilter]);

  const loadRetailers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getRetailers();
      if (response.data?.retailers) {
        const mappedRetailers = response.data.retailers.map((r: any) => ({
          id: r.id,
          store_name: r.shopName,
          owner_name: r.user?.name || 'N/A',
          email: r.user?.email,
          phone: r.user?.phone,
          location: r.address,
          credit_limit: r.creditLimit,
          current_balance: 0,
          status: r.user?.isActive ? 'active' : 'inactive',
          created_at: r.createdAt
        }));

        const filtered = statusFilter === 'all'
          ? mappedRetailers
          : mappedRetailers.filter((r: Retailer) => r.status === statusFilter);

        setRetailers(filtered);
      }
    } catch (error: any) {
      console.error('Failed to load retailers:', error);
      message.error('Failed to load retailers');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      if (editingId) {
        await adminApi.updateRetailer(editingId, {
          business_name: values.store_name, // Map form field to API expected field
          email: values.email,
          phone: values.phone,
          address: values.location,
          credit_limit: values.credit_limit,
        });
        message.success('Retailer updated successfully');
      } else {
        await adminApi.createRetailer({
          business_name: values.store_name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          address: values.location,
          credit_limit: values.credit_limit,
        });
        message.success('Retailer created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      loadRetailers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save retailer');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Retailer) => {
    setEditingId(record.id);
    form.setFieldsValue({
      store_name: record.store_name,
      email: record.email,
      phone: record.phone,
      location: record.location,
      credit_limit: record.credit_limit,
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Retailer',
      content: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await adminApi.deleteRetailer(id);
          message.success('Retailer deleted successfully');
          loadRetailers();
        } catch (error: any) {
          message.error('Failed to delete retailer');
        }
      },
    });
  };

  const handleStatusChange = async (record: Retailer) => {
    const newStatus = record.status === 'active' ? false : true;
    try {
      await adminApi.updateRetailerStatus(record.id, newStatus);
      message.success(`Retailer ${newStatus ? 'activated' : 'deactivated'} successfully`);
      loadRetailers();
    } catch (error: any) {
      message.error('Failed to update status');
    }
  };

  const filteredRetailers = retailers.filter(r => {
    return (
      r.store_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.owner_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      r.phone?.includes(searchText) ||
      r.email?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const columns: ColumnsType<Retailer> = [
    {
      title: 'Store Name',
      key: 'store_name',
      render: (_, record) => (
        <Space>
          <ShopOutlined />
          <strong>{record.store_name}</strong>
        </Space>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'owner_name',
      key: 'owner_name',
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>{record.phone}</div>
          <div style={{ color: '#888' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Credit Limit',
      dataIndex: 'credit_limit',
      key: 'credit_limit',
      render: (val) => `${(val || 0).toLocaleString()} RWF`,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        let color = 'default';
        let icon = null;
        if (record.status === 'active') { color = 'green'; icon = <CheckCircleOutlined />; }
        else if (record.status === 'suspended') { color = 'red'; icon = <StopOutlined />; }
        else if (record.status === 'inactive') { color = 'red'; icon = <CloseCircleOutlined />; }
        else if (record.status === 'pending') { color = 'gold'; }

        return (
          <Tag color={color} icon={icon}>
            {record.status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              ghost
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>

          <Tooltip title={record.status === 'active' ? "Deactivate" : "Activate"}>
            <Button
              type={record.status === 'active' ? 'default' : 'primary'}
              danger={record.status === 'active'}
              icon={record.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
              size="small"
              onClick={() => handleStatusChange(record)}
            />
          </Tooltip>

          <Tooltip title="Delete">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => handleDelete(record.id, record.store_name)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Retailer Management</Title>
          <Text type="secondary">Manage retailer accounts</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadRetailers}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}>
            Add Retailer
          </Button>
        </Space>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search by store, owner, email, or phone"
            style={{ width: 300 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <Select defaultValue="all" style={{ width: 120 }} onChange={setStatusFilter}>
            <Option value="all">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </div>
        <Table
          columns={columns}
          dataSource={filteredRetailers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit Retailer' : 'Add Retailer'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingId(null);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="store_name"
                label="Store Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="Tech Store Ltd" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="+250..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: 'email' }]}
              >
                <Input placeholder="store@example.com" />
              </Form.Item>
            </Col>
            {!editingId && (
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, min: 8 }]}
                >
                  <Input.Password placeholder="Min 8 chars" />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Form.Item
            name="location"
            label="Address / Location"
          >
            <TextArea rows={2} placeholder="Kigali, Rwanda..." />
          </Form.Item>

          <Form.Item
            name="credit_limit"
            label="Credit Limit (RWF)"
            initialValue={0}
          >
            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number} />
          </Form.Item>

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

export default RetailerManagementPage;

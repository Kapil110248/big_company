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
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
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

interface Wholesaler {
  id: string;
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  location: string;
  status: 'active' | 'suspended' | 'pending' | 'inactive';
  created_at: string;
}

const WholesalerManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadWholesalers();
  }, [statusFilter]);

  const loadWholesalers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getWholesalers();
      if (response.data?.wholesalers) {
        const mappedWholesalers = response.data.wholesalers.map((w: any) => ({
          id: w.id,
          business_name: w.companyName,
          contact_person: w.user?.name || 'N/A',
          email: w.user?.email,
          phone: w.user?.phone,
          location: w.address,
          status: w.user?.isActive ? 'active' : 'inactive',
          created_at: w.createdAt
        }));

        const filtered = statusFilter === 'all'
          ? mappedWholesalers
          : mappedWholesalers.filter((w: Wholesaler) => w.status === statusFilter);

        setWholesalers(filtered);
      }
    } catch (error: any) {
      console.error('Failed to load wholesalers:', error);
      message.error('Failed to load wholesalers');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      if (editingId) {
        await adminApi.updateWholesaler(editingId, {
          company_name: values.business_name,
          email: values.email,
          phone: values.phone,
          address: values.location,
        });
        message.success('Wholesaler updated successfully');
      } else {
        await adminApi.createWholesaler({
          company_name: values.business_name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          address: values.location,
        });
        message.success('Wholesaler created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingId(null);
      loadWholesalers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to save wholesaler');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: Wholesaler) => {
    setEditingId(record.id);
    form.setFieldsValue({
      business_name: record.business_name,
      email: record.email,
      phone: record.phone,
      location: record.location,
    });
    setModalVisible(true);
  };

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Wholesaler',
      content: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await adminApi.deleteWholesaler(id);
          message.success('Wholesaler deleted successfully');
          loadWholesalers();
        } catch (error: any) {
          message.error('Failed to delete wholesaler');
        }
      },
    });
  };

  const handleStatusChange = async (record: Wholesaler) => {
    const newStatus = record.status === 'active' ? false : true;
    try {
      await adminApi.updateWholesalerStatus(record.id, newStatus);
      message.success(`Wholesaler ${newStatus ? 'activated' : 'deactivated'} successfully`);
      loadWholesalers();
    } catch (error: any) {
      message.error('Failed to update status');
    }
  };

  const filteredWholesalers = wholesalers.filter(w => {
    return (
      w.business_name?.toLowerCase().includes(searchText.toLowerCase()) ||
      w.contact_person?.toLowerCase().includes(searchText.toLowerCase()) ||
      w.phone?.includes(searchText) ||
      w.email?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const columns: ColumnsType<Wholesaler> = [
    {
      title: 'Business Name',
      key: 'business_name',
      render: (_, record) => (
        <Space>
          <BankOutlined />
          <strong>{record.business_name}</strong>
        </Space>
      ),
    },
    {
      title: 'Contact Person',
      dataIndex: 'contact_person',
      key: 'contact_person',
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
              onClick={() => handleDelete(record.id, record.business_name)}
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
          <Title level={2} style={{ margin: 0 }}>Wholesaler Management</Title>
          <Text type="secondary">Manage wholesaler accounts</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadWholesalers}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => {
            setEditingId(null);
            form.resetFields();
            setModalVisible(true);
          }}>
            Add Wholesaler
          </Button>
        </Space>
      </div>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search by name, contact, email, or phone"
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
          dataSource={filteredWholesalers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit Wholesaler' : 'Add Wholesaler'}
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
                name="business_name"
                label="Company / Business Name"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Input placeholder="Global Traders Ltd" />
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
                <Input placeholder="info@globaltraders.com" />
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

export default WholesalerManagementPage;


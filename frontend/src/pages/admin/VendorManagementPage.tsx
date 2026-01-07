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
  Input,
  Modal,
  Form,
  message,
  Statistic,
  Dropdown,
  Tooltip
} from 'antd';
import {
  ShopOutlined,
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { supplierService, Supplier } from '../../services/supplierService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const VendorManagementPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getSuppliers();
      setSuppliers(data.suppliers);
    } catch (error) {
      message.error('Failed to fetch vendors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSave = async (values: any) => {
    try {
      if (editingId) {
        await supplierService.updateSupplier(editingId, values);
        message.success('Vendor updated successfully');
      } else {
        await supplierService.createSupplier(values);
        message.success('Vendor created successfully');
      }
      setShowModal(false);
      setEditingId(null);
      form.resetFields();
      fetchSuppliers();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Vendor',
      content: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await supplierService.deleteSupplier(id);
          message.success('Vendor deleted successfully');
          fetchSuppliers();
        } catch (error: any) {
          message.error(error.response?.data?.error || 'Failed to delete vendor');
        }
      },
    });
  };

  const openEditModal = (record: Supplier) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setShowModal(true);
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (s.contactPerson?.toLowerCase().includes(searchText.toLowerCase())) ||
    (s.email?.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns = [
    {
      title: 'Vendor Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Supplier) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.contactPerson && <Text type="secondary" style={{ fontSize: 12 }}>Contact: {record.contactPerson}</Text>}
        </Space>
      ),
    },
    {
      title: 'Contact Info',
      key: 'contact',
      render: (_: any, record: Supplier) => (
        <Space direction="vertical" size={2}>
          {record.email && (
            <Space size={4}>
              <MailOutlined style={{ color: '#1890ff' }} />
              <Text style={{ fontSize: 13 }}>{record.email}</Text>
            </Space>
          )}
          {record.phone && (
            <Space size={4}>
              <PhoneOutlined style={{ color: '#52c41a' }} />
              <Text style={{ fontSize: 13 }}>{record.phone}</Text>
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      ellipsis: {
        showTitle: false,
      },
      render: (address: string) => (
        <Tooltip placement="topLeft" title={address}>
          {address}
        </Tooltip>
      ),
    },
    {
      title: 'Products',
      key: 'products',
      render: (_: any, record: Supplier) => (
        <Tag color="cyan">{record._count?.products || 0} Products</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'error'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Supplier) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => openEditModal(record),
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDelete(record.id, record.name),
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
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <ShopOutlined /> Vendor Management
          </Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingId(null);
              form.resetFields();
              setShowModal(true);
            }}
          >
            Add New Vendor
          </Button>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Vendors" value={suppliers.length} prefix={<ShopOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Active Vendors" value={suppliers.filter(s => s.status === 'active').length} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total Products Sourced" value={suppliers.reduce((acc, curr) => acc + (curr._count?.products || 0), 0)} />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search vendors..."
            prefix={<SearchOutlined />}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingId ? "Edit Vendor" : "Add New Vendor"}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ status: 'active' }}
        >
          <Form.Item
            name="name"
            label="Vendor Name"
            rules={[{ required: true, message: 'Please enter vendor name' }]}
          >
            <Input placeholder="e.g. ABC Distributors" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contactPerson" label="Contact Person">
                <Input placeholder="John Doe" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone Number">
                <Input placeholder="+250..." />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
            <Input placeholder="vendor@example.com" />
          </Form.Item>

          <Form.Item name="address" label="Address">
            <TextArea rows={2} placeholder="Office location..." />
          </Form.Item>

          {editingId && (
            <Form.Item name="status" label="Status">
              <Input.Group compact>
                <Button
                  type={form.getFieldValue('status') === 'active' ? 'primary' : 'default'}
                  onClick={() => form.setFieldsValue({ status: 'active' })}
                >
                  Active
                </Button>
                <Button
                  type={form.getFieldValue('status') === 'inactive' ? 'primary' : 'default'}
                  danger
                  onClick={() => form.setFieldsValue({ status: 'inactive' })}
                >
                  Inactive
                </Button>
              </Input.Group>
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Update Vendor' : 'Create Vendor'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VendorManagementPage;

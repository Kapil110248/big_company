import { useEffect, useState } from 'react';
import {
  Table,
  Space,
  Card,
  Typography,
  Descriptions,
  Button,
  Tag,
  Progress,
  Statistic,
  Row,
  Col,
  Spin,
  Alert,
  Modal,
  Form,
  InputNumber,
  Input,
  message,
} from 'antd';
import {
  ReloadOutlined,
  TeamOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { wholesalerApi } from '../../services/apiService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Retailer {
  id: string;
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  location: string;
  address: string;
  credit_limit: number;
  credit_used: number;
  credit_available: number;
  status: 'active' | 'inactive' | 'blocked' | 'pending';
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  on_time_payments: number;
  late_payments: number;
  last_order_date?: string;
  joined_at: string;
}

interface RetailerOrder {
  id: string;
  order_number: string;
  total: number;
  status: string;
  // Payment method: 'capital_wallet' (cash) or 'credit_wallet' (on credit)
  payment_type: 'capital_wallet' | 'credit_wallet' | string;
  payment_status: 'paid' | 'pending' | 'partial';
  items_count: number;
  created_at: string;
}

interface RetailerStats {
  total_retailers: number;
  active_retailers: number;
  new_this_month: number;
  total_credit_extended: number;
  total_credit_used: number;
  credit_utilization: number;
}

const RetailersPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [stats, setStats] = useState<RetailerStats | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Modals
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [recentOrders, setRecentOrders] = useState<RetailerOrder[]>([]);
  const [form] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRetailers = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await wholesalerApi.getRetailers({
        search: searchQuery || undefined,
        limit: pagination.pageSize,
        offset: (pagination.current - 1) * pagination.pageSize,
      });

      const data = response.data;
      setRetailers(data.retailers || []);
      setPagination(prev => ({ ...prev, total: data.total || 0 }));

      // Calculate stats from data
      const totalRetailers = data.total || 0;
      const activeCount = data.retailers?.filter((r: Retailer) => r.status === 'active').length || 0;
      setStats({
        total_retailers: totalRetailers,
        active_retailers: activeCount,
        new_this_month: data.new_this_month || 0,
        total_credit_extended: data.total_credit_extended || 0,
        total_credit_used: data.total_credit_used || 0,
        credit_utilization: data.credit_utilization || 0,
      });
    } catch (err: any) {
      console.error('Retailers error:', err);
      setError(err.response?.data?.error || 'Failed to load retailers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRetailers();
  }, [searchQuery, pagination.current, pagination.pageSize]);

  const getCreditStatus = (used: number, limit: number) => {
    if (limit === 0) return { color: 'default', text: 'No Credit', status: 'normal' as const };
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return { color: 'red', text: 'Critical', status: 'exception' as const };
    if (percentage >= 70) return { color: 'orange', text: 'High Usage', status: 'normal' as const };
    return { color: 'green', text: 'Good', status: 'success' as const };
  };

  const handleUpdateCreditLimit = async () => {
    if (!selectedRetailer) return;
    try {
      const values = await form.validateFields();
      setActionLoading(true);
      await wholesalerApi.updateRetailerCreditLimit(selectedRetailer.id, values.credit_limit);
      message.success('Credit limit updated successfully');
      setCreditModalOpen(false);
      setSelectedRetailer(null);
      form.resetFields();
      fetchRetailers(true);
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.error || 'Failed to update credit limit');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockRetailer = async () => {
    if (!selectedRetailer) return;
    try {
      const values = await form.validateFields();
      setActionLoading(true);
      await wholesalerApi.blockRetailer(selectedRetailer.id, values.reason);
      message.success('Retailer blocked successfully');
      setBlockModalOpen(false);
      setSelectedRetailer(null);
      form.resetFields();
      fetchRetailers(true);
    } catch (err: any) {
      if (err.errorFields) return;
      message.error(err.response?.data?.error || 'Failed to block retailer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockRetailer = async (retailer: Retailer) => {
    try {
      await wholesalerApi.unblockRetailer(retailer.id);
      message.success('Retailer unblocked successfully');
      fetchRetailers(true);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to unblock retailer');
    }
  };

  const viewRetailerDetails = async (retailer: Retailer) => {
    setSelectedRetailer(retailer);
    setDetailModalOpen(true);
    // Fetch retailer orders
    try {
      const [detailResponse, ordersResponse] = await Promise.all([
        wholesalerApi.getRetailer(retailer.id),
        wholesalerApi.getRetailerOrdersById(retailer.id, 10),
      ]);
      setSelectedRetailer(detailResponse.data);
      setRecentOrders(ordersResponse.data?.orders || []);
    } catch (err: any) {
      console.error('Failed to load retailer details:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const columns = [
    {
      title: 'Business Name',
      dataIndex: 'business_name',
      key: 'business_name',
      render: (value: string, record: Retailer) => (
        <div>
          <div><strong>{value}</strong></div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.owner_name}</Text>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Credit Usage',
      key: 'credit',
      render: (_: any, record: Retailer) => {
        if (record.credit_limit === 0) {
          return <Text type="secondary">No credit line</Text>;
        }
        const percentage = (record.credit_used / record.credit_limit) * 100;
        const status = getCreditStatus(record.credit_used, record.credit_limit);
        return (
          <div style={{ width: 180 }}>
            <Progress
              percent={Math.min(percentage, 100)}
              size="small"
              status={status.status}
              format={() => `${record.credit_used?.toLocaleString()} / ${record.credit_limit?.toLocaleString()}`}
            />
          </div>
        );
      },
    },
    {
      title: 'Orders',
      dataIndex: 'total_orders',
      key: 'total_orders',
      render: (value: number, record: Retailer) => (
        <div>
          <div>{value}</div>
          {record.pending_orders > 0 && (
            <Tag color="orange" style={{ fontSize: '10px' }}>{record.pending_orders} pending</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Revenue',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
      render: (value: number) => (
        <Text strong style={{ color: '#7c3aed' }}>
          {(value ?? 0) >= 1000000 ? `${((value ?? 0) / 1000000).toFixed(1)}M` : (value ?? 0).toLocaleString()} RWF
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => {
        const colors: Record<string, string> = {
          active: 'green',
          inactive: 'default',
          blocked: 'red',
          pending: 'orange',
        };
        return <Tag color={colors[value] || 'default'}>{value?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Retailer) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => viewRetailerDetails(record)}
          >
            View
          </Button>
          <Button
            size="small"
            onClick={() => {
              setSelectedRetailer(record);
              form.setFieldsValue({ credit_limit: record.credit_limit });
              setCreditModalOpen(true);
            }}
          >
            Credit
          </Button>
          {record.status === 'active' ? (
            <Button
              size="small"
              danger
              onClick={() => {
                setSelectedRetailer(record);
                form.resetFields();
                setBlockModalOpen(true);
              }}
            >
              Block
            </Button>
          ) : record.status === 'blocked' ? (
            <Button
              size="small"
              type="primary"
              ghost
              onClick={() => handleUnblockRetailer(record)}
            >
              Unblock
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={3} style={{ margin: 0 }}>Retailers</Title>
        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={() => fetchRetailers(true)}
          loading={refreshing}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: '24px' }}
        />
      )}

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total Retailers"
              value={stats?.total_retailers || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Active"
              value={stats?.active_retailers || 0}
              valueStyle={{ color: '#22c55e' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Credit Extended"
              value={stats?.total_credit_extended || 0}
              suffix="RWF"
              prefix={<DollarOutlined />}
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Credit Utilization"
              value={stats?.credit_utilization || 0}
              suffix="%"
              valueStyle={{ color: (stats?.credit_utilization || 0) > 70 ? '#f97316' : '#22c55e' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search/Filters */}
      <Card style={{ marginBottom: '16px' }}>
        <Space wrap>
          <Input.Search
            placeholder="Search retailers..."
            allowClear
            style={{ width: 200 }}
            onSearch={(value) => {
              setSearchQuery(value);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
          />
        </Space>
      </Card>

      {/* Retailers Table */}
      <Card>
        <Table
          dataSource={retailers}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1000 }}
          size="small"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} retailers`,
            size: 'small',
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }));
            },
          }}
        />
      </Card>

      {/* Credit Limit Modal */}
      <Modal
        title={`Adjust Credit Limit: ${selectedRetailer?.business_name}`}
        open={creditModalOpen}
        onCancel={() => {
          setCreditModalOpen(false);
          setSelectedRetailer(null);
          form.resetFields();
        }}
        onOk={handleUpdateCreditLimit}
        confirmLoading={actionLoading}
        okText="Update Credit Limit"
      >
        {selectedRetailer && (
          <div style={{ marginBottom: '16px' }}>
            <Text>Current Credit Used: <strong>{selectedRetailer.credit_used?.toLocaleString()} RWF</strong></Text>
            <br />
            <Text>Current Limit: <strong>{selectedRetailer.credit_limit?.toLocaleString()} RWF</strong></Text>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="credit_limit"
            label="New Credit Limit (RWF)"
            rules={[{ required: true, message: 'Enter credit limit' }]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Block Retailer Modal */}
      <Modal
        title={`Block Retailer: ${selectedRetailer?.business_name}`}
        open={blockModalOpen}
        onCancel={() => {
          setBlockModalOpen(false);
          setSelectedRetailer(null);
          form.resetFields();
        }}
        onOk={handleBlockRetailer}
        confirmLoading={actionLoading}
        okText="Block Retailer"
        okButtonProps={{ danger: true }}
      >
        <Alert
          message="Warning"
          description="Blocking this retailer will prevent them from placing new orders and using credit."
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Reason for Blocking"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <TextArea rows={4} placeholder="Enter the reason for blocking this retailer..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Retailer Detail Modal */}
      <Modal
        title={selectedRetailer?.business_name}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedRetailer(null);
          setRecentOrders([]);
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="credit"
            onClick={() => {
              setDetailModalOpen(false);
              form.setFieldsValue({ credit_limit: selectedRetailer?.credit_limit });
              setCreditModalOpen(true);
            }}
          >
            Adjust Credit
          </Button>,
          selectedRetailer?.status === 'active' ? (
            <Button
              key="block"
              danger
              onClick={() => {
                setDetailModalOpen(false);
                form.resetFields();
                setBlockModalOpen(true);
              }}
            >
              Block Retailer
            </Button>
          ) : selectedRetailer?.status === 'blocked' ? (
            <Button
              key="unblock"
              type="primary"
              onClick={() => {
                if (selectedRetailer) handleUnblockRetailer(selectedRetailer);
                setDetailModalOpen(false);
              }}
            >
              Unblock Retailer
            </Button>
          ) : null,
        ].filter(Boolean)}
      >
        {selectedRetailer && (
          <Row gutter={[16, 16]}>
            {/* Stats Row */}
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Orders"
                  value={selectedRetailer.total_orders}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#7c3aed' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Revenue"
                  value={selectedRetailer.total_revenue}
                  suffix="RWF"
                  formatter={(value) => value?.toLocaleString()}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Credit Limit"
                  value={selectedRetailer.credit_limit}
                  suffix="RWF"
                  formatter={(value) => value?.toLocaleString()}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small">
                <Statistic
                  title="Status"
                  value={selectedRetailer.status?.toUpperCase()}
                  valueStyle={{
                    color: selectedRetailer.status === 'active' ? '#22c55e' :
                           selectedRetailer.status === 'blocked' ? '#ef4444' : '#6b7280'
                  }}
                />
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" title="Business Details">
                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="Business Name">{selectedRetailer.business_name}</Descriptions.Item>
                  <Descriptions.Item label="Owner">{selectedRetailer.owner_name}</Descriptions.Item>
                  <Descriptions.Item label="Email">{selectedRetailer.email}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{selectedRetailer.phone}</Descriptions.Item>
                  <Descriptions.Item label="Location">{selectedRetailer.location}</Descriptions.Item>
                  <Descriptions.Item label="Address">{selectedRetailer.address}</Descriptions.Item>
                  <Descriptions.Item label="Member Since">{selectedRetailer.joined_at}</Descriptions.Item>
                  <Descriptions.Item label="Last Order">
                    {selectedRetailer.last_order_date || 'Never'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Col>

            <Col span={12}>
              <Card size="small" title="Credit Status">
                {selectedRetailer.credit_limit > 0 ? (
                  <>
                    <Progress
                      percent={Math.min((selectedRetailer.credit_used / selectedRetailer.credit_limit) * 100, 100)}
                      status={getCreditStatus(selectedRetailer.credit_used, selectedRetailer.credit_limit).status}
                    />
                    <Descriptions column={1} size="small" style={{ marginTop: 8 }}>
                      <Descriptions.Item label="Limit">
                        {selectedRetailer.credit_limit?.toLocaleString()} RWF
                      </Descriptions.Item>
                      <Descriptions.Item label="Used">
                        {selectedRetailer.credit_used?.toLocaleString()} RWF
                      </Descriptions.Item>
                      <Descriptions.Item label="Available">
                        <Text type="success">{selectedRetailer.credit_available?.toLocaleString()} RWF</Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </>
                ) : (
                  <Text type="secondary">No credit line assigned</Text>
                )}
              </Card>
            </Col>

            <Col span={12}>
              <Card size="small" title="Payment History">
                <div style={{ marginBottom: '8px' }}>
                  <Progress
                    percent={selectedRetailer.total_orders > 0
                      ? (selectedRetailer.on_time_payments / selectedRetailer.total_orders) * 100
                      : 0}
                    status={selectedRetailer.late_payments > 0 ? 'exception' : 'success'}
                  />
                </div>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="On Time"
                      value={selectedRetailer.on_time_payments}
                      valueStyle={{ color: '#22c55e', fontSize: '18px' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Late"
                      value={selectedRetailer.late_payments}
                      valueStyle={{ color: selectedRetailer.late_payments > 0 ? '#ef4444' : '#22c55e', fontSize: '18px' }}
                    />
                  </Col>
                </Row>
              </Card>
            </Col>

            {recentOrders.length > 0 && (
              <Col span={24}>
                <Card size="small" title="Order History - Payment Methods">
                  <Table
                    dataSource={recentOrders}
                    pagination={false}
                    size="small"
                    rowKey="id"
                    columns={[
                      {
                        title: 'Order #',
                        dataIndex: 'order_number',
                        key: 'order_number',
                        render: (v: string) => <Text code>{v}</Text>,
                      },
                      {
                        title: 'Items',
                        dataIndex: 'items_count',
                        key: 'items_count',
                      },
                      {
                        title: 'Total',
                        dataIndex: 'total',
                        key: 'total',
                        render: (value: number) => `${value?.toLocaleString()} RWF`,
                      },
                      {
                        title: 'Payment Method',
                        dataIndex: 'payment_type',
                        key: 'payment_type',
                        render: (value: string) => {
                          if (value === 'capital_wallet') {
                            return (
                              <Tag color="green" icon={<DollarOutlined />}>
                                Capital Wallet (Cash)
                              </Tag>
                            );
                          } else if (value === 'credit_wallet') {
                            return (
                              <Tag color="orange" icon={<DollarOutlined />}>
                                Credit Wallet (On Credit)
                              </Tag>
                            );
                          }
                          return <Tag>{value || 'Unknown'}</Tag>;
                        },
                      },
                      {
                        title: 'Payment Status',
                        dataIndex: 'payment_status',
                        key: 'payment_status',
                        render: (value: string) => {
                          const colors: Record<string, string> = {
                            paid: 'green',
                            pending: 'orange',
                            partial: 'blue',
                          };
                          return <Tag color={colors[value] || 'default'}>{(value || 'pending').toUpperCase()}</Tag>;
                        },
                      },
                      {
                        title: 'Order Status',
                        dataIndex: 'status',
                        key: 'status',
                        render: (value: string) => {
                          const colors: Record<string, string> = {
                            pending: 'orange',
                            confirmed: 'blue',
                            shipped: 'purple',
                            delivered: 'green',
                            cancelled: 'red',
                          };
                          return <Tag color={colors[value] || 'default'}>{value?.toUpperCase()}</Tag>;
                        },
                      },
                      {
                        title: 'Date',
                        dataIndex: 'created_at',
                        key: 'created_at',
                        render: (v: string) => formatDate(v),
                      },
                    ]}
                  />
                </Card>
              </Col>
            )}
          </Row>
        )}
      </Modal>
    </div>
  );
};

export default RetailersPage;

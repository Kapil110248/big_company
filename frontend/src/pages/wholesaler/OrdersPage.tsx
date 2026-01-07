import { useEffect, useState } from 'react';
import {
  Table,
  Space,
  Card,
  Typography,
  Descriptions,
  Button,
  Tag,
  Steps,
  Spin,
  Alert,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
  Statistic,
  Select,
} from 'antd';
import {
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { wholesalerApi } from '../../services/apiService';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface OrderItem {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface RetailerOrder {
  id: string;
  order_number: string;
  retailer_id: string;
  retailer_name: string;
  retailer_phone: string;
  retailer_location: string;
  total: number;
  subtotal: number;
  tax: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'rejected';
  payment_type: 'credit' | 'bank_transfer' | 'cash' | 'mobile_money';
  payment_status: 'pending' | 'partial' | 'paid';
  items_count: number;
  items: OrderItem[];
  tracking_number?: string;
  delivery_notes?: string;
  rejection_reason?: string;
  created_at: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

interface OrderStats {
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  total_revenue: number;
  today_orders: number;
  today_revenue: number;
}

const statusColors: Record<string, string> = {
  pending: 'orange',
  confirmed: 'blue',
  processing: 'cyan',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'default',
  rejected: 'red',
};

const paymentTypeColors: Record<string, string> = {
  credit: 'orange',
  bank_transfer: 'blue',
  cash: 'green',
  mobile_money: 'purple',
};

const OrdersPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<RetailerOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Action modals
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [shipModalOpen, setShipModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RetailerOrder | null>(null);
  const [form] = Form.useForm();
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [ordersResponse, statsResponse] = await Promise.all([
        wholesalerApi.getOrders({
          status: statusFilter || undefined,
          payment_type: paymentFilter || undefined,
          limit: pagination.pageSize,
          offset: (pagination.current - 1) * pagination.pageSize,
        }),
        wholesalerApi.getOrderStats(),
      ]);

      const ordersData = ordersResponse.data;
      const statsData = statsResponse.data;

      setOrders(ordersData.orders || []);
      setPagination(prev => ({ ...prev, total: ordersData.total || 0 }));
      setStats(statsData);
    } catch (err: any) {
      console.error('Orders error:', err);
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, paymentFilter, pagination.current, pagination.pageSize]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => fetchOrders(true), 30000);
    return () => clearInterval(interval);
  }, [statusFilter, paymentFilter]);

  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      await wholesalerApi.confirmOrder(selectedOrder.id);
      message.success(`Order ${selectedOrder.order_number} confirmed`);
      setConfirmModalOpen(false);
      setSelectedOrder(null);
      fetchOrders(true);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to confirm order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;
    const values = await form.validateFields();
    setActionLoading(true);
    try {
      await wholesalerApi.rejectOrder(selectedOrder.id, values.reason);
      message.success(`Order ${selectedOrder.order_number} rejected`);
      setRejectModalOpen(false);
      setSelectedOrder(null);
      form.resetFields();
      fetchOrders(true);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to reject order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleShipOrder = async () => {
    if (!selectedOrder) return;
    const values = await form.validateFields();
    setActionLoading(true);
    try {
      await wholesalerApi.shipOrder(selectedOrder.id, values.tracking_number, values.delivery_notes);
      message.success(`Order ${selectedOrder.order_number} marked as shipped`);
      setShipModalOpen(false);
      setSelectedOrder(null);
      form.resetFields();
      fetchOrders(true);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to ship order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliverOrder = async (order: RetailerOrder) => {
    try {
      await wholesalerApi.confirmDelivery(order.id);
      message.success(`Order ${order.order_number} delivered`);
      fetchOrders(true);
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Failed to confirm delivery');
    }
  };

  const viewOrderDetails = async (order: RetailerOrder) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
    // Fetch full order details
    try {
      const response = await wholesalerApi.getOrder(order.id);
      setSelectedOrder(response.data);
    } catch (err: any) {
      message.error('Failed to load order details');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'confirmed':
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      case 'rejected':
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const columns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (value: string) => <Text code strong>{value}</Text>,
    },
    {
      title: 'Retailer',
      key: 'retailer',
      render: (_: any, record: RetailerOrder) => (
        <div>
          <div><strong>{record.retailer_name}</strong></div>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.retailer_location}</Text>
        </div>
      ),
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
      render: (value: number) => (
        <Text strong style={{ color: '#7c3aed' }}>
          {value?.toLocaleString()} RWF
        </Text>
      ),
    },
    {
      title: 'Payment',
      dataIndex: 'payment_type',
      key: 'payment_type',
      render: (value: string) => (
        <Tag color={paymentTypeColors[value] || 'default'}>
          {value?.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: string) => (
        <Tag color={statusColors[value] || 'default'}>
          {value?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value: string) => formatDate(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RetailerOrder) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => viewOrderDetails(record)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setSelectedOrder(record);
                  setConfirmModalOpen(true);
                }}
              >
                Confirm
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setSelectedOrder(record);
                  setRejectModalOpen(true);
                }}
              >
                Reject
              </Button>
            </>
          )}
          {(record.status === 'confirmed' || record.status === 'processing') && (
            <Button
              type="primary"
              size="small"
              icon={<CarOutlined />}
              onClick={() => {
                setSelectedOrder(record);
                setShipModalOpen(true);
              }}
            >
              Ship
            </Button>
          )}
          {record.status === 'shipped' && (
            <Button
              type="primary"
              size="small"
              style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }}
              onClick={() => handleDeliverOrder(record)}
            >
              Delivered
            </Button>
          )}
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
        <Title level={3} style={{ margin: 0 }}>Retailer Orders</Title>
        <Button
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={() => fetchOrders(true)}
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
              title="Today's Orders"
              value={stats?.today_orders || 0}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Today's Revenue"
              value={stats?.today_revenue || 0}
              suffix="RWF"
              prefix={<DollarOutlined />}
              formatter={(value) => value?.toLocaleString()}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Pending"
              value={stats?.pending_orders || 0}
              valueStyle={{ color: '#f97316' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="In Transit"
              value={stats?.shipped_orders || 0}
              valueStyle={{ color: '#7c3aed' }}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '16px' }}>
        <Space wrap>
          <Select
            placeholder="Filter by Status"
            allowClear
            style={{ width: 150 }}
            value={statusFilter || undefined}
            onChange={(value) => {
              setStatusFilter(value || '');
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
          >
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="confirmed">Confirmed</Select.Option>
            <Select.Option value="processing">Processing</Select.Option>
            <Select.Option value="shipped">Shipped</Select.Option>
            <Select.Option value="delivered">Delivered</Select.Option>
            <Select.Option value="cancelled">Cancelled</Select.Option>
            <Select.Option value="rejected">Rejected</Select.Option>
          </Select>
          <Select
            placeholder="Filter by Payment"
            allowClear
            style={{ width: 150 }}
            value={paymentFilter || undefined}
            onChange={(value) => {
              setPaymentFilter(value || '');
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
          >
            <Select.Option value="credit">Credit</Select.Option>
            <Select.Option value="bank_transfer">Bank Transfer</Select.Option>
            <Select.Option value="cash">Cash</Select.Option>
            <Select.Option value="mobile_money">Mobile Money</Select.Option>
          </Select>
        </Space>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          scroll={{ x: 1000 }}
          size="small"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`,
            size: 'small',
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, current: page, pageSize }));
            },
          }}
        />
      </Card>

      {/* Confirm Modal */}
      <Modal
        title={`Confirm Order ${selectedOrder?.order_number}`}
        open={confirmModalOpen}
        onCancel={() => {
          setConfirmModalOpen(false);
          setSelectedOrder(null);
        }}
        onOk={handleConfirmOrder}
        confirmLoading={actionLoading}
        okText="Confirm Order"
      >
        <p>Are you sure you want to confirm this order?</p>
        {selectedOrder && (
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Retailer">{selectedOrder.retailer_name}</Descriptions.Item>
            <Descriptions.Item label="Items">{selectedOrder.items_count}</Descriptions.Item>
            <Descriptions.Item label="Total">{selectedOrder.total?.toLocaleString()} RWF</Descriptions.Item>
            <Descriptions.Item label="Payment">
              <Tag color={paymentTypeColors[selectedOrder.payment_type]}>
                {selectedOrder.payment_type?.replace('_', ' ').toUpperCase()}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title={`Reject Order ${selectedOrder?.order_number}`}
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setSelectedOrder(null);
          form.resetFields();
        }}
        onOk={handleRejectOrder}
        confirmLoading={actionLoading}
        okText="Reject Order"
        okButtonProps={{ danger: true }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Rejection Reason"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <TextArea rows={4} placeholder="Enter the reason for rejecting this order..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Ship Modal */}
      <Modal
        title={`Ship Order ${selectedOrder?.order_number}`}
        open={shipModalOpen}
        onCancel={() => {
          setShipModalOpen(false);
          setSelectedOrder(null);
          form.resetFields();
        }}
        onOk={handleShipOrder}
        confirmLoading={actionLoading}
        okText="Mark as Shipped"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="tracking_number"
            label="Tracking Number"
          >
            <Input placeholder="Optional tracking number..." />
          </Form.Item>
          <Form.Item
            name="delivery_notes"
            label="Delivery Notes"
          >
            <TextArea rows={3} placeholder="Any delivery instructions or notes..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Order Detail Modal */}
      <Modal
        title={`Order #${selectedOrder?.order_number}`}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedOrder(null);
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>,
          selectedOrder?.status === 'pending' && (
            <Button
              key="confirm"
              type="primary"
              onClick={() => {
                setDetailModalOpen(false);
                setConfirmModalOpen(true);
              }}
            >
              Confirm Order
            </Button>
          ),
          (selectedOrder?.status === 'confirmed' || selectedOrder?.status === 'processing') && (
            <Button
              key="ship"
              type="primary"
              onClick={() => {
                setDetailModalOpen(false);
                setShipModalOpen(true);
              }}
            >
              Ship Order
            </Button>
          ),
          selectedOrder?.status === 'shipped' && (
            <Button
              key="deliver"
              type="primary"
              style={{ backgroundColor: '#22c55e', borderColor: '#22c55e' }}
              onClick={() => {
                if (selectedOrder) handleDeliverOrder(selectedOrder);
                setDetailModalOpen(false);
              }}
            >
              Confirm Delivery
            </Button>
          ),
        ].filter(Boolean)}
      >
        {selectedOrder && (
          <>
            {selectedOrder.status !== 'rejected' && selectedOrder.status !== 'cancelled' && (
              <Steps
                current={getStatusStep(selectedOrder.status)}
                style={{ marginBottom: '24px' }}
                items={[
                  { title: 'Pending', icon: <ClockCircleOutlined /> },
                  { title: 'Processing', icon: <ShoppingCartOutlined /> },
                  { title: 'Shipped', icon: <CarOutlined /> },
                  { title: 'Delivered', icon: <CheckCircleOutlined /> },
                ]}
              />
            )}

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card size="small" title="Order Details">
                  <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                    <Descriptions.Item label="Order Number">
                      <Text code>{selectedOrder.order_number}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={statusColors[selectedOrder.status]}>{selectedOrder.status?.toUpperCase()}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Retailer">{selectedOrder.retailer_name}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{selectedOrder.retailer_phone}</Descriptions.Item>
                    <Descriptions.Item label="Location">{selectedOrder.retailer_location}</Descriptions.Item>
                    <Descriptions.Item label="Payment Type">
                      <Tag color={paymentTypeColors[selectedOrder.payment_type]}>
                        {selectedOrder.payment_type?.replace('_', ' ').toUpperCase()}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Payment Status">
                      <Tag color={selectedOrder.payment_status === 'paid' ? 'green' : selectedOrder.payment_status === 'partial' ? 'orange' : 'default'}>
                        {selectedOrder.payment_status?.toUpperCase()}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Order Date">
                      {formatDate(selectedOrder.created_at)}
                    </Descriptions.Item>
                    {selectedOrder.tracking_number && (
                      <Descriptions.Item label="Tracking #">{selectedOrder.tracking_number}</Descriptions.Item>
                    )}
                    {selectedOrder.delivery_notes && (
                      <Descriptions.Item label="Delivery Notes">{selectedOrder.delivery_notes}</Descriptions.Item>
                    )}
                    {selectedOrder.rejection_reason && (
                      <Descriptions.Item label="Rejection Reason">
                        <Text type="danger">{selectedOrder.rejection_reason}</Text>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Card>
              </Col>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <Col span={24}>
                  <Card size="small" title="Order Items">
                    <Table
                      dataSource={selectedOrder.items}
                      pagination={false}
                      rowKey="id"
                      size="small"
                      columns={[
                        {
                          title: 'SKU',
                          dataIndex: 'sku',
                          key: 'sku',
                          render: (v: string) => <code>{v}</code>
                        },
                        { title: 'Product', dataIndex: 'name', key: 'name' },
                        { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
                        {
                          title: 'Unit Price',
                          dataIndex: 'unit_price',
                          key: 'unit_price',
                          render: (value: number) => `${value?.toLocaleString()} RWF`,
                        },
                        {
                          title: 'Total',
                          dataIndex: 'total',
                          key: 'total',
                          render: (value: number) => (
                            <Text strong>{value?.toLocaleString()} RWF</Text>
                          ),
                        },
                      ]}
                      summary={() => (
                        <>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4} align="right">
                              <strong>Subtotal</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                              <Text>{selectedOrder.subtotal?.toLocaleString()} RWF</Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4} align="right">
                              <strong>Tax</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                              <Text>{selectedOrder.tax?.toLocaleString()} RWF</Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                          <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4} align="right">
                              <strong>Order Total</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                              <Text strong style={{ color: '#7c3aed', fontSize: '16px' }}>
                                {selectedOrder.total?.toLocaleString()} RWF
                              </Text>
                            </Table.Summary.Cell>
                          </Table.Summary.Row>
                        </>
                      )}
                    />
                  </Card>
                </Col>
              )}

              <Col span={24}>
                <Card size="small" title="Timeline">
                  <Space direction="vertical">
                    <div>
                      <Text type="secondary">Created: </Text>
                      <Text>{formatDate(selectedOrder.created_at)}</Text>
                    </div>
                    {selectedOrder.confirmed_at && (
                      <div>
                        <Text type="secondary">Confirmed: </Text>
                        <Text>{formatDate(selectedOrder.confirmed_at)}</Text>
                      </div>
                    )}
                    {selectedOrder.shipped_at && (
                      <div>
                        <Text type="secondary">Shipped: </Text>
                        <Text>{formatDate(selectedOrder.shipped_at)}</Text>
                      </div>
                    )}
                    {selectedOrder.delivered_at && (
                      <div>
                        <Text type="secondary">Delivered: </Text>
                        <Text>{formatDate(selectedOrder.delivered_at)}</Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;

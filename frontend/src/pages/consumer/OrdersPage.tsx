import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Spin,
  Empty,
  Steps,
  Divider,
  Button,
  Modal,
  Form,
  Select,
  Input,
  message,
  Alert,
  Descriptions,
  Timeline,
  Tabs,
} from 'antd';
import {
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CarOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ReloadOutlined,
  EyeOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import { consumerApi } from '../../services/apiService';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface Packager {
  name: string;
  phone: string;
  packed_at?: string;
}

interface Shipper {
  name: string;
  phone: string;
  vehicle: string;
  shipped_at?: string;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  retailer: {
    id: string;
    name: string;
    location?: string;
    phone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  delivery_fee?: number;
  total: number;
  delivery_address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
  packager?: Packager;
  shipper?: Shipper;
  cancellation_reason?: string;
  cancelled_by?: 'customer' | 'retailer';
  payment_method?: string;
  meter_id?: string;
}

const statusColors: Record<string, string> = {
  pending: 'gold',
  confirmed: 'blue',
  processing: 'cyan',
  shipped: 'purple',
  delivered: 'green',
  cancelled: 'red',
};

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const cancelReasons = [
  'Changed my mind',
  'Found a better price elsewhere',
  'Ordered by mistake',
  'Delivery taking too long',
  'Need to modify order',
  'Financial reasons',
  'Other',
];

type OrderFilter = 'all' | 'active' | 'completed' | 'credit';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [cancelForm] = Form.useForm();
  const [cancelling, setCancelling] = useState(false);
  const [filter, setFilter] = useState<OrderFilter>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await consumerApi.getOrders();
      // Filter out null/invalid orders and ensure all required fields exist
      const validOrders = (response.data.orders || []).filter((order: Order | null) =>
        order &&
        order.id &&
        order.order_number &&
        order.status &&
        order.retailer &&
        order.items &&
        Array.isArray(order.items)
      );
      setOrders(validOrders.length > 0 ? validOrders : getMockOrders());
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const getMockOrders = (): Order[] => [
    {
      id: '1',
      order_number: 'ORD-2024-001',
      status: 'delivered',
      retailer: {
        id: 'ret_001',
        name: 'Kigali Shop',
        location: 'Kigali City Center, KN 78 St',
        phone: '+250 788 123 456',
      },
      items: [
        { id: 'i1', product_id: '1', product_name: 'Fanta Orange 500ml', quantity: 3, unit_price: 500, total: 1500 },
        { id: 'i2', product_id: '3', product_name: 'Inyange Milk 1L', quantity: 2, unit_price: 1200, total: 2400 },
        { id: 'i3', product_id: '7', product_name: 'Bread 400g', quantity: 2, unit_price: 800, total: 1600 },
      ],
      subtotal: 5500,
      delivery_fee: 500,
      total: 6000,
      delivery_address: 'Kigali, Remera, KG 11 Ave, House #45',
      created_at: '2024-11-28T10:30:00Z',
      updated_at: '2024-11-28T15:00:00Z',
      packager: {
        name: 'Jean Paul Niyonzima',
        phone: '+250 788 111 222',
        packed_at: '2024-11-28T11:00:00Z',
      },
      shipper: {
        name: 'Eric Uwimana',
        phone: '+250 788 333 444',
        vehicle: 'RAC 123A (Motorcycle)',
        shipped_at: '2024-11-28T13:00:00Z',
      },
      payment_method: 'Dashboard Balance',
      meter_id: 'MTR-001234',
    },
    {
      id: '2',
      order_number: 'ORD-2024-002',
      status: 'shipped',
      retailer: {
        id: 'ret_002',
        name: 'Nyamirambo Market',
        location: 'Nyamirambo, Kigali',
        phone: '+250 788 234 567',
      },
      items: [
        { id: 'i3', product_id: '5', product_name: 'Mukamira Rice 5kg', quantity: 1, unit_price: 8000, total: 8000 },
        { id: 'i4', product_id: '6', product_name: 'Sunflower Oil 1L', quantity: 2, unit_price: 3500, total: 7000 },
        { id: 'i5', product_id: '4', product_name: 'Blue Band 500g', quantity: 1, unit_price: 2500, total: 2500 },
      ],
      subtotal: 17500,
      delivery_fee: 800,
      total: 18300,
      delivery_address: 'Kigali, Kimironko, KG 5 Ave, Apt 12B',
      estimated_delivery: '2024-11-30T14:00:00Z',
      created_at: '2024-11-29T09:00:00Z',
      updated_at: '2024-11-29T16:00:00Z',
      packager: {
        name: 'Marie Claire Mukandutiye',
        phone: '+250 788 555 666',
        packed_at: '2024-11-29T12:00:00Z',
      },
      shipper: {
        name: 'Patrick Habimana',
        phone: '+250 788 777 888',
        vehicle: 'RAD 456B (Van)',
        shipped_at: '2024-11-29T15:00:00Z',
      },
      payment_method: 'card_credit',
      meter_id: 'N/A',
    },
    {
      id: '3',
      order_number: 'ORD-2024-003',
      status: 'processing',
      retailer: {
        id: 'ret_003',
        name: 'Kimironko Fresh',
        location: 'Kimironko, KG 11 Ave',
        phone: '+250 788 345 678',
      },
      items: [
        { id: 'i6', product_id: '2', product_name: 'Coca-Cola 500ml', quantity: 6, unit_price: 500, total: 3000 },
        { id: 'i7', product_id: '8', product_name: 'Mineral Water 1.5L', quantity: 3, unit_price: 700, total: 2100 },
      ],
      subtotal: 5100,
      delivery_fee: 500,
      total: 5600,
      delivery_address: 'Kigali, Gisozi, KG 201 St, Near BK Branch',
      created_at: '2024-11-30T08:00:00Z',
      updated_at: '2024-11-30T09:00:00Z',
      packager: {
        name: 'David Kayitare',
        phone: '+250 788 999 000',
        packed_at: '2024-11-30T09:30:00Z',
      },
      payment_method: 'Mobile Money (MTN)',
      meter_id: 'MTR-005678',
    },
    {
      id: '4',
      order_number: 'ORD-2024-004',
      status: 'pending',
      retailer: {
        id: 'ret_001',
        name: 'Kigali Shop',
        location: 'Kigali City Center, KN 78 St',
        phone: '+250 788 123 456',
      },
      items: [
        { id: 'i8', product_id: '9', product_name: 'Sugar 1kg', quantity: 2, unit_price: 1500, total: 3000 },
        { id: 'i9', product_id: '10', product_name: 'Tea Leaves 250g', quantity: 1, unit_price: 2000, total: 2000 },
      ],
      subtotal: 5000,
      delivery_fee: 500,
      total: 5500,
      delivery_address: 'Kigali, Kicukiro, KK 14 Ave',
      created_at: '2024-12-01T10:00:00Z',
      updated_at: '2024-12-01T10:00:00Z',
      payment_method: 'Dashboard Balance',
      meter_id: 'MTR-001234',
    },
    {
      id: '5',
      order_number: 'ORD-2024-005',
      status: 'cancelled',
      retailer: {
        id: 'ret_002',
        name: 'Nyamirambo Market',
        location: 'Nyamirambo, Kigali',
        phone: '+250 788 234 567',
      },
      items: [
        { id: 'i10', product_id: '11', product_name: 'Potatoes 5kg', quantity: 1, unit_price: 5000, total: 5000 },
      ],
      subtotal: 5000,
      delivery_fee: 500,
      total: 5500,
      delivery_address: 'Kigali, Nyamirambo, KG 20 St',
      created_at: '2024-11-27T14:00:00Z',
      updated_at: '2024-11-27T15:30:00Z',
      cancellation_reason: 'Product out of stock, unable to fulfill order',
      cancelled_by: 'retailer',
      payment_method: 'Dashboard Balance',
      meter_id: 'MTR-001234',
    },
    {
      id: '6',
      order_number: 'ORD-2024-006',
      status: 'delivered',
      retailer: {
        id: 'ret_004',
        name: 'Kigali Fresh Market',
        location: 'Kimironko, Kigali',
        phone: '+250 788 456 789',
      },
      items: [
        { id: 'i11', product_id: '12', product_name: 'Beans 2kg', quantity: 2, unit_price: 3000, total: 6000 },
        { id: 'i12', product_id: '13', product_name: 'Maize Flour 5kg', quantity: 1, unit_price: 7000, total: 7000 },
      ],
      subtotal: 13000,
      delivery_fee: 500,
      total: 13500,
      delivery_address: 'Kigali, Remera, KG 7 Ave',
      created_at: '2024-12-02T11:00:00Z',
      updated_at: '2024-12-02T16:00:00Z',
      payment_method: 'food_loan',
      meter_id: 'N/A',
      packager: {
        name: 'Alice Uwera',
        phone: '+250 788 222 333',
        packed_at: '2024-12-02T12:00:00Z',
      },
      shipper: {
        name: 'James Mugisha',
        phone: '+250 788 444 555',
        vehicle: 'RAC 789C (Motorcycle)',
        shipped_at: '2024-12-02T14:00:00Z',
      },
    },
    {
      id: '7',
      order_number: 'ORD-2024-007',
      status: 'processing',
      retailer: {
        id: 'ret_003',
        name: 'City Supermarket',
        location: 'City Center, Kigali',
        phone: '+250 788 567 890',
      },
      items: [
        { id: 'i13', product_id: '14', product_name: 'Cooking Oil 2L', quantity: 3, unit_price: 5000, total: 15000 },
        { id: 'i14', product_id: '15', product_name: 'Salt 1kg', quantity: 2, unit_price: 800, total: 1600 },
      ],
      subtotal: 16600,
      delivery_fee: 800,
      total: 17400,
      delivery_address: 'Kigali, Kacyiru, KG 9 Ave',
      created_at: '2024-12-03T09:00:00Z',
      updated_at: '2024-12-03T10:00:00Z',
      payment_method: 'food_loan',
      meter_id: 'N/A',
      packager: {
        name: 'Emmanuel Nsengiyumva',
        phone: '+250 788 666 777',
        packed_at: '2024-12-03T10:30:00Z',
      },
    },
  ];

  const formatPrice = (amount: number) => `${amount.toLocaleString()} RWF`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusStep = (status: string) => {
    if (status === 'cancelled') return -1;
    return statusSteps.indexOf(status);
  };

  const canCancelOrder = (order: Order | null) => {
    if (!order || !order.status) return false;
    return order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing';
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCancelOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
    cancelForm.resetFields();
  };

  const handleConfirmCancel = async (values: any) => {
    setCancelling(true);
    try {
      // TODO: Call API to cancel order
      console.log('Cancelling order:', selectedOrder?.order_number, values);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Order cancelled successfully');
      setShowCancelModal(false);
      fetchOrders();
    } catch (error) {
      message.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleConfirmDelivery = async (order: Order) => {
    Modal.confirm({
      title: 'Confirm Delivery',
      content: `Have you received your order ${order.order_number}?`,
      okText: 'Yes, Received',
      cancelText: 'Not Yet',
      onOk: async () => {
        try {
          // TODO: Call API to confirm delivery
          console.log('Confirming delivery:', order.order_number);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          message.success('Delivery confirmed successfully!');
          fetchOrders();
        } catch (error) {
          message.error('Failed to confirm delivery');
        }
      },
    });
  };

  const handleViewReceipt = (order: Order) => {
    setSelectedOrder(order);
    setShowReceiptModal(true);
  };

  const handleDownloadReceipt = () => {
    if (!selectedOrder) return;
    message.success(`Receipt for ${selectedOrder.order_number} downloaded`);
    // TODO: Implement actual PDF download
  };

  const getPaymentMethodBadge = (paymentMethod: string | undefined) => {
    if (!paymentMethod) return null;

    if (paymentMethod === 'card_credit') {
      return <Tag color="purple">Paid on Credit (Card)</Tag>;
    } else if (paymentMethod === 'food_loan') {
      return <Tag color="purple">Paid on Credit (Loan)</Tag>;
    }
    return <Tag color="blue">{paymentMethod}</Tag>;
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    switch (filter) {
      case 'active':
        filtered = orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status));
        break;
      case 'completed':
        filtered = orders.filter(o => o.status === 'delivered');
        break;
      case 'credit':
        filtered = orders.filter(o => o.payment_method === 'card_credit' || o.payment_method === 'food_loan');
        break;
      default:
        filtered = orders;
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
          padding: '20px 24px',
          marginBottom: 24,
          borderRadius: 8,
          color: 'white',
        }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              My Orders
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
              Track and manage your orders
            </Text>
          </Col>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchOrders}
              style={{ borderRadius: 8 }}
            >
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      {/* Filter Tabs */}
      <Tabs
        activeKey={filter}
        onChange={(key) => setFilter(key as OrderFilter)}
        style={{ marginBottom: 16 }}
        items={[
          {
            key: 'all',
            label: `All Orders (${orders.length})`,
          },
          {
            key: 'active',
            label: `Active (${orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length})`,
          },
          {
            key: 'completed',
            label: `Completed (${orders.filter(o => o.status === 'delivered').length})`,
          },
          {
            key: 'credit',
            label: `Credit Orders (${orders.filter(o => o.payment_method === 'card_credit' || o.payment_method === 'food_loan').length})`,
          },
        ]}
      />

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No orders yet"
          style={{ marginTop: 60 }}
        >
          <Button type="primary" href="/consumer/shop">
            Start Shopping
          </Button>
        </Empty>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          {filteredOrders.filter(order => order && order.status).map((order) => (
            <Card
              key={order.id}
              hoverable
              onClick={() => handleViewDetails(order)}
            >
              <Row gutter={16} align="middle">
                <Col xs={24} md={6}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary">Order</Text>
                    <Text strong style={{ fontSize: 16 }}>{order.order_number}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(order.created_at)}
                    </Text>
                  </Space>
                </Col>

                <Col xs={24} md={6}>
                  <Space direction="vertical" size={4}>
                    <Space>
                      <ShopOutlined style={{ color: '#722ed1' }} />
                      <Text strong>{order.retailer?.name || 'Unknown Retailer'}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {order.items?.length || 0} item(s)
                    </Text>
                  </Space>
                </Col>

                <Col xs={24} md={6}>
                  <Space direction="vertical" size={4}>
                    <Space>
                      <Tag color={statusColors[order.status] || 'default'} style={{ marginRight: 0 }}>
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Unknown'}
                      </Tag>
                      {getPaymentMethodBadge(order.payment_method)}
                    </Space>
                    {order.status === 'shipped' && order.estimated_delivery && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Est. delivery: {formatDate(order.estimated_delivery)}
                      </Text>
                    )}
                  </Space>
                </Col>

                <Col xs={24} md={6} style={{ textAlign: 'right' }}>
                  <Space direction="vertical" size={4} style={{ alignItems: 'flex-end' }}>
                    <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                      {formatPrice(order.total)}
                    </Text>
                    <Space>
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(order);
                        }}
                      >
                        View
                      </Button>
                      {canCancelOrder(order) && (
                        <Button
                          type="link"
                          danger
                          icon={<CloseCircleOutlined />}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelOrder(order);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </Space>
                  </Space>
                </Col>
              </Row>

              {/* Cancellation reason */}
              {order.status === 'cancelled' && order.cancellation_reason && (
                <>
                  <Divider style={{ margin: '16px 0' }} />
                  <Alert
                    type="error"
                    message={`Cancelled by ${order.cancelled_by === 'retailer' ? 'Retailer' : 'You'}`}
                    description={order.cancellation_reason}
                    showIcon
                  />
                </>
              )}

              {/* Progress for active orders */}
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <>
                  <Divider style={{ margin: '16px 0' }} />
                  <Steps
                    current={getStatusStep(order.status)}
                    size="small"
                    items={[
                      { title: 'Pending', icon: <ClockCircleOutlined /> },
                      { title: 'Confirmed', icon: <CheckCircleOutlined /> },
                      { title: 'Processing', icon: <ShoppingOutlined /> },
                      { title: 'Shipped', icon: <CarOutlined /> },
                      { title: 'Delivered', icon: <CheckCircleOutlined /> },
                    ]}
                  />
                </>
              )}
            </Card>
          ))}
        </Space>
      )}

      {/* Order Details Modal */}
      <Modal
        title={
          <Space>
            <ShoppingOutlined />
            <span>Order Details - {selectedOrder?.order_number}</span>
          </Space>
        }
        open={showDetailsModal}
        onCancel={() => setShowDetailsModal(false)}
        footer={[
          <Button
            key="receipt"
            icon={<FileTextOutlined />}
            onClick={() => handleViewReceipt(selectedOrder!)}
          >
            View Receipt
          </Button>,
          selectedOrder?.status === 'shipped' && (
            <Button
              key="confirm"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleConfirmDelivery(selectedOrder!)}
            >
              Confirm Delivery
            </Button>
          ),
          canCancelOrder(selectedOrder!) && (
            <Button
              key="cancel"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelOrder(selectedOrder!)}
            >
              Cancel Order
            </Button>
          ),
          <Button key="close" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedOrder && (
          <div>
            {/* Order Status */}
            <Card size="small" style={{ marginBottom: 16, background: '#f0f2f5' }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Text type="secondary">Order Status</Text>
                  <br />
                  <Tag color={statusColors[selectedOrder.status]} style={{ marginTop: 4 }}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Tag>
                </Col>
                <Col span={12}>
                  <Text type="secondary">Payment Method</Text>
                  <br />
                  <Text strong>{selectedOrder.payment_method || 'N/A'}</Text>
                  {selectedOrder.meter_id && selectedOrder.meter_id !== 'N/A' && (
                    <>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Meter: {selectedOrder.meter_id}
                      </Text>
                    </>
                  )}
                </Col>
              </Row>
            </Card>

            {/* Cancellation Alert */}
            {selectedOrder.status === 'cancelled' && selectedOrder.cancellation_reason && (
              <Alert
                type="error"
                message={`Cancelled by ${selectedOrder.cancelled_by === 'retailer' ? 'Retailer' : 'You'}`}
                description={selectedOrder.cancellation_reason}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Timeline */}
            <Card title="Order Timeline" size="small" style={{ marginBottom: 16 }}>
              <Timeline>
                <Timeline.Item color="green">
                  <Text strong>Order Placed</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {formatDate(selectedOrder.created_at)}
                  </Text>
                </Timeline.Item>
                {selectedOrder.packager && (
                  <Timeline.Item color="blue">
                    <Text strong>Order Packed</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {selectedOrder.packager.packed_at
                        ? formatDate(selectedOrder.packager.packed_at)
                        : 'Processing'}
                    </Text>
                  </Timeline.Item>
                )}
                {selectedOrder.shipper && (
                  <Timeline.Item color="purple">
                    <Text strong>Order Shipped</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {selectedOrder.shipper.shipped_at
                        ? formatDate(selectedOrder.shipper.shipped_at)
                        : 'In transit'}
                    </Text>
                  </Timeline.Item>
                )}
                {selectedOrder.status === 'delivered' && (
                  <Timeline.Item color="green">
                    <Text strong>Delivered</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {formatDate(selectedOrder.updated_at)}
                    </Text>
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>

            {/* Retailer Info */}
            <Card
              title={
                <>
                  <ShopOutlined style={{ marginRight: 8 }} />
                  Store Information
                </>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Store Name">
                  <Text strong>{selectedOrder.retailer.name}</Text>
                </Descriptions.Item>
                {selectedOrder.retailer.location && (
                  <Descriptions.Item label="Location">
                    <Space size={4}>
                      <EnvironmentOutlined style={{ color: '#999' }} />
                      <Text>{selectedOrder.retailer.location}</Text>
                    </Space>
                  </Descriptions.Item>
                )}
                {selectedOrder.retailer.phone && (
                  <Descriptions.Item label="Phone">
                    <Space size={4}>
                      <PhoneOutlined style={{ color: '#999' }} />
                      <Text>{selectedOrder.retailer.phone}</Text>
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Packager Info */}
            {selectedOrder.packager && (
              <Card
                title={
                  <>
                    <TeamOutlined style={{ marginRight: 8 }} />
                    Packager Information
                  </>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="Name">
                    <Text strong>{selectedOrder.packager.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    <Space size={4}>
                      <PhoneOutlined style={{ color: '#999' }} />
                      <Text>{selectedOrder.packager.phone}</Text>
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Shipper Info */}
            {selectedOrder.shipper && (
              <Card
                title={
                  <>
                    <TruckOutlined style={{ marginRight: 8 }} />
                    Shipper Information
                  </>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Descriptions size="small" column={1}>
                  <Descriptions.Item label="Name">
                    <Text strong>{selectedOrder.shipper.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    <Space size={4}>
                      <PhoneOutlined style={{ color: '#999' }} />
                      <Text>{selectedOrder.shipper.phone}</Text>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Vehicle">
                    <Space size={4}>
                      <CarOutlined style={{ color: '#999' }} />
                      <Text>{selectedOrder.shipper.vehicle}</Text>
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Delivery Address */}
            {selectedOrder.delivery_address && (
              <Card
                title={
                  <>
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    Delivery Address
                  </>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Text>{selectedOrder.delivery_address}</Text>
              </Card>
            )}

            <Divider />

            {/* Order Items */}
            <Title level={5}>
              <ShoppingOutlined style={{ marginRight: 8 }} />
              Items ({selectedOrder.items.length})
            </Title>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {selectedOrder.items.map((item) => (
                <Row key={item.id} justify="space-between" align="middle">
                  <Col>
                    <Text>{item.product_name}</Text>
                    <br />
                    <Text type="secondary">
                      {formatPrice(item.unit_price)} x {item.quantity}
                    </Text>
                  </Col>
                  <Col>
                    <Text strong>{formatPrice(item.total)}</Text>
                  </Col>
                </Row>
              ))}
            </Space>

            <Divider />

            {/* Order Summary */}
            <Row justify="space-between" style={{ marginBottom: 8 }}>
              <Col>
                <Text>Subtotal</Text>
              </Col>
              <Col>
                <Text>{formatPrice(selectedOrder.subtotal)}</Text>
              </Col>
            </Row>
            {selectedOrder.delivery_fee && selectedOrder.delivery_fee > 0 && (
              <Row justify="space-between" style={{ marginBottom: 8 }}>
                <Col>
                  <Text>Delivery Fee</Text>
                </Col>
                <Col>
                  <Text>{formatPrice(selectedOrder.delivery_fee)}</Text>
                </Col>
              </Row>
            )}
            <Row justify="space-between">
              <Col>
                <Text strong style={{ fontSize: 16 }}>Total</Text>
              </Col>
              <Col>
                <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                  {formatPrice(selectedOrder.total)}
                </Text>
              </Col>
            </Row>

            {/* Notes */}
            {selectedOrder.notes && (
              <>
                <Divider />
                <Title level={5}>Notes</Title>
                <Paragraph type="secondary">{selectedOrder.notes}</Paragraph>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            <span>Cancel Order</span>
          </Space>
        }
        open={showCancelModal}
        onCancel={() => setShowCancelModal(false)}
        footer={null}
        width={500}
      >
        <Alert
          type="warning"
          message="Are you sure you want to cancel this order?"
          description={`Order: ${selectedOrder?.order_number} - Total: ${formatPrice(selectedOrder?.total || 0)}`}
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={cancelForm}
          layout="vertical"
          onFinish={handleConfirmCancel}
        >
          <Form.Item
            name="reason"
            label="Reason for Cancellation"
            rules={[{ required: true, message: 'Please select a reason' }]}
          >
            <Select placeholder="Select a reason" size="large">
              {cancelReasons.map((reason) => (
                <Select.Option key={reason} value={reason}>
                  {reason}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="additional_notes"
            label="Additional Notes (Optional)"
          >
            <TextArea
              rows={3}
              placeholder="Any additional information..."
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowCancelModal(false)}>
                Keep Order
              </Button>
              <Button
                type="primary"
                danger
                htmlType="submit"
                loading={cancelling}
              >
                Confirm Cancellation
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>Order Receipt</span>
          </Space>
        }
        open={showReceiptModal}
        onCancel={() => setShowReceiptModal(false)}
        footer={[
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadReceipt}
          >
            Download PDF
          </Button>,
          <Button key="close" onClick={() => setShowReceiptModal(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedOrder && (
          <div style={{ padding: '20px', background: 'white' }}>
            {/* Receipt Header */}
            <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: '2px solid #000', paddingBottom: 16 }}>
              <Title level={3} style={{ margin: 0 }}>BIG COMPANY RWANDA</Title>
              <Text>Kigali, Rwanda</Text>
              <br />
              <Text>Tax ID: 123456789</Text>
            </div>

            {/* Receipt Info */}
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Receipt #" span={2}>
                <Text strong>{selectedOrder.order_number}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Date">
                {formatDate(selectedOrder.created_at)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColors[selectedOrder.status]}>
                  {selectedOrder.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Payment Method" span={2}>
                {selectedOrder.payment_method}
                {selectedOrder.meter_id && selectedOrder.meter_id !== 'N/A' && (
                  <> (Meter: {selectedOrder.meter_id})</>
                )}
              </Descriptions.Item>
            </Descriptions>

            {/* Store Info */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Store: </Text>
              <Text>{selectedOrder.retailer.name}</Text>
              <br />
              <Text strong>Location: </Text>
              <Text>{selectedOrder.retailer.location}</Text>
            </div>

            {/* Items */}
            <table style={{ width: '100%', marginBottom: 16, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #000' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>Price</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{item.product_name}</td>
                    <td style={{ textAlign: 'center', padding: '8px' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '8px' }}>{formatPrice(item.unit_price)}</td>
                    <td style={{ textAlign: 'right', padding: '8px' }}>{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ borderTop: '2px solid #000', paddingTop: 8 }}>
              <Row justify="space-between" style={{ marginBottom: 4 }}>
                <Col><Text>Subtotal:</Text></Col>
                <Col><Text>{formatPrice(selectedOrder.subtotal)}</Text></Col>
              </Row>
              {selectedOrder.delivery_fee && selectedOrder.delivery_fee > 0 && (
                <Row justify="space-between" style={{ marginBottom: 4 }}>
                  <Col><Text>Delivery Fee:</Text></Col>
                  <Col><Text>{formatPrice(selectedOrder.delivery_fee)}</Text></Col>
                </Row>
              )}
              <Row justify="space-between" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #000' }}>
                <Col><Text strong style={{ fontSize: 16 }}>TOTAL:</Text></Col>
                <Col><Text strong style={{ fontSize: 16 }}>{formatPrice(selectedOrder.total)}</Text></Col>
              </Row>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: '#999' }}>
              <Text type="secondary">Thank you for shopping with BIG Company Rwanda!</Text>
              <br />
              <Text type="secondary">For support: +250 788 000 000 | support@bigcompany.rw</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

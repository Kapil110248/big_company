import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  message,
  Badge,
  Alert,
  Statistic,
  Divider,
  Empty,
} from 'antd';
import {
  ShoppingCartOutlined,
  SearchOutlined,
  ShopOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  InboxOutlined,
  TruckOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Search } = Input;

interface WholesalerProduct {
  id: string;
  name: string;
  category: string;
  wholesaler_price: number;
  stock_available: number;
  min_order: number;
  unit: string;
}

interface CartItem {
  product: WholesalerProduct;
  quantity: number;
}

const AddStockPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<WholesalerProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [capitalWalletBalance] = useState(1850000); // Mock capital wallet balance

  // Mock wholesaler products
  useEffect(() => {
    setProducts([
      { id: '1', name: 'Inyange Milk 1L', category: 'Dairy', wholesaler_price: 900, stock_available: 500, min_order: 24, unit: 'unit' },
      { id: '2', name: 'Bralirwa Beer 500ml', category: 'Beverages', wholesaler_price: 700, stock_available: 1000, min_order: 24, unit: 'unit' },
      { id: '3', name: 'Bread (Large)', category: 'Bakery', wholesaler_price: 400, stock_available: 200, min_order: 10, unit: 'unit' },
      { id: '4', name: 'Sugar 1kg', category: 'Groceries', wholesaler_price: 850, stock_available: 300, min_order: 20, unit: 'kg' },
      { id: '5', name: 'Cooking Oil 1L', category: 'Groceries', wholesaler_price: 1800, stock_available: 150, min_order: 12, unit: 'bottle' },
      { id: '6', name: 'Rice 5kg', category: 'Groceries', wholesaler_price: 4500, stock_available: 200, min_order: 10, unit: 'bag' },
      { id: '7', name: 'Coca-Cola 500ml', category: 'Beverages', wholesaler_price: 350, stock_available: 2000, min_order: 24, unit: 'unit' },
      { id: '8', name: 'Fanta Orange 500ml', category: 'Beverages', wholesaler_price: 350, stock_available: 1500, min_order: 24, unit: 'unit' },
      { id: '9', name: 'Eggs (Tray of 30)', category: 'Dairy', wholesaler_price: 4800, stock_available: 100, min_order: 5, unit: 'tray' },
      { id: '10', name: 'Tomato Paste 400g', category: 'Groceries', wholesaler_price: 600, stock_available: 250, min_order: 12, unit: 'can' },
    ]);
  }, []);

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: WholesalerProduct) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + product.min_order }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: product.min_order }]);
    }
    message.success(`Added ${product.name} to cart`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.product.id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.wholesaler_price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cartTotal > capitalWalletBalance) {
      message.error('Insufficient Capital Wallet balance for this order');
      return;
    }
    setCheckoutModalVisible(true);
  };

  const confirmOrder = async () => {
    setLoading(true);
    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('Order placed successfully! Your inventory will be updated when the order arrives.');
      setCart([]);
      setCheckoutModalVisible(false);
    } catch (error) {
      message.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<WholesalerProduct> = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Tag color="blue">{record.category}</Tag>
        </Space>
      ),
    },
    {
      title: 'Wholesaler Price',
      dataIndex: 'wholesaler_price',
      key: 'wholesaler_price',
      render: (price) => <Text strong style={{ color: '#1890ff' }}>{price.toLocaleString()} RWF</Text>,
      sorter: (a, b) => a.wholesaler_price - b.wholesaler_price,
    },
    {
      title: 'Available Stock',
      dataIndex: 'stock_available',
      key: 'stock_available',
      render: (stock) => (
        <Badge status={stock > 100 ? 'success' : stock > 20 ? 'warning' : 'error'} text={`${stock} ${stock > 100 ? 'In Stock' : 'Low Stock'}`} />
      ),
    },
    {
      title: 'Min Order',
      dataIndex: 'min_order',
      key: 'min_order',
      render: (min, record) => `${min} ${record.unit}`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => {
        const inCart = cart.find(item => item.product.id === record.id);
        return inCart ? (
          <Space>
            <Button
              icon={<MinusOutlined />}
              size="small"
              onClick={() => updateCartQuantity(record.id, inCart.quantity - record.min_order)}
            />
            <Text strong>{inCart.quantity}</Text>
            <Button
              icon={<PlusOutlined />}
              size="small"
              onClick={() => updateCartQuantity(record.id, inCart.quantity + record.min_order)}
              disabled={inCart.quantity + record.min_order > record.stock_available}
            />
          </Space>
        ) : (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="small"
            onClick={() => addToCart(record)}
            disabled={record.stock_available < record.min_order}
          >
            Add
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      {/* Header */}
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
        <Col flex="auto">
          <Title level={3} style={{ margin: 0 }}>
            <ShopOutlined style={{ marginRight: 12 }} />
            Add Stock from Wholesaler
          </Title>
          <Text type="secondary">View and order products from your assigned wholesaler</Text>
        </Col>
        <Col>
          <Space>
            <Statistic
              title="Capital Wallet"
              value={capitalWalletBalance}
              prefix={<DollarOutlined />}
              suffix="RWF"
              valueStyle={{ color: '#722ed1', fontSize: 18 }}
            />
          </Space>
        </Col>
      </Row>

      {/* Assigned Wholesaler Info */}
      <Card
        style={{ marginBottom: 24, background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)', border: 'none' }}
        bodyStyle={{ padding: '16px 24px' }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <TruckOutlined style={{ fontSize: 24, color: 'white' }} />
              <div>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>YOUR ASSIGNED WHOLESALER</Text>
                <Title level={4} style={{ margin: 0, color: 'white' }}>BIG Company Wholesale</Title>
              </div>
            </Space>
          </Col>
          <Col>
            <Tag color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
              <CheckCircleOutlined /> Real-time Stock
            </Tag>
          </Col>
        </Row>
      </Card>
      <Alert
        message="Capital Wallet Payment Only"
        description="All orders from your assigned wholesaler are paid exclusively from your Capital Wallet balance. No other payment methods accepted."
        type="warning"
        showIcon
        icon={<DollarOutlined />}
        style={{ marginBottom: 24 }}
      />

      <Row gutter={16}>
        {/* Product List */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <InboxOutlined />
                <span>Wholesaler Inventory</span>
                <Badge count={filteredProducts.length} style={{ backgroundColor: '#1890ff' }} />
              </Space>
            }
          >
            <Space style={{ marginBottom: 16, width: '100%' }} wrap>
              <Search
                placeholder="Search products..."
                style={{ width: 250 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
              />
              <Select
                placeholder="All Categories"
                style={{ width: 150 }}
                allowClear
                value={selectedCategory || undefined}
                onChange={setSelectedCategory}
              >
                {categories.map(cat => (
                  <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                ))}
              </Select>
            </Space>

            <Table
              columns={columns}
              dataSource={filteredProducts}
              rowKey="id"
              pagination={{ pageSize: 8 }}
              size="middle"
            />
          </Card>
        </Col>

        {/* Cart */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Order Cart</span>
                <Badge count={cartItemCount} style={{ backgroundColor: '#52c41a' }} />
              </Space>
            }
            extra={cart.length > 0 && (
              <Button type="text" danger size="small" onClick={() => setCart([])}>
                Clear All
              </Button>
            )}
          >
            {cart.length === 0 ? (
              <Empty description="Your cart is empty" />
            ) : (
              <>
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                  {cart.map(item => (
                    <Card key={item.product.id} size="small">
                      <Row justify="space-between" align="middle">
                        <Col span={14}>
                          <Text strong>{item.product.name}</Text>
                          <br />
                          <Text type="secondary">{item.product.wholesaler_price.toLocaleString()} RWF x {item.quantity}</Text>
                        </Col>
                        <Col span={6}>
                          <Text strong style={{ color: '#52c41a' }}>
                            {(item.product.wholesaler_price * item.quantity).toLocaleString()} RWF
                          </Text>
                        </Col>
                        <Col span={4}>
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeFromCart(item.product.id)}
                          />
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </Space>

                <Divider />

                <Row justify="space-between" style={{ marginBottom: 16 }}>
                  <Text strong>Total Order Value:</Text>
                  <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                    {cartTotal.toLocaleString()} RWF
                  </Text>
                </Row>

                {cartTotal > capitalWalletBalance && (
                  <Alert
                    message="Insufficient Balance"
                    description={`Your Capital Wallet balance (${capitalWalletBalance.toLocaleString()} RWF) is less than the order total.`}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleCheckout}
                  disabled={cartTotal > capitalWalletBalance}
                  icon={<CheckCircleOutlined />}
                >
                  Place Order from Capital Wallet
                </Button>
              </>
            )}
          </Card>
        </Col>
      </Row>

      {/* Checkout Modal */}
      <Modal
        title="Confirm Order"
        open={checkoutModalVisible}
        onCancel={() => setCheckoutModalVisible(false)}
        footer={null}
        width={500}
      >
        <Alert
          message="Payment from Capital Wallet"
          description="This order will be paid from your Capital Wallet balance."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <Row justify="space-between">
            <Text>Order Items:</Text>
            <Text strong>{cart.length} products</Text>
          </Row>
          <Row justify="space-between">
            <Text>Total Quantity:</Text>
            <Text strong>{cartItemCount} units</Text>
          </Row>
          <Divider style={{ margin: '12px 0' }} />
          <Row justify="space-between">
            <Text>Order Total:</Text>
            <Text strong style={{ color: '#1890ff', fontSize: 18 }}>
              {cartTotal.toLocaleString()} RWF
            </Text>
          </Row>
          <Row justify="space-between">
            <Text>Capital Wallet Balance:</Text>
            <Text strong style={{ color: '#722ed1' }}>
              {capitalWalletBalance.toLocaleString()} RWF
            </Text>
          </Row>
          <Row justify="space-between">
            <Text>Balance After Order:</Text>
            <Text strong style={{ color: '#52c41a' }}>
              {(capitalWalletBalance - cartTotal).toLocaleString()} RWF
            </Text>
          </Row>
        </Space>

        <Divider />

        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={() => setCheckoutModalVisible(false)}>Cancel</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={confirmOrder}
            icon={<CheckCircleOutlined />}
          >
            Confirm Order
          </Button>
        </Space>
      </Modal>
    </div>
  );
};

export default AddStockPage;

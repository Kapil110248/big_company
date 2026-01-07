import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Button,
  Tag,
  Space,
  Badge,
  message,
  Spin,
  Empty,
  Modal,
  Drawer,
  Divider,
  Alert,
  Form,
  Select,
  Radio,
  Avatar,
  ConfigProvider,
} from 'antd';
import {
  ShoppingCartOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  StarFilled,
  PlusOutlined,
  MinusOutlined,
  FilterOutlined,
  RightOutlined,
  AimOutlined,
  WalletOutlined,
  MobileOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { consumerApi } from '../../services/apiService';
import { useCart, Retailer } from '../../contexts/CartContext';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface Product {
  id: string;
  title?: string;
  name?: string; // Backend uses 'name' instead of 'title'
  description: string | null;
  thumbnail?: string;
  price?: number; // Backend simple price
  stock?: number; // Backend stock
  category?: string; // Backend category
  variants?: Array<{
    id: string;
    title: string;
    prices: Array<{ amount: number; currency_code: string }>;
    inventory_quantity: number;
  }>;
  categories?: Array<{ id: string; name: string }>;
}

interface Category {
  id: string;
  name: string;
  handle: string;
}

interface CustomerLocation {
  district: string;
  sector: string;
  cell: string;
}

export const ShopPage: React.FC = () => {
  const { user } = useAuth();
  const {
    items: cartItems,
    selectedRetailer,
    total: cartTotal,
    itemCount: cartItemCount,
    addItem,
    updateQuantity,
    clearCart,
    selectRetailer,
    getItemQuantity,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showRetailerModal, setShowRetailerModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [customerLocation, setCustomerLocation] = useState<CustomerLocation | null>(null);
  const [locationForm] = Form.useForm();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'mobile_money'>('wallet');
  const [checkoutForm] = Form.useForm();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatPrice = (amount: number) => `${amount.toLocaleString()} RWF`;

  const getMockRetailers = (): Retailer[] => [
    { id: 'ret_001', name: 'Remera Express Store', location: 'Rukiri I, Remera, Gasabo', rating: 4.8, distance: 1.2, is_open: true, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800', delivery_time: '20-30 min', minimum_order: 5000 },
    { id: 'ret_002', name: 'Nyamirambo Market', location: 'Nyamirambo, Nyarugenge', rating: 4.5, distance: 2.5, is_open: true, image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=800', delivery_time: '30-45 min', minimum_order: 3000 },
    { id: 'ret_005', name: 'Gikondo Groceries', location: 'Gikondo, Kicukiro', rating: 4.3, distance: 5.5, is_open: true, image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&q=80&w=800', delivery_time: '35-50 min', minimum_order: 4500 }
  ];

  const getMockCategories = (): Category[] => [
    { id: 'cat_1', name: 'Fruits', handle: 'fruits' },
    { id: 'cat_2', name: 'Vegetables', handle: 'vegetables' },
    { id: 'cat_3', name: 'Dairy', handle: 'dairy' },
    { id: 'cat_4', name: 'Grains', handle: 'grains' },
    { id: 'cat_5', name: 'Groceries', handle: 'groceries' }
  ];

  const getMockProducts = (): Product[] => [
    { id: 'p_1', title: 'Fresh Banana (Hand)', description: 'Sweet and organic bananas harvested daily.', thumbnail: 'https://images.unsplash.com/photo-1571771894821-ad99026a0947?auto=format&fit=crop&q=80&w=400', variants: [{ id: 'v_1', title: '1kg', prices: [{ amount: 800, currency_code: 'RWF' }], inventory_quantity: 50 }], categories: [{ id: 'cat_1', name: 'Fruits' }] },
    { id: 'p_2', title: 'Irish Potatoes', description: 'Perfect for boiling or frying.', thumbnail: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400', variants: [{ id: 'v_2', title: '5kg', prices: [{ amount: 4500, currency_code: 'RWF' }], inventory_quantity: 20 }], categories: [{ id: 'cat_2', name: 'Vegetables' }] },
    { id: 'p_3', title: 'Inyange Whole Milk', description: 'Fresh pasteurized whole milk.', thumbnail: 'https://images.unsplash.com/photo-1550583724-1255818c093b?auto=format&fit=crop&q=80&w=400', variants: [{ id: 'v_3', title: '1L', prices: [{ amount: 1200, currency_code: 'RWF' }], inventory_quantity: 100 }], categories: [{ id: 'cat_3', name: 'Dairy' }] },
    { id: 'p_4', title: 'Organic Avocados', description: 'Large, creamy avocados.', thumbnail: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=400', variants: [{ id: 'v_4', title: 'Piece', prices: [{ amount: 500, currency_code: 'RWF' }], inventory_quantity: 30 }], categories: [{ id: 'cat_1', name: 'Fruits' }] }
  ];

  useEffect(() => {
    const init = async () => {
      try {
        const [r, c] = await Promise.all([consumerApi.getRetailers(), consumerApi.getCategories()]);
        setRetailers(r.data.retailers || getMockRetailers());
        setCategories(c.data.categories || getMockCategories());
      } catch {
        setRetailers(getMockRetailers());
        setCategories(getMockCategories());
      } finally { setLoading(false); }
    };
    init();
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!selectedRetailer) return;
    setLoadingProducts(true);
    try {
      const res = await consumerApi.getProducts({ retailerId: selectedRetailer.id });
      setProducts(res.data.products || getMockProducts());
    } catch { setProducts(getMockProducts()); }
    finally { setLoadingProducts(false); }
  }, [selectedRetailer]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const productName = p.title || p.name || '';
      const productDesc = p.description || '';
      const ms = (productName + productDesc).toLowerCase().includes(searchQuery.toLowerCase());
      const mc = !selectedCategory ||
        p.categories?.some(c => c.id === selectedCategory) ||
        p.category === selectedCategory;
      return ms && mc;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleLocationSubmit = (v: CustomerLocation) => {
    setCustomerLocation(v);
    setShowLocationModal(false);
    setShowRetailerModal(true);
  };

  const handleSelectRetailer = (r: Retailer) => {
    selectRetailer(r);
    setShowRetailerModal(false);
  };

  const handleAddToCart = (p: Product) => {
    // Handle backend simple format
    if (p.price !== undefined) {
      addItem({
        id: p.id,
        productId: p.id,
        name: p.name || p.title || 'Product',
        price: p.price,
        image: p.thumbnail
      });
      message.success('Added!');
      return;
    }

    // Handle Medusa variant format
    if (p.variants && p.variants.length > 0) {
      const v = p.variants[0];
      const price = v.prices.find(pr => pr.currency_code.toLowerCase() === 'rwf')?.amount || v.prices[0].amount;
      addItem({ id: p.id, productId: p.id, name: p.title || p.name || 'Product', price, image: p.thumbnail });
      message.success('Added!');
    }
  };

  const handlePaymentSubmit = async () => {
    setProcessingPayment(true);
    await new Promise(r => setTimeout(r, 1500));
    setPaymentSuccess(true);
    setTimeout(() => {
      clearCart();
      setShowCheckoutModal(false);
      setPaymentSuccess(false);
    }, 2000);
    setProcessingPayment(false);
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#10b981', borderRadius: 16 } }}>
      <div className="shop-container" style={{ minHeight: '100vh', background: '#fdfdfd', padding: 24, margin: -24 }}>
        <style>{`
          .hero-section { background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 28px; padding: 48px; margin-bottom: 32px; color: white; position: relative; overflow: hidden; box-shadow: 0 15px 35px rgba(16, 185, 129, 0.15); }
          .category-tag { padding: 10px 20px; border-radius: 12px; border: 1px solid #f1f5f9; cursor: pointer; transition: 0.3s; background: white; color: #64748b; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; }
          .category-tag-active { background: #059669 !important; color: white !important; border-color: #059669 !important; box-shadow: 0 8px 20px rgba(5, 150, 105, 0.2); }
          .product-card { border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; transition: 0.3s; background: white; }
          .product-card:hover { transform: translateY(-6px); box-shadow: 0 20px 40px rgba(0,0,0,0.06); }
          .floating-cart { position: fixed; bottom: 40px; right: 40px; z-index: 1000; width: 70px; height: 70px; border-radius: 24px; background: #059669; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 15px 40px rgba(5, 150, 105, 0.4); transition: 0.3s; }
          .floating-cart:hover { transform: scale(1.1) rotate(-5deg); }
        `}</style>

        <Modal open={showLocationModal} footer={null} closable={false} className="premium-modal" centered>
          <div style={{ textAlign: 'center', padding: 24 }}>
            <EnvironmentOutlined style={{ fontSize: 48, color: '#10b981', marginBottom: 16 }} />
            <Title level={4}>Find Nearby Stores</Title>
            <Form form={locationForm} layout="vertical" onFinish={handleLocationSubmit}>
              <Form.Item name="district" rules={[{ required: true }]}><Select placeholder="District"><Option value="Gasabo">Gasabo</Option><Option value="Nyarugenge">Nyarugenge</Option></Select></Form.Item>
              <Form.Item name="sector" rules={[{ required: true }]}><Input placeholder="Sector" /></Form.Item>
              <Form.Item name="cell" rules={[{ required: true }]}><Input placeholder="Cell" /></Form.Item>
              <Button type="primary" htmlType="submit" block size="large">Locate Stores</Button>
            </Form>
          </div>
        </Modal>

        <Modal open={showRetailerModal} title="Select a Store" footer={null} onCancel={() => setShowRetailerModal(false)} width={500}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {retailers.map(r => (
              <Card key={r.id} hoverable onClick={() => handleSelectRetailer(r)} bodyStyle={{ padding: 16 }}>
                <Row align="middle" gutter={16}>
                  <Col><Avatar src={r.image} shape="square" size={64} /></Col>
                  <Col flex={1}><Title level={5} style={{ margin: 0 }}>{r.name}</Title><Text type="secondary">{r.location}</Text></Col>
                  <Col><RightOutlined /></Col>
                </Row>
              </Card>
            ))}
          </Space>
        </Modal>

        <div className="hero-section">
          <Row justify="space-between" align="middle">
            <Col md={16}>
              <Text style={{ opacity: 0.8, fontWeight: 700 }}>WELCOME BACK, {user?.name?.toUpperCase() || 'USER'}</Text>
              <Title level={1} style={{ color: 'white', margin: '8px 0', fontSize: 42 }}>Freshness at your doorstep.</Title>
              <Input size="large" placeholder="Search products..." prefix={<SearchOutlined style={{ color: '#10b981' }} />} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ height: 56, borderRadius: 16, marginTop: 16 }} />
            </Col>
            <Col md={8} style={{ textAlign: 'right' }}>
              <Badge count={cartItemCount} color="#fbbf24"><Button onClick={() => setShowCartDrawer(true)} style={{ height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}><ShoppingCartOutlined /> {formatPrice(cartTotal)}</Button></Badge>
            </Col>
          </Row>
        </div>

        <div className="floating-cart" onClick={() => setShowCartDrawer(true)}>
          <Badge count={cartItemCount} color="#fbbf24"><ShoppingCartOutlined style={{ fontSize: 32, color: 'white' }} /></Badge>
        </div>

        <div style={{ marginBottom: 32, overflowX: 'auto', whiteSpace: 'nowrap' }}>
          <Space>
            <div className={`category-tag ${!selectedCategory ? 'category-tag-active' : ''}`} onClick={() => setSelectedCategory('')}>All Items</div>
            {categories.map(c => <div key={c.id} className={`category-tag ${selectedCategory === c.id ? 'category-tag-active' : ''}`} onClick={() => setSelectedCategory(c.id)}>{c.name}</div>)}
          </Space>
        </div>

        {selectedRetailer ? (
          <div>
            <Card style={{ marginBottom: 32, border: '1px solid #10b981', background: '#f0fdf4' }}>
              <Row justify="space-between" align="middle">
                <Col><Space><Avatar src={selectedRetailer.image} size={48} /><div><Text strong>{selectedRetailer.name}</Text><div style={{ fontSize: 12, opacity: 0.6 }}>{selectedRetailer.location}</div></div></Space></Col>
                <Col><Button shape="round" onClick={() => setShowRetailerModal(true)}>Change Store</Button></Col>
              </Row>
            </Card>

            <Title level={3} style={{ marginBottom: 24 }}>{selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Top Picks'}</Title>

            {loadingProducts ? <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div> : filteredProducts.length === 0 ? <Empty description="No products found" /> : (
              <Row gutter={[24, 24]}>
                {filteredProducts.map(p => {
                  // Handle both backend simple format and Medusa variant format
                  let pr: number;
                  let stock: number;

                  if (p.price !== undefined) {
                    // Backend simple format
                    pr = p.price;
                    stock = p.stock || 0;
                  } else if (p.variants && p.variants.length > 0) {
                    // Medusa variant format
                    const v = p.variants[0];
                    pr = v.prices.find(x => x.currency_code.toLowerCase() === 'rwf')?.amount || v.prices[0].amount;
                    stock = v.inventory_quantity;
                  } else {
                    return null; // Skip invalid products
                  }

                  const productName = p.title || p.name || 'Product';
                  const categoryName = p.categories?.[0]?.name || p.category || 'GENERAL';
                  const q = getItemQuantity(p.id);

                  return (
                    <Col xs={12} md={8} lg={6} key={p.id}>
                      <Card className="product-card" cover={<div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}><img src={p.thumbnail || 'https://via.placeholder.com/200'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} /></div>}>
                        <Text type="secondary" style={{ fontSize: 10, fontWeight: 700 }}>{categoryName}</Text>
                        <Title level={5} style={{ margin: '4px 0 12px', height: 44, overflow: 'hidden' }}>{productName}</Title>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong style={{ fontSize: 18, color: '#059669' }}>{formatPrice(pr)}</Text>
                          {q > 0 ? (
                            <Space style={{ background: '#f0fdf4', borderRadius: 10, padding: 4 }}>
                              <Button size="small" type="text" icon={<MinusOutlined />} onClick={() => updateQuantity(p.id, q - 1)} />
                              <Text strong>{q}</Text>
                              <Button size="small" type="text" icon={<PlusOutlined />} onClick={() => updateQuantity(p.id, q + 1)} />
                            </Space>
                          ) : (
                            <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => handleAddToCart(p)} disabled={stock === 0} />
                          )}
                        </div>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 100, background: 'white', borderRadius: 28 }}>
            <ShopOutlined style={{ fontSize: 64, color: '#10b981', opacity: 0.2, marginBottom: 24 }} />
            <Title level={3}>Choose a Store to Begin</Title>
            <Button type="primary" size="large" onClick={() => setShowRetailerModal(true)} style={{ marginTop: 16 }}>Browse Retailers</Button>
          </div>
        )}

        <Modal open={showCheckoutModal} title="Checkout" onCancel={() => !processingPayment && setShowCheckoutModal(false)} footer={null}>
          {paymentSuccess ? <div style={{ textAlign: 'center', padding: 40 }}><CheckCircleOutlined style={{ fontSize: 64, color: '#10b981' }} /><Title level={3}>Success!</Title></div> : (
            <Form layout="vertical" onFinish={handlePaymentSubmit}>
              <Card style={{ marginBottom: 24, background: '#f0fdf4', border: 'none' }}><Text type="secondary">Total</Text><Title level={2} style={{ margin: 0, color: '#10b981' }}>{formatPrice(cartTotal)}</Title></Card>
              <Form.Item label="Payment Method"><Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}><Radio value="wallet">BIG Wallet</Radio><Radio value="mobile_money">Mobile Money</Radio></Radio.Group></Form.Item>
              <Button type="primary" htmlType="submit" block size="large" loading={processingPayment}>Pay Now</Button>
            </Form>
          )}
        </Modal>

        <Drawer title="Your Cart" onClose={() => setShowCartDrawer(false)} open={showCartDrawer} width={380}>
          {cartItems.length === 0 ? <Empty description="Cart is empty" /> : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Space direction="vertical" style={{ flex: 1, overflow: 'auto', width: '100%' }}>
                {cartItems.map(item => (
                  <Card key={item.id} size="small">
                    <Row align="middle" gutter={12}>
                      <Col span={4}><Avatar src={item.image} shape="square" /></Col>
                      <Col span={14}><Text strong>{item.name}</Text><div>{formatPrice(item.price)}</div></Col>
                      <Col span={6} style={{ textAlign: 'right' }}><Text strong>x{item.quantity}</Text></Col>
                    </Row>
                  </Card>
                ))}
              </Space>
              <Divider />
              <div style={{ padding: 16 }}>
                <Row justify="space-between" style={{ marginBottom: 16 }}><Text>Total</Text><Title level={4} style={{ margin: 0 }}>{formatPrice(cartTotal)}</Title></Row>
                <Button type="primary" block size="large" onClick={() => { setShowCartDrawer(false); setShowCheckoutModal(true); }}>Checkout</Button>
              </div>
            </div>
          )}
        </Drawer>
      </div>
    </ConfigProvider>
  );
};

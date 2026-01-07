import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Avatar,
  Form,
  Input,
  Button,
  Divider,
  message,
  Space,
  Tag,
  List,
  Switch,
  Tabs,
  Alert,
  Select,
  InputNumber,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  EditOutlined,
  SaveOutlined,
  BellOutlined,
  LockOutlined,
  SettingOutlined,
  MobileOutlined,
  DollarOutlined,
  WifiOutlined,
  QrcodeOutlined,
  PrinterOutlined,
  GlobalOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [settingsForm] = Form.useForm();

  const isWholesaler = user?.role === 'wholesaler';
  const isRetailer = user?.role === 'retailer';

  const handleSaveProfile = async (values: any) => {
    setLoading(true);
    try {
      console.log('Updating profile:', values);
      message.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (values: any) => {
    setLoading(true);
    try {
      console.log('Updating settings:', values);
      message.success('Settings updated successfully');
    } catch (error) {
      message.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const roleColor = isWholesaler ? '#722ed1' : isRetailer ? '#1890ff' : '#52c41a';
  const roleName = user?.role?.charAt(0).toUpperCase() + (user?.role?.slice(1) || '');

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${roleColor} 0%, ${roleColor}dd 100%)`,
          padding: '32px',
          borderRadius: 12,
          marginBottom: 24,
          color: 'white',
        }}
      >
        <Row align="middle" gutter={24}>
          <Col>
            <Avatar
              size={100}
              icon={<UserOutlined />}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '3px solid white',
              }}
            />
          </Col>
          <Col flex={1}>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              {user?.name || user?.company_name || user?.shop_name || roleName}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
              <PhoneOutlined /> {user?.phone || '+250788000000'}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="green">Verified Account</Tag>
              <Tag color="blue">{roleName}</Tag>
            </div>
          </Col>
          <Col>
            <Button
              type={editing ? 'primary' : 'default'}
              icon={editing ? <SaveOutlined /> : <EditOutlined />}
              onClick={() => (editing ? profileForm.submit() : setEditing(true))}
              loading={loading}
              style={editing ? {} : { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}
            >
              {editing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Col>
        </Row>
      </div>

      <Tabs defaultActiveKey="profile" size="large">
        {/* Profile Tab */}
        <TabPane
          tab={<span><UserOutlined />Profile</span>}
          key="profile"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card title={<><UserOutlined /> Business Information</>}>
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleSaveProfile}
                  initialValues={{
                    name: user?.name || '',
                    company_name: user?.company_name || user?.shop_name || '',
                    phone: user?.phone || '+250788000000',
                    email: user?.email || '',
                    address: 'Kigali, Rwanda',
                    tin_number: 'TIN123456789',
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="name" label="Contact Person">
                        <Input
                          prefix={<UserOutlined />}
                          disabled={!editing}
                          placeholder="Full name"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="company_name" label={isWholesaler ? 'Company Name' : 'Shop Name'}>
                        <Input
                          prefix={<HomeOutlined />}
                          disabled={!editing}
                          placeholder={isWholesaler ? 'Company name' : 'Shop name'}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="phone" label="Phone Number">
                        <Input
                          prefix={<PhoneOutlined />}
                          disabled
                          placeholder="Phone number"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="email" label="Email Address">
                        <Input
                          prefix={<MailOutlined />}
                          disabled={!editing}
                          placeholder="Email address"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="address" label="Business Address">
                        <Input
                          prefix={<HomeOutlined />}
                          disabled={!editing}
                          placeholder="Business address"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="tin_number" label="TIN Number">
                        <Input
                          disabled={!editing}
                          placeholder="Tax ID"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  {editing && (
                    <Space>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        Save Changes
                      </Button>
                      <Button onClick={() => setEditing(false)}>Cancel</Button>
                    </Space>
                  )}
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title={<><LockOutlined /> Security</>}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button block icon={<LockOutlined />}>
                    Change Password
                  </Button>
                  <Button block icon={<MobileOutlined />}>
                    Change PIN
                  </Button>
                  <Button block icon={<PhoneOutlined />}>
                    Two-Factor Auth
                  </Button>
                  <Divider />
                  <Button block type="text" danger>
                    Logout from All Devices
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Notifications Tab */}
        <TabPane
          tab={<span><BellOutlined />Notifications</span>}
          key="notifications"
        >
          <Card title={<><BellOutlined /> Notification Preferences</>}>
            <List>
              <List.Item actions={[<Switch defaultChecked key="switch" />]}>
                <List.Item.Meta
                  avatar={<BellOutlined style={{ fontSize: 20, color: roleColor }} />}
                  title="Push Notifications"
                  description="Receive order updates and alerts"
                />
              </List.Item>
              <List.Item actions={[<Switch defaultChecked key="switch" />]}>
                <List.Item.Meta
                  avatar={<MailOutlined style={{ fontSize: 20, color: roleColor }} />}
                  title="Email Notifications"
                  description="Receive daily summaries and reports"
                />
              </List.Item>
              <List.Item actions={[<Switch defaultChecked key="switch" />]}>
                <List.Item.Meta
                  avatar={<PhoneOutlined style={{ fontSize: 20, color: roleColor }} />}
                  title="SMS Notifications"
                  description="Receive critical alerts via SMS"
                />
              </List.Item>
              <List.Item actions={[<Switch key="switch" />]}>
                <List.Item.Meta
                  avatar={<MobileOutlined style={{ fontSize: 20, color: roleColor }} />}
                  title="USSD Alerts"
                  description="Receive order notifications via USSD callback"
                />
              </List.Item>
            </List>
          </Card>
        </TabPane>

        {/* USSD Settings Tab */}
        <TabPane
          tab={<span><MobileOutlined />USSD Settings</span>}
          key="ussd"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Alert
                message="USSD Integration"
                description="Configure your USSD settings to allow customers to place orders and check balances via USSD codes. This enables offline ordering for customers without smartphones."
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<><MobileOutlined /> USSD Configuration</>}>
                <Form layout="vertical">
                  <Form.Item label="USSD Short Code" help="Your assigned USSD code">
                    <Input
                      addonBefore="*"
                      addonAfter="#"
                      placeholder="123"
                      defaultValue={isWholesaler ? '284*1' : '284*2'}
                      disabled
                    />
                  </Form.Item>
                  <Form.Item label="Business Code" help="Unique code for your business">
                    <Input
                      placeholder="BIZ001"
                      defaultValue={isWholesaler ? 'WHL001' : 'RET001'}
                    />
                  </Form.Item>
                  <Form.Item label="USSD Menu Language">
                    <Select defaultValue="en">
                      <Select.Option value="en">English</Select.Option>
                      <Select.Option value="rw">Kinyarwanda</Select.Option>
                      <Select.Option value="fr">French</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Auto-Response" valuePropName="checked">
                    <Switch defaultChecked />
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      Automatically respond to USSD queries
                    </Text>
                  </Form.Item>
                  <Button type="primary" icon={<SaveOutlined />}>
                    Save USSD Settings
                  </Button>
                </Form>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title={<><GlobalOutlined /> USSD Menu Preview</>}>
                <div
                  style={{
                    background: '#1a1a2e',
                    color: '#00ff00',
                    padding: 16,
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    fontSize: 14,
                    lineHeight: 1.8,
                  }}
                >
                  <div>Welcome to BIG Company</div>
                  <div>------------------------</div>
                  <div>1. Check Balance</div>
                  <div>2. Place Order</div>
                  <div>3. Order History</div>
                  <div>4. Top Up Wallet</div>
                  <div>5. Contact Support</div>
                  <div>------------------------</div>
                  <div>Reply with option number</div>
                </div>
                <Paragraph type="secondary" style={{ marginTop: 16 }}>
                  Customers dial <Text code>*284#</Text> to access this menu
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Business Settings Tab */}
        <TabPane
          tab={<span><SettingOutlined />Business Settings</span>}
          key="business"
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title={<><DollarOutlined /> Payment Settings</>}>
                <Form layout="vertical" form={settingsForm} onFinish={handleSaveSettings}>
                  <Form.Item label="Default Payment Terms" name="payment_terms">
                    <Select defaultValue="net30">
                      <Select.Option value="cod">Cash on Delivery</Select.Option>
                      <Select.Option value="net7">Net 7 Days</Select.Option>
                      <Select.Option value="net14">Net 14 Days</Select.Option>
                      <Select.Option value="net30">Net 30 Days</Select.Option>
                    </Select>
                  </Form.Item>
                  {isWholesaler && (
                    <Form.Item label="Default Credit Limit for New Retailers" name="default_credit">
                      <InputNumber
                        style={{ width: '100%' }}
                        formatter={(value) => `RWF ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value?.replace(/RWF\s?|(,*)/g, '') as any}
                        defaultValue={50000}
                      />
                    </Form.Item>
                  )}
                  <Form.Item label="Accepted Payment Methods">
                    <Select mode="multiple" defaultValue={['wallet', 'mobile_money', 'cash']}>
                      <Select.Option value="wallet">Wallet Balance</Select.Option>
                      <Select.Option value="mobile_money">Mobile Money</Select.Option>
                      <Select.Option value="cash">Cash</Select.Option>
                      <Select.Option value="credit">Credit</Select.Option>
                      <Select.Option value="nfc">NFC Card</Select.Option>
                    </Select>
                  </Form.Item>
                  <Button type="primary" htmlType="submit">
                    Save Payment Settings
                  </Button>
                </Form>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title={<><PrinterOutlined /> POS & Hardware</>}>
                <Form layout="vertical">
                  <Form.Item label="Receipt Printer">
                    <Select defaultValue="bluetooth">
                      <Select.Option value="none">No Printer</Select.Option>
                      <Select.Option value="bluetooth">Bluetooth Printer</Select.Option>
                      <Select.Option value="usb">USB Printer</Select.Option>
                      <Select.Option value="network">Network Printer</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Barcode Scanner">
                    <Select defaultValue="camera">
                      <Select.Option value="none">No Scanner</Select.Option>
                      <Select.Option value="camera">Camera Scanner</Select.Option>
                      <Select.Option value="bluetooth">Bluetooth Scanner</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="NFC Reader" valuePropName="checked">
                    <Switch defaultChecked />
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      Enable NFC card payments
                    </Text>
                  </Form.Item>
                  <Button icon={<QrcodeOutlined />}>
                    Test Hardware Connection
                  </Button>
                </Form>
              </Card>
            </Col>

            <Col xs={24}>
              <Card title={<><ApiOutlined /> API & Integrations</>}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="API Key">
                      <Input.Password
                        defaultValue="sk_live_xxxxxxxxxxxxxxxxxxxx"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Webhook URL">
                      <Input
                        placeholder="https://your-server.com/webhook"
                        defaultValue=""
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Space>
                  <Button icon={<ApiOutlined />}>
                    Regenerate API Key
                  </Button>
                  <Button>
                    View API Documentation
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProfileSettingsPage;

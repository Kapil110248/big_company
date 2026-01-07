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
  CreditCardOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      // TODO: Call API to update profile
      console.log('Updating profile:', values);
      message.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const recentActivity = [
    { action: 'Placed order #ORD-2024-001', time: '2 hours ago', type: 'order' },
    { action: 'Added 500 RWF to wallet', time: '1 day ago', type: 'wallet' },
    { action: 'Completed order #ORD-2024-000', time: '3 days ago', type: 'order' },
    { action: 'Updated delivery address', time: '1 week ago', type: 'profile' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              {user?.name || 'Consumer'}
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>
              <PhoneOutlined /> {user?.phone || '+250788000001'}
            </Text>
            <div style={{ marginTop: 8 }}>
              <Tag color="green">Verified Account</Tag>
              <Tag color="blue">Premium Member</Tag>
            </div>
          </Col>
          <Col>
            <Button
              type={editing ? 'primary' : 'default'}
              icon={editing ? <SaveOutlined /> : <EditOutlined />}
              onClick={() => (editing ? form.submit() : setEditing(true))}
              loading={loading}
              style={editing ? {} : { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}
            >
              {editing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        {/* Personal Information */}
        <Col xs={24} lg={16}>
          <Card title={<><UserOutlined /> Personal Information</>}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                name: user?.name || 'Consumer User',
                phone: user?.phone || '+250788000001',
                email: user?.email || 'consumer@bigcompany.rw',
                address: 'Kigali, Nyarugenge District',
                landmark: 'Near BK Main Branch',
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="name" label="Full Name">
                    <Input
                      prefix={<UserOutlined />}
                      disabled={!editing}
                      placeholder="Enter your full name"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="Phone Number">
                    <Input
                      prefix={<PhoneOutlined />}
                      disabled
                      placeholder="Phone number"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="email" label="Email Address">
                    <Input
                      prefix={<MailOutlined />}
                      disabled={!editing}
                      placeholder="Enter email"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="address" label="Delivery Address">
                    <Input
                      prefix={<HomeOutlined />}
                      disabled={!editing}
                      placeholder="Enter address"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="landmark" label="Landmark/Additional Info">
                <Input.TextArea
                  disabled={!editing}
                  placeholder="Any landmark or additional delivery instructions"
                  rows={2}
                />
              </Form.Item>
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

          {/* Settings */}
          <Card title={<><BellOutlined /> Preferences & Settings</>} style={{ marginTop: 24 }}>
            <List>
              <List.Item
                actions={[<Switch defaultChecked />]}
              >
                <List.Item.Meta
                  avatar={<BellOutlined style={{ fontSize: 20, color: '#667eea' }} />}
                  title="Push Notifications"
                  description="Receive order updates and promotions"
                />
              </List.Item>
              <List.Item
                actions={[<Switch defaultChecked />]}
              >
                <List.Item.Meta
                  avatar={<MailOutlined style={{ fontSize: 20, color: '#667eea' }} />}
                  title="Email Notifications"
                  description="Receive order confirmations via email"
                />
              </List.Item>
              <List.Item
                actions={[<Switch />]}
              >
                <List.Item.Meta
                  avatar={<PhoneOutlined style={{ fontSize: 20, color: '#667eea' }} />}
                  title="SMS Notifications"
                  description="Receive SMS for important updates"
                />
              </List.Item>
            </List>
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Account Stats */}
          <Card>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Text type="secondary">Total Orders</Text>
                  <Title level={2} style={{ margin: '8px 0 0', color: '#667eea' }}>42</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>Online + Shop Orders</Text>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Text type="secondary">Available Balance</Text>
                  <Title level={4} style={{ margin: '8px 0 0', color: '#52c41a' }}>30,000 RWF</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>Dashboard + Credit</Text>
                </div>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={24}>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Text type="secondary">Gas Rewards</Text>
                  <Title level={3} style={{ margin: '8px 0 0', color: '#fa8c16' }}>4.5 M³</Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>Cubic Meters</Text>
                </div>
              </Col>
            </Row>
          </Card>

          {/* Security */}
          <Card title={<><LockOutlined /> Security</>} style={{ marginTop: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block icon={<LockOutlined />}>
                Change PIN
              </Button>
              <Button block icon={<CreditCardOutlined />}>
                Manage Payment Methods
              </Button>
              <Button block type="text" danger>
                Logout from All Devices
              </Button>
            </Space>
          </Card>

          {/* Recent Activity */}
          <Card title={<><HistoryOutlined /> Recent Activity</>} style={{ marginTop: 24 }}>
            <List
              size="small"
              dataSource={recentActivity}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Tag
                        color={
                          item.type === 'order' ? 'blue' : item.type === 'wallet' ? 'green' : 'purple'
                        }
                      >
                        {item.type}
                      </Tag>
                    }
                    title={item.action}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;

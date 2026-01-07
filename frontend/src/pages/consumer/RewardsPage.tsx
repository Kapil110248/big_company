import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tag,
  Space,
  Tabs,
  Progress,
  message,
  Spin,
  Empty,
  Input,
  Table,
  Badge,
  Alert,
  Statistic,
  Divider,
} from 'antd';
import {
  GiftOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  WalletOutlined,
  FireOutlined,
  TeamOutlined,
  CrownOutlined,
  ShareAltOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  StarFilled,
  ShoppingOutlined,
  CommentOutlined,
  UserAddOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { consumerApi } from '../../services/apiService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

interface RewardsBalance {
  points: number;
  lifetime_points: number;
}

interface RewardTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus' | 'referral';
  points: number;
  description: string;
  created_at: string;
  meter_id?: string;
  order_amount?: number;
  order_id?: string;
  metadata?: {
    gas_amount?: number;
    order_id?: string;
    referral_code?: string;
  };
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  tier: string;
  is_current_user: boolean;
}


const transactionTypeConfig = {
  earned: { color: 'success', icon: '+', label: 'Earned' },
  redeemed: { color: 'processing', icon: '-', label: 'Redeemed' },
  expired: { color: 'error', icon: '-', label: 'Expired' },
  bonus: { color: 'purple', icon: '+', label: 'Bonus' },
  referral: { color: 'orange', icon: '+', label: 'Referral' },
};

export const RewardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [balance, setBalance] = useState<RewardsBalance | null>(null);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Try to fetch real data, but use mock data if endpoints don't exist yet
      const mockBalance: RewardsBalance = {
        points: 2500,
        lifetime_points: 8750,
      };

      const mockTransactions: RewardTransaction[] = [
        {
          id: '1',
          type: 'earned',
          points: 50,
          description: 'Shopping rewards',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          meter_id: 'MTR-001234',
          order_amount: 15000,
          order_id: 'ORD-2024-001',
        },
        {
          id: '2',
          type: 'earned',
          points: 120,
          description: 'Shopping rewards',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          meter_id: 'MTR-001234',
          order_amount: 35000,
          order_id: 'ORD-2024-002',
        },
        {
          id: '3',
          type: 'earned',
          points: 80,
          description: 'Shopping rewards',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          meter_id: 'MTR-005678',
          order_amount: 22000,
          order_id: 'ORD-2024-003',
        },
      ];

      const mockLeaderboard: LeaderboardEntry[] = [
        { rank: 1, name: 'John D.', points: 15200, tier: 'PLATINUM', is_current_user: false },
        { rank: 2, name: 'Sarah M.', points: 12500, tier: 'GOLD', is_current_user: false },
        { rank: 3, name: 'You', points: 2500, tier: 'SILVER', is_current_user: true },
      ];

      const balancePromise = consumerApi.getRewardsBalance().catch(() => ({ data: mockBalance }));
      const historyPromise = consumerApi.getRewardsHistory(20).catch(() => ({ data: { transactions: mockTransactions } }));
      const referralPromise = consumerApi.getReferralCode().catch(() => ({ data: { referral_code: 'BIG' + Math.random().toString(36).substr(2, 6).toUpperCase() } }));
      const leaderboardPromise = consumerApi.getLeaderboard('month').catch(() => ({ data: { leaderboard: mockLeaderboard } }));

      const [balanceRes, historyRes, referralRes, leaderboardRes] = await Promise.all([
        balancePromise,
        historyPromise,
        referralPromise,
        leaderboardPromise,
      ]);

      setBalance(balanceRes.data);
      setTransactions(historyRes.data.transactions || mockTransactions);
      setReferralCode(referralRes.data.referral_code || 'BIG' + Math.random().toString(36).substr(2, 6).toUpperCase());
      setLeaderboard(leaderboardRes.data.leaderboard || mockLeaderboard);
    } catch (error) {
      console.error('Failed to fetch rewards data:', error);
      // Use mock data as complete fallback
      setBalance({
        points: 2500,
        lifetime_points: 8750,
      });
      setTransactions([]);
      setReferralCode('BIG' + Math.random().toString(36).substr(2, 6).toUpperCase());
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    message.success('Referral code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferralCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join BIG Company',
          text: `Use my referral code ${referralCode} to sign up and get bonus rewards!`,
          url: `https://big.rw/register?ref=${referralCode}`,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyReferralCode();
    }
  };

  const handleRedeem = async () => {
    const points = parseInt(redeemAmount);
    if (!points || points < 100) {
      message.error('Minimum 100 points to redeem');
      return;
    }
    if (balance && points > balance.points) {
      message.error('Insufficient points');
      return;
    }

    setRedeeming(true);
    try {
      const response = await consumerApi.redeemRewards(points);
      if (response.data.success) {
        message.success(
          `Redeemed ${points} points for ${(points * 10).toLocaleString()} RWF wallet credit!`
        );
        setBalance((prev) => (prev ? { ...prev, points: prev.points - points } : null));
        setRedeemAmount('');
        await fetchData();
      } else {
        message.error(response.data.error || 'Failed to redeem points');
      }
    } catch (error: any) {
      console.error('Redemption failed:', error);
      // If backend endpoint doesn't exist yet, simulate redemption
      if (error.response?.status === 401 || error.response?.status === 404) {
        message.success(
          `Redeemed ${points} points for ${(points * 10).toLocaleString()} RWF wallet credit! (Demo mode - will sync when backend is ready)`
        );
        setBalance((prev) => (prev ? { ...prev, points: prev.points - points } : null));
        setRedeemAmount('');
        const newTransaction: RewardTransaction = {
          id: Date.now().toString(),
          type: 'redeemed',
          points,
          description: `Redeemed for ${(points * 10).toLocaleString()} RWF wallet credit`,
          created_at: new Date().toISOString(),
        };
        setTransactions([newTransaction, ...transactions]);
      } else {
        message.error(error.response?.data?.error || 'Failed to redeem points');
      }
    } finally {
      setRedeeming(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-RW', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDate(date),
      width: 150,
    },
    {
      title: 'Meter ID',
      dataIndex: 'meter_id',
      key: 'meter_id',
      render: (meterId: string) => meterId || 'N/A',
      width: 120,
    },
    {
      title: 'Order Amount',
      dataIndex: 'order_amount',
      key: 'order_amount',
      render: (amount: number) => amount ? `${amount.toLocaleString()} RWF` : 'N/A',
      width: 120,
    },
    {
      title: 'Gas Amount (M³)',
      dataIndex: 'points',
      key: 'points',
      render: (points: number, record: RewardTransaction) => {
        const isPositive = ['earned', 'bonus', 'referral'].includes(record.type);
        const gasAmount = (points * 0.01).toFixed(2);
        return (
          <Text strong style={{ color: isPositive ? '#52c41a' : '#ff4d4f' }}>
            {isPositive ? '+' : '-'}
            {gasAmount} M³
          </Text>
        );
      },
      width: 130,
    },
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      render: (orderId: string) => orderId ? (
        <Button type="link" size="small" onClick={() => message.info(`View invoice for ${orderId}`)}>
          {orderId}
        </Button>
      ) : 'N/A',
      width: 130,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
        <p>Loading rewards...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: 24,
          marginBottom: 16,
          borderRadius: 8,
          color: 'white',
        }}
      >
        <Row gutter={16} align="middle">
          <Col flex={1}>
            <Space direction="vertical" size={4}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FireOutlined style={{ fontSize: 32 }} />
                <div>
                  <Title level={4} style={{ color: 'white', margin: 0 }}>
                    Gas Rewards
                  </Title>
                  <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                    Earn free gas with every purchase
                  </Text>
                </div>
              </div>
            </Space>
          </Col>
          <Col>
            <div style={{ textAlign: 'right' }}>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                Available Gas Rewards
              </Text>
              <Title level={2} style={{ color: 'white', margin: '8px 0 0 0' }}>
                {((balance?.points || 0) * 0.01).toFixed(2)} M³
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                Cubic Meters
              </Text>
            </div>
          </Col>
        </Row>

        <Text
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 12,
            display: 'block',
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          Lifetime: {((balance?.lifetime_points || 0) * 0.01).toFixed(2)} M³ earned
        </Text>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* Overview Tab */}
          <TabPane
            tab={
              <span>
                <GiftOutlined />
                Overview
              </span>
            }
            key="overview"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* How to Earn Gas Rewards */}
              <Card title="How to Earn Gas Rewards" size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {/* Shop and get free gas */}
                  <Card
                    size="small"
                    style={{ background: '#fff7e6', border: '1px solid #ffd591' }}
                  >
                    <Row align="middle" gutter={16}>
                      <Col>
                        <ShoppingOutlined style={{ fontSize: 32, color: '#ff7300' }} />
                      </Col>
                      <Col flex={1}>
                        <Text strong>Shop and get free gas</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Earn gas rewards as you shop with BIG stores
                        </Text>
                      </Col>
                      <Col>
                        <FireOutlined style={{ fontSize: 20, color: '#ff7300' }} />
                      </Col>
                    </Row>
                  </Card>

                  {/* Share your gas rewards */}
                  <Card
                    size="small"
                    style={{ background: '#f9f0ff', border: '1px solid #d3adf7' }}
                  >
                    <Row align="middle" gutter={16}>
                      <Col>
                        <GiftOutlined style={{ fontSize: 32, color: '#722ed1' }} />
                      </Col>
                      <Col flex={1}>
                        <Text strong>Share your gas rewards with your friends</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          While shopping share your gas rewards to your friend's meter ID
                        </Text>
                      </Col>
                      <Col>
                        <ShareAltOutlined style={{ fontSize: 20, color: '#722ed1' }} />
                      </Col>
                    </Row>
                  </Card>

                  {/* Share your experience */}
                  <Card
                    size="small"
                    style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}
                  >
                    <Row align="middle" gutter={16}>
                      <Col>
                        <CommentOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                      </Col>
                      <Col flex={1}>
                        <Text strong>Share your experience with friends</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Inform friends and family, this information should be known by all
                        </Text>
                      </Col>
                      <Col>
                        <TeamOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                      </Col>
                    </Row>
                  </Card>

                  {/* Invite friends */}
                  <Card
                    size="small"
                    style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}
                  >
                    <Row align="middle" gutter={16}>
                      <Col>
                        <UserAddOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                      </Col>
                      <Col flex={1}>
                        <Text strong>Invite friends</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Copy the link and share with friends to sign up
                        </Text>
                      </Col>
                      <Col>
                        <LinkOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                      </Col>
                    </Row>
                  </Card>
                </Space>
              </Card>

              {/* Invite Friends - Share Link */}
              <Card
                title={
                  <Space>
                    <ShareAltOutlined />
                    Share BIG Company
                  </Space>
                }
                size="small"
              >
                <Paragraph type="secondary">
                  Copy the link and share with friends and family to sign up!
                </Paragraph>
                <Space.Compact style={{ width: '100%' }}>
                  <Input
                    size="large"
                    value="https://unified-frontend-production.up.railway.app/consumer"
                    readOnly
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                    }}
                  />
                  <Button
                    size="large"
                    icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText('https://unified-frontend-production.up.railway.app/consumer');
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                      message.success('Link copied to clipboard!');
                    }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    size="large"
                    type="primary"
                    icon={<ShareAltOutlined />}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Join BIG Company',
                          text: 'Shop and earn free gas rewards!',
                          url: 'https://unified-frontend-production.up.railway.app/consumer',
                        });
                      } else {
                        message.info('Share link copied to clipboard!');
                      }
                    }}
                  >
                    Share
                  </Button>
                </Space.Compact>
              </Card>
            </Space>
          </TabPane>

          {/* History Tab */}
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                History
              </span>
            }
            key="history"
          >
            <Table
              dataSource={transactions}
              columns={transactionColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{
                emptyText: (
                  <Empty
                    description="No history yet"
                    image={<ClockCircleOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
                  >
                    <Paragraph type="secondary">
                      Start earning points by buying gas or referring friends!
                    </Paragraph>
                  </Empty>
                ),
              }}
            />
          </TabPane>

        </Tabs>
      </Card>
    </div>
  );
};

export default RewardsPage;

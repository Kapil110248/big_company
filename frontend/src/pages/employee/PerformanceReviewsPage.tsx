import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Progress,
  Statistic,
  Timeline,
  Rate,
  List,
  Avatar,
} from 'antd';
import {
  TrophyOutlined,
  EyeOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface PerformanceReview {
  id: string;
  period: string;
  reviewDate: string;
  reviewType: 'annual' | 'quarterly' | 'mid-year' | 'probation';
  status: 'completed' | 'pending' | 'scheduled';
  overallRating: number;
  reviewer: string;
  goals: {
    category: string;
    rating: number;
  }[];
  strengths?: string[];
  areasForImprovement?: string[];
  nextReviewDate?: string;
}

export const PerformanceReviewsPage: React.FC = () => {
  const navigate = useNavigate();

  const reviews: PerformanceReview[] = [
    {
      id: '1',
      period: 'Q4 2025',
      reviewDate: '2025-12-15',
      reviewType: 'quarterly',
      status: 'scheduled',
      overallRating: 0,
      reviewer: 'Jane Manager',
      goals: [],
      nextReviewDate: '2025-12-15',
    },
    {
      id: '2',
      period: 'Q3 2025',
      reviewDate: '2025-09-30',
      reviewType: 'quarterly',
      status: 'completed',
      overallRating: 4.5,
      reviewer: 'Jane Manager',
      goals: [
        { category: 'Technical Skills', rating: 5 },
        { category: 'Communication', rating: 4 },
        { category: 'Team Collaboration', rating: 5 },
        { category: 'Project Delivery', rating: 4 },
        { category: 'Innovation', rating: 4.5 },
      ],
      strengths: [
        'Excellent technical problem-solving skills',
        'Strong team player and mentor to junior developers',
        'Consistently delivers high-quality work on time',
      ],
      areasForImprovement: [
        'Could improve presentation skills for client meetings',
        'Explore more leadership opportunities',
      ],
    },
    {
      id: '3',
      period: 'Mid-Year 2025',
      reviewDate: '2025-06-30',
      reviewType: 'mid-year',
      status: 'completed',
      overallRating: 4.2,
      reviewer: 'Jane Manager',
      goals: [
        { category: 'Technical Skills', rating: 4.5 },
        { category: 'Communication', rating: 3.5 },
        { category: 'Team Collaboration', rating: 4.5 },
        { category: 'Project Delivery', rating: 4 },
        { category: 'Innovation', rating: 4 },
      ],
      strengths: [
        'Strong coding abilities and attention to detail',
        'Proactive in helping team members',
        'Quick learner of new technologies',
      ],
      areasForImprovement: [
        'Work on public speaking and presentation skills',
        'Take more initiative in team meetings',
      ],
    },
    {
      id: '4',
      period: 'Annual 2024',
      reviewDate: '2024-12-31',
      reviewType: 'annual',
      status: 'completed',
      overallRating: 4.0,
      reviewer: 'Jane Manager',
      goals: [
        { category: 'Technical Skills', rating: 4 },
        { category: 'Communication', rating: 3.5 },
        { category: 'Team Collaboration', rating: 4 },
        { category: 'Project Delivery', rating: 4 },
        { category: 'Innovation', rating: 4 },
      ],
      strengths: [
        'Solid technical foundation',
        'Reliable and punctual',
        'Good problem-solving approach',
      ],
      areasForImprovement: [
        'Develop communication skills',
        'Be more proactive in sharing ideas',
        'Seek mentorship opportunities',
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'success',
      pending: 'processing',
      scheduled: 'default',
    };
    return colors[status] || 'default';
  };

  const getReviewTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      annual: 'purple',
      quarterly: 'blue',
      'mid-year': 'cyan',
      probation: 'orange',
    };
    return colors[type] || 'default';
  };

  const completedReviews = reviews.filter((r) => r.status === 'completed');
  const averageRating =
    completedReviews.length > 0
      ? completedReviews.reduce((sum, r) => sum + r.overallRating, 0) / completedReviews.length
      : 0;

  const latestReview = completedReviews[0];
  const improvementTrend = latestReview && completedReviews.length > 1
    ? latestReview.overallRating - completedReviews[1].overallRating
    : 0;

  const columns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (period: string, record: PerformanceReview) => (
        <div>
          <Text strong>{period}</Text>
          <br />
          <Tag color={getReviewTypeColor(record.reviewType)} style={{ marginTop: 4 }}>
            {record.reviewType.replace('-', ' ').toUpperCase()}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Review Date',
      dataIndex: 'reviewDate',
      key: 'reviewDate',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Reviewer',
      dataIndex: 'reviewer',
      key: 'reviewer',
    },
    {
      title: 'Overall Rating',
      dataIndex: 'overallRating',
      key: 'overallRating',
      render: (rating: number, record: PerformanceReview) =>
        record.status === 'completed' ? (
          <Space>
            <Rate disabled value={rating} allowHalf style={{ fontSize: 16 }} />
            <Text strong>({rating.toFixed(1)})</Text>
          </Space>
        ) : (
          <Text type="secondary">Not rated yet</Text>
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PerformanceReview) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/employee/performance-reviews/${record.id}`)}
          disabled={record.status === 'scheduled'}
        >
          {record.status === 'completed' ? 'View Details' : 'View Schedule'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <TrophyOutlined /> Performance Reviews
      </Title>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Average Rating"
              value={averageRating.toFixed(1)}
              suffix="/ 5.0"
              prefix={<StarOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14', fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Reviews"
              value={completedReviews.length}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Latest Rating"
              value={latestReview?.overallRating.toFixed(1) || 'N/A'}
              suffix={latestReview ? '/ 5.0' : ''}
              prefix={<TrophyOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Improvement"
              value={improvementTrend >= 0 ? `+${improvementTrend.toFixed(1)}` : improvementTrend.toFixed(1)}
              prefix={<RiseOutlined style={{ color: improvementTrend >= 0 ? '#52c41a' : '#ff4d4f' }} />}
              valueStyle={{ color: improvementTrend >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Reviews Table */}
        <Col xs={24} lg={16}>
          <Card title="Review History">
            <Table dataSource={reviews} columns={columns} rowKey="id" pagination={false} />
          </Card>
        </Col>

        {/* Quick Summary */}
        <Col xs={24} lg={8}>
          {latestReview && (
            <>
              <Card title="Latest Review Summary" style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary">Period:</Text>
                    <br />
                    <Text strong>{latestReview.period}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Overall Rating:</Text>
                    <br />
                    <Rate disabled value={latestReview.overallRating} allowHalf />
                    <Text strong style={{ marginLeft: 8 }}>
                      ({latestReview.overallRating.toFixed(1)} / 5.0)
                    </Text>
                  </div>
                  <Progress
                    percent={(latestReview.overallRating / 5) * 100}
                    strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                    showInfo={false}
                  />
                  <div>
                    <Text type="secondary">Reviewed by:</Text>
                    <br />
                    <Text>{latestReview.reviewer}</Text>
                  </div>
                  <div>
                    <Text type="secondary">Date:</Text>
                    <br />
                    <Text>{dayjs(latestReview.reviewDate).format('MMM DD, YYYY')}</Text>
                  </div>
                  <Button
                    type="primary"
                    block
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/employee/performance-reviews/${latestReview.id}`)}
                  >
                    View Full Review
                  </Button>
                </Space>
              </Card>

              {latestReview.goals && latestReview.goals.length > 0 && (
                <Card title="Performance by Category">
                  <List
                    dataSource={latestReview.goals}
                    renderItem={(goal) => (
                      <List.Item>
                        <List.Item.Meta
                          title={<Text>{goal.category}</Text>}
                          description={
                            <Space direction="vertical" style={{ width: '100%' }}>
                              <Rate disabled value={goal.rating} allowHalf style={{ fontSize: 14 }} />
                              <Progress
                                percent={(goal.rating / 5) * 100}
                                size="small"
                                showInfo={false}
                                strokeColor={goal.rating >= 4.5 ? '#52c41a' : goal.rating >= 3.5 ? '#1890ff' : '#faad14'}
                              />
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              )}
            </>
          )}

          {/* Upcoming Review */}
          {reviews.some((r) => r.status === 'scheduled') && (
            <Card
              title="Upcoming Review"
              style={{ marginTop: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <CalendarOutlined style={{ fontSize: 48, color: 'white', marginBottom: 16 }} />
                  <br />
                  <Text strong style={{ color: 'white', fontSize: 16 }}>
                    {reviews.find((r) => r.status === 'scheduled')?.period} Review
                  </Text>
                  <br />
                  <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                    Scheduled for: {dayjs(reviews.find((r) => r.status === 'scheduled')?.reviewDate).format('MMM DD, YYYY')}
                  </Text>
                </div>
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceReviewsPage;

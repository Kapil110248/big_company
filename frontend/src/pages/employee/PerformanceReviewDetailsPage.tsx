import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tag,
  Descriptions,
  Rate,
  Progress,
  List,
  Divider,
  Avatar,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  TrophyOutlined,
  StarOutlined,
  CheckCircleOutlined,
  RiseOutlined,
  FallOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export const PerformanceReviewDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Mock data
  const review = {
    id: id || '2',
    period: 'Q3 2025',
    reviewDate: '2025-09-30',
    reviewType: 'quarterly',
    status: 'completed',
    overallRating: 4.5,
    reviewer: 'Jane Manager',
    reviewerTitle: 'Sales Director',
    goals: [
      { category: 'Technical Skills', rating: 5, comments: 'Exceptional technical abilities. Consistently delivers clean, efficient code.' },
      { category: 'Communication', rating: 4, comments: 'Good communicator within the team. Could improve client-facing communication.' },
      { category: 'Team Collaboration', rating: 5, comments: 'Excellent team player. Actively helps colleagues and shares knowledge.' },
      { category: 'Project Delivery', rating: 4, comments: 'Delivers on time with high quality. Occasionally underestimates complexity.' },
      { category: 'Innovation', rating: 4.5, comments: 'Brings creative solutions to problems. Suggests process improvements regularly.' },
    ],
    strengths: [
      'Excellent technical problem-solving skills and deep understanding of React ecosystem',
      'Strong team player and mentor to junior developers',
      'Consistently delivers high-quality work on time',
      'Proactive in suggesting improvements to codebase and processes',
      'Reliable and takes ownership of assigned tasks',
    ],
    areasForImprovement: [
      'Could improve presentation skills for client meetings',
      'Explore more leadership opportunities within the team',
      'Work on estimating task complexity more accurately',
    ],
    achievements: [
      'Successfully led the e-commerce platform redesign project',
      'Mentored 2 junior developers who showed significant improvement',
      'Implemented performance optimizations that reduced load time by 40%',
      'Contributed to 15 successful project deliveries',
    ],
    goalsForNextPeriod: [
      'Take lead on at least one major project',
      'Improve client presentation skills by attending training',
      'Mentor one additional junior developer',
      'Contribute to open-source projects',
    ],
    managerSummary: 'Outstanding performance this quarter. Shows consistent growth and takes initiative in helping the team. With some focus on leadership development and client communication, ready for senior role considerations.',
    employeeComments: 'Thank you for the feedback. I appreciate the recognition and will focus on the areas mentioned for improvement. Looking forward to taking on more leadership responsibilities.',
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

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#52c41a';
    if (rating >= 3.5) return '#1890ff';
    if (rating >= 2.5) return '#faad14';
    return '#ff4d4f';
  };

  return (
    <div>
      {/* Header */}
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/employee/performance-reviews')}>
          Back to Reviews
        </Button>
      </Space>

      <Row align="middle" justify="space-between" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2}>
            <TrophyOutlined /> Performance Review - {review.period}
          </Title>
        </Col>
        <Col>
          <Tag color={getReviewTypeColor(review.reviewType)} style={{ fontSize: 16, padding: '4px 16px' }}>
            {review.reviewType.replace('-', ' ').toUpperCase()}
          </Tag>
        </Col>
      </Row>

      {/* Overall Rating Card */}
      <Card
        style={{
          marginBottom: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
        }}
      >
        <Row align="middle" justify="space-around">
          <Col style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}>
              <TrophyOutlined style={{ fontSize: 64, color: '#faad14' }} />
            </div>
            <Text style={{ color: 'white', fontSize: 18, display: 'block', marginBottom: 8 }}>
              Overall Rating
            </Text>
            <div style={{ marginBottom: 8 }}>
              <Text strong style={{ color: 'white', fontSize: 48 }}>
                {review.overallRating.toFixed(1)}
              </Text>
              <Text style={{ color: 'white', fontSize: 24 }}> / 5.0</Text>
            </div>
            <Rate disabled value={review.overallRating} allowHalf style={{ fontSize: 24 }} />
            <br />
            <Progress
              percent={(review.overallRating / 5) * 100}
              strokeColor="white"
              trailColor="rgba(255,255,255,0.3)"
              showInfo={false}
              style={{ marginTop: 16, width: 300 }}
            />
          </Col>
        </Row>
      </Card>

      {/* Review Details */}
      <Card title="Review Information" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Review Period">{review.period}</Descriptions.Item>
          <Descriptions.Item label="Review Date">{dayjs(review.reviewDate).format('MMMM DD, YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Reviewer">
            <Space>
              <Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }} />
              <div>
                <Text strong>{review.reviewer}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {review.reviewerTitle}
                </Text>
              </div>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color="success" icon={<CheckCircleOutlined />}>
              COMPLETED
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Performance by Category */}
        <Col xs={24} lg={12}>
          <Card title="Performance by Category">
            <List
              dataSource={review.goals}
              renderItem={(goal) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong>{goal.category}</Text>
                        </Col>
                        <Col>
                          <Space>
                            <Rate disabled value={goal.rating} allowHalf style={{ fontSize: 16 }} />
                            <Text strong style={{ color: getRatingColor(goal.rating) }}>
                              {goal.rating.toFixed(1)}
                            </Text>
                          </Space>
                        </Col>
                      </Row>
                    }
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Progress
                          percent={(goal.rating / 5) * 100}
                          showInfo={false}
                          strokeColor={getRatingColor(goal.rating)}
                        />
                        <Text type="secondary" italic>
                          "{goal.comments}"
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Achievements */}
        <Col xs={24} lg={12}>
          <Card title="Key Achievements" extra={<TrophyOutlined style={{ color: '#faad14' }} />}>
            <List
              dataSource={review.achievements}
              renderItem={(achievement) => (
                <List.Item>
                  <Space>
                    <StarOutlined style={{ color: '#faad14' }} />
                    <Text>{achievement}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Strengths */}
        <Col xs={24} lg={12}>
          <Card title="Strengths" extra={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
            <List
              dataSource={review.strengths}
              renderItem={(strength) => (
                <List.Item>
                  <Space align="start">
                    <CheckCircleOutlined style={{ color: '#52c41a', marginTop: 4 }} />
                    <Text>{strength}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Areas for Improvement */}
        <Col xs={24} lg={12}>
          <Card title="Areas for Improvement" extra={<RiseOutlined style={{ color: '#1890ff' }} />}>
            <List
              dataSource={review.areasForImprovement}
              renderItem={(area) => (
                <List.Item>
                  <Space align="start">
                    <RiseOutlined style={{ color: '#1890ff', marginTop: 4 }} />
                    <Text>{area}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Goals for Next Period */}
        <Col xs={24}>
          <Card title="Goals for Next Review Period">
            <List
              dataSource={review.goalsForNextPeriod}
              renderItem={(goal, index) => (
                <List.Item>
                  <Space>
                    <Avatar style={{ background: '#1890ff' }}>{index + 1}</Avatar>
                    <Text>{goal}</Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Manager Summary */}
        <Col xs={24} lg={12}>
          <Card title="Manager's Summary">
            <Alert
              message="Manager Comments"
              description={<Paragraph>{review.managerSummary}</Paragraph>}
              type="info"
              showIcon
              icon={<UserOutlined />}
            />
          </Card>
        </Col>

        {/* Employee Comments */}
        <Col xs={24} lg={12}>
          <Card title="Employee Response">
            <Alert
              message="Your Comments"
              description={<Paragraph>{review.employeeComments}</Paragraph>}
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PerformanceReviewDetailsPage;

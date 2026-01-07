import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Tag,
  Progress,
  Descriptions,
  List,
  Avatar,
  Collapse,
  Divider,
  Statistic,
  Timeline,
} from 'antd';
import {
  ArrowLeftOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
  FileTextOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  completed: boolean;
  type: 'video' | 'quiz' | 'reading' | 'assignment';
  completedDate?: string;
}

export const TrainingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Mock data
  const course = {
    id: id || '1',
    title: 'Advanced React Development',
    description: 'Master advanced React patterns, hooks, and performance optimization techniques. This comprehensive course covers everything from basic React concepts to advanced state management, server-side rendering, and performance tuning.',
    category: 'Technical',
    level: 'advanced',
    duration: 40,
    progress: 65,
    status: 'in_progress',
    instructor: 'John Developer',
    instructorBio: 'Senior Full-Stack Developer with 10+ years of experience in React and modern JavaScript.',
    enrolled: true,
    enrollmentDate: '2025-11-01',
    lessons: 20,
    completedLessons: 13,
    rating: 4.8,
    studentsEnrolled: 1250,
  };

  const lessons: Lesson[] = [
    {
      id: '1',
      title: 'Introduction to Advanced React',
      description: 'Overview of the course and what you will learn',
      duration: 15,
      completed: true,
      type: 'video',
      completedDate: '2025-11-02',
    },
    {
      id: '2',
      title: 'React Hooks Deep Dive',
      description: 'Understanding useState, useEffect, and custom hooks',
      duration: 45,
      completed: true,
      type: 'video',
      completedDate: '2025-11-05',
    },
    {
      id: '3',
      title: 'Hooks Quiz',
      description: 'Test your knowledge on React Hooks',
      duration: 20,
      completed: true,
      type: 'quiz',
      completedDate: '2025-11-05',
    },
    {
      id: '4',
      title: 'Context API and useContext',
      description: 'Managing global state with Context API',
      duration: 30,
      completed: true,
      type: 'video',
      completedDate: '2025-11-08',
    },
    {
      id: '5',
      title: 'useReducer for Complex State',
      description: 'When and how to use useReducer',
      duration: 35,
      completed: true,
      type: 'video',
      completedDate: '2025-11-10',
    },
    {
      id: '6',
      title: 'Performance Optimization',
      description: 'useMemo, useCallback, and React.memo',
      duration: 40,
      completed: true,
      type: 'video',
      completedDate: '2025-11-12',
    },
    {
      id: '7',
      title: 'Code Splitting and Lazy Loading',
      description: 'Optimizing bundle size with dynamic imports',
      duration: 25,
      completed: true,
      type: 'video',
      completedDate: '2025-11-15',
    },
    {
      id: '8',
      title: 'React Suspense and Concurrent Mode',
      description: 'Understanding React 18 features',
      duration: 30,
      completed: true,
      type: 'video',
      completedDate: '2025-11-18',
    },
    {
      id: '9',
      title: 'Server-Side Rendering Basics',
      description: 'Introduction to SSR with React',
      duration: 35,
      completed: true,
      type: 'reading',
      completedDate: '2025-11-20',
    },
    {
      id: '10',
      title: 'Next.js Fundamentals',
      description: 'Building SSR apps with Next.js',
      duration: 50,
      completed: true,
      type: 'video',
      completedDate: '2025-11-22',
    },
    {
      id: '11',
      title: 'State Management with Redux Toolkit',
      description: 'Modern Redux with Redux Toolkit',
      duration: 45,
      completed: true,
      type: 'video',
      completedDate: '2025-11-25',
    },
    {
      id: '12',
      title: 'Redux Middleware and Thunks',
      description: 'Handling async actions in Redux',
      duration: 40,
      completed: true,
      type: 'video',
      completedDate: '2025-11-27',
    },
    {
      id: '13',
      title: 'Mid-Course Project',
      description: 'Build a real-world app using advanced patterns',
      duration: 120,
      completed: true,
      type: 'assignment',
      completedDate: '2025-11-30',
    },
    {
      id: '14',
      title: 'Testing React Applications',
      description: 'Unit testing with Jest and React Testing Library',
      duration: 40,
      completed: false,
      type: 'video',
    },
    {
      id: '15',
      title: 'Integration Testing',
      description: 'Testing component interactions',
      duration: 35,
      completed: false,
      type: 'video',
    },
    {
      id: '16',
      title: 'E2E Testing with Cypress',
      description: 'End-to-end testing strategies',
      duration: 45,
      completed: false,
      type: 'video',
    },
    {
      id: '17',
      title: 'TypeScript with React',
      description: 'Adding type safety to React apps',
      duration: 50,
      completed: false,
      type: 'video',
    },
    {
      id: '18',
      title: 'Advanced TypeScript Patterns',
      description: 'Generics, utility types, and more',
      duration: 40,
      completed: false,
      type: 'video',
    },
    {
      id: '19',
      title: 'Production Best Practices',
      description: 'Deployment, monitoring, and maintenance',
      duration: 30,
      completed: false,
      type: 'reading',
    },
    {
      id: '20',
      title: 'Final Project',
      description: 'Capstone project incorporating all learned concepts',
      duration: 180,
      completed: false,
      type: 'assignment',
    },
  ];

  const completedLessons = lessons.filter((l) => l.completed);
  const hoursCompleted = completedLessons.reduce((sum, l) => sum + l.duration, 0) / 60;
  const totalHours = lessons.reduce((sum, l) => sum + l.duration, 0) / 60;

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      video: <PlayCircleOutlined />,
      quiz: <FileTextOutlined />,
      reading: <BookOutlined />,
      assignment: <FileTextOutlined />,
    };
    return icons[type] || <BookOutlined />;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      video: 'blue',
      quiz: 'orange',
      reading: 'green',
      assignment: 'purple',
    };
    return colors[type] || 'default';
  };

  return (
    <div>
      {/* Header */}
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/employee/training')}>
          Back to Training
        </Button>
      </Space>

      <Title level={2}>
        <BookOutlined /> {course.title}
      </Title>

      {/* Course Info */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>{course.description}</Text>
              <Space>
                <Tag color="blue">{course.level.toUpperCase()}</Tag>
                <Tag>{course.category}</Tag>
                <Tag color="processing">{course.status.replace('_', ' ').toUpperCase()}</Tag>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Progress Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Overall Progress"
              value={course.progress}
              suffix="%"
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={course.progress} showInfo={false} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Lessons Completed"
              value={completedLessons.length}
              suffix={`/ ${lessons.length}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Hours Completed"
              value={hoursCompleted.toFixed(1)}
              suffix={`/ ${totalHours.toFixed(1)}h`}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Course Rating"
              value={course.rating}
              suffix="/ 5.0"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Course Content */}
        <Col xs={24} lg={16}>
          <Card title="Course Content" extra={<Text type="secondary">{lessons.length} lessons</Text>}>
            <List
              dataSource={lessons}
              renderItem={(lesson, index) => (
                <List.Item
                  actions={[
                    lesson.completed ? (
                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                    ) : (
                      <Button type="primary" size="small" disabled={index > completedLessons.length}>
                        {index === completedLessons.length ? 'Start' : 'Locked'}
                      </Button>
                    ),
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={getTypeIcon(lesson.type)}
                        style={{
                          background: lesson.completed ? '#52c41a' : '#d9d9d9',
                        }}
                      />
                    }
                    title={
                      <Space>
                        <Text strong={!lesson.completed}>{lesson.title}</Text>
                        <Tag color={getTypeColor(lesson.type)}>{lesson.type.toUpperCase()}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical">
                        <Text type="secondary">{lesson.description}</Text>
                        <Space>
                          <ClockCircleOutlined />
                          <Text type="secondary">{lesson.duration} minutes</Text>
                          {lesson.completedDate && (
                            <>
                              <Divider type="vertical" />
                              <Text type="secondary">Completed: {lesson.completedDate}</Text>
                            </>
                          )}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Sidebar */}
        <Col xs={24} lg={8}>
          {/* Instructor */}
          <Card title="Instructor" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Avatar size={48} icon={<UserOutlined />} style={{ background: '#1890ff' }} />
                <div>
                  <Text strong>{course.instructor}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Course Instructor
                  </Text>
                </div>
              </Space>
              <Divider style={{ margin: '12px 0' }} />
              <Text type="secondary">{course.instructorBio}</Text>
            </Space>
          </Card>

          {/* Course Details */}
          <Card title="Course Details" style={{ marginBottom: 16 }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Duration">{course.duration} hours</Descriptions.Item>
              <Descriptions.Item label="Level">
                <Tag color="blue">{course.level.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Category">{course.category}</Descriptions.Item>
              <Descriptions.Item label="Enrolled">{course.enrollmentDate}</Descriptions.Item>
              <Descriptions.Item label="Students">{course.studentsEnrolled.toLocaleString()}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Certificate */}
          {course.progress === 100 && (
            <Card
              title="Certificate"
              style={{ background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)', border: 'none' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} align="center">
                <SafetyCertificateOutlined style={{ fontSize: 48, color: 'white' }} />
                <Text strong style={{ color: 'white', textAlign: 'center' }}>
                  Congratulations! You've completed this course.
                </Text>
                <Button type="primary" size="large" block style={{ marginTop: 12 }}>
                  Download Certificate
                </Button>
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default TrainingDetailsPage;

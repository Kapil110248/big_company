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
  Input,
  Select,
  Statistic,
  Tabs,
  List,
  Avatar,
} from 'antd';
import {
  BookOutlined,
  SearchOutlined,
  EyeOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  instructor: string;
  enrolled: boolean;
  completedDate?: string;
  certificateUrl?: string;
  lessons: number;
  completedLessons: number;
}

export const TrainingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const courses: Course[] = [
    {
      id: '1',
      title: 'Advanced React Development',
      description: 'Master advanced React patterns, hooks, and performance optimization',
      category: 'Technical',
      level: 'advanced',
      duration: 40,
      progress: 65,
      status: 'in_progress',
      instructor: 'John Developer',
      enrolled: true,
      lessons: 20,
      completedLessons: 13,
    },
    {
      id: '2',
      title: 'Project Management Fundamentals',
      description: 'Learn the basics of project management and agile methodologies',
      category: 'Management',
      level: 'beginner',
      duration: 20,
      progress: 100,
      status: 'completed',
      instructor: 'Sarah Manager',
      enrolled: true,
      completedDate: '2025-11-15',
      certificateUrl: '/certificates/pm-fundamentals',
      lessons: 10,
      completedLessons: 10,
    },
    {
      id: '3',
      title: 'Effective Communication Skills',
      description: 'Improve your verbal and written communication in the workplace',
      category: 'Soft Skills',
      level: 'intermediate',
      duration: 15,
      progress: 30,
      status: 'in_progress',
      instructor: 'Mike Trainer',
      enrolled: true,
      lessons: 12,
      completedLessons: 4,
    },
    {
      id: '4',
      title: 'Sales Techniques & Strategies',
      description: 'Learn proven sales techniques to close more deals',
      category: 'Sales',
      level: 'intermediate',
      duration: 25,
      progress: 0,
      status: 'not_started',
      instructor: 'Lisa Seller',
      enrolled: true,
      lessons: 15,
      completedLessons: 0,
    },
    {
      id: '5',
      title: 'Leadership & Team Building',
      description: 'Develop leadership skills and learn to build high-performing teams',
      category: 'Management',
      level: 'advanced',
      duration: 30,
      progress: 0,
      status: 'not_started',
      instructor: 'David Leader',
      enrolled: false,
      lessons: 18,
      completedLessons: 0,
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      not_started: 'default',
      in_progress: 'processing',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: 'green',
      intermediate: 'blue',
      advanced: 'red',
    };
    return colors[level] || 'default';
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      course.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const enrolledCourses = courses.filter((c) => c.enrolled);
  const completedCourses = enrolledCourses.filter((c) => c.status === 'completed').length;
  const inProgressCourses = enrolledCourses.filter((c) => c.status === 'in_progress').length;
  const totalHours = enrolledCourses.reduce((sum, c) => sum + (c.duration * c.progress) / 100, 0);

  const myEnrolledCourses = courses.filter((c) => c.enrolled);
  const availableCourses = courses.filter((c) => !c.enrolled);

  return (
    <div>
      <Title level={2}>
        <BookOutlined /> Training & Development
      </Title>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Enrolled Courses"
              value={enrolledCourses.length}
              prefix={<BookOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={inProgressCourses}
              prefix={<PlayCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedCourses}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Learning Hours"
              value={Math.round(totalHours)}
              suffix="hrs"
              prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Course Tabs */}
      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab={`My Courses (${myEnrolledCourses.length})`} key="1">
            <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
              <Space>
                <Search
                  placeholder="Search courses..."
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 300 }}
                  prefix={<SearchOutlined />}
                />
                <Select
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  style={{ width: 150 }}
                >
                  <Option value="all">All Categories</Option>
                  <Option value="Technical">Technical</Option>
                  <Option value="Management">Management</Option>
                  <Option value="Soft Skills">Soft Skills</Option>
                  <Option value="Sales">Sales</Option>
                </Select>
              </Space>
            </Space>

            <List
              dataSource={filteredCourses.filter((c) => c.enrolled)}
              renderItem={(course) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/employee/training/${course.id}`)}
                    >
                      {course.status === 'completed' ? 'View Details' : 'Continue Learning'}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={64}
                        icon={<BookOutlined />}
                        style={{ background: '#1890ff' }}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>{course.title}</Text>
                        {course.status === 'completed' && (
                          <TrophyOutlined style={{ color: '#faad14' }} />
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text type="secondary">{course.description}</Text>
                        <Space>
                          <Tag color={getLevelColor(course.level)}>
                            {course.level.toUpperCase()}
                          </Tag>
                          <Tag color={getStatusColor(course.status)}>
                            {course.status.replace('_', ' ').toUpperCase()}
                          </Tag>
                          <Tag>{course.category}</Tag>
                          <Text type="secondary">
                            <ClockCircleOutlined /> {course.duration} hours
                          </Text>
                          <Text type="secondary">
                            {course.completedLessons}/{course.lessons} lessons
                          </Text>
                        </Space>
                        {course.status !== 'not_started' && (
                          <div style={{ width: '100%' }}>
                            <Progress
                              percent={course.progress}
                              status={course.status === 'completed' ? 'success' : 'active'}
                            />
                          </div>
                        )}
                        {course.certificateUrl && (
                          <Button
                            type="link"
                            icon={<SafetyCertificateOutlined />}
                            style={{ padding: 0 }}
                          >
                            View Certificate
                          </Button>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab={`Available Courses (${availableCourses.length})`} key="2">
            <List
              dataSource={availableCourses}
              renderItem={(course) => (
                <List.Item
                  actions={[
                    <Button type="primary" onClick={() => {}}>
                      Enroll Now
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={64}
                        icon={<BookOutlined />}
                        style={{ background: '#52c41a' }}
                      />
                    }
                    title={<Text strong>{course.title}</Text>}
                    description={
                      <Space direction="vertical">
                        <Text type="secondary">{course.description}</Text>
                        <Space>
                          <Tag color={getLevelColor(course.level)}>
                            {course.level.toUpperCase()}
                          </Tag>
                          <Tag>{course.category}</Tag>
                          <Text type="secondary">
                            <ClockCircleOutlined /> {course.duration} hours
                          </Text>
                          <Text type="secondary">{course.lessons} lessons</Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="Certificates" key="3">
            <List
              dataSource={courses.filter((c) => c.status === 'completed')}
              renderItem={(course) => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<EyeOutlined />}>
                      View
                    </Button>,
                    <Button type="link">Download</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={48}
                        icon={<SafetyCertificateOutlined />}
                        style={{ background: '#faad14' }}
                      />
                    }
                    title={<Text strong>{course.title}</Text>}
                    description={
                      <Space>
                        <Text type="secondary">
                          Completed on: {course.completedDate}
                        </Text>
                        <Text type="secondary">|</Text>
                        <Text type="secondary">Instructor: {course.instructor}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default TrainingPage;

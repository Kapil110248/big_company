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
  Timeline,
  Descriptions,
  Tabs,
  Table,
  Avatar,
  Divider,
  Statistic,
  List,
  Checkbox,
} from 'antd';
import {
  ArrowLeftOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  RocketOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
  completed: boolean;
  hoursSpent: number;
  estimatedHours: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  tasksCompleted: number;
  hoursContributed: number;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed';
  completedDate?: string;
}

export const ProjectDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Mock data
  const project = {
    id: id || '1',
    name: 'E-Commerce Platform Redesign',
    description: 'Complete overhaul of the customer-facing e-commerce platform with modern UI/UX, improved performance, and mobile responsiveness.',
    status: 'in_progress',
    priority: 'high',
    progress: 65,
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    dueDate: '2025-12-31',
    client: 'ABC Corporation',
    manager: 'Jane Manager',
    myRole: 'Frontend Developer',
    teamSize: 8,
    budget: 50000,
    spent: 32500,
  };

  const tasks: Task[] = [
    {
      id: '1',
      title: 'Design Homepage Mockup',
      description: 'Create high-fidelity mockup for the new homepage',
      status: 'completed',
      priority: 'high',
      assignee: 'You',
      dueDate: '2025-10-15',
      completed: true,
      hoursSpent: 16,
      estimatedHours: 16,
    },
    {
      id: '2',
      title: 'Implement Product Catalog',
      description: 'Build dynamic product catalog with filtering and sorting',
      status: 'in_progress',
      priority: 'high',
      assignee: 'You',
      dueDate: '2025-12-10',
      completed: false,
      hoursSpent: 24,
      estimatedHours: 40,
    },
    {
      id: '3',
      title: 'Shopping Cart Integration',
      description: 'Integrate shopping cart with payment gateway',
      status: 'todo',
      priority: 'medium',
      assignee: 'You',
      dueDate: '2025-12-20',
      completed: false,
      hoursSpent: 0,
      estimatedHours: 32,
    },
    {
      id: '4',
      title: 'Mobile Responsive Design',
      description: 'Ensure all pages are mobile-friendly',
      status: 'review',
      priority: 'high',
      assignee: 'You',
      dueDate: '2025-12-15',
      completed: false,
      hoursSpent: 20,
      estimatedHours: 24,
    },
  ];

  const teamMembers: TeamMember[] = [
    { id: '1', name: 'You', role: 'Frontend Developer', tasksCompleted: 8, hoursContributed: 120 },
    { id: '2', name: 'John Doe', role: 'Backend Developer', tasksCompleted: 6, hoursContributed: 95 },
    { id: '3', name: 'Jane Smith', role: 'UI/UX Designer', tasksCompleted: 10, hoursContributed: 110 },
    { id: '4', name: 'Mike Johnson', role: 'QA Tester', tasksCompleted: 5, hoursContributed: 80 },
    { id: '5', name: 'Sarah Williams', role: 'Project Manager', tasksCompleted: 4, hoursContributed: 60 },
  ];

  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'Design Phase Complete',
      description: 'All designs approved and finalized',
      dueDate: '2025-10-31',
      status: 'completed',
      completedDate: '2025-10-28',
    },
    {
      id: '2',
      title: 'Frontend Development - Phase 1',
      description: 'Core pages and components implemented',
      dueDate: '2025-11-30',
      status: 'completed',
      completedDate: '2025-11-29',
    },
    {
      id: '3',
      title: 'Backend Integration',
      description: 'API integration and data flow setup',
      dueDate: '2025-12-15',
      status: 'pending',
    },
    {
      id: '4',
      title: 'Testing & QA',
      description: 'Complete testing and bug fixes',
      dueDate: '2025-12-25',
      status: 'pending',
    },
    {
      id: '5',
      title: 'Production Launch',
      description: 'Deploy to production environment',
      dueDate: '2025-12-31',
      status: 'pending',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      todo: 'default',
      in_progress: 'processing',
      review: 'warning',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'green',
      medium: 'blue',
      high: 'orange',
    };
    return colors[priority] || 'default';
  };

  const myTasks = tasks.filter((t) => t.assignee === 'You');
  const completedTasks = myTasks.filter((t) => t.completed).length;
  const totalHours = myTasks.reduce((sum, t) => sum + t.hoursSpent, 0);

  return (
    <div>
      {/* Header */}
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/employee/projects')}>
          Back to Projects
        </Button>
      </Space>

      <Title level={2}>
        <ProjectOutlined /> {project.name}
      </Title>

      {/* Project Overview */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text type="secondary">{project.description}</Text>
              <Space size="large">
                <Tag color="blue">{project.myRole}</Tag>
                <Tag color={project.status === 'in_progress' ? 'processing' : 'success'}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </Tag>
                <Tag color={project.priority === 'high' ? 'red' : 'orange'}>
                  {project.priority.toUpperCase()} PRIORITY
                </Tag>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Overall Progress"
              value={project.progress}
              suffix="%"
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress percent={project.progress} showInfo={false} strokeColor="#1890ff" />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="My Tasks"
              value={completedTasks}
              suffix={`/ ${myTasks.length}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="My Hours"
              value={totalHours}
              suffix="hrs"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Team Size"
              value={project.teamSize}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="My Tasks" key="1">
            <Table
              dataSource={myTasks}
              columns={[
                {
                  title: 'Task',
                  dataIndex: 'title',
                  key: 'title',
                  render: (title: string, record: Task) => (
                    <div>
                      <Space>
                        <Checkbox checked={record.completed} disabled />
                        <div>
                          <Text strong={!record.completed}>{title}</Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.description}
                          </Text>
                        </div>
                      </Space>
                    </div>
                  ),
                },
                {
                  title: 'Priority',
                  dataIndex: 'priority',
                  key: 'priority',
                  render: (priority: string) => (
                    <Tag color={getPriorityColor(priority)}>{priority.toUpperCase()}</Tag>
                  ),
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={getStatusColor(status)}>{status.replace('_', ' ').toUpperCase()}</Tag>
                  ),
                },
                {
                  title: 'Hours',
                  key: 'hours',
                  render: (_: any, record: Task) => (
                    <Text>
                      {record.hoursSpent} / {record.estimatedHours}h
                    </Text>
                  ),
                },
                {
                  title: 'Due Date',
                  dataIndex: 'dueDate',
                  key: 'dueDate',
                  render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
                },
              ]}
              rowKey="id"
              pagination={false}
            />
          </TabPane>

          <TabPane tab="Milestones" key="2">
            <Timeline>
              {milestones.map((milestone) => (
                <Timeline.Item
                  key={milestone.id}
                  color={milestone.status === 'completed' ? 'green' : 'blue'}
                  dot={
                    milestone.status === 'completed' ? (
                      <CheckCircleOutlined style={{ fontSize: 16 }} />
                    ) : (
                      <ClockCircleOutlined style={{ fontSize: 16 }} />
                    )
                  }
                >
                  <Card size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Text strong>{milestone.title}</Text>
                        <Tag color={milestone.status === 'completed' ? 'success' : 'processing'}>
                          {milestone.status.toUpperCase()}
                        </Tag>
                      </Space>
                      <Text type="secondary">{milestone.description}</Text>
                      <Space>
                        <CalendarOutlined />
                        <Text type="secondary">
                          Due: {dayjs(milestone.dueDate).format('MMM DD, YYYY')}
                        </Text>
                        {milestone.completedDate && (
                          <Text type="success">
                            | Completed: {dayjs(milestone.completedDate).format('MMM DD, YYYY')}
                          </Text>
                        )}
                      </Space>
                    </Space>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </TabPane>

          <TabPane tab="Team" key="3">
            <List
              dataSource={teamMembers}
              renderItem={(member) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }} />}
                    title={<Text strong>{member.name}</Text>}
                    description={member.role}
                  />
                  <Space>
                    <Statistic
                      title="Tasks"
                      value={member.tasksCompleted}
                      valueStyle={{ fontSize: 16 }}
                    />
                    <Divider type="vertical" />
                    <Statistic
                      title="Hours"
                      value={member.hoursContributed}
                      valueStyle={{ fontSize: 16 }}
                    />
                  </Space>
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab="Details" key="4">
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Client">{project.client}</Descriptions.Item>
              <Descriptions.Item label="Project Manager">{project.manager}</Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {dayjs(project.startDate).format('MMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {dayjs(project.endDate).format('MMM DD, YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Budget">
                ${project.budget.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Spent">
                ${project.spent.toLocaleString()} ({Math.round((project.spent / project.budget) * 100)}%)
              </Descriptions.Item>
              <Descriptions.Item label="Team Size">{project.teamSize} members</Descriptions.Item>
              <Descriptions.Item label="My Role">{project.myRole}</Descriptions.Item>
            </Descriptions>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProjectDetailsPage;

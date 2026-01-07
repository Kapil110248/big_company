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
  Avatar,
  Tooltip,
} from 'antd';
import {
  ProjectOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  teamSize: number;
  myRole: string;
  tasksCompleted: number;
  totalTasks: number;
  hoursSpent: number;
  estimatedHours: number;
  client?: string;
  manager: string;
}

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const projects: Project[] = [
    {
      id: '1',
      name: 'E-Commerce Platform Redesign',
      description: 'Complete overhaul of the customer-facing e-commerce platform',
      status: 'in_progress',
      priority: 'high',
      progress: 65,
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      dueDate: '2025-12-31',
      teamSize: 8,
      myRole: 'Frontend Developer',
      tasksCompleted: 13,
      totalTasks: 20,
      hoursSpent: 120,
      estimatedHours: 180,
      client: 'ABC Corporation',
      manager: 'Jane Manager',
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android',
      status: 'in_progress',
      priority: 'urgent',
      progress: 45,
      startDate: '2025-11-01',
      endDate: '2026-02-28',
      dueDate: '2026-02-28',
      teamSize: 6,
      myRole: 'QA Tester',
      tasksCompleted: 9,
      totalTasks: 20,
      hoursSpent: 80,
      estimatedHours: 200,
      client: 'XYZ Ltd',
      manager: 'John Smith',
    },
    {
      id: '3',
      name: 'Internal CRM System',
      description: 'Custom CRM solution for sales team management',
      status: 'completed',
      priority: 'medium',
      progress: 100,
      startDate: '2025-08-01',
      endDate: '2025-11-30',
      dueDate: '2025-11-30',
      teamSize: 5,
      myRole: 'Backend Developer',
      tasksCompleted: 15,
      totalTasks: 15,
      hoursSpent: 150,
      estimatedHours: 150,
      manager: 'Sarah Johnson',
    },
    {
      id: '4',
      name: 'Marketing Website Launch',
      description: 'New corporate website with blog and portfolio sections',
      status: 'not_started',
      priority: 'low',
      progress: 0,
      startDate: '2026-01-15',
      endDate: '2026-03-31',
      dueDate: '2026-03-31',
      teamSize: 4,
      myRole: 'Content Writer',
      tasksCompleted: 0,
      totalTasks: 12,
      hoursSpent: 0,
      estimatedHours: 100,
      client: 'DEF Industries',
      manager: 'Mike Brown',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      not_started: 'default',
      in_progress: 'processing',
      on_hold: 'warning',
      completed: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: '#52c41a',
      medium: '#1890ff',
      high: '#faad14',
      urgent: '#ff4d4f',
    };
    return colors[priority] || '#000';
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchText.toLowerCase()) ||
      project.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeProjects = projects.filter((p) => p.status === 'in_progress').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  const totalHours = projects.reduce((sum, p) => sum + p.hoursSpent, 0);
  const avgProgress =
    projects.reduce((sum, p) => sum + p.progress, 0) / projects.length;

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Project) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.description}
          </Text>
        </div>
      ),
    },
    {
      title: 'My Role',
      dataIndex: 'myRole',
      key: 'myRole',
      render: (role: string) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <div style={{ width: 120 }}>
          <Progress percent={progress} size="small" />
        </div>
      ),
    },
    {
      title: 'Tasks',
      key: 'tasks',
      render: (_: any, record: Project) => (
        <Text>
          {record.tasksCompleted}/{record.totalTasks}
        </Text>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Project) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/employee/projects/${record.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <ProjectOutlined /> My Projects
      </Title>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={projects.length}
              prefix={<ProjectOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Active"
              value={activeProjects}
              prefix={<RocketOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedProjects}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Hours Worked"
              value={totalHours}
              suffix="hrs"
              prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Projects List */}
      <Card
        title="All Projects"
        extra={
          <Space>
            <Search
              placeholder="Search projects..."
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              prefix={<SearchOutlined />}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            >
              <Option value="all">All Status</Option>
              <Option value="not_started">Not Started</Option>
              <Option value="in_progress">In Progress</Option>
              <Option value="on_hold">On Hold</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Space>
        }
      >
        <Table
          dataSource={filteredProjects}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default ProjectsPage;

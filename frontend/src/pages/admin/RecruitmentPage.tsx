import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  message,
  Statistic,
  Tabs,
  List,
  Avatar,
} from 'antd';
import {
  TeamOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  UserAddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface JobPosting {
  id: string;
  title: string;
  department: string;
  type: 'full_time' | 'part_time' | 'contract';
  salary: { min: number; max: number };
  location: string;
  description: string;
  requirements: string[];
  status: 'open' | 'closed';
  applicants: number;
  postedDate: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobId: string;
  jobTitle: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  appliedDate: string;
  resume: string;
}

export const RecruitmentPage: React.FC = () => {
  const [showJobModal, setShowJobModal] = useState(false);
  const [form] = Form.useForm();

  const jobPostings: JobPosting[] = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      department: 'IT',
      type: 'full_time',
      salary: { min: 1500000, max: 2000000 },
      location: 'Kigali, Rwanda',
      description: 'We are looking for an experienced software engineer to join our development team.',
      requirements: ['5+ years experience', 'React expertise', 'TypeScript proficiency'],
      status: 'open',
      applicants: 15,
      postedDate: '2025-11-20',
    },
    {
      id: '2',
      title: 'Sales Representative',
      department: 'Sales',
      type: 'full_time',
      salary: { min: 700000, max: 1000000 },
      location: 'Kigali, Rwanda',
      description: 'Join our sales team and help grow our customer base.',
      requirements: ['2+ years sales experience', 'Excellent communication', 'Target-driven'],
      status: 'open',
      applicants: 28,
      postedDate: '2025-11-15',
    },
    {
      id: '3',
      title: 'Marketing Manager',
      department: 'Marketing',
      type: 'full_time',
      salary: { min: 1200000, max: 1500000 },
      location: 'Kigali, Rwanda',
      description: 'Lead our marketing initiatives and brand strategy.',
      requirements: ['5+ years marketing experience', 'Team management', 'Digital marketing'],
      status: 'closed',
      applicants: 42,
      postedDate: '2025-10-01',
    },
  ];

  const applicants: Applicant[] = [
    {
      id: '1',
      name: 'Alice Williams',
      email: 'alice.w@email.com',
      phone: '250788300001',
      jobId: '1',
      jobTitle: 'Senior Software Engineer',
      status: 'interview',
      appliedDate: '2025-11-25',
      resume: '/resumes/alice-williams.pdf',
    },
    {
      id: '2',
      name: 'Bob Anderson',
      email: 'bob.a@email.com',
      phone: '250788300002',
      jobId: '1',
      jobTitle: 'Senior Software Engineer',
      status: 'screening',
      appliedDate: '2025-11-28',
      resume: '/resumes/bob-anderson.pdf',
    },
    {
      id: '3',
      name: 'Carol Martinez',
      email: 'carol.m@email.com',
      phone: '250788300003',
      jobId: '2',
      jobTitle: 'Sales Representative',
      status: 'offer',
      appliedDate: '2025-11-20',
      resume: '/resumes/carol-martinez.pdf',
    },
  ];

  const openPositions = jobPostings.filter((j) => j.status === 'open').length;
  const totalApplicants = applicants.length;
  const inInterview = applicants.filter((a) => a.status === 'interview').length;
  const pendingReview = applicants.filter((a) => a.status === 'screening').length;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'success',
      closed: 'default',
      applied: 'processing',
      screening: 'processing',
      interview: 'warning',
      offer: 'success',
      hired: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const handleCreateJob = async (values: any) => {
    try {
      console.log('Creating job:', values);
      message.success('Job posting created successfully!');
      setShowJobModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create job posting');
    }
  };

  const jobColumns = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: JobPosting) => (
        <div>
          <Text strong>{title}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.department} • {record.location}
          </Text>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue">{type.replace('_', ' ').toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Salary Range',
      key: 'salary',
      render: (_: any, record: JobPosting) =>
        `${record.salary.min.toLocaleString()} - ${record.salary.max.toLocaleString()} RWF`,
    },
    {
      title: 'Applicants',
      dataIndex: 'applicants',
      key: 'applicants',
      render: (count: number) => <Text strong>{count}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
    },
    {
      title: 'Posted',
      dataIndex: 'postedDate',
      key: 'postedDate',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link" icon={<EyeOutlined />}>
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <UserAddOutlined /> Recruitment & Jobs
      </Title>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Open Positions"
              value={openPositions}
              prefix={<UserAddOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Applicants"
              value={totalApplicants}
              prefix={<TeamOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="In Interview"
              value={inInterview}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Pending Review"
              value={pendingReview}
              prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Job Postings" key="1">
            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowJobModal(true)}>
                Create Job Posting
              </Button>
            </Space>
            <Table dataSource={jobPostings} columns={jobColumns} rowKey="id" pagination={false} />
          </TabPane>

          <TabPane tab="Applicants" key="2">
            <List
              dataSource={applicants}
              renderItem={(applicant) => (
                <List.Item
                  actions={[
                    <Button type="link" icon={<EyeOutlined />}>
                      View Application
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserAddOutlined />} style={{ background: '#1890ff' }} />}
                    title={<Text strong>{applicant.name}</Text>}
                    description={
                      <Space direction="vertical">
                        <Text type="secondary">{applicant.jobTitle}</Text>
                        <Space>
                          <Text type="secondary">{applicant.email}</Text>
                          <Text type="secondary">•</Text>
                          <Text type="secondary">{applicant.phone}</Text>
                        </Space>
                        <Space>
                          <Tag color={getStatusColor(applicant.status)}>
                            {applicant.status.toUpperCase()}
                          </Tag>
                          <Text type="secondary">
                            Applied: {dayjs(applicant.appliedDate).format('MMM DD, YYYY')}
                          </Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Create Job Modal */}
      <Modal
        title="Create Job Posting"
        open={showJobModal}
        onCancel={() => {
          setShowJobModal(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateJob}>
          <Form.Item name="title" label="Job Title" rules={[{ required: true }]}>
            <Input size="large" placeholder="e.g., Senior Software Engineer" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="IT">IT</Option>
                  <Option value="Sales">Sales</Option>
                  <Option value="Marketing">Marketing</Option>
                  <Option value="HR">HR</Option>
                  <Option value="Finance">Finance</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Employment Type" rules={[{ required: true }]}>
                <Select size="large">
                  <Option value="full_time">Full Time</Option>
                  <Option value="part_time">Part Time</Option>
                  <Option value="contract">Contract</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="salaryMin" label="Minimum Salary (RWF)" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="salaryMax" label="Maximum Salary (RWF)" rules={[{ required: true }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="location" label="Location" rules={[{ required: true }]}>
            <Input size="large" placeholder="e.g., Kigali, Rwanda" />
          </Form.Item>

          <Form.Item name="description" label="Job Description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Describe the role and responsibilities" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setShowJobModal(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Job Posting
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecruitmentPage;

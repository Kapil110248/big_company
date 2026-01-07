import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Descriptions,
  Timeline,
  Tag,
  Divider,
  Statistic,
  Progress,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FieldTimeOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { Title, Text } = Typography;

interface AttendanceDetail {
  id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked: number;
  status: 'present' | 'late' | 'absent' | 'half_day';
  location: string;
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  breaks: {
    id: string;
    breakStart: string;
    breakEnd: string;
    duration: number;
    type: 'lunch' | 'tea' | 'personal';
  }[];
  tasks: {
    id: string;
    title: string;
    timeSpent: number;
    completed: boolean;
  }[];
  notes?: string;
}

export const AttendanceDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Mock data - will be replaced with API call
  const attendance: AttendanceDetail = {
    id: id || '1',
    date: '2025-12-02',
    checkIn: '08:45 AM',
    checkOut: '05:30 PM',
    hoursWorked: 8.75,
    status: 'present',
    location: 'Office - Main Building',
    checkInLatitude: -1.9441,
    checkInLongitude: 30.0619,
    checkOutLatitude: -1.9441,
    checkOutLongitude: 30.0619,
    breaks: [
      {
        id: '1',
        breakStart: '10:30 AM',
        breakEnd: '10:45 AM',
        duration: 15,
        type: 'tea',
      },
      {
        id: '2',
        breakStart: '01:00 PM',
        breakEnd: '02:00 PM',
        duration: 60,
        type: 'lunch',
      },
      {
        id: '3',
        breakStart: '03:30 PM',
        breakEnd: '03:45 PM',
        duration: 15,
        type: 'tea',
      },
    ],
    tasks: [
      {
        id: '1',
        title: 'Client meeting - Project Alpha',
        timeSpent: 120,
        completed: true,
      },
      {
        id: '2',
        title: 'Email responses and follow-ups',
        timeSpent: 45,
        completed: true,
      },
      {
        id: '3',
        title: 'Sales report preparation',
        timeSpent: 90,
        completed: true,
      },
      {
        id: '4',
        title: 'Team sync meeting',
        timeSpent: 30,
        completed: true,
      },
      {
        id: '5',
        title: 'Product demo for new client',
        timeSpent: 60,
        completed: true,
      },
    ],
    notes: 'Productive day. Closed 2 deals and scheduled 3 follow-up meetings.',
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      present: 'success',
      late: 'warning',
      absent: 'error',
      half_day: 'processing',
    };
    return colors[status] || 'default';
  };

  const calculateProductiveTime = () => {
    const totalBreakTime = attendance.breaks.reduce((sum, br) => sum + br.duration, 0);
    const totalMinutes = attendance.hoursWorked * 60;
    return ((totalMinutes - totalBreakTime) / totalMinutes) * 100;
  };

  const totalTaskTime = attendance.tasks.reduce((sum, task) => sum + task.timeSpent, 0);
  const completedTasks = attendance.tasks.filter((t) => t.completed).length;

  return (
    <div>
      {/* Header */}
      <Space style={{ marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/employee/attendance')}>
          Back to Attendance
        </Button>
      </Space>

      <Title level={2}>
        <CalendarOutlined /> Attendance Details
      </Title>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Date"
              value={dayjs(attendance.date).format('MMM DD, YYYY')}
              valueStyle={{ fontSize: 18 }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hours Worked"
              value={attendance.hoursWorked}
              suffix="hrs"
              valueStyle={{ color: '#52c41a', fontSize: 20 }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Status"
              value={attendance.status.replace('_', ' ').toUpperCase()}
              valueStyle={{ fontSize: 16 }}
              prefix={
                <Tag color={getStatusColor(attendance.status)} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {attendance.status === 'present' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tasks Completed"
              value={completedTasks}
              suffix={`/ ${attendance.tasks.length}`}
              valueStyle={{ color: '#1890ff', fontSize: 20 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Check-in/out Details */}
        <Col xs={24} lg={12}>
          <Card title="Time Log" extra={<ClockCircleOutlined />}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Check-in Time">
                <Space>
                  <ClockCircleOutlined style={{ color: '#52c41a' }} />
                  <Text strong>{attendance.checkIn}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Check-out Time">
                <Space>
                  <ClockCircleOutlined style={{ color: '#ff4d4f' }} />
                  <Text strong>{attendance.checkOut || 'Not checked out yet'}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                <Space>
                  <EnvironmentOutlined style={{ color: '#1890ff' }} />
                  <Text>{attendance.location}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Total Working Hours">
                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                  {attendance.hoursWorked} hours
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Productive Time Analysis</Text>
              <Progress
                percent={Math.round(calculateProductiveTime())}
                strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                status="active"
              />
              <Text type="secondary">
                {Math.round(calculateProductiveTime())}% productive work time (excluding breaks)
              </Text>
            </Space>
          </Card>
        </Col>

        {/* Breaks Timeline */}
        <Col xs={24} lg={12}>
          <Card title="Breaks Taken" extra={<FieldTimeOutlined />}>
            {attendance.breaks.length > 0 ? (
              <>
                <Timeline
                  items={attendance.breaks.map((br) => ({
                    color: br.type === 'lunch' ? 'blue' : br.type === 'tea' ? 'green' : 'orange',
                    children: (
                      <div>
                        <Space direction="vertical" size="small">
                          <Text strong>
                            {br.type.charAt(0).toUpperCase() + br.type.slice(1)} Break
                          </Text>
                          <Text type="secondary">
                            {br.breakStart} - {br.breakEnd}
                          </Text>
                          <Text type="secondary">Duration: {br.duration} minutes</Text>
                        </Space>
                      </div>
                    ),
                  }))}
                />
                <Divider />
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Total Break Time">
                    <Text strong>
                      {attendance.breaks.reduce((sum, br) => sum + br.duration, 0)} minutes
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </>
            ) : (
              <Empty description="No breaks recorded" />
            )}
          </Card>
        </Col>

        {/* Tasks Completed */}
        <Col xs={24}>
          <Card title="Tasks & Activities" extra={<CheckCircleOutlined />}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Total Tasks"
                    value={attendance.tasks.length}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Time on Tasks"
                    value={Math.round(totalTaskTime / 60)}
                    suffix="hrs"
                    prefix={<ClockCircleOutlined />}
                  />
                </Col>
              </Row>

              <Divider />

              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {attendance.tasks.map((task) => (
                  <Card key={task.id} size="small">
                    <Row justify="space-between" align="middle">
                      <Col flex="auto">
                        <Space>
                          {task.completed ? (
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                          ) : (
                            <ClockCircleOutlined style={{ color: '#faad14', fontSize: 18 }} />
                          )}
                          <div>
                            <Text strong>{task.title}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              Time spent: {task.timeSpent} minutes
                            </Text>
                          </div>
                        </Space>
                      </Col>
                      <Col>
                        <Tag color={task.completed ? 'success' : 'processing'}>
                          {task.completed ? 'Completed' : 'In Progress'}
                        </Tag>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            </Space>
          </Card>
        </Col>

        {/* Notes */}
        {attendance.notes && (
          <Col xs={24}>
            <Card title="Daily Notes">
              <Text>{attendance.notes}</Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default AttendanceDetailsPage;

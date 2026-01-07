import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Space,
  Statistic,
  Calendar,
  Badge,
  List,
  Tag,
  Progress,
  Alert,
  Divider,
} from 'antd';
import {
  ClockCircleOutlined,
  CalendarOutlined,
  DollarOutlined,
  CreditCardOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Dayjs } from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface AttendanceStatus {
  isCheckedIn: boolean;
  checkInTime?: string;
  hoursWorked?: number;
  status: 'on_time' | 'late' | 'absent' | 'not_checked_in';
}

interface LeaveBalance {
  vacation: number;
  sick: number;
  personal: number;
}

interface UpcomingLeave {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
}

interface RecentPayslip {
  id: string;
  month: string;
  netPay: number;
  grossPay: number;
  deductions: number;
  status: string;
}

interface BillPaymentSummary {
  totalCompanies: number;
  nextDeductionAmount: number;
  nextDeductionDate: string;
}

interface Task {
  id: string;
  title: string;
  project: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
}

export const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus>({
    isCheckedIn: false,
    status: 'not_checked_in',
  });
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    vacation: 15,
    sick: 10,
    personal: 5,
  });
  const [upcomingLeaves, setUpcomingLeaves] = useState<UpcomingLeave[]>([]);
  const [recentPayslips, setRecentPayslips] = useState<RecentPayslip[]>([]);
  const [billPayments, setBillPayments] = useState<BillPaymentSummary>({
    totalCompanies: 5,
    nextDeductionAmount: 125000,
    nextDeductionDate: '2025-12-15',
  });
  const [myTasks, setMyTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Mock data - will be replaced with real API calls
      setAttendanceStatus({
        isCheckedIn: true,
        checkInTime: '08:45 AM',
        hoursWorked: 5.5,
        status: 'on_time',
      });

      setUpcomingLeaves([
        {
          id: '1',
          type: 'Vacation',
          startDate: '2025-12-20',
          endDate: '2025-12-27',
          days: 5,
          status: 'approved',
        },
      ]);

      setRecentPayslips([
        {
          id: '1',
          month: 'November 2025',
          netPay: 450000,
          grossPay: 600000,
          deductions: 150000,
          status: 'paid',
        },
        {
          id: '2',
          month: 'October 2025',
          netPay: 445000,
          grossPay: 600000,
          deductions: 155000,
          status: 'paid',
        },
      ]);

      setMyTasks([
        {
          id: '1',
          title: 'Complete Q4 report',
          project: 'Finance Dashboard',
          dueDate: '2025-12-10',
          priority: 'high',
          status: 'in_progress',
        },
        {
          id: '2',
          title: 'Review marketing materials',
          project: 'Marketing Campaign',
          dueDate: '2025-12-08',
          priority: 'medium',
          status: 'todo',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateBadge = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    // Mock: check if there's any event on this date
    if (dateStr === '2025-12-20') {
      return <Badge status="success" text="Leave" />;
    }
    return null;
  };

  const priorityColors = {
    low: 'blue',
    medium: 'orange',
    high: 'red',
  };

  const statusColors = {
    todo: 'default',
    in_progress: 'processing',
    completed: 'success',
  };

  return (
    <div>
      {/* Welcome Header */}
      <Card style={{ marginBottom: 16, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={3} style={{ color: 'white', margin: 0 }}>
              Welcome back, {user?.name || 'Employee'}!
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
              {user?.position || 'Staff Member'} • {user?.department || 'General'}
            </Text>
            <br />
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
              Employee ID: {user?.employee_number || 'EMP001'}
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<ClockCircleOutlined />}
              onClick={() => navigate('/employee/attendance')}
              style={{ background: 'white', color: '#f59e0b', border: 'none', fontWeight: 'bold' }}
            >
              {attendanceStatus.isCheckedIn ? 'Check Out' : 'Check In'}
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Today's Attendance Status */}
      {attendanceStatus.isCheckedIn && (
        <Alert
          message={
            <Space>
              <CheckCircleOutlined />
              <span>
                You checked in at {attendanceStatus.checkInTime} • {attendanceStatus.hoursWorked} hours worked today
              </span>
            </Space>
          }
          type="success"
          showIcon={false}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Quick Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Leave Balance"
              value={leaveBalance.vacation}
              suffix="days"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Vacation days remaining
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card onClick={() => navigate('/employee/payslips')} style={{ cursor: 'pointer' }}>
            <Statistic
              title="Last Payslip"
              value={recentPayslips[0]?.netPay || 0}
              suffix="RWF"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {recentPayslips[0]?.month || 'N/A'}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card onClick={() => navigate('/employee/bill-payments')} style={{ cursor: 'pointer' }}>
            <Statistic
              title="Bill Payments"
              value={billPayments.totalCompanies}
              suffix="companies"
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Next deduction: {billPayments.nextDeductionAmount.toLocaleString()} RWF
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="My Tasks"
              value={myTasks.length}
              suffix="active"
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {myTasks.filter((t) => t.status === 'in_progress').length} in progress
            </Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* My Tasks */}
          <Card
            title={
              <Space>
                <ProjectOutlined />
                <span>My Tasks</span>
              </Space>
            }
            extra={<Button type="link" onClick={() => navigate('/employee/projects')}>View All</Button>}
            style={{ marginBottom: 16 }}
          >
            <List
              dataSource={myTasks}
              renderItem={(task) => (
                <List.Item
                  actions={[
                    <Tag color={priorityColors[task.priority]}>{task.priority.toUpperCase()}</Tag>,
                    <Tag color={statusColors[task.status]}>{task.status.replace('_', ' ').toUpperCase()}</Tag>,
                  ]}
                >
                  <List.Item.Meta
                    title={<Text strong>{task.title}</Text>}
                    description={
                      <Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {task.project}
                        </Text>
                        <Divider type="vertical" />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Due: {task.dueDate}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No active tasks' }}
            />
          </Card>

          {/* Recent Payslips */}
          <Card
            title={
              <Space>
                <DollarOutlined />
                <span>Recent Payslips</span>
              </Space>
            }
            extra={<Button type="link" onClick={() => navigate('/employee/payslips')}>View All</Button>}
          >
            <List
              dataSource={recentPayslips}
              renderItem={(payslip) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      icon={<FileTextOutlined />}
                      onClick={() => navigate(`/employee/payslips/${payslip.id}`)}
                    >
                      View
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={<Text strong>{payslip.month}</Text>}
                    description={
                      <Space split={<Divider type="vertical" />}>
                        <Text>
                          Gross: <Text strong>{payslip.grossPay.toLocaleString()} RWF</Text>
                        </Text>
                        <Text>
                          Deductions: <Text type="secondary">{payslip.deductions.toLocaleString()} RWF</Text>
                        </Text>
                        <Text>
                          Net: <Text strong style={{ color: '#52c41a' }}>{payslip.netPay.toLocaleString()} RWF</Text>
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Upcoming Leaves */}
          <Card
            title={
              <Space>
                <CalendarOutlined />
                <span>Upcoming Leaves</span>
              </Space>
            }
            extra={<Button type="link" onClick={() => navigate('/employee/leave')}>Request Leave</Button>}
            style={{ marginBottom: 16 }}
          >
            {upcomingLeaves.length === 0 ? (
              <Text type="secondary">No upcoming leaves</Text>
            ) : (
              <List
                dataSource={upcomingLeaves}
                renderItem={(leave) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{leave.type}</Text>
                          <Tag color="green">{leave.status.toUpperCase()}</Tag>
                        </Space>
                      }
                      description={
                        <>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {leave.startDate} to {leave.endDate}
                          </Text>
                          <br />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {leave.days} day(s)
                          </Text>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>

          {/* Leave Balance Breakdown */}
          <Card
            title="Leave Balance"
            extra={<Button type="link" onClick={() => navigate('/employee/leave')}>Details</Button>}
            style={{ marginBottom: 16 }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Vacation</Text>
                  <Text strong>{leaveBalance.vacation} days</Text>
                </div>
                <Progress percent={(leaveBalance.vacation / 20) * 100} showInfo={false} strokeColor="#52c41a" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Sick Leave</Text>
                  <Text strong>{leaveBalance.sick} days</Text>
                </div>
                <Progress percent={(leaveBalance.sick / 12) * 100} showInfo={false} strokeColor="#1890ff" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Personal</Text>
                  <Text strong>{leaveBalance.personal} days</Text>
                </div>
                <Progress percent={(leaveBalance.personal / 6) * 100} showInfo={false} strokeColor="#faad14" />
              </div>
            </Space>
          </Card>

          {/* Bill Payments Alert */}
          <Card
            title={
              <Space>
                <CreditCardOutlined />
                <span>Bill Payments</span>
              </Space>
            }
            extra={<Button type="link" onClick={() => navigate('/employee/bill-payments')}>Manage</Button>}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="Next Deduction"
                description={
                  <>
                    <Text strong style={{ fontSize: 16 }}>
                      {billPayments.nextDeductionAmount.toLocaleString()} RWF
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      will be deducted on {billPayments.nextDeductionDate}
                    </Text>
                  </>
                }
                type="info"
                showIcon
                icon={<WarningOutlined />}
              />
              <Button
                type="primary"
                block
                onClick={() => navigate('/employee/bill-payments')}
                style={{ background: '#f59e0b', border: 'none' }}
              >
                Manage {billPayments.totalCompanies} Bill Payment Companies
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDashboardPage;

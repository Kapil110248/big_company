import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
  Tag,
  message,
  Modal,
  TimePicker,
  Select,
  Alert,
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FieldTimeOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked: number;
  status: 'present' | 'late' | 'absent' | 'half_day';
  location: string;
}

interface TodayStatus {
  isCheckedIn: boolean;
  checkInTime?: string;
  checkInLocation?: string;
  hoursWorked: number;
}

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [todayStatus, setTodayStatus] = useState<TodayStatus>({
    isCheckedIn: false,
    hoursWorked: 0,
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInLocation, setCheckInLocation] = useState('office');
  const [monthStats, setMonthStats] = useState({
    present: 18,
    absent: 2,
    late: 3,
    totalHours: 144,
  });

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      // Mock data - will be replaced with real API
      setTodayStatus({
        isCheckedIn: false,
        hoursWorked: 0,
      });

      setAttendanceRecords([
        {
          id: '1',
          date: '2025-12-02',
          checkIn: '08:45 AM',
          checkOut: '05:30 PM',
          hoursWorked: 8.75,
          status: 'present',
          location: 'Office',
        },
        {
          id: '2',
          date: '2025-12-01',
          checkIn: '09:15 AM',
          checkOut: '05:45 PM',
          hoursWorked: 8.5,
          status: 'late',
          location: 'Office',
        },
        {
          id: '3',
          date: '2025-11-30',
          checkIn: '08:30 AM',
          checkOut: '05:15 PM',
          hoursWorked: 8.75,
          status: 'present',
          location: 'Remote',
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch attendance data:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const now = dayjs();
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setTodayStatus({
        isCheckedIn: true,
        checkInTime: now.format('hh:mm A'),
        checkInLocation: checkInLocation,
        hoursWorked: 0,
      });

      message.success(`Checked in successfully at ${now.format('hh:mm A')}!`);
      setShowCheckInModal(false);
    } catch (error) {
      message.error('Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    Modal.confirm({
      title: 'Check Out',
      content: 'Are you sure you want to check out for today?',
      okText: 'Check Out',
      cancelText: 'Cancel',
      onOk: async () => {
        setLoading(true);
        try {
          const now = dayjs();
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Calculate hours worked (mock)
          const hoursWorked = 8.5;

          setTodayStatus({
            isCheckedIn: false,
            hoursWorked: 0,
          });

          const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            date: now.format('YYYY-MM-DD'),
            checkIn: todayStatus.checkInTime || '08:30 AM',
            checkOut: now.format('hh:mm A'),
            hoursWorked,
            status: 'present',
            location: todayStatus.checkInLocation || 'Office',
          };

          setAttendanceRecords([newRecord, ...attendanceRecords]);

          message.success(`Checked out successfully! You worked ${hoursWorked} hours today.`);
        } catch (error) {
          message.error('Failed to check out. Please try again.');
        } finally {
          setLoading(false);
        }
      },
    });
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

  const getDateBadge = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const record = attendanceRecords.find((r) => r.date === dateStr);

    if (record) {
      const statusConfig: Record<string, { status: any; text: string }> = {
        present: { status: 'success', text: 'Present' },
        late: { status: 'warning', text: 'Late' },
        absent: { status: 'error', text: 'Absent' },
        half_day: { status: 'processing', text: 'Half Day' },
      };
      const config = statusConfig[record.status];
      return <Badge status={config.status} text={config.text} />;
    }
    return null;
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Check In',
      dataIndex: 'checkIn',
      key: 'checkIn',
    },
    {
      title: 'Check Out',
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (checkOut?: string) => checkOut || '-',
    },
    {
      title: 'Hours Worked',
      dataIndex: 'hoursWorked',
      key: 'hoursWorked',
      render: (hours: number) => `${hours.toFixed(2)}h`,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => (
        <Space>
          <EnvironmentOutlined />
          <span>{location}</span>
        </Space>
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
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: AttendanceRecord) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/employee/attendance/${record.id}`)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <ClockCircleOutlined style={{ marginRight: 8 }} />
          Attendance
        </Title>
        <Text type="secondary">Track your daily attendance and work hours</Text>
      </div>

      {/* Today's Status Card */}
      <Card
        style={{
          marginBottom: 24,
          background: todayStatus.isCheckedIn
            ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
            : 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size="small">
              <Text style={{ color: 'white', fontSize: 16 }}>
                {todayStatus.isCheckedIn ? 'You are checked in!' : 'Ready to start your day?'}
              </Text>
              {todayStatus.isCheckedIn && (
                <>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                    Check-in time: {todayStatus.checkInTime}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                    Location: {todayStatus.checkInLocation}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                    Hours worked: {todayStatus.hoursWorked.toFixed(2)}h
                  </Text>
                </>
              )}
            </Space>
          </Col>
          <Col>
            {todayStatus.isCheckedIn ? (
              <Button
                type="primary"
                size="large"
                danger
                icon={<CloseCircleOutlined />}
                onClick={handleCheckOut}
                loading={loading}
                style={{ fontWeight: 'bold' }}
              >
                Check Out
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={() => setShowCheckInModal(true)}
                loading={loading}
                style={{ background: 'white', color: '#1890ff', border: 'none', fontWeight: 'bold' }}
              >
                Check In
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Present"
              value={monthStats.present}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="days"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Late"
              value={monthStats.late}
              prefix={<FieldTimeOutlined style={{ color: '#faad14' }} />}
              suffix="days"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Absent"
              value={monthStats.absent}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              suffix="days"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Hours"
              value={monthStats.totalHours}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              suffix="hrs"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Calendar View */}
        <Col xs={24} lg={12}>
          <Card title="Attendance Calendar" extra={<CalendarOutlined />}>
            <Calendar fullscreen={false} dateCellRender={getDateBadge} />
          </Card>
        </Col>

        {/* Recent Records */}
        <Col xs={24} lg={12}>
          <Card title="Recent Attendance" extra={<Text type="secondary">Last 30 days</Text>}>
            <Table
              dataSource={attendanceRecords}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Check-in Modal */}
      <Modal
        title="Check In"
        open={showCheckInModal}
        onCancel={() => setShowCheckInModal(false)}
        onOk={handleCheckIn}
        okText="Check In"
        confirmLoading={loading}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Alert
            message={`Checking in at ${dayjs().format('hh:mm A')}`}
            type="info"
            showIcon
            icon={<ClockCircleOutlined />}
          />

          <div>
            <Text strong>Work Location</Text>
            <Select
              value={checkInLocation}
              onChange={setCheckInLocation}
              style={{ width: '100%', marginTop: 8 }}
              size="large"
            >
              <Option value="office">Office</Option>
              <Option value="remote">Remote / Work from Home</Option>
              <Option value="client_site">Client Site</Option>
              <Option value="field">Field Work</Option>
            </Select>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default AttendancePage;

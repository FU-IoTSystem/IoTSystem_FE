import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Card,
  Table,
  Button,
  Input,
  Select,
  Modal,
  Form,
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Tooltip,
  Avatar,
  Badge,
  Divider,
  List,
  Timeline,
  Progress,
  Switch,
  DatePicker,
  Upload,
  Drawer,
  Tabs,
  Alert,
  Descriptions,
  Steps,
  Result,
  Empty,
  Skeleton,
  Spin,
  notification,
  Transfer,
  Popconfirm,
  Radio,
  Checkbox,
  InputNumber
} from 'antd';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  ReadOutlined,
  BookOutlined,
  LogoutOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  SearchOutlined,
  FilterOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  BellOutlined,
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  TrophyOutlined,
  SafetyCertificateOutlined,
  BugOutlined,
  BuildOutlined,
  CarOutlined,
  HomeOutlined,
  ExperimentOutlined,
  RobotOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  HeartOutlined,
  StarOutlined,
  LikeOutlined,
  DislikeOutlined,
  QuestionCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckOutlined,
  StopOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
  UserAddOutlined,
  StepBackwardOutlined,
  FastForwardOutlined,
  FastBackwardOutlined,
  ShuffleOutlined,
  RetweetOutlined,
  SwapOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ImportOutlined,
  ExportOutlined,
  ToolOutlined,
  GroupOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { mockSemesters, mockStudents, mockLecturers, mockKits } from './mocks';
import { LoadingOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Helper functions
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeInOut" }
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'approved':
    case 'completed':
      return 'success';
    case 'pending':
    case 'in_progress':
      return 'warning';
    case 'inactive':
    case 'rejected':
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

function AcademicAffairsPortal({ user, onLogout }) {
  console.log('AcademicAffairsPortal received user:', user);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  
  // State for data management
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [kits, setKits] = useState([]);

  // State for modals and forms
  const [semesterModal, setSemesterModal] = useState({ visible: false, data: {} });
  const [studentModal, setStudentModal] = useState({ visible: false, data: {} });
  const [lecturerModal, setLecturerModal] = useState({ visible: false, data: {} });
  const [kitModal, setKitModal] = useState({ visible: false, data: {} });
  const [iotSubjectModal, setIotSubjectModal] = useState({ visible: false, data: {} });

  // Form instances
  const [semesterForm] = Form.useForm();
  const [studentForm] = Form.useForm();
  const [lecturerForm] = Form.useForm();
  const [kitForm] = Form.useForm();
  const [iotSubjectForm] = Form.useForm();

  // State for semester-based management
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [iotSubjects, setIotSubjects] = useState([]);

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSemesters(mockSemesters);
      setStudents(mockStudents);
      setLecturers(mockLecturers);
      setKits(mockKits);

      // Initialize IOT subjects
      const iotSubjectsData = [
        {
          id: 1,
          name: 'Internet of Things Fundamentals',
          semesterId: 1,
          semesterName: 'Fall 2024',
          lecturerId: 4,
          lecturerName: 'Dr. IoT Specialist',
          capacity: 30,
          enrolledCount: 28,
          status: 'Active'
        },
        {
          id: 2,
          name: 'IoT Sensor Networks',
          semesterId: 1,
          semesterName: 'Fall 2024',
          lecturerId: 5,
          lecturerName: 'Dr. Sensor Expert',
          capacity: 25,
          enrolledCount: 22,
          status: 'Active'
        },
        {
          id: 3,
          name: 'Embedded Systems Design',
          semesterId: 2,
          semesterName: 'Spring 2025',
          lecturerId: 6,
          lecturerName: 'Dr. Embedded Systems',
          capacity: 20,
          enrolledCount: 0,
          status: 'Upcoming'
        },
        {
          id: 4,
          name: 'IoT Security and Privacy',
          semesterId: 2,
          semesterName: 'Spring 2025',
          lecturerId: 7,
          lecturerName: 'Dr. Security Analyst',
          capacity: 25,
          enrolledCount: 0,
          status: 'Upcoming'
        }
      ];
      setIotSubjects(iotSubjectsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load data',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  // Import/Export Functions
  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, `${filename}.xlsx`);
  };

  const importFromExcel = (file, type) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleExportStudents = () => {
    const studentData = students.map(student => ({
      'Student ID': student.id,
      'Name': student.name,
      'Email': student.email,
      'Role': student.role,
      'Status': student.status,
      'Created Date': student.createdAt,
      'Last Login': student.lastLogin
    }));
    exportToExcel(studentData, 'students_list');
    notification.success({
      message: 'Export Successful',
      description: 'Student list exported to Excel file',
      placement: 'topRight',
    });
  };

  const handleExportLecturers = () => {
    const lecturerData = lecturers.map(lecturer => ({
      'Lecturer ID': lecturer.id,
      'Name': lecturer.name,
      'Email': lecturer.email,
      'Department': lecturer.department,
      'Specialization': lecturer.specialization,
      'Status': lecturer.status,
      'Hire Date': lecturer.hireDate
    }));
    exportToExcel(lecturerData, 'lecturers_list');
    notification.success({
      message: 'Export Successful',
      description: 'Lecturer list exported to Excel file',
      placement: 'topRight',
    });
  };

  const handleImportStudents = async (file) => {
    try {
      const importedData = await importFromExcel(file, 'students');
      const newStudents = importedData.map((student, index) => ({
        id: Date.now() + index,
        name: student.Name || student.name,
        email: student.Email || student.email,
        role: 'student',
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        password: 'default123' // Default password for imported students
      }));
      
      setStudents(prev => [...prev, ...newStudents]);
      
      notification.success({
        message: 'Import Successful',
        description: `${newStudents.length} students imported successfully`,
        placement: 'topRight',
      });
    } catch (error) {
      notification.error({
        message: 'Import Failed',
        description: 'Failed to import students. Please check file format.',
        placement: 'topRight',
      });
    }
  };

  const handleImportLecturers = async (file) => {
    try {
      const importedData = await importFromExcel(file, 'lecturers');
      const newLecturers = importedData.map((lecturer, index) => ({
        id: Date.now() + index,
        name: lecturer.Name || lecturer.name,
        email: lecturer.Email || lecturer.email,
        department: lecturer.Department || lecturer.department || 'Information Technology',
        specialization: lecturer.Specialization || lecturer.specialization || 'General',
        status: 'Active',
        hireDate: new Date().toISOString().split('T')[0]
      }));
      
      setLecturers(prev => [...prev, ...newLecturers]);
      
      notification.success({
        message: 'Import Successful',
        description: `${newLecturers.length} lecturers imported successfully`,
        placement: 'topRight',
      });
    } catch (error) {
      notification.error({
        message: 'Import Failed',
        description: 'Failed to import lecturers. Please check file format.',
        placement: 'topRight',
      });
    }
  };

  // Kit Management Functions
  const handleExportKits = () => {
    try {
      const data = kits.map(kit => ({
        'Kit Name': kit.name,
        'Category': kit.category,
        'Quantity': kit.quantity,
        'Location': kit.location,
        'Status': kit.status,
        'Price': kit.price
      }));
      exportToExcel(data, 'kits_export');
      message.success('Kits exported successfully');
    } catch (error) {
      console.error('Error exporting kits:', error);
      message.error('Failed to export kits');
    }
  };

  const handleViewKitDetails = (record) => {
    Modal.info({
      title: `Kit Details: ${record.name}`,
      width: 600,
      content: (
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Kit Name">{record.name}</Descriptions.Item>
          <Descriptions.Item label="Category">{record.category}</Descriptions.Item>
          <Descriptions.Item label="Quantity">{record.quantity}</Descriptions.Item>
          <Descriptions.Item label="Location">{record.location}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Price">${record.price}</Descriptions.Item>
        </Descriptions>
      ),
    });
  };

  const handleEditKit = (record) => {
    kitForm.setFieldsValue(record);
    setKitModal({ visible: true, data: record });
  };

  const handleDeleteKit = (record) => {
    Modal.confirm({
      title: 'Delete Kit',
      content: `Are you sure you want to delete "${record.name}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        setKits(prev => prev.filter(kit => kit.id !== record.id));
        message.success('Kit deleted successfully');
      },
    });
  };



  // IOT Subject Management Functions
  const handleAddIotSubject = () => {
    iotSubjectForm.resetFields();
    setIotSubjectModal({ visible: true, data: {} });
  };

  const handleEditIotSubject = (record) => {
    iotSubjectForm.setFieldsValue(record);
    setIotSubjectModal({ visible: true, data: record });
  };

  const handleViewIotSubjectStudents = (record) => {
    // Mock enrolled students data since we removed enrollments
    const enrolledStudents = students.slice(0, Math.min(record.enrolledCount, 10)).map(student => student.name);

    Modal.info({
      title: `Students in ${record.name}`,
      width: 600,
      content: (
        <div>
          <Alert
            message={`Total Enrolled: ${enrolledStudents.length}/${record.capacity}`}
            type="info"
            style={{ marginBottom: 16 }}
          />
          <List
            dataSource={enrolledStudents}
            renderItem={(student, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={student}
                  description={`Student #${index + 1}`}
                />
              </List.Item>
            )}
          />
        </div>
      ),
    });
  };

  const handleDeleteIotSubject = (record) => {
    Modal.confirm({
      title: 'Delete IOT Subject',
      content: `Are you sure you want to delete "${record.name}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        setIotSubjects(prev => prev.filter(subject => subject.id !== record.id));
        message.success('IOT Subject deleted successfully');
      },
    });
  };

  // Form submission handlers
  const handleKitSubmit = () => {
    kitForm.validateFields().then(values => {
      if (kitModal.data.id) {
        // Edit existing kit
        setKits(prev => prev.map(kit => 
          kit.id === kitModal.data.id ? { ...kit, ...values } : kit
        ));
        message.success('Kit updated successfully');
      } else {
        // Add new kit
        const newKit = {
          id: Date.now(),
          ...values,
          status: 'AVAILABLE'
        };
        setKits(prev => [...prev, newKit]);
        message.success('Kit added successfully');
      }
      setKitModal({ visible: false, data: {} });
      kitForm.resetFields();
    });
  };



  const handleIotSubjectSubmit = () => {
    iotSubjectForm.validateFields().then(values => {
      if (iotSubjectModal.data.id) {
        // Edit existing IOT subject
        setIotSubjects(prev => prev.map(subject => 
          subject.id === iotSubjectModal.data.id ? { ...subject, ...values } : subject
        ));
        message.success('IOT Subject updated successfully');
      } else {
        // Add new IOT subject
        const newSubject = {
          id: Date.now(),
          ...values,
          status: 'ACTIVE'
        };
        setIotSubjects(prev => [...prev, newSubject]);
        message.success('IOT Subject created successfully');
      }
      setIotSubjectModal({ visible: false, data: {} });
      iotSubjectForm.resetFields();
    });
  };

  // Student Management Functions
  const handleAddStudent = () => {
    studentForm.resetFields();
    setStudentModal({ visible: true, data: {} });
  };

  const handleEditStudent = (record) => {
    // Convert date string to dayjs object for DatePicker
    const formData = {
      ...record,
      enrollmentDate: record.enrollmentDate ? dayjs(record.enrollmentDate) : null
    };
    studentForm.setFieldsValue(formData);
    setStudentModal({ visible: true, data: record });
  };

  const handleDeleteStudent = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this student?',
      content: `This will permanently delete ${record.name} from the system.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setStudents(prev => prev.filter(student => student.id !== record.id));
        message.success('Student deleted successfully');
      },
    });
  };

  const handleStudentSubmit = () => {
    studentForm.validateFields().then(values => {
      // Convert dayjs date to string format
      const studentData = {
        ...values,
        enrollmentDate: values.enrollmentDate ? values.enrollmentDate.format('YYYY-MM-DD') : null
      };

      if (studentModal.data.id) {
        setStudents(prev => prev.map(student =>
          student.id === studentModal.data.id ? { ...student, ...studentData } : student
        ));
        message.success('Student updated successfully');
      } else {
        const newStudent = {
          id: Date.now(),
          ...studentData,
          status: 'ACTIVE'
        };
        setStudents(prev => [...prev, newStudent]);
        message.success('Student created successfully');
      }
      setStudentModal({ visible: false, data: {} });
      studentForm.resetFields();
    });
  };

  // Lecturer Management Functions
  const handleAddLecturer = () => {
    lecturerForm.resetFields();
    setLecturerModal({ visible: true, data: {} });
  };

  const handleEditLecturer = (record) => {
    // Convert date string to dayjs object for DatePicker
    const formData = {
      ...record,
      hireDate: record.hireDate ? dayjs(record.hireDate) : null
    };
    lecturerForm.setFieldsValue(formData);
    setLecturerModal({ visible: true, data: record });
  };

  const handleDeleteLecturer = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this lecturer?',
      content: `This will permanently delete ${record.name} from the system.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setLecturers(prev => prev.filter(lecturer => lecturer.id !== record.id));
        message.success('Lecturer deleted successfully');
      },
    });
  };

  const handleLecturerSubmit = () => {
    lecturerForm.validateFields().then(values => {
      // Convert dayjs date to string format
      const lecturerData = {
        ...values,
        hireDate: values.hireDate ? values.hireDate.format('YYYY-MM-DD') : null
      };

      if (lecturerModal.data.id) {
        setLecturers(prev => prev.map(lecturer =>
          lecturer.id === lecturerModal.data.id ? { ...lecturer, ...lecturerData } : lecturer
        ));
        message.success('Lecturer updated successfully');
      } else {
        const newLecturer = {
          id: Date.now(),
          ...lecturerData,
          status: 'ACTIVE'
        };
        setLecturers(prev => [...prev, newLecturer]);
        message.success('Lecturer created successfully');
      }
      setLecturerModal({ visible: false, data: {} });
      lecturerForm.resetFields();
    });
  };

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  // Menu items for Academic Affairs Portal
  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'semesters', icon: <ReadOutlined />, label: 'Semesters' },
    { key: 'students', icon: <UserOutlined />, label: 'Students' },
    { key: 'lecturers', icon: <TeamOutlined />, label: 'Lecturers' },
    { key: 'iot-subjects', icon: <ToolOutlined />, label: 'IOT Subjects' },
    { key: 'kits', icon: <ToolOutlined />, label: 'Kits' },
  ];

  if (!user) {
    console.log('AcademicAffairsPortal: No user provided, showing fallback');
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Authentication Required</h2>
          <p>Please log in to access the Academic Affairs Portal.</p>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Sidebar */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000,
          left: 0,
          top: 0,
          borderRight: '1px solid rgba(255,255,255,0.2)'
        }}
      >
        {/* Logo Section */}
        <motion.div 
          style={{ 
            height: 80, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            margin: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Title level={4} style={{ margin: 0, color: '#fff', fontWeight: 'bold' }}>
            {collapsed ? 'ACA' : 'Academic Affairs'}
          </Title>
        </motion.div>
        
        {/* Navigation Menu */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            borderRight: 0,
            background: 'transparent',
            padding: '0 16px'
          }}
        />
      </Sider>
      
      {/* Main Content Area */}
      <Layout style={{ 
        marginLeft: collapsed ? 80 : 200, 
        transition: 'margin-left 0.3s ease-in-out',
        background: 'transparent'
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Header style={{ 
            padding: '0 32px', 
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 999,
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            height: 80
          }}>
            {/* Left Section */}
            <Space size="large">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{ 
                    fontSize: '18px', 
                    width: 48, 
                    height: 48,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea'
                  }}
                />
              </motion.div>
              <motion.div
                key={selectedKey}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Title level={2} style={{ margin: 0, color: '#2c3e50', fontWeight: 'bold' }}>
                  {menuItems.find(item => item.key === selectedKey)?.label}
                </Title>
              </motion.div>
            </Space>
            
            {/* Right Section */}
            <Space size="large">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge count={3} size="small" style={{ cursor: 'pointer' }}>
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <BellOutlined />
                  </div>
                </Badge>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Avatar 
                  icon={<UserOutlined />} 
                  size={48}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: '3px solid rgba(255,255,255,0.3)'
                  }}
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  type="primary"
                  icon={<LogoutOutlined />} 
                  onClick={onLogout}
                  style={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    height: 40,
                    padding: '0 20px',
                    fontWeight: 'bold'
                  }}
                >
                  Logout
                </Button>
              </motion.div>
            </Space>
          </Header>
        </motion.div>
        
        {/* Content Area */}
        <Content style={{ 
          margin: '24px', 
          padding: '32px', 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          minHeight: 280,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <Spin 
            spinning={loading}
            tip="Loading data..."
            size="large"
            indicator={
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <LoadingOutlined style={{ fontSize: 24 }} />
              </motion.div>
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedKey}
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                {selectedKey === 'dashboard' && <DashboardContent semesters={semesters} students={students} lecturers={lecturers} kits={kits} iotSubjects={iotSubjects} />}
                {selectedKey === 'semesters' && <SemesterManagement semesters={semesters} setSemesters={setSemesters} semesterModal={semesterModal} setSemesterModal={setSemesterModal} semesterForm={semesterForm} />}
                {selectedKey === 'students' && <StudentManagement students={students} setStudents={setStudents} studentModal={studentModal} setStudentModal={setStudentModal} studentForm={studentForm} handleExportStudents={handleExportStudents} handleImportStudents={handleImportStudents} handleAddStudent={handleAddStudent} handleEditStudent={handleEditStudent} handleDeleteStudent={handleDeleteStudent} />}
                {selectedKey === 'lecturers' && <LecturerManagement lecturers={lecturers} setLecturers={setLecturers} lecturerModal={lecturerModal} setLecturerModal={setLecturerModal} lecturerForm={lecturerForm} handleExportLecturers={handleExportLecturers} handleImportLecturers={handleImportLecturers} handleAddLecturer={handleAddLecturer} handleEditLecturer={handleEditLecturer} handleDeleteLecturer={handleDeleteLecturer} />}
                {selectedKey === 'iot-subjects' && <IotSubjectsManagement iotSubjects={iotSubjects} setIotSubjects={setIotSubjects} selectedSemester={selectedSemester} setSelectedSemester={setSelectedSemester} semesters={semesters} handleAddIotSubject={handleAddIotSubject} handleEditIotSubject={handleEditIotSubject} handleViewIotSubjectStudents={handleViewIotSubjectStudents} handleDeleteIotSubject={handleDeleteIotSubject} />}
                {selectedKey === 'kits' && <KitsManagement kits={kits} setKits={setKits} handleExportKits={handleExportKits} handleViewKitDetails={handleViewKitDetails} />}
              </motion.div>
            </AnimatePresence>
          </Spin>
        </Content>
      </Layout>

      {/* Kit Modal */}
      <Modal
        title={kitModal.data.id ? "Edit Kit" : "Add Kit"}
        open={kitModal.visible}
        onOk={handleKitSubmit}
        onCancel={() => setKitModal({ visible: false, data: {} })}
        width={600}
        okText={kitModal.data.id ? "Update" : "Add"}
        cancelText="Cancel"
      >
        <Form form={kitForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Kit Name"
                rules={[{ required: true, message: 'Please enter kit name' }]}
              >
                <Input placeholder="Enter kit name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder="Select category">
                  <Option value="Sensors">Sensors</Option>
                  <Option value="Microcontrollers">Microcontrollers</Option>
                  <Option value="Actuators">Actuators</Option>
                  <Option value="Communication">Communication</Option>
                  <Option value="Power">Power</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="quantity"
                label="Quantity"
                rules={[{ required: true, message: 'Please enter quantity' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter quantity" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: 'Please enter price' }]}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Enter price" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please enter location' }]}
          >
            <Input placeholder="Enter location" />
          </Form.Item>
        </Form>
      </Modal>



      {/* Student Modal */}
      <Modal
        title={studentModal.data.id ? "Edit Student" : "Add Student"}
        open={studentModal.visible}
        onOk={handleStudentSubmit}
        onCancel={() => setStudentModal({ visible: false, data: {} })}
        width={600}
        okText={studentModal.data.id ? "Update" : "Add"}
        cancelText="Cancel"
      >
        <Form form={studentForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Student Name"
                rules={[{ required: true, message: 'Please enter student name' }]}
              >
                <Input placeholder="Enter student name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="Student ID"
                rules={[{ required: true, message: 'Please enter student ID' }]}
              >
                <Input placeholder="Enter student ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="major"
                label="Major"
                rules={[{ required: true, message: 'Please enter major' }]}
              >
                <Input placeholder="Enter major" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="enrollmentDate"
            label="Enrollment Date"
            rules={[{ required: true, message: 'Please select enrollment date' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Select enrollment date" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Lecturer Modal */}
      <Modal
        title={lecturerModal.data.id ? "Edit Lecturer" : "Add Lecturer"}
        open={lecturerModal.visible}
        onOk={handleLecturerSubmit}
        onCancel={() => setLecturerModal({ visible: false, data: {} })}
        width={600}
        okText={lecturerModal.data.id ? "Update" : "Add"}
        cancelText="Cancel"
      >
        <Form form={lecturerForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Lecturer Name"
                rules={[{ required: true, message: 'Please enter lecturer name' }]}
              >
                <Input placeholder="Enter lecturer name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Please enter department' }]}
              >
                <Input placeholder="Enter department" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="specialization"
                label="Specialization"
                rules={[{ required: true, message: 'Please enter specialization' }]}
              >
                <Input placeholder="Enter specialization" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="hireDate"
            label="Hire Date"
            rules={[{ required: true, message: 'Please select hire date' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Select hire date" />
          </Form.Item>
        </Form>
      </Modal>

      {/* IOT Subject Modal */}
      <Modal
        title={iotSubjectModal.data.id ? "Edit IOT Subject" : "Add IOT Subject"}
        open={iotSubjectModal.visible}
        onOk={handleIotSubjectSubmit}
        onCancel={() => setIotSubjectModal({ visible: false, data: {} })}
        width={600}
        okText={iotSubjectModal.data.id ? "Update" : "Add"}
        cancelText="Cancel"
      >
        <Form form={iotSubjectForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Subject Name"
                rules={[{ required: true, message: 'Please enter subject name' }]}
              >
                <Input placeholder="Enter subject name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="semesterId"
                label="Semester"
                rules={[{ required: true, message: 'Please select semester' }]}
              >
                <Select placeholder="Select semester">
                  {semesters.map(semester => (
                    <Option key={semester.id} value={semester.id}>{semester.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lecturerId"
                label="Lecturer"
                rules={[{ required: true, message: 'Please select lecturer' }]}
              >
                <Select placeholder="Select lecturer">
                  {lecturers.map(lecturer => (
                    <Option key={lecturer.id} value={lecturer.id}>{lecturer.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="capacity"
                label="Capacity"
                rules={[{ required: true, message: 'Please enter capacity' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Enter capacity" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Layout>
  );
}

// Dashboard Component
const DashboardContent = ({ semesters, students, lecturers, kits, iotSubjects }) => {
  // Calculate statistics
  const activeSemesters = semesters.filter(s => s.status === 'Active').length;
  const totalStudents = students.length;
  const totalLecturers = lecturers.length;
  const availableKits = kits.filter(k => k.status === 'AVAILABLE').length;
  const activeIotSubjects = iotSubjects.filter(s => s.status === 'Active').length;
  
  // Quick stats for charts
  const enrollmentTrend = [
    { month: 'Jan', count: 45 },
    { month: 'Feb', count: 52 },
    { month: 'Mar', count: 38 },
    { month: 'Apr', count: 61 },
    { month: 'May', count: 55 },
    { month: 'Jun', count: 48 }
  ];

  return (
    <div>
      {/* Welcome Header */}
      <motion.div 
        variants={cardVariants} 
        initial="hidden" 
        animate="visible"
        style={{ marginBottom: '24px' }}
      >
        <Card 
          style={{ 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: 'white'
          }}
        >
          <Row align="middle" gutter={24}>
            <Col xs={24} md={16}>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                Welcome back, Academic Affairs! 👋
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                Here's what's happening in your academic system today
              </Text>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '48px' }}>📚</div>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Main Statistics Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card 
              style={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{activeSemesters}</div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>Active Semesters</div>
                  </div>
                  <ReadOutlined style={{ fontSize: '32px', opacity: 0.8 }} />
                </div>
                <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
                  {semesters.length} total semesters
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card 
              style={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none'
              }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalStudents}</div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>Total Students</div>
                  </div>
                  <UserOutlined style={{ fontSize: '32px', opacity: 0.8 }} />
                </div>
                <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
                  {totalStudents} total students
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card 
              style={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none'
              }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{totalLecturers}</div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>Total Lecturers</div>
                  </div>
                  <TeamOutlined style={{ fontSize: '32px', opacity: 0.8 }} />
                </div>
                <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
                  {activeIotSubjects} active IoT subjects
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card 
              style={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                border: 'none'
              }}
            >
              <div style={{ color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{availableKits}</div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>Available Kits</div>
                  </div>
                  <ToolOutlined style={{ fontSize: '32px', opacity: 0.8 }} />
                </div>
                <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.7 }}>
                  {kits.length} total kits
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Charts and Analytics Section */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={16}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChartOutlined style={{ color: '#667eea' }} />
                  <span>Enrollment Trends</span>
                </div>
              }
              style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#666' }}>
                  <BarChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <div>Enrollment trend visualization</div>
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>
                    {enrollmentTrend.map(item => `${item.month}: ${item.count}`).join(' | ')}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
        
        <Col xs={24} lg={8}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PieChartOutlined style={{ color: '#f093fb' }} />
                  <span>System Overview</span>
                </div>
              }
              style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', color: '#666' }}>
                  <PieChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <div>System distribution chart</div>
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>
                    Students: {totalStudents} | Lecturers: {totalLecturers} | Kits: {kits.length}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ThunderboltOutlined style={{ color: '#fa8c16' }} />
                  <span>Quick Actions</span>
                </div>
              }
              style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Button 
                    type="primary" 
                    icon={<UserAddOutlined />} 
                    block
                    style={{ 
                      height: '80px', 
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none'
                    }}
                  >
                    <div>Add Student</div>
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    type="primary" 
                    icon={<TeamOutlined />} 
                    block
                    style={{ 
                      height: '80px', 
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      border: 'none'
                    }}
                  >
                    <div>Add Lecturer</div>
                  </Button>
                </Col>

                <Col span={12}>
                  <Button 
                    type="primary" 
                    icon={<ToolOutlined />} 
                    block
                    style={{ 
                      height: '80px', 
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      border: 'none'
                    }}
                  >
                    <div>Manage Kits</div>
                  </Button>
                </Col>
              </Row>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* System Status and Performance */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DashboardOutlined style={{ color: '#722ed1' }} />
                  <span>System Performance</span>
                </div>
              }
              style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress 
                      type="circle" 
                      percent={85} 
                      format={() => '85%'}
                      strokeColor="#667eea"
                      size={80}
                    />
                    <div style={{ marginTop: '16px', fontWeight: 'bold' }}>System Health</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>All systems operational</div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress 
                      type="circle" 
                      percent={92} 
                      format={() => '92%'}
                      strokeColor="#52c41a"
                      size={80}
                    />
                    <div style={{ marginTop: '16px', fontWeight: 'bold' }}>Data Accuracy</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>High quality data</div>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div style={{ textAlign: 'center' }}>
                    <Progress 
                      type="circle" 
                      percent={78} 
                      format={() => '78%'}
                      strokeColor="#fa8c16"
                      size={80}
                    />
                    <div style={{ marginTop: '16px', fontWeight: 'bold' }}>User Satisfaction</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Good feedback</div>
                  </div>
                </Col>
              </Row>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

// Semester Management Component
const SemesterManagement = ({ semesters, setSemesters, semesterModal, setSemesterModal, semesterForm }) => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card 
        title="Semester Management" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setSemesterModal({ visible: true, mode: 'add', data: {} })}>
            Add Semester
          </Button>
        }
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <Table
          dataSource={semesters}
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Start Date', dataIndex: 'startDate', key: 'startDate' },
            { title: 'End Date', dataIndex: 'endDate', key: 'endDate' },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button type="primary" size="small" icon={<EditOutlined />}>
                    Edit
                  </Button>
                  <Button type="primary" danger size="small" icon={<DeleteOutlined />}>
                    Delete
                  </Button>
                </Space>
              ),
            },
          ]}
          rowKey="id"
        />
      </Card>
    </motion.div>
  </div>
);



// Student Management Component
const StudentManagement = ({ students, setStudents, studentModal, setStudentModal, studentForm, handleExportStudents, handleImportStudents, handleAddStudent, handleEditStudent, handleDeleteStudent }) => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card 
        title="Student Management" 
        extra={
          <Space>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload
                accept=".xlsx,.xls"
                showUploadList={false}
                beforeUpload={(file) => {
                  handleImportStudents(file);
                  return false;
                }}
              >
                <Button 
                  icon={<ImportOutlined />}
                  style={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}
                >
                  Import Students
                </Button>
              </Upload>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                icon={<ExportOutlined />}
                onClick={handleExportStudents}
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                  fontWeight: 'bold',
                  color: '#fff'
                }}
              >
                Export Students
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddStudent}
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Add Student
              </Button>
            </motion.div>
          </Space>
        }
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <Table
          dataSource={students}
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Student ID', dataIndex: 'studentId', key: 'studentId' },
            { title: 'Major', dataIndex: 'major', key: 'major' },
            { title: 'Enrollment Date', dataIndex: 'enrollmentDate', key: 'enrollmentDate' },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEditStudent(record)}>
                    Edit
                  </Button>
                  <Button type="primary" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteStudent(record)}>
                    Delete
                  </Button>
                </Space>
              ),
            },
          ]}
          rowKey="id"
        />
      </Card>
    </motion.div>
  </div>
);

// Lecturer Management Component
const LecturerManagement = ({ lecturers, setLecturers, lecturerModal, setLecturerModal, lecturerForm, handleExportLecturers, handleImportLecturers, handleAddLecturer, handleEditLecturer, handleDeleteLecturer }) => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card 
        title="Lecturer Management" 
        extra={
          <Space>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload
                accept=".xlsx,.xls"
                showUploadList={false}
                beforeUpload={(file) => {
                  handleImportLecturers(file);
                  return false;
                }}
              >
                <Button 
                  icon={<ImportOutlined />}
                  style={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}
                >
                  Import Lecturers
                </Button>
              </Upload>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                icon={<ExportOutlined />}
                onClick={handleExportLecturers}
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                  fontWeight: 'bold',
                  color: '#fff'
                }}
              >
                Export Lecturers
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddLecturer}
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Add Lecturer
              </Button>
            </motion.div>
          </Space>
        }
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <Table
          dataSource={lecturers}
          columns={[
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Email', dataIndex: 'email', key: 'email' },
            { title: 'Department', dataIndex: 'department', key: 'department' },
            { title: 'Specialization', dataIndex: 'specialization', key: 'specialization' },
            { title: 'Hire Date', dataIndex: 'hireDate', key: 'hireDate' },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEditLecturer(record)}>
                    Edit
                  </Button>
                  <Button type="primary" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteLecturer(record)}>
                    Delete
                  </Button>
                </Space>
              ),
            },
          ]}
          rowKey="id"
        />
      </Card>
    </motion.div>
  </div>
);



// Log History Component
const LogHistory = ({ logs }) => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card title="Log History" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <Table
          dataSource={logs}
          columns={[
            { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp' },
            { title: 'Action', dataIndex: 'action', key: 'action' },
            { title: 'User', dataIndex: 'user', key: 'user' },
            { title: 'Details', dataIndex: 'details', key: 'details' },
          ]}
          rowKey="id"
        />
      </Card>
    </motion.div>
  </div>
);

// IOT Subjects Management Component
const IotSubjectsManagement = ({ iotSubjects, setIotSubjects, selectedSemester, setSelectedSemester, semesters, handleAddIotSubject, handleEditIotSubject, handleViewIotSubjectStudents, handleDeleteIotSubject }) => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card 
        title="IOT Subjects Management" 
        extra={
          <Space>
            <Select
              placeholder="Select Semester"
              style={{ width: 200 }}
              value={selectedSemester}
              onChange={setSelectedSemester}
            >
              {semesters.map(semester => (
                <Option key={semester.id} value={semester.id}>
                  {semester.name}
                </Option>
              ))}
            </Select>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddIotSubject}
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: 'bold'
              }}
            >
              Add IOT Subject
            </Button>
          </Space>
        }
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <Alert
          message="IOT Subjects Management"
          description="Manage IOT-related subjects for each semester. Only IOT subjects are displayed here."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Table
          dataSource={iotSubjects}
          columns={[
            { title: 'Subject Name', dataIndex: 'name', key: 'name' },
            { title: 'Semester', dataIndex: 'semesterName', key: 'semesterName' },
            { title: 'Lecturer', dataIndex: 'lecturerName', key: 'lecturerName' },
            { title: 'Capacity', dataIndex: 'capacity', key: 'capacity' },
            { title: 'Enrolled', dataIndex: 'enrolledCount', key: 'enrolledCount' },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEditIotSubject(record)}>
                    Edit
                  </Button>
                  <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => handleViewIotSubjectStudents(record)}>
                    View Students
                  </Button>
                  <Button type="primary" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteIotSubject(record)}>
                    Delete
                  </Button>
                </Space>
              ),
            },
          ]}
          rowKey="id"
        />
      </Card>
    </motion.div>
  </div>
);



// Kits Management Component
const KitsManagement = ({ kits, setKits, handleExportKits, handleViewKitDetails }) => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card 
        title="Kits Management" 
        extra={
                      <Button 
              icon={<ExportOutlined />}
              onClick={handleExportKits}
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                fontWeight: 'bold',
                color: '#fff'
              }}
            >
              Export Kits
            </Button>
        }
        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Total Kits"
                value={kits.length}
                prefix={<ToolOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Available"
                value={kits.filter(kit => kit.status === 'AVAILABLE').length}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="In Use"
                value={kits.filter(kit => kit.status === 'IN-USE').length}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="Damaged"
                value={kits.filter(kit => kit.status === 'DAMAGED').length}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Table
          dataSource={kits}
          columns={[
            { title: 'Kit Name', dataIndex: 'name', key: 'name' },
            { title: 'Category', dataIndex: 'category', key: 'category' },
            { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
            { title: 'Location', dataIndex: 'location', key: 'location' },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => {
                const colors = {
                  'AVAILABLE': 'green',
                  'IN-USE': 'orange',
                  'DAMAGED': 'red',
                  'MAINTENANCE': 'blue'
                };
                return <Tag color={colors[status]}>{status}</Tag>;
              }
            },
            { title: 'Price', dataIndex: 'price', key: 'price', render: (price) => `$${price}` },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => handleViewKitDetails(record)}>
                    View Details
                  </Button>
                </Space>
              ),
            },
          ]}
          rowKey="id"
        />
      </Card>
    </motion.div>
  </div>
);

export default AcademicAffairsPortal; 
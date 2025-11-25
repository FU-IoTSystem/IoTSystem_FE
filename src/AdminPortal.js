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
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  ToolOutlined,
  ShoppingOutlined,
  FileTextOutlined,
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
  BookOutlined,
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
  CloseOutlined,
  StopOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  FastForwardOutlined,
  FastBackwardOutlined,
  ShuffleOutlined,
  RetweetOutlined,
  SwapOutlined,
  SwapLeftOutlined,
  SwapRightOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined,
  RollbackOutlined,
  EnterOutlined,
  ExportOutlined,
  HistoryOutlined,
  ImportOutlined,
  MinusOutlined,
  SaveOutlined,
  PrinterOutlined,
  ScanOutlined,
  QrcodeOutlined,
  BarcodeOutlined,
  KeyOutlined,
  LockOutlined,
  UnlockOutlined,
  SafetyOutlined,
  ShieldOutlined,
  FireOutlined,
  ThunderboltFilled,
  CloudOutlined,
  CloudFilled,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  CloudSyncOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  HddOutlined,
  UsbOutlined,
  ApiOutlined,
  CodeOutlined,
  BugFilled,
  CodeFilled,
  ExperimentFilled,
  ToolFilled,
  BuildFilled,
  CarFilled,
  HomeFilled,
  BookFilled,
  RobotFilled,
  WifiFilled,
  ThunderboltFilled as ThunderboltFilledIcon,
  BulbFilled,
  HeartFilled,
  StarFilled,
  LikeFilled,
  DislikeFilled,
  QuestionCircleFilled,
  InfoCircleFilled,
  WarningFilled,
  CheckCircleFilled,
  StopFilled,
  PlayCircleFilled,
  PauseCircleFilled,
  StepForwardFilled,
  StepBackwardFilled,
  FastForwardFilled,
  FastBackwardFilled,
  ShuffleFilled,
  RetweetFilled,
  SwapFilled,
  SwapLeftFilled,
  SwapRightFilled,
  ArrowUpFilled,
  ArrowDownFilled,
  ArrowLeftFilled,
  ArrowRightFilled,
  DoubleLeftFilled,
  DoubleRightFilled,
  VerticalLeftFilled,
  VerticalRightFilled,
  RollbackFilled,
  EnterFilled,
  ExportFilled,
  ImportFilled,
  SaveFilled,
  PrinterFilled,
  ScanFilled,
  QrcodeFilled,
  BarcodeFilled,
  KeyFilled,
  LockFilled,
  UnlockFilled,
  SafetyFilled,
  ShieldFilled,
  FireFilled,
  CloudFilled as CloudFilledIcon,
  CloudDownloadFilled,
  CloudUploadFilled,
  CloudSyncFilled,
  CloudServerFilled,
  DatabaseFilled,
  HddFilled,
  UsbFilled,
  ApiFilled,
  CodeFilled as CodeFilledIcon,
  LoadingOutlined
} from '@ant-design/icons';
import { mockKits, mockGroups, mockUsers, mockRentalRequests, mockRefundRequests, mockRolePermissions, mockSystemStats, mockTransactions, mockFines, mockRefundToWallet } from './mocks';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { Step } = Steps;
const { RangePicker } = DatePicker;

function AdminPortal({ onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [kits, setKits] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [rentalRequests, setRentalRequests] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [systemStats, setSystemStats] = useState({});

  // Modal states
  const [kitModalVisible, setKitModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Import/Export states
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importType, setImportType] = useState('students');
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [groupMembersModalVisible, setGroupMembersModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Kit Inspection and Fine Management states
  const [kitInspectionModalVisible, setKitInspectionModalVisible] = useState(false);
  const [selectedKit, setSelectedKit] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [damageAssessment, setDamageAssessment] = useState({});
  const [fineAmount, setFineAmount] = useState(0);
  const [kitInspectionLoading, setKitInspectionLoading] = useState(false);
  const [fines, setFines] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [logHistory, setLogHistory] = useState([]);
  const [cashFlowHistory, setCashFlowHistory] = useState([]);

  // Form instances
  const [kitForm] = Form.useForm();
  const [userForm] = Form.useForm();
  const [groupForm] = Form.useForm();

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const sidebarVariants = {
    open: { width: 200, transition: { duration: 0.3, ease: "easeInOut" } },
    closed: { width: 80, transition: { duration: 0.3, ease: "easeInOut" } }
  };

  const menuItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    hover: {
      x: 5,
      transition: { duration: 0.2 }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API calls with mock data
      console.log('Loading mock data...');
      setKits(mockKits);
      setGroups(mockGroups);
      setUsers(mockUsers);
      setRentalRequests(mockRentalRequests);
      setRefundRequests(mockRefundRequests);
      setSystemStats(mockSystemStats);
      setTransactions(mockTransactions);
      setFines(mockFines);

      // Load available students for group management
      const studentUsers = mockUsers.filter(user => user.role === 'student');
      setAvailableStudents(studentUsers);

      console.log('Mock data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Failed to load data');
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



  const handleExportKits = () => {
    const kitData = kits.map(kit => ({
      'Kit ID': kit.id,
      'Name': kit.name,
      'Category': kit.category,
      'Quantity': kit.quantity,
      'Price': kit.price,
      'Status': kit.status,
      'Location': kit.location,
      'Description': kit.description
    }));
    exportToExcel(kitData, 'kits_list');
    notification.success({
      message: 'Export Successful',
      description: 'Kit list exported to Excel file',
      placement: 'topRight',
    });
  };



  const handleImportKits = async (file) => {
    try {
      const importedData = await importFromExcel(file, 'kits');
      const newKits = importedData.map((kit, index) => ({
        id: Date.now() + index,
        name: kit.Name || kit.name,
        category: kit.Category || kit.category || 'Basic',
        quantity: parseInt(kit.Quantity || kit.quantity) || 1,
        price: parseInt(kit.Price || kit.price) || 0,
        status: 'AVAILABLE',
        location: kit.Location || kit.location || 'Lab 1',
        description: kit.Description || kit.description || '',
        components: []
      }));

      setKits(prev => [...prev, ...newKits]);

      notification.success({
        message: 'Import Successful',
        description: `${newKits.length} kits imported successfully`,
        placement: 'topRight',
      });
    } catch (error) {
      notification.error({
        message: 'Import Failed',
        description: 'Failed to import kits. Please check file format.',
        placement: 'topRight',
      });
    }
  };

  // Group Management Functions
  const generateRandomStudents = (groupId, count = 3) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    // Get students not already in this group or any other group
    const availableStudentsForGroup = availableStudents.filter(student =>
      !groups.some(g =>
        g.members &&
        g.members.includes(student.email)
      )
    );

    if (availableStudentsForGroup.length === 0) {
      notification.warning({
        message: 'No Available Students',
        description: 'All students are already assigned to groups',
        placement: 'topRight',
      });
      return;
    }

    const shuffled = availableStudentsForGroup.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, availableStudentsForGroup.length));
    const selectedEmails = selected.map(student => student.email);

    setGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, members: [...(g.members || []), ...selectedEmails] }
        : g
    ));

    notification.success({
      message: 'Additional Students Added',
      description: `${selectedEmails.length} additional students randomly assigned to the group`,
      placement: 'topRight',
    });
  };

  const adjustGroupMembers = (group) => {
    setSelectedGroup(group);
    setSelectedStudents(group.members || []);
    setGroupMembersModalVisible(true);
  };

  const saveGroupMembers = () => {
    setGroups(prev => prev.map(group =>
      group.id === selectedGroup.id
        ? { ...group, members: selectedStudents }
        : group
    ));

    setGroupMembersModalVisible(false);
    setSelectedGroup(null);
    setSelectedStudents([]);

    notification.success({
      message: 'Group Updated',
      description: 'Group members updated successfully',
      placement: 'topRight',
    });
  };


  // Kit Inspection and Fine Management Functions
  const openKitInspection = (rental) => {
    const kit = kits.find(k => k.id === rental.kitId);
    if (!kit) {
      notification.error({
        message: 'Kit Not Found',
        description: 'The kit for this rental could not be found.',
        placement: 'topRight',
      });
      return;
    }

    setSelectedRental(rental);
    setSelectedKit(kit);
    setDamageAssessment({});
    setFineAmount(0);
    setKitInspectionModalVisible(true);
  };

  const openRefundKitInspection = (refundRequest) => {
    // Find kit by name since refund requests have kitName but not kitId
    const kit = kits.find(k => k.name === refundRequest.kitName);
    if (!kit) {
      notification.error({
        message: 'Kit Not Found',
        description: `The kit "${refundRequest.kitName}" could not be found.`,
        placement: 'topRight',
      });
      return;
    }

    // Create a rental-like object for the refund request
    const rentalObject = {
      id: refundRequest.rentalId,
      kitId: kit.id,
      kitName: refundRequest.kitName,
      userEmail: refundRequest.userEmail,
      userName: refundRequest.userEmail.split('@')[0], // Extract name from email
      status: refundRequest.status
    };

    setSelectedRental(rentalObject);
    setSelectedKit(kit);
    setDamageAssessment(refundRequest.damageAssessment || {});
    setFineAmount(0);
    setKitInspectionModalVisible(true);
  };

  const handleComponentDamage = (componentName, isDamaged, damageValue = 0) => {
    setDamageAssessment(prev => ({
      ...prev,
      [componentName]: {
        damaged: isDamaged,
        value: damageValue
      }
    }));
  };

  const calculateFineAmount = () => {
    let totalFine = 0;
    Object.values(damageAssessment).forEach(component => {
      if (component.damaged) {
        totalFine += component.value;
      }
    });
    setFineAmount(totalFine);
    return totalFine;
  };

  const submitKitInspection = async () => {
    setKitInspectionLoading(true);
    const totalFine = calculateFineAmount();

    // Check if this is a refund request or rental request
    const isRefundRequest = selectedRental && selectedRental.status === 'approved';

    if (totalFine > 0) {
      // Find the group leader for this rental
      const group = groups.find(g =>
        g.members && g.members.includes(selectedRental.userEmail)
      );

      if (group) {
        const leaderEmail = group.leader;
        const leader = users.find(u => u.email === leaderEmail);

        const newFine = {
          id: Date.now(),
          rentalId: selectedRental.id,
          kitId: selectedKit.id,
          kitName: selectedKit.name,
          studentEmail: selectedRental.userEmail,
          studentName: selectedRental.userName,
          leaderEmail: leaderEmail,
          leaderName: leader ? leader.name : 'Unknown',
          damageAssessment: { ...damageAssessment },
          fineAmount: totalFine,
          status: 'pending',
          createdAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        };

        setFines(prev => [...prev, newFine]);

        notification.success({
          message: 'Kit Inspection Completed',
          description: `Fine of ${totalFine.toLocaleString()} VND sent to group leader ${leader ? leader.name : leaderEmail}`,
          placement: 'topRight',
          duration: 5,
        });
      } else {
        notification.warning({
          message: 'No Group Found',
          description: 'Student is not part of any group. Fine will be sent directly to student.',
          placement: 'topRight',
        });

        const newFine = {
          id: Date.now(),
          rentalId: selectedRental.id,
          kitId: selectedKit.id,
          kitName: selectedKit.name,
          studentEmail: selectedRental.userEmail,
          studentName: selectedRental.userName,
          leaderEmail: selectedRental.userEmail,
          leaderName: selectedRental.userName,
          damageAssessment: { ...damageAssessment },
          fineAmount: totalFine,
          status: 'pending',
          createdAt: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        setFines(prev => [...prev, newFine]);
      }

      // For refund requests with damage, add to log history as REJECTED and remove from refund requests
      if (isRefundRequest) {
        const logEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          action: 'REFUND_REQUEST_REJECTED',
          type: 'refund',
          user: selectedRental.userEmail,
          userName: selectedRental.userName,
          details: {
            kitName: selectedKit.name,
            kitId: selectedKit.id,
            requestId: `REF-${selectedRental.id}`,
            reason: 'Refund request - damage found',
            damageDescription: 'Kit returned with damage',
            originalRentalId: selectedRental.id,
            rejectedBy: 'admin@fpt.edu.vn',
            rejectionReason: 'Kit returned with damage - fine created',
            fineAmount: totalFine
          },
          status: 'REJECTED',
          adminAction: 'rejected',
          adminUser: 'admin@fpt.edu.vn',
          adminTimestamp: new Date().toISOString()
        };

        setLogHistory(prev => [logEntry, ...prev]);

        // Remove from refund requests
        setRefundRequests(prev => prev.filter(req => req.id !== selectedRental.id));
      }
    } else {
      // No damage detected
      if (isRefundRequest) {
        // Calculate refund amount (assuming full refund for no damage)
        const refundAmount = selectedRental.totalCost || 0;

        try {
          // Process refund to wallet
          const refundResult = await mockRefundToWallet(
            selectedRental.userEmail,
            refundAmount,
            `Kit return refund - ${selectedKit.name}`
          );

          if (refundResult.success) {
            // Update kit status to available
            setKits(prev => prev.map(kit =>
              kit.id === selectedKit.id
                ? { ...kit, status: 'AVAILABLE' }
                : kit
            ));

            // Add refund transaction to log history
            const logEntry = {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              action: 'REFUND_PROCESSED',
              type: 'refund',
              user: selectedRental.userEmail,
              userName: selectedRental.userName,
              details: {
                kitName: selectedKit.name,
                kitId: selectedKit.id,
                requestId: `REF-${selectedRental.id}`,
                refundAmount: refundAmount,
                refundStatus: 'completed',
                originalRentalId: selectedRental.id,
                processedBy: 'admin@fpt.edu.vn',
                inspectionNotes: 'No damage found - full refund processed',
                kitStatusChanged: 'AVAILABLE',
                transactionId: refundResult.transactionId
              },
              status: 'COMPLETED',
              adminAction: 'refund_processed',
              adminUser: 'admin@fpt.edu.vn',
              adminTimestamp: new Date().toISOString()
            };

            setLogHistory(prev => [logEntry, ...prev]);

            // Remove from refund requests
            setRefundRequests(prev => prev.filter(req => req.id !== selectedRental.id));

            notification.success({
              message: 'Refund Processed Successfully',
              description: `Refund of ${refundAmount.toLocaleString()} VND has been sent to ${selectedRental.userName}'s wallet. Kit status changed to AVAILABLE.`,
              placement: 'topRight',
              duration: 5,
            });
          } else {
            notification.error({
              message: 'Refund Failed',
              description: 'Failed to process refund to wallet. Please try again.',
              placement: 'topRight',
            });
            setKitInspectionLoading(false);
            return; // Don't close modal if refund failed
          }
        } catch (error) {
          notification.error({
            message: 'Refund Error',
            description: 'An error occurred while processing the refund. Please try again.',
            placement: 'topRight',
          });
          setKitInspectionLoading(false);
          return; // Don't close modal if refund failed
        }
      } else {
        // Update kit status to available for regular rental returns
        setKits(prev => prev.map(kit =>
          kit.id === selectedKit.id
            ? { ...kit, status: 'AVAILABLE' }
            : kit
        ));

        notification.success({
          message: 'Kit Inspection Completed',
          description: 'No damage detected. Kit returned successfully and status changed to AVAILABLE.',
          placement: 'topRight',
        });

        // Update rental status to returned
        setRentalRequests(prev => prev.map(rental =>
          rental.id === selectedRental.id
            ? { ...rental, status: 'RETURNED', returnDate: new Date().toISOString() }
            : rental
        ));
      }
    }

    setKitInspectionModalVisible(false);
    setSelectedKit(null);
    setSelectedRental(null);
    setDamageAssessment({});
    setFineAmount(0);
    setKitInspectionLoading(false);
  };





  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'kits',
      icon: <ToolOutlined />,
      label: 'Kit Management',
    },
    {
      key: 'rentals',
      icon: <ShoppingOutlined />,
      label: 'Rental Approvals',
    },
    {
      key: 'refunds',
      icon: <RollbackOutlined />,
      label: 'Refund Approvals',
    },
    {
      key: 'fines',
      icon: <DollarOutlined />,
      label: 'Fine Management',
    },
    {
      key: 'transactions',
      icon: <FileTextOutlined />,
      label: 'Transaction History',
    },
    {
      key: 'log-history',
      icon: <HistoryOutlined />,
      label: 'Log History',
    },
    {
      key: 'groups',
      icon: <TeamOutlined />,
      label: 'Group Management',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'User Management',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'approved':
      case 'active':
        return 'success';
      case 'pending_approval':
      case 'pending':
      case 'in progress':
        return 'warning';
      case 'rejected':
      case 'damaged':
      case 'missing':
      case 'suspended':
        return 'error';
      case 'in-use':
      case 'borrowed':
        return 'processing';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const showNotification = (type, message, description = '') => {
    notification[type]({
      message,
      description,
      placement: 'topRight',
    });
  };

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
            {collapsed ? 'IoT' : 'IoT Kit Rental'}
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
          className="custom-menu"
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
                <Badge count={5} size="small" style={{ cursor: 'pointer' }}>
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
                {selectedKey === 'dashboard' && <DashboardContent systemStats={systemStats} />}
                {selectedKey === 'kits' && <KitManagement kits={kits} setKits={setKits} handleExportKits={handleExportKits} handleImportKits={handleImportKits} />}
                {selectedKey === 'rentals' && <RentalApprovals rentalRequests={rentalRequests} setRentalRequests={setRentalRequests} setLogHistory={setLogHistory} />}
                {selectedKey === 'refunds' && <RefundApprovals refundRequests={refundRequests} setRefundRequests={setRefundRequests} openRefundKitInspection={openRefundKitInspection} setLogHistory={setLogHistory} />}
                {selectedKey === 'fines' && <FineManagement fines={fines} setFines={setFines} setLogHistory={setLogHistory} />}
                {selectedKey === 'transactions' && <TransactionHistory transactions={transactions} setTransactions={setTransactions} />}
                {selectedKey === 'log-history' && <LogHistory logHistory={logHistory} setLogHistory={setLogHistory} cashFlowHistory={cashFlowHistory} setCashFlowHistory={setCashFlowHistory} />}
                {selectedKey === 'groups' && <GroupManagement groups={groups} setGroups={setGroups} generateRandomStudents={generateRandomStudents} adjustGroupMembers={adjustGroupMembers} availableStudents={availableStudents} />}
                {selectedKey === 'users' && <UserManagement users={users} setUsers={setUsers} />}
                {selectedKey === 'settings' && <Settings />}
              </motion.div>
            </AnimatePresence>
          </Spin>
        </Content>
      </Layout>

      {/* Group Members Modal */}
      <Modal
        title={`Adjust Members - ${selectedGroup?.name}`}
        open={groupMembersModalVisible}
        onCancel={() => {
          setGroupMembersModalVisible(false);
          setSelectedGroup(null);
          setSelectedStudents([]);
        }}
        onOk={saveGroupMembers}
        width={800}
        centered
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Available Students:</Text>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            Select students to add to this group
          </Text>
        </div>

        <Transfer
          dataSource={availableStudents.map(student => ({
            key: student.email,
            title: student.name,
            description: student.email,
            ...student
          }))}
          titles={['Available Students', 'Group Members']}
          targetKeys={selectedStudents}
          onChange={setSelectedStudents}
          render={item => (
            <div style={{ padding: '8px 0' }}>
              <div style={{ fontWeight: 'bold' }}>{item.title}</div>
              <div style={{ color: '#666', fontSize: '12px' }}>{item.description}</div>
            </div>
          )}
          listStyle={{
            width: 300,
            height: 400,
          }}
          showSearch
          filterOption={(inputValue, item) =>
            item.title.indexOf(inputValue) !== -1 || item.description.indexOf(inputValue) !== -1
          }
        />

        <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <Text strong>Current Group Members ({selectedStudents.length}):</Text>
          <div style={{ marginTop: 8 }}>
            {selectedStudents.length > 0 ? (
              selectedStudents.map(email => {
                const student = availableStudents.find(s => s.email === email);
                return (
                  <Tag key={email} style={{ margin: '4px' }}>
                    {student ? student.name : email}
                  </Tag>
                );
              })
            ) : (
              <Text type="secondary">No members selected</Text>
            )}
          </div>
        </div>
      </Modal>

      {/* Kit Inspection Modal */}
      <Modal
        title={`Kit Inspection - ${selectedKit?.name}`}
        open={kitInspectionModalVisible}
        onCancel={() => {
          setKitInspectionModalVisible(false);
          setSelectedKit(null);
          setSelectedRental(null);
          setDamageAssessment({});
          setFineAmount(0);
        }}
        onOk={submitKitInspection}
        width={800}
        centered
        destroyOnClose
        okText="Submit Inspection"
        cancelText="Cancel"
        confirmLoading={kitInspectionLoading}
      >
        {selectedKit && selectedRental && (
          <div>
            <Alert
              message="Kit Return Inspection"
              description={`Inspecting kit returned by ${selectedRental.userName} (${selectedRental.userEmail})`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Descriptions title="Rental Information" bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Student">{selectedRental.userName}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedRental.userEmail}</Descriptions.Item>
              <Descriptions.Item label="Kit">{selectedKit.name}</Descriptions.Item>
              <Descriptions.Item label="Rental ID">#{selectedRental.id}</Descriptions.Item>
            </Descriptions>

            <Divider>Component Inspection</Divider>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Check each component for damage:</Text>
            </div>

            {selectedKit.components?.map((component, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: 8 }}
                title={
                  <Space>
                    <Text strong>{component.name}</Text>
                    <Tag color={component.condition === 'New' ? 'green' : 'orange'}>
                      {component.condition}
                    </Tag>
                  </Space>
                }
              >
                <Row gutter={16} align="middle">
                  <Col span={12}>
                    <Text>Quantity: {component.quantity}</Text>
                  </Col>
                  <Col span={12}>
                    <Space>
                      <Checkbox
                        checked={damageAssessment[component.name]?.damaged || false}
                        onChange={(e) => handleComponentDamage(component.name, e.target.checked, e.target.checked ? 50000 : 0)}
                      >
                        Damaged
                      </Checkbox>
                      {damageAssessment[component.name]?.damaged && (
                        <InputNumber
                          placeholder="Damage Value (VND)"
                          value={damageAssessment[component.name]?.value || 0}
                          onChange={(value) => handleComponentDamage(component.name, true, value || 0)}
                          style={{ width: 150 }}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                        />
                      )}
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}

            <Divider />

            <Alert
              message={`Total Fine: ${fineAmount.toLocaleString()} VND`}
              description={
                fineAmount > 0
                  ? "This fine will be sent to the group leader if the student is part of a group, otherwise to the student directly."
                  : "No damage detected. Kit will be returned successfully."
              }
              type={fineAmount > 0 ? "warning" : "success"}
              showIcon
              style={{ marginBottom: 16 }}
            />

            {fineAmount > 0 && (
              <Alert
                message="Fine Details"
                description={
                  <div>
                    {Object.entries(damageAssessment).map(([component, assessment]) => (
                      assessment.damaged && (
                        <div key={component} style={{ marginBottom: 4 }}>
                          <Text strong>{component}:</Text> {assessment.value.toLocaleString()} VND
                        </div>
                      )
                    ))}
                  </div>
                }
                type="warning"
                showIcon
              />
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
}

// Dashboard Component
const DashboardContent = ({ systemStats }) => {
  // Animation variants for dashboard
  const statCardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    }),
    hover: {
      y: -8,
      scale: 1.05,
      boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: systemStats.totalUsers || 0,
      icon: <UserOutlined />,
      color: '#1890ff',
      suffix: 'users'
    },
    {
      title: 'Available Kits',
      value: systemStats.availableKits || 0,
      icon: <ToolOutlined />,
      color: '#52c41a',
      suffix: 'kits'
    },
    {
      title: 'Pending Approvals',
      value: systemStats.pendingApprovals || 0,
      icon: <ClockCircleOutlined />,
      color: '#faad14',
      suffix: 'requests'
    },
    {
      title: 'Monthly Revenue',
      value: systemStats.monthlyRevenue || 0,
      icon: <DollarOutlined />,
      color: '#722ed1',
      suffix: 'VND'
    }
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <motion.div
              custom={index}
              variants={statCardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
            >
              <Card
                style={{
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
                bodyStyle={{ padding: '32px' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                  style={{
                    display: 'inline-block',
                    padding: '12px',
                    borderRadius: '50%',
                    background: `${stat.color}15`,
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ color: stat.color, fontSize: '24px' }}>
                    {stat.icon}
                  </div>
                </motion.div>
                <Statistic
                  title={
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.7, duration: 0.3 }}
                    >
                      {stat.title}
                    </motion.div>
                  }
                  value={stat.value}
                  suffix={stat.suffix}
                  valueStyle={{
                    color: stat.color,
                    fontSize: '28px',
                    fontWeight: 'bold'
                  }}
                  prefix={null}
                />
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Card
              title="Recent Activity"
              extra={<a href="#" style={{ color: '#667eea', fontWeight: 'bold' }}>View All</a>}
              style={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                overflow: 'hidden'
              }}
              headStyle={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                borderBottom: 'none',
                borderRadius: '20px 20px 0 0'
              }}
            >
              <Timeline>
                {systemStats.recentActivity?.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1, duration: 0.3 }}
                  >
                    <Timeline.Item color="blue">
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                      >
                        {activity.action}
                      </motion.p>
                      <motion.p
                        style={{ fontSize: 12, color: '#999' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1 + index * 0.1, duration: 0.3 }}
                      >
                        {activity.user} • {activity.time}
                      </motion.p>
                    </Timeline.Item>
                  </motion.div>
                ))}
              </Timeline>
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} lg={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Card
              title="Popular Kits"
              extra={<a href="#" style={{ color: '#667eea', fontWeight: 'bold' }}>View All</a>}
              style={{
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                overflow: 'hidden'
              }}
              headStyle={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                borderBottom: 'none',
                borderRadius: '20px 20px 0 0'
              }}
            >
              <List
                dataSource={systemStats.popularKits || []}
                renderItem={(item, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.3 }}
                  >
                    <List.Item>
                      <List.Item.Meta
                        title={item.name}
                        description={`${item.rentals} rentals`}
                      />
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Tag color="blue">{item.rentals} rentals</Tag>
                      </motion.div>
                    </List.Item>
                  </motion.div>
                )}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

// Kit Management Component
const KitManagement = ({ kits, setKits, handleExportKits, handleImportKits }) => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKit, setEditingKit] = useState(null);
  const [components, setComponents] = useState([]);
  const [componentModalVisible, setComponentModalVisible] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Button type="link" onClick={() => showKitDetails(record)}>
          {text}
        </Button>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color={category === 'Advanced' ? 'orange' : category === 'Professional' ? 'red' : 'default'}>
          {category}
        </Tag>
      )
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price ? `${price.toLocaleString()} VND` : 'N/A'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'AVAILABLE' ? 'green' : status === 'IN-USE' ? 'orange' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Components',
      key: 'components',
      render: (_, record) => (
        <div>
          <Text>{record.components?.length || 0} components</Text>
          <br />
          <Button
            type="link"
            size="small"
            onClick={() => manageComponents(record)}
            style={{ padding: 0, height: 'auto' }}
          >
            Manage Components
          </Button>
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => editKit(record)}>
              Edit
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button type="default" size="small" icon={<EyeOutlined />} onClick={() => showKitDetails(record)}>
              Details
            </Button>
          </motion.div>
        </Space>
      )
    }
  ];

  const showKitDetails = (kit) => {
    Modal.info({
      title: 'Kit Details',
      width: 700,
      content: (
        <div>
          <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Name">{kit.name}</Descriptions.Item>
            <Descriptions.Item label="Category">{kit.category}</Descriptions.Item>
            <Descriptions.Item label="Quantity">{kit.quantity}</Descriptions.Item>
            <Descriptions.Item label="Price">{kit.price ? `${kit.price.toLocaleString()} VND` : 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Status">{kit.status}</Descriptions.Item>
            <Descriptions.Item label="Location">{kit.location}</Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>{kit.description}</Descriptions.Item>
          </Descriptions>

          <Divider>Components</Divider>

          {kit.components && kit.components.length > 0 ? (
            <Table
              dataSource={kit.components}
              columns={[
                { title: 'Component Name', dataIndex: 'name', key: 'name' },
                { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
                {
                  title: 'Condition',
                  dataIndex: 'condition',
                  key: 'condition',
                  render: (condition) => (
                    <Tag color={condition === 'New' ? 'green' : condition === 'Used' ? 'orange' : 'red'}>
                      {condition}
                    </Tag>
                  )
                }
              ]}
              pagination={false}
              size="small"
            />
          ) : (
            <Empty description="No components added" />
          )}
        </div>
      )
    });
  };

  const editKit = (kit) => {
    setEditingKit(kit);
    form.setFieldsValue(kit);
    setModalVisible(true);
  };

  const manageComponents = (kit) => {
    setEditingKit(kit);
    setComponents(kit.components || []);
    setComponentModalVisible(true);
  };

  const addComponent = () => {
    setEditingComponent(null);
    setComponentModalVisible(true);
  };

  const editComponent = (component) => {
    setEditingComponent(component);
    setComponentModalVisible(true);
  };

  const handleComponentSubmit = (values) => {
    if (editingComponent) {
      // Edit existing component
      setComponents(prev => prev.map(comp =>
        comp.id === editingComponent.id ? { ...comp, ...values } : comp
      ));
    } else {
      // Add new component
      const newComponent = {
        id: Date.now(),
        ...values
      };
      setComponents(prev => [...prev, newComponent]);
    }
    setEditingComponent(null);
  };

  const deleteComponent = (componentId) => {
    setComponents(prev => prev.filter(comp => comp.id !== componentId));
  };

  const saveComponents = () => {
    setKits(prev => prev.map(kit =>
      kit.id === editingKit.id ? { ...kit, components: components } : kit
    ));
    setComponentModalVisible(false);
    setEditingKit(null);
    setComponents([]);
    notification.success({
      message: 'Success',
      description: 'Components saved successfully',
      placement: 'topRight',
      duration: 3,
    });
  };

  const handleSubmit = (values) => {
    if (editingKit) {
      setKits(prev => prev.map(kit => kit.id === editingKit.id ? { ...kit, ...values } : kit));
      notification.success({
        message: 'Success',
        description: 'Kit updated successfully',
        placement: 'topRight',
        duration: 3,
      });
    } else {
      const newKit = {
        id: Date.now(),
        ...values,
        status: 'AVAILABLE',
        components: []
      };
      setKits(prev => [...prev, newKit]);
      notification.success({
        message: 'Success',
        description: 'Kit added successfully',
        placement: 'topRight',
        duration: 3,
      });
    }
    setModalVisible(false);
    setEditingKit(null);
    form.resetFields();
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          title="Kit Management"
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
                    handleImportKits(file);
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
                    Import Kits
                  </Button>
                </Upload>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
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
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setModalVisible(true)}
                  style={{
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Add Kit
                </Button>
              </motion.div>
            </Space>
          }
          style={{
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            overflow: 'hidden'
          }}
          headStyle={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderBottom: 'none',
            borderRadius: '20px 20px 0 0'
          }}
        >
          <Table
            columns={columns}
            dataSource={kits}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
          />
        </Card>
      </motion.div>

      <Modal
        title={editingKit ? 'Edit Kit' : 'Add Kit'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingKit(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        centered
        destroyOnClose
        maskClosable={false}
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Kit Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
              <Option value="Basic">Basic</Option>
              <Option value="Advanced">Advanced</Option>
              <Option value="Professional">Professional</Option>
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Quantity" rules={[{ required: true }]}>
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="price" label="Price">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item>
            <Space>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button type="primary" htmlType="submit">
                  {editingKit ? 'Update' : 'Add'}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button onClick={() => {
                  setModalVisible(false);
                  setEditingKit(null);
                  form.resetFields();
                }}>
                  Cancel
                </Button>
              </motion.div>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Component Management Modal */}
      <Modal
        title={`Manage Components - ${editingKit?.name || 'Kit'}`}
        open={componentModalVisible}
        onCancel={() => {
          setComponentModalVisible(false);
          setEditingKit(null);
          setComponents([]);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setComponentModalVisible(false);
            setEditingKit(null);
            setComponents([]);
          }}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={saveComponents}>
            Save Components
          </Button>
        ]}
        width={800}
        centered
        destroyOnClose
        maskClosable={false}
        style={{ top: 20 }}
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addComponent}
            style={{
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none',
              fontWeight: 'bold'
            }}
          >
            Add Component
          </Button>
        </div>

        <Table
          dataSource={components}
          columns={[
            { title: 'Component Name', dataIndex: 'name', key: 'name' },
            { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
            {
              title: 'Condition',
              dataIndex: 'condition',
              key: 'condition',
              render: (condition) => (
                <Tag color={condition === 'New' ? 'green' : condition === 'Used' ? 'orange' : 'red'}>
                  {condition}
                </Tag>
              )
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space>
                  <Button
                    type="default"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => editComponent(record)}
                  >
                    Edit
                  </Button>
                  <Popconfirm
                    title="Are you sure you want to delete this component?"
                    onConfirm={() => deleteComponent(record.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="default"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    >
                      Delete
                    </Button>
                  </Popconfirm>
                </Space>
              )
            }
          ]}
          pagination={false}
          size="small"
        />

        {/* Component Form Modal */}
        <Modal
          title={editingComponent ? 'Edit Component' : 'Add Component'}
          open={editingComponent !== null}
          onCancel={() => setEditingComponent(null)}
          footer={null}
          width={500}
          centered
          destroyOnClose
          maskClosable={false}
        >
          <Form
            layout="vertical"
            onFinish={handleComponentSubmit}
            initialValues={editingComponent || {}}
          >
            <Form.Item
              name="name"
              label="Component Name"
              rules={[{ required: true, message: 'Please enter component name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Quantity"
              rules={[{ required: true, message: 'Please enter quantity' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="condition"
              label="Condition"
              rules={[{ required: true, message: 'Please select condition' }]}
            >
              <Select>
                <Option value="New">New</Option>
                <Option value="Used">Used</Option>
                <Option value="Damaged">Damaged</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingComponent ? 'Update' : 'Add'}
                </Button>
                <Button onClick={() => setEditingComponent(null)}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Modal>
    </div>
  );
};

// Rental Approvals Component
const RentalApprovals = ({ rentalRequests, setRentalRequests, setLogHistory }) => {
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id}`
    },
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <div>
          <div>{record.userName}</div>
          <Text type="secondary">{record.userEmail}</Text>
        </div>
      )
    },
    {
      title: 'Kit',
      dataIndex: 'kitName',
      key: 'kitName'
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} days`
    },
    {
      title: 'Total Cost',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (cost) => `${cost.toLocaleString()} VND`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const isEditing = selectedStatuses[record.id]?.editing || false;
        const selectedStatus = selectedStatuses[record.id]?.value || status;

        return (
          <Space>
            {isEditing ? (
              <>
                <Select
                  value={selectedStatus}
                  onChange={(newStatus) => setSelectedStatuses(prev => ({
                    ...prev,
                    [record.id]: {
                      ...prev[record.id],
                      value: newStatus
                    }
                  }))}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="PENDING_APPROVAL">Pending</Option>
                  <Option value="APPROVED">Approved</Option>
                  <Option value="UNDER_REVIEW">Under Review</Option>
                  <Option value="ON_HOLD">On Hold</Option>
                  <Option value="CANCELLED">Cancelled</Option>
                  <Option value="BORROWED">Borrowed</Option>
                </Select>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleStatusChange(record.id, selectedStatus)}
                  style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    color: '#fff'
                  }}
                >
                  Apply
                </Button>
                <Button
                  type="default"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setSelectedStatuses(prev => {
                    const newState = { ...prev };
                    delete newState[record.id];
                    return newState;
                  })}
                  style={{
                    border: '1px solid #d9d9d9',
                    color: '#666'
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Tag
                  color={
                    status === 'PENDING_APPROVAL' ? 'orange' :
                      status === 'APPROVED' ? 'green' :
                        status === 'UNDER_REVIEW' ? 'blue' :
                          status === 'ON_HOLD' ? 'purple' :
                            status === 'CANCELLED' ? 'red' : 'default'
                  }
                  style={{ minWidth: 80, textAlign: 'center' }}
                >
                  {status.replace('_', ' ')}
                </Tag>
                {status === 'APPROVED' && (
                  <Button
                    type="default"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setSelectedStatuses(prev => ({
                      ...prev,
                      [record.id]: {
                        editing: true,
                        value: status
                      }
                    }))}
                    style={{
                      border: '1px solid #d9d9d9',
                      color: '#666'
                    }}
                  >
                    Edit
                  </Button>
                )}
              </>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'PENDING_APPROVAL' ? (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleApproval(record.id, 'approve')}>
                  Approve
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button type="primary" danger size="small" icon={<CloseCircleOutlined />} onClick={() => handleApproval(record.id, 'reject')}>
                  Reject
                </Button>
              </motion.div>
            </>
          ) : null}
        </Space>
      )
    }
  ];

  const handleStatusChange = (id, newStatus) => {
    const request = rentalRequests.find(req => req.id === id);

    // If status is changing to BORROWED, add to log history and remove from rental requests
    if (newStatus === 'BORROWED') {
      // Add to log history
      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: 'RENTAL_REQUEST_BORROWED',
        type: 'rental',
        user: request.userEmail,
        userName: request.userName,
        details: {
          kitName: request.kitName,
          kitId: request.kitId || `KIT-${request.id}`,
          requestId: `REQ-${request.id}`,
          reason: request.reason || 'Course project',
          duration: `${request.duration} days`,
          borrowedBy: 'admin@fpt.edu.vn',
          borrowNotes: 'Kit borrowed by student'
        },
        status: 'BORROWED',
        adminAction: 'borrowed',
        adminUser: 'admin@fpt.edu.vn',
        adminTimestamp: new Date().toISOString()
      };

      setLogHistory(prev => [logEntry, ...prev]);

      // Remove from rental requests
      setRentalRequests(prev => prev.filter(req => req.id !== id));

      notification.success({
        message: 'Kit Borrowed',
        description: `Kit has been marked as borrowed and moved to log history`,
        placement: 'topRight',
        duration: 3,
      });
    } else {
      // Normal status update
      setRentalRequests(prev => prev.map(req =>
        req.id === id ? {
          ...req,
          status: newStatus,
          updatedBy: 'admin@fpt.edu.vn',
          updatedDate: new Date().toISOString()
        } : req
      ));

      notification.success({
        message: 'Status Updated',
        description: `Rental request status changed to ${newStatus.replace('_', ' ')}`,
        placement: 'topRight',
        duration: 3,
      });
    }

    // Clear the editing state for this record
    setSelectedStatuses(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };


  const handleApproval = async (id, action) => {
    const request = rentalRequests.find(req => req.id === id);

    if (action === 'approve') {
      setRentalRequests(prev => prev.map(req =>
        req.id === id ? {
          ...req,
          status: 'APPROVED',
          approvedBy: 'admin@fpt.edu.vn',
          approvalDate: new Date().toISOString()
        } : req
      ));

      notification.success({
        message: 'Success',
        description: `Request approved successfully`,
        placement: 'topRight',
        duration: 3,
      });
    } else {
      // Add to log history when rejected
      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: 'RENTAL_REQUEST_REJECTED',
        type: 'rental',
        user: request.userEmail,
        userName: request.userName,
        details: {
          kitName: request.kitName,
          kitId: request.kitId || `KIT-${request.id}`,
          requestId: `REQ-${request.id}`,
          reason: request.reason || 'Course project',
          duration: `${request.duration} days`,
          rejectedBy: 'admin@fpt.edu.vn',
          rejectionReason: 'Rental request rejected by admin',
          fineAmount: 0
        },
        status: 'REJECTED',
        adminAction: 'rejected',
        adminUser: 'admin@fpt.edu.vn',
        adminTimestamp: new Date().toISOString()
      };

      setLogHistory(prev => [logEntry, ...prev]);

      // Remove from rental requests
      setRentalRequests(prev => prev.filter(req => req.id !== id));

      notification.success({
        message: 'Request Rejected',
        description: `Rental request has been rejected and moved to log history`,
        placement: 'topRight',
        duration: 3,
      });
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title="Rental Request Management"
        style={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden'
        }}
        headStyle={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0'
        }}
      >
        <Table
          columns={columns}
          dataSource={rentalRequests}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
        />
      </Card>
    </motion.div>
  );
};

// Refund Approvals Component
const RefundApprovals = ({ refundRequests, setRefundRequests, openRefundKitInspection, setLogHistory }) => {
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id}`
    },
    {
      title: 'User',
      dataIndex: 'userEmail',
      key: 'userEmail'
    },
    {
      title: 'Role',
      dataIndex: 'userRole',
      key: 'userRole',
      render: (role) => <Tag color="blue">{role}</Tag>
    },
    {
      title: 'Kit',
      dataIndex: 'kitName',
      key: 'kitName'
    },
    {
      title: 'Refund Amount',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      render: (amount) => `${amount?.toLocaleString()} VND`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const isEditing = selectedStatuses[record.id]?.editing || false;
        const selectedStatus = selectedStatuses[record.id]?.value || status;

        return (
          <Space>
            {isEditing ? (
              <>
                <Select
                  value={selectedStatus}
                  onChange={(newStatus) => setSelectedStatuses(prev => ({
                    ...prev,
                    [record.id]: {
                      ...prev[record.id],
                      value: newStatus
                    }
                  }))}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="pending">Pending</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="under_review">Under Review</Option>
                  <Option value="on_hold">On Hold</Option>
                  <Option value="cancelled">Cancelled</Option>
                  <Option value="REJECTED">Rejected</Option>
                  <Option value="RETURNED">Returned</Option>
                </Select>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleRefundStatusChange(record.id, selectedStatus)}
                  style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    color: '#fff'
                  }}
                >
                  Apply
                </Button>
                <Button
                  type="default"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setSelectedStatuses(prev => {
                    const newState = { ...prev };
                    delete newState[record.id];
                    return newState;
                  })}
                  style={{
                    border: '1px solid #d9d9d9',
                    color: '#666'
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Tag
                  color={
                    status === 'pending' ? 'orange' :
                      status === 'approved' ? 'green' :
                        status === 'under_review' ? 'blue' :
                          status === 'on_hold' ? 'purple' :
                            status === 'cancelled' ? 'red' :
                              status === 'REJECTED' ? 'red' :
                                status === 'RETURNED' ? 'green' : 'default'
                  }
                  style={{ minWidth: 80, textAlign: 'center' }}
                >
                  {status.replace('_', ' ')}
                </Tag>
                {status === 'approved' && (
                  <Button
                    type="default"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => setSelectedStatuses(prev => ({
                      ...prev,
                      [record.id]: {
                        editing: true,
                        value: status
                      }
                    }))}
                    style={{
                      border: '1px solid #d9d9d9',
                      color: '#666'
                    }}
                  >
                    Edit
                  </Button>
                )}
              </>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' ? (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleRefundApproval(record.id, 'approve')}>
                  Approve
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button type="primary" danger size="small" icon={<CloseCircleOutlined />} onClick={() => handleRefundApproval(record.id, 'reject')}>
                  Reject
                </Button>
              </motion.div>
            </>
          ) : record.status === 'approved' ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="default"
                size="small"
                icon={<BuildOutlined />}
                onClick={() => openRefundKitInspection(record)}
                style={{
                  background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                  border: 'none',
                  color: '#fff'
                }}
              >
                Check Kit Status
              </Button>
            </motion.div>
          ) : null}
        </Space>
      )
    }
  ];

  const handleRefundStatusChange = (id, newStatus) => {
    const request = refundRequests.find(req => req.id === id);

    // If status is changing to REJECTED, add to log history and remove from refund requests
    if (newStatus === 'REJECTED') {
      // Add to log history
      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: 'REFUND_REQUEST_REJECTED',
        type: 'refund',
        user: request.userEmail,
        userName: request.userName || request.userEmail,
        details: {
          kitName: request.kitName,
          kitId: request.kitId || `KIT-${request.id}`,
          requestId: `REF-${request.id}`,
          reason: request.reason || 'Refund request',
          damageDescription: request.damageDescription || 'N/A',
          originalRentalId: request.originalRentalId || `RENT-${request.id}`,
          rejectedBy: 'admin@fpt.edu.vn',
          rejectionReason: 'Refund request rejected by admin',
          fineAmount: request.fineAmount || 0
        },
        status: 'REJECTED',
        adminAction: 'rejected',
        adminUser: 'admin@fpt.edu.vn',
        adminTimestamp: new Date().toISOString()
      };

      setLogHistory(prev => [logEntry, ...prev]);

      // Remove from refund requests
      setRefundRequests(prev => prev.filter(req => req.id !== id));

      notification.success({
        message: 'Refund Rejected',
        description: `Refund request has been rejected and moved to log history`,
        placement: 'topRight',
        duration: 3,
      });
    } else if (newStatus === 'RETURNED') {
      // If status is changing to RETURNED, add to log history and remove from refund requests
      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: 'REFUND_REQUEST_RETURNED',
        type: 'refund',
        user: request.userEmail,
        userName: request.userName || request.userEmail,
        details: {
          kitName: request.kitName,
          kitId: request.kitId || `KIT-${request.id}`,
          requestId: `REF-${request.id}`,
          reason: request.reason || 'Refund request',
          damageDescription: 'No damage found',
          originalRentalId: request.originalRentalId || `RENT-${request.id}`,
          returnedBy: 'admin@fpt.edu.vn',
          returnNotes: 'Kit returned in good condition'
        },
        status: 'RETURNED',
        adminAction: 'returned',
        adminUser: 'admin@fpt.edu.vn',
        adminTimestamp: new Date().toISOString()
      };

      setLogHistory(prev => [logEntry, ...prev]);

      // Remove from refund requests
      setRefundRequests(prev => prev.filter(req => req.id !== id));

      notification.success({
        message: 'Kit Returned',
        description: `Kit has been returned successfully and moved to log history`,
        placement: 'topRight',
        duration: 3,
      });
    } else {
      // Normal status update
      setRefundRequests(prev => prev.map(req =>
        req.id === id ? {
          ...req,
          status: newStatus,
          updatedBy: 'admin@fpt.edu.vn',
          updatedDate: new Date().toISOString()
        } : req
      ));

      notification.success({
        message: 'Status Updated',
        description: `Refund request status changed to ${newStatus.replace('_', ' ')}`,
        placement: 'topRight',
        duration: 3,
      });
    }

    // Clear the editing state for this record
    setSelectedStatuses(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const handleRefundApproval = (id, action) => {
    const request = refundRequests.find(req => req.id === id);

    if (action === 'approve') {
      setRefundRequests(prev => prev.map(req =>
        req.id === id ? {
          ...req,
          status: 'approved',
          approvedBy: 'admin@fpt.edu.vn',
          approvalDate: new Date().toISOString()
        } : req
      ));

      notification.success({
        message: 'Success',
        description: `Refund request approved successfully`,
        placement: 'topRight',
        duration: 3,
      });
    } else {
      // Add to log history when rejected
      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: 'REFUND_REQUEST_REJECTED',
        type: 'refund',
        user: request.userEmail,
        userName: request.userName || request.userEmail,
        details: {
          kitName: request.kitName,
          kitId: request.kitId || `KIT-${request.id}`,
          requestId: `REF-${request.id}`,
          reason: request.reason || 'Refund request',
          damageDescription: request.damageDescription || 'N/A',
          originalRentalId: request.originalRentalId || `RENT-${request.id}`,
          rejectedBy: 'admin@fpt.edu.vn',
          rejectionReason: 'Refund request rejected by admin',
          fineAmount: request.fineAmount || 0
        },
        status: 'REJECTED',
        adminAction: 'rejected',
        adminUser: 'admin@fpt.edu.vn',
        adminTimestamp: new Date().toISOString()
      };

      setLogHistory(prev => [logEntry, ...prev]);

      // Remove from refund requests
      setRefundRequests(prev => prev.filter(req => req.id !== id));

      notification.success({
        message: 'Refund Rejected',
        description: `Refund request has been rejected and moved to log history`,
        placement: 'topRight',
        duration: 3,
      });
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title="Refund Request Management"
        style={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden'
        }}
        headStyle={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0'
        }}
      >
        <Table
          columns={columns}
          dataSource={refundRequests}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
        />
      </Card>
    </motion.div>
  );
};

// Fine Management Component
const FineManagement = ({ fines, setFines, setLogHistory }) => {
  const columns = [
    {
      title: 'Fine ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => `#${id}`
    },
    {
      title: 'Kit',
      dataIndex: 'kitName',
      key: 'kitName'
    },
    {
      title: 'Student',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <Text type="secondary">{record.studentEmail}</Text>
        </div>
      )
    },
    {
      title: 'Group Leader',
      dataIndex: 'leaderName',
      key: 'leaderName',
      render: (name, record) => (
        <div>
          <div>{name}</div>
          <Text type="secondary">{record.leaderEmail}</Text>
        </div>
      )
    },
    {
      title: 'Fine Amount',
      dataIndex: 'fineAmount',
      key: 'fineAmount',
      render: (amount) => (
        <Text strong style={{ color: '#cf1322' }}>
          {amount.toLocaleString()} VND
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="primary"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => showFineDetails(record)}
            >
              Details
            </Button>
          </motion.div>
          {record.status === 'pending' && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="default"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => markAsPaid(record.id)}
                style={{
                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                  border: 'none',
                  color: '#fff'
                }}
              >
                Mark Paid
              </Button>
            </motion.div>
          )}
        </Space>
      )
    }
  ];

  const showFineDetails = (fine) => {
    Modal.info({
      title: 'Fine Details',
      width: 600,
      content: (
        <div>
          <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Fine ID">#{fine.id}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={fine.status === 'paid' ? 'green' : 'orange'}>
                {fine.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Kit">{fine.kitName}</Descriptions.Item>
            <Descriptions.Item label="Student">{fine.studentName}</Descriptions.Item>
            <Descriptions.Item label="Group Leader">{fine.leaderName}</Descriptions.Item>
            <Descriptions.Item label="Fine Amount">
              <Text strong style={{ color: '#cf1322' }}>
                {fine.fineAmount.toLocaleString()} VND
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Created">{new Date(fine.createdAt).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Due Date">{new Date(fine.dueDate).toLocaleString()}</Descriptions.Item>
          </Descriptions>

          <Divider>Damage Assessment</Divider>

          {Object.entries(fine.damageAssessment).map(([component, assessment]) => (
            assessment.damaged && (
              <Card key={component} size="small" style={{ marginBottom: 8 }}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong>{component}</Text>
                  </Col>
                  <Col>
                    <Text type="danger">{assessment.value.toLocaleString()} VND</Text>
                  </Col>
                </Row>
              </Card>
            )
          ))}
        </div>
      )
    });
  };

  const markAsPaid = (fineId) => {
    const fine = fines.find(f => f.id === fineId);

    setFines(prev => prev.map(f =>
      f.id === fineId
        ? { ...f, status: 'paid', paidDate: new Date().toISOString() }
        : f
    ));

    // Add to log history
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action: 'FINE_PAID',
      type: 'fine',
      user: fine.leaderEmail,
      userName: fine.leaderName,
      details: {
        kitName: fine.kitName,
        kitId: fine.kitId,
        fineId: `FINE-${fine.id}`,
        fineAmount: fine.fineAmount,
        damageAssessment: fine.damageAssessment,
        paidBy: fine.leaderEmail,
        paymentNotes: 'Fine paid by leader/lecturer'
      },
      status: 'PAID',
      adminAction: 'paid',
      adminUser: 'admin@fpt.edu.vn',
      adminTimestamp: new Date().toISOString()
    };

    setLogHistory(prev => [logEntry, ...prev]);

    notification.success({
      message: 'Fine Marked as Paid',
      description: 'The fine has been successfully marked as paid and added to log history.',
      placement: 'topRight',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title="Fine Management"
        style={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden'
        }}
        headStyle={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0'
        }}
      >
        <Table
          columns={columns}
          dataSource={fines}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
        />
      </Card>
    </motion.div>
  );
};

// Group Management Component
const GroupManagement = ({ groups, setGroups, generateRandomStudents, adjustGroupMembers, availableStudents }) => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);

  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Leader',
      dataIndex: 'leader',
      key: 'leader'
    },
    {
      title: 'Lecturer',
      dataIndex: 'lecturer',
      key: 'lecturer'
    },
    {
      title: 'Members',
      dataIndex: 'members',
      key: 'members',
      render: (members) => (
        <div>
          {members?.map((member, index) => (
            <Tag key={index} style={{ marginBottom: 4 }}>{member}</Tag>
          ))}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="primary"
              size="small"
              icon={<UserOutlined />}
              onClick={() => generateRandomStudents(record.id, 2)}
              style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none'
              }}
            >
              Add More Students
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => adjustGroupMembers(record)}
            >
              Adjust Members
            </Button>
          </motion.div>
        </Space>
      )
    }
  ];

  const handleSubmit = (values) => {
    // Get available students for random assignment
    const availableStudentsForGroup = availableStudents.filter(student =>
      !groups.some(group =>
        group.members &&
        group.members.includes(student.email)
      )
    );

    let newGroup = {
      id: Date.now(),
      ...values,
      members: []
    };

    // If there are available students, assign them randomly
    if (availableStudentsForGroup.length > 0) {
      const shuffled = availableStudentsForGroup.sort(() => 0.5 - Math.random());
      const selectedCount = Math.min(3, availableStudentsForGroup.length); // Assign up to 3 students
      const selectedStudents = shuffled.slice(0, selectedCount);
      const selectedEmails = selectedStudents.map(student => student.email);

      // First student becomes the leader
      const leaderEmail = selectedEmails[0];

      newGroup = {
        ...newGroup,
        leader: leaderEmail,
        members: selectedEmails
      };

      // Update the group with the new leader
      setGroups(prev => [...prev, newGroup]);

      notification.success({
        message: 'Group Created Successfully',
        description: `Group created with ${selectedEmails.length} random members. ${selectedStudents[0].name} assigned as leader.`,
        placement: 'topRight',
        duration: 4,
      });
    } else {
      // No available students, create group without members
      setGroups(prev => [...prev, newGroup]);
      notification.warning({
        message: 'Group Created',
        description: 'Group created successfully, but no students are available for assignment.',
        placement: 'topRight',
        duration: 4,
      });
    }

    setModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          title="Group Management"
          extra={
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Create Group with Random Members
              </Button>
            </motion.div>
          }
          style={{
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            overflow: 'hidden'
          }}
          headStyle={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderBottom: 'none',
            borderRadius: '20px 20px 0 0'
          }}
        >
          <Table
            columns={columns}
            dataSource={groups}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
          />
        </Card>
      </motion.div>

      <Modal
        title="Create New Group"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Group Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lecturer" label="Lecturer Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Alert
            message="Automatic Member Assignment"
            description="When you create a group, the system will automatically assign up to 3 random available students. The first assigned student will become the group leader."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Create Group with Random Members
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// User Management Component
const UserManagement = ({ users, setUsers }) => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : role === 'lecturer' ? 'orange' : 'blue'}>
          {role}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => editUser(record)}>
              Edit
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />} onClick={() => deleteUser(record.id)}>
              Delete
            </Button>
          </motion.div>
        </Space>
      )
    }
  ];

  const editUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const deleteUser = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setUsers(prev => prev.filter(user => user.id !== id));
        notification.success({
          message: 'Success',
          description: 'User deleted successfully',
          placement: 'topRight',
          duration: 3,
        });
      }
    });
  };

  const handleSubmit = (values) => {
    if (editingUser) {
      setUsers(prev => prev.map(user => user.id === editingUser.id ? { ...user, ...values } : user));
      notification.success({
        message: 'Success',
        description: 'User updated successfully',
        placement: 'topRight',
        duration: 3,
      });
    } else {
      const newUser = {
        id: Date.now(),
        ...values,
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      setUsers(prev => [...prev, newUser]);
      notification.success({
        message: 'Success',
        description: 'User created successfully',
        placement: 'topRight',
        duration: 3,
      });
    }
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          title="User Management"
          extra={
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalVisible(true)}
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Add User
              </Button>
            </motion.div>
          }
          style={{
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            overflow: 'hidden'
          }}
          headStyle={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            borderBottom: 'none',
            borderRadius: '20px 20px 0 0'
          }}
        >
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
          />
        </Card>
      </motion.div>

      <Modal
        title={editingUser ? 'Edit User' : 'Add User'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select>
              <Option value="student">Student</Option>
              <Option value="lecturer">Lecturer</Option>
              <Option value="admin">Admin</Option>
              <Option value="academic">Academic Affairs</Option>
              <Option value="leader">Leader</Option>
              <Option value="member">Member</Option>
              <Option value="parent">Parent</Option>
            </Select>
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="Password" rules={[{ required: true }]}>
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                setEditingUser(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};



// Transaction History Component
const TransactionHistory = ({ transactions, setTransactions }) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const { RangePicker } = DatePicker;
  const { Option } = Select;

  // Animation variants for this component
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'RENTAL_PAYMENT':
        return 'blue';
      case 'FINE_PAYMENT':
        return 'red';
      case 'DAMAGE_FINE':
        return 'orange';
      case 'REFUND':
        return 'green';
      case 'DEPOSIT':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'RENTAL_PAYMENT':
        return <ShoppingOutlined />;
      case 'FINE_PAYMENT':
        return <DollarOutlined />;
      case 'DAMAGE_FINE':
        return <ExclamationCircleOutlined />;
      case 'REFUND':
        return <RollbackOutlined />;
      case 'DEPOSIT':
        return <PlusOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  const showTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailModalVisible(true);
  };

  const handleExportTransactions = () => {
    const transactionData = transactions.map(txn => ({
      'Transaction ID': txn.transactionId,
      'User Name': txn.userName,
      'User Email': txn.userEmail,
      'User Role': txn.userRole,
      'Type': txn.type,
      'Amount': txn.amount,
      'Currency': txn.currency,
      'Status': txn.status,
      'Description': txn.description,
      'Kit Name': txn.kitName || 'N/A',
      'Payment Method': txn.paymentMethod,
      'Transaction Date': txn.transactionDate,
      'Processed By': txn.processedBy || 'N/A',
      'Reference': txn.reference,
      'Notes': txn.notes
    }));

    const ws = XLSX.utils.json_to_sheet(transactionData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, 'transaction_history.xlsx');

    notification.success({
      message: 'Export Successful',
      description: 'Transaction history exported to Excel file',
      placement: 'topRight',
    });
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      transaction.transactionId.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.userEmail.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.description.toLowerCase().includes(searchText.toLowerCase()) ||
      transaction.reference.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

    let matchesDate = true;
    if (dateRange && dateRange.length === 2) {
      const transactionDate = new Date(transaction.transactionDate);
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      matchesDate = transactionDate >= startDate && transactionDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  const completedTransactions = filteredTransactions.filter(txn => txn.status === 'COMPLETED');
  const pendingTransactions = filteredTransactions.filter(txn => txn.status === 'PENDING');
  const failedTransactions = filteredTransactions.filter(txn => txn.status === 'FAILED');

  return (
    <div>
      <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
        <Card
          title="Transaction History"
          extra={
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExportTransactions}
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontWeight: 'bold'
              }}
            >
              Export to Excel
            </Button>
          }
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          <Alert
            message="Transaction Overview"
            description="View and manage all financial transactions including rental payments, fines, refunds, and deposits."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* Statistics Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ textAlign: 'center', borderRadius: '12px' }}>
                <Statistic
                  title="Total Transactions"
                  value={filteredTransactions.length}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ textAlign: 'center', borderRadius: '12px' }}>
                <Statistic
                  title="Total Amount"
                  value={formatAmount(totalAmount)}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: totalAmount >= 0 ? '#52c41a' : '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ textAlign: 'center', borderRadius: '12px' }}>
                <Statistic
                  title="Completed"
                  value={completedTransactions.length}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ textAlign: 'center', borderRadius: '12px' }}>
                <Statistic
                  title="Pending"
                  value={pendingTransactions.length}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Search transactions..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ borderRadius: '8px' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%', borderRadius: '8px' }}
              >
                <Option value="all">All Status</Option>
                <Option value="COMPLETED">Completed</Option>
                <Option value="PENDING">Pending</Option>
                <Option value="FAILED">Failed</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Filter by type"
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: '100%', borderRadius: '8px' }}
              >
                <Option value="all">All Types</Option>
                <Option value="RENTAL_PAYMENT">Rental Payment</Option>
                <Option value="FINE_PAYMENT">Fine Payment</Option>
                <Option value="DAMAGE_FINE">Damage Fine</Option>
                <Option value="REFUND">Refund</Option>
                <Option value="DEPOSIT">Deposit</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                placeholder={['Start Date', 'End Date']}
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </Col>
          </Row>

          {/* Transactions Table */}
          <Table
            dataSource={filteredTransactions}
            columns={[
              {
                title: 'Transaction ID',
                dataIndex: 'transactionId',
                key: 'transactionId',
                render: (text) => <Text code>{text}</Text>
              },
              {
                title: 'User',
                key: 'user',
                render: (_, record) => (
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{record.userName}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{record.userEmail}</div>
                    <Tag size="small" color="blue">{record.userRole}</Tag>
                  </div>
                )
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (type) => (
                  <Tag color={getTransactionTypeColor(type)} icon={getTransactionTypeIcon(type)}>
                    {type.replace('_', ' ')}
                  </Tag>
                )
              },
              {
                title: 'Amount',
                dataIndex: 'amount',
                key: 'amount',
                render: (amount) => (
                  <Text strong style={{ color: amount >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    {formatAmount(amount)}
                  </Text>
                )
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag color={getStatusColor(status)}>
                    {status}
                  </Tag>
                )
              },
              {
                title: 'Date',
                dataIndex: 'transactionDate',
                key: 'transactionDate',
                render: (date) => formatDateTime(date)
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                  <Space>
                    <Button
                      type="primary"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => showTransactionDetails(record)}
                    >
                      View Details
                    </Button>
                  </Space>
                ),
              },
            ]}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </motion.div>

      {/* Transaction Details Modal */}
      <Modal
        title="Transaction Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={700}
        centered
      >
        {selectedTransaction && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Transaction ID" span={2}>
              <Text code>{selectedTransaction.transactionId}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="User Name">{selectedTransaction.userName}</Descriptions.Item>
            <Descriptions.Item label="User Email">{selectedTransaction.userEmail}</Descriptions.Item>
            <Descriptions.Item label="User Role">
              <Tag color="blue">{selectedTransaction.userRole}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Transaction Type">
              <Tag color={getTransactionTypeColor(selectedTransaction.type)} icon={getTransactionTypeIcon(selectedTransaction.type)}>
                {selectedTransaction.type.replace('_', ' ')}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Amount" span={2}>
              <Text strong style={{ fontSize: '18px', color: selectedTransaction.amount >= 0 ? '#52c41a' : '#ff4d4f' }}>
                {formatAmount(selectedTransaction.amount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedTransaction.status)}>
                {selectedTransaction.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">{selectedTransaction.paymentMethod}</Descriptions.Item>
            <Descriptions.Item label="Kit Name" span={2}>
              {selectedTransaction.kitName || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedTransaction.description}
            </Descriptions.Item>
            <Descriptions.Item label="Transaction Date">{formatDateTime(selectedTransaction.transactionDate)}</Descriptions.Item>
            <Descriptions.Item label="Processed By">{selectedTransaction.processedBy || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Reference" span={2}>
              <Text code>{selectedTransaction.reference}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>
              {selectedTransaction.notes}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

// Settings Component
const Settings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title="System Settings"
        style={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden'
        }}
        headStyle={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0'
        }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card
                title="General Settings"
                size="small"
                style={{
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  overflow: 'hidden'
                }}
                headStyle={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  borderBottom: 'none',
                  borderRadius: '16px 16px 0 0'
                }}
              >
                <Form layout="vertical">
                  <Form.Item label="System Name">
                    <Input defaultValue="IoT Kit Rental System" />
                  </Form.Item>
                  <Form.Item label="Email Notifications">
                    <Switch defaultChecked />
                  </Form.Item>
                  <Form.Item label="Auto Approve Requests">
                    <Switch />
                  </Form.Item>
                </Form>
              </Card>
            </motion.div>
          </Col>
          <Col span={12}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card
                title="Security Settings"
                size="small"
                style={{
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  overflow: 'hidden'
                }}
                headStyle={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  borderBottom: 'none',
                  borderRadius: '16px 16px 0 0'
                }}
              >
                <Form layout="vertical">
                  <Form.Item label="Session Timeout (minutes)">
                    <Input type="number" defaultValue={30} />
                  </Form.Item>
                  <Form.Item label="Password Policy">
                    <Select defaultValue="medium">
                      <Option value="low">Low</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="high">High</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="Two-Factor Authentication">
                    <Switch />
                  </Form.Item>
                </Form>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
};

// Log History Component
const LogHistory = ({ logHistory, setLogHistory, cashFlowHistory, setCashFlowHistory }) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('requests');

  // Animation variants for the component
  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  // Initialize mock log data if empty
  useEffect(() => {
    if (logHistory.length === 0) {
      const mockLogs = [
        {
          id: 1,
          timestamp: new Date('2024-01-15T10:30:00').toISOString(),
          action: 'RENTAL_REQUEST_BORROWED',
          type: 'rental',
          user: 'john.doe@university.edu',
          userName: 'John Doe',
          details: {
            kitName: 'Arduino Starter Kit',
            kitId: 'ARD-001',
            requestId: 'REQ-2024-001',
            reason: 'IoT Fundamentals Course Project',
            duration: '2 weeks'
          },
          status: 'BORROWED',
          adminAction: 'borrowed',
          adminUser: 'admin@university.edu',
          adminTimestamp: new Date('2024-01-15T11:15:00').toISOString()
        },
        {
          id: 2,
          timestamp: new Date('2024-01-20T14:20:00').toISOString(),
          action: 'RENTAL_REQUEST_RETURNED',
          type: 'rental',
          user: 'john.doe@university.edu',
          userName: 'John Doe',
          details: {
            kitName: 'Arduino Starter Kit',
            kitId: 'ARD-001',
            requestId: 'REQ-2024-001',
            returnedBy: 'admin@university.edu',
            returnNotes: 'Kit returned in good condition'
          },
          status: 'RETURNED',
          adminAction: 'returned',
          adminUser: 'admin@university.edu',
          adminTimestamp: new Date('2024-01-20T14:20:00').toISOString()
        },
        {
          id: 3,
          timestamp: new Date('2024-01-20T14:20:00').toISOString(),
          action: 'REFUND_REQUEST_REJECTED',
          type: 'refund',
          user: 'jane.smith@university.edu',
          userName: 'Jane Smith',
          details: {
            kitName: 'Raspberry Pi Kit',
            kitId: 'RPI-002',
            requestId: 'REF-2024-001',
            reason: 'Kit damaged during use',
            damageDescription: 'Broken GPIO pins',
            originalRentalId: 'RENT-2024-005',
            rejectedBy: 'admin@university.edu',
            rejectionReason: 'Damage appears to be user negligence',
            fineAmount: 50
          },
          status: 'REJECTED',
          adminAction: 'rejected',
          adminUser: 'admin@university.edu',
          adminTimestamp: new Date('2024-01-20T15:45:00').toISOString()
        },
        {
          id: 4,
          timestamp: new Date('2024-01-22T09:10:00').toISOString(),
          action: 'RENTAL_REQUEST_BORROWED',
          type: 'rental',
          user: 'mike.wilson@university.edu',
          userName: 'Mike Wilson',
          details: {
            kitName: 'Sensor Kit',
            kitId: 'SEN-003',
            requestId: 'REQ-2024-002',
            reason: 'Research project on environmental monitoring',
            duration: '1 month'
          },
          status: 'BORROWED',
          adminAction: 'borrowed',
          adminUser: 'admin@university.edu',
          adminTimestamp: new Date('2024-01-22T10:30:00').toISOString()
        },
        {
          id: 5,
          timestamp: new Date('2024-01-25T16:20:00').toISOString(),
          action: 'RENTAL_REQUEST_RETURNED',
          type: 'rental',
          user: 'mike.wilson@university.edu',
          userName: 'Mike Wilson',
          details: {
            kitName: 'Sensor Kit',
            kitId: 'SEN-003',
            requestId: 'REQ-2024-002',
            returnedBy: 'admin@university.edu',
            returnNotes: 'Kit returned with minor wear'
          },
          status: 'RETURNED',
          adminAction: 'returned',
          adminUser: 'admin@university.edu',
          adminTimestamp: new Date('2024-01-25T16:20:00').toISOString()
        },
        {
          id: 6,
          timestamp: new Date('2024-01-28T11:15:00').toISOString(),
          action: 'REFUND_REQUEST_REJECTED',
          type: 'refund',
          user: 'sarah.jones@university.edu',
          userName: 'Sarah Jones',
          details: {
            kitName: 'Microcontroller Kit',
            kitId: 'MCU-004',
            requestId: 'REF-2024-002',
            reason: 'Kit not working properly',
            damageDescription: 'Power supply issues',
            originalRentalId: 'RENT-2024-008',
            rejectedBy: 'admin@university.edu',
            rejectionReason: 'Issue was present before rental',
            fineAmount: 0
          },
          status: 'REJECTED',
          adminAction: 'rejected',
          adminUser: 'admin@university.edu',
          adminTimestamp: new Date('2024-01-28T11:15:00').toISOString()
        }
      ];
      setLogHistory(mockLogs);
    }

    // Initialize mock cash flow data if empty
    if (cashFlowHistory.length === 0) {
      const mockCashFlow = [
        {
          id: 1,
          timestamp: new Date('2024-01-15T10:30:00').toISOString(),
          type: 'DEPOSIT',
          flowType: 'INFLOW',
          user: 'john.doe@university.edu',
          userName: 'John Doe',
          amount: 500000,
          currency: 'VND',
          description: 'Deposit for Arduino Starter Kit rental',
          requestId: 'REQ-2024-001',
          kitName: 'Arduino Starter Kit',
          status: 'COMPLETED',
          processedBy: 'admin@university.edu',
          reference: 'DEP-2024-001'
        },
        {
          id: 2,
          timestamp: new Date('2024-01-15T11:15:00').toISOString(),
          type: 'RENTAL_PAYMENT',
          flowType: 'INFLOW',
          user: 'john.doe@university.edu',
          userName: 'John Doe',
          amount: 200000,
          currency: 'VND',
          description: 'Rental payment for Arduino Starter Kit',
          requestId: 'REQ-2024-001',
          kitName: 'Arduino Starter Kit',
          status: 'COMPLETED',
          processedBy: 'admin@university.edu',
          reference: 'RENT-2024-001'
        },
        {
          id: 3,
          timestamp: new Date('2024-01-20T14:20:00').toISOString(),
          type: 'REFUND_REQUEST',
          flowType: 'PENDING',
          user: 'jane.smith@university.edu',
          userName: 'Jane Smith',
          amount: 300000,
          currency: 'VND',
          description: 'Refund request for damaged Raspberry Pi Kit',
          requestId: 'REF-2024-001',
          kitName: 'Raspberry Pi Kit',
          status: 'PENDING',
          processedBy: null,
          reference: 'REF-2024-001'
        },
        {
          id: 4,
          timestamp: new Date('2024-01-20T15:45:00').toISOString(),
          type: 'REFUND_REJECTED',
          flowType: 'NO_FLOW',
          user: 'jane.smith@university.edu',
          userName: 'Jane Smith',
          amount: 0,
          currency: 'VND',
          description: 'Refund rejected - damage due to negligence',
          requestId: 'REF-2024-001',
          kitName: 'Raspberry Pi Kit',
          status: 'REJECTED',
          processedBy: 'admin@university.edu',
          reference: 'REF-2024-001',
          fineAmount: 50000
        },
        {
          id: 5,
          timestamp: new Date('2024-01-22T09:10:00').toISOString(),
          type: 'DEPOSIT',
          flowType: 'INFLOW',
          user: 'mike.wilson@university.edu',
          userName: 'Mike Wilson',
          amount: 800000,
          currency: 'VND',
          description: 'Deposit for Sensor Kit rental',
          requestId: 'REQ-2024-002',
          kitName: 'Sensor Kit',
          status: 'COMPLETED',
          processedBy: 'admin@university.edu',
          reference: 'DEP-2024-002'
        },
        {
          id: 6,
          timestamp: new Date('2024-01-22T10:30:00').toISOString(),
          type: 'RENTAL_PAYMENT',
          flowType: 'INFLOW',
          user: 'mike.wilson@university.edu',
          userName: 'Mike Wilson',
          amount: 400000,
          currency: 'VND',
          description: 'Rental payment for Sensor Kit',
          requestId: 'REQ-2024-002',
          kitName: 'Sensor Kit',
          status: 'COMPLETED',
          processedBy: 'admin@university.edu',
          reference: 'RENT-2024-002'
        }
      ];
      setCashFlowHistory(mockCashFlow);
    }
  }, [logHistory.length, setLogHistory, cashFlowHistory.length, setCashFlowHistory]);

  const getActionIcon = (action) => {
    switch (action) {
      case 'RENTAL_REQUEST_BORROWED':
        return <ShoppingOutlined style={{ color: '#1890ff' }} />;
      case 'RENTAL_REQUEST_RETURNED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'REFUND_REQUEST_REJECTED':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'REFUND_REQUEST_RETURNED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'FINE_PAID':
        return <DollarOutlined style={{ color: '#52c41a' }} />;
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getCashFlowIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <PlusOutlined style={{ color: '#52c41a' }} />;
      case 'RENTAL_PAYMENT':
        return <ShoppingOutlined style={{ color: '#1890ff' }} />;
      case 'REFUND_REQUEST':
        return <RollbackOutlined style={{ color: '#fa8c16' }} />;
      case 'REFUND_APPROVED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'REFUND_REJECTED':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
      case 'FINE_PAYMENT':
        return <DollarOutlined style={{ color: '#f5222d' }} />;
      default:
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getCashFlowColor = (flowType) => {
    switch (flowType) {
      case 'INFLOW':
        return 'green';
      case 'OUTFLOW':
        return 'red';
      case 'PENDING':
        return 'orange';
      case 'NO_FLOW':
        return 'default';
      default:
        return 'default';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'RENTAL_REQUEST_BORROWED':
        return 'blue';
      case 'RENTAL_REQUEST_RETURNED':
        return 'green';
      case 'REFUND_REQUEST_REJECTED':
        return 'red';
      case 'REFUND_REQUEST_RETURNED':
        return 'green';
      case 'FINE_PAID':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'BORROWED':
        return 'processing';
      case 'RETURNED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PAID':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredLogs = logHistory.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      log.details.kitName.toLowerCase().includes(searchText.toLowerCase()) ||
      log.details.requestId.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesType = typeFilter === 'all' || log.type === typeFilter;

    let matchesDate = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const logDate = new Date(log.timestamp);
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      matchesDate = logDate >= startDate && logDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const filteredCashFlow = cashFlowHistory.filter(flow => {
    const matchesSearch = flow.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      flow.kitName.toLowerCase().includes(searchText.toLowerCase()) ||
      flow.reference.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'all' || flow.status === statusFilter;
    const matchesType = typeFilter === 'all' || flow.type === typeFilter;

    let matchesDate = true;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const flowDate = new Date(flow.timestamp);
      const startDate = dateRange[0].startOf('day').toDate();
      const endDate = dateRange[1].endOf('day').toDate();
      matchesDate = flowDate >= startDate && flowDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 200,
      render: (action) => (
        <Space>
          {getActionIcon(action)}
          <span>{action.replace(/_/g, ' ')}</span>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === 'rental' ? 'blue' : 'orange'}>
          {type.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
    },
    {
      title: 'Kit',
      dataIndex: 'details',
      key: 'kitName',
      width: 150,
      render: (details) => details.kitName,
    },
    {
      title: 'Request ID',
      dataIndex: 'details',
      key: 'requestId',
      width: 120,
      render: (details) => details.requestId,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => formatTimestamp(timestamp),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  const cashFlowColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => (
        <Space>
          {getCashFlowIcon(type)}
          <span>{type.replace(/_/g, ' ')}</span>
        </Space>
      ),
    },
    {
      title: 'Flow',
      dataIndex: 'flowType',
      key: 'flowType',
      width: 100,
      render: (flowType) => (
        <Tag color={getCashFlowColor(flowType)}>
          {flowType}
        </Tag>
      ),
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      width: 150,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount, record) => (
        <span style={{
          color: record.flowType === 'INFLOW' ? '#52c41a' :
            record.flowType === 'OUTFLOW' ? '#f5222d' : '#666',
          fontWeight: 'bold'
        }}>
          {amount.toLocaleString()} {record.currency}
        </span>
      ),
    },
    {
      title: 'Kit',
      dataIndex: 'kitName',
      key: 'kitName',
      width: 150,
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp) => formatTimestamp(timestamp),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewCashFlowDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];

  const handleViewCashFlowDetails = (flow) => {
    setSelectedLog(flow);
    setDetailModalVisible(true);
  };

  return (
    <div>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HistoryOutlined style={{ color: '#667eea' }} />
              <span>Log History</span>
            </div>
          }
          extra={
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  // Refresh log data
                  setLogHistory([]);
                }}
              >
                Refresh
              </Button>
              <Button
                icon={<ExportOutlined />}
                onClick={() => {
                  // Export log data
                  const data = filteredLogs.map(log => ({
                    'Timestamp': formatTimestamp(log.timestamp),
                    'Action': log.action.replace(/_/g, ' '),
                    'Type': log.type.toUpperCase(),
                    'User': log.userName,
                    'Kit': log.details.kitName,
                    'Request ID': log.details.requestId,
                    'Status': log.status.toUpperCase(),
                    'Admin Action': log.adminAction || 'N/A',
                    'Admin User': log.adminUser || 'N/A'
                  }));

                  const ws = XLSX.utils.json_to_sheet(data);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, 'Log History');
                  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                  const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  saveAs(dataBlob, 'log_history.xlsx');

                  notification.success({
                    message: 'Export Successful',
                    description: 'Log history exported to Excel file',
                    placement: 'topRight',
                  });
                }}
              >
                Export
              </Button>
            </Space>
          }
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane tab="Request History" key="requests">
              {/* Filters */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={6}>
                  <Input
                    placeholder="Search by user, kit, or request ID"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Filter by status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Option value="all">All Status</Option>
                    <Option value="BORROWED">Borrowed</Option>
                    <Option value="RETURNED">Returned</Option>
                    <Option value="REJECTED">Rejected</Option>
                    <Option value="PAID">Paid</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Filter by type"
                    value={typeFilter}
                    onChange={setTypeFilter}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Option value="all">All Types</Option>
                    <Option value="rental">Rental</Option>
                    <Option value="refund">Refund</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <DatePicker.RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    style={{ width: '100%' }}
                    placeholder={['Start Date', 'End Date']}
                  />
                </Col>
              </Row>

              {/* Statistics */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Total Logs"
                      value={filteredLogs.length}
                      prefix={<HistoryOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Rental Requests"
                      value={filteredLogs.filter(log => log.type === 'rental').length}
                      prefix={<ShoppingOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Refund Requests"
                      value={filteredLogs.filter(log => log.type === 'refund').length}
                      prefix={<RollbackOutlined />}
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Borrowed Items"
                      value={filteredLogs.filter(log => log.status === 'BORROWED').length}
                      prefix={<ShoppingOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Returned Items"
                      value={filteredLogs.filter(log => log.status === 'RETURNED').length}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Log Table */}
              <Table
                dataSource={filteredLogs}
                columns={columns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} logs`,
                }}
                scroll={{ x: 1200 }}
              />
            </Tabs.TabPane>

            <Tabs.TabPane tab="Cash Flow History" key="cashflow">
              {/* Cash Flow Filters */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={12} md={6}>
                  <Input
                    placeholder="Search by user, kit, or reference"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Filter by status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Option value="all">All Status</Option>
                    <Option value="COMPLETED">Completed</Option>
                    <Option value="PENDING">Pending</Option>
                    <Option value="REJECTED">Rejected</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Filter by type"
                    value={typeFilter}
                    onChange={setTypeFilter}
                    style={{ width: '100%' }}
                    allowClear
                  >
                    <Option value="all">All Types</Option>
                    <Option value="DEPOSIT">Deposit</Option>
                    <Option value="RENTAL_PAYMENT">Rental Payment</Option>
                    <Option value="REFUND_REQUEST">Refund Request</Option>
                    <Option value="REFUND_APPROVED">Refund Approved</Option>
                    <Option value="REFUND_REJECTED">Refund Rejected</Option>
                    <Option value="FINE_PAYMENT">Fine Payment</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <DatePicker.RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    style={{ width: '100%' }}
                    placeholder={['Start Date', 'End Date']}
                  />
                </Col>
              </Row>

              {/* Cash Flow Statistics */}
              <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Total Transactions"
                      value={filteredCashFlow.length}
                      prefix={<HistoryOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Total Inflow"
                      value={filteredCashFlow.filter(flow => flow.flowType === 'INFLOW').reduce((sum, flow) => sum + flow.amount, 0).toLocaleString()}
                      prefix={<PlusOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                      suffix="VND"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Total Outflow"
                      value={filteredCashFlow.filter(flow => flow.flowType === 'OUTFLOW').reduce((sum, flow) => sum + flow.amount, 0).toLocaleString()}
                      prefix={<MinusOutlined />}
                      valueStyle={{ color: '#f5222d' }}
                      suffix="VND"
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Net Flow"
                      value={(filteredCashFlow.filter(flow => flow.flowType === 'INFLOW').reduce((sum, flow) => sum + flow.amount, 0) -
                        filteredCashFlow.filter(flow => flow.flowType === 'OUTFLOW').reduce((sum, flow) => sum + flow.amount, 0)).toLocaleString()}
                      prefix={<DollarOutlined />}
                      valueStyle={{ color: '#fa8c16' }}
                      suffix="VND"
                    />
                  </Card>
                </Col>
              </Row>

              {/* Cash Flow Table */}
              <Table
                dataSource={filteredCashFlow}
                columns={cashFlowColumns}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} transactions`,
                }}
                scroll={{ x: 1200 }}
              />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </motion.div>

      {/* Log Detail Modal */}
      <Modal
        title="Log Details"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedLog(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false);
            setSelectedLog(null);
          }}>
            Close
          </Button>
        ]}
        width={800}
        centered
      >
        {selectedLog && (
          <div>
            <Descriptions bordered column={2}>
              {selectedLog.action ? (
                // Request History Details
                <>
                  <Descriptions.Item label="Action" span={2}>
                    <Space>
                      {getActionIcon(selectedLog.action)}
                      <span style={{ fontWeight: 'bold' }}>
                        {selectedLog.action.replace(/_/g, ' ')}
                      </span>
                    </Space>
                  </Descriptions.Item>
                </>
              ) : (
                // Cash Flow Details
                <>
                  <Descriptions.Item label="Transaction Type" span={2}>
                    <Space>
                      {getCashFlowIcon(selectedLog.type)}
                      <span style={{ fontWeight: 'bold' }}>
                        {selectedLog.type.replace(/_/g, ' ')}
                      </span>
                    </Space>
                  </Descriptions.Item>
                </>
              )}
              {selectedLog.action ? (
                // Request History Details
                <>
                  <Descriptions.Item label="Type">
                    <Tag color={selectedLog.type === 'rental' ? 'blue' : 'orange'}>
                      {selectedLog.type.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(selectedLog.status)}>
                      {selectedLog.status.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="User">
                    {selectedLog.userName} ({selectedLog.user})
                  </Descriptions.Item>
                  <Descriptions.Item label="Timestamp">
                    {formatTimestamp(selectedLog.timestamp)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kit Name" span={2}>
                    {selectedLog.details.kitName} (ID: {selectedLog.details.kitId})
                  </Descriptions.Item>
                  <Descriptions.Item label="Request ID" span={2}>
                    {selectedLog.details.requestId}
                  </Descriptions.Item>
                </>
              ) : (
                // Cash Flow Details
                <>
                  <Descriptions.Item label="Flow Type">
                    <Tag color={getCashFlowColor(selectedLog.flowType)}>
                      {selectedLog.flowType}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={getStatusColor(selectedLog.status)}>
                      {selectedLog.status.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="User">
                    {selectedLog.userName} ({selectedLog.user})
                  </Descriptions.Item>
                  <Descriptions.Item label="Amount">
                    <span style={{
                      color: selectedLog.flowType === 'INFLOW' ? '#52c41a' :
                        selectedLog.flowType === 'OUTFLOW' ? '#f5222d' : '#666',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      {selectedLog.amount.toLocaleString()} {selectedLog.currency}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Timestamp">
                    {formatTimestamp(selectedLog.timestamp)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Kit Name" span={2}>
                    {selectedLog.kitName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Reference" span={2}>
                    {selectedLog.reference}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description" span={2}>
                    {selectedLog.description}
                  </Descriptions.Item>
                </>
              )}

              {/* Conditional fields based on action type - Only for Request History */}
              {selectedLog.action && selectedLog.type === 'rental' && (
                <>
                  <Descriptions.Item label="Reason" span={2}>
                    {selectedLog.details.reason}
                  </Descriptions.Item>
                  <Descriptions.Item label="Duration" span={2}>
                    {selectedLog.details.duration}
                  </Descriptions.Item>
                </>
              )}

              {selectedLog.action && selectedLog.type === 'refund' && (
                <>
                  <Descriptions.Item label="Reason" span={2}>
                    {selectedLog.details.reason}
                  </Descriptions.Item>
                  {selectedLog.details.damageDescription && (
                    <Descriptions.Item label="Damage Description" span={2}>
                      {selectedLog.details.damageDescription}
                    </Descriptions.Item>
                  )}
                  {selectedLog.details.originalRentalId && (
                    <Descriptions.Item label="Original Rental ID" span={2}>
                      {selectedLog.details.originalRentalId}
                    </Descriptions.Item>
                  )}
                </>
              )}

              {/* Admin action details - Only for Request History */}
              {selectedLog.action && selectedLog.adminAction && (
                <>
                  <Descriptions.Item label="Admin Action">
                    <Tag color={selectedLog.adminAction === 'approved' ? 'green' : 'red'}>
                      {selectedLog.adminAction.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Admin User">
                    {selectedLog.adminUser}
                  </Descriptions.Item>
                  <Descriptions.Item label="Admin Timestamp">
                    {formatTimestamp(selectedLog.adminTimestamp)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Notes" span={2}>
                    {selectedLog.details.approvalNotes || selectedLog.details.rejectionReason || 'No notes provided'}
                  </Descriptions.Item>
                  {selectedLog.details.fineAmount && (
                    <Descriptions.Item label="Fine Amount" span={2}>
                      ${selectedLog.details.fineAmount}
                    </Descriptions.Item>
                  )}
                </>
              )}

              {/* Cash Flow specific details */}
              {!selectedLog.action && selectedLog.fineAmount && (
                <Descriptions.Item label="Fine Amount" span={2}>
                  {selectedLog.fineAmount.toLocaleString()} {selectedLog.currency}
                </Descriptions.Item>
              )}

              {!selectedLog.action && selectedLog.processedBy && (
                <>
                  <Descriptions.Item label="Processed By" span={2}>
                    {selectedLog.processedBy}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPortal; 
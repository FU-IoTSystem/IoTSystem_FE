import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout,
  Menu,
  Card,
  Table,
  Button,
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Avatar,
  Badge,
  List,
  Alert,
  Descriptions,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Divider,
  Popover,
  Drawer
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LoadingOutlined,
  WalletOutlined,
  DollarOutlined,
  BellOutlined,
  PlusOutlined,
  UserAddOutlined,
  EditOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  ShoppingOutlined,
  InfoCircleOutlined,
  RollbackOutlined,
  EyeOutlined,
  SettingOutlined,
  LockOutlined
} from '@ant-design/icons';
import {
  authAPI,
  borrowingGroupAPI,
  studentGroupAPI,
  walletAPI,
  walletTransactionAPI,
  classesAPI,
  userAPI,
  penaltiesAPI,
  penaltyDetailAPI,
  paymentAPI,
  classAssignmentAPI,
  notificationAPI,
  borrowingRequestAPI
} from './api';
import dayjs from 'dayjs';

// Default wallet structure
const defaultWallet = { balance: 0, transactions: [] };

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

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

const formatDateTimeDisplay = (dateString) => {
  if (!dateString) return 'N/A';
  const date = dayjs(dateString);
  return date.isValid() ? date.format('DD/MM/YYYY HH:mm') : 'N/A';
};

function MemberPortal({ user, onLogout }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(null);
  const [wallet, setWallet] = useState(defaultWallet);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [borrowingRequests, setBorrowingRequests] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [penaltyDetails, setPenaltyDetails] = useState([]);

  // Group management states
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [joinGroupModalVisible, setJoinGroupModalVisible] = useState(false);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [allLecturers, setAllLecturers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classAssignments, setClassAssignments] = useState([]);
  const [form] = Form.useForm();

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationPopoverOpen, setNotificationPopoverOpen] = useState(false);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user && user.id) {
      loadData();
      loadNotifications();
    }
  }, [user]);

  // Load notifications
  const loadNotifications = async () => {
    try {
      setNotificationLoading(true);
      const response = await notificationAPI.getMyNotifications();
      const data = response?.data ?? response;
      const notificationsArray = Array.isArray(data) ? data : [];

      // Sort notifications by createdAt descending (newest first)
      const sortedNotifications = notificationsArray.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA; // Descending order (newest first)
      });

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  };

  // Handle notification click - navigate based on notification type
  const handleNotificationClick = async (notificationItem) => {
    // Mark as read if not already read
    if (!notificationItem.isRead && notificationItem.id) {
      try {
        await notificationAPI.markAsRead(notificationItem.id);
        // Update notification state to mark as read
        setNotifications(prev =>
          prev.map(item =>
            item.id === notificationItem.id
              ? { ...item, isRead: true }
              : item
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Close popover
    setNotificationPopoverOpen(false);

    // Navigate based on notification subType
    const subType = notificationItem.subType || notificationItem.type || '';

    switch (subType) {
      case 'UNPAID_PENALTY':
        // Navigate to penalty payment page
        // Check if penaltyId is in message or extract from notification
        const penaltyIdMatch = notificationItem.message?.match(/penalty[:\s]+([a-f0-9-]+)/i) ||
          notificationItem.message?.match(/phạt[:\s]+([a-f0-9-]+)/i);
        if (penaltyIdMatch && penaltyIdMatch[1]) {
          navigate(`/penalty-payment?penaltyId=${penaltyIdMatch[1]}`);
        } else {
          // Navigate to wallet page to see penalties
          setSelectedKey('wallet');
        }
        break;

      case 'DEPOSIT_SUCCESS':
      case 'TOP_UP_SUCCESS':
        // Navigate to wallet page
        setSelectedKey('wallet');
        break;

      case 'OVERDUE_RETURN':
        // Navigate to wallet page (where penalties are shown)
        setSelectedKey('wallet');
        break;

      case 'RENTAL_APPROVED':
      case 'RENTAL_REJECTED':
        // Navigate to dashboard or wallet
        setSelectedKey('dashboard');
        break;

      case 'GROUP_INVITATION':
      case 'GROUP_UPDATE':
        // Navigate to group info
        setSelectedKey('group');
        break;

      default:
        // Default: navigate to dashboard
        setSelectedKey('dashboard');
        break;
    }
  };

  // Handle notification popover open/close
  const handleNotificationOpenChange = (open) => {
    setNotificationPopoverOpen(open);
    if (open) {
      loadNotifications();
    }
  };

  // Render notification content (matching LeaderPortal.js layout)
  const renderNotificationContent = () => (
    <div style={{ width: 320, maxHeight: '400px', overflowY: 'auto' }}>
      <Spin spinning={notificationLoading}>
        {notifications.length > 0 ? (
          <List
            rowKey={(item) => item.id || item.title}
            dataSource={notifications}
            renderItem={(item) => {
              // Get type info from notificationTypeStyles, fallback to subType or type
              const typeKey = item.type || item.subType || 'SYSTEM';
              const typeInfo = notificationTypeStyles[typeKey] || notificationTypeStyles[item.subType] || { color: 'blue', label: item.subType || item.type || 'Thông báo' };
              const notificationDate = item.createdAt ? formatDateTimeDisplay(item.createdAt) : 'N/A';
              const isUnread = !item.isRead;
              return (
                <List.Item
                  style={{
                    alignItems: 'flex-start',
                    backgroundColor: isUnread ? '#f0f7ff' : 'transparent',
                    cursor: 'pointer',
                    padding: '12px'
                  }}
                  onClick={() => handleNotificationClick(item)}
                >
                  <List.Item.Meta
                    title={
                      <Space size={8} align="start">
                        <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                        <Text strong={isUnread}>{item.title || item.subType}</Text>
                        {isUnread && <Badge dot color="blue" />}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Text type="secondary">{item.message}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {notificationDate}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty description="Không có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Spin>
    </div>
  );

  // Calculate unread notifications count
  const unreadNotificationsCount = notifications.filter((item) => !item.isRead).length;

  // Notification type styles (matching LeaderPortal.js layout)
  const notificationTypeStyles = {
    ALERT: { color: 'volcano', label: 'Cảnh báo' },
    DEPOSIT: { color: 'green', label: 'Giao dịch ví' },
    SYSTEM: { color: 'blue', label: 'Hệ thống' },
    USER: { color: 'purple', label: 'Người dùng' },
    // Additional subTypes for MemberPortal
    UNPAID_PENALTY: { color: 'error', label: 'Phí phạt' },
    OVERDUE_RETURN: { color: 'error', label: 'Quá hạn' },
    DEPOSIT_SUCCESS: { color: 'success', label: 'Nạp tiền' },
    TOP_UP_SUCCESS: { color: 'success', label: 'Nạp tiền' },
    RENTAL_APPROVED: { color: 'success', label: 'Duyệt thuê' },
    RENTAL_REJECTED: { color: 'error', label: 'Từ chối' },
    GROUP_INVITATION: { color: 'blue', label: 'Nhóm' },
    GROUP_UPDATE: { color: 'blue', label: 'Nhóm' }
  };

  // Load lecturers and classes for create group form
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (createGroupModalVisible) {
      loadLecturersAndClasses();
    }
  }, [createGroupModalVisible]);

  const loadLecturersAndClasses = async () => {
    try {
      // Load all lecturers
      const lecturersData = await userAPI.getLecturers();
      setAllLecturers(lecturersData || []);
      setLecturers(lecturersData || []); // Initially show all lecturers

      // Load all class assignments to filter lecturers by class
      try {
        const assignmentsResponse = await classAssignmentAPI.getAll();
        const assignments = Array.isArray(assignmentsResponse)
          ? assignmentsResponse
          : (assignmentsResponse?.data || []);
        setClassAssignments(assignments || []);
      } catch (assignmentError) {
        console.error('Error loading class assignments:', assignmentError);
        setClassAssignments([]);
      }

      // Load classes that current member is studying (via ClassAssignment)
      let classOptions = [];

      try {
        // Get all class assignments and detect those that belong to current user
        const assignmentsResponse = await classAssignmentAPI.getAll();
        const assignments = Array.isArray(assignmentsResponse)
          ? assignmentsResponse
          : (assignmentsResponse?.data || []);

        const myAssignments = (assignments || []).filter((assignment) => {
          // Try possible field names that reference current account
          const byStudentId =
            (assignment.studentId && assignment.studentId === user?.id) ||
            (assignment.accountId && assignment.accountId === user?.id);

          return !!byStudentId;
        });

        const classIds = Array.from(
          new Set(
            myAssignments
              .map((assignment) => assignment.classId || assignment.classesId || assignment.class_id)
              .filter(Boolean)
          )
        );

        const allClassesResponse = await classesAPI.getAllClasses();
        const allClasses = Array.isArray(allClassesResponse)
          ? allClassesResponse
          : (allClassesResponse?.data || []);

        const filteredClasses = classIds.length
          ? allClasses.filter((cls) => classIds.includes(cls.id) && cls.status)
          : [];

        classOptions = filteredClasses.map((cls) => ({
          value: cls.id,
          label: `${cls.classCode || cls.className || 'Unknown'} - ${cls.semester || 'N/A'}`,
          id: cls.id,
          classCode: cls.classCode,
          semester: cls.semester,
          teacherId: cls.teacherId,
          teacherEmail: cls.teacherEmail,
          teacherName: cls.teacherName
        }));

        // Fallback: if no classes detected from assignments, use all classes
        if (!classOptions.length) {
          const fallbackClassesData = allClasses.length ? allClasses : (await classesAPI.getAllClasses());
          const activeFallback = (Array.isArray(fallbackClassesData) ? fallbackClassesData : (fallbackClassesData?.data || []))
            .filter((cls) => cls.status);
          classOptions = (activeFallback || []).map((cls) => ({
            value: cls.id,
            label: `${cls.classCode || cls.className || 'Unknown'} - ${cls.semester || 'N/A'}`,
            id: cls.id,
            classCode: cls.classCode,
            semester: cls.semester,
            teacherId: cls.teacherId,
            teacherEmail: cls.teacherEmail,
            teacherName: cls.teacherName
          }));
        }
      } catch (classError) {
        console.error('Error loading classes from assignments:', classError);
        // Hard fallback: keep old behavior – load all classes
        const classesData = await classesAPI.getAllClasses();
        const classesArray = Array.isArray(classesData) ? classesData : (classesData?.data || []);
        classOptions = (classesArray || []).filter((cls) => cls.status).map((cls) => ({
          value: cls.id,
          label: `${cls.classCode || cls.className || 'Unknown'} - ${cls.semester || 'N/A'}`,
          id: cls.id,
          classCode: cls.classCode,
          semester: cls.semester,
          teacherId: cls.teacherId,
          teacherEmail: cls.teacherEmail,
          teacherName: cls.teacherName
        }));
      }

      setClasses(classOptions);
    } catch (error) {
      console.error('Error loading lecturers and classes:', error);
      message.error('Failed to load lecturers and classes');
    }
  };

  // Filter lecturers based on selected classId
  const filterLecturersByClass = (classId) => {
    if (!classId) {
      // If no class selected, show all lecturers
      setLecturers(allLecturers);
      return;
    }

    console.log('Filtering lecturers for classId:', classId);
    console.log('All classAssignments:', classAssignments);
    console.log('All lecturers:', allLecturers);

    // Find all class assignments for this classId
    const assignmentsForClass = classAssignments.filter((assignment) => {
      const assignmentClassId = assignment.classId || assignment.classesId || assignment.class_id;
      // Convert to string for comparison in case of UUID mismatch
      const classIdStr = String(classId);
      const assignmentClassIdStr = String(assignmentClassId);
      return assignmentClassIdStr === classIdStr;
    });

    console.log('Assignments for class:', assignmentsForClass);

    // Get lecturer account IDs and emails from assignments
    const lecturerAccountIds = new Set();
    const lecturerEmails = new Set();

    assignmentsForClass.forEach((assignment) => {
      // Check if assignment is for a lecturer based on roleName
      const roleName = (assignment.roleName || assignment.role || '').toUpperCase();
      const isLecturerAssignment = roleName === 'LECTURER' || roleName === 'TEACHER';

      console.log('Assignment:', assignment, 'roleName:', roleName, 'isLecturer:', isLecturerAssignment);

      if (isLecturerAssignment) {
        if (assignment.accountId) {
          lecturerAccountIds.add(String(assignment.accountId));
        }
        if (assignment.accountEmail) {
          lecturerEmails.add(assignment.accountEmail.toLowerCase());
        }
      }
    });

    // Also check from classes data - get teacherId/teacherEmail from selected class
    const selectedClass = classes.find(cls => String(cls.id || cls.value) === String(classId));
    if (selectedClass) {
      if (selectedClass.teacherId) {
        lecturerAccountIds.add(String(selectedClass.teacherId));
      }
      if (selectedClass.teacherEmail) {
        lecturerEmails.add(selectedClass.teacherEmail.toLowerCase());
      }
    }

    console.log('Lecturer account IDs:', Array.from(lecturerAccountIds));
    console.log('Lecturer emails:', Array.from(lecturerEmails));

    // Filter lecturers that match the account IDs or emails
    const filteredLecturers = allLecturers.filter((lecturer) => {
      const lecturerIdStr = lecturer.id ? String(lecturer.id) : null;
      const lecturerEmailLower = lecturer.email ? lecturer.email.toLowerCase() : null;

      const matches =
        (lecturerIdStr && lecturerAccountIds.has(lecturerIdStr)) ||
        (lecturerEmailLower && lecturerEmails.has(lecturerEmailLower));

      return matches;
    });

    console.log('Filtered lecturers:', filteredLecturers);

    // If no lecturers found, show all lecturers as fallback
    if (filteredLecturers.length === 0) {
      console.log('No lecturers found for class, showing all lecturers');
      setLecturers(allLecturers);
    } else {
      setLecturers(filteredLecturers);
    }

    // Clear lecturer selection when class changes
    form.setFieldsValue({ lecturer: undefined });
  };

  // Group management functions
  const handleCreateGroup = async (values) => {
    try {
      if (!user || !user.id) {
        message.error('User information not available');
        return;
      }

      // Find lecturer by email
      const selectedLecturer = lecturers.find(l => l.email === values.lecturer);
      if (!selectedLecturer || !selectedLecturer.id) {
        message.error('Invalid lecturer selection');
        return;
      }

      // Create group using API
      const groupData = {
        groupName: values.name,
        classId: values.classId || null, // Class ID if available
        accountId: selectedLecturer.id, // Lecturer's account ID
        status: true
      };

      const response = await studentGroupAPI.create(groupData);

      if (response && response.id) {
        // After creating group, add the user as the leader
        try {
          const borrowingGroupData = {
            studentGroupId: response.id,
            accountId: user.id,
            roles: 'LEADER' // Creator becomes leader
          };

          await borrowingGroupAPI.addMemberToGroup(borrowingGroupData);

          message.success('Group created successfully! You are now the leader.');
          setCreateGroupModalVisible(false);
          form.resetFields();

          // Reload data to reflect changes
          await loadData();
        } catch (addMemberError) {
          console.error('Error adding user as leader:', addMemberError);
          message.warning('Group created but failed to add you as leader. Please contact admin.');
          setCreateGroupModalVisible(false);
          form.resetFields();
          await loadData();
        }
      } else {
        message.error('Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      message.error('Failed to create group: ' + (error.message || 'Unknown error'));
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      if (!user || !user.id) {
        message.error('User information not available');
        return;
      }

      // Check if group exists and has space
      const targetGroup = availableGroups.find(g => g.id === groupId);
      if (!targetGroup) {
        message.error('Group not found');
        return;
      }

      const currentMemberCount = targetGroup.members?.length || 0;
      const maxMembers = targetGroup.maxMembers || 4;

      if (currentMemberCount >= maxMembers) {
        message.error('Group is full');
        return;
      }

      // Join the group using API
      const borrowingGroupData = {
        studentGroupId: groupId,
        accountId: user.id,
        roles: 'MEMBER' // New members join as MEMBER
      };

      await borrowingGroupAPI.addMemberToGroup(borrowingGroupData);

      message.success('Successfully joined the group!');
      setJoinGroupModalVisible(false);

      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error('Error joining group:', error);
      const errorMessage = error.message || 'Failed to join group';

      if (errorMessage.includes('already a member')) {
        message.error('You are already a member of this group');
      } else {
        message.error(`Failed to join group: ${errorMessage}`);
      }
    }
  };

  // Leave inactive group
  const handleLeaveInactiveGroup = async () => {
    if (!group || !group.id || !user?.id) return;
    setLoading(true);
    try {
      await borrowingGroupAPI.removeMember(group.id, user.id);
      message.success('Đã rời nhóm cũ. Vui lòng tham gia nhóm mới.');
      setGroup(null);
      await loadData();
    } catch (error) {
      console.error('Error leaving inactive group:', error);
      message.error(error.message || 'Không thể rời nhóm. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    if (!user || !user.id) {
      console.warn('User or user.id is missing');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Load wallet
      try {
        const walletResponse = await walletAPI.getMyWallet();
        const walletData = walletResponse?.data || walletResponse || {};

        // Fetch transaction history separately
        let transactions = [];
        try {
          const transactionHistoryResponse = await walletTransactionAPI.getHistory();
          const transactionData = Array.isArray(transactionHistoryResponse)
            ? transactionHistoryResponse
            : (transactionHistoryResponse?.data || []);

          // Map transactions to expected format
          transactions = transactionData.map(txn => ({
            type: txn.type || txn.transactionType || 'UNKNOWN',
            amount: txn.amount || 0,
            date: txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('vi-VN') : 'N/A',
            description: txn.description || '',
            status: txn.status || txn.transactionStatus || 'COMPLETED',
            id: txn.id
          }));
        } catch (txnError) {
          console.error('Error loading transaction history:', txnError);
          transactions = [];
        }

        setWallet({
          balance: walletData.balance || 0,
          transactions: transactions
        });
      } catch (error) {
        console.error('Error loading wallet:', error);
        setWallet(defaultWallet);
      }

      // Load group info from borrowing group API
      try {
        let groupId = user?.borrowingGroupInfo?.groupId;

        // If no groupId from user info, try to get it from borrowing groups
        if (!groupId && user.id) {
          const borrowingGroups = await borrowingGroupAPI.getByAccountId(user.id);
          if (borrowingGroups && borrowingGroups.length > 0) {
            groupId = borrowingGroups[0].studentGroupId;
          }
        }

        if (groupId) {
          // Get borrowing groups for this student group (all members)
          const borrowingGroups = await borrowingGroupAPI.getByStudentGroupId(groupId);

          // Get student group details
          const studentGroup = await studentGroupAPI.getById(groupId);

          if (studentGroup) {
            // Map borrowing groups to members
            const members = (borrowingGroups || []).map(bg => ({
              id: bg.accountId,
              name: bg.accountName || bg.accountEmail,
              email: bg.accountEmail,
              role: bg.roles,
              isActive: bg.isActive !== undefined ? bg.isActive : true
            }));

            // Find leader
            const leaderMember = members.find(member => (member.role || '').toUpperCase() === 'LEADER');

            const groupData = {
              id: studentGroup.id,
              name: studentGroup.groupName,
              leader: leaderMember ? (leaderMember.name || leaderMember.email) : 'N/A',
              leaderId: leaderMember?.id || null,
              leaderEmail: leaderMember?.email || null,
              members: members.filter(m => (m.role || '').toUpperCase() === 'MEMBER'),
              lecturer: studentGroup.lecturerEmail || null,
              lecturerName: studentGroup.lecturerName || null,
              classCode: studentGroup.className || null, // className from backend contains classCode
              status: studentGroup.status ? 'active' : 'inactive'
            };

            setGroup(groupData);
          } else {
            setGroup(null);
          }
        } else {
          setGroup(null);
        }
      } catch (error) {
        console.error('Error loading group info:', error);
        setGroup(null);
      }

      // Load available groups for joining (groups where user is not a member and same class)
      try {
        const allGroups = await studentGroupAPI.getAll();
        const allGroupsData = Array.isArray(allGroups) ? allGroups : (allGroups?.data || []);

        // Get classIds where this student is assigned
        let studentClassIds = [];
        try {
          const assignments = await classAssignmentAPI.getAll();
          const assignmentsArray = Array.isArray(assignments) ? assignments : (assignments?.data || []);
          studentClassIds = assignmentsArray
            .filter(a => a.accountId === user.id)
            .map(a => a.classId)
            .filter(Boolean);
        } catch (errAssign) {
          console.error('Error loading class assignments for filtering groups:', errAssign);
        }

        // Filter out groups where user is already a member
        const userBorrowingGroups = await borrowingGroupAPI.getByAccountId(user.id);
        const userGroupIds = new Set((userBorrowingGroups || []).map(bg => bg.studentGroupId));

        // Get member counts for each group
        const groupsWithCounts = await Promise.all(
          allGroupsData
            .filter(g => !userGroupIds.has(g.id) && g.status) // Only active groups user is not in
            .filter(g => {
              // Only groups whose classId is in student's class assignments
              if (!g.classId || studentClassIds.length === 0) return false;
              return studentClassIds.includes(g.classId);
            })
            .map(async (g) => {
              try {
                const members = await borrowingGroupAPI.getByStudentGroupId(g.id);
                return {
                  id: g.id,
                  name: g.groupName,
                  lecturer: g.lecturerEmail,
                  lecturerName: g.lecturerName,
                  classCode: g.className || g.classCode || null,
                  members: members || [],
                  maxMembers: 4, // Default max members, can be adjusted
                  status: g.status ? 'active' : 'inactive'
                };
              } catch (err) {
                console.error(`Error loading members for group ${g.id}:`, err);
                return null;
              }
            })
        );

        setAvailableGroups(groupsWithCounts.filter(g => g !== null));
      } catch (error) {
        console.error('Error loading available groups:', error);
        setAvailableGroups([]);
      }

      // Load penalties
      try {
        const penaltiesResponse = await penaltiesAPI.getPenByAccount();
        console.log('Penalties response:', penaltiesResponse);

        let penaltiesData = [];
        if (Array.isArray(penaltiesResponse)) {
          penaltiesData = penaltiesResponse;
        } else if (penaltiesResponse && penaltiesResponse.data && Array.isArray(penaltiesResponse.data)) {
          penaltiesData = penaltiesResponse.data;
        }

        setPenalties(penaltiesData);

        // Load penalty details for each penalty
        if (penaltiesData.length > 0) {
          const detailsPromises = penaltiesData.map(async (penalty) => {
            try {
              const detailsResponse = await penaltyDetailAPI.findByPenaltyId(penalty.id);
              let detailsData = [];
              if (Array.isArray(detailsResponse)) {
                detailsData = detailsResponse;
              } else if (detailsResponse && detailsResponse.data && Array.isArray(detailsResponse.data)) {
                detailsData = detailsResponse.data;
              }
              return { penaltyId: penalty.id, details: detailsData };
            } catch (error) {
              console.error(`Error loading penalty details for penalty ${penalty.id}:`, error);
              return { penaltyId: penalty.id, details: [] };
            }
          });

          const allDetails = await Promise.all(detailsPromises);
          const detailsMap = {};
          allDetails.forEach(({ penaltyId, details }) => {
            detailsMap[penaltyId] = details;
          });
          setPenaltyDetails(detailsMap);
        }
      } catch (error) {
        console.error('Error loading penalties:', error);
        setPenalties([]);
        setPenaltyDetails([]);
      }

      console.log('Member data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'group', icon: <TeamOutlined />, label: 'Group Info' },
    { key: 'wallet', icon: <WalletOutlined />, label: 'Wallet' },
    { key: 'borrow-tracking', icon: <ShoppingOutlined />, label: 'Borrow Tracking' },
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
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
            {collapsed ? 'MBR' : 'Member Portal'}
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
                <Popover
                  content={renderNotificationContent()}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>Notifications</Text>
                      {unreadNotificationsCount > 0 && (
                        <Tag color="blue">{unreadNotificationsCount} unread</Tag>
                      )}
                    </div>
                  }
                  trigger="click"
                  open={notificationPopoverOpen}
                  onOpenChange={handleNotificationOpenChange}
                  placement="bottomRight"
                >
                  <Badge count={unreadNotificationsCount} size="small" style={{ cursor: 'pointer' }}>
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
                </Popover>
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
                {selectedKey === 'dashboard' && <DashboardContent group={group} wallet={wallet} />}
                {selectedKey === 'group' && <GroupInfo
                  group={group}
                  onCreateGroup={() => setCreateGroupModalVisible(true)}
                  onJoinGroup={() => setJoinGroupModalVisible(true)}
                  onLeaveInactiveGroup={handleLeaveInactiveGroup}
                  availableGroups={availableGroups}
                />}
                {selectedKey === 'wallet' && <WalletManagement wallet={wallet} setWallet={setWallet} loadData={loadData} />}
                {selectedKey === 'borrow-tracking' && <BorrowTracking borrowingRequests={borrowingRequests} setBorrowingRequests={setBorrowingRequests} user={user} group={group} penalties={penalties} penaltyDetails={penaltyDetails} />}
                {selectedKey === 'profile' && <ProfileManagement profile={profile} setProfile={setProfile} loading={profileLoading} setLoading={setProfileLoading} user={user} />}
              </motion.div>
            </AnimatePresence>
          </Spin>
        </Content>
      </Layout>

      {/* Create Group Modal */}
      <Modal
        title="Create New Group"
        open={createGroupModalVisible}
        onCancel={() => {
          setCreateGroupModalVisible(false);
          form.resetFields();
          setLecturers(allLecturers); // Reset to all lecturers when closing
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateGroup}
          onValuesChange={(changedValues, allValues) => {
            // When classId changes, filter lecturers
            if (changedValues.classId !== undefined) {
              filterLecturersByClass(changedValues.classId);
            }
          }}
        >
          <Form.Item
            name="name"
            label="Group Name"
            rules={[{ required: true, message: 'Please enter group name' }]}
          >
            <Input placeholder="Enter group name" />
          </Form.Item>

          <Form.Item
            name="classId"
            label="Class Code"
            rules={[{ required: false, message: 'Please select a class' }]}
          >
            <Select
              placeholder="Select class (optional)"
              allowClear
              loading={classes.length === 0}
              onChange={(value) => {
                filterLecturersByClass(value);
              }}
            >
              {classes.map(cls => (
                <Select.Option key={cls.id || cls.value} value={cls.id || cls.value}>
                  {cls.label || `${cls.classCode} - ${cls.semester}`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="lecturer"
            label="Lecturer"
            rules={[{ required: true, message: 'Please select a lecturer' }]}
          >
            <Select
              placeholder={lecturers.length === 0 ? "Select class code first" : "Select lecturer"}
              loading={lecturers.length === 0 && allLecturers.length > 0}
              disabled={lecturers.length === 0}
            >
              {lecturers.map(lecturer => (
                <Select.Option key={lecturer.id || lecturer.email} value={lecturer.email}>
                  {lecturer.fullName || lecturer.email} {lecturer.email && `(${lecturer.email})`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCreateGroupModalVisible(false);
                form.resetFields();
                setLecturers(allLecturers); // Reset to all lecturers when canceling
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create Group
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Join Group Modal */}
      <Modal
        title="Join Existing Group"
        open={joinGroupModalVisible}
        onCancel={() => setJoinGroupModalVisible(false)}
        footer={null}
        width={800}
      >
        <div>
          <Text>Select a group to join:</Text>
          <Divider />
          <Row gutter={[16, 16]}>
            {availableGroups.map(group => (
              <Col xs={24} sm={12} key={group.id}>
                <Card
                  hoverable
                  style={{ borderRadius: '12px' }}
                  actions={[
                    <Button
                      type="primary"
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={group.members.length >= group.maxMembers}
                    >
                      {group.members.length >= group.maxMembers ? 'Full' : 'Join Group'}
                    </Button>
                  ]}
                >
                  <Card.Meta
                    title={group.name}
                    description={group.description}
                  />
                  <div style={{ marginTop: '12px' }}>
                    <Text type="secondary">
                      Members: {group.members.length}/{group.maxMembers}
                    </Text>
                    <br />
                    <Text type="secondary">
                      Lecturer: {group.lecturer}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {availableGroups.length === 0 && (
            <Empty description="No available groups to join" />
          )}
        </div>
      </Modal>

    </Layout>
  );
}

// Dashboard Component
const DashboardContent = ({ group, wallet }) => (
  <div>
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={12} lg={6}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="My Group"
              value={group ? (group.name.length > 15 ? group.name.substring(0, 15) + '...' : group.name) : 'No Group'}
              prefix={<TeamOutlined style={{ color: '#667eea' }} />}
              valueStyle={{ color: '#667eea', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Group Members"
              value={group ? (group.members?.length || 0) + 1 : 0}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Wallet Balance"
              value={wallet?.balance || 0}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              suffix="VND"
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Transactions"
              value={wallet?.transactions?.length || 0}
              prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
    </Row>

    <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
      <Col xs={24} lg={12}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card title="Group Information" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            {group ? (
              <Descriptions column={1}>
                <Descriptions.Item label="Group Name">
                  <Text strong>{group.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Leader">
                  <Tag color="gold">{group.leader}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Total Members">
                  <Badge count={(group.members?.length || 0) + 1} showZero color="#52c41a" />
                </Descriptions.Item>
                <Descriptions.Item label="Members">
                  {group.members && group.members.length > 0 ? (
                    <div>
                      {group.members.map((member, index) => {
                        const memberName = typeof member === 'string' ? member : (member.name || member.email);
                        return (
                          <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>
                            {memberName}
                          </Tag>
                        );
                      })}
                    </div>
                  ) : (
                    <Text type="secondary">No other members</Text>
                  )}
                </Descriptions.Item>
                {group.lecturer && (
                  <Descriptions.Item label="Lecturer">
                    <Tag color="purple">{group.lecturer}</Tag>
                  </Descriptions.Item>
                )}
                {group.classCode && (
                  <Descriptions.Item label="Class Code">
                    <Text code>{group.classCode}</Text>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Status">
                  <Tag color={group.status === 'active' ? 'success' : 'error'}>
                    {group.status || 'inactive'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Empty description="No group found for this member" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </motion.div>
      </Col>

      <Col xs={24} lg={12}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card title="Recent Transactions" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            {wallet?.transactions && wallet.transactions.length > 0 ? (
              <List
                size="small"
                dataSource={wallet.transactions.slice(0, 5)}
                renderItem={(item) => {
                  // Determine color based on transaction type
                  const typeUpper = (item.type || '').toUpperCase();
                  const isPositiveTransaction =
                    typeUpper === 'TOP_UP' ||
                    typeUpper === 'TOPUP' ||
                    typeUpper === 'REFUND';
                  const isNegativeTransaction =
                    typeUpper === 'RENTAL_FEE' ||
                    typeUpper === 'PENALTY_PAYMENT' ||
                    typeUpper === 'PENALTY' ||
                    typeUpper === 'FINE';

                  // Use type-based color if available, otherwise fallback to amount-based
                  let amountColor = '#595959'; // default gray
                  if (isPositiveTransaction) {
                    amountColor = '#52c41a'; // green for top-up and refund
                  } else if (isNegativeTransaction) {
                    amountColor = '#ff4d4f'; // red for rental fee and penalty
                  } else {
                    // Fallback: use amount sign
                    amountColor = item.amount > 0 ? '#52c41a' : '#ff4d4f';
                  }

                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<DollarOutlined style={{ color: amountColor }} />}
                        title={
                          <Tag color={
                            item.type === 'TOP_UP' ? 'success' :
                              item.type === 'RENTAL_FEE' ? 'processing' :
                                item.type === 'PENALTY_PAYMENT' ? 'error' :
                                  item.type === 'REFUND' ? 'purple' : 'default'
                          }>
                            {item.type?.replace(/_/g, ' ') || 'Transaction'}
                          </Tag>
                        }
                        description={item.date || item.description}
                      />
                      <div style={{
                        color: amountColor,
                        fontWeight: 'bold'
                      }}>
                        {isPositiveTransaction ? '+' : ''}{item.amount?.toLocaleString() || 0} VND
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="No transactions yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </motion.div>
      </Col>
    </Row>
  </div>
);

// Group Info Component
const GroupInfo = ({ group, onCreateGroup, onJoinGroup, onLeaveInactiveGroup, availableGroups }) => (
  <div>
    <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
      <Card title="Group Information" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        {group ? (
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Card title="Basic Info" size="small">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Group Name">
                    <Text strong>{group.name}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Leader">
                    <Tag color="gold">{group.leader}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Members">
                    <Badge count={(group.members?.length || 0) + 1} showZero color="#52c41a" />
                  </Descriptions.Item>
                  {group.lecturer && (
                    <Descriptions.Item label="Lecturer">
                      <Tag color="purple">{group.lecturer}</Tag>
                    </Descriptions.Item>
                  )}
                  {group.classCode && (
                    <Descriptions.Item label="Class Code">
                      <Text code>{group.classCode}</Text>
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Status">
                    <Tag color={group.status === 'active' ? 'success' : 'error'}>
                      {group.status || 'inactive'}
                    </Tag>
                  </Descriptions.Item>
                  {group.status === 'inactive' && (
                    <Descriptions.Item label="Action">
                      <Button
                        danger
                        icon={<RollbackOutlined />}
                        onClick={onLeaveInactiveGroup}
                      >
                        Rời nhóm cũ
                      </Button>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title="Members" size="small">
                <List
                  size="small"
                  dataSource={[
                    ...(group.members || []),
                    ...(group.leader ? [{ name: group.leader, email: group.leaderEmail, role: 'LEADER' }] : [])
                  ]}
                  renderItem={(member) => {
                    const memberName = typeof member === 'string' ? member : (member.name || member.email);
                    const memberEmail = typeof member === 'string' ? member : member.email;
                    const memberRole = typeof member === 'string' ? 'MEMBER' : (member.role || 'MEMBER');
                    const isLeader = memberRole === 'LEADER';

                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={<UserOutlined />}
                              style={{ backgroundColor: isLeader ? '#faad14' : '#52c41a' }}
                            >
                              {isLeader ? 'L' : 'M'}
                            </Avatar>
                          }
                          title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{memberName}</span>
                              <Tag color={isLeader ? 'gold' : 'blue'} size="small">
                                {memberRole}
                              </Tag>
                            </div>
                          }
                          description={memberEmail || 'Group Member'}
                        />
                      </List.Item>
                    );
                  }}
                />
              </Card>
            </Col>
          </Row>
        ) : (
          <div>
            <Alert
              message="No Group Found"
              description="You are not assigned to any group yet. You can create a new group or join an existing one."
              type="warning"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    hoverable
                    style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      textAlign: 'center'
                    }}
                    onClick={onCreateGroup}
                  >
                    <PlusOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                    <Title level={4} style={{ color: 'white', margin: 0 }}>Create New Group</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Start your own project group and become the leader
                    </Text>
                  </Card>
                </motion.div>
              </Col>

              <Col xs={24} sm={12}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    hoverable
                    style={{
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      color: 'white',
                      textAlign: 'center'
                    }}
                    onClick={onJoinGroup}
                  >
                    <UserAddOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                    <Title level={4} style={{ color: 'white', margin: 0 }}>Join Existing Group</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                      Join an available group ({availableGroups.length} groups available)
                    </Text>
                  </Card>
                </motion.div>
              </Col>
            </Row>

            {availableGroups.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <Title level={4}>Available Groups</Title>
                <Row gutter={[16, 16]}>
                  {availableGroups.map(group => (
                    <Col xs={24} sm={12} md={8} key={group.id}>
                      <Card
                        hoverable
                        style={{ borderRadius: '12px' }}
                        actions={[
                          <Button
                            type="primary"
                            onClick={() => onJoinGroup(group.id)}
                            disabled={(group.members?.length || 0) >= (group.maxMembers || 4)}
                          >
                            {(group.members?.length || 0) >= (group.maxMembers || 4) ? 'Full' : 'Join Group'}
                          </Button>
                        ]}
                      >
                        <Card.Meta
                          title={group.name}
                          description={group.lecturer ? `Lecturer: ${group.lecturer}` : 'No lecturer assigned'}
                        />
                        <div style={{ marginTop: '12px' }}>
                          <Text type="secondary">
                            Members: {group.members?.length || 0}/{group.maxMembers || 4}
                          </Text>
                          {group.classCode && (
                            <>
                              <br />
                              <Text type="secondary">
                                Class Code: {group.classCode}
                              </Text>
                            </>
                          )}
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  </div>
);





// Wallet Management Component
const WalletManagement = ({ wallet, setWallet, loadData }) => {
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [penaltyModalVisible, setPenaltyModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [topUpForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [penalties, setPenalties] = useState([]);
  const [penaltyLoading, setPenaltyLoading] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState(null);
  const [penaltyDetails, setPenaltyDetails] = useState([]);
  const [payingPenalty, setPayingPenalty] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Predefined amount options for topup
  const amountOptions = [
    { label: '50,000 VND', value: 50000 },
    { label: '100,000 VND', value: 100000 },
    { label: '200,000 VND', value: 200000 },
    { label: '500,000 VND', value: 500000 },
    { label: '1,000,000 VND', value: 1000000 },
    { label: '2,000,000 VND', value: 2000000 }
  ];

  const handlePayPalReturn = async (paymentId, payerId) => {
    try {
      // Get stored payment info
      const storedPayment = sessionStorage.getItem('pendingPayPalPayment');
      if (!storedPayment) {
        message.error('Payment information not found');
        return;
      }

      const paymentInfo = JSON.parse(storedPayment);

      // Execute PayPal payment
      const response = await paymentAPI.executePayPalPayment(
        paymentId,
        payerId,
        paymentInfo.transactionId
      );

      if (response && response.data) {
        message.success('Payment successful! Wallet balance has been updated.');

        // Clear stored payment info
        sessionStorage.removeItem('pendingPayPalPayment');

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Wait a moment for backend to process the payment
        await new Promise(resolve => setTimeout(resolve, 500));

        // Reload all data (this will update wallet, group info, and all other data)
        await loadData();
        await loadTransactionHistory();

        // Close modal if open
        setTopUpModalVisible(false);
        topUpForm.resetFields();
      } else {
        message.error('Payment execution failed. Please try again.');
      }
    } catch (error) {
      console.error('PayPal payment execution error:', error);

      // Check if error is about payment already done
      if (error.message && (error.message.includes('PAYMENT_ALREADY_DONE') || error.message.includes('already completed'))) {
        message.success('Payment was already completed successfully!');

        // Clear stored payment info
        sessionStorage.removeItem('pendingPayPalPayment');

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Wait a moment for backend to process
        await new Promise(resolve => setTimeout(resolve, 500));

        // Reload all data
        await loadData();
        await loadTransactionHistory();

        // Close modal if open
        setTopUpModalVisible(false);
        topUpForm.resetFields();
      } else {
        message.error(error.message || 'Payment execution failed. Please try again.');
        sessionStorage.removeItem('pendingPayPalPayment');
      }
    }
  };

  const handlePayPalCancel = () => {
    message.warning('Payment was cancelled');
    sessionStorage.removeItem('pendingPayPalPayment');
    window.history.replaceState({}, document.title, window.location.pathname);
    setTopUpModalVisible(false);
    topUpForm.resetFields();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadTransactionHistory();

    // Handle PayPal return callback
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const payerId = urlParams.get('PayerID');

    // Check if this is a PayPal return
    if (paymentId && payerId) {
      handlePayPalReturn(paymentId, payerId);
    } else if (urlParams.get('cancel') === 'true' || window.location.pathname.includes('paypal-cancel')) {
      handlePayPalCancel();
    }
  }, []);

  const loadTransactionHistory = async () => {
    try {
      setTransactionsLoading(true);
      const response = await walletTransactionAPI.getHistory();
      console.log('Transaction history response:', response);

      let transactionsData = [];
      if (Array.isArray(response)) {
        transactionsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        transactionsData = response.data;
      }

      // Map transactions to expected format
      const mappedTransactions = transactionsData.map(txn => ({
        type: txn.type || txn.transactionType || 'UNKNOWN',
        amount: txn.amount || 0,
        previousBalance: txn.previousBalance || null,
        date: txn.createdAt ? formatDateTimeDisplay(txn.createdAt) : 'N/A',
        description: txn.description || '',
        status: txn.status || txn.transactionStatus || 'COMPLETED',
        id: txn.id,
        createdAt: txn.createdAt
      }));

      setTransactions(mappedTransactions);
    } catch (error) {
      console.error('Error loading transaction history:', error);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadPenalties = async () => {
    try {
      setPenaltyLoading(true);
      const response = await penaltiesAPI.getPenByAccount();
      console.log('Penalties by account response:', response);

      let penaltiesData = [];
      if (Array.isArray(response)) {
        penaltiesData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        penaltiesData = response.data;
      }

      // Map to expected format, filter only unresolved penalties
      const mappedPenalties = penaltiesData
        .filter(p => !p.resolved)
        .map(penalty => ({
          id: penalty.id,
          penaltyId: penalty.id,
          kitName: penalty.kitName || 'Unknown Kit',
          rentalId: penalty.borrowRequestId || 'N/A',
          amount: penalty.totalAmount || 0,
          penaltyType: penalty.type || 'other',
          dueDate: penalty.takeEffectDate || new Date().toISOString(),
          reason: penalty.note || 'Penalty fee',
          status: penalty.resolved ? 'resolved' : 'pending',
          originalData: penalty
        }));

      setPenalties(mappedPenalties);
    } catch (error) {
      console.error('Error loading penalties:', error);
      message.error('Failed to load penalties');
      setPenalties([]);
    } finally {
      setPenaltyLoading(false);
    }
  };

  const loadPenaltyDetails = async (penaltyId) => {
    if (!penaltyId) {
      setPenaltyDetails([]);
      return;
    }

    try {
      const response = await penaltyDetailAPI.findByPenaltyId(penaltyId);
      let detailsData = [];
      if (Array.isArray(response)) {
        detailsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        detailsData = response.data;
      }
      setPenaltyDetails(detailsData);
    } catch (error) {
      console.error('Error loading penalty details:', error);
      setPenaltyDetails([]);
    }
  };

  const handleTopUp = async (values) => {
    const amount = values.amount;
    if (!amount || amount < 10000) {
      message.error('Số tiền nạp tối thiểu là 10,000 VND');
      return;
    }
    if (amount > 10000000) {
      message.error('Số tiền nạp tối đa là 10,000,000 VND');
      return;
    }

    setTopUpLoading(true);
    try {
      const description = `Top-up IoT Wallet - ${amount.toLocaleString()} VND`;

      // Convert VND to USD (approximate rate: 1 USD = 24,000 VND)
      // You may want to use a real-time exchange rate API
      const exchangeRate = 24000;
      const amountUSD = (amount / exchangeRate).toFixed(2);

      // Get current portal path for return/cancel URLs
      const currentPath = window.location.pathname; // e.g., /member, /leader, /lecturer
      const baseUrl = window.location.origin;
      const returnUrl = `${baseUrl}${currentPath}`;
      const cancelUrl = `${baseUrl}${currentPath}`;

      // Create PayPal payment with portal-specific return URLs
      const response = await paymentAPI.createPayPalPayment(
        parseFloat(amountUSD),
        description,
        returnUrl,
        cancelUrl
      );

      if (response && response.data) {
        const { approvalUrl, paymentId, transactionId } = response.data;

        if (approvalUrl) {
          // Store transaction info in sessionStorage for callback handling
          sessionStorage.setItem('pendingPayPalPayment', JSON.stringify({
            paymentId,
            transactionId,
            amount: parseFloat(amountUSD),
            originalAmountVND: amount
          }));

          // Redirect to PayPal approval page
          window.location.href = approvalUrl;
        } else {
          message.error('Không thể tạo PayPal payment. Vui lòng thử lại.');
        }
      } else {
        message.error('Không thể tạo PayPal payment. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('PayPal payment creation error:', error);
      message.error(error.message || 'Không thể tạo PayPal payment. Vui lòng thử lại.');
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleOpenPenaltyModal = () => {
    setPenaltyModalVisible(true);
    loadPenalties();
  };

  const handleSelectPenalty = (penalty) => {
    setSelectedPenalty(penalty);
    loadPenaltyDetails(penalty.id);
  };

  const handlePayPenalty = async () => {
    if (!selectedPenalty) {
      message.error('Vui lòng chọn penalty để thanh toán');
      return;
    }

    // Check wallet balance
    if (wallet.balance < selectedPenalty.amount) {
      message.error('Số dư ví không đủ để thanh toán penalty! Vui lòng nạp thêm tiền.');
      return;
    }

    setPayingPenalty(true);
    try {
      await penaltiesAPI.confirmPenaltyPayment(selectedPenalty.id);
      message.success('Thanh toán penalty thành công!');
      setPenaltyModalVisible(false);
      setSelectedPenalty(null);
      setPenaltyDetails([]);

      // Reload wallet, transactions and penalties
      await loadData();
      await loadTransactionHistory();
      await loadPenalties();
    } catch (error) {
      console.error('Error paying penalty:', error);
      message.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setPayingPenalty(false);
    }
  };

  const handleTransfer = async () => {
    try {
      const values = await transferForm.validateFields();
      const { recipientEmail, amount, description } = values;

      // Validate amount
      if (amount < 10000) {
        message.error('Số tiền chuyển tối thiểu là 10,000 VND');
        return;
      }

      // Check wallet balance
      if (wallet.balance < amount) {
        message.error('Số dư ví không đủ để chuyển tiền! Vui lòng nạp thêm tiền.');
        return;
      }

      setTransferLoading(true);
      await walletTransactionAPI.transfer(recipientEmail, amount, description || 'Transfer money');
      message.success('Chuyển tiền thành công!');
      setTransferModalVisible(false);
      transferForm.resetFields();

      // Reload wallet and transactions
      await loadData();
      await loadTransactionHistory();
    } catch (error) {
      console.error('Error transferring money:', error);
      message.error(error.message || 'Chuyển tiền thất bại. Vui lòng thử lại.');
    } finally {
      setTransferLoading(false);
    }
  };

  const getTransactionTypeConfig = (type) => {
    const typeUpper = (type || '').toUpperCase();
    switch (typeUpper) {
      case 'TOP_UP':
      case 'TOPUP':
        return { label: 'Top Up', color: 'success', icon: <DollarOutlined />, bg: '#e8f8ee', border: '1.5px solid #52c41a', text: '#2a8731' };
      case 'RENTAL_FEE':
        return { label: 'Rental Fee', color: 'geekblue', icon: <ShoppingOutlined />, bg: '#e6f7ff', border: '1.5px solid #177ddc', text: '#177ddc' };
      case 'PENALTY_PAYMENT':
      case 'PENALTY':
      case 'FINE':
        return { label: 'Penalty', color: 'error', icon: <ExclamationCircleOutlined />, bg: '#fff1f0', border: '1.5px solid #ff4d4f', text: '#d4001a' };
      case 'REFUND':
        return { label: 'Refund', color: 'purple', icon: <RollbackOutlined />, bg: '#f9f0ff', border: '1.5px solid #722ed1', text: '#722ed1' };
      default:
        return { label: type || 'Other', color: 'default', icon: <InfoCircleOutlined />, bg: '#fafafa', border: '1.5px solid #bfbfbf', text: '#595959' };
    }
  };

  const handleShowDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsModalVisible(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalVisible(false);
    setSelectedTransaction(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return formatDateTimeDisplay(dateTimeString);
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card
              style={{
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <Statistic
                title="Current Balance"
                value={wallet.balance || 0}
                prefix={<DollarOutlined />}
                suffix="VND"
                valueStyle={{ color: 'white', fontWeight: 'bold' }}
              />
              <Space direction="vertical" style={{ width: '100%', marginTop: '16px' }}>
                <Button
                  type="primary"
                  onClick={() => setTopUpModalVisible(true)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                >
                  Top Up
                </Button>
                <Button
                  onClick={() => setTransferModalVisible(true)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  Transfer Money
                </Button>
                <Button
                  onClick={handleOpenPenaltyModal}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white'
                  }}
                >
                  Pay Penalties
                </Button>
              </Space>
            </Card>
          </motion.div>
        </Col>

        <Col xs={24} md={16}>
          <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
            <Card
              title="Transaction History"
              extra={
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadTransactionHistory}
                  loading={transactionsLoading}
                >
                  Refresh
                </Button>
              }
              style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <Spin spinning={transactionsLoading}>
                <Table
                  dataSource={transactions}
                  scroll={{ x: 'max-content' }}
                  columns={[
                    {
                      title: 'Type',
                      dataIndex: 'type',
                      key: 'type',
                      width: 150,
                      render: (type) => {
                        const config = getTransactionTypeConfig(type);
                        return (
                          <Tag
                            color={config.color}
                            style={{
                              background: config.bg,
                              border: config.border,
                              color: config.text,
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 13,
                              letterSpacing: 1
                            }}
                          >
                            {config.icon} <span>{config.label}</span>
                          </Tag>
                        );
                      }
                    },
                    {
                      title: 'Previous Balance',
                      dataIndex: 'previousBalance',
                      key: 'previousBalance',
                      width: 150,
                      render: (previousBalance) => {
                        if (previousBalance === null || previousBalance === undefined) {
                          return <Text type="secondary">N/A</Text>;
                        }
                        return (
                          <Text type="secondary">
                            {previousBalance.toLocaleString()} VND
                          </Text>
                        );
                      },
                    },
                    {
                      title: 'Amount',
                      dataIndex: 'amount',
                      key: 'amount',
                      width: 150,
                      render: (amount, record) => {
                        // Determine color based on transaction type
                        const typeUpper = (record.type || '').toUpperCase();
                        const isPositiveTransaction =
                          typeUpper === 'TOP_UP' ||
                          typeUpper === 'TOPUP' ||
                          typeUpper === 'REFUND';
                        const isNegativeTransaction =
                          typeUpper === 'RENTAL_FEE' ||
                          typeUpper === 'PENALTY_PAYMENT' ||
                          typeUpper === 'PENALTY' ||
                          typeUpper === 'FINE';

                        // Use type-based color if available, otherwise fallback to amount-based
                        let color = '#595959'; // default gray
                        if (isPositiveTransaction) {
                          color = '#52c41a'; // green for top-up and refund
                        } else if (isNegativeTransaction) {
                          color = '#ff4d4f'; // red for rental fee and penalty
                        } else {
                          // Fallback: use amount sign
                          color = amount > 0 ? '#52c41a' : '#ff4d4f';
                        }

                        return (
                          <Text strong style={{ color }}>
                            {amount ? amount.toLocaleString() : 0} VND
                          </Text>
                        );
                      },
                    },
                    {
                      title: 'Description',
                      dataIndex: 'description',
                      key: 'description',
                      width: 200,
                      ellipsis: true,
                      render: (description) => description || 'N/A',
                    },
                    {
                      title: 'Date',
                      dataIndex: 'createdAt',
                      key: 'date',
                      width: 180,
                      render: (date) => {
                        if (!date) return 'N/A';
                        return formatDateTimeDisplay(date);
                      },
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      width: 120,
                      render: (status) => {
                        const statusColor = status === 'COMPLETED' || status === 'SUCCESS' ? 'success' :
                          status === 'PENDING' ? 'processing' :
                            status === 'FAILED' ? 'error' : 'default';
                        return (
                          <Tag color={statusColor}>
                            {status || 'N/A'}
                          </Tag>
                        );
                      },
                    },
                    {
                      title: 'Details',
                      key: 'details',
                      width: 120,
                      fixed: 'right',
                      render: (_, record) => (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            type="default"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleShowDetails(record)}
                          >
                            Details
                          </Button>
                        </motion.div>
                      )
                    },
                  ]}
                  rowKey={(record, index) => record.id || record.transactionId || index}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} transactions`,
                  }}
                  locale={{ emptyText: 'No transactions found' }}
                />
              </Spin>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Top Up Modal */}
      <Modal
        title="Top Up Wallet via PayPal"
        open={topUpModalVisible}
        onCancel={() => {
          setTopUpModalVisible(false);
          topUpForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Alert
          message="PayPal Payment"
          description="You will be redirected to PayPal to complete the payment. Amount will be converted from VND to USD (1 USD ≈ 24,000 VND)."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={topUpForm}
          layout="vertical"
          onFinish={handleTopUp}
        >
          <Form.Item
            label="Select Amount (VND)"
            name="amount"
            rules={[
              { required: true, message: 'Please select or enter an amount' },
              { type: 'number', min: 10000, message: 'Minimum amount is 10,000 VND' },
              { type: 'number', max: 10000000, message: 'Maximum amount is 10,000,000 VND' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter amount (10,000 - 10,000,000 VND)"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              min={10000}
              max={10000000}
              step={10000}
            />
          </Form.Item>

          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.amount !== currentValues.amount}>
            {({ getFieldValue }) => {
              const amount = getFieldValue('amount');
              if (amount) {
                const exchangeRate = 24000;
                const amountUSD = (amount / exchangeRate).toFixed(2);
                return (
                  <Alert
                    message={`Equivalent: $${amountUSD} USD`}
                    type="info"
                    style={{ marginBottom: 16 }}
                  />
                );
              }
              return null;
            }}
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Quick select:</Text>
            <Space wrap style={{ marginTop: 8 }}>
              {amountOptions.map(option => (
                <Button
                  key={option.value}
                  onClick={() => topUpForm.setFieldsValue({ amount: option.value })}
                >
                  {option.label}
                </Button>
              ))}
            </Space>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setTopUpModalVisible(false);
                topUpForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={topUpLoading}>
                Continue to PayPal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Pay Penalty Modal */}
      <Modal
        title="Pay Penalties"
        open={penaltyModalVisible}
        onCancel={() => {
          setPenaltyModalVisible(false);
          setSelectedPenalty(null);
          setPenaltyDetails([]);
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setPenaltyModalVisible(false);
            setSelectedPenalty(null);
            setPenaltyDetails([]);
          }}>
            Cancel
          </Button>,
          <Button
            key="pay"
            type="primary"
            onClick={handlePayPenalty}
            loading={payingPenalty}
            disabled={!selectedPenalty || (wallet.balance < (selectedPenalty?.amount || 0))}
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none'
            }}
          >
            Pay {selectedPenalty ? `${selectedPenalty.amount.toLocaleString()} VND` : ''}
          </Button>
        ]}
        width={800}
      >
        <Spin spinning={penaltyLoading}>
          {penalties.length === 0 ? (
            <Empty description="No pending penalties" />
          ) : (
            <div>
              <Alert
                message={`Current Balance: ${wallet.balance.toLocaleString()} VND`}
                type={wallet.balance < (selectedPenalty?.amount || 0) ? 'warning' : 'info'}
                style={{ marginBottom: 16 }}
              />

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card title="Select Penalty" size="small">
                    <List
                      dataSource={penalties}
                      renderItem={(penalty) => (
                        <List.Item
                          style={{
                            cursor: 'pointer',
                            backgroundColor: selectedPenalty?.id === penalty.id ? '#e6f7ff' : 'transparent',
                            border: selectedPenalty?.id === penalty.id ? '2px solid #1890ff' : '1px solid #f0f0f0'
                          }}
                          onClick={() => handleSelectPenalty(penalty)}
                        >
                          <List.Item.Meta
                            title={
                              <div>
                                <Text strong>{penalty.kitName}</Text>
                                <Tag color="error" style={{ marginLeft: 8 }}>
                                  {penalty.amount.toLocaleString()} VND
                                </Tag>
                              </div>
                            }
                            description={
                              <div>
                                <Text type="secondary">{penalty.reason}</Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Due: {formatDateTimeDisplay(penalty.dueDate)}
                                </Text>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>

                <Col xs={24} md={12}>
                  <Card title="Penalty Details" size="small">
                    {selectedPenalty ? (
                      <div>
                        <Descriptions column={1} bordered size="small">
                          <Descriptions.Item label="Kit Name">
                            {selectedPenalty.kitName}
                          </Descriptions.Item>
                          <Descriptions.Item label="Amount">
                            <Text strong style={{ color: '#ff4d4f' }}>
                              {selectedPenalty.amount.toLocaleString()} VND
                            </Text>
                          </Descriptions.Item>
                          <Descriptions.Item label="Reason">
                            {selectedPenalty.reason}
                          </Descriptions.Item>
                          <Descriptions.Item label="Due Date">
                            {formatDateTimeDisplay(selectedPenalty.dueDate)}
                          </Descriptions.Item>
                        </Descriptions>

                        {penaltyDetails.length > 0 && (
                          <div style={{ marginTop: 16 }}>
                            <Text strong>Penalty Breakdown:</Text>
                            <List
                              size="small"
                              dataSource={penaltyDetails}
                              renderItem={(detail) => (
                                <List.Item>
                                  <Text>{detail.policyName || 'Penalty'}: </Text>
                                  <Text strong>{detail.amount?.toLocaleString()} VND</Text>
                                </List.Item>
                              )}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <Empty description="Select a penalty to view details" />
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Spin>
      </Modal>

      {/* Transfer Money Modal */}
      <Modal
        title="Transfer Money"
        open={transferModalVisible}
        onCancel={() => {
          setTransferModalVisible(false);
          transferForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Alert
          message="Transfer Money"
          description="Chuyển tiền từ ví của bạn đến người nhận bằng email."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleTransfer}
        >
          <Form.Item
            label="Recipient Email"
            name="recipientEmail"
            rules={[
              { required: true, message: 'Please enter recipient email' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input
              placeholder="Enter recipient email address"
              type="email"
            />
          </Form.Item>

          <Form.Item
            label="Amount (VND)"
            name="amount"
            rules={[
              { required: true, message: 'Please enter amount' },
              { type: 'number', min: 10000, message: 'Minimum amount is 10,000 VND' }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Enter amount (minimum 10,000 VND)"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              min={10000}
              step={10000}
            />
          </Form.Item>

          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.amount !== currentValues.amount}>
            {({ getFieldValue }) => {
              const amount = getFieldValue('amount');
              if (amount) {
                const balance = wallet.balance || 0;
                const remaining = balance - amount;
                return (
                  <Alert
                    message={`Current Balance: ${balance.toLocaleString()} VND`}
                    description={`Balance after transfer: ${remaining.toLocaleString()} VND`}
                    type={remaining < 0 ? 'error' : remaining < 50000 ? 'warning' : 'info'}
                    style={{ marginBottom: 16 }}
                  />
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            label="Description (Optional)"
            name="description"
          >
            <Input.TextArea
              placeholder="Enter description for this transfer"
              rows={3}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setTransferModalVisible(false);
                transferForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={transferLoading}
              >
                Transfer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Transaction Details Modal */}
      <Modal
        title="Transaction Details"
        open={detailsModalVisible}
        onCancel={handleCloseDetails}
        footer={[
          <Button key="close" onClick={handleCloseDetails}>
            Close
          </Button>
        ]}
        width={700}
        centered
        destroyOnClose
      >
        {selectedTransaction && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Transaction ID" span={2}>
              <Text code>{selectedTransaction.transactionId || selectedTransaction.id || 'N/A'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Transaction Type">
              {(() => {
                const type = selectedTransaction.type || selectedTransaction.transactionType || 'UNKNOWN';
                const config = getTransactionTypeConfig(type);
                return (
                  <Tag
                    color={config.color}
                    style={{
                      background: config.bg,
                      border: config.border,
                      color: config.text,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 13,
                      letterSpacing: 1
                    }}
                  >
                    {config.icon} <span>{config.label}</span>
                  </Tag>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Previous Balance">
              {selectedTransaction.previousBalance !== null && selectedTransaction.previousBalance !== undefined
                ? formatCurrency(selectedTransaction.previousBalance)
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              <Text strong style={{ fontSize: '18px', color: (selectedTransaction.amount || 0) >= 0 ? '#52c41a' : '#ff4d4f' }}>
                {formatCurrency(selectedTransaction.amount || 0)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {(() => {
                const status = selectedTransaction.status || selectedTransaction.transactionStatus || 'N/A';
                const statusColor = status === 'COMPLETED' || status === 'SUCCESS' ? 'success' :
                  status === 'PENDING' ? 'warning' :
                    status === 'FAILED' ? 'error' : 'default';
                return (
                  <Tag color={statusColor}>
                    {status}
                  </Tag>
                );
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Description" span={2}>
              {selectedTransaction.description || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Transaction Date">
              {selectedTransaction.transactionDate ? formatDateTime(selectedTransaction.transactionDate) :
                selectedTransaction.createdAt ? formatDateTime(selectedTransaction.createdAt) : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};



// Password validation helper function
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};

// Profile Management Component
const ProfileManagement = ({ profile, setProfile, loading, setLoading, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [changingPassword, setChangingPassword] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      console.log('Profile response:', response);

      const profileData = response?.data || response;
      setProfile(profileData);

      // Set form values when profile is loaded
      if (profileData) {
        form.setFieldsValue({
          fullName: profileData.fullName || '',
          phone: profileData.phone || '',
          avatarUrl: profileData.avatarUrl || '',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    if (profile) {
      form.setFieldsValue({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        avatarUrl: profile.avatarUrl || '',
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);
      const updateData = {
        fullName: values.fullName,
        phone: values.phone,
        avatarUrl: values.avatarUrl || null,
      };

      const response = await authAPI.updateProfile(updateData);
      console.log('Update profile response:', response);

      const updatedProfile = response?.data || response;
      setProfile(updatedProfile);
      setIsEditing(false);

      message.success('Profile updated successfully');

      // Reload profile to get latest data
      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile: ' + (error.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (values) => {
    const { oldPassword, newPassword, confirmPassword } = values;

    // Validate new password
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      message.error(passwordError);
      return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      message.error('New password and confirm password do not match');
      return;
    }

    // Check if new password is same as old password
    if (oldPassword === newPassword) {
      message.error('New password must be different from old password');
      return;
    }

    try {
      setChangingPassword(true);
      await authAPI.changePassword(oldPassword, newPassword);
      message.success('Password changed successfully');
      setChangePasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error('Error changing password:', error);
      message.error('Failed to change password: ' + (error.message || 'Unknown error'));
    } finally {
      setChangingPassword(false);
    }
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>My Profile</span>
              {!isEditing ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleEdit}
                >
                  Edit Profile
                </Button>
              ) : (
                <Space>
                  <Button onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => form.submit()}
                    loading={saving}
                  >
                    Save Changes
                  </Button>
                </Space>
              )}
            </div>
          }
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          <Spin spinning={loading}>
            {profile ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                initialValues={{
                  fullName: profile.fullName || '',
                  phone: profile.phone || '',
                  avatarUrl: profile.avatarUrl || '',
                }}
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={8}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                      <Avatar
                        size={120}
                        src={profile.avatarUrl || null}
                        icon={!profile.avatarUrl && <UserOutlined />}
                        style={{
                          background: profile.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: '4px solid rgba(102, 126, 234, 0.2)',
                        }}
                      />
                      {isEditing && (
                        <Form.Item
                          name="avatarUrl"
                          style={{ marginTop: 16, marginBottom: 0 }}
                        >
                          <Input
                            placeholder="Avatar URL"
                            prefix={<UploadOutlined />}
                          />
                        </Form.Item>
                      )}
                    </div>
                  </Col>

                  <Col xs={24} md={16}>
                    <Descriptions column={1} bordered>
                      <Descriptions.Item label="Email">
                        <Text strong>{profile.email || 'N/A'}</Text>
                        <Tag color="blue" style={{ marginLeft: 8 }}>Cannot be changed</Tag>
                      </Descriptions.Item>

                      <Descriptions.Item label="Full Name">
                        {isEditing ? (
                          <Form.Item
                            name="fullName"
                            rules={[{ required: true, message: 'Please enter your full name' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Enter your full name" />
                          </Form.Item>
                        ) : (
                          <Text strong>{profile.fullName || 'N/A'}</Text>
                        )}
                      </Descriptions.Item>

                      <Descriptions.Item label="Phone">
                        {isEditing ? (
                          <Form.Item
                            name="phone"
                            rules={[
                              { pattern: /^[0-9]{10,11}$/, message: 'Please enter a valid phone number' }
                            ]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Enter your phone number" />
                          </Form.Item>
                        ) : (
                          <Text>{profile.phone || 'N/A'}</Text>
                        )}
                      </Descriptions.Item>

                      <Descriptions.Item label="Student Code">
                        <Text>{profile.studentCode || 'N/A'}</Text>
                        <Tag color="orange" style={{ marginLeft: 8 }}>Cannot be changed</Tag>
                      </Descriptions.Item>

                      <Descriptions.Item label="Role">
                        <Tag color="purple">{profile.role || 'N/A'}</Tag>
                        <Tag color="orange" style={{ marginLeft: 8 }}>Cannot be changed</Tag>
                      </Descriptions.Item>

                      <Descriptions.Item label="Account Status">
                        <Tag color={profile.isActive ? 'success' : 'error'}>
                          {profile.isActive ? 'Active' : 'Inactive'}
                        </Tag>
                      </Descriptions.Item>

                      <Descriptions.Item label="Created At">
                        <Text>{profile.createdAt ? formatDateTimeDisplay(profile.createdAt) : 'N/A'}</Text>
                      </Descriptions.Item>
                    </Descriptions>

                    {/* Change Password Button */}
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                      <Button
                        type="default"
                        icon={<LockOutlined />}
                        onClick={() => setChangePasswordModalVisible(true)}
                        block
                      >
                        Change Password
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            ) : (
              <Empty description="Failed to load profile" />
            )}
          </Spin>
        </Card>
      </motion.div>

      {/* Change Password Modal */}
      <Modal
        title="Change Password"
        open={changePasswordModalVisible}
        onCancel={() => {
          setChangePasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="oldPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter a new password' },
              {
                validator: (_, value) => {
                  const error = validatePassword(value);
                  return error ? Promise.reject(new Error(error)) : Promise.resolve();
                }
              }
            ]}
            help="Password must be at least 8 characters, contain uppercase, lowercase, and special characters"
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setChangePasswordModalVisible(false);
                passwordForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={changingPassword}>
                Change Password
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Borrow Tracking Component (View Only for Members - Shows Leader's Requests or User's Own Requests)
const BorrowTracking = ({ borrowingRequests, setBorrowingRequests, user, group, penalties, penaltyDetails }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [relatedPenalty, setRelatedPenalty] = useState(null);
  const [relatedPenaltyDetails, setRelatedPenaltyDetails] = useState([]);
  const [loadingPenalty, setLoadingPenalty] = useState(false);
  const [leaderPenalties, setLeaderPenalties] = useState([]);
  const [leaderPenaltyDetails, setLeaderPenaltyDetails] = useState({});
  const [trackingMode, setTrackingMode] = useState('leader'); // 'leader' or 'self'

  // Fetch borrowing requests based on tracking mode
  const fetchBorrowingRequests = useCallback(async (mode) => {
    setLoading(true);
    try {
      let targetUserId = null;

      if (mode === 'leader') {
        // Get leader ID from group
        const leaderId = group?.leaderId;

        if (!leaderId) {
          console.warn('No leader found in group');
          setBorrowingRequests([]);
          message.warning('No leader found in your group. Please contact admin.');
          return;
        }

        targetUserId = leaderId;
        console.log('Fetching borrowing requests for leader ID:', leaderId);
      } else {
        // Get current user ID
        if (!user?.id) {
          console.warn('No user ID found');
          setBorrowingRequests([]);
          message.warning('User information not available.');
          return;
        }

        targetUserId = user.id;
        console.log('Fetching borrowing requests for user ID:', user.id);
      }

      const requests = await borrowingRequestAPI.getByUser(targetUserId);
      console.log('Borrowing requests:', requests);

      // Sort by createdAt descending (newest first)
      const sortedRequests = (requests || []).sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setBorrowingRequests(sortedRequests);
    } catch (error) {
      console.error('Error fetching borrowing requests:', error);
      message.error('Failed to load borrowing requests');
    } finally {
      setLoading(false);
    }
  }, [group, user, setBorrowingRequests]);

  // Load leader's penalties
  const loadLeaderPenalties = useCallback(async () => {
    if (!group?.leaderId) {
      setLeaderPenalties([]);
      setLeaderPenaltyDetails({});
      return;
    }

    try {
      console.log('Loading penalties for leader ID:', group.leaderId);
      // Note: getPenByAccount() gets penalties for current user
      // We need to load penalties when viewing request details instead
      // For now, we'll load them on demand in showRequestDetails
    } catch (error) {
      console.error('Error loading leader penalties:', error);
      setLeaderPenalties([]);
      setLeaderPenaltyDetails({});
    }
  }, [group?.leaderId]);

  // Handle tracking mode change
  const handleTrackingModeChange = (mode) => {
    setTrackingMode(mode);
    fetchBorrowingRequests(mode);
  };

  useEffect(() => {
    // Fetch requests based on current tracking mode
    if (trackingMode === 'leader') {
      if (group?.leaderId) {
        fetchBorrowingRequests('leader');
        loadLeaderPenalties();
      } else {
        setBorrowingRequests([]);
        setLeaderPenalties([]);
        setLeaderPenaltyDetails({});
      }
    } else {
      if (user?.id) {
        fetchBorrowingRequests('self');
      } else {
        setBorrowingRequests([]);
      }
    }
  }, [trackingMode, group?.leaderId, user?.id, fetchBorrowingRequests, loadLeaderPenalties]);

  const showRequestDetails = async (request) => {
    setSelectedRequest(request);
    setDetailDrawerVisible(true);

    // Reset penalty data first
    setRelatedPenalty(null);
    setRelatedPenaltyDetails([]);

    // If request is RETURNED, find related penalty
    if (request.status === 'RETURNED') {
      setLoadingPenalty(true);
      try {
        // Try to find penalty by request ID - search in all possible penalty sources
        // First check if penalty is already in the request object
        let penalty = request.penalty || null;

        // If not found, try to search by request ID in various ways
        if (!penalty) {
          // Search in leader penalties if loaded
          if (leaderPenalties && leaderPenalties.length > 0) {
            penalty = leaderPenalties.find(p =>
              (p.borrowRequestId && p.borrowRequestId === request.id) ||
              (p.request && p.request.id === request.id) ||
              (p.requestId && p.requestId === request.id)
            );
          }

          // If still not found, try member penalties (might have some overlap)
          if (!penalty && penalties && penalties.length > 0) {
            penalty = penalties.find(p =>
              (p.borrowRequestId && p.borrowRequestId === request.id) ||
              (p.request && p.request.id === request.id) ||
              (p.requestId && p.requestId === request.id)
            );
          }
        }

        // If still not found, try to load penalty directly by request ID from API
        if (!penalty) {
          try {
            console.log('Loading penalty by request ID from API:', request.id);
            const penaltyResponse = await penaltiesAPI.getPenaltyByRequestId(request.id);
            console.log('Penalty API response:', penaltyResponse);

            if (penaltyResponse && penaltyResponse.data) {
              penalty = penaltyResponse.data;
              console.log('Found penalty from API:', penalty);
            } else if (penaltyResponse && !penaltyResponse.data && penaltyResponse.status === 'NOT_FOUND') {
              console.log('No penalty found for request ID:', request.id);
            }
          } catch (error) {
            console.error('Error loading penalty by request ID:', error);
          }
        }

        if (penalty) {
          console.log('Found related penalty:', penalty);
          setRelatedPenalty(penalty);

          // Try to load penalty details
          let detailsData = [];

          // Check leader penalty details first
          if (leaderPenaltyDetails && leaderPenaltyDetails[penalty.id] && Array.isArray(leaderPenaltyDetails[penalty.id])) {
            detailsData = leaderPenaltyDetails[penalty.id];
            console.log('Loaded penalty details from leader penalty details:', detailsData);
          }
          // Check member penalty details
          else if (penaltyDetails && penaltyDetails[penalty.id] && Array.isArray(penaltyDetails[penalty.id])) {
            detailsData = penaltyDetails[penalty.id];
            console.log('Loaded penalty details from member penalty details:', detailsData);
          }
          // Load from API
          else {
            try {
              console.log('Loading penalty details from API for penalty ID:', penalty.id);
              const detailsResponse = await penaltyDetailAPI.findByPenaltyId(penalty.id);
              console.log('Penalty details API response:', detailsResponse);

              if (Array.isArray(detailsResponse)) {
                detailsData = detailsResponse;
              } else if (detailsResponse && detailsResponse.data) {
                if (Array.isArray(detailsResponse.data)) {
                  detailsData = detailsResponse.data;
                } else if (detailsResponse.data.id) {
                  // Single object
                  detailsData = [detailsResponse.data];
                }
              } else if (detailsResponse && detailsResponse.id) {
                // Direct object
                detailsData = [detailsResponse];
              }
              console.log('Parsed penalty details:', detailsData);
            } catch (error) {
              console.error('Error loading penalty details:', error);
              detailsData = [];
            }
          }

          setRelatedPenaltyDetails(detailsData);
          console.log('Final penalty details to display:', detailsData);
        } else {
          console.log('No penalty found for request:', request.id);
          setRelatedPenalty(null);
          setRelatedPenaltyDetails([]);
        }
      } catch (error) {
        console.error('Error finding related penalty:', error);
        setRelatedPenalty(null);
        setRelatedPenaltyDetails([]);
      } finally {
        setLoadingPenalty(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'BORROWED':
        return 'blue';
      case 'RETURNED':
        return 'default';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <Text code>{id?.substring(0, 8)}...</Text>
    },
    {
      title: 'Kit Name',
      dataIndex: ['kit', 'kitName'],
      key: 'kitName',
      render: (kitName) => kitName || 'N/A'
    },
    {
      title: 'Request Type',
      dataIndex: 'requestType',
      key: 'requestType',
      render: (type) => (
        <Tag color={type === 'BORROW_KIT' ? 'blue' : 'purple'}>
          {type}
        </Tag>
      )
    },
    {
      title: 'Expected Return Date',
      dataIndex: 'expectReturnDate',
      key: 'expectReturnDate',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A'
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
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showRequestDetails(record)}
          >
            View Details
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card
          title={`Borrow Tracking (${trackingMode === 'leader' ? "Leader's Requests" : "My Requests"})`}
          extra={
            <Space>
              <Button.Group>
                <Button
                  type={trackingMode === 'leader' ? 'primary' : 'default'}
                  onClick={() => handleTrackingModeChange('leader')}
                  disabled={!group?.leaderId}
                >
                  Leader's Requests
                </Button>
                <Button
                  type={trackingMode === 'self' ? 'primary' : 'default'}
                  onClick={() => handleTrackingModeChange('self')}
                >
                  My Requests
                </Button>
              </Button.Group>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => fetchBorrowingRequests(trackingMode)}
                loading={loading}
                disabled={trackingMode === 'leader' && !group?.leaderId}
              >
                Refresh
              </Button>
            </Space>
          }
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          {(trackingMode === 'leader' && !group?.leaderId) ? (
            <Empty
              description="No leader found in your group"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={borrowingRequests}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'No borrowing requests found' }}
            />
          )}
        </Card>
      </motion.div>

      {/* Request Details Drawer */}
      <Drawer
        title="Request Details"
        placement="right"
        width={600}
        onClose={() => {
          setDetailDrawerVisible(false);
          setRelatedPenalty(null);
          setRelatedPenaltyDetails([]);
        }}
        open={detailDrawerVisible}
      >
        {selectedRequest && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Request ID">
                <Text code>{selectedRequest.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Kit Name">
                <Text strong>{selectedRequest.kit?.kitName || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Request Type">
                <Tag color={selectedRequest.requestType === 'BORROW_KIT' ? 'blue' : 'purple'}>
                  {selectedRequest.requestType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedRequest.status)}>
                  {selectedRequest.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Reason">
                {selectedRequest.reason || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Return Date">
                {selectedRequest.expectReturnDate ? new Date(selectedRequest.expectReturnDate).toLocaleString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Deposit Amount">
                {selectedRequest.depositAmount ? `${selectedRequest.depositAmount.toLocaleString()} VND` : 'N/A'}
              </Descriptions.Item>
            </Descriptions>

            {/* Penalty Payment Section - Only show for RETURNED requests */}
            {selectedRequest.status === 'RETURNED' && (
              <div style={{ marginTop: '24px' }}>
                <Divider orientation="left">
                  <Space>
                    <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                    <span>Penalty Payment</span>
                  </Space>
                </Divider>
                <Spin spinning={loadingPenalty}>
                  {relatedPenalty ? (
                    <Card
                      size="small"
                      style={{
                        marginTop: '16px',
                        border: relatedPenalty.resolved ? '1px solid #52c41a' : '1px solid #fa8c16'
                      }}
                    >
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Penalty Status">
                          <Tag color={relatedPenalty.resolved ? 'success' : 'warning'}>
                            {relatedPenalty.resolved ? 'Resolved' : 'Unresolved'}
                          </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Penalty Amount">
                          <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                            {relatedPenalty.totalAmount ? relatedPenalty.totalAmount.toLocaleString() : 0} VND
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Penalty Note">
                          {relatedPenalty.note || 'N/A'}
                        </Descriptions.Item>
                        {relatedPenalty.takeEffectDate && (
                          <Descriptions.Item label="Take Effect Date">
                            {new Date(relatedPenalty.takeEffectDate).toLocaleString('vi-VN')}
                          </Descriptions.Item>
                        )}
                        {relatedPenaltyDetails && relatedPenaltyDetails.length > 0 && (
                          <Descriptions.Item label="Penalty Details">
                            <List
                              size="small"
                              dataSource={relatedPenaltyDetails}
                              renderItem={(detail, idx) => (
                                <List.Item>
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    • {detail.policyName || detail.description || 'Penalty Detail'}: {detail.amount ? detail.amount.toLocaleString() : 0} VND
                                  </Text>
                                </List.Item>
                              )}
                            />
                          </Descriptions.Item>
                        )}
                        {relatedPenaltyDetails && relatedPenaltyDetails.length === 0 && relatedPenalty && (
                          <Descriptions.Item label="Penalty Details">
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              No detailed breakdown available
                            </Text>
                          </Descriptions.Item>
                        )}
                        {!relatedPenalty.resolved && (
                          <Descriptions.Item>
                            <Button
                              type="primary"
                              danger
                              icon={<DollarOutlined />}
                              onClick={() => {
                                navigate('/penalty-payment', {
                                  state: { penaltyId: relatedPenalty.id }
                                });
                              }}
                              block
                            >
                              Pay Penalty
                            </Button>
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    </Card>
                  ) : (
                    <Card size="small" style={{ marginTop: '16px' }}>
                      <Empty
                        description="No penalty found for this request"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        style={{ padding: '20px 0' }}
                      />
                    </Card>
                  )}
                </Spin>
              </div>
            )}

            {selectedRequest.qrCode && (
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <Title level={4}>QR Code</Title>
                <img
                  src={`data:image/png;base64,${selectedRequest.qrCode}`}
                  alt="QR Code"
                  style={{ maxWidth: '100%', border: '1px solid #d9d9d9', borderRadius: '8px' }}
                />
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MemberPortal; 
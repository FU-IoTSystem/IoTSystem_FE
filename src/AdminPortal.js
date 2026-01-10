import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Avatar,
  Badge,
  Divider,
  List,
  Timeline,
  Switch,
  DatePicker,
  Upload,
  Tabs,
  Alert,
  Descriptions,
  Empty,
  Spin,
  Popover,
  notification,
  Transfer,
  Popconfirm,
  Checkbox,
  InputNumber,
  Carousel,
  Pagination,
  Progress
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
  ReloadOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
  BellOutlined,
  DollarOutlined,
  SafetyCertificateOutlined,
  BuildOutlined,
  InfoCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ExportOutlined,
  HistoryOutlined,
  ImportOutlined,
  RollbackOutlined,
  LoadingOutlined,
  LeftOutlined,
  RightOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { kitAPI, kitComponentAPI, kitComponentHistoryAPI, borrowingRequestAPI, walletTransactionAPI, userAPI, authAPI, classesAPI, studentGroupAPI, borrowingGroupAPI, penaltyPoliciesAPI, penaltiesAPI, penaltyDetailAPI, damageReportAPI, notificationAPI, excelImportAPI, classAssignmentAPI } from './api';
import webSocketService from './utils/websocket';
import './AdminPortalDashboard.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
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

  // Import/Export states
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [groupMembersModalVisible, setGroupMembersModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [savingGroupMembers, setSavingGroupMembers] = useState(false);

  // Kit Inspection and Fine Management states
  const [kitInspectionModalVisible, setKitInspectionModalVisible] = useState(false);
  const [selectedKit, setSelectedKit] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);
  const [damageAssessment, setDamageAssessment] = useState({});
  const [fineAmount, setFineAmount] = useState(0);
  const [kitInspectionLoading, setKitInspectionLoading] = useState(false);
  const [selectedPenaltyPolicies, setSelectedPenaltyPolicies] = useState([]);
  const [fines, setFines] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [logHistory, setLogHistory] = useState([]);
  const [penaltyPolicies, setPenaltyPolicies] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [borrowPenaltyStats, setBorrowPenaltyStats] = useState([]);
  const [customDateRange, setCustomDateRange] = useState([]);
  const [notificationPopoverOpen, setNotificationPopoverOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [kitComponentHistory, setKitComponentHistory] = useState([]);
  const [kitComponentHistoryLoading, setKitComponentHistoryLoading] = useState(false);
  const [historySelectedKitId, setHistorySelectedKitId] = useState(null);
  const [historySelectedComponentId, setHistorySelectedComponentId] = useState(null);

  // Form instances

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


  useEffect(() => {
    loadData();
  }, []);

  // Auto-calculate fine amount when damage or penalty policies change
  useEffect(() => {
    if (kitInspectionModalVisible) {
      calculateFineAmount();
    }
  }, [damageAssessment, selectedPenaltyPolicies, kitInspectionModalVisible]);

  // Load unresolved penalties for Fine Management tab
  useEffect(() => {
    const loadUnresolvedPenalties = async () => {
      try {
        const res = await penaltiesAPI.getUnresolved();
        console.log('Unresolved penalties response:', res);
        const data = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
        const mapped = data.map(p => ({
          id: p.id,
          kitId: p.borrowRequestId || 'N/A',
          borrowRequestId: p.borrowRequestId || p.requestId || null,
          kitName: 'N/A',
          studentEmail: p.accountEmail || 'N/A',
          studentName: p.accountEmail || 'N/A',
          leaderEmail: p.accountEmail || 'N/A',
          leaderName: p.accountEmail || 'N/A',
          fineAmount: (p.totalAmount !== undefined && p.totalAmount !== null) ? Number(p.totalAmount) : 0,
          createdAt: p.takeEffectDate || new Date().toISOString(),
          dueDate: new Date().toISOString(),
          status: p.resolved ? 'paid' : 'pending',
          damageAssessment: {},
        }));
        // Sort by createdAt descending (newest first)
        const sorted = mapped.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        setFines(sorted);
      } catch (e) {
        console.error('Error loading unresolved penalties:', e);
      }
    };
    if (selectedKey === 'fines') {
      loadUnresolvedPenalties();
    }
  }, [selectedKey]);

  // Load all penalties for dashboard statistics
  useEffect(() => {
    const loadAllPenalties = async () => {
      try {
        const res = await penaltiesAPI.getAll();
        console.log('All penalties response:', res);
        const data = Array.isArray(res) ? res : (res && Array.isArray(res.data) ? res.data : []);
        const mapped = data.map(p => ({
          id: p.id,
          borrowRequestId: p.borrowRequestId || p.requestId || null,
          fineAmount: (p.totalAmount !== undefined && p.totalAmount !== null) ? Number(p.totalAmount) : 0,
          createdAt: p.takeEffectDate || new Date().toISOString(),
          status: p.resolved ? 'paid' : 'pending',
          resolved: p.resolved || false,
        }));
        // Update fines with all penalties for dashboard
        setFines(prev => {
          // Merge with existing fines, avoiding duplicates
          const existingIds = new Set(prev.map(f => f.id));
          const newFines = mapped.filter(f => !existingIds.has(f.id));
          // Update existing fines with resolved status if available
          const updated = prev.map(f => {
            const match = mapped.find(m => m.id === f.id);
            return match ? { ...f, status: match.status, resolved: match.resolved } : f;
          });
          return [...updated, ...newFines];
        });
      } catch (e) {
        console.error('Error loading all penalties:', e);
      }
    };
    if (selectedKey === 'dashboard') {
      loadAllPenalties();
    }
  }, [selectedKey]);

  useEffect(() => {
    if (selectedKey === 'kit-component-history') {
      if (kits.length > 0 && !historySelectedKitId && !historySelectedComponentId) {
        loadKitComponentHistoryByKit(kits[0].id);
      } else if (!historySelectedKitId && !historySelectedComponentId) {
        loadAllKitComponentHistory();
      }
    }
  }, [selectedKey, kits]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch real data from API
      console.log('Loading data from API...');

      // Variables to store fetched data for stats calculation
      let fetchedKits = [];
      let fetchedUsers = [];
      let fetchedRentalRequests = [];
      let fetchedApprovedRequests = [];
      let transactionsData = [];

      // Fetch all kits from API
      try {
        const kitsResponse = await kitAPI.getAllKits();
        console.log('Raw kits response:', kitsResponse);

        // Handle direct array response
        if (Array.isArray(kitsResponse)) {
          // Transform the data to handle null values and ensure proper format
          const transformedKits = kitsResponse.map(kit => ({
            ...kit,
            status: kit.status || 'AVAILABLE', // Default to AVAILABLE if null
            components: kit.components || [], // Convert null to empty array for display
            imageUrl: kit.imageUrl === 'null' ? null : kit.imageUrl // Convert string 'null' to actual null
          }));
          fetchedKits = transformedKits;
          setKits(transformedKits);
          console.log('Kits loaded successfully:', transformedKits.length);
          console.log('Transformed kits:', transformedKits);
        }
        // Handle wrapped response format
        else if (kitsResponse && kitsResponse.data && Array.isArray(kitsResponse.data)) {
          fetchedKits = kitsResponse.data;
          setKits(kitsResponse.data);
          console.log('Kits loaded successfully:', kitsResponse.data.length);
        }
        // Handle empty or invalid response
        else {
          fetchedKits = [];
          setKits([]);
          console.log('No kits found or invalid response format');
        }
      } catch (kitsError) {
        console.error('Error loading kits:', kitsError);
        fetchedKits = [];
        setKits([]);
      }

      // Groups are loaded from API

      // Fetch users from API
      try {
        const usersData = await userAPI.getAllAccounts(0, 100); // Get first 100 users
        console.log('Users response:', usersData);

        if (usersData && usersData.length > 0) {
          // Map ProfileResponse to user format for table
          const mappedUsers = usersData.map(profile => ({
            id: profile.id,
            name: profile.fullName || profile.email || 'Unknown',
            email: profile.email,
            phone: profile.phone,
            studentCode: profile.studentCode,
            lecturerCode: profile.lecturerCode,
            role: profile.role?.toLowerCase() || 'member',
            status: 'Active', // Default status since ProfileResponse doesn't have status
            createdAt: profile.createdAt || profile.updatedAt || new Date().toISOString()
          }));

          fetchedUsers = mappedUsers;
          setUsers(mappedUsers);
          console.log('Users loaded successfully:', mappedUsers.length);
        } else {
          fetchedUsers = [];
          setUsers([]);
          console.log('No users found or invalid response format');
        }
      } catch (usersError) {
        console.error('Error loading users:', usersError);
        fetchedUsers = [];
        setUsers([]);
      }
      // Fetch rental requests from API
      try {
        const rentalResponse = await borrowingRequestAPI.getAll();
        console.log('Raw rental requests response:', rentalResponse);

        // Helper function to sort rental requests by createdAt desc
        const sortRentalRequestsByCreatedAt = (requests) => {
          return [...requests].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA; // Descending order (newest first)
          });
        };

        if (Array.isArray(rentalResponse)) {
          const sortedRequests = sortRentalRequestsByCreatedAt(rentalResponse);
          fetchedRentalRequests = sortedRequests;
          setRentalRequests(sortedRequests);
          console.log('Rental requests loaded successfully:', sortedRequests.length);
        } else if (rentalResponse && rentalResponse.data && Array.isArray(rentalResponse.data)) {
          const sortedRequests = sortRentalRequestsByCreatedAt(rentalResponse.data);
          fetchedRentalRequests = sortedRequests;
          setRentalRequests(sortedRequests);
          console.log('Rental requests loaded successfully:', sortedRequests.length);
        } else {
          fetchedRentalRequests = [];
          setRentalRequests([]);
          console.log('No rental requests data');
        }
      } catch (rentalError) {
        console.error('Error loading rental requests:', rentalError);
        fetchedRentalRequests = [];
        setRentalRequests([]);
      }

      // Fetch approved requests for return checking and kits in use
      try {
        const approvedResponse = await borrowingRequestAPI.getApproved();
        console.log('Raw approved requests response:', approvedResponse);

        if (Array.isArray(approvedResponse)) {
          fetchedApprovedRequests = approvedResponse;

          // Transform approved requests to refund request format
          const refundRequestsData = approvedResponse.map(request => {
            const borrowDate = request.approvedDate || request.createdAt || null;
            const dueDate = request.expectReturnDate || null;
            const returnDate = request.actualReturnDate || null;

            // Calculate duration in days
            let duration = 0;
            if (borrowDate) {
              const borrowDay = dayjs(borrowDate);
              const now = dayjs();
              const endDate = returnDate ? dayjs(returnDate) : now;
              if (borrowDay.isValid() && endDate.isValid()) {
                duration = Math.max(0, endDate.diff(borrowDay, 'day'));
              }
            }

            // Check if rental is late
            let isLate = request.isLate || false;
            if (dueDate) {
              const dueDay = dayjs(dueDate);
              const now = dayjs();
              const returnDay = returnDate ? dayjs(returnDate) : null;
              const compareDate = returnDay && returnDay.isValid() ? returnDay : now;

              if (dueDay.isValid() && compareDate.isValid() && compareDate.isAfter(dueDay)) {
                isLate = true;
              }
            }

            return {
              id: request.id,
              rentalId: request.id,
              kitId: request.kit?.id || 'N/A',
              kitName: request.kit?.kitName || 'N/A',
              userEmail: request.requestedBy?.email || 'N/A',
              userName: request.requestedBy?.fullName || 'N/A',
              status: 'pending',
              requestDate: request.createdAt || request.approvedDate || null,
              approvedDate: request.approvedDate || null,
              expectReturnDate: request.expectReturnDate || null,
              actualReturnDate: request.actualReturnDate || null,
              totalCost: request.depositAmount || 0,
              damageAssessment: {},
              reason: request.reason || 'Course project',
              depositAmount: request.depositAmount || 0,
              requestType: request.requestType, // Add request type to distinguish kit vs component
              duration: duration,
              isLate: isLate,
              raw: request
            };
          });

          setRefundRequests(refundRequestsData);
          console.log('Approved requests loaded successfully:', refundRequestsData.length);
        } else {
          fetchedApprovedRequests = [];
          setRefundRequests([]);
          console.log('No approved requests found or invalid response format');
        }
      } catch (approvedError) {
        console.error('Error loading approved requests:', approvedError);
        fetchedApprovedRequests = [];
        setRefundRequests([]);
      }

      // Fetch wallet transactions from API
      try {
        console.log('Fetching wallet transactions...');
        const transactionsResponse = await walletTransactionAPI.getAll();
        console.log('Raw wallet transactions response:', transactionsResponse);
        console.log('Response type:', typeof transactionsResponse);
        console.log('Is array:', Array.isArray(transactionsResponse));

        if (Array.isArray(transactionsResponse)) {
          transactionsData = transactionsResponse;
          setTransactions(transactionsResponse);
          console.log('Wallet transactions loaded successfully:', transactionsResponse.length);
          console.log('First transaction:', transactionsResponse[0]);
        } else if (transactionsResponse && Array.isArray(transactionsResponse.data)) {
          transactionsData = transactionsResponse.data;
          setTransactions(transactionsResponse.data);
          console.log('Wallet transactions loaded from response.data:', transactionsResponse.data.length);
        } else {
          transactionsData = [];
          setTransactions([]);
          console.log('No transactions data');
        }
      } catch (transactionsError) {
        console.error('Error loading wallet transactions:', transactionsError);
        transactionsData = [];
        setTransactions([]);
      }

      // Fetch borrowing/penalty stats for dashboard
      try {
        const statsResponse = await borrowingRequestAPI.getBorrowPenaltyStats();
        const statsData = Array.isArray(statsResponse) ? statsResponse : (statsResponse?.data ?? []);
        console.log('Borrow/penalty stats raw response:', statsResponse);
        console.log('Borrow/penalty stats loaded:', statsData.length, 'items');
        console.log('Sample stat:', statsData[0]);
        setBorrowPenaltyStats(statsData);
      } catch (statsError) {
        console.error('Error loading borrow/penalty stats:', statsError);
        setBorrowPenaltyStats([]);
      }

      setFines([]);

      // Fetch penalty policies from API
      try {
        const penaltyPoliciesResponse = await penaltyPoliciesAPI.getAll();
        console.log('Penalty policies response:', penaltyPoliciesResponse);

        // Check if response has data property (ApiResponse wrapper)
        const policiesData = penaltyPoliciesResponse?.data || penaltyPoliciesResponse;

        if (Array.isArray(policiesData)) {
          setPenaltyPolicies(policiesData);
          console.log('Penalty policies loaded successfully:', policiesData.length);
        } else {
          setPenaltyPolicies([]);
          console.log('No penalty policies found or invalid response format:', penaltyPoliciesResponse);
        }
      } catch (penaltyPoliciesError) {
        console.error('Error loading penalty policies:', penaltyPoliciesError);
        setPenaltyPolicies([]);
      }

      // Load available students for group management
      const studentUsers = []; // TODO: Replace with real API call to get student users
      setAvailableStudents(studentUsers);

      // Calculate system stats from fetched data (not from state)
      const availableKitsCount = fetchedKits.filter(kit => kit.status === 'ACTIVE' || kit.status === 'active').length;
      const pendingRequestsCount = fetchedRentalRequests.filter(req => req.status === 'PENDING' || req.status === 'PENDING_APPROVAL').length;

      // Calculate kits in use from approved requests (same API as return checking)
      const kitsInUseCount = fetchedApprovedRequests.length;

      // Calculate monthly revenue from transactions (current month) using response data
      const statsCurrentMonth = new Date().getMonth();
      const statsCurrentYear = new Date().getFullYear();
      const statsMonthlyRevenueAmount = transactionsData
        .filter(txn => {
          const txnDate = new Date(txn.createdAt || txn.transactionDate);
          return txnDate.getMonth() === statsCurrentMonth &&
            txnDate.getFullYear() === statsCurrentYear &&
            (txn.type === 'RENTAL_FEE' || txn.type === 'PENALTY_PAYMENT');
        })
        .reduce((sum, txn) => sum + (txn.amount || 0), 0);

      // Calculate recent activity from rental requests and transactions
      const recentActivity = [];

      // Add recent rental requests as activities
      fetchedRentalRequests.forEach(request => {
        const userName = request.requestedBy?.fullName || request.requestedBy?.email || 'Unknown User';
        const kitName = request.kit?.kitName || 'Unknown Kit';
        const status = request.status || 'PENDING';
        const timestamp = request.createdAt || new Date().toISOString();

        let actionText = '';
        if (status === 'PENDING' || status === 'PENDING_APPROVAL') {
          actionText = `Requested to rent ${kitName}`;
        } else if (status === 'APPROVED') {
          actionText = `Approved rental for ${kitName}`;
        } else if (status === 'REJECTED') {
          actionText = `Rejected rental request for ${kitName}`;
        } else if (status === 'RETURNED') {
          actionText = `Returned ${kitName}`;
        } else {
          actionText = `${status} - ${kitName}`;
        }

        const timeAgo = getTimeAgo(timestamp);
        recentActivity.push({
          action: actionText,
          user: userName,
          time: timeAgo,
          timestamp: timestamp
        });
      });

      // Add recent transactions as activities
      transactionsData.forEach(txn => {
        const txnType = txn.type || 'TRANSACTION';
        const timestamp = txn.createdAt || txn.transactionDate || new Date().toISOString();
        let actionText = '';
        if (txnType === 'RENTAL_FEE') {
          actionText = `Rental fee payment: ${formatCurrency(txn.amount || 0)}`;
        } else if (txnType === 'PENALTY_PAYMENT') {
          actionText = `Penalty payment: ${formatCurrency(txn.amount || 0)}`;
        } else if (txnType === 'DEPOSIT') {
          actionText = `Deposit: ${formatCurrency(txn.amount || 0)}`;
        } else {
          actionText = `${txnType}: ${formatCurrency(txn.amount || 0)}`;
        }

        const timeAgo = getTimeAgo(timestamp);
        recentActivity.push({
          action: actionText,
          user: txn.accountEmail || 'System',
          time: timeAgo,
          timestamp: timestamp
        });
      });

      // Sort all activities by timestamp (most recent first) and take top 20
      recentActivity.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateB - dateA;
      });

      setSystemStats({
        totalUsers: fetchedUsers.length,
        availableKits: availableKitsCount,
        pendingApprovals: pendingRequestsCount,
        kitsInUse: kitsInUseCount,
        monthlyRevenue: statsMonthlyRevenueAmount,
        recentActivity: recentActivity.slice(0, 20)
      });

      console.log('Data loaded successfully');
      console.log('System stats:', {
        totalUsers: fetchedUsers.length,
        availableKits: availableKitsCount,
        pendingApprovals: pendingRequestsCount,
        kitsInUse: kitsInUseCount,
        monthlyRevenue: statsMonthlyRevenueAmount
      });
      console.log('Kits in use count breakdown:', {
        totalApprovedRequests: fetchedApprovedRequests.length,
        approvedRequestsFromAPI: fetchedApprovedRequests.length
      });
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      setNotificationLoading(true);
      const response = await notificationAPI.getRoleNotifications();
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

  const normalizeHistoryResponse = (response) => {
    const payload = response?.data ?? response;
    return Array.isArray(payload) ? payload : [];
  };

  const loadAllKitComponentHistory = async () => {
    setKitComponentHistoryLoading(true);
    setHistorySelectedKitId(null);
    setHistorySelectedComponentId(null);
    try {
      const res = await kitComponentHistoryAPI.getAll();
      const data = normalizeHistoryResponse(res);
      setKitComponentHistory(data);
    } catch (error) {
      console.error('Error loading all kit component history:', error);
      message.error('Không tải được lịch sử component');
    } finally {
      setKitComponentHistoryLoading(false);
    }
  };

  const loadKitComponentHistoryByKit = async (kitId) => {
    if (!kitId) {
      await loadAllKitComponentHistory();
      return;
    }
    setKitComponentHistoryLoading(true);
    setHistorySelectedKitId(kitId);
    setHistorySelectedComponentId(null);
    try {
      const res = await kitComponentHistoryAPI.getByKit(kitId);
      const data = normalizeHistoryResponse(res);
      setKitComponentHistory(data);
    } catch (error) {
      console.error('Error loading kit component history by kit:', error);
      message.error('Không tải được lịch sử component của kit');
    } finally {
      setKitComponentHistoryLoading(false);
    }
  };

  const loadKitComponentHistoryByComponent = async (componentId) => {
    if (!componentId) {
      await loadAllKitComponentHistory();
      return;
    }
    setKitComponentHistoryLoading(true);
    setHistorySelectedComponentId(componentId);
    setHistorySelectedKitId(null);
    try {
      const res = await kitComponentHistoryAPI.getByComponent(componentId);
      const data = normalizeHistoryResponse(res);
      setKitComponentHistory(data);
    } catch (error) {
      console.error('Error loading kit component history by component:', error);
      message.error('Không tải được lịch sử của component');
    } finally {
      setKitComponentHistoryLoading(false);
    }
  };

  const notificationSubscriptionRef = useRef(null);

  useEffect(() => {
    loadNotifications();

    // Connect to WebSocket and subscribe to admin notifications
    webSocketService.connect(
      () => {
        console.log('WebSocket connected for admin notifications');
        // Subscribe to admin notifications
        notificationSubscriptionRef.current = webSocketService.subscribeToAdminNotifications((data) => {
          console.log('Received new notification via WebSocket:', data);
          // Add new notification to the list
          setNotifications(prev => {
            // Check if notification already exists
            const exists = prev.find(notif => notif.id === data.id);
            if (!exists) {
              // Show browser notification
              notification.info({
                message: data.title || 'New Notification',
                description: data.message,
                placement: 'topRight',
                duration: 5,
              });
              // Add new notification at the beginning and maintain sort order
              const updated = [data, ...prev];
              return updated.sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateB - dateA; // Descending order (newest first)
              });
            }
            return prev;
          });
        });
      },
      (error) => {
        console.error('WebSocket connection error:', error);
      }
    );

    // Cleanup on unmount
    return () => {
      if (notificationSubscriptionRef.current) {
        webSocketService.unsubscribe(notificationSubscriptionRef.current);
      }
      webSocketService.disconnect();
    };
  }, []);

  const notificationTypeStyles = {
    ALERT: { color: 'volcano', label: 'Cảnh báo' },
    DEPOSIT: { color: 'green', label: 'Giao dịch ví' },
    SYSTEM: { color: 'blue', label: 'Hệ thống' },
    USER: { color: 'purple', label: 'Người dùng' }
  };

  const unreadNotificationsCount = notifications.filter((item) => !item.isRead).length;

  const handleNotificationOpenChange = (open) => {
    setNotificationPopoverOpen(open);
    if (open) {
      loadNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    // Only mark as read if not already read
    if (!notification.isRead && notification.id) {
      try {
        await notificationAPI.markAsRead(notification.id);
        // Update notification state to mark as read
        setNotifications(prev =>
          prev.map(item =>
            item.id === notification.id
              ? { ...item, isRead: true }
              : item
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const renderNotificationContent = () => (
    <div style={{ width: 320, maxHeight: '400px', overflowY: 'auto' }}>
      <Spin spinning={notificationLoading}>
        {notifications.length > 0 ? (
          <List
            rowKey={(item) => item.id || item.title}
            dataSource={notifications}
            renderItem={(item) => {
              const typeInfo = notificationTypeStyles[item.type] || { color: 'blue', label: item.type };
              const notificationDate = item.createdAt ? formatDateTime(item.createdAt) : 'N/A';
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

  // Helper function to read sheet names from Excel file
  const getExcelSheetNames = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          resolve(workbook.SheetNames || []);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImportKits = async (file, sheetName = null) => {
    try {
      const importedData = await importFromExcel(file, 'kits');
      const newKits = importedData.map((kit, index) => ({
        id: Date.now() + index,
        name: kit.Name || kit.name,
        category: kit.Category || kit.category || 'STUDENT_KIT',
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



  const handleExportKits = () => {
    // Build export data based on current kit model from API
    const kitData = (kits || []).map((kit) => {
      const totalQuantity = kit.quantityTotal ?? 0;
      const availableQuantity = kit.quantityAvailable ?? 0;

      return {
        'Kit ID': kit.id,
        'Kit Name': kit.kitName || kit.name || '',
        'Type': kit.type || '',
        'Total Quantity': totalQuantity,
        'Available Quantity': availableQuantity,
        'In Use Quantity': totalQuantity - availableQuantity,
        'Status': kit.status || '',
        'Components Count': Array.isArray(kit.components) ? kit.components.length : 0,
        'Description': kit.description || '',
        'Image URL': kit.imageUrl || '',
      };
    });

    exportToExcel(kitData, 'kits_list');
    notification.success({
      message: 'Export Successful',
      description: 'Kit list exported to Excel file',
      placement: 'topRight',
    });
  };

  // Group Management Functions

  const adjustGroupMembers = async (group) => {
    setSelectedGroup(group);
    setSelectedStudents(group.members || []);

    // Load available students when opening the modal
    try {
      // Get students by classId if available, otherwise get all students
      let studentsInClass = [];
      if (group.classId) {
        studentsInClass = await userAPI.getStudentsByClassId(group.classId);
        console.log('Students in class (by classId):', studentsInClass);
      } else {
        // Fallback to all students if no classId
        studentsInClass = await userAPI.getStudents();
        console.log('All students (no classId):', studentsInClass);
      }

      setAvailableStudents(studentsInClass || []);
    } catch (error) {
      console.error('Error loading students for adjust members:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load available students for this class',
        placement: 'topRight',
      });
      setAvailableStudents([]);
    }

    setGroupMembersModalVisible(true);
  };

  const saveGroupMembers = async () => {
    if (!selectedGroup) {
      notification.error({
        message: 'Error',
        description: 'No group selected',
        placement: 'topRight',
      });
      return;
    }

    const MAX_GROUP_MEMBERS = 4;
    const newMembersCount = selectedStudents?.length || 0;

    // Validate maximum members
    if (newMembersCount > MAX_GROUP_MEMBERS) {
      notification.warning({
        message: 'Too Many Members',
        description: `A group can have maximum ${MAX_GROUP_MEMBERS} members. You selected ${newMembersCount} members.`,
        placement: 'topRight',
        duration: 4,
      });
      return;
    }

    setSavingGroupMembers(true);

    try {
      console.log('=== saveGroupMembers called ===');
      console.log('Selected group:', selectedGroup);
      console.log('Current members (emails):', selectedGroup?.members);
      console.log('New members (emails):', selectedStudents);

      // Get full student objects including IDs
      const allStudents = await userAPI.getStudents();
      const currentMembersEmails = selectedGroup?.members || [];
      const newMembersEmails = selectedStudents || [];

      // Find members to remove (in current but not in new)
      const membersToRemove = currentMembersEmails.filter(email => !newMembersEmails.includes(email));

      // Find members to add (in new but not in current)
      const membersToAdd = newMembersEmails.filter(email => !currentMembersEmails.includes(email));

      console.log('Members to remove:', membersToRemove);
      console.log('Members to add:', membersToAdd);

      // Remove members
      for (const email of membersToRemove) {
        const student = allStudents.find(s => s.email === email);
        if (student) {
          console.log(`Removing member: ${email} (ID: ${student.id})`);
          await borrowingGroupAPI.removeMemberFromGroup(selectedGroup.id, student.id);
        }
      }

      // Add new members
      for (let i = 0; i < membersToAdd.length; i++) {
        const email = membersToAdd[i];
        const student = allStudents.find(s => s.email === email);
        if (student) {
          // New members become MEMBER (not LEADER to avoid conflict)
          const role = 'MEMBER';

          const borrowingGroupData = {
            studentGroupId: selectedGroup.id,
            accountId: student.id,
            roles: role
          };

          console.log(`Adding member: ${email} (ID: ${student.id})`);
          await borrowingGroupAPI.addMemberToGroup(borrowingGroupData);
        }
      }

      // Close modal first
      setGroupMembersModalVisible(false);

      // Store group name for notification before clearing
      const groupName = selectedGroup?.groupName || 'group';

      setSelectedGroup(null);
      setSelectedStudents([]);

      notification.success({
        message: 'Group Updated Successfully',
        description: `Successfully updated ${groupName}. ${membersToRemove.length > 0 ? `Removed ${membersToRemove.length} member(s). ` : ''}${membersToAdd.length > 0 ? `Added ${membersToAdd.length} member(s).` : 'No changes made.'}`,
        placement: 'topRight',
        duration: 4,
      });

      // Trigger groups reload if callback is provided (will be handled by GroupManagement component)
      if (selectedKey === 'groups') {
        // Groups will be reloaded when GroupManagement component detects the change
        // or we can trigger a window event to notify
        window.dispatchEvent(new CustomEvent('groupsUpdated'));
      }
    } catch (error) {
      console.error('Error updating group members:', error);
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to update group members',
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setSavingGroupMembers(false);
    }
  };


  // Kit Inspection and Fine Management Functions

  const openRefundKitInspection = async (refundRequest) => {
    console.log('Opening kit inspection for:', refundRequest);
    console.log('Available kits:', kits);

    // Check if this is a component rental or full kit rental
    const isComponentRental = refundRequest.requestType === 'BORROW_COMPONENT';

    // For component rental, we still need to find the parent kit
    const kit = kits.find(k =>
      k.kitName === refundRequest.kitName ||
      k.name === refundRequest.kitName
    );

    console.log('Found kit:', kit);
    console.log('Is component rental:', isComponentRental);

    if (!kit) {
      notification.error({
        message: 'Kit Not Found',
        description: `The kit "${refundRequest.kitName}" could not be found. Available kits: ${kits.map(k => k.kitName || k.name).join(', ')}`,
        placement: 'topRight',
        duration: 6,
      });
      return;
    }

    // Create a rental-like object for the refund request
    const rentalObject = {
      id: refundRequest.id || refundRequest.rentalId,
      kitId: kit.id,
      kitName: refundRequest.kitName,
      userEmail: refundRequest.userEmail,
      userName: refundRequest.userName || refundRequest.userEmail?.split('@')[0] || 'Unknown',
      status: refundRequest.status,
      totalCost: refundRequest.depositAmount || 0,
      requestType: refundRequest.requestType, // Add request type for inspection logic
      raw: refundRequest.raw || refundRequest // Store raw request data for access to expectReturnDate
    };

    console.log('Set rental object:', rentalObject);
    console.log('Set selected kit:', kit);

    let kitToUse = kit;

    // If component rental, fetch the rented components
    if (isComponentRental) {
      try {
        const rentedComponents = await borrowingRequestAPI.getRequestComponents(refundRequest.id);
        console.log('Fetched rented components:', rentedComponents);

        // Update kit to show only the rented components
        if (rentedComponents && rentedComponents.length > 0) {
          // Find actual components from kits
          const actualComponents = rentedComponents.map(rc => {
            const actualComp = kit.components?.find(c =>
              c.id === rc.kitComponentsId || c.componentName === rc.componentName
            );
            return actualComp ? {
              ...actualComp,
              rentedQuantity: rc.quantity,
              componentName: rc.componentName
            } : {
              componentName: rc.componentName,
              name: rc.componentName,
              quantity: rc.quantity,
              rentedQuantity: rc.quantity
            };
          });

          // Create a temporary kit object with only rented components
          kitToUse = {
            ...kit,
            components: actualComponents.length > 0 ? actualComponents : kit.components
          };

          console.log('Set selected kit with rented components:', kitToUse);
        } else {
          console.log('No rented components found, using full kit');
        }
      } catch (error) {
        console.error('Error fetching rented components:', error);
      }
    } else {
      // For full kit rental, use kit as is
      console.log('Full kit selected - components:', kit.components);
    }

    console.log('Final kit to use:', kitToUse);
    console.log('Kit components:', kitToUse.components);

    // Set all states before opening modal
    setSelectedRental(rentalObject);
    setSelectedKit(kitToUse);
    setDamageAssessment(refundRequest.damageAssessment || {});
    setFineAmount(0);
    setSelectedPenaltyPolicies([]);

    // Open modal after setting all states
    setTimeout(() => {
      setKitInspectionModalVisible(true);
      console.log('Kit inspection modal opened');
    }, 100);
  };

  const handleComponentDamage = (componentName, isDamaged, damageValue = 0) => {
    setDamageAssessment(prev => {
      const newAssessment = {
        ...prev,
        [componentName]: {
          damaged: isDamaged,
          value: damageValue,
          imageUrl: prev[componentName]?.imageUrl || null // Preserve existing image if any
        }
      };

      // If component is not damaged, remove image
      if (!isDamaged) {
        delete newAssessment[componentName].imageUrl;
      }

      // Calculate fine amount immediately with new assessment
      let totalFine = 0;

      // Calculate fine from component damage using the new assessment
      Object.values(newAssessment).forEach(component => {
        if (component && component.damaged) {
          totalFine += component.value || 0;
        }
      });

      // Add penalty policies amount from current state
      selectedPenaltyPolicies.forEach(policy => {
        if (policy && policy.amount) {
          totalFine += policy.amount;
        }
      });

      // Update fine amount immediately
      setFineAmount(totalFine);

      return newAssessment;
    });
  };

  const handleImageUpload = async (componentName, file) => {
    try {
      const response = await penaltyDetailAPI.uploadImage(file);
      if (response && response.data && response.data.imageUrl) {
        setDamageAssessment(prev => ({
          ...prev,
          [componentName]: {
            ...prev[componentName],
            imageUrl: response.data.imageUrl
          }
        }));
        message.success('Image uploaded successfully');
      } else {
        message.error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      message.error(error.message || 'Failed to upload image');
    }
  };

  const calculateFineAmount = () => {
    let totalFine = 0;

    // Calculate fine from component damage
    Object.values(damageAssessment).forEach(component => {
      if (component && component.damaged) {
        totalFine += component.value || 0;
      }
    });

    // Add penalty policies amount
    selectedPenaltyPolicies.forEach(policy => {
      if (policy && policy.amount) {
        totalFine += policy.amount;
      }
    });

    setFineAmount(totalFine);
    return totalFine;
  };

  const submitKitInspection = async () => {
    setKitInspectionLoading(true);
    let totalFine = calculateFineAmount();

    // Check if this is a refund request or rental request
    const isRefundRequest = selectedRental && (selectedRental.status === 'approved' || selectedRental.status === 'pending');

    // IMPORTANT: Create penalty FIRST before updating status to RETURNED
    // This ensures backend can check for unresolved penalties and won't refund deposit prematurely
    let penaltyCreated = false;
    if (totalFine > 0 && (selectedPenaltyPolicies.length > 0 || Object.keys(damageAssessment).length > 0)) {
      try {
        // Rental fee is NOT included in penalty amount
        // Penalty only includes policy violations and damage fees
        // Rental fee is handled separately in penalty payment logic

        // Create penalty
        const penaltyData = {
          semester: new Date().getFullYear() + '-' + (new Date().getMonth() < 6 ? 'SPRING' : 'FALL'),
          takeEffectDate: new Date(),
          kitType: selectedKit?.type || 'STUDENT_KIT',
          resolved: false,
          note: 'Kit returned with damage',
          totalAmount: totalFine,
          borrowRequestId: selectedRental?.id,
          accountId: users.find(u => u.email === selectedRental?.userEmail)?.id,
          policyId: null
        };

        console.log('Creating penalty:', penaltyData);
        const penaltyResponse = await penaltiesAPI.create(penaltyData);
        console.log('Penalty created:', penaltyResponse);
        const penaltyId = penaltyResponse?.id || penaltyResponse?.data?.id;

        if (penaltyId) {
          // Build penalty details from selected policies
          const penaltyDetailsData = (selectedPenaltyPolicies || []).map(policy => ({
            amount: policy.amount || 0,
            description: policy.policyName ?
              `${policy.policyName}${policy.type ? ' - ' + policy.type : ''}` :
              'Policy violation',
            policiesId: policy.id,
            penaltyId: penaltyId
          }));

          // Build penalty details from damaged components
          const damagedComponentsDetails = Object.entries(damageAssessment || {})
            .filter(([_, assessment]) => assessment && assessment.damaged)
            .map(([componentName, assessment]) => ({
              amount: assessment.value || 0,
              description: `Damage to ${componentName}`,
              imageUrl: assessment.imageUrl || null,
              policiesId: null, // No policy for component damage
              penaltyId: penaltyId
            }));

          // Combine policy penalty details and component damage penalty details
          const allPenaltyDetails = [...penaltyDetailsData, ...damagedComponentsDetails];

          // Rental fee is handled in penalty payment logic, not as a separate penalty detail
          // No need to add rental fee as penalty detail

          if (allPenaltyDetails.length > 0) {
            console.log('Creating penalty details:', allPenaltyDetails);
            const penaltyDetailsResponse = await penaltyDetailAPI.createMultiple(allPenaltyDetails);
            console.log('Penalty details created:', penaltyDetailsResponse);

            // Map component penalty details back to component names to store history
            const createdDetails = Array.isArray(penaltyDetailsResponse?.data)
              ? penaltyDetailsResponse.data
              : (Array.isArray(penaltyDetailsResponse) ? penaltyDetailsResponse : []);
            const componentPenaltyMap = {};
            createdDetails.forEach((detail) => {
              if (detail?.description?.startsWith('Damage to ')) {
                const compName = detail.description.replace('Damage to ', '').trim();
                componentPenaltyMap[compName] = detail.id;
              }
            });

            // Ghi log lịch sử component khi phát hiện damage
            const components = selectedKit?.components || [];
            const historyPayloads = components
              .map((comp) => {
                const compName = comp.componentName || comp.name;
                const assessment = damageAssessment[compName];
                if (!assessment?.damaged) return null;
                return {
                  kitId: selectedKit?.id,
                  componentId: comp.id,
                  action: 'DAMAGED',
                  oldStatus: comp.status || 'UNKNOWN',
                  newStatus: 'DAMAGED',
                  note: assessment.imageUrl
                    ? `Damage recorded during return inspection. Evidence: ${assessment.imageUrl}`
                    : 'Damage recorded during return inspection.',
                  penaltyDetailId: componentPenaltyMap[compName] || null,
                };
              })
              .filter(Boolean);

            if (historyPayloads.length > 0) {
              try {
                await Promise.all(historyPayloads.map((payload) => kitComponentHistoryAPI.create(payload)));
                console.log('Kit component history created:', historyPayloads.length);
              } catch (historyError) {
                console.error('Error creating kit component history:', historyError);
              }
            }
          }
        }

        penaltyCreated = true;
      } catch (error) {
        console.error('Error creating penalty and damage report:', error);
      }
    }

    // Update borrowing request status to RETURNED AFTER penalty is created (if any)
    // This ensures backend can check for unresolved penalties correctly
    // If no penalty was created, backend will automatically refund deposit
    try {
      if (selectedRental && selectedRental.id) {
        try {
          // Check if return is late by comparing actual return date with expected return date
          const rawRequest = selectedRental.raw || {};
          const expectReturnDate = rawRequest.expectReturnDate || rawRequest.dueDate || null;
          const actualReturnDateStr = new Date().toISOString();
          let isLate = false;

          if (expectReturnDate) {
            const dueDay = dayjs(expectReturnDate);
            const returnDay = dayjs(actualReturnDateStr);
            if (dueDay.isValid() && returnDay.isValid() && returnDay.isAfter(dueDay)) {
              isLate = true;
            }
          }

          await borrowingRequestAPI.update(selectedRental.id, {
            status: 'RETURNED',
            actualReturnDate: actualReturnDateStr,
            isLate: isLate
          });
          console.log(`Borrowing request status updated to RETURNED, isLate: ${isLate}`);
        } catch (updateError) {
          console.error('Error updating borrowing request:', updateError);
        }
      }
    } catch (error) {
      console.error('Error during checkin process:', error);
    }

    // Find the group leader for this rental (only if penalty was created)
    if (penaltyCreated) {
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

        setFines(prev => {
          const updated = [...prev, newFine];
          // Sort by createdAt descending (newest first)
          return updated.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
        });

        notification.success({
          message: 'Kit Inspection Completed',
          description: `Fine of ${totalFine.toLocaleString()} VND sent to group leader ${leader ? leader.name : leaderEmail}`,
          placement: 'topRight',
          duration: 5,
        });
      } else {
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

        setFines(prev => {
          const updated = [...prev, newFine];
          // Sort by createdAt descending (newest first)
          return updated.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
          });
        });
      }

      try {
        const targetAccountId = users.find(u => u.email === (selectedRental?.userEmail))?.id;

        if (targetAccountId) {
          const notificationsPayload = [{
            subType: totalFine > 0 ? 'UNPAID_PENALTY' : 'OVERDUE_RETURN',
            userId: targetAccountId,
            title: totalFine > 0 ? 'Bạn có khoản phạt mới' : 'Trả kit thành công',
            message:
              totalFine > 0
                ? `Kit ${selectedKit?.kitName || ''} có phát sinh khoản phạt ${totalFine.toLocaleString()} VND. Vui lòng kiểm tra và thanh toán.`
                : `Kit ${selectedKit?.kitName || ''} đã được check-in thành công.`
          }];

          if (group) {
            const leaderAccountId = users.find(u => u.email === group.leader)?.id;
            if (leaderAccountId && leaderAccountId !== targetAccountId) {
              notificationsPayload.push({
                subType: 'UNPAID_PENALTY',
                userId: leaderAccountId,
                title: 'Khoản phạt của nhóm',
                message: `Nhóm có khoản phạt ${totalFine.toLocaleString()} VND do kit ${selectedKit?.kitName || ''} bị tổn thất.`
              });
            }
          }

          try {
            await notificationAPI.createNotifications(notificationsPayload);
            console.log('Notifications sent successfully:', notificationsPayload.length);
          } catch (notifyError) {
            console.error('Error sending check-in notifications:', notifyError);
            // Show error to admin but don't block the process
            notification.warning({
              message: 'Notification Error',
              description: 'Kit inspection completed but failed to send notifications. Please check manually.',
              placement: 'topRight',
              duration: 5,
            });
          }
        } else {
          console.warn('Target account ID not found for user:', selectedRental?.userEmail);
        }
      } catch (error) {
        console.error('Error preparing notifications:', error);
      }

      // For refund requests with damage, add to log history and remove from refund requests
      if (isRefundRequest) {
        const logEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          action: 'KIT_RETURNED_WITH_DAMAGE',
          type: 'return',
          user: selectedRental.userEmail,
          userName: selectedRental.userName,
          details: {
            kitName: selectedKit.name,
            kitId: selectedKit.id,
            requestId: selectedRental.id,
            reason: 'Kit returned with damage - fine created',
            damageDescription: 'Kit components have damage',
            originalRentalId: selectedRental.id,
            processedBy: 'admin@fpt.edu.vn',
            fineAmount: totalFine,
            damageAssessment: { ...damageAssessment }
          },
          status: 'RETURNED',
          adminAction: 'checked_in',
          adminUser: 'admin@fpt.edu.vn',
          adminTimestamp: new Date().toISOString()
        };

        setLogHistory(prev => [logEntry, ...prev]);

        // Remove from refund requests
        setRefundRequests(prev => prev.filter(req => req.id !== selectedRental.id));

        notification.success({
          message: 'Kit Checkin Completed',
          description: `Kit returned with damage. Fine of ${totalFine.toLocaleString()} VND has been created.`,
          placement: 'topRight',
          duration: 5,
        });
      } else {
        notification.success({
          message: 'Kit Inspection Completed',
          description: `Fine of ${totalFine.toLocaleString()} VND sent to group leader`,
          placement: 'topRight',
          duration: 5,
        });
      }
    } else {
      // No damage detected - backend will automatically refund deposit if no penalty exists
      // Get updated borrowing request to check if refund was processed
      let updatedRequest = null;
      if (selectedRental && selectedRental.id) {
        try {
          const requestResponse = await borrowingRequestAPI.getById(selectedRental.id);
          updatedRequest = requestResponse?.data || requestResponse;
        } catch (error) {
          console.error('Error fetching updated request:', error);
        }
      }

      // Calculate refund amount (deposit amount if no penalty)
      const depositAmount = selectedRental?.depositAmount || selectedRental?.totalCost || 0;

      // Check if there's a penalty for this request (if penalty exists, refund is handled in penalty payment)
      // Wait a bit for backend to process refund, then check for penalties
      let hasPenalty = false;
      try {
        // Check for unresolved penalties related to this borrowing request
        const unresolvedPenalties = await penaltiesAPI.getUnresolved();
        const penaltiesData = Array.isArray(unresolvedPenalties)
          ? unresolvedPenalties
          : (unresolvedPenalties?.data || []);
        hasPenalty = penaltiesData.some(p =>
          (p.borrowRequestId === selectedRental?.id || p.request?.id === selectedRental?.id) && !p.resolved
        );
      } catch (penaltyCheckError) {
        console.error('Error checking for penalties:', penaltyCheckError);
        // If error, assume no penalty to send notification
        hasPenalty = false;
      }

      if (isRefundRequest) {
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
            refundAmount: depositAmount,
            refundStatus: 'completed',
            originalRentalId: selectedRental.id,
            processedBy: 'admin@fpt.edu.vn',
            inspectionNotes: 'No damage found - full refund processed',
            kitStatusChanged: 'AVAILABLE'
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
          description: `Refund of ${depositAmount.toLocaleString()} VND has been sent to ${selectedRental.userName}'s wallet. Kit status changed to AVAILABLE.`,
          placement: 'topRight',
          duration: 5,
        });
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

      // Send refund notification to user if no penalty exists
      if (!hasPenalty && depositAmount > 0) {
        try {
          const targetAccountId = users.find(u => u.email === (selectedRental?.userEmail))?.id;

          if (targetAccountId) {
            await notificationAPI.createNotifications([{
              subType: 'DEPOSIT_SUCCESS',
              userId: targetAccountId,
              title: 'Hoàn tiền thuê kit thành công',
              message: `Kit ${selectedKit?.kitName || ''} đã được trả thành công. Bạn đã được hoàn lại ${depositAmount.toLocaleString()} VND vào ví.`
            }]);
          }
        } catch (notifyError) {
          console.error('Error sending refund notification:', notifyError);
        }
      }
    }

    setKitInspectionModalVisible(false);
    setSelectedKit(null);
    setSelectedRental(null);
    setDamageAssessment({});
    setFineAmount(0);
    setSelectedPenaltyPolicies([]);
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
      key: 'kit-components',
      icon: <BuildOutlined />,
      label: 'Kit Component Management',
    },
    {
      key: 'rentals',
      icon: <ShoppingOutlined />,
      label: 'Rental Approvals',
    },
    {
      key: 'refunds',
      icon: <RollbackOutlined />,
      label: 'Return Checking',
    },
    {
      key: 'kit-component-history',
      icon: <BuildOutlined />,
      label: 'Kit Component History',
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
      key: 'penalty-policies',
      icon: <SafetyCertificateOutlined />,
      label: 'Penalty Policies',
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

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  // Helper function to format time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
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
                <Popover
                  trigger="click"
                  placement="bottomRight"
                  open={notificationPopoverOpen}
                  onOpenChange={handleNotificationOpenChange}
                  content={renderNotificationContent()}
                >
                  <Badge count={unreadNotificationsCount} size="small" overflowCount={99}>
                    <div style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(102, 126, 234, 0.1)',
                      color: '#667eea',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
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
                {selectedKey === 'dashboard' && (
                  <DashboardContent
                    systemStats={systemStats}
                    users={users}
                    rentalRequests={rentalRequests}
                    fines={fines}
                    borrowPenaltyStats={borrowPenaltyStats}
                  />
                )}
                {selectedKey === 'kits' && <KitManagement kits={kits} setKits={setKits} handleExportKits={handleExportKits} handleImportKits={handleImportKits} />}
                {selectedKey === 'kit-components' && <KitComponentManagement />}
                {selectedKey === 'rentals' && <RentalApprovals rentalRequests={rentalRequests} setRentalRequests={setRentalRequests} setLogHistory={setLogHistory} setTransactions={setTransactions} setRefundRequests={setRefundRequests} onNavigateToRefunds={() => setSelectedKey('refunds')} />}
                {selectedKey === 'refunds' && <RefundApprovals refundRequests={refundRequests} setRefundRequests={setRefundRequests} openRefundKitInspection={openRefundKitInspection} setLogHistory={setLogHistory} />}
                {selectedKey === 'kit-component-history' && (
                  <KitComponentHistoryTab
                    kits={kits}
                    historyData={kitComponentHistory}
                    loading={kitComponentHistoryLoading}
                    onSelectKit={loadKitComponentHistoryByKit}
                    onSelectComponent={loadKitComponentHistoryByComponent}
                    selectedKitId={historySelectedKitId}
                    selectedComponentId={historySelectedComponentId}
                  />
                )}
                {selectedKey === 'fines' && <FineManagement fines={fines} setFines={setFines} setLogHistory={setLogHistory} />}
                {selectedKey === 'transactions' && <TransactionHistory transactions={transactions} setTransactions={setTransactions} />}
                {selectedKey === 'log-history' && <LogHistory logHistory={logHistory} setLogHistory={setLogHistory} />}
                {selectedKey === 'groups' && <GroupManagement groups={groups} setGroups={setGroups} adjustGroupMembers={adjustGroupMembers} availableStudents={availableStudents} onGroupsUpdated={() => { }} />}
                {selectedKey === 'users' && <UserManagement users={users} setUsers={setUsers} />}
                {selectedKey === 'penalty-policies' && <PenaltyPoliciesManagement penaltyPolicies={penaltyPolicies} setPenaltyPolicies={setPenaltyPolicies} />}
              </motion.div>
            </AnimatePresence>
          </Spin>
        </Content>
      </Layout>

      {/* Group Members Modal */}
      <Modal
        title={`Adjust Members - ${selectedGroup?.groupName || selectedGroup?.name || ''}`}
        open={groupMembersModalVisible}
        onCancel={() => {
          if (!savingGroupMembers) {
            setGroupMembersModalVisible(false);
            setSelectedGroup(null);
            setSelectedStudents([]);
          }
        }}
        onOk={saveGroupMembers}
        okText="Save Changes"
        cancelText="Cancel"
        confirmLoading={savingGroupMembers}
        okButtonProps={{ disabled: savingGroupMembers }}
        cancelButtonProps={{ disabled: savingGroupMembers }}
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
          dataSource={(availableStudents || []).map(student => ({
            key: student.email,
            title: student.fullName || student.name || student.email,
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
              {item.studentCode && (
                <div style={{ color: '#999', fontSize: '11px' }}>Code: {item.studentCode}</div>
              )}
            </div>
          )}
          listStyle={{
            width: 300,
            height: 400,
          }}
          showSearch
          filterOption={(inputValue, item) => {
            const title = (item.title || '').toLowerCase();
            const description = (item.description || '').toLowerCase();
            const studentCode = (item.studentCode || '').toLowerCase();
            const searchLower = inputValue.toLowerCase();
            return title.indexOf(searchLower) !== -1 ||
              description.indexOf(searchLower) !== -1 ||
              studentCode.indexOf(searchLower) !== -1;
          }}
        />

        <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <Text strong>Current Group Members ({selectedStudents.length}):</Text>
          <div style={{ marginTop: 8 }}>
            {selectedStudents.length > 0 ? (
              selectedStudents.map(email => {
                const student = (availableStudents || []).find(s => s.email === email);
                return (
                  <Tag key={email} style={{ margin: '4px' }}>
                    {student ? (student.fullName || student.name || email) : email}
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
        title={`Kit Inspection - ${selectedKit?.kitName || selectedKit?.name || 'Unknown'}`}
        open={kitInspectionModalVisible}
        onCancel={() => {
          setKitInspectionModalVisible(false);
          setSelectedKit(null);
          setSelectedRental(null);
          setDamageAssessment({});
          setFineAmount(0);
          setSelectedPenaltyPolicies([]);
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
              message={selectedRental.requestType === 'BORROW_COMPONENT' ? 'Component Return Inspection' : 'Kit Return Inspection'}
              description={`Inspecting ${selectedRental.requestType === 'BORROW_COMPONENT' ? 'component' : 'kit'} returned by ${selectedRental.userName} (${selectedRental.userEmail})`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Descriptions title="Rental Information" bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Student">{selectedRental.userName}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedRental.userEmail}</Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color={selectedRental.requestType === 'BORROW_COMPONENT' ? 'orange' : 'blue'}>
                  {selectedRental.requestType === 'BORROW_COMPONENT' ? 'Component Rental' : 'Full Kit Rental'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kit">{selectedKit.kitName || selectedKit.name}</Descriptions.Item>
              <Descriptions.Item label="Rental ID">#{selectedRental.id}</Descriptions.Item>
              {selectedRental.depositAmount && (
                <Descriptions.Item label="Deposit Amount">
                  {selectedRental.depositAmount.toLocaleString()} VND
                </Descriptions.Item>
              )}
              {selectedRental.raw?.approvedDate && (
                <Descriptions.Item label="Borrow Date">
                  {new Date(selectedRental.raw.approvedDate).toLocaleString('vi-VN')}
                </Descriptions.Item>
              )}
              {selectedRental.raw?.expectReturnDate && (
                <Descriptions.Item label="Expected Return Date">
                  {new Date(selectedRental.raw.expectReturnDate).toLocaleString('vi-VN')}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Duration (days)">
                {(() => {
                  let days = 0;
                  let isLate = false;

                  if (selectedRental.raw?.expectReturnDate) {
                    const dueDay = dayjs(selectedRental.raw.expectReturnDate);
                    const now = dayjs();
                    const returnDay = selectedRental.raw?.actualReturnDate ? dayjs(selectedRental.raw.actualReturnDate) : null;
                    const compareDate = returnDay && returnDay.isValid() ? returnDay : now;

                    if (dueDay.isValid() && compareDate.isValid()) {
                      days = Math.max(0, compareDate.diff(dueDay, 'day'));
                      isLate = compareDate.isAfter(dueDay);
                    }
                  }

                  return (
                    <Text strong style={{ color: isLate ? '#ff4d4f' : '#999' }}>
                      {days} day{days !== 1 ? 's' : ''}
                    </Text>
                  );
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Late">
                {(() => {
                  if (!selectedRental.raw?.expectReturnDate) return <Tag>N/A</Tag>;

                  const dueDay = dayjs(selectedRental.raw.expectReturnDate);
                  const now = dayjs();
                  const returnDay = selectedRental.raw?.actualReturnDate ? dayjs(selectedRental.raw.actualReturnDate) : null;
                  const compareDate = returnDay && returnDay.isValid() ? returnDay : now;

                  const isLate = dueDay.isValid() && compareDate.isValid() && compareDate.isAfter(dueDay);
                  return isLate ? <Tag color="error">Yes</Tag> : <Tag color="success">No</Tag>;
                })()}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Component Inspection</Divider>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Check each component for damage:</Text>
            </div>

            {(selectedKit.components && selectedKit.components.length > 0) ? (
              selectedKit.components.map((component, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{ marginBottom: 8 }}
                  title={
                    <Space>
                      <Text strong>{component.componentName || component.name}</Text>
                      {component.condition && (
                        <Tag color={component.condition === 'New' ? 'green' : 'orange'}>
                          {component.condition}
                        </Tag>
                      )}
                      {component.rentedQuantity && (
                        <Tag color="purple">Rented: {component.rentedQuantity}</Tag>
                      )}
                    </Space>
                  }
                >
                  <Row gutter={16} align="middle">
                    <Col span={12}>
                      <Space direction="vertical" size={4}>
                        <Text>Quantity: {component.quantity || component.rentedQuantity}</Text>
                        {component.pricePerCom && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Price: {Number(component.pricePerCom).toLocaleString()} VND
                          </Text>
                        )}
                      </Space>
                    </Col>
                    <Col span={12}>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Space>
                          <Checkbox
                            checked={damageAssessment[component.componentName || component.name]?.damaged || false}
                            onChange={(e) => {
                              const componentPrice = component.pricePerCom || 0;
                              handleComponentDamage(component.componentName || component.name, e.target.checked, e.target.checked ? componentPrice : 0);
                            }}
                          >
                            Damaged
                          </Checkbox>
                          {damageAssessment[component.componentName || component.name]?.damaged && (
                            <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
                              Fine: {Number(damageAssessment[component.componentName || component.name]?.value || component.pricePerCom || 0).toLocaleString()} VND
                            </Text>
                          )}
                        </Space>
                        {damageAssessment[component.componentName || component.name]?.damaged && (
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Upload
                              accept="image/*"
                              showUploadList={false}
                              beforeUpload={(file) => {
                                handleImageUpload(component.componentName || component.name, file);
                                return false; // Prevent auto upload
                              }}
                              maxCount={1}
                            >
                              <Button
                                size="small"
                                icon={<UploadOutlined />}
                                type={damageAssessment[component.componentName || component.name]?.imageUrl ? 'default' : 'primary'}
                              >
                                {damageAssessment[component.componentName || component.name]?.imageUrl ? 'Change Image' : 'Upload Image'}
                              </Button>
                            </Upload>
                            {damageAssessment[component.componentName || component.name]?.imageUrl && (
                              <div style={{ marginTop: 8 }}>
                                <img
                                  src={damageAssessment[component.componentName || component.name]?.imageUrl}
                                  alt="Damage evidence"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '150px',
                                    borderRadius: '4px',
                                    border: '1px solid #d9d9d9'
                                  }}
                                />
                                <Button
                                  size="small"
                                  danger
                                  style={{ marginTop: 4 }}
                                  onClick={() => {
                                    setDamageAssessment(prev => ({
                                      ...prev,
                                      [component.componentName || component.name]: {
                                        ...prev[component.componentName || component.name],
                                        imageUrl: null
                                      }
                                    }));
                                  }}
                                >
                                  Remove Image
                                </Button>
                              </div>
                            )}
                          </Space>
                        )}
                      </Space>
                    </Col>
                  </Row>
                </Card>
              ))
            ) : (
              <Alert
                message="No Components"
                description="No components found for inspection."
                type="warning"
                showIcon
              />
            )}

            <Divider orientation="left">
              <Space>
                <SafetyCertificateOutlined style={{ color: '#722ed1' }} />
                <Text strong style={{ fontSize: 16 }}>Chính Sách Phạt (Penalty Policies)</Text>
              </Space>
            </Divider>

            {penaltyPolicies && penaltyPolicies.length > 0 ? (
              <List
                dataSource={penaltyPolicies}
                renderItem={(policy) => (
                  <List.Item>
                    <Row style={{ width: '100%' }} align="middle" gutter={16}>
                      <Col flex="auto">
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Text strong>{policy.policyName || 'Unnamed Policy'}</Text>
                          <Text type="secondary" style={{ fontSize: 14 }}>
                            {policy.amount ? policy.amount.toLocaleString() : 'N/A'} VND
                          </Text>
                        </Space>
                      </Col>
                      <Col>
                        <Checkbox
                          checked={selectedPenaltyPolicies.some(selected => selected.id === policy.id)}
                          onChange={(e) => {
                            setSelectedPenaltyPolicies(prev => {
                              const newPolicies = e.target.checked
                                ? [...prev, policy]
                                : prev.filter(p => p.id !== policy.id);

                              // Recalculate fine immediately with new policies
                              let totalFine = 0;

                              // Calculate fine from component damage
                              Object.values(damageAssessment).forEach(component => {
                                if (component && component.damaged) {
                                  totalFine += component.value || 0;
                                }
                              });

                              // Add penalty policies amount using new policies
                              newPolicies.forEach(p => {
                                if (p && p.amount) {
                                  totalFine += p.amount;
                                }
                              });

                              setFineAmount(totalFine);

                              return newPolicies;
                            });
                          }}
                        />
                      </Col>
                    </Row>
                  </List.Item>
                )}
                style={{
                  background: '#fafafa',
                  borderRadius: '8px',
                  padding: '8px 0',
                  marginBottom: 16
                }}
              />
            ) : (
              <Alert
                message="Không có chính sách phạt"
                description="Hiện tại không có chính sách phạt nào được áp dụng cho lần trả kit này."
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                style={{ marginBottom: 16 }}
              />
            )}

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
                    {/* Component damage fines */}
                    {Object.entries(damageAssessment).map(([component, assessment]) => (
                      assessment.damaged && (
                        <div key={component} style={{ marginBottom: 4 }}>
                          <Text strong>{component} (Damage):</Text> {assessment.value.toLocaleString()} VND
                        </div>
                      )
                    ))}
                    {/* Penalty policies */}
                    {selectedPenaltyPolicies.length > 0 && (
                      <>
                        {selectedPenaltyPolicies.map((policy) => (
                          <div key={policy.id} style={{ marginBottom: 4 }}>
                            <Text strong>{policy.policyName} (Policy):</Text> {policy.amount ? policy.amount.toLocaleString() : 0} VND
                          </div>
                        ))}
                      </>
                    )}
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
const DashboardContent = ({ systemStats, users, rentalRequests, fines, borrowPenaltyStats }) => {
  const [customDateRange, setCustomDateRange] = useState([]);
  const mapRoleToGroup = (role) => {
    const normalized = (role || '').toLowerCase();
    if (normalized.includes('student')) return 'student';
    if (normalized.includes('lecturer')) return 'lecturer';
    // Gom quản trị vào nhóm khác để không hiển thị riêng
    return 'other';
  };

  const getSemesterLabel = (dateValue) => {
    const parsed = dayjs(dateValue);
    if (!parsed.isValid()) {
      return 'N/A';
    }
    const month = parsed.month();
    const year = parsed.year();
    return month <= 5 ? `${year}-SPRING` : `${year}-FALL`;
  };

  const normalizeDate = (value) => {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
  };

  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return list.filter((user) => {
      const createdAt = normalizeDate(user.createdAt || user.updatedAt);
      if (!createdAt) {
        return false;
      }
      // Apply custom date range if selected
      if (Array.isArray(customDateRange) && customDateRange.length === 2) {
        const [start, end] = customDateRange;
        if (start && end) {
          const startDay = start.startOf('day');
          const endDay = end.startOf('day');
          if (createdAt.isBefore(startDay, 'day') || createdAt.isAfter(endDay, 'day')) {
            return false;
          }
        }
      }
      return true;
    });
  }, [users, customDateRange]);

  const roleCounts = useMemo(() => {
    const base = { student: 0, lecturer: 0, other: 0 };
    filteredUsers.forEach((user) => {
      const key = mapRoleToGroup(user.role);
      base[key] = (base[key] || 0) + 1;
    });
    return base;
  }, [filteredUsers]);

  const totalFilteredUsers = filteredUsers.length;
  const totalUsers = Array.isArray(users) ? users.length : 0;

  const rangeLabel = useMemo(() => {
    if (Array.isArray(customDateRange) && customDateRange.length === 2) {
      const [start, end] = customDateRange;
      if (start && end) {
        return `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`;
      }
    }
    return 'toàn bộ thời gian';
  }, [customDateRange]);

  const userChartSegments = [
    { key: 'student', label: 'Sinh viên', color: '#1677ff', count: roleCounts.student },
    { key: 'lecturer', label: 'Giảng viên', color: '#52c41a', count: roleCounts.lecturer },
    { key: 'other', label: 'Khác', color: '#faad14', count: roleCounts.other }
  ];

  // Get date range based on filter
  const getDateRange = useMemo(() => {
    const statsList = Array.isArray(borrowPenaltyStats) ? borrowPenaltyStats : [];
    // Collect all available dates from stats
    const allDates = statsList
      .map((s) => normalizeDate(s.statDate || s.createdAt))
      .filter(Boolean)
      .map((d) => d.startOf('day'));

    const today = dayjs();
    const maxDate = allDates.length > 0
      ? allDates.reduce((max, d) => (d.isAfter(max) ? d : max), allDates[0])
      : today;
    const minDate = allDates.length > 0
      ? allDates.reduce((min, d) => (d.isBefore(min) ? d : min), allDates[0])
      : today;

    const buildRange = (start, end) => {
      const days = [];
      let current = start.startOf('day');
      const endDay = end.startOf('day');
      while (current.isBefore(endDay) || current.isSame(endDay, 'day')) {
        days.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
      }
      return days;
    };

    // Custom range (user selection)
    if (Array.isArray(customDateRange) && customDateRange.length === 2) {
      const [start, end] = customDateRange;
      if (start && end) {
        return buildRange(start, end);
      }
    }

    // Default: show span of available data
    return buildRange(minDate, maxDate);
  }, [borrowPenaltyStats, customDateRange]);

  // Filter and group stats by date from API
  const statsByDate = useMemo(() => {
    const statsList = Array.isArray(borrowPenaltyStats) ? borrowPenaltyStats : [];
    const now = dayjs();
    const grouped = {};

    console.log('Processing stats:', statsList.length, 'items');
    console.log('Date range:', getDateRange);

    statsList.forEach((stat) => {
      // Parse statDate - could be string or LocalDate format (YYYY-MM-DD)
      let statDate = stat.statDate || stat.createdAt;
      if (!statDate) {
        console.warn('Stat missing date:', stat);
        return;
      }

      // Handle different date formats - LocalDate comes as "YYYY-MM-DD" string
      const dateValue = normalizeDate(statDate);
      if (!dateValue) {
        console.warn('Invalid date format:', statDate, typeof statDate);
        return;
      }

      const dateKey = dateValue.format('YYYY-MM-DD');

      // Apply custom range filter if selected
      if (Array.isArray(customDateRange) && customDateRange.length === 2) {
        const [start, end] = customDateRange;
        if (start && end) {
          const startDay = start.startOf('day');
          const endDay = end.startOf('day');
          if (dateValue.isBefore(startDay, 'day') || dateValue.isAfter(endDay, 'day')) {
            return;
          }
        }
      }

      // Add to grouped data
      if (!grouped[dateKey]) {
        grouped[dateKey] = { returnedCount: 0, penaltyAmount: 0 };
      }
      // totalBorrow is count of requests, totalPenalty is sum of penalty amounts
      grouped[dateKey].returnedCount += (Number(stat.totalBorrow) || 0);
      grouped[dateKey].penaltyAmount += (Number(stat.totalPenalty) || 0);
      console.log('Added stat to', dateKey, ':', stat.totalBorrow, stat.totalPenalty);
    });

    console.log('Grouped stats:', grouped);
    console.log('Grouped stats keys:', Object.keys(grouped));
    return grouped;
  }, [borrowPenaltyStats, getDateRange, customDateRange]);

  // Prepare chart data: array of { date, returnedCount, penaltyAmount }
  const chartData = useMemo(() => {
    const data = getDateRange.map(dateKey => ({
      date: dateKey,
      dateLabel: dayjs(dateKey).format('DD/MM'),
      returnedCount: statsByDate[dateKey]?.returnedCount || 0,
      penaltyAmount: statsByDate[dateKey]?.penaltyAmount || 0
    }));

    // Sort by date
    data.sort((a, b) => {
      const dateA = dayjs(a.date);
      const dateB = dayjs(b.date);
      return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
    });

    console.log('Chart data prepared:', data.length, 'days');
    return data;
  }, [getDateRange, statsByDate]);

  // Calculate max values for scaling
  const maxReturnedCount = Math.max(...chartData.map(d => d.returnedCount), 1);
  const maxPenaltyAmount = Math.max(...chartData.map(d => d.penaltyAmount), 1);

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
      title: 'Kits In Use',
      value: systemStats.kitsInUse || 0,
      icon: <ShoppingOutlined />,
      color: '#ff7875',
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
          <Col xs={24} sm={12} md={8} lg={6} xl={4} key={index}>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="user-chart-wrapper"
      >
        <Card
          title="Thống kê người dùng"
          className="user-chart-card"
        >
          <div className="user-chart-grid">
            {userChartSegments.map((segment) => {
              const percent = totalFilteredUsers
                ? Math.round((segment.count / totalFilteredUsers) * 100)
                : 0;
              return (
                <div className="user-chart-item" key={segment.key}>
                  <div className="user-chart-circle">
                    <Progress
                      type="dashboard"
                      percent={percent}
                      size={148}
                      strokeColor={segment.color}
                      trailColor="#f0f2f5"
                      format={() => segment.count}
                    />
                  </div>
                  <div className="user-chart-legend">
                    <span className={`user-chart-dot dot-${segment.key}`} />
                    <div className="user-chart-legend-text">
                      <span className="user-chart-legend-label">{segment.label}</span>
                      <span className="user-chart-legend-percent">{percent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="user-chart-summary">
            <Text type="secondary">
              Tổng {totalFilteredUsers} / {totalUsers} người dùng trong {rangeLabel}
            </Text>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        className="request-chart-wrapper"
      >
        <Card
          title="Thống kê trả kit và tiền phạt theo ngày"
          className="request-chart-card"
          extra={
            <RangePicker
              allowClear
              format="DD/MM/YYYY"
              value={customDateRange}
              onChange={(vals) => setCustomDateRange(vals || [])}
            />
          }
        >
          <div className="request-chart-container">
            <div className="request-chart-legend">
              <div className="request-chart-legend-item">
                <span className="request-chart-legend-dot" style={{ backgroundColor: '#1677ff' }} />
                <span>Số lượng trả</span>
              </div>
              <div className="request-chart-legend-item">
                <span className="request-chart-legend-dot" style={{ backgroundColor: '#ff4d4f' }} />
                <span>Tiền phạt đã đóng (VND)</span>
              </div>
            </div>
            <div className="request-bars-timeline">
              {chartData.length > 0 ? (
                chartData.map((data, index) => (
                  <div key={data.date} className="request-bar-group">
                    <div className="request-bar-date-label">{data.dateLabel}</div>
                    <div className="request-bar-pair">
                      <div className="request-bar-item">
                        <div className="request-bar-column">
                          <div
                            className="request-bar-fill"
                            style={{
                              height: `${Math.min((data.returnedCount / maxReturnedCount) * 100, 100)}%`,
                              backgroundColor: '#1677ff'
                            }}
                            title={`${data.returnedCount} kit trả`}
                          />
                        </div>
                        <div className="request-bar-value-label">{data.returnedCount}</div>
                      </div>
                      <div className="request-bar-item">
                        <div className="request-bar-column">
                          <div
                            className="request-bar-fill"
                            style={{
                              height: `${Math.min((data.penaltyAmount / maxPenaltyAmount) * 100, 100)}%`,
                              backgroundColor: '#ff4d4f'
                            }}
                            title={`${data.penaltyAmount.toLocaleString('vi-VN')} VND`}
                          />
                        </div>
                        <div className="request-bar-value-label">
                          {(data.penaltyAmount / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <Empty description="Không có dữ liệu thống kê trong khoảng thời gian đã chọn" />
                </div>
              )}
            </div>
          </div>
          <div className="request-chart-summary">
            <Text type="secondary">
              Tổng {chartData.reduce((sum, d) => sum + d.returnedCount, 0)} kit đã trả và {
                chartData.reduce((sum, d) => sum + d.penaltyAmount, 0).toLocaleString('vi-VN')
              } VND tiền phạt đã đóng trong {rangeLabel}
            </Text>
          </div>
        </Card>
      </motion.div>
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
  const [componentFormVisible, setComponentFormVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sheetSelectionModal, setSheetSelectionModal] = useState({ visible: false, sheets: [], selectedSheet: null, file: null, importType: null, importData: null });
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [componentPage, setComponentPage] = useState(1);
  const [componentPageSize] = useState(6);
  const [kitDetailsModal, setKitDetailsModal] = useState({ visible: false, kit: null });

  // Helper function to read sheet names from Excel file
  const getExcelSheetNames = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          resolve(workbook.SheetNames || []);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Helper function to show sheet selection modal and proceed with import
  const showSheetSelectionAndImport = async (file, importType, importData) => {
    try {
      const sheetNames = await getExcelSheetNames(file);

      if (sheetNames.length === 0) {
        notification.error({
          message: 'Error',
          description: 'No sheets found in Excel file',
          placement: 'topRight',
        });
        return;
      }

      // If only one sheet, use it directly
      if (sheetNames.length === 1) {
        await proceedWithImport(file, sheetNames[0], importType, importData);
        return;
      }

      // Show modal for sheet selection
      setSheetSelectionModal({
        visible: true,
        sheets: sheetNames,
        selectedSheet: sheetNames[0], // Default to first sheet
        file: file,
        importType: importType,
        importData: importData
      });
    } catch (error) {
      console.error('Error reading Excel file:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to read Excel file: ' + error.message,
        placement: 'topRight',
      });
    }
  };

  // Proceed with import using selected sheet
  const proceedWithImport = async (file, sheetName, importType, importData) => {
    try {
      if (importType === 'components') {
        if (importData && importData.kitId) {
          const response = await kitComponentAPI.importComponents(file, importData.kitId, sheetName);
          handleImportComponentsResponse(response);
        } else if (importData && importData.formValues) {
          // For new kit - create kit first then import
          await handleImportComponentsForNewKitWithSheet(file, importData.formValues, sheetName);
        } else {
          await handleImportComponents(file, sheetName);
        }
      } else if (importType === 'kits') {
        await handleImportKits(file, sheetName);
      } else if (importType === 'accounts') {
        await handleImportAccounts(file, importData.role, sheetName);
      }
    } catch (error) {
      console.error('Import error:', error);
      notification.error({
        message: 'Import Failed',
        description: error.message || 'Failed to import data',
        placement: 'topRight',
        duration: 5,
      });
    }
  };

  const handleImportComponentsResponse = (response) => {
    let message = 'Import completed';
    let successCount = 0;
    let errorCount = 0;
    let isSuccess = true;
    let errors = [];

    if (typeof response === 'string') {
      message = response;
      isSuccess = false;
    } else if (response) {
      message = response.message || 'Import completed';
      successCount = response.successCount || 0;
      errorCount = response.errorCount || 0;
      isSuccess = response.success !== false; // Check success field explicitly

      if (response.errors && response.errors.length > 0) {
        errors = response.errors;
        console.warn('Import errors:', errors);
      }
    }

    // If all rows failed (successCount === 0 and errorCount > 0), treat as failure
    if (successCount === 0 && errorCount > 0) {
      isSuccess = false;
    }

    // Build error message with details
    let errorDetails = '';
    if (errors.length > 0) {
      const errorList = errors.slice(0, 5).join('; '); // Show first 5 errors
      errorDetails = errors.length > 5
        ? `${errorList}; ... and ${errors.length - 5} more error(s)`
        : errorList;
    }

    if (isSuccess && successCount > 0) {
      // Success: at least some rows imported
      notification.success({
        message: 'Import Successful',
        description: `Successfully imported ${successCount} component(s). ${errorCount > 0 ? `${errorCount} error(s) occurred.` : ''}`,
        placement: 'topRight',
        duration: 5,
      });
      // Refresh components list only if import was successful
      if (editingKit && editingKit.id) {
        loadComponents();
      }
    } else if (successCount > 0 && errorCount > 0) {
      // Partial success: some rows imported, some failed
      notification.warning({
        message: 'Import Completed with Errors',
        description: `${message}${errorDetails ? ` Errors: ${errorDetails}` : ''}`,
        placement: 'topRight',
        duration: 8,
      });
      // Refresh components list to show imported data
      if (editingKit && editingKit.id) {
        loadComponents();
      }
    } else {
      // Complete failure: no rows imported
      notification.error({
        message: 'Import Failed',
        description: `${message}${errorDetails ? ` Errors: ${errorDetails}` : ''}`,
        placement: 'topRight',
        duration: 8,
      });
      // Do not refresh data if import completely failed
    }
  };

  const handleImportAccounts = async (file, role, sheetName) => {
    try {
      const response = await excelImportAPI.importAccounts(file, role, sheetName);

      let message = 'Import completed';
      let successCount = 0;
      let errorCount = 0;
      let isSuccess = true;
      let errors = [];

      if (typeof response === 'string') {
        message = response;
        isSuccess = false;
      } else if (response) {
        message = response.message || 'Import completed';
        successCount = response.successCount || 0;
        errorCount = response.errorCount || 0;
        isSuccess = response.success !== false; // Check success field explicitly

        if (response.errors && response.errors.length > 0) {
          errors = response.errors;
          console.warn('Import errors:', errors);
        }
      }

      // If all rows failed (successCount === 0 and errorCount > 0), treat as failure
      if (successCount === 0 && errorCount > 0) {
        isSuccess = false;
      }

      // Build error message with details
      let errorDetails = '';
      if (errors.length > 0) {
        const errorList = errors.slice(0, 5).join('; '); // Show first 5 errors
        errorDetails = errors.length > 5
          ? `${errorList}; ... and ${errors.length - 5} more error(s)`
          : errorList;
      }

      if (isSuccess && successCount > 0) {
        // Success: at least some rows imported
        notification.success({
          message: 'Import Successful',
          description: `Successfully imported ${successCount} ${role.toLowerCase()}(s). ${errorCount > 0 ? `${errorCount} error(s) occurred.` : ''}`,
          placement: 'topRight',
          duration: 5,
        });
      } else if (successCount > 0 && errorCount > 0) {
        // Partial success: some rows imported, some failed
        notification.warning({
          message: 'Import Completed with Errors',
          description: `${message}${errorDetails ? ` Errors: ${errorDetails}` : ''}`,
          placement: 'topRight',
          duration: 8,
        });
      } else {
        // Complete failure: no rows imported
        notification.error({
          message: 'Import Failed',
          description: `${message}${errorDetails ? ` Errors: ${errorDetails}` : ''}`,
          placement: 'topRight',
          duration: 8,
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      notification.error({
        message: 'Import Failed',
        description: error.message || 'Failed to import accounts',
        placement: 'topRight',
        duration: 5,
      });
    }
  };

  // Load kits from API - now handled by parent component
  const loadKits = async () => {
    // Kits are now loaded by the parent AdminPortal component
    // This function is kept for compatibility but does nothing
    console.log('KitManagement: Kits are loaded by parent component');
  };

  // Load components for the current kit from API
  const loadComponents = async () => {
    if (!editingKit?.id) {
      console.log('loadComponents: No editingKit.id, skipping');
      return;
    }

    console.log('loadComponents: Starting refresh for kit:', editingKit.id);

    try {
      setLoading(true);
      // Fetch fresh kit data with components from backend
      const response = await kitAPI.getKitById(editingKit.id);
      console.log('loadComponents: API response:', response);

      if (response && response.data) {
        const kitData = response.data;
        const kitComponents = kitData.components || [];
        console.log('loadComponents: Fresh components from API:', kitComponents);
        setComponents(kitComponents);

        // Update the editingKit with fresh data
        setEditingKit(prev => ({ ...prev, components: kitComponents }));
        console.log('loadComponents: Components refreshed successfully');
      } else {
        console.log('loadComponents: No data in response, using fallback');
        // Fallback to existing components if API fails
        const kitComponents = editingKit.components || [];
        setComponents(kitComponents);
      }
    } catch (error) {
      console.error('loadComponents: Error loading components:', error);
      // Fallback to existing components if API fails
      const kitComponents = editingKit.components || [];
      setComponents(kitComponents);
      notification.error({
        message: 'Error',
        description: 'Failed to load components',
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKits();
  }, []);

  // Filter kits based on search and filters
  const filteredKits = kits.filter(kit => {
    const matchesSearch = !searchText ||
      kit.kitName?.toLowerCase().includes(searchText.toLowerCase()) ||
      kit.id?.toString().includes(searchText);
    const matchesStatus = filterStatus === 'all' || kit.status === filterStatus;
    const matchesType = filterType === 'all' || kit.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const showKitDetails = (kit) => {
    setComponentPage(1); // Reset to first page when opening modal
    setKitDetailsModal({ visible: true, kit });
  };

  // Helper function to format date time
  const formatKitDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  const renderKitDetailsContent = () => {
    const kit = kitDetailsModal.kit;
    if (!kit) return null;

    return (
      <div>
        <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="Kit ID" span={2}>
            <Text code style={{ fontSize: '14px' }}>{kit.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Kit Name">
            <Text strong style={{ fontSize: '16px' }}>{kit.kitName || kit.name || 'N/A'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag
              color={kit.type === 'LECTURER_KIT' ? 'red' : kit.type === 'STUDENT_KIT' ? 'blue' : 'default'}
              style={{ fontSize: '13px', padding: '4px 12px' }}
            >
              {kit.type || 'N/A'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={kit.status === 'AVAILABLE' ? 'green' : kit.status === 'IN_USE' ? 'orange' : 'red'}
              style={{ fontSize: '13px', padding: '4px 12px' }}
            >
              {kit.status || 'N/A'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Quantity">
            <Text strong style={{ fontSize: '15px', color: '#1890ff' }}>
              {kit.quantityTotal || 0}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Available Quantity">
            <Text strong style={{ fontSize: '15px', color: '#52c41a' }}>
              {kit.quantityAvailable || 0}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="In Use Quantity">
            <Text strong style={{ fontSize: '15px', color: '#faad14' }}>
              {(kit.quantityTotal || 0) - (kit.quantityAvailable || 0)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Total Components">
            <Text strong style={{ fontSize: '15px' }}>
              {kit.components?.length || 0} components
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            <Text>{kit.description || 'No description available'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Image" span={2}>
            {kit.imageUrl && kit.imageUrl !== 'null' && kit.imageUrl !== 'undefined' ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {kit.imageUrl.startsWith('http') && (
                  <img
                    src={kit.imageUrl}
                    alt="Kit"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '150px',
                      borderRadius: '8px',
                      border: '1px solid #d9d9d9',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <Button
                  type="primary"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => window.open(kit.imageUrl, '_blank')}
                  style={{
                    borderRadius: '6px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    marginLeft: 'auto'
                  }}
                >
                  View Image
                </Button>
              </div>
            ) : (
              <Text type="secondary">No image available</Text>
            )}
          </Descriptions.Item>
          {(kit.createdAt || kit.updatedAt) && (
            <>
              {kit.createdAt && (
                <Descriptions.Item label="Created At">
                  <Text type="secondary">{formatKitDateTime(kit.createdAt)}</Text>
                </Descriptions.Item>
              )}
              {kit.updatedAt && (
                <Descriptions.Item label="Updated At">
                  <Text type="secondary">{formatKitDateTime(kit.updatedAt)}</Text>
                </Descriptions.Item>
              )}
            </>
          )}
        </Descriptions>

        <Divider orientation="left">
          <Space>
            <BuildOutlined style={{ color: '#1890ff' }} />
            <Text strong style={{ fontSize: '16px' }}>Components ({kit.components?.length || 0})</Text>
          </Space>
        </Divider>

        {kit.components && kit.components.length > 0 ? (
          <div style={{ marginTop: 16 }}>
            {/* Calculate pagination */}
            {(() => {
              const startIndex = (componentPage - 1) * componentPageSize;
              const endIndex = startIndex + componentPageSize;
              const currentComponents = kit.components.slice(startIndex, endIndex);
              const totalPages = Math.ceil(kit.components.length / componentPageSize);

              return (
                <>
                  <Row gutter={[16, 16]}>
                    {currentComponents.map((component, index) => (
                      <Col xs={24} sm={12} md={8} key={component.id || index}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          whileHover={{ y: -8 }}
                        >
                          <Card
                            hoverable
                            style={{
                              borderRadius: '16px',
                              overflow: 'hidden',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              border: '1px solid rgba(0,0,0,0.06)',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column'
                            }}
                            cover={
                              <div
                                style={{
                                  height: 200,
                                  background: component.imageUrl
                                    ? `url(${component.imageUrl}) center/cover`
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  position: 'relative'
                                }}
                              >
                                {!component.imageUrl && (
                                  <BuildOutlined style={{ fontSize: 48, color: '#fff', opacity: 0.8 }} />
                                )}
                                <div style={{
                                  position: 'absolute',
                                  top: 12,
                                  right: 12
                                }}>
                                  <Tag
                                    color={
                                      component.status === 'AVAILABLE' ? 'green' :
                                        component.status === 'IN_USE' ? 'orange' :
                                          component.status === 'MAINTENANCE' ? 'blue' :
                                            component.status === 'DAMAGED' ? 'red' : 'default'
                                    }
                                    style={{
                                      fontSize: '12px',
                                      padding: '4px 12px',
                                      borderRadius: '12px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {component.status || 'N/A'}
                                  </Tag>
                                </div>
                              </div>
                            }
                          >
                            <Card.Meta
                              title={
                                <Text
                                  strong
                                  style={{
                                    fontSize: '16px',
                                    color: '#2c3e50',
                                    display: 'block',
                                    marginBottom: 8
                                  }}
                                >
                                  {component.componentName || component.name || 'Unnamed Component'}
                                </Text>
                              }
                              description={
                                <div style={{ marginTop: 8 }}>
                                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <div>
                                      <Tag
                                        color="purple"
                                        style={{
                                          fontSize: '12px',
                                          padding: '4px 12px',
                                          borderRadius: '12px',
                                          marginBottom: 8
                                        }}
                                      >
                                        {component.componentType || 'N/A'}
                                      </Tag>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <Text type="secondary" style={{ fontSize: '13px' }}>
                                        <strong>Total:</strong> {component.quantityTotal || component.quantity || 0}
                                      </Text>
                                    </div>
                                    <div style={{ marginTop: 4 }}>
                                      <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
                                        Price: {component.pricePerCom ? Number(component.pricePerCom).toLocaleString() : 0} VND
                                      </Text>
                                    </div>
                                    {component.condition && (
                                      <div style={{ marginTop: 4 }}>
                                        <Tag
                                          color={component.condition === 'New' ? 'green' : component.condition === 'Used' ? 'orange' : 'red'}
                                          style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '12px' }}
                                        >
                                          {component.condition}
                                        </Tag>
                                      </div>
                                    )}
                                    {component.link && (
                                      <div style={{ marginTop: 8 }}>
                                        <Button
                                          type="link"
                                          size="small"
                                          onClick={() => window.open(component.link, '_blank')}
                                          style={{ padding: 0, fontSize: '12px' }}
                                        >
                                          View Link →
                                        </Button>
                                      </div>
                                    )}
                                  </Space>
                                </div>
                              }
                            />
                          </Card>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>

                  {/* Pagination */}
                  <div style={{
                    marginTop: 24,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 16
                  }}>
                    <Pagination
                      current={componentPage}
                      total={kit.components.length}
                      pageSize={componentPageSize}
                      onChange={(page) => setComponentPage(page)}
                      showSizeChanger={false}
                      showQuickJumper={false}
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} of ${total} components`
                      }
                      style={{ marginTop: 16 }}
                    />
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <Empty
            description="No components available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ margin: '24px 0' }}
          />
        )}
      </div>
    );
  };


  const editKit = (kit) => {
    setEditingKit(kit);

    // Map API data to form field names
    const formData = {
      name: kit.kitName || kit.name, // Map kitName to name field
      category: kit.type || kit.category, // Map type to category field
      quantityTotal: kit.quantityTotal,
      quantityAvailable: kit.quantityAvailable,
      status: kit.status,
      description: kit.description,
      imageUrl: kit.imageUrl
    };

    console.log('Editing kit:', kit);
    console.log('Form data:', formData);

    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const manageComponents = (kit) => {
    setEditingKit(kit);
    setComponents(kit.components || []);
    setComponentModalVisible(true);
  };

  const addComponent = () => {
    setEditingComponent({});
    form.resetFields();
    setComponentFormVisible(true);
  };

  const handleImportComponents = async (file, sheetName = null) => {
    if (!editingKit || !editingKit.id) {
      notification.error({
        message: 'Error',
        description: 'Please select a kit first',
        placement: 'topRight',
      });
      return;
    }

    try {
      const response = await kitComponentAPI.importComponents(file, editingKit.id, sheetName);
      handleImportComponentsResponse(response);
      await loadComponents();
    } catch (error) {
      console.error('Import error:', error);
      notification.error({
        message: 'Import Failed',
        description: error.message || 'Failed to import components. Please check file format. Expected Excel format with columns: index, name, link, quantity, priceperComp, image_url.',
        placement: 'topRight',
        duration: 5,
      });
    }
  };

  const handleImportComponentsForNewKit = async (file, formValues) => {
    // Validate form values first
    if (!formValues.name || !formValues.category || !formValues.quantityTotal) {
      notification.error({
        message: 'Error',
        description: 'Please fill in Kit Name, Kit Type, and Total Quantity first before importing components',
        placement: 'topRight',
        duration: 5,
      });
      return;
    }

    // Show sheet selection first
    await showSheetSelectionAndImport(file, 'components', { formValues });
  };

  const handleImportComponentsForNewKitWithSheet = async (file, formValues, sheetName) => {
    try {
      // Create kit first using form values
      const kitData = {
        kitName: formValues.name,
        type: formValues.category?.toUpperCase() || 'STUDENT_KIT',
        status: 'AVAILABLE',
        description: formValues.description || '',
        imageUrl: formValues.imageUrl || '',
        quantityTotal: formValues.quantityTotal || 1,
        quantityAvailable: formValues.quantityAvailable || formValues.quantityTotal || 1,
        components: []
      };

      notification.info({
        message: 'Creating Kit...',
        description: 'Creating kit first, then importing components...',
        placement: 'topRight',
        duration: 3,
      });

      const kitResponse = await kitAPI.createSingleKit(kitData);

      if (kitResponse && kitResponse.data && kitResponse.data.id) {
        const newKitId = kitResponse.data.id;

        // Now import components for the newly created kit with selected sheet
        const response = await kitComponentAPI.importComponents(file, newKitId, sheetName);

        let message = 'Import completed';
        let successCount = 0;
        let errorCount = 0;
        let isSuccess = true;
        let errors = [];

        if (typeof response === 'string') {
          message = response;
          isSuccess = false;
        } else if (response) {
          message = response.message || 'Import completed';
          successCount = response.successCount || 0;
          errorCount = response.errorCount || 0;
          isSuccess = response.success !== false; // Check success field explicitly

          if (response.errors && response.errors.length > 0) {
            errors = response.errors;
            console.warn('Import errors:', errors);
          }
        }

        // If all rows failed (successCount === 0 and errorCount > 0), treat as failure
        if (successCount === 0 && errorCount > 0) {
          isSuccess = false;
        }

        // Build error message with details
        let errorDetails = '';
        if (errors.length > 0) {
          const errorList = errors.slice(0, 5).join('; '); // Show first 5 errors
          errorDetails = errors.length > 5
            ? `${errorList}; ... and ${errors.length - 5} more error(s)`
            : errorList;
        }

        // Refresh kits list
        const updatedKitsResponse = await kitAPI.getAllKits();
        if (Array.isArray(updatedKitsResponse)) {
          setKits(updatedKitsResponse);
        }

        if (isSuccess && successCount > 0) {
          // Success: at least some rows imported
          notification.success({
            message: 'Kit Created & Components Imported',
            description: `Kit created successfully. ${successCount} component(s) imported from sheet "${sheetName}". ${errorCount > 0 ? `${errorCount} error(s) occurred.` : ''}`,
            placement: 'topRight',
            duration: 5,
          });

          // Close modal and reset form
          setModalVisible(false);
          form.resetFields();
        } else if (successCount > 0 && errorCount > 0) {
          // Partial success: some rows imported, some failed
          notification.warning({
            message: 'Kit Created, Import Completed with Errors',
            description: `Kit created successfully. ${message}${errorDetails ? ` Errors: ${errorDetails}` : ''}`,
            placement: 'topRight',
            duration: 8,
          });
        } else {
          // Complete failure: no rows imported
          notification.error({
            message: 'Kit Created, Import Failed',
            description: `Kit created successfully. ${message}${errorDetails ? ` Errors: ${errorDetails}` : ''}`,
            placement: 'topRight',
            duration: 8,
          });
        }
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to create kit. Please try again.',
          placement: 'topRight',
          duration: 5,
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      notification.error({
        message: 'Import Failed',
        description: error.message || 'Failed to create kit or import components. Please check file format. Expected Excel format with columns: index, name, link, quantity, priceperComp, image_url.',
        placement: 'topRight',
        duration: 5,
      });
    }
  };

  const editComponent = (component) => {
    // Map the component data to match form field names
    const mappedComponent = {
      id: component.id,
      componentName: component.componentName || component.name,
      componentType: component.componentType || component.type,
      description: component.description,
      quantityTotal: component.quantityTotal,
      quantityAvailable: component.quantityAvailable,
      pricePerCom: component.pricePerCom,
      status: component.status,
      imageUrl: component.imageUrl,
      link: component.link
    };
    setEditingComponent(mappedComponent);

    // Populate form with component data
    form.setFieldsValue({
      componentName: mappedComponent.componentName,
      componentType: mappedComponent.componentType,
      description: mappedComponent.description,
      quantityTotal: mappedComponent.quantityTotal,
      quantityAvailable: mappedComponent.quantityAvailable,
      pricePerCom: mappedComponent.pricePerCom,
      status: mappedComponent.status,
      imageUrl: mappedComponent.imageUrl,
      link: mappedComponent.link
    });

    setComponentFormVisible(true);
  };

  const handleComponentSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingComponent && editingComponent.id) {
        // Update existing component
        const componentData = {
          kitId: editingKit.id, // Add kit_id to associate component with the kit
          componentName: values.componentName,
          componentType: values.componentType,
          description: values.description || '',
          quantityTotal: values.quantityTotal,
          quantityAvailable: values.quantityAvailable,
          pricePerCom: values.pricePerCom || 0,
          status: values.status,
          imageUrl: values.imageUrl || '',
          link: values.link || ''
        };

        console.log('Updating component with data:', componentData);
        const response = await kitComponentAPI.updateComponent(editingComponent.id, componentData);
        console.log('Update response:', response);

        // The backend returns the component data directly
        if (response && response.id) {
          // Refresh components from backend to get the latest data
          await loadComponents();

          // Close the form modal after successful update
          setComponentFormVisible(false);
          setEditingComponent(null);

          notification.success({
            message: 'Success',
            description: 'Component updated successfully',
            placement: 'topRight',
            duration: 4,
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'Failed to update component',
            placement: 'topRight',
            duration: 4,
          });
        }
      } else {
        // Create new component using backend API
        const componentData = {
          kitId: editingKit.id, // Add kit_id to associate component with the kit
          componentName: values.componentName,
          componentType: values.componentType,
          description: values.description || '',
          quantityTotal: values.quantityTotal,
          quantityAvailable: values.quantityAvailable,
          pricePerCom: values.pricePerCom || 0,
          status: values.status,
          imageUrl: values.imageUrl || '',
          link: values.link || ''
        };

        const response = await kitComponentAPI.createComponent(componentData);

        // The backend returns the component data directly
        if (response && response.id) {
          console.log('Create component: Success, calling loadComponents()');
          // Refresh components from backend to get the latest data
          await loadComponents();

          // Close the form modal after successful creation
          setComponentFormVisible(false);
          setEditingComponent(null);

          notification.success({
            message: 'Success',
            description: 'Component created successfully',
            placement: 'topRight',
            duration: 4,
          });
        }
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to save component: ' + error.message,
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteComponent = async (componentId) => {
    try {
      const response = await kitComponentAPI.deleteComponent(componentId);
      console.log('Delete component response:', response);

      // The backend returns "Your KitComponent is Delete successfully" string
      if (response !== undefined && response !== null) {
        console.log('Delete component: Success, calling loadComponents()');
        // Refresh components from backend to get the latest data
        await loadComponents();

        notification.success({
          message: 'Success',
          description: 'Component deleted successfully',
          placement: 'topRight',
          duration: 4,
        });
      }
    } catch (error) {
      console.error('Error deleting component:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to delete component: ' + error.message,
        placement: 'topRight',
        duration: 4,
      });
    }
  };

  const saveComponents = () => {
    setKits(prev => prev.map(kit =>
      kit.id === editingKit.id ? { ...kit, components: components } : kit
    ));
    setComponentModalVisible(false);
    setEditingKit(null);
    setComponents([]);
  };

  const handleDeleteKit = async (kitId) => {
    Modal.confirm({
      title: 'Delete Kit',
      content: 'Are you sure you want to delete this kit? This action cannot be undone and will also delete all associated components.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          setLoading(true);
          await kitAPI.deleteKit(kitId);

          // Refresh kits from backend
          const updatedKitsResponse = await kitAPI.getAllKits();
          if (Array.isArray(updatedKitsResponse)) {
            setKits(updatedKitsResponse);
          }

          notification.success({
            message: 'Success',
            description: 'Kit deleted successfully',
            placement: 'topRight',
            duration: 4,
          });
        } catch (error) {
          console.error('Error deleting kit:', error);
          notification.error({
            message: 'Error',
            description: 'Failed to delete kit: ' + error.message,
            placement: 'topRight',
            duration: 4,
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingKit) {
        // Update existing kit using backend API
        const kitData = {
          kitName: values.name, // Map name back to kitName
          type: values.category, // Map category back to type
          quantityTotal: values.quantityTotal,
          quantityAvailable: values.quantityAvailable,
          status: values.status,
          description: values.description,
          imageUrl: values.imageUrl
        };

        console.log('Updating kit with data:', kitData);
        const response = await kitAPI.updateKit(editingKit.id, kitData);
        console.log('Update kit response:', response);

        if (response) {
          // Refresh kits from backend to get the latest data
          const updatedKitsResponse = await kitAPI.getAllKits();
          if (Array.isArray(updatedKitsResponse)) {
            setKits(updatedKitsResponse);
          }

          // Close modal and reset form
          setModalVisible(false);
          setEditingKit(null);
          form.resetFields();

          notification.success({
            message: 'Success',
            description: 'Kit updated successfully',
            placement: 'topRight',
            duration: 4,
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'Failed to update kit',
            placement: 'topRight',
            duration: 4,
          });
        }
      } else {
        // Create new kit using backend API
        const kitData = {
          kitName: values.name,
          type: values.category?.toUpperCase() || 'STUDENT_KIT',
          status: 'AVAILABLE',
          description: values.description || '',
          imageUrl: values.imageUrl || '',
          quantityTotal: values.quantityTotal || 1,
          quantityAvailable: values.quantityAvailable || values.quantityTotal || 1,
          components: values.components || []
        };

        const response = await kitAPI.createSingleKit(kitData);

        if (response.data) {
          const newKit = {
            id: response.data.id,
            ...response.data
          };
          setKits(prev => [...prev, newKit]);
          notification.success({
            message: 'Success',
            description: response.message || 'Kit created successfully',
            placement: 'topRight',
            duration: 4,
          });
        }
      }

      setModalVisible(false);
      setEditingKit(null);
      form.resetFields();
    } catch (error) {
      notification.error({
        message: 'Error',
        description: 'Failed to save kit: ' + error.message,
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
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
                  onClick={() => {
                    setEditingKit(null);
                    form.resetFields();
                    setModalVisible(true);
                  }}
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
          {/* Search and Filter Section */}
          <div style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="Search by name or ID..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  style={{
                    borderRadius: '8px',
                    height: 40
                  }}
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Filter by Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: '100%', borderRadius: '8px' }}
                >
                  <Option value="all">All Status</Option>
                  <Option value="AVAILABLE">Available</Option>
                  <Option value="IN_USE">In Use</Option>
                  <Option value="MAINTENANCE">Maintenance</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Filter by Type"
                  value={filterType}
                  onChange={setFilterType}
                  style={{ width: '100%', borderRadius: '8px' }}
                >
                  <Option value="all">All Types</Option>
                  <Option value="STUDENT_KIT">Student Kit</Option>
                  <Option value="LECTURER_KIT">Lecturer Kit</Option>
                </Select>
              </Col>
            </Row>
          </div>

          {/* Kit Catalog Grid */}
          {filteredKits.length === 0 ? (
            <Empty
              description="No kits found"
              style={{ padding: '60px 0' }}
            />
          ) : (
            <Row gutter={[24, 24]}>
              {filteredKits.map((kit) => (
                <Col xs={24} sm={12} md={8} lg={6} key={kit.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card
                      hoverable
                      style={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      cover={
                        <div
                          style={{
                            height: 200,
                            background: kit.imageUrl
                              ? `url(${kit.imageUrl}) center/cover`
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative'
                          }}
                        >
                          {!kit.imageUrl && (
                            <ToolOutlined style={{ fontSize: 64, color: '#fff', opacity: 0.8 }} />
                          )}
                          <div style={{
                            position: 'absolute',
                            top: 12,
                            right: 12
                          }}>
                            <Tag
                              color={kit.status === 'AVAILABLE' ? 'green' : kit.status === 'IN_USE' ? 'orange' : 'red'}
                              style={{
                                fontSize: '12px',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              {kit.status}
                            </Tag>
                          </div>
                        </div>
                      }
                      actions={[
                        <motion.div
                          key="edit"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => editKit(kit)}
                            style={{ color: '#1890ff' }}
                          >
                            Edit
                          </Button>
                        </motion.div>,
                        <motion.div
                          key="view"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => showKitDetails(kit)}
                            style={{ color: '#52c41a' }}
                          >
                            View
                          </Button>
                        </motion.div>,
                        <motion.div
                          key="delete"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Popconfirm
                            title="Delete this kit?"
                            onConfirm={() => handleDeleteKit(kit.id)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                            >
                              Delete
                            </Button>
                          </Popconfirm>
                        </motion.div>
                      ]}
                    >
                      <Card.Meta
                        title={
                          <Text
                            strong
                            style={{
                              fontSize: '18px',
                              cursor: 'pointer',
                              color: '#2c3e50'
                            }}
                            onClick={() => showKitDetails(kit)}
                          >
                            {kit.kitName || kit.name || 'Unnamed Kit'}
                          </Text>
                        }
                        description={
                          <div style={{ marginTop: 12 }}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              <div>
                                <Tag
                                  color={kit.type === 'LECTURER_KIT' ? 'red' : 'blue'}
                                  style={{
                                    fontSize: '12px',
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    marginBottom: 8
                                  }}
                                >
                                  {kit.type === 'LECTURER_KIT' ? 'Lecturer Kit' : 'Student Kit'}
                                </Tag>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                  <strong>Total:</strong> {kit.quantityTotal || 0}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                  <strong>Available:</strong> {kit.quantityAvailable || 0}
                                </Text>
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                  <strong>Components:</strong> {kit.components?.length || 0}
                                </Text>
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => manageComponents(kit)}
                                  style={{
                                    padding: 0,
                                    height: 'auto',
                                    fontSize: '12px',
                                    marginLeft: 4
                                  }}
                                >
                                  Manage
                                </Button>
                              </div>
                            </Space>
                          </div>
                        }
                      />
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}

          {/* Pagination */}
          {filteredKits.length > 0 && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Text type="secondary">
                Showing {filteredKits.length} of {kits.length} kit(s)
              </Text>
            </div>
          )}
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
          <Form.Item name="category" label="Kit Type" rules={[{ required: true }]}>
            <Select>
              <Option value="STUDENT_KIT">Student Kit</Option>
              <Option value="LECTURER_KIT">Lecturer Kit</Option>
            </Select>
          </Form.Item>
          <Form.Item name="quantityTotal" label="Total Quantity" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="quantityAvailable" label="Available Quantity" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Option value="AVAILABLE">Available</Option>
              <Option value="IN_USE">In Use</Option>
              <Option value="MAINTENANCE">Maintenance</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="imageUrl" label="Image URL">
            <Input />
          </Form.Item>
          {!editingKit && (
            <Form.Item label="Import Kit Components">
              <Upload
                accept=".xlsx,.xls"
                showUploadList={false}
                beforeUpload={(file) => {
                  const formValues = form.getFieldsValue();
                  if (!formValues.name || !formValues.category || !formValues.quantityTotal) {
                    notification.error({
                      message: 'Error',
                      description: 'Please fill in Kit Name, Kit Type, and Total Quantity first before importing components',
                      placement: 'topRight',
                      duration: 5,
                    });
                    return false;
                  }
                  showSheetSelectionAndImport(file, 'components', { formValues });
                  return false;
                }}
              >
                <Button
                  icon={<ImportOutlined />}
                  block
                  style={{
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                    border: 'none',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}
                >
                  Import Components from Excel
                </Button>
              </Upload>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                Excel format: index, name, link, quantity, priceperComp, image_url. Kit will be created first, then components will be imported.
              </Text>
            </Form.Item>
          )}
          {editingKit && (
            <Form.Item label="Import Kit Components">
              <Upload
                accept=".xlsx,.xls"
                showUploadList={false}
                beforeUpload={(file) => {
                  if (!editingKit || !editingKit.id) {
                    notification.error({
                      message: 'Error',
                      description: 'Please select a kit first',
                      placement: 'topRight',
                    });
                    return false;
                  }
                  showSheetSelectionAndImport(file, 'components', { kitId: editingKit.id });
                  return false;
                }}
              >
                <Button
                  icon={<ImportOutlined />}
                  block
                  style={{
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    border: 'none',
                    fontWeight: 'bold',
                    color: '#fff'
                  }}
                >
                  Import Components from Excel
                </Button>
              </Upload>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                Excel format: index, name, link, quantity, priceperComp, image_url
              </Text>
            </Form.Item>
          )}
          <Form.Item>
            <Space>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button type="primary" htmlType="submit">
                  {editingKit ? 'Update' : 'Create Kit'}
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

      {/* Sheet Selection Modal */}
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
          <Button key="back" type="primary" onClick={saveComponents}>
            Back
          </Button>
        ]}
        width={800}
        centered
        destroyOnClose
        maskClosable={false}
        style={{ top: 20 }}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
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
            <Upload
              accept=".xlsx,.xls"
              showUploadList={false}
              beforeUpload={(file) => {
                if (!editingKit || !editingKit.id) {
                  notification.error({
                    message: 'Error',
                    description: 'Please select a kit first',
                    placement: 'topRight',
                  });
                  return false;
                }
                showSheetSelectionAndImport(file, 'components', { kitId: editingKit.id });
                return false;
              }}
            >
              <Button
                icon={<ImportOutlined />}
                style={{
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                  fontWeight: 'bold',
                  color: '#fff'
                }}
              >
                Import Components
              </Button>
            </Upload>
          </Space>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 8 }}>
            Excel format: index, name, link, quantity
          </Text>
        </div>

        <Table
          dataSource={components}
          columns={[
            { title: 'Component Name', dataIndex: 'componentName', key: 'componentName' },
            { title: 'Type', dataIndex: 'componentType', key: 'componentType' },
            {
              title: 'Link',
              dataIndex: 'link',
              key: 'link',
              render: (link) => link ? (
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {link.length > 30 ? link.substring(0, 30) + '...' : link}
                </a>
              ) : '-'
            },
            { title: 'Total Quantity', dataIndex: 'quantityTotal', key: 'quantityTotal' },
            { title: 'Available Quantity', dataIndex: 'quantityAvailable', key: 'quantityAvailable' },
            {
              title: 'Price (VND)',
              dataIndex: 'pricePerCom',
              key: 'pricePerCom',
              render: (price) => price ? price.toLocaleString() : '0'
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => (
                <Tag color={status === 'AVAILABLE' ? 'green' : status === 'IN_USE' ? 'orange' : status === 'MAINTENANCE' ? 'blue' : 'red'}>
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
          title={editingComponent && editingComponent.id ? 'Edit Component' : 'Add Component'}
          open={componentFormVisible}
          onCancel={() => {
            setEditingComponent(null);
            setComponentFormVisible(false);
          }}
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
              name="componentName"
              label="Component Name"
              rules={[{ required: true, message: 'Please enter component name' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="componentType"
              label="Component Type"
              rules={[{ required: true, message: 'Please select component type' }]}
            >
              <Select>
                <Option value="RED">Red</Option>
                <Option value="BLACK">Black</Option>
                <Option value="WHITE">White</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="quantityTotal"
              label="Total Quantity"
              rules={[{ required: true, message: 'Please enter total quantity' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="quantityAvailable"
              label="Available Quantity"
              rules={[{ required: true, message: 'Please enter available quantity' }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="pricePerCom"
              label="Price Per Component (VND)"
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select>
                <Option value="AVAILABLE">Available</Option>
                <Option value="IN_USE">In Use</Option>
                <Option value="MAINTENANCE">Maintenance</Option>
                <Option value="DAMAGED">Damaged</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item
              name="imageUrl"
              label="Image URL"
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="link"
              label="Link"
              help="Optional: Add a link to the component (e.g., product page, documentation)"
            >
              <Input placeholder="https://..." />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingComponent ? 'Update' : 'Add'}
                </Button>
                <Button onClick={() => {
                  setEditingComponent(null);
                  form.resetFields();
                  setComponentFormVisible(false);
                }}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Modal>

      {/* Sheet Selection Modal */}
      <Modal
        title="Select Sheet to Import"
        open={sheetSelectionModal.visible}
        onOk={() => {
          if (sheetSelectionModal.selectedSheet) {
            proceedWithImport(
              sheetSelectionModal.file,
              sheetSelectionModal.selectedSheet,
              sheetSelectionModal.importType,
              sheetSelectionModal.importData
            );
          }
          setSheetSelectionModal({ visible: false, sheets: [], selectedSheet: null, file: null, importType: null, importData: null });
        }}
        onCancel={() => {
          setSheetSelectionModal({ visible: false, sheets: [], selectedSheet: null, file: null, importType: null, importData: null });
        }}
        okText="Import"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Please select which sheet to import from:</Text>
        </div>
        <Select
          style={{ width: '100%' }}
          value={sheetSelectionModal.selectedSheet}
          onChange={(value) => {
            setSheetSelectionModal(prev => ({ ...prev, selectedSheet: value }));
          }}
        >
          {sheetSelectionModal.sheets.map((sheetName) => (
            <Select.Option key={sheetName} value={sheetName}>
              {sheetName}
            </Select.Option>
          ))}
        </Select>
        <div style={{ marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Found {sheetSelectionModal.sheets.length} sheet(s) in the Excel file
          </Text>
        </div>
      </Modal>

      {/* Kit Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Kit Details</span>
          </div>
        }
        open={kitDetailsModal.visible}
        onCancel={() => {
          setKitDetailsModal({ visible: false, kit: null });
          setComponentPage(1);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setKitDetailsModal({ visible: false, kit: null });
              setComponentPage(1);
            }}
            style={{
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              color: '#fff'
            }}
          >
            Close
          </Button>
        ]}
        width={900}
        centered
        destroyOnClose
      >
        {renderKitDetailsContent()}
      </Modal>
    </div>
  );
};

// Global Kit Component Management (components with no specific kit)
const KitComponentManagement = () => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingComponent, setEditingComponent] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Local animation variants for cards
  const localCardVariants = {
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

  // Load all components (including those with kitId = null)
  const loadComponents = async () => {
    setLoading(true);
    try {
      const response = await kitComponentAPI.getAllComponents();
      const data = Array.isArray(response) ? response : (response?.data || []);
      setComponents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading components:', error);
      setComponents([]);
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to load components',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComponents();
  }, []);

  const handleAddClick = () => {
    setEditingComponent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditClick = (component) => {
    const mapped = {
      id: component.id,
      componentName: component.componentName || component.name,
      componentType: component.componentType || component.type,
      description: component.description,
      quantityTotal: component.quantityTotal,
      quantityAvailable: component.quantityAvailable,
      pricePerCom: component.pricePerCom,
      status: component.status,
      imageUrl: component.imageUrl,
      link: component.link,
    };
    setEditingComponent(mapped);
    form.setFieldsValue(mapped);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await kitComponentAPI.deleteComponent(id);
      notification.success({
        message: 'Success',
        description: 'Component deleted successfully',
        placement: 'topRight',
      });
      await loadComponents();
    } catch (error) {
      console.error('Error deleting component:', error);
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to delete component',
        placement: 'topRight',
      });
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        kitId: null, // Components in this tab are not linked to any kit
        componentName: values.componentName,
        componentType: values.componentType,
        description: values.description || '',
        quantityTotal: values.quantityAvailable, // use available as total for global components
        quantityAvailable: values.quantityAvailable,
        pricePerCom: values.pricePerCom || 0,
        status: values.status,
        imageUrl: values.imageUrl || '',
        link: values.link || '',
      };

      if (editingComponent && editingComponent.id) {
        await kitComponentAPI.updateComponent(editingComponent.id, payload);
        notification.success({
          message: 'Success',
          description: 'Component updated successfully',
          placement: 'topRight',
        });
      } else {
        await kitComponentAPI.createComponent(payload);
        notification.success({
          message: 'Success',
          description: 'Component created successfully',
          placement: 'topRight',
        });
      }

      setModalVisible(false);
      setEditingComponent(null);
      form.resetFields();
      await loadComponents();
    } catch (error) {
      console.error('Error saving component:', error);
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to save component',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportComponents = async (file) => {
    try {
      const response = await kitComponentAPI.importComponents(file, null);

      let messageText = 'Import completed';
      let successCount = 0;
      let errorCount = 0;
      let isSuccess = true;
      let errors = [];

      if (typeof response === 'string') {
        messageText = response;
        isSuccess = false;
      } else if (response) {
        messageText = response.message || 'Import completed';
        successCount = response.successCount || 0;
        errorCount = response.errorCount || 0;
        isSuccess = response.success !== false;
        if (Array.isArray(response.errors)) {
          errors = response.errors;
        }
      }

      if (successCount === 0 && errorCount > 0) {
        isSuccess = false;
      }

      let errorDetails = '';
      if (errors.length > 0) {
        const errorList = errors.slice(0, 5).join('; ');
        errorDetails =
          errors.length > 5
            ? `${errorList}; ... and ${errors.length - 5} more error(s)`
            : errorList;
      }

      if (isSuccess && successCount > 0) {
        notification.success({
          message: 'Import Successful',
          description: `Successfully imported ${successCount} component(s). ${errorCount > 0 ? `${errorCount} error(s) occurred.` : ''
            }`,
          placement: 'topRight',
          duration: 5,
        });
      } else if (successCount > 0 && errorCount > 0) {
        notification.warning({
          message: 'Import Completed with Errors',
          description: `${messageText}${errorDetails ? ` Errors: ${errorDetails}` : ''}`,
          placement: 'topRight',
          duration: 8,
        });
      } else {
        notification.error({
          message: 'Import Failed',
          description: `${messageText}${errorDetails ? ` Errors: ${errorDetails}` : ''}`,
          placement: 'topRight',
          duration: 8,
        });
      }

      await loadComponents();
    } catch (error) {
      console.error('Import error:', error);
      notification.error({
        message: 'Import Failed',
        description: error.message || 'Failed to import components. Please check file format.',
        placement: 'topRight',
        duration: 5,
      });
    }
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (url) =>
        url ? (
          <img
            src={url}
            alt="component"
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <Text type="secondary">No image</Text>
        ),
    },
    {
      title: 'Component Name',
      dataIndex: 'componentName',
      key: 'componentName',
    },
    {
      title: 'Type',
      dataIndex: 'componentType',
      key: 'componentType',
    },
    {
      title: 'Kit ID',
      dataIndex: 'kitId',
      key: 'kitId',
      render: (kitId) => (kitId ? kitId : <Text type="secondary">null</Text>),
    },
    {
      title: 'Available Quantity',
      dataIndex: 'quantityAvailable',
      key: 'quantityAvailable',
    },
    {
      title: 'Price (VND)',
      dataIndex: 'pricePerCom',
      key: 'pricePerCom',
      render: (price) => (price ? price.toLocaleString() : '0'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag
          color={
            status === 'AVAILABLE'
              ? 'green'
              : status === 'IN_USE'
                ? 'orange'
                : status === 'MAINTENANCE'
                  ? 'blue'
                  : 'red'
          }
        >
          {status}
        </Tag>
      ),
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
            onClick={() => handleEditClick(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this component?"
            onConfirm={() => handleDelete(record.id)}
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
      ),
    },
  ];

  // Build filter options from components (only global components with kitId = null)
  const globalComponents = components.filter((component) => !component.kitId);

  const uniqueStatuses = Array.from(
    new Set(
      globalComponents
        .map((c) => c.status)
        .filter((value) => value && value !== '')
    )
  );

  const uniqueTypes = Array.from(
    new Set(
      globalComponents
        .map((c) => c.componentType)
        .filter((value) => value && value !== '')
    )
  );

  // Filter components for display
  const filteredComponents = globalComponents.filter((component) => {
    if ((component.quantityAvailable || 0) <= 0) {
      return false;
    }

    if (searchText && searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase();
      const name = (component.componentName || component.name || '').toLowerCase();
      const id = (component.id || '').toString().toLowerCase();
      if (!name.includes(searchLower) && !id.includes(searchLower)) {
        return false;
      }
    }

    if (filterStatus !== 'all' && component.status !== filterStatus) {
      return false;
    }

    if (filterType !== 'all' && component.componentType !== filterType) {
      return false;
    }

    return true;
  });

  return (
    <motion.div
      variants={localCardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      <Card
        title="Kit Component Management"
        style={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          overflow: 'hidden',
        }}
        headStyle={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
        }}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddClick}
            >
              Add Component
            </Button>
            <Popover
              placement="bottomRight"
              trigger="click"
              content={
                <div style={{ maxWidth: 320 }}>
                  <Text strong>Import Components Guide</Text>
                  <div style={{ marginTop: 8 }}>
                    <div>Excel file should contain the following columns (header names):</div>
                    <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
                      <li><b>name</b>: component name</li>
                      <li><b>link</b>: optional URL for the component</li>
                      <li><b>quantity</b>: total quantity</li>
                      <li><b>priceperComp</b>: price per component (number)</li>
                      <li><b>image_url</b>: optional image URL</li>
                    </ul>
                    <div style={{ marginTop: 8 }}>
                      Components imported from this tab will have <b>kitId = null</b> and are not linked to any specific kit.
                    </div>
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Upload
                      accept=".xlsx,.xls"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        handleImportComponents(file);
                        return false;
                      }}
                    >
                      <Button
                        type="primary"
                        icon={<ImportOutlined />}
                        block
                        style={{ marginTop: 4 }}
                      >
                        Choose File & Import
                      </Button>
                    </Upload>
                  </div>
                </div>
              }
            >
              <Button icon={<ImportOutlined />}>
                Import Components
              </Button>
            </Popover>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => {
                const templateData = [
                  {
                    name: 'Resistor 220Ω',
                    link: 'https://example.com/resistor-220',
                    quantity: 100,
                    priceperComp: 1000,
                    image_url: 'https://example.com/resistor-220.png',
                  },
                ];

                // Local export helper for this component
                const ws = XLSX.utils.json_to_sheet(templateData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const dataBlob = new Blob([excelBuffer], {
                  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                saveAs(dataBlob, 'kit_components_template.xlsx');

                notification.success({
                  message: 'Template Downloaded',
                  description: 'Kit component import template has been downloaded.',
                  placement: 'topRight',
                });
              }}
            >
              Download Template
            </Button>
          </Space>
        }
      >
        {/* Search & Filter */}
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search by component name or ID..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{
                  borderRadius: '8px',
                  height: 40,
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by Status"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: '100%', borderRadius: '8px' }}
              >
                <Option value="all">All Status</Option>
                {uniqueStatuses.map((status) => (
                  <Option key={status} value={status}>
                    {status}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by Type"
                value={filterType}
                onChange={setFilterType}
                style={{ width: '100%', borderRadius: '8px' }}
              >
                <Option value="all">All Types</Option>
                {uniqueTypes.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        <Spin spinning={loading}>
          {filteredComponents.length === 0 ? (
            <Empty
              description="No global components found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ padding: '60px 0' }}
            />
          ) : (
            <Row gutter={[24, 24]}>
              {filteredComponents.map((component) => (
                <Col xs={24} sm={12} md={8} lg={6} key={component.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -8 }}
                  >
                    <Card
                      hoverable
                      style={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      cover={
                        <div
                          style={{
                            height: 200,
                            background: component.imageUrl
                              ? `url(${component.imageUrl}) center/cover`
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                          }}
                        >
                          {!component.imageUrl && (
                            <BuildOutlined
                              style={{
                                fontSize: 48,
                                color: '#fff',
                                opacity: 0.8,
                              }}
                            />
                          )}
                          <div
                            style={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              gap: 8,
                            }}
                          >
                            <Tag
                              color={
                                component.status === 'AVAILABLE'
                                  ? 'green'
                                  : component.status === 'IN_USE'
                                    ? 'orange'
                                    : component.status === 'MAINTENANCE'
                                      ? 'blue'
                                      : 'red'
                              }
                              style={{
                                fontSize: '12px',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                              }}
                            >
                              {component.status}
                            </Tag>
                            <Tag
                              color="default"
                              style={{
                                fontSize: '11px',
                                padding: '2px 10px',
                                borderRadius: '12px',
                              }}
                            >
                              Global Component
                            </Tag>
                          </div>
                        </div>
                      }
                    >
                      <Card.Meta
                        title={
                          <Text
                            strong
                            style={{
                              fontSize: '16px',
                              color: '#2c3e50',
                              display: 'block',
                              marginBottom: 8,
                            }}
                          >
                            {component.componentName || component.name || 'Unnamed Component'}
                          </Text>
                        }
                        description={
                          <div style={{ marginTop: 8 }}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              <div>
                                {component.componentType && (
                                  <Tag
                                    color="purple"
                                    style={{
                                      fontSize: '12px',
                                      padding: '4px 12px',
                                      borderRadius: '12px',
                                      marginBottom: 8,
                                    }}
                                  >
                                    {component.componentType || 'N/A'}
                                  </Tag>
                                )}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                              >
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                  <strong>Total:</strong>{' '}
                                  {component.quantityTotal || component.quantity || 0}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                  <strong>Available:</strong>{' '}
                                  {component.quantityAvailable || 0}
                                </Text>
                              </div>
                              <div style={{ marginTop: 4 }}>
                                <Text
                                  strong
                                  style={{ color: '#1890ff', fontSize: '14px' }}
                                >
                                  Price:{' '}
                                  {component.pricePerCom
                                    ? Number(component.pricePerCom).toLocaleString()
                                    : 0}{' '}
                                  VND
                                </Text>
                              </div>
                              {component.condition && (
                                <div style={{ marginTop: 4 }}>
                                  <Tag
                                    color={
                                      component.condition === 'New'
                                        ? 'green'
                                        : component.condition === 'Used'
                                          ? 'orange'
                                          : 'red'
                                    }
                                    style={{
                                      fontSize: '12px',
                                      padding: '4px 12px',
                                      borderRadius: '12px',
                                    }}
                                  >
                                    {component.condition}
                                  </Tag>
                                </div>
                              )}
                              {component.link && (
                                <div style={{ marginTop: 4 }}>
                                  <Button
                                    type="link"
                                    size="small"
                                    onClick={() => window.open(component.link, '_blank')}
                                    style={{ padding: 0, fontSize: '12px' }}
                                  >
                                    View Link →
                                  </Button>
                                </div>
                              )}
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                  gap: 8,
                                  marginTop: 8,
                                }}
                              >
                                <Button
                                  type="default"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEditClick(component)}
                                >
                                  Edit
                                </Button>
                                <Popconfirm
                                  title="Are you sure you want to delete this component?"
                                  onConfirm={() => handleDelete(component.id)}
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
                              </div>
                            </Space>
                          </div>
                        }
                      />
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </Spin>
      </Card>

      <Modal
        title={editingComponent && editingComponent.id ? 'Edit Component' : 'Add Component'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingComponent(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
        centered
        destroyOnClose
        maskClosable={false}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          initialValues={editingComponent || {}}
        >
          <Form.Item
            name="componentName"
            label="Component Name"
            rules={[{ required: true, message: 'Please enter component name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="componentType"
            label="Component Type"
            rules={[{ required: true, message: 'Please select component type' }]}
          >
            <Select>
              <Option value="RED">Red</Option>
              <Option value="BLACK">Black</Option>
              <Option value="WHITE">White</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="quantityAvailable"
            label="Available Quantity"
            rules={[{ required: true, message: 'Please enter available quantity' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="pricePerCom"
            label="Price Per Component (VND)"
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select>
              <Option value="AVAILABLE">Available</Option>
              <Option value="IN_USE">In Use</Option>
              <Option value="MAINTENANCE">Maintenance</Option>
              <Option value="DAMAGED">Damaged</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="Image URL"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="link"
            label="Link"
            help="Optional: Add a link to the component (e.g., product page, documentation)"
          >
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingComponent ? 'Update' : 'Add'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  setEditingComponent(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

// Rental Approvals Component
const RentalApprovals = ({ rentalRequests, setRentalRequests, setLogHistory, setTransactions, setRefundRequests, onNavigateToRefunds }) => {
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const rentalRequestSubscriptionRef = useRef(null);
  const columns = [
    {
      title: 'Email',
      dataIndex: 'userEmail',
      key: 'userEmail',
      render: (email, record) => email || record.requestedBy?.email || 'N/A'
    },
    {
      title: 'Kit',
      dataIndex: 'kit',
      key: 'kit',
      render: (kit) => kit?.kitName || 'N/A'
    },
    {
      title: 'Request Type',
      dataIndex: 'requestType',
      key: 'requestType'
    },
    {
      title: 'Deposit Amount',
      dataIndex: 'depositAmount',
      key: 'depositAmount',
      render: (amount) => `${(amount || 0).toLocaleString()} VND`
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
                  <Option value="PENDING">Pending</Option>
                  <Option value="APPROVED">Approved</Option>
                  <Option value="REJECTED">Rejected</Option>
                  <Option value="BORROWED">Borrowed</Option>
                  <Option value="RETURNED">Returned</Option>
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
                    status === 'PENDING' ? 'orange' :
                      status === 'APPROVED' ? 'green' :
                        status === 'REJECTED' ? 'red' :
                          status === 'BORROWED' ? 'blue' :
                            status === 'RETURNED' ? 'green' : 'default'
                  }
                  style={{ minWidth: 80, textAlign: 'center' }}
                >
                  {status || 'PENDING'}
                </Tag>
              </>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Details',
      key: 'details',
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'PENDING' ? (
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

  const handleShowDetails = (record) => {
    setSelectedRequestDetails(record);
    setDetailsModalVisible(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalVisible(false);
    setSelectedRequestDetails(null);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const rentalResponse = await borrowingRequestAPI.getAll();
      console.log('Refreshed rental requests response:', rentalResponse);

      // Helper function to sort rental requests by createdAt desc
      const sortRentalRequestsByCreatedAt = (requests) => {
        return [...requests].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA; // Descending order (newest first)
        });
      };

      if (Array.isArray(rentalResponse)) {
        const sortedRequests = sortRentalRequestsByCreatedAt(rentalResponse);
        setRentalRequests(sortedRequests);
        console.log('Rental requests refreshed successfully:', sortedRequests.length);
        message.success(`Refreshed ${sortedRequests.length} rental requests`);
      } else if (rentalResponse && rentalResponse.data && Array.isArray(rentalResponse.data)) {
        const sortedRequests = sortRentalRequestsByCreatedAt(rentalResponse.data);
        setRentalRequests(sortedRequests);
        console.log('Rental requests refreshed successfully:', sortedRequests.length);
        message.success(`Refreshed ${sortedRequests.length} rental requests`);
      } else {
        setRentalRequests([]);
        message.warning('No rental requests found');
      }
    } catch (error) {
      console.error('Error refreshing rental requests:', error);
      message.error('Failed to refresh rental requests: ' + (error.message || 'Unknown error'));
    } finally {
      setRefreshing(false);
    }
  };

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
      setRentalRequests(prev => {
        const updated = prev.map(req =>
          req.id === id ? {
            ...req,
            status: newStatus,
            updatedBy: 'admin@fpt.edu.vn',
            updatedDate: new Date().toISOString()
          } : req
        );
        // Sort by createdAt desc
        return updated.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA; // Descending order (newest first)
        });
      });

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
    try {
      const request = rentalRequests.find(req => req.id === id);

      // Determine the status based on action
      const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

      // Prepare request body for update
      const updateData = {
        status: newStatus,
        note: action === 'reject' ? 'Request rejected by admin' : 'Request approved by admin'
      };

      // Call API to update the borrowing request
      await borrowingRequestAPI.update(id, updateData);

      // When approved, immediately move record from rental requests to refund requests
      if (action === 'approve') {
        // Remove from rental requests immediately
        setRentalRequests(prev => {
          const filtered = prev.filter(req => req.id !== id);
          // Sort by createdAt desc
          return filtered.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA; // Descending order (newest first)
          });
        });

        // Add to refund requests immediately
        const approvedDate = new Date().toISOString();
        const newRefundRequest = {
          id: request.id,
          rentalId: request.id,
          kitId: request.kit?.id || 'N/A',
          kitName: request.kit?.kitName || 'N/A',
          userEmail: request.requestedBy?.email || 'N/A',
          userName: request.requestedBy?.fullName || 'N/A',
          status: 'pending',
          requestDate: request.createdAt || approvedDate,
          approvedDate: approvedDate,
          totalCost: request.depositAmount || 0,
          damageAssessment: {},
          reason: request.reason || 'Course project',
          depositAmount: request.depositAmount || 0,
          requestType: request.requestType || 'BORROW_KIT'
        };

        setRefundRequests(prev => {
          // Check if already exists to avoid duplicates
          const exists = prev.find(req => req.id === id);
          if (exists) {
            return prev.map(req => req.id === id ? newRefundRequest : req);
          }
          // Add new refund request at the beginning
          return [newRefundRequest, ...prev];
        });
      } else {
        // For reject, update status in rental requests
        setRentalRequests(prev => {
          const updated = prev.map(req =>
            req.id === id ? {
              ...req,
              status: newStatus,
              note: updateData.note
            } : req
          );
          // Sort by createdAt desc
          return updated.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA; // Descending order (newest first)
          });
        });
      }

      // Reload transaction history when approved
      if (action === 'approve') {
        try {
          await notificationAPI.createNotifications([
            {
              subType: 'RENTAL_SUCCESS',
              title: 'Yêu cầu thuê kit được chấp nhận',
              message: `Yêu cầu thuê kit ${request?.kit?.kitName || ''} của bạn đã được admin phê duyệt.`,
              userId: request?.requestedBy?.id
            }
          ]);
        } catch (notifyError) {
          console.error('Error sending approval notifications:', notifyError);
        }
        try {
          const transactionsResponse = await walletTransactionAPI.getAll();
          if (Array.isArray(transactionsResponse)) {
            setTransactions(transactionsResponse);
            console.log('Transaction history reloaded');
          }
        } catch (error) {
          console.error('Error reloading transactions:', error);
        }
      }

      // Add to log history when rejected
      if (action === 'reject') {
        const logEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          action: 'RENTAL_REQUEST_REJECTED',
          type: 'rental',
          user: request.requestedBy?.email || 'N/A',
          userName: request.requestedBy?.fullName || 'N/A',
          details: {
            kitName: request.kit?.kitName || 'N/A',
            kitId: request.kit?.id || 'N/A',
            requestId: request.id,
            reason: request.reason || 'Course project',
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

        // Send rejection notification to user
        try {
          await notificationAPI.createNotifications([
            {
              subType: 'RENTAL_REJECTED',
              title: 'Yêu cầu thuê kit bị từ chối',
              message: `Yêu cầu thuê kit ${request?.kit?.kitName || ''} của bạn đã bị admin từ chối.`,
              userId: request?.requestedBy?.id
            }
          ]);
        } catch (notifyError) {
          console.error('Error sending rejection notification:', notifyError);
        }
      }

      // When approved, refresh refund requests from backend to ensure sync
      if (action === 'approve') {
        // Reload approved requests from backend to ensure data consistency
        try {
          const approvedResponse = await borrowingRequestAPI.getApproved();
          console.log('Refreshed approved requests:', approvedResponse);

          if (Array.isArray(approvedResponse)) {
            // Transform approved requests to refund request format
            const refundRequestsData = approvedResponse.map(req => ({
              id: req.id,
              rentalId: req.id,
              kitId: req.kit?.id || 'N/A',
              kitName: req.kit?.kitName || 'N/A',
              userEmail: req.requestedBy?.email || 'N/A',
              userName: req.requestedBy?.fullName || 'N/A',
              status: 'pending',
              requestDate: req.createdAt || req.approvedDate || null,
              approvedDate: req.approvedDate || null,
              totalCost: req.depositAmount || 0,
              damageAssessment: {},
              reason: req.reason || 'Course project',
              depositAmount: req.depositAmount || 0,
              requestType: req.requestType || 'BORROW_KIT'
            }));

            // Update refund requests with backend data to ensure consistency
            setRefundRequests(refundRequestsData);
            console.log('Refund requests synced from backend:', refundRequestsData.length);
          }
        } catch (refreshError) {
          console.error('Error refreshing approved requests:', refreshError);
        }
      }

      notification.success({
        message: action === 'approve' ? 'Request Approved' : 'Request Rejected',
        description: action === 'approve'
          ? 'Request approved successfully!'
          : 'Request rejected successfully',
        placement: 'topRight',
        duration: 4,
      });
    } catch (error) {
      console.error('Error updating request:', error);
      notification.error({
        message: 'Error',
        description: `Failed to ${action === 'approve' ? 'approve' : 'reject'} request: ${error.message}`,
        placement: 'topRight',
        duration: 5,
      });
    }
  };

  // Real-time WebSocket subscription for rental requests
  useEffect(() => {
    // Connect to WebSocket and subscribe to admin rental request updates
    webSocketService.connect(
      () => {
        console.log('WebSocket connected for admin rental requests');
        // Subscribe to new rental requests
        rentalRequestSubscriptionRef.current = webSocketService.subscribeToAdminRentalRequests((data) => {
          console.log('Received new rental request via WebSocket:', data);

          // Update the rental requests list
          setRentalRequests(prev => {
            // Check if request already exists
            const exists = prev.find(req => req.id === data.id);
            let updated;
            if (exists) {
              // Update existing request
              updated = prev.map(req => req.id === data.id ? data : req);
            } else {
              // Add new request if status is PENDING
              if (data.status === 'PENDING') {
                // Show notification
                notification.info({
                  message: 'New Rental Request',
                  description: `New rental request from ${data.requestedBy?.fullName || data.requestedBy?.email || 'User'}`,
                  placement: 'topRight',
                  duration: 5,
                });
                // Add new request
                updated = [data, ...prev];
              } else {
                return prev;
              }
            }
            // Sort by createdAt desc
            return updated.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
              const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
              return dateB - dateA; // Descending order (newest first)
            });
          });
        });
      },
      (error) => {
        console.error('WebSocket connection error:', error);
      }
    );

    // Cleanup on unmount
    return () => {
      if (rentalRequestSubscriptionRef.current) {
        webSocketService.unsubscribe(rentalRequestSubscriptionRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title="Rental Request Management"
        extra={
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={refreshing}
              style={{
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                background: 'rgba(255,255,255,0.1)'
              }}
            >
              Refresh
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
          dataSource={rentalRequests}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
        />
      </Card>

      {/* Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <InfoCircleOutlined style={{ fontSize: '20px', color: '#667eea' }} />
            <span>Rental Request Details</span>
          </div>
        }
        open={detailsModalVisible}
        onCancel={handleCloseDetails}
        footer={[
          <Button key="close" onClick={handleCloseDetails}>
            Close
          </Button>
        ]}
        width={800}
        centered
        destroyOnClose
      >
        {selectedRequestDetails && (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Request ID">
                <Text code>{selectedRequestDetails.id || 'N/A'}</Text>
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedRequestDetails.status === 'PENDING' ? 'orange' :
                      selectedRequestDetails.status === 'APPROVED' ? 'green' :
                        selectedRequestDetails.status === 'REJECTED' ? 'red' :
                          selectedRequestDetails.status === 'BORROWED' ? 'blue' :
                            selectedRequestDetails.status === 'RETURNED' ? 'green' : 'default'
                  }
                >
                  {selectedRequestDetails.status || 'PENDING'}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Request Type">
                <Tag color={selectedRequestDetails.requestType === 'BORROW_COMPONENT' ? 'orange' : 'blue'}>
                  {selectedRequestDetails.requestType || 'BORROW_KIT'}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="User Information">
                <div>
                  <div><strong>Name:</strong> {selectedRequestDetails.requestedBy?.fullName || 'N/A'}</div>
                  <div><strong>Email:</strong> {selectedRequestDetails.requestedBy?.email || 'N/A'}</div>
                  {selectedRequestDetails.requestedBy?.phone && (
                    <div><strong>Phone:</strong> {selectedRequestDetails.requestedBy?.phone}</div>
                  )}
                  {selectedRequestDetails.requestedBy?.studentCode && (
                    <div><strong>Student Code:</strong> {selectedRequestDetails.requestedBy?.studentCode}</div>
                  )}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Kit Information">
                <div>
                  <div><strong>Kit Name:</strong> {selectedRequestDetails.kit?.kitName || 'N/A'}</div>
                  {selectedRequestDetails.kit?.id && (
                    <div><strong>Kit ID:</strong> <Text code>{selectedRequestDetails.kit.id}</Text></div>
                  )}
                  {selectedRequestDetails.kit?.type && (
                    <div><strong>Kit Type:</strong> {selectedRequestDetails.kit.type}</div>
                  )}
                  {selectedRequestDetails.kit?.description && (
                    <div><strong>Description:</strong> {selectedRequestDetails.kit.description}</div>
                  )}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Financial Information">
                <div>
                  <div><strong>Deposit Amount:</strong> {formatCurrency(selectedRequestDetails.depositAmount || 0)}</div>
                  {selectedRequestDetails.totalCost && (
                    <div><strong>Total Cost:</strong> {formatCurrency(selectedRequestDetails.totalCost)}</div>
                  )}
                </div>
              </Descriptions.Item>

              <Descriptions.Item label="Dates">
                <div>
                  <div><strong>Created At:</strong> {formatDateTime(selectedRequestDetails.createdAt)}</div>
                  {selectedRequestDetails.expectReturnDate && (
                    <div><strong>Expected Return Date:</strong> {formatDateTime(selectedRequestDetails.expectReturnDate)}</div>
                  )}
                  {selectedRequestDetails.approvedDate && (
                    <div><strong>Approved Date:</strong> {formatDateTime(selectedRequestDetails.approvedDate)}</div>
                  )}
                  {selectedRequestDetails.actualReturnDate && (
                    <div><strong>Actual Return Date:</strong> {formatDateTime(selectedRequestDetails.actualReturnDate)}</div>
                  )}
                </div>
              </Descriptions.Item>

              {selectedRequestDetails.reason && (
                <Descriptions.Item label="Reason">
                  {selectedRequestDetails.reason}
                </Descriptions.Item>
              )}

              {selectedRequestDetails.note && (
                <Descriptions.Item label="Note">
                  {selectedRequestDetails.note}
                </Descriptions.Item>
              )}

              {selectedRequestDetails.requestedBy?.group && (
                <Descriptions.Item label="Group Information">
                  <div>
                    <div><strong>Group Name:</strong> {selectedRequestDetails.requestedBy.group.groupName || 'N/A'}</div>
                    {selectedRequestDetails.requestedBy.group.lecturer && (
                      <div><strong>Lecturer:</strong> {selectedRequestDetails.requestedBy.group.lecturer.fullName || selectedRequestDetails.requestedBy.group.lecturer.email || 'N/A'}</div>
                    )}
                  </div>
                </Descriptions.Item>
              )}

              {selectedRequestDetails.components && selectedRequestDetails.components.length > 0 && (
                <Descriptions.Item label="Components">
                  <List
                    size="small"
                    dataSource={selectedRequestDetails.components}
                    renderItem={(component) => (
                      <List.Item>
                        <div>
                          <div><strong>{component.componentName || component.name || 'N/A'}</strong></div>
                          {component.quantity && (
                            <div>Quantity: {component.quantity}</div>
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

// Refund Approvals Component
const RefundApprovals = ({ refundRequests, setRefundRequests, openRefundKitInspection, setLogHistory }) => {
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const columns = [
    {
      title: 'Email',
      dataIndex: 'userEmail',
      key: 'userEmail'
    },
    {
      title: 'Type',
      dataIndex: 'requestType',
      key: 'requestType',
      render: (type) => (
        <Tag color={type === 'BORROW_COMPONENT' ? 'orange' : 'blue'}>
          {type === 'BORROW_COMPONENT' ? 'Component' : 'Full Kit'}
        </Tag>
      )
    },
    {
      title: 'Kit/Component',
      dataIndex: 'kitName',
      key: 'kitName'
    },
    {
      title: 'Borrow Date',
      dataIndex: 'approvedDate',
      key: 'approvedDate',
      render: (date) => {
        if (!date) return 'N/A';
        try {
          return new Date(date).toLocaleString('vi-VN');
        } catch (error) {
          console.error('Error parsing approvedDate:', date, error);
          return 'N/A';
        }
      }
    },
    {
      title: 'Expected Return Date',
      dataIndex: 'expectReturnDate',
      key: 'expectReturnDate',
      render: (date) => {
        if (!date) return 'N/A';
        try {
          return new Date(date).toLocaleString('vi-VN');
        } catch (error) {
          console.error('Error parsing expectReturnDate:', date, error);
          return 'N/A';
        }
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color="green" style={{ minWidth: 80, textAlign: 'center' }}>
          APPROVED
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
            <Button
              type="primary"
              size="small"
              icon={<BuildOutlined />}
              onClick={() => {
                console.log('Checkin Kit button clicked, record:', record);
                openRefundKitInspection(record);
              }}
            >
              Checkin Kit
            </Button>
          </motion.div>
        </Space>
      )
    }
  ];

  // Removed unused handleRefundStatusChange function
  const _handleRefundStatusChange = (id, newStatus) => {
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

  // Removed unused handleRefundApproval function
  const _handleRefundApproval = (id, action) => {
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
        title="Return Checking Management"
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
  const [fineDetailModalVisible, setFineDetailModalVisible] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [finePolicies, setFinePolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [penaltyDetails, setPenaltyDetails] = useState([]);
  const [loadingPenaltyDetails, setLoadingPenaltyDetails] = useState(false);

  const columns = [
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
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (date ? new Date(date).toLocaleString('vi-VN') : 'N/A')
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
        </Space>
      )
    }
  ];

  const loadFinePolicies = async (penaltyId) => {
    setLoadingPolicies(true);
    try {
      const response = await penaltyPoliciesAPI.getAll();
      const data = Array.isArray(response) ? response : (response?.data || []);
      const policies = (Array.isArray(data) ? data : []).filter(
        (policy) =>
          policy.penaltyId === penaltyId ||
          policy.penalty?.id === penaltyId
      );
      setFinePolicies(policies);
    } catch (error) {
      console.error('Error loading fine policies:', error);
      setFinePolicies([]);
    } finally {
      setLoadingPolicies(false);
    }
  };

  const loadPenaltyDetails = async (penaltyId) => {
    setLoadingPenaltyDetails(true);
    try {
      const response = await penaltyDetailAPI.findByPenaltyId(penaltyId);
      const data = Array.isArray(response) ? response : (response?.data || []);
      setPenaltyDetails(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading penalty details:', error);
      setPenaltyDetails([]);
    } finally {
      setLoadingPenaltyDetails(false);
    }
  };

  const showFineDetails = (fine) => {
    setSelectedFine(fine);
    if (fine?.id) {
      loadFinePolicies(fine.id);
      loadPenaltyDetails(fine.id);
    } else {
      setFinePolicies([]);
      setPenaltyDetails([]);
    }
    setFineDetailModalVisible(true);
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

      {/* Fine Details Modal */}
      <Modal
        title="Fine Details"
        open={fineDetailModalVisible}
        onCancel={() => {
          setFineDetailModalVisible(false);
          setSelectedFine(null);
          setFinePolicies([]);
          setPenaltyDetails([]);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setFineDetailModalVisible(false);
            setSelectedFine(null);
          }}>
            Close
          </Button>
        ]}
        width={700}
        centered
      >
        {selectedFine && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Fine ID">#{selectedFine.id}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={selectedFine.status === 'paid' ? 'green' : 'orange'}>
                  {selectedFine.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Renter">{selectedFine.studentName}</Descriptions.Item>
              <Descriptions.Item label="Renter Email">{selectedFine.studentEmail}</Descriptions.Item>
              <Descriptions.Item label="Fine Amount">
                <Text strong style={{ color: '#cf1322' }}>
                  {selectedFine.fineAmount.toLocaleString()} VND
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Created">{new Date(selectedFine.createdAt).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Due Date">{new Date(selectedFine.dueDate).toLocaleString()}</Descriptions.Item>
            </Descriptions>

            <Divider>Penalty Details</Divider>

            <Spin spinning={loadingPenaltyDetails}>
              {penaltyDetails && penaltyDetails.length > 0 ? (
                <List
                  dataSource={penaltyDetails}
                  rowKey={(item) => item.id}
                  renderItem={(detail) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{detail.description || 'Penalty Detail'}</Text>
                            {detail.policiesId && (
                              <Tag color="blue">
                                Policy: {detail.policiesId}
                              </Tag>
                            )}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={4}>
                            <Text>
                              <Text strong>Amount:</Text>{' '}
                              <Text type="danger">
                                {detail.amount ? detail.amount.toLocaleString() : '0'} VND
                              </Text>
                            </Text>
                            {detail.imageUrl && (
                              <Text type="secondary">
                                Evidence: <a href={detail.imageUrl} target="_blank" rel="noreferrer">View Image</a>
                              </Text>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Alert
                  message="No Penalty Details"
                  description="No penalty detail records found for this fine."
                  type="info"
                  showIcon
                />
              )}
            </Spin>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

// Group Management Component
const GroupManagement = ({ groups, setGroups, adjustGroupMembers, availableStudents, onGroupsUpdated }) => {
  const MAX_GROUP_MEMBERS = 4; // Maximum number of members allowed in a group

  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [lecturers, setLecturers] = useState([]);
  const [allLecturers, setAllLecturers] = useState([]);
  const [loadingLecturers, setLoadingLecturers] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classAssignments, setClassAssignments] = useState([]);
  const [groupSearchText, setGroupSearchText] = useState('');

  // Add student modal state
  const [addStudentModalVisible, setAddStudentModalVisible] = useState(false);
  const [selectedGroupRecord, setSelectedGroupRecord] = useState(null);
  const [studentsToAdd, setStudentsToAdd] = useState([]);
  const [isFirstMember, setIsFirstMember] = useState(false);
  const [addingLoading, setAddingLoading] = useState(false);
  const [currentMemberCount, setCurrentMemberCount] = useState(0);
  const [membersNeeded, setMembersNeeded] = useState(0);

  // Load lecturers and classes when component mounts
  useEffect(() => {
    loadLecturers();
    loadClasses();
    loadClassAssignments();
    loadGroups();

    // Listen for groups updated event to reload
    const handleGroupsUpdated = () => {
      loadGroups();
    };

    window.addEventListener('groupsUpdated', handleGroupsUpdated);

    return () => {
      window.removeEventListener('groupsUpdated', handleGroupsUpdated);
    };
  }, []);

  const loadGroups = async () => {
    try {
      // Load accounts to be able to map LecturerCode / StudentCode for searching
      const [allStudents, allLecturers] = await Promise.all([
        userAPI.getStudents(),
        userAPI.getLecturers()
      ]);

      const studentCodeByEmail = new Map(
        (allStudents || []).map(s => [s.email, s.studentCode])
      );
      const lecturerCodeByEmail = new Map(
        (allLecturers || []).map(l => [l.email, l.lecturerCode])
      );

      const studentGroups = await studentGroupAPI.getAll();

      // Get all borrowing groups for each student group
      const groupsWithMembers = await Promise.all(
        studentGroups.map(async (group) => {
          const borrowingGroups = await borrowingGroupAPI.getByStudentGroupId(group.id);

          // Map borrowing groups to members list
          const members = borrowingGroups.map(bg => {
            return {
              id: bg.accountId,
              name: bg.accountName,
              email: bg.accountEmail,
              role: bg.roles,
              isActive: bg.isActive !== undefined ? bg.isActive : true
            };
          });

          // Find leader
          const leader = borrowingGroups.find(bg => bg.roles === 'LEADER');

          const lecturerEmail = group.lecturerEmail || (group.accountId ? group.lecturerEmail : null);
          const lecturerCode = lecturerEmail ? lecturerCodeByEmail.get(lecturerEmail) || null : null;

          const memberEmails = members.map(m => m.email);
          const memberStudentCodes = memberEmails
            .map(email => studentCodeByEmail.get(email))
            .filter(code => !!code);

          return {
            id: group.id,
            groupName: group.groupName || group.name, // Support both field names
            classId: group.classId,
            lecturer: lecturerEmail, // Use lecturerEmail from response
            lecturerName: group.lecturerName, // Store lecturer name for display
            leader: leader ? leader.accountEmail : null,
            members: memberEmails,
            lecturerCode: lecturerCode,
            memberStudentCodes: memberStudentCodes,
            status: group.status,
            lecturerId: group.accountId // Store lecturer account ID
          };
        })
      );

      console.log('Loaded groups:', groupsWithMembers);
      setGroups(groupsWithMembers);
    } catch (error) {
      console.error('Error loading groups:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load groups',
        placement: 'topRight',
      });
    }
  };

  const loadLecturers = async () => {
    setLoadingLecturers(true);
    try {
      const lecturerList = await userAPI.getLecturers();
      setAllLecturers(lecturerList || []);
      setLecturers(lecturerList || []); // Initially show all lecturers
    } catch (error) {
      console.error('Failed to load lecturers:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load lecturers',
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setLoadingLecturers(false);
    }
  };

  const loadClassAssignments = async () => {
    try {
      const assignmentsResponse = await classAssignmentAPI.getAll();
      const assignments = Array.isArray(assignmentsResponse)
        ? assignmentsResponse
        : (assignmentsResponse?.data || []);
      setClassAssignments(assignments);
    } catch (error) {
      console.error('Error loading class assignments:', error);
      setClassAssignments([]);
    }
  };

  const loadClasses = async () => {
    setLoadingClasses(true);
    try {
      const classesList = await classesAPI.getAllClasses();
      // Map classes to dropdown options with teacher info
      const classOptions = classesList.map(cls => ({
        value: cls.id,
        label: `${cls.classCode} - ${cls.semester}`,
        classCode: cls.classCode,
        semester: cls.semester,
        teacherId: cls.teacherId,
        teacherEmail: cls.teacherEmail,
        teacherName: cls.teacherName
      }));
      setClasses(classOptions);
    } catch (error) {
      console.error('Failed to load classes:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load classes',
        placement: 'topRight',
        duration: 3,
      });
    } finally {
      setLoadingClasses(false);
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
    const selectedClass = classes.find(cls => String(cls.value) === String(classId));
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
      const lecturerValue = lecturer.value ? String(lecturer.value) : null;

      const matches =
        (lecturerIdStr && lecturerAccountIds.has(lecturerIdStr)) ||
        (lecturerValue && lecturerAccountIds.has(lecturerValue)) ||
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

  const columns = [
    {
      title: 'Group Name',
      dataIndex: 'groupName',
      key: 'groupName',
      render: (groupName) => groupName || '-'
    },
    {
      title: 'IoT Subject',
      dataIndex: 'classId',
      key: 'classId',
      render: (classId) => {
        const classInfo = classes.find(c => c.value === classId);
        return classInfo ? classInfo.label : '-';
      }
    },
    {
      title: 'Leader',
      dataIndex: 'leader',
      key: 'leader',
      render: (leader) => leader || '-'
    },
    {
      title: 'Lecturer',
      dataIndex: 'lecturerName',
      key: 'lecturerName',
      render: (lecturerName, record) => {
        // Use lecturerName directly from the response, or fallback to lecturerEmail
        return lecturerName || record.lecturer || '-';
      }
    },
    {
      title: 'Members',
      dataIndex: 'members',
      key: 'members',
      render: (members, record) => {
        const memberCount = members?.length || 0;
        const isFull = memberCount >= MAX_GROUP_MEMBERS;
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text strong style={{ color: isFull ? '#52c41a' : '#1890ff' }}>
                {memberCount}/{MAX_GROUP_MEMBERS}
              </Text>
              {isFull && <Tag color="green" style={{ marginLeft: 8 }}>Full</Tag>}
            </div>
            {members?.map((member, index) => (
              <Tag key={index} style={{ marginBottom: 4 }}>{member}</Tag>
            ))}
          </div>
        );
      }
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
              onClick={() => handleAddStudentToGroup(record)}
              disabled={(record.members?.length || 0) >= MAX_GROUP_MEMBERS}
              style={{
                background: (record.members?.length || 0) >= MAX_GROUP_MEMBERS
                  ? '#d9d9d9'
                  : 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none'
              }}
            >
              {(record.members?.length || 0) >= MAX_GROUP_MEMBERS ? 'Full' : 'Add Student'}
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Popconfirm
              title="Delete Group"
              description={`Are you sure you want to delete group "${record.groupName}"? This will also delete all associated members.`}
              onConfirm={() => handleDeleteGroup(record.id)}
              okText="Yes"
              cancelText="No"
              okType="danger"
            >
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
              >
                Delete
              </Button>
            </Popconfirm>
          </motion.div>
        </Space>
      )
    }
  ];

  const handleAddStudentToGroup = async (groupRecord) => {
    console.log('handleAddStudentToGroup called with:', groupRecord);
    setSelectedGroupRecord(groupRecord);
    setAddingLoading(true);

    try {
      // Get current members of the group
      const existingMembers = await borrowingGroupAPI.getByStudentGroupId(groupRecord.id);
      const memberCount = existingMembers.length;

      // Check if group already has enough members
      if (memberCount >= MAX_GROUP_MEMBERS) {
        notification.warning({
          message: 'Group is Full',
          description: `This group already has ${memberCount} members (maximum: ${MAX_GROUP_MEMBERS}). Cannot add more members.`,
          placement: 'topRight',
          duration: 4,
        });
        setAddingLoading(false);
        return;
      }

      // Calculate how many members are needed to reach MAX_GROUP_MEMBERS
      const needed = MAX_GROUP_MEMBERS - memberCount;

      // Store member count info for modal display
      setCurrentMemberCount(memberCount);
      setMembersNeeded(needed);

      // Get students by classId for this group
      const allStudents = groupRecord.classId
        ? await userAPI.getStudentsByClassId(groupRecord.classId)
        : await userAPI.getStudents();
      console.log('Students in class:', allStudents);

      // Get all existing borrowing groups to check which students are already in groups
      const allBorrowingGroups = await borrowingGroupAPI.getAll();
      console.log('All borrowing groups:', allBorrowingGroups);

      // Filter available students (not in any group)
      const availableStudents = allStudents.filter(student => {
        const isInAnyGroup = allBorrowingGroups.some(bg => {
          const bgAccountId = bg.accountId?.toString();
          const studentId = student.id?.toString();
          return bgAccountId === studentId;
        });
        return !isInAnyGroup;
      });

      console.log('Total students in class:', allStudents.length);
      console.log('Available students in class:', availableStudents.length);
      console.log('Current members:', memberCount);
      console.log('Members needed:', needed);

      if (availableStudents.length === 0) {
        notification.warning({
          message: 'No Available Students',
          description: 'All students are already assigned to groups',
          placement: 'topRight',
        });
        setAddingLoading(false);
        return;
      }

      // Check if there are enough available students
      if (availableStudents.length < needed) {
        notification.warning({
          message: 'Insufficient Available Students',
          description: `This group needs ${needed} more member(s) to reach ${MAX_GROUP_MEMBERS} members, but only ${availableStudents.length} student(s) are available.`,
          placement: 'topRight',
          duration: 4,
        });
        setAddingLoading(false);
        return;
      }

      // Check if this is the first member (group has no members yet)
      const firstMember = memberCount === 0;

      // Select exactly the number of students needed (or all available if less than needed)
      const numberOfStudentsToAdd = Math.min(needed, availableStudents.length);

      console.log('Available students:', availableStudents.length);
      console.log('Number of students to add (calculated):', numberOfStudentsToAdd);

      const shuffledStudents = [...availableStudents].sort(() => 0.5 - Math.random());
      const selectedStudents = shuffledStudents.slice(0, numberOfStudentsToAdd);

      console.log('Selected students to add:', selectedStudents);
      console.log('Is first member:', firstMember);
      console.log('Number of students to add:', numberOfStudentsToAdd);

      // Set state and show modal
      setStudentsToAdd(selectedStudents);
      setIsFirstMember(firstMember);
      setAddStudentModalVisible(true);
    } catch (error) {
      console.error('Error loading students:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load students',
        placement: 'topRight',
      });
    } finally {
      setAddingLoading(false);
    }
  };

  const handleConfirmAddStudents = async () => {
    console.log('=== handleConfirmAddStudents called ===');
    console.log('Adding students to group...');
    console.log('Selected students:', studentsToAdd);
    console.log('Is first member:', isFirstMember);
    console.log('Group ID:', selectedGroupRecord?.id);

    setAddingLoading(true);

    try {
      const addedStudents = [];

      // Add each student to the group
      console.log(`Starting loop to add ${studentsToAdd.length} students`);
      for (let i = 0; i < studentsToAdd.length; i++) {
        const student = studentsToAdd[i];

        // First student becomes LEADER, others become MEMBERS
        const role = (isFirstMember && i === 0) ? 'LEADER' : 'MEMBER';

        const borrowingGroupData = {
          studentGroupId: selectedGroupRecord.id,
          accountId: student.id,
          roles: role
        };

        console.log(`Adding student ${i + 1}/${studentsToAdd.length}:`, {
          student: student.fullName,
          role: role,
          data: borrowingGroupData
        });

        const response = await borrowingGroupAPI.addMemberToGroup(borrowingGroupData);
        console.log('API Response:', response);

        addedStudents.push({
          name: student.fullName,
          email: student.email,
          role: role
        });
      }

      // Refresh group data
      await loadGroups();

      notification.success({
        message: `${studentsToAdd.length} Students Added`,
        description: `Successfully added ${studentsToAdd.length} students to the group`,
        placement: 'topRight',
        duration: 4,
      });

      // Close modal
      setAddStudentModalVisible(false);
    } catch (error) {
      console.error('Error adding students to group:', error);
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to add students to group',
        placement: 'topRight',
      });
    } finally {
      setAddingLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await studentGroupAPI.delete(groupId);

      // Reload groups after deletion
      await loadGroups();

      notification.success({
        message: 'Group Deleted Successfully',
        description: 'The group and all associated members have been deleted.',
        placement: 'topRight',
        duration: 4,
      });
    } catch (error) {
      console.error('Error deleting group:', error);
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to delete group',
        placement: 'topRight',
        duration: 4,
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Create empty group using StudentGroupController
      const lecturer = lecturers.find(l => l.value === values.lecturer);
      const groupData = {
        groupName: values.name,
        classId: values.classId,
        accountId: lecturer?.id || null, // Lecturer ID
        status: true,
        roles: null // No role initially (lecturer is not a group role)
      };

      const response = await studentGroupAPI.create(groupData);

      if (response && response.id) {
        const newGroupId = response.id;

        // Get students by classId
        let studentsToAdd = [];
        if (values.classId) {
          const studentsInClass = await userAPI.getStudentsByClassId(values.classId);
          console.log('Students in class for new group:', studentsInClass);

          // Get all existing borrowing groups to check which students are already in groups
          const allBorrowingGroups = await borrowingGroupAPI.getAll();

          // Filter available students (not in any group) and in this class
          const availableStudents = studentsInClass.filter(student => {
            const isInAnyGroup = allBorrowingGroups.some(bg => {
              const bgAccountId = bg.accountId?.toString();
              const studentId = student.id?.toString();
              return bgAccountId === studentId;
            });
            return !isInAnyGroup;
          });

          // Limit to maximum 4 members for a new group
          const maxMembersToAdd = 4;
          studentsToAdd = availableStudents.slice(0, maxMembersToAdd);
        }

        // Add students to the group (first one becomes LEADER, others become MEMBER)
        let addedCount = 0;
        if (studentsToAdd.length > 0) {
          for (let i = 0; i < studentsToAdd.length; i++) {
            const student = studentsToAdd[i];
            const role = i === 0 ? 'LEADER' : 'MEMBER';

            const borrowingGroupData = {
              studentGroupId: newGroupId,
              accountId: student.id,
              roles: role
            };

            try {
              await borrowingGroupAPI.addMemberToGroup(borrowingGroupData);
              addedCount++;
              console.log(`Added student ${student.fullName || student.email} as ${role}`);
            } catch (addError) {
              console.error(`Error adding student ${student.email}:`, addError);
            }
          }
        }

        // Reload groups to show updated data (this will include the newly created group)
        await loadGroups();

        notification.success({
          message: 'Group Created Successfully',
          description: `Group "${values.name}" created${addedCount > 0 ? ` and ${addedCount} student(s) from this class added automatically.` : '. No available students in this class.'}`,
          placement: 'topRight',
          duration: 4,
        });
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to create group - no response ID',
          placement: 'topRight',
          duration: 3,
        });
      }

      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to create group:', error);
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to create group',
        placement: 'topRight',
        duration: 3,
      });
    }
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
                Create Group
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
          {/* Search by LecturerCode / StudentCode */}
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search by LecturerCode or StudentCode..."
              prefix={<SearchOutlined />}
              value={groupSearchText}
              onChange={(e) => setGroupSearchText(e.target.value)}
              allowClear
              style={{ maxWidth: 360, borderRadius: 8 }}
            />
          </div>

          <Table
            columns={columns}
            dataSource={
              groupSearchText
                ? groups.filter(g => {
                  const query = groupSearchText.toLowerCase();
                  const lecturerCode = (g.lecturerCode || '').toLowerCase();
                  const memberCodes = (g.memberStudentCodes || []).map(code => (code || '').toLowerCase());

                  if (lecturerCode.includes(query)) {
                    return true;
                  }

                  return memberCodes.some(code => code.includes(query));
                })
                : groups
            }
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
          setLecturers(allLecturers); // Reset to all lecturers when closing
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={(changedValues, allValues) => {
            // When classId changes, filter lecturers
            if (changedValues.classId !== undefined) {
              filterLecturersByClass(changedValues.classId);
            }
          }}
        >
          <Form.Item name="name" label="Group Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="classId" label="IoT Subject (Class Code)" rules={[{ required: true, message: 'Please select a class' }]}>
            <Select
              showSearch
              placeholder="Search and select IoT subject"
              optionFilterProp="children"
              loading={loadingClasses}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={classes}
              onChange={(value) => {
                filterLecturersByClass(value);
              }}
            />
          </Form.Item>
          <Form.Item name="lecturer" label="Lecturer" rules={[{ required: true, message: 'Please select a lecturer' }]}>
            <Select
              showSearch
              placeholder={lecturers.length === 0 ? "Select class code first" : "Search and select lecturer"}
              optionFilterProp="children"
              loading={loadingLecturers}
              disabled={lecturers.length === 0 && allLecturers.length > 0}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
                (option?.email ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={lecturers}
            />
          </Form.Item>
          <Alert
            message="Automatic Member Assignment"
            description="When you create a group, the system will automatically add all available students from the selected IoT Subject (ClassCode) to this group. The first student will become the group leader."
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

      {/* Add Student Modal */}
      <Modal
        title={
          <div>
            <div>Add Students to Group "{selectedGroupRecord?.groupName}"</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Current: {currentMemberCount}/{MAX_GROUP_MEMBERS} members | Adding: {studentsToAdd.length} student(s) to reach {MAX_GROUP_MEMBERS} members
            </Text>
          </div>
        }
        open={addStudentModalVisible}
        onOk={handleConfirmAddStudents}
        onCancel={() => {
          setAddStudentModalVisible(false);
          setCurrentMemberCount(0);
          setMembersNeeded(0);
        }}
        confirmLoading={addingLoading}
        okText={`Add ${studentsToAdd.length} Student${studentsToAdd.length > 1 ? 's' : ''}`}
        cancelText="Cancel"
        width={600}
      >
        <div>
          <p>Selected students to add:</p>
          <List
            size="small"
            dataSource={studentsToAdd}
            renderItem={(student, index) => {
              return (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <span>
                        {isFirstMember && index === 0 && <Tag color="gold">LEADER</Tag>}
                        <Tag color={index === 0 && isFirstMember ? 'blue' : 'default'}>
                          {index === 0 && isFirstMember ? 'LEADER' : 'MEMBER'}
                        </Tag>
                        {student.fullName} ({student.email})
                      </span>
                    }
                    description={
                      <div style={{ fontSize: 12 }}>
                        <div>
                          <Text strong>ClassCode:</Text>{' '}
                          <Text type="secondary">{student.classCode || 'N/A'}</Text>
                        </div>
                        <div>
                          <Text strong>StudentCode:</Text>{' '}
                          <Text type="secondary">{student.studentCode || 'N/A'}</Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

// User Management Component
const UserManagement = ({ users, setUsers }) => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

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
      title: 'Phone Number',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-'
    },
    {
      title: 'User Code',
      dataIndex: 'userCode',
      key: 'userCode',
      render: (_, record) => {
        // Display studentCode for STUDENT role, lecturerCode for LECTURER role
        const role = (record.role || '').toLowerCase();
        if (role === 'student') {
          return record.studentCode || '-';
        } else if (role === 'lecturer') {
          return record.lecturerCode || '-';
        }
        return '-';
      }
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
    setSelectedRole(user.role);

    // Map user data to form field names
    const role = (user.role || '').toLowerCase();
    const formData = {
      name: user.name || user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      studentCode: role === 'student' ? (user.studentCode || '') : '',
      lecturerCode: role === 'lecturer' ? (user.lecturerCode || '') : ''
    };

    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const deleteUser = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this user?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          setLoading(true);
          await userAPI.deleteUser(id);

          // Refresh users list from API
          const usersData = await userAPI.getAllAccounts(0, 100);

          if (usersData && usersData.length > 0) {
            const mappedUsers = usersData.map(profile => ({
              id: profile.id,
              name: profile.fullName || profile.email || 'Unknown',
              email: profile.email,
              phone: profile.phone,
              studentCode: profile.studentCode,
              lecturerCode: profile.lecturerCode,
              lecturerCode: profile.lecturerCode,
              role: profile.role?.toLowerCase() || 'member',
              status: profile.isActive ? 'Active' : 'Inactive'
            }));
            setUsers(mappedUsers);
          } else {
            setUsers([]);
          }

          notification.success({
            message: 'Success',
            description: 'User deleted successfully',
            placement: 'topRight',
            duration: 3,
          });
        } catch (error) {
          console.error('Error deleting user:', error);
          notification.error({
            message: 'Error',
            description: 'Failed to delete user: ' + error.message,
            placement: 'topRight',
            duration: 4,
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Filter users based on search text and role
  const filteredUsers = users.filter(user => {
    // Filter by search text (name, email, phone, studentCode, lecturerCode)
    if (searchText && searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase();
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      const studentCode = (user.studentCode || '').toLowerCase();
      const lecturerCode = (user.lecturerCode || '').toLowerCase();

      if (!name.includes(searchLower) &&
        !email.includes(searchLower) &&
        !phone.includes(searchLower) &&
        !studentCode.includes(searchLower) &&
        !lecturerCode.includes(searchLower)) {
        return false;
      }
    }

    // Filter by role
    if (roleFilter !== 'all') {
      const userRole = (user.role || '').toLowerCase();
      if (userRole !== roleFilter.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  // Get unique roles from users for filter dropdown
  const availableRoles = [...new Set(users.map(user => user.role).filter(Boolean))].sort();

  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        // Update existing user using backend API
        try {
          const updateData = {
            username: values.email,
            password: values.password,
            studentCode: values.role?.toLowerCase() === 'student' ? (values.studentCode || null) : null,
            lecturerCode: values.role?.toLowerCase() === 'lecturer' ? (values.lecturerCode || null) : null,
            roles: values.role?.toUpperCase() || 'STUDENT',
            phoneNumber: values.phone || null,
            fullName: values.name || null
          };

          console.log('Updating user with data:', updateData);
          const response = await authAPI.updateUser(editingUser.id, updateData);
          console.log('Update user response:', response);

          // Backend returns ApiResponse with structure: {status, message, data}
          const userData = response?.data || response;

          if (userData && userData.email) {
            // Refresh users list from API
            try {
              const usersData = await userAPI.getAllAccounts(0, 100);

              if (usersData && usersData.length > 0) {
                const mappedUsers = usersData.map(profile => ({
                  id: profile.id,
                  name: profile.fullName || profile.email || 'Unknown',
                  email: profile.email,
                  phone: profile.phone,
                  studentCode: profile.studentCode,
                  lecturerCode: profile.lecturerCode,
                  lecturerCode: profile.lecturerCode,
                  role: profile.role?.toLowerCase() || 'member',
                  status: 'Active',
                  createdAt: new Date().toISOString()
                }));
                setUsers(mappedUsers);
              }
            } catch (refreshError) {
              console.error('Error refreshing users:', refreshError);
              notification.warning({
                message: 'Warning',
                description: 'User updated successfully but failed to refresh the list. Please refresh the page.',
                placement: 'topRight',
                duration: 4,
              });
            }

            notification.success({
              message: 'Success',
              description: `User updated successfully: ${userData.email}`,
              placement: 'topRight',
              duration: 3,
            });
          } else {
            notification.error({
              message: 'Error',
              description: 'Failed to update user - Invalid response',
              placement: 'topRight',
              duration: 3,
            });
          }
        } catch (updateError) {
          console.error('Error updating user:', updateError);
          notification.error({
            message: 'Error',
            description: updateError.message || 'Failed to update user',
            placement: 'topRight',
            duration: 3,
          });
        }
      } else {
        // Create new user using backend API
        const userData = {
          username: values.email,
          password: values.password,
          studentCode: values.role?.toLowerCase() === 'student' ? (values.studentCode || null) : null,
          lecturerCode: values.role?.toLowerCase() === 'lecturer' ? (values.lecturerCode || null) : null,
          roles: values.role?.toUpperCase() || 'STUDENT',
          phoneNumber: values.phone || null,
          fullName: values.name || null
        };

        console.log('Creating user with data:', userData);
        const response = await authAPI.register(
          userData.username,
          userData.password,
          userData.studentCode,
          userData.roles,
          userData.phoneNumber,
          userData.fullName
        );
        console.log('Create user response:', response);

        if (response && response.email) {
          // Backend returns RegisterResponse object, refresh users list from API
          try {
            const usersData = await userAPI.getAllAccounts(0, 100);

            if (usersData && usersData.length > 0) {
              const mappedUsers = usersData.map(profile => ({
                id: profile.id,
                name: profile.fullName || profile.email || 'Unknown',
                email: profile.email,
                phone: profile.phone,
                studentCode: profile.studentCode,
                lecturerCode: profile.lecturerCode,
                role: profile.role?.toLowerCase() || 'member',
                status: 'Active',
                createdAt: new Date().toISOString()
              }));
              setUsers(mappedUsers);
            }
          } catch (refreshError) {
            console.error('Error refreshing users:', refreshError);
            // Still show success message even if refresh fails
            notification.warning({
              message: 'Warning',
              description: 'User created successfully but failed to refresh the list. Please refresh the page.',
              placement: 'topRight',
              duration: 4,
            });
          }

          notification.success({
            message: 'Success',
            description: `User created successfully: ${response.email}`,
            placement: 'topRight',
            duration: 3,
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'Failed to create user - Invalid response',
            placement: 'topRight',
            duration: 3,
          });
        }
      }

      setModalVisible(false);
      setEditingUser(null);
      setSelectedRole(null);
      form.resetFields();
    } catch (error) {
      console.error('Error handling user submission:', error);
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to handle user submission',
        placement: 'topRight',
        duration: 3,
      });
    }
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
                onClick={() => {
                  setSelectedRole(null);
                  setModalVisible(true);
                }}
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
          {/* Filter and Search Section */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={12}>
              <Input
                placeholder="Search by name, email, phone, or user code..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Select
                placeholder="Filter by Role"
                value={roleFilter}
                onChange={setRoleFilter}
                allowClear
                style={{ width: '100%', borderRadius: '8px' }}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All Roles</Option>
                {availableRoles.map(role => (
                  <Option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Table
            columns={columns}
            dataSource={filteredUsers}
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
          setSelectedRole(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: 'Name is required' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 100, message: 'Name must not exceed 100 characters' },
              { pattern: /^[a-zA-Z\s\u00C0-\u1EF9]+$/, message: 'Name can only contain letters and spaces' }
            ]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Please enter a valid email address' },
              {
                validator: async (_, value) => {
                  if (!value) return Promise.resolve();
                  // Check if email already exists (excluding current user being edited)
                  const existingUser = users.find(u =>
                    u.email?.toLowerCase() === value.toLowerCase() &&
                    (!editingUser || u.id !== editingUser.id)
                  );
                  if (existingUser) {
                    return Promise.reject(new Error('This email is already in use'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input placeholder="Enter email address" disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              {
                pattern: /^[0-9]{10,11}$/,
                message: 'Phone number must be 10-11 digits'
              }
            ]}
          >
            <Input placeholder="Enter phone number (10-11 digits)" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Role is required' }]}
          >
            <Select onChange={(value) => setSelectedRole(value)} placeholder="Select a role">
              <Option value="lecturer">Lecturer</Option>
              <Option value="academic">Academic</Option>
              <Option value="student">Student</Option>
            </Select>
          </Form.Item>
          {selectedRole === 'student' && (
            <Form.Item
              name="studentCode"
              label="User Code (Student Code)"
              rules={[
                { required: true, message: 'Student Code is required for students' },
                { min: 3, message: 'Student Code must be at least 3 characters' },
                { max: 20, message: 'Student Code must not exceed 20 characters' },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();
                    // Check if student code already exists (excluding current user being edited)
                    const existingUser = users.find(u =>
                      u.studentCode?.toLowerCase() === value.toLowerCase() &&
                      (!editingUser || u.id !== editingUser.id)
                    );
                    if (existingUser) {
                      return Promise.reject(new Error('This student code is already in use'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input placeholder="Enter student code" />
            </Form.Item>
          )}
          {selectedRole === 'lecturer' && (
            <Form.Item
              name="lecturerCode"
              label="User Code (Lecturer Code)"
              rules={[
                { required: true, message: 'Lecturer Code is required for lecturers' },
                { min: 3, message: 'Lecturer Code must be at least 3 characters' },
                { max: 20, message: 'Lecturer Code must not exceed 20 characters' },
                {
                  validator: async (_, value) => {
                    if (!value) return Promise.resolve();
                    // Check if lecturer code already exists (excluding current user being edited)
                    const existingUser = users.find(u =>
                      u.lecturerCode?.toLowerCase() === value.toLowerCase() &&
                      (!editingUser || u.id !== editingUser.id)
                    );
                    if (existingUser) {
                      return Promise.reject(new Error('This lecturer code is already in use'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input placeholder="Enter lecturer code" />
            </Form.Item>
          )}
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Password is required' },
                { min: 6, message: 'Password must be at least 6 characters' },
                { max: 50, message: 'Password must not exceed 50 characters' }
              ]}
            >
              <Input.Password placeholder="Enter password (min 6 characters)" />
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
                setSelectedRole(null);
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
const KitComponentHistoryTab = ({
  kits,
  historyData,
  loading,
  onSelectKit,
  onSelectComponent,
  selectedKitId,
  selectedComponentId,
}) => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const kitOptions = useMemo(() => (kits || []).map((kit) => ({
    value: kit.id,
    label: kit.kitName || kit.name || 'Unknown kit',
  })), [kits]);

  const componentOptions = useMemo(() => {
    const allComponents = (kits || []).flatMap((kit) => {
      return (kit.components || []).map((component) => ({
        value: component.id,
        label: component.componentName || component.name || 'Component',
      }));
    });
    // Remove duplicates by id
    const uniqueMap = new Map();
    allComponents.forEach((comp) => {
      if (comp.value && !uniqueMap.has(comp.value)) {
        uniqueMap.set(comp.value, comp);
      }
    });
    return Array.from(uniqueMap.values());
  }, [kits]);

  const columns = [
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => value ? new Date(value).toLocaleString('vi-VN') : 'N/A',
    },
    {
      title: 'Kit',
      dataIndex: 'kitName',
      key: 'kitName',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Component',
      dataIndex: 'componentName',
      key: 'componentName',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (value) => {
        if (!value) return <Tag>Unknown</Tag>;
        const isDamaged = value.toLowerCase().includes('damage');
        return <Tag color={isDamaged ? 'gold' : 'blue'}>{value}</Tag>;
      },
    },
    {
      title: 'Old Status',
      dataIndex: 'oldStatus',
      key: 'oldStatus',
      render: (value) => value ? <Tag>{value}</Tag> : '-',
    },
    {
      title: 'New Status',
      dataIndex: 'newStatus',
      key: 'newStatus',
      render: (value) => {
        if (!value) return '-';
        const isDamaged = value.toLowerCase().includes('damage');
        return <Tag color={isDamaged ? 'gold' : 'success'}>{value}</Tag>;
      },
    },
    {
      title: 'Note',
      dataIndex: 'note',
      key: 'note',
      ellipsis: true,
      render: (value) => value || '-',
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedHistory(record);
            setDetailModalVisible(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const dataSource = (historyData || []).map((item, index) => ({
    key: item.id || `${item.componentId || 'component'}-${item.createdAt || index}`,
    ...item,
  }));

  return (
    <Card title="Kit Component History" className="kit-history-card">
      <Space direction="vertical" size="middle" className="kit-history-space">
        <div className="kit-history-filters">
          <Select
            allowClear
            showSearch
            className="kit-history-select"
            placeholder="Chọn kit"
            optionFilterProp="label"
            value={selectedKitId || undefined}
            options={kitOptions}
            onChange={onSelectKit}
          />
          <Select
            allowClear
            showSearch
            className="kit-history-select"
            placeholder="Chọn component"
            optionFilterProp="label"
            value={selectedComponentId || undefined}
            options={componentOptions}
            onChange={onSelectComponent}
          />
        </div>
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
        <Modal
          open={detailModalVisible}
          title="History Details"
          footer={null}
          onCancel={() => setDetailModalVisible(false)}
          destroyOnClose
        >
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Time">
              {selectedHistory?.createdAt ? new Date(selectedHistory.createdAt).toLocaleString('vi-VN') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Kit">
              {selectedHistory?.kitName || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Component">
              {selectedHistory?.componentName || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Action">
              {selectedHistory?.action || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Old Status">
              {selectedHistory?.oldStatus || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="New Status">
              {selectedHistory?.newStatus || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Note">
              {selectedHistory?.note || 'N/A'}
            </Descriptions.Item>
            {selectedHistory?.penaltyDetailImageUrl && (
              <Descriptions.Item label="Damage Image">
                <img
                  src={selectedHistory.penaltyDetailImageUrl}
                  alt="Damage evidence"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 240,
                    borderRadius: 4,
                    border: '1px solid #d9d9d9',
                  }}
                />
              </Descriptions.Item>
            )}
          </Descriptions>
        </Modal>
      </Space>
    </Card>
  );
};

const TransactionHistory = ({ transactions, setTransactions }) => {
  const [searchText, setSearchText] = useState('');
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
      case 'TOP_UP':
        return 'green';
      case 'PENALTY_PAYMENT':
        return 'red';
      case 'REFUND':
        return 'blue';
      case 'RENTAL_FEE':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case 'TOP_UP':
        return <PlusOutlined />;
      case 'PENALTY_PAYMENT':
        return <DollarOutlined />;
      case 'REFUND':
        return <RollbackOutlined />;
      case 'RENTAL_FEE':
        return <ShoppingOutlined />;
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
      'User Name': txn.userName || 'N/A',
      'User Email': txn.email || txn.userEmail || 'N/A',
      'User Role': txn.userRole || 'N/A',
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
      (transaction.id || '').toString().toLowerCase().includes(searchText.toLowerCase()) ||
      (transaction.description || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (transaction.paymentMethod || '').toLowerCase().includes(searchText.toLowerCase());

    const matchesType = typeFilter === 'all' || (transaction.type || transaction.transactionType) === typeFilter;

    let matchesDate = true;
    if (dateRange && dateRange.length === 2) {
      const transactionDate = new Date(transaction.createdAt || transaction.transactionDate);
      const startDate = dateRange[0].startOf('day');
      const endDate = dateRange[1].endOf('day');
      matchesDate = transactionDate >= startDate && transactionDate <= endDate;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + (txn.amount || 0), 0);

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
          </Row>

          {/* Filters */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={8}>
              <Input
                placeholder="Search transactions..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ borderRadius: '8px' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Filter by type"
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: '100%', borderRadius: '8px' }}
              >
                <Option value="all">All Types</Option>
                <Option value="TOP_UP">Top Up</Option>
                <Option value="PENALTY_PAYMENT">Penalty Payment</Option>
                <Option value="REFUND">Refund</Option>
                <Option value="RENTAL_FEE">Rental Fee</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8}>
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
                dataIndex: 'id',
                key: 'id',
                render: (text) => text ? <Text code>{text.substring(0, 8)}...</Text> : 'N/A'
              },
              {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (type, record) => {
                  const transactionType = type || record.transactionType;
                  return (
                    <Tag color={getTransactionTypeColor(transactionType)} icon={getTransactionTypeIcon(transactionType)}>
                      {transactionType ? transactionType.replace(/_/g, ' ') : 'N/A'}
                    </Tag>
                  );
                }
              },
              {
                title: 'Previous Balance',
                dataIndex: 'previousBalance',
                key: 'previousBalance',
                render: (previousBalance) => {
                  if (previousBalance === null || previousBalance === undefined) {
                    return <Text type="secondary">N/A</Text>;
                  }
                  return (
                    <Text type="secondary">
                      {previousBalance.toLocaleString()} VND
                    </Text>
                  );
                }
              },
              {
                title: 'Amount',
                dataIndex: 'amount',
                key: 'amount',
                render: (amount) => (
                  <Text strong style={{ color: amount >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    {amount ? amount.toLocaleString() : '0'} VND
                  </Text>
                )
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status, record) => {
                  const transactionStatus = status || record.transactionStatus;
                  return (
                    <Tag color={getStatusColor(transactionStatus)}>
                      {transactionStatus || 'N/A'}
                    </Tag>
                  );
                }
              },
              {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
                ellipsis: true
              },
              {
                title: 'Date',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (date) => date ? formatDateTime(date) : 'N/A'
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
              <Text code>{selectedTransaction.transactionId || selectedTransaction.id || 'N/A'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="User Name">{selectedTransaction.userName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="User Email">{selectedTransaction.email || selectedTransaction.userEmail || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Transaction Type">
              <Tag color={getTransactionTypeColor(selectedTransaction.type)} icon={getTransactionTypeIcon(selectedTransaction.type)}>
                {selectedTransaction.type ? selectedTransaction.type.replace(/_/g, ' ') : selectedTransaction.transactionType ? selectedTransaction.transactionType.replace(/_/g, ' ') : 'N/A'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Previous Balance">
              {selectedTransaction.previousBalance !== null && selectedTransaction.previousBalance !== undefined
                ? formatAmount(selectedTransaction.previousBalance)
                : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              <Text strong style={{ fontSize: '18px', color: (selectedTransaction.amount || 0) >= 0 ? '#52c41a' : '#ff4d4f' }}>
                {formatAmount(selectedTransaction.amount || 0)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedTransaction.status || selectedTransaction.transactionStatus)}>
                {selectedTransaction.status || selectedTransaction.transactionStatus || 'N/A'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Kit Name" span={2}>
              {selectedTransaction.kitName || 'N/A'}
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

// Log History Component
const LogHistory = ({ logHistory, setLogHistory }) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load borrowing requests by statuses (REJECTED, RETURNED)
  useEffect(() => {
    loadBorrowingRequests();
  }, []);

  const loadBorrowingRequests = async () => {
    setLoading(true);
    try {
      const requests = await borrowingRequestAPI.getByStatuses(['REJECTED', 'RETURNED']);
      console.log('Fetched borrowing requests:', requests);

      // Map borrowing requests to log history format
      const mappedLogs = requests.map(request => {
        const status = request.status || 'UNKNOWN';
        const action = status === 'REJECTED' ? 'RENTAL_REQUEST_REJECTED' :
          status === 'RETURNED' ? 'RENTAL_REQUEST_RETURNED' :
            'RENTAL_REQUEST_OTHER';

        return {
          id: request.id,
          timestamp: request.actualReturnDate || request.approvedDate || request.createdAt || new Date().toISOString(),
          action: action,
          type: 'rental',
          user: request.requestedBy?.email || 'N/A',
          userName: request.requestedBy?.fullName || request.requestedBy?.email || 'N/A',
          details: {
            kitName: request.kit?.kitName || 'N/A',
            kitId: request.kit?.id || 'N/A',
            requestId: request.id?.toString() || 'N/A',
            reason: request.reason || 'N/A',
            requestType: request.requestType || 'N/A',
            depositAmount: request.depositAmount || 0,
            expectReturnDate: request.expectReturnDate || 'N/A',
            actualReturnDate: request.actualReturnDate || 'N/A'
          },
          status: status,
          adminAction: status === 'REJECTED' ? 'rejected' : status === 'RETURNED' ? 'returned' : 'N/A',
          adminUser: 'admin@fpt.edu.vn',
          adminTimestamp: request.actualReturnDate || request.approvedDate || request.createdAt || new Date().toISOString()
        };
      });

      setLogHistory(mappedLogs);
    } catch (error) {
      console.error('Error loading borrowing requests:', error);
      message.error('Failed to load borrowing requests');
      setLogHistory([]);
    } finally {
      setLoading(false);
    }
  };

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

  const getActionIcon = (action) => {
    switch (action) {
      case 'RENTAL_REQUEST_BORROWED':
        return <ShoppingOutlined style={{ color: '#1890ff' }} />;
      case 'RENTAL_REQUEST_RETURNED':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'RENTAL_REQUEST_REJECTED':
        return <CloseCircleOutlined style={{ color: '#f5222d' }} />;
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


  // Removed unused getActionColor function
  const _getActionColor = (action) => {
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
        return 'purple';
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
    const matchesSearch = (log.userName || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (log.details?.kitName || '').toLowerCase().includes(searchText.toLowerCase()) ||
      (log.details?.requestId || '').toLowerCase().includes(searchText.toLowerCase());

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
                  loadBorrowingRequests();
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
          <Tabs>
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
                      title="Returned Items"
                      value={filteredLogs.filter(log => log.status === 'RETURNED').length}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card size="small">
                    <Statistic
                      title="Rejected Items"
                      value={filteredLogs.filter(log => log.status === 'REJECTED').length}
                      prefix={<CloseCircleOutlined />}
                      valueStyle={{ color: '#f5222d' }}
                    />
                  </Card>
                </Col>
              </Row>

              {/* Log Table */}
              <Table
                dataSource={filteredLogs}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} logs`,
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
              <Descriptions.Item label="Action" span={2}>
                <Space>
                  {getActionIcon(selectedLog.action)}
                  <span style={{ fontWeight: 'bold' }}>
                    {selectedLog.action.replace(/_/g, ' ')}
                  </span>
                </Space>
              </Descriptions.Item>
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
                {selectedLog.details?.kitName || 'N/A'} (ID: {selectedLog.details?.kitId || 'N/A'})
              </Descriptions.Item>
              <Descriptions.Item label="Request ID" span={2}>
                {selectedLog.details?.requestId || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Reason" span={2}>
                {selectedLog.details?.reason || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Request Type" span={2}>
                <Tag color={selectedLog.details?.requestType === 'BORROW_COMPONENT' ? 'orange' : 'blue'}>
                  {selectedLog.details?.requestType || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Deposit Amount" span={2}>
                {selectedLog.details?.depositAmount ? selectedLog.details.depositAmount.toLocaleString() + ' VND' : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Return Date">
                {selectedLog.details?.expectReturnDate ? formatTimestamp(selectedLog.details.expectReturnDate) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Actual Return Date">
                {selectedLog.details?.actualReturnDate ? formatTimestamp(selectedLog.details.actualReturnDate) : 'N/A'}
              </Descriptions.Item>
              {selectedLog.adminAction && (
                <>
                  <Descriptions.Item label="Admin Action">
                    <Tag color={selectedLog.adminAction === 'rejected' ? 'red' : selectedLog.adminAction === 'returned' ? 'green' : 'default'}>
                      {selectedLog.adminAction.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Admin User">
                    {selectedLog.adminUser || 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Admin Timestamp">
                    {formatTimestamp(selectedLog.adminTimestamp)}
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

// Penalty Policies Management Component
const PenaltyPoliciesManagement = ({ penaltyPolicies, setPenaltyPolicies }) => {
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper function for date formatting
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  // Load penalty policies on mount
  useEffect(() => {
    loadPenaltyPolicies();
  }, []);

  const loadPenaltyPolicies = async () => {
    setLoading(true);
    try {
      const response = await penaltyPoliciesAPI.getAll();
      console.log('Penalty policies response:', response);

      // Handle ApiResponse wrapper
      const policiesData = response?.data || response;

      if (Array.isArray(policiesData)) {
        setPenaltyPolicies(policiesData);
        console.log('Penalty policies loaded successfully:', policiesData.length);
      } else {
        setPenaltyPolicies([]);
        console.log('No penalty policies found or invalid response format');
      }
    } catch (error) {
      console.error('Error loading penalty policies:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load penalty policies',
        placement: 'topRight',
        duration: 3,
      });
      setPenaltyPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Policy Name',
      dataIndex: 'policyName',
      key: 'policyName',
      render: (text) => <Text strong>{text || 'N/A'}</Text>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const typeColors = {
          'damaged': 'orange',
          'lost': 'red',
          'lated': 'blue',
          'LATE': 'blue',
          'DAMAGED': 'orange',
          'LOST': 'red'
        };
        const color = typeColors[type] || 'default';
        return (
          <Tag color={color}>
            {type ? type.toUpperCase() : 'N/A'}
          </Tag>
        );
      }
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#cf1322' }}>
          {amount ? amount.toLocaleString() : '0'} VND
        </Text>
      )
    },
    {
      title: 'Issued Date',
      dataIndex: 'issuedDate',
      key: 'issuedDate',
      render: (date) => date ? formatDateTime(date) : 'N/A'
    },
    {
      title: 'Resolved Date',
      dataIndex: 'resolved',
      key: 'resolved',
      render: (date) => date ? formatDateTime(date) : 'N/A'
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
              icon={<EditOutlined />}
              onClick={() => editPolicy(record)}
            >
              Edit
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Popconfirm
              title="Delete Policy"
              description={`Are you sure you want to delete policy "${record.policyName}"?`}
              onConfirm={() => deletePolicy(record.id)}
              okText="Yes"
              cancelText="No"
              okType="danger"
            >
              <Button
                type="primary"
                danger
                size="small"
                icon={<DeleteOutlined />}
              >
                Delete
              </Button>
            </Popconfirm>
          </motion.div>
        </Space>
      )
    }
  ];

  const editPolicy = (policy) => {
    setEditingPolicy(policy);

    // Format dates for DatePicker
    const formData = {
      policyName: policy.policyName || '',
      type: policy.type || '',
      amount: policy.amount || 0,
      issuedDate: policy.issuedDate ? dayjs(policy.issuedDate) : null,
      resolved: policy.resolved ? dayjs(policy.resolved) : null,
      penaltyId: policy.penaltyId || null
    };

    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const deletePolicy = async (id) => {
    try {
      await penaltyPoliciesAPI.delete(id);

      // Reload policies after deletion
      await loadPenaltyPolicies();

      notification.success({
        message: 'Policy Deleted Successfully',
        description: 'The penalty policy has been deleted.',
        placement: 'topRight',
        duration: 3,
      });
    } catch (error) {
      console.error('Error deleting policy:', error);
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to delete policy',
        placement: 'topRight',
        duration: 4,
      });
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Format dates for API
      // Structure penalty relationship: send { penalty: { id: penaltyId } } or null
      const policyData = {
        policyName: values.policyName,
        type: values.type,
        amount: values.amount || 0,
        issuedDate: values.issuedDate ? values.issuedDate.toISOString() : null,
        resolved: values.resolved ? values.resolved.toISOString() : null,
        penalty: values.penaltyId ? { id: values.penaltyId } : null
      };

      if (editingPolicy) {
        // Update existing policy
        console.log('Updating policy with data:', policyData);
        const response = await penaltyPoliciesAPI.update(editingPolicy.id, policyData);
        console.log('Update policy response:', response);

        notification.success({
          message: 'Success',
          description: 'Penalty policy updated successfully',
          placement: 'topRight',
          duration: 3,
        });
      } else {
        // Create new policy
        console.log('Creating policy with data:', policyData);
        const response = await penaltyPoliciesAPI.create(policyData);
        console.log('Create policy response:', response);

        notification.success({
          message: 'Success',
          description: 'Penalty policy created successfully',
          placement: 'topRight',
          duration: 3,
        });
      }

      // Reload policies after create/update
      await loadPenaltyPolicies();

      // Close modal and reset form
      setModalVisible(false);
      setEditingPolicy(null);
      form.resetFields();
    } catch (error) {
      console.error('Error saving policy:', error);
      notification.error({
        message: 'Error',
        description: error.response?.data?.message || error.message || 'Failed to save policy',
        placement: 'topRight',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          title="Penalty Policies Management"
          extra={
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingPolicy(null);
                  form.resetFields();
                  setModalVisible(true);
                }}
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  fontWeight: 'bold'
                }}
              >
                Add Policy
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
            dataSource={penaltyPolicies}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} policies`
            }}
          />
        </Card>
      </motion.div>

      {/* Add/Edit Policy Modal */}
      <Modal
        title={editingPolicy ? 'Edit Penalty Policy' : 'Add Penalty Policy'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingPolicy(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        centered
        destroyOnClose
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="policyName"
            label="Policy Name"
            rules={[{ required: true, message: 'Please enter policy name' }]}
          >
            <Input placeholder="Enter policy name" />
          </Form.Item>

          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select policy type">
              <Option value="damaged">Damaged</Option>
              <Option value="lost">Lost</Option>
              <Option value="lated">Late Return</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount (VND)"
            rules={[
              { required: true, message: 'Please enter amount' },
              { type: 'number', min: 0, message: 'Amount must be greater than or equal to 0' }
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              placeholder="Enter penalty amount"
            />
          </Form.Item>

          <Form.Item
            name="issuedDate"
            label="Issued Date"
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Select issued date"
            />
          </Form.Item>

          <Form.Item
            name="resolved"
            label="Resolved Date"
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Select resolved date"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                >
                  {editingPolicy ? 'Update' : 'Create'}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => {
                    setModalVisible(false);
                    setEditingPolicy(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </motion.div>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPortal;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { kitAPI, borrowingGroupAPI, studentGroupAPI, walletAPI, borrowingRequestAPI, walletTransactionAPI, penaltiesAPI, penaltyDetailAPI, notificationAPI, authAPI, paymentAPI, classesAPI } from './api';
import webSocketService from './utils/websocket';
import dayjs from 'dayjs';
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
  Switch,
  DatePicker,
  Drawer,
  Descriptions,
  Empty,
  Spin,
  Popover,
  notification
} from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  ToolOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  UploadOutlined,
  BellOutlined,
  DollarOutlined,
  BuildOutlined,
  InfoCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LoadingOutlined,
  RollbackOutlined,
  WalletOutlined,
  CrownOutlined,
  SearchOutlined
} from '@ant-design/icons';

// Default wallet structure for when API returns empty/null
const defaultWallet = { balance: 0, transactions: [] };

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Helper functions accessible to all components
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const formatDateTimeDisplay = (dateString) => {
  if (!dateString) return 'N/A';
  const date = dayjs(dateString);
  return date.isValid() ? date.format('DD/MM/YYYY HH:mm') : 'N/A';
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

const ACTIVE_BORROW_STATUSES = ['PENDING', 'APPROVED', 'BORROWED', 'IN_PROGRESS'];

function LeaderPortal({ user, onLogout }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [kits, setKits] = useState([]);
  const [group, setGroup] = useState(null);
  const [wallet, setWallet] = useState(defaultWallet);
  const [borrowingRequests, setBorrowingRequests] = useState([]);
  const [kitCheckInProgress, setKitCheckInProgress] = useState(null);
  const [penalties, setPenalties] = useState([]);
  const [penaltyDetails, setPenaltyDetails] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationPopoverOpen, setNotificationPopoverOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Modal states

  // State for kit detail modal
  const [kitDetailModalVisible, setKitDetailModalVisible] = useState(false);
  const [selectedKitDetail, setSelectedKitDetail] = useState(null);
  const [kitDetailModalType, setKitDetailModalType] = useState('kit-rental'); // 'kit-rental' or 'component-rental'
  const [componentQuantities, setComponentQuantities] = useState({}); // Store quantities for each component

  // State for rent component modal
  const [rentComponentModalVisible, setRentComponentModalVisible] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [componentQuantity, setComponentQuantity] = useState(1);
  const [componentExpectReturnDate, setComponentExpectReturnDate] = useState(null);
  const [componentReason, setComponentReason] = useState('');


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

  // Define loadData before useEffects that use it
  const loadData = useCallback(async () => {
    console.log('===== loadData function called =====');
    console.log('User in loadData:', user);
    console.log('User id in loadData:', user?.id);

    if (!user || !user.id) {
      console.warn('User or user.id is missing, cannot load data');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('===== Starting to load data =====');
      console.log('User info:', user);

      // Load student kits
      try {
        const kitsResponse = await kitAPI.getStudentKits();
        console.log('Student kits response:', kitsResponse);

        // Map KitResponse array from backend
        const kitsData = kitsResponse?.data || kitsResponse || [];
        const mappedKits = kitsData.map(kit => ({
          id: kit.id,
          name: kit.kitName,
          type: kit.type,
          status: kit.status,
          description: kit.description,
          imageUrl: kit.imageUrl,
          quantityTotal: kit.quantityTotal,
          quantityAvailable: kit.quantityAvailable,
          amount: kit.amount || 0,
          components: kit.components || []
        }));

        console.log('Mapped kits:', mappedKits);
        setKits(mappedKits);
      } catch (error) {
        console.error('Error loading kits:', error);
        setKits([]);
      }

      // Load wallet
      try {
        const walletResponse = await walletAPI.getMyWallet();
        console.log('Wallet response:', walletResponse);
        // Map wallet response to match expected structure
        const walletData = walletResponse?.data || walletResponse || {};

        // Load transaction history separately
        let transactions = [];
        try {
          const transactionHistoryResponse = await walletTransactionAPI.getHistory();
          const transactionData = Array.isArray(transactionHistoryResponse)
            ? transactionHistoryResponse
            : (transactionHistoryResponse?.data || []);

          transactions = transactionData.map(txn => ({
            type: txn.type || txn.transactionType || 'UNKNOWN',
            amount: txn.amount || 0,
            previousBalance: txn.previousBalance || null,
            date: txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('vi-VN') : 'N/A',
            description: txn.description || '',
            status: txn.status || txn.transactionStatus || 'COMPLETED',
            id: txn.id
          }));
        } catch (txnError) {
          console.error('Error loading transaction history:', txnError);
        }

        setWallet({
          balance: walletData.balance || 0,
          transactions: transactions
        });
      } catch (error) {
        console.error('Error loading wallet:', error);
        setWallet(defaultWallet);
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
      }

      // Load group info from borrowing group API
      try {
        // Load all classes first to get semester information (similar to LecturerPortal)
        let allClasses = [];
        try {
          const classesResponse = await classesAPI.getAllClasses();
          allClasses = Array.isArray(classesResponse)
            ? classesResponse
            : (classesResponse?.data || []);
          console.log('All classes loaded:', allClasses);
        } catch (classesError) {
          console.error('Error loading classes:', classesError);
        }

        let groupId = user?.borrowingGroupInfo?.groupId;

        console.log('Initial groupId from user.borrowingGroupInfo:', groupId);
        console.log('User object:', user);

        // If no groupId from user info, try to get it from borrowing groups
        if (!groupId && user.id) {
          console.log('No groupId in user info, trying to get from borrowing groups...');
          console.log('Calling borrowingGroupAPI.getByAccountId with user.id:', user.id);
          const borrowingGroups = await borrowingGroupAPI.getByAccountId(user.id);
          console.log('User borrowing groups response:', borrowingGroups);

          if (borrowingGroups && borrowingGroups.length > 0) {
            groupId = borrowingGroups[0].studentGroupId;
            console.log('Found groupId from borrowing groups:', groupId);
          } else {
            console.warn('No borrowing groups found for user');
          }
        }

        if (groupId) {
          console.log('Loading group info for groupId:', groupId);
          const borrowingGroups = await borrowingGroupAPI.getByStudentGroupId(groupId);
          console.log('Borrowing groups response:', borrowingGroups);

          // Get student group details
          const studentGroup = await studentGroupAPI.getById(groupId);
          console.log('Student group response:', studentGroup);

          if (studentGroup) {
            // Map borrowing groups to members
            const members = borrowingGroups.map(bg => ({
              name: bg.accountName || bg.accountEmail,
              email: bg.accountEmail,
              role: bg.roles
            }));

            // Find leader
            const leaderMember = members.find(member => (member.role || '').toUpperCase() === 'LEADER');

            // Find class to get semester from allClasses array (similar to LecturerPortal)
            let semester = null;
            if (studentGroup.classId) {
              const classInfo = allClasses.find(cls => cls.id === studentGroup.classId);
              semester = classInfo?.semester || null;
              console.log('Class info for semester:', classInfo, 'Semester:', semester);
            } else {
              console.warn('Student group has no classId');
            }

            const groupData = {
              id: studentGroup.id,
              name: studentGroup.groupName,
              leader: leaderMember ? (leaderMember.name || leaderMember.email) : user.email,
              leaderEmail: leaderMember?.email || user.email,
              members: members.filter(m => (m.role || '').toUpperCase() === 'MEMBER'),
              lecturer: studentGroup.lecturerEmail,
              lecturerName: studentGroup.lecturerName,
              classCode: studentGroup.className || null, // className from backend contains classCode
              classId: studentGroup.classId || null,
              semester: semester,
              status: studentGroup.status ? 'active' : 'inactive'
            };

            console.log('Processed group data:', groupData);
            setGroup(groupData);
          }
        } else {
          console.warn('No group found for user');
          setGroup(null);
        }
      } catch (error) {
        console.error('Error loading group info:', error);
        setGroup(null);
      }

      // Load current borrowing requests to prevent duplicate rentals
      try {
        if (user?.id) {
          const requests = await borrowingRequestAPI.getByUser(user.id);
          const normalizedRequests = Array.isArray(requests)
            ? requests
            : (requests?.data || []);
          setBorrowingRequests(normalizedRequests);
        } else {
          setBorrowingRequests([]);
        }
      } catch (error) {
        console.error('Error loading borrowing requests:', error);
        setBorrowingRequests([]);
      }

      // Mock refund requests for now (can be replaced with API later)

      console.log('Leader data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handlePayPalReturn = useCallback(async (paymentId, payerId) => {
    try {
      // Check if this payment has already been processed successfully
      const successKey = `paypal_success_${paymentId}`;
      if (sessionStorage.getItem(successKey)) {
        console.log('Payment already processed successfully, skipping duplicate execution');
        return;
      }

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
        // Mark as successfully processed to prevent duplicate messages
        sessionStorage.setItem(successKey, 'true');

        message.success('Payment successful! Wallet balance has been updated.');

        // Clear stored payment info
        sessionStorage.removeItem('pendingPayPalPayment');

        // Clean URL immediately
        window.history.replaceState({}, document.title, window.location.pathname);

        // Wait longer for backend to process the payment
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Reload wallet and data - reload wallet directly first
        console.log('Reloading wallet after payment success...');
        try {
          // Reload wallet manually first
          const walletResponse = await walletAPI.getMyWallet();
          const walletData = walletResponse?.data || walletResponse || {};

          // Fetch transaction history
          let transactions = [];
          try {
            const transactionHistoryResponse = await walletTransactionAPI.getHistory();
            const transactionData = Array.isArray(transactionHistoryResponse)
              ? transactionHistoryResponse
              : (transactionHistoryResponse?.data || []);

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
          }

          setWallet({
            balance: walletData.balance || 0,
            transactions: transactions
          });

          // Wait a bit more and then call loadData to reload all data
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('Calling loadData to reload all data...');

          // Ensure loadData is available before calling
          if (loadData && typeof loadData === 'function') {
            try {
              await loadData();
              console.log('loadData completed - all data reloaded');
            } catch (loadError) {
              console.error('Error calling loadData:', loadError);
              // Fallback: reload the page if loadData fails
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          } else {
            console.warn('loadData not available, reloading page to ensure all data is refreshed');
            // Force reload page to ensure all data is refreshed
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }

          // After successful top-up, check if we need to redirect back to rental request flow
          try {
            const redirectInfoRaw = sessionStorage.getItem('afterTopupRedirect');
            if (redirectInfoRaw) {
              sessionStorage.removeItem('afterTopupRedirect');
              const redirectInfo = JSON.parse(redirectInfoRaw);
              if (redirectInfo?.type === 'RENTAL_KIT' && redirectInfo.kitId && user) {
                console.log('Redirecting back to rental request after top-up:', redirectInfo);
                navigate('/rental-request', {
                  state: {
                    kitId: redirectInfo.kitId,
                    user
                  }
                });
                return; // Exit early to prevent further execution
              }
            }
          } catch (redirectError) {
            console.error('Error handling afterTopupRedirect:', redirectError);
          }
        } catch (error) {
          console.error('Error reloading wallet:', error);
          // Fallback: reload the page
          window.location.reload();
        }
      } else {
        message.error('Payment execution failed. Please try again.');
      }
    } catch (error) {
      console.error('PayPal payment execution error:', error);

      // Check if error is about payment already done
      if (error.message && (error.message.includes('PAYMENT_ALREADY_DONE') || error.message.includes('already completed'))) {
        // Check if this message has already been shown
        const successKey = `paypal_success_${paymentId}`;
        if (!sessionStorage.getItem(successKey)) {
          sessionStorage.setItem(successKey, 'true');
          message.success('Payment was already completed successfully!');
        }

        // Clear stored payment info
        sessionStorage.removeItem('pendingPayPalPayment');

        // Clean URL immediately
        window.history.replaceState({}, document.title, window.location.pathname);

        // Wait longer for backend to process
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Reload wallet and data
        console.log('Reloading wallet after PAYMENT_ALREADY_DONE...');
        try {
          // Reload wallet manually first
          const walletResponse = await walletAPI.getMyWallet();
          const walletData = walletResponse?.data || walletResponse || {};

          // Fetch transaction history
          let transactions = [];
          try {
            const transactionHistoryResponse = await walletTransactionAPI.getHistory();
            const transactionData = Array.isArray(transactionHistoryResponse)
              ? transactionHistoryResponse
              : (transactionHistoryResponse?.data || []);

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
          }

          setWallet({
            balance: walletData.balance || 0,
            transactions: transactions
          });

          // Wait a bit more and then call loadData to reload all data
          await new Promise(resolve => setTimeout(resolve, 500));
          console.log('Calling loadData to reload all data...');

          // Ensure loadData is available before calling
          if (loadData && typeof loadData === 'function') {
            try {
              await loadData();
              console.log('loadData completed - all data reloaded');
            } catch (loadError) {
              console.error('Error calling loadData:', loadError);
              // Fallback: reload the page if loadData fails
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          } else {
            console.warn('loadData not available, reloading page to ensure all data is refreshed');
            // Force reload page to ensure all data is refreshed
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }

          // After successful top-up (already done), check redirect flag
          try {
            const redirectInfoRaw = sessionStorage.getItem('afterTopupRedirect');
            if (redirectInfoRaw) {
              sessionStorage.removeItem('afterTopupRedirect');
              const redirectInfo = JSON.parse(redirectInfoRaw);
              if (redirectInfo?.type === 'RENTAL_KIT' && redirectInfo.kitId && user) {
                console.log('Redirecting back to rental request after PAYMENT_ALREADY_DONE:', redirectInfo);
                navigate('/rental-request', {
                  state: {
                    kitId: redirectInfo.kitId,
                    user
                  }
                });
                return; // Exit early to prevent further execution
              }
            }
          } catch (redirectError) {
            console.error('Error handling afterTopupRedirect (PAYMENT_ALREADY_DONE):', redirectError);
          }
        } catch (error) {
          console.error('Error reloading wallet:', error);
          // Fallback: reload the page
          window.location.reload();
        }
      } else {
        message.error(error.message || 'Payment execution failed. Please try again.');
        sessionStorage.removeItem('pendingPayPalPayment');
      }
    }
  }, [loadData]);

  const handlePayPalCancel = () => {
    message.warning('Payment was cancelled');
    sessionStorage.removeItem('pendingPayPalPayment');
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleRentKit = useCallback(async (kit) => {
    if (!kit?.id) {
      message.error('Không thể xác định kit để thuê.');
      return;
    }
    if (!user || !user.id) {
      message.error('Không thể xác định tài khoản. Vui lòng đăng nhập lại.');
      return;
    }

    setKitCheckInProgress(kit.id);
    try {
      const requests = await borrowingRequestAPI.getByUser(user.id);
      const normalizedRequests = Array.isArray(requests)
        ? requests
        : (requests?.data || []);
      setBorrowingRequests(normalizedRequests);

      const duplicatedRequest = normalizedRequests.find((request) => {
        const requestKitId = request?.kit?.id || request?.kitId;
        const status = (request?.status || '').toUpperCase();
        return requestKitId === kit.id && ACTIVE_BORROW_STATUSES.includes(status);
      });

      if (duplicatedRequest) {
        const kitName =
          duplicatedRequest?.kit?.kitName ||
          kit?.kitName ||
          kit?.name ||
          'kit';
        const statusLabel = duplicatedRequest.status || 'PENDING';
        const description = `Bạn đã có yêu cầu thuê kit ${kitName} với trạng thái ${statusLabel}. Vui lòng hoàn tất yêu cầu hiện tại trước khi gửi yêu cầu mới.`;
        message.warning(description);
        notification.warning({
          message: 'Kit đã được yêu cầu trước đó',
          description,
          placement: 'topRight',
          duration: 6,
        });
        return;
      }

      navigate('/rental-request', {
        state: {
          kitId: kit.id,
          user: user,
        },
      });
    } catch (error) {
      console.error('Error checking existing rentals:', error);
      message.error(error.message || 'Không thể kiểm tra yêu cầu hiện tại. Vui lòng thử lại.');
    } finally {
      setKitCheckInProgress(null);
    }
  }, [navigate, user]);

  // Handle PayPal return callback at portal level
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentId = urlParams.get('paymentId');
    const payerId = urlParams.get('PayerID');
    const isCancel = urlParams.get('cancel') === 'true' || window.location.pathname.includes('paypal-cancel');

    console.log('PayPal return check:', {
      paymentId,
      payerId,
      isCancel,
      hasUser: !!user,
      hasLoadData: !!loadData
    });

    // Handle cancel immediately
    if (isCancel) {
      handlePayPalCancel();
      return;
    }

    // If no PayPal return parameters, skip
    if (!paymentId || !payerId) {
      return;
    }

    // Use sessionStorage to prevent duplicate execution (more reliable than ref)
    const processingKey = `paypal_processing_${paymentId}`;
    if (sessionStorage.getItem(processingKey)) {
      console.log('PayPal return already being processed, skipping');
      return;
    }

    // Process payment when user and loadData are ready
    if (user && loadData) {
      // Mark as processing immediately using sessionStorage
      sessionStorage.setItem(processingKey, 'true');

      console.log('Processing PayPal return immediately...', { paymentId, payerId, userId: user?.id });

      handlePayPalReturn(paymentId, payerId)
        .then(() => {
          // Clear processing flag after successful processing
          setTimeout(() => {
            sessionStorage.removeItem(processingKey);
          }, 5000);
        })
        .catch((error) => {
          console.error('Error in PayPal return processing:', error);
          // Clear processing flag on error to allow retry
          sessionStorage.removeItem(processingKey);
        });
    } else {
      console.log('Waiting for user or loadData...', { hasUser: !!user, hasLoadData: !!loadData });
    }
  }, [loadData, handlePayPalReturn, user]);

  useEffect(() => {
    console.log('===== LeaderPortal useEffect triggered =====');
    console.log('User object:', user);
    console.log('User id:', user?.id);
    console.log('User email:', user?.email);

    if (user && user.id) {
      console.log('User exists, calling loadData...');
      loadData();
    } else {
      console.warn('User is null or user.id is missing');
      setLoading(false);
    }
  }, [user, loadData]);

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

  const notificationSubscriptionRef = useRef(null);
  const rentalRequestSubscriptionRef = useRef(null);
  const walletSubscriptionRef = useRef(null);
  const walletTransactionSubscriptionRef = useRef(null);
  const penaltySubscriptionRef = useRef(null);
  const groupSubscriptionRef = useRef(null);

  useEffect(() => {
    if (user && user.id) {
      loadNotifications();

      // Connect to WebSocket and subscribe to user notifications
      webSocketService.connect(
        () => {
          console.log('WebSocket connected for leader notifications');
          const userId = user.id.toString();

          // Subscribe to user notifications
          notificationSubscriptionRef.current = webSocketService.subscribeToUserNotifications(userId, (data) => {
            console.log('Received new notification via WebSocket:', data);
            // Add new notification to the list
            setNotifications(prev => {
              const exists = prev.find(notif => notif.id === data.id);
              if (!exists) {
                // Show browser notification
                notification.info({
                  message: data.title || 'New Notification',
                  description: data.message,
                  placement: 'topRight',
                  duration: 5,
                });
                // Add new notification and sort by createdAt descending (newest first)
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

          // Subscribe to rental request updates
          rentalRequestSubscriptionRef.current = webSocketService.subscribeToUserRentalRequests(userId, (data) => {
            console.log('Received rental request update via WebSocket:', data);

            // Update borrowingRequests when rental request status changes
            setBorrowingRequests(prev => {
              const exists = prev.find(req => req.id === data.id);
              if (exists) {
                // Update existing request
                return prev.map(req => req.id === data.id ? data : req);
              } else {
                // Add new request
                return [data, ...prev];
              }
            });

            // Show notification if status changed to APPROVED or REJECTED
            if (data.status === 'APPROVED' || data.status === 'REJECTED') {
              notification.info({
                message: data.status === 'APPROVED' ? 'Request Approved' : 'Request Rejected',
                description: `Your rental request for ${data.kit?.kitName || 'kit'} has been ${data.status.toLowerCase()}.`,
                placement: 'topRight',
                duration: 5,
              });
            }
          });

          // Subscribe to wallet updates
          walletSubscriptionRef.current = webSocketService.subscribeToUserWallet(userId, async (data) => {
            console.log('Received wallet update via WebSocket:', data);
            if (data.balance !== undefined) {
              setWallet(prev => ({
                ...prev,
                balance: data.balance
              }));

              // Reload wallet to ensure data is synchronized
              try {
                const walletResponse = await walletAPI.getMyWallet();
                const walletData = walletResponse?.data || walletResponse;
                if (walletData) {
                  setWallet({
                    balance: walletData.balance || 0,
                    transactions: walletData.transactions || []
                  });
                }
              } catch (error) {
                console.error('Error reloading wallet after WebSocket update:', error);
              }
            }
          });

          // Subscribe to wallet transactions
          walletTransactionSubscriptionRef.current = webSocketService.subscribeToUserWalletTransactions(userId, (data) => {
            console.log('Received wallet transaction via WebSocket:', data);
            setWallet(prev => {
              const newTransaction = {
                type: data.type || data.transactionType || 'UNKNOWN',
                amount: data.amount || 0,
                date: data.createdAt ? new Date(data.createdAt).toLocaleDateString('vi-VN') : 'N/A',
                description: data.description || '',
                status: data.status || data.transactionStatus || 'COMPLETED',
                id: data.id
              };

              // Check if transaction already exists
              const exists = prev.transactions.find(txn => txn.id === data.id);
              if (!exists) {
                // Add new transaction at the beginning
                return {
                  ...prev,
                  transactions: [newTransaction, ...prev.transactions]
                };
              }
              return prev;
            });
          });

          // Subscribe to penalty updates
          penaltySubscriptionRef.current = webSocketService.subscribeToUserPenalties(userId, (data) => {
            console.log('Received penalty update via WebSocket:', data);
            setPenalties(prev => {
              const exists = prev.find(penalty => penalty.id === data.id);
              if (!exists) {
                // Add new penalty
                notification.info({
                  message: 'New Penalty',
                  description: `You have a new penalty: ${data.note || 'Penalty assigned'}`,
                  placement: 'topRight',
                  duration: 5,
                });
                return [data, ...prev];
              } else {
                // Update existing penalty
                return prev.map(penalty => penalty.id === data.id ? data : penalty);
              }
            });
          });

          // Subscribe to group updates (for leaders)
          groupSubscriptionRef.current = webSocketService.subscribeToUserGroups(userId, (data) => {
            console.log('Received group update via WebSocket:', data);
            setGroup(prev => {
              if (prev && prev.id === data.id) {
                // Update existing group
                return {
                  ...prev,
                  name: data.groupName || prev.name,
                  lecturer: data.lecturerEmail || prev.lecturer,
                  lecturerName: data.lecturerName || prev.lecturerName,
                  status: data.status ? 'active' : 'inactive',
                  classCode: data.className || data.classCode || prev.classCode
                };
              } else if (!prev && data.id) {
                // Add new group if user is part of it
                notification.info({
                  message: 'Group Update',
                  description: `Group "${data.groupName}" has been updated.`,
                  placement: 'topRight',
                  duration: 5,
                });
                // Reload group data
                loadData();
              }
              return prev;
            });
          });
        },
        (error) => {
          console.error('WebSocket connection error:', error);
        }
      );
    }

    // Cleanup on unmount
    return () => {
      if (notificationSubscriptionRef.current) {
        webSocketService.unsubscribe(notificationSubscriptionRef.current);
      }
      if (rentalRequestSubscriptionRef.current) {
        webSocketService.unsubscribe(rentalRequestSubscriptionRef.current);
      }
      if (walletSubscriptionRef.current) {
        webSocketService.unsubscribe(walletSubscriptionRef.current);
      }
      if (walletTransactionSubscriptionRef.current) {
        webSocketService.unsubscribe(walletTransactionSubscriptionRef.current);
      }
      if (penaltySubscriptionRef.current) {
        webSocketService.unsubscribe(penaltySubscriptionRef.current);
      }
      if (groupSubscriptionRef.current) {
        webSocketService.unsubscribe(groupSubscriptionRef.current);
      }
      webSocketService.disconnect();
    };
  }, [user, loadData]);

  const unreadNotificationsCount = notifications.filter((item) => !item.isRead).length;

  const notificationTypeStyles = {
    ALERT: { color: 'volcano', label: 'Cảnh báo' },
    DEPOSIT: { color: 'green', label: 'Giao dịch ví' },
    SYSTEM: { color: 'blue', label: 'Hệ thống' },
    USER: { color: 'purple', label: 'Người dùng' }
  };

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

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'group',
      icon: <TeamOutlined />,
      label: 'Group Management',
    },
    {
      key: 'kits',
      icon: <ToolOutlined />,
      label: 'Kit Rental',
    },
    {
      key: 'kit-component-rental',
      icon: <BuildOutlined />,
      label: 'Kit Component Rental',
    },
    {
      key: 'borrow-tracking',
      icon: <EyeOutlined />,
      label: 'Borrow Tracking',
    },
    {
      key: 'wallet',
      icon: <WalletOutlined />,
      label: 'Wallet',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  const handleViewKitDetail = (kit, modalType = 'kit-rental') => {
    setSelectedKitDetail(kit);
    setKitDetailModalType(modalType);
    setKitDetailModalVisible(true);
  };

  const handleComponentQuantityChange = (componentId, quantity) => {
    setComponentQuantities(prev => ({
      ...prev,
      [componentId]: quantity
    }));
  };

  const handleCloseKitDetailModal = () => {
    setKitDetailModalVisible(false);
    setSelectedKitDetail(null);
    setComponentQuantities({});
  };

  const handleRentComponent = (component) => {
    // If component has rentQuantity, use it; otherwise default to 1
    const qty = component.rentQuantity || componentQuantity || 1;
    setSelectedComponent(component);
    setComponentQuantity(qty);
    setRentComponentModalVisible(true);
  };

  const handleCloseRentComponentModal = () => {
    setRentComponentModalVisible(false);
    setSelectedComponent(null);
    setComponentQuantity(1);
    setComponentExpectReturnDate(null);
    setComponentReason('');
  };

  const handleConfirmRentComponent = async () => {
    if (!selectedComponent || componentQuantity <= 0) {
      message.error('Please enter a valid quantity');
      return;
    }

    if (componentQuantity > selectedComponent.quantityAvailable) {
      message.error('Quantity exceeds available amount');
      return;
    }

    if (!componentExpectReturnDate) {
      message.error('Please select expected return date');
      return;
    }

    if (!componentReason || componentReason.trim() === '') {
      message.error('Please provide a reason for renting this component');
      return;
    }

    // Check if wallet has enough balance for deposit
    const depositAmount = (selectedComponent.pricePerCom || 0) * componentQuantity;
    if (wallet.balance < depositAmount) {
      message.error(`Insufficient wallet balance. You need ${depositAmount.toLocaleString()} VND but only have ${wallet.balance.toLocaleString()} VND. Please top up your wallet.`);
      return;
    }

    try {
      const requestData = {
        kitComponentsId: selectedComponent.id,
        componentName: selectedComponent.componentName,
        quantity: componentQuantity,
        reason: componentReason,
        depositAmount: depositAmount,
        expectReturnDate: componentExpectReturnDate
      };

      console.log('Component request data:', requestData);

      const response = await borrowingRequestAPI.createComponentRequest(requestData);

      if (response) {
        try {
          await notificationAPI.createNotifications([
            {
              subType: 'RENTAL_REQUEST',
              title: 'Đã gửi yêu cầu thuê linh kiện',
              message: `Bạn đã gửi yêu cầu thuê ${selectedComponent.componentName} x${componentQuantity}.`
            },
            {
              subType: 'BORROW_REQUEST_CREATED',
              title: 'Yêu cầu mượn linh kiện mới',
              message: `${user?.fullName || user?.email || 'Thành viên'} đã gửi yêu cầu thuê ${selectedComponent.componentName} x${componentQuantity}.`
            }
          ]);
        } catch (notifyError) {
          console.error('Error sending notifications:', notifyError);
        }
        message.success('Component rental request created successfully! Waiting for admin approval.');
        handleCloseRentComponentModal();
      }
    } catch (error) {
      console.error('Error creating component request:', error);
      const errorMessage = error.message || 'Unknown error';

      // Check if it's an insufficient balance error
      if (errorMessage.includes('Insufficient wallet balance') || errorMessage.includes('balance')) {
        message.error({
          content: errorMessage,
          duration: 5,
        });
        notification.error({
          message: 'Insufficient Balance',
          description: errorMessage,
          placement: 'topRight',
          duration: 5,
        });

        // Create notification in database for insufficient balance
        try {
          await notificationAPI.createNotifications([
            {
              subType: 'RENTAL_FAILED_INSUFFICIENT_BALANCE',
              title: 'Số dư không đủ',
              message: `Không thể thuê ${selectedComponent.componentName} do số dư ví không đủ. ${errorMessage}`
            }
          ]);
        } catch (notifyError) {
          console.error('Error creating insufficient balance notification:', notifyError);
        }
      } else {
        message.error('Failed to create component request: ' + errorMessage);
      }
    }
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
            {collapsed ? 'LDR' : 'Leader Portal'}
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
                  icon={<CrownOutlined />}
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
                {selectedKey === 'dashboard' && <DashboardContent group={group} wallet={wallet} kits={kits} penalties={penalties} penaltyDetails={penaltyDetails} />}
                {selectedKey === 'group' && <GroupManagement group={group} />}
                {selectedKey === 'kits' && (
                  <KitRental
                    kits={kits}
                    onViewKitDetail={(kit) => handleViewKitDetail(kit, 'kit-rental')}
                    onRentKit={handleRentKit}
                    checkingKitId={kitCheckInProgress}
                  />
                )}
                {selectedKey === 'kit-component-rental' && <KitComponentRental kits={kits} user={user} onViewKitDetail={(kit) => handleViewKitDetail(kit, 'component-rental')} onRentComponent={handleRentComponent} />}
                {selectedKey === 'borrow-tracking' && <BorrowTracking borrowingRequests={borrowingRequests} setBorrowingRequests={setBorrowingRequests} user={user} penalties={penalties} penaltyDetails={penaltyDetails} />}
                {selectedKey === 'wallet' && <WalletManagement wallet={wallet} setWallet={setWallet} />}
                {selectedKey === 'profile' && <ProfileManagement profile={profile} setProfile={setProfile} loading={profileLoading} setLoading={setProfileLoading} user={user} />}
              </motion.div>
            </AnimatePresence>
          </Spin>
        </Content>
      </Layout>

      {/* Rent Component Modal */}
      <Modal
        title="Rent Component"
        open={rentComponentModalVisible}
        onCancel={handleCloseRentComponentModal}
        footer={[
          <Button key="cancel" onClick={handleCloseRentComponentModal}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmRentComponent}>
            Confirm Rent
          </Button>
        ]}
      >
        {selectedComponent && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Component Name">
              <Text strong>{selectedComponent.componentName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color="purple">{selectedComponent.componentType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Available">
              {selectedComponent.quantityAvailable || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Price per Unit">
              <Text strong style={{ color: '#1890ff' }}>
                {selectedComponent.pricePerCom?.toLocaleString() || '0'} VND
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">
              <Input
                type="number"
                min={1}
                max={selectedComponent.quantityAvailable}
                value={componentQuantity}
                onChange={(e) => setComponentQuantity(parseInt(e.target.value) || 1)}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Total Price">
              <Text strong style={{ color: '#52c41a', fontSize: '18px' }}>
                {((selectedComponent.pricePerCom || 0) * componentQuantity).toLocaleString()} VND
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Expected Return Date">
              <DatePicker
                style={{ width: '100%' }}
                value={componentExpectReturnDate}
                onChange={(date) => setComponentExpectReturnDate(date)}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                showTime
              />
            </Descriptions.Item>
            <Descriptions.Item label="Reason">
              <TextArea
                rows={4}
                placeholder="Please provide reason for renting this component..."
                value={componentReason}
                onChange={(e) => setComponentReason(e.target.value)}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Kit Detail Modal */}
      <Modal
        title="Kit Details"
        open={kitDetailModalVisible}
        onCancel={handleCloseKitDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseKitDetailModal}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedKitDetail && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Kit Name" span={2}>
                <Text strong style={{ fontSize: '18px' }}>{selectedKitDetail.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag color="blue">{selectedKitDetail.type || 'N/A'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedKitDetail.status)}>
                  {selectedKitDetail.status || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Available">
                {selectedKitDetail.quantityAvailable || 0} / {selectedKitDetail.quantityTotal || 0}
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                  {selectedKitDetail.amount?.toLocaleString() || '0'} VND
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedKitDetail.description || 'No description'}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Kit Components</Divider>

            {selectedKitDetail.components && selectedKitDetail.components.length > 0 ? (
              <Table
                dataSource={selectedKitDetail.components}
                columns={[
                  {
                    title: 'Component Name',
                    dataIndex: 'componentName',
                    key: 'componentName',
                  },
                  {
                    title: 'Amount',
                    dataIndex: 'pricePerCom',
                    key: 'pricePerCom',
                    render: (pricePerCom) => (
                      <Text strong style={{ color: '#1890ff' }}>
                        {pricePerCom ? pricePerCom.toLocaleString() : '0'} VND
                      </Text>
                    )
                  },
                  {
                    title: 'Type',
                    dataIndex: 'componentType',
                    key: 'componentType',
                    render: (type) => <Tag color="purple">{type || 'N/A'}</Tag>
                  },
                  // Show quantity column based on modal type
                  ...(kitDetailModalType === 'component-rental' ? [
                    {
                      title: 'Available',
                      dataIndex: 'quantityAvailable',
                      key: 'quantityAvailable',
                    }
                  ] : [
                    {
                      title: 'Quantity',
                      dataIndex: 'quantityTotal',
                      key: 'quantityTotal',
                      render: (quantityTotal) => quantityTotal || 0
                    }
                  ]),
                  {
                    title: 'Description',
                    dataIndex: 'description',
                    key: 'description',
                    ellipsis: true,
                  },
                  // Only show Quantity input and Actions column for component-rental modal type
                  ...(kitDetailModalType === 'component-rental' ? [
                    {
                      title: 'Rent Quantity',
                      key: 'rentQuantity',
                      render: (_, record) => (
                        <Input
                          type="number"
                          min={1}
                          max={record.quantityAvailable || 0}
                          value={componentQuantities[record.id] || 1}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value) || 1;
                            // Validate: ensure quantity doesn't exceed available
                            const validQty = Math.min(qty, record.quantityAvailable || 0);
                            handleComponentQuantityChange(record.id, validQty > 0 ? validQty : 1);
                          }}
                          onBlur={(e) => {
                            const qty = parseInt(e.target.value) || 1;
                            const available = record.quantityAvailable || 0;
                            if (qty > available) {
                              message.warning(`Quantity cannot exceed available amount (${available})`);
                              handleComponentQuantityChange(record.id, available);
                            }
                          }}
                          style={{ width: 80 }}
                        />
                      ),
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (_, record) => {
                        const qty = componentQuantities[record.id] || 1;
                        const available = record.quantityAvailable || 0;
                        const exceedsAvailable = qty > available;
                        const isSoldOut = available === 0;
                        return (
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => {
                              if (qty > available) {
                                message.error(`Cannot rent ${qty} items. Only ${available} available.`);
                                return;
                              }
                              const componentWithQty = { ...record, rentQuantity: qty };
                              handleRentComponent(componentWithQty);
                            }}
                            disabled={!available || available === 0 || exceedsAvailable}
                          >
                            {isSoldOut ? 'Sold out' : 'Rent'}
                          </Button>
                        );
                      },
                    }
                  ] : []),
                ]}
                rowKey={(record, index) => record.id || index}
                pagination={false}
                size="small"
              />
            ) : (
              <Empty description="No components available" />
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
}

// Dashboard Component
const DashboardContent = ({ group, wallet, kits, penalties, penaltyDetails }) => (
  <div>
    <Row gutter={[24, 24]}>
      {/* Group Stats */}
      <Col xs={24} sm={12} lg={6}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Group Members"
              value={group ? group.members.length + 1 : 0}
              prefix={<TeamOutlined style={{ color: '#667eea' }} />}
              valueStyle={{ color: '#667eea', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Wallet Balance"
              value={wallet.balance || 0}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix="VND"
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Available Kits"
              value={kits.filter(kit => kit.status === 'AVAILABLE').length}
              prefix={<ToolOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Active Rentals"
              value={2}
              prefix={<ShoppingOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
    </Row>

    <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
      <Col xs={24} lg={12}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card
            title="Group Information"
            style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          >
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
              <Empty description="No group found for this leader" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </motion.div>
      </Col>

      <Col xs={24} lg={12}>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <Card
            title="Recent Transactions"
            style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          >
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

    {/* Penalties Section */}
    {penalties && penalties.length > 0 && (
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Card
              title={
                <Space>
                  <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                  <span>Penalties</span>
                </Space>
              }
              style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <List
                dataSource={penalties.filter(p => !p.resolved)}
                renderItem={(penalty) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={<ExclamationCircleOutlined />}
                          style={{ backgroundColor: penalty.resolved ? '#52c41a' : '#fa8c16' }}
                        />
                      }
                      title={
                        <Space>
                          <Text strong>
                            {penalty.note || 'Penalty Fee'}
                          </Text>
                          {!penalty.resolved && (
                            <Tag color="error">Unresolved</Tag>
                          )}
                          {penalty.resolved && (
                            <Tag color="success">Resolved</Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Text>
                            Amount: <Text strong style={{ color: '#ff4d4f' }}>
                              {penalty.totalAmount ? penalty.totalAmount.toLocaleString() : 0} VND
                            </Text>
                          </Text>
                          {penalty.takeEffectDate && (
                            <Text type="secondary">
                              Date: {new Date(penalty.takeEffectDate).toLocaleString('vi-VN')}
                            </Text>
                          )}
                          {penaltyDetails[penalty.id] && penaltyDetails[penalty.id].length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <Text strong style={{ fontSize: 12 }}>Penalty Details:</Text>
                              {penaltyDetails[penalty.id].map((detail, idx) => (
                                <div key={idx} style={{ marginLeft: 16, marginTop: 4 }}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    • {detail.description || 'N/A'}: {detail.amount ? detail.amount.toLocaleString() : 0} VND
                                  </Text>
                                </div>
                              ))}
                            </div>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>
    )}
  </div>
);

// Group Management Component
const GroupManagement = ({ group }) => {
  console.log('GroupManagement - group data:', group);

  return (
    <div>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Card
          title="Group Information"
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
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
                    <Descriptions.Item label="Semester">
                      <Tag color="purple">{group.semester || 'N/A'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag color={group.status === 'active' ? 'success' : 'error'}>
                        {group.status || 'inactive'}
                      </Tag>
                    </Descriptions.Item>
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
            <Empty description="No group information available" />
          )}
        </Card>
      </motion.div>
    </div>
  );
};

// Kit Rental Component
const KitRental = ({ kits, onViewKitDetail, onRentKit, checkingKitId }) => {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const { Option } = Select;

  const handleRentClick = (kit) => {
    if (onRentKit) {
      onRentKit(kit);
    }
  };

  // Filter kits
  const filteredKits = kits.filter(kit => {
    // Filter by available quantity
    if (kit.quantityAvailable <= 0) return false;

    // Filter by search text
    if (searchText && searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase();
      const kitName = (kit.name || kit.kitName || '').toLowerCase();
      const kitId = (kit.id || '').toString().toLowerCase();
      if (!kitName.includes(searchLower) && !kitId.includes(searchLower)) {
        return false;
      }
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (kit.status !== filterStatus) {
        return false;
      }
    }

    // Filter by type
    if (filterType !== 'all') {
      if (kit.type !== filterType) {
        return false;
      }
    }

    return true;
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          title="Kit Rental"
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
                  <Option value="BORROWED">Borrowed</Option>
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
              description="No kits available for rental"
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
                              color={kit.status === 'AVAILABLE' ? 'green' : kit.status === 'BORROWED' ? 'orange' : 'red'}
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
                          key="rent"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            type="primary"
                            icon={<ShoppingOutlined />}
                            onClick={() => handleRentClick(kit)}
                            disabled={kit.quantityAvailable === 0 || checkingKitId === kit.id}
                            loading={checkingKitId === kit.id}
                            style={{
                              color: '#fff',
                              width: '100%',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              border: 'none',
                              fontWeight: 'bold'
                            }}
                          >
                            Rent
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
                            onClick={() => onViewKitDetail(kit)}
                            style={{ color: '#52c41a' }}
                          >
                            View Details
                          </Button>
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
                            onClick={() => onViewKitDetail(kit)}
                          >
                            {kit.name || kit.kitName || 'Unnamed Kit'}
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
                                <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
                                  {kit.amount ? `${Number(kit.amount).toLocaleString()} VND` : '0 VND'}
                                </Text>
                              </div>
                              {kit.description && (
                                <div style={{ marginTop: 8 }}>
                                  <Text type="secondary" style={{ fontSize: '12px' }} ellipsis>
                                    {kit.description}
                                  </Text>
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
          )}

          {/* Pagination Info */}
          {filteredKits.length > 0 && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Text type="secondary">
                Showing {filteredKits.length} of {kits.filter(k => k.quantityAvailable > 0).length} available kit(s)
              </Text>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

// Kit Component Rental Component
const KitComponentRental = ({ kits, user, onViewKitDetail, onRentComponent }) => {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const { Option } = Select;

  // Filter kits
  const filteredKits = kits.filter(kit => {
    // Filter by available quantity
    if (kit.quantityAvailable <= 0) return false;

    // Filter by search text
    if (searchText && searchText.trim() !== '') {
      const searchLower = searchText.toLowerCase();
      const kitName = (kit.name || kit.kitName || '').toLowerCase();
      const kitId = (kit.id || '').toString().toLowerCase();
      if (!kitName.includes(searchLower) && !kitId.includes(searchLower)) {
        return false;
      }
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (kit.status !== filterStatus) {
        return false;
      }
    }

    // Filter by type
    if (filterType !== 'all') {
      if (kit.type !== filterType) {
        return false;
      }
    }

    return true;
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          title="Kit Component Rental"
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
                  <Option value="BORROWED">Borrowed</Option>
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
              description="No kits available for component rental"
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
                            <BuildOutlined style={{ fontSize: 64, color: '#fff', opacity: 0.8 }} />
                          )}
                          <div style={{
                            position: 'absolute',
                            top: 12,
                            right: 12
                          }}>
                            <Tag
                              color={kit.status === 'AVAILABLE' ? 'green' : kit.status === 'BORROWED' ? 'orange' : 'red'}
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
                          key="view"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => onViewKitDetail(kit)}
                            style={{
                              color: '#fff',
                              width: '100%',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                              border: 'none',
                              fontWeight: 'bold'
                            }}
                          >
                            View Components
                          </Button>
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
                            onClick={() => onViewKitDetail(kit)}
                          >
                            {kit.name || kit.kitName || 'Unnamed Kit'}
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
                              </div>
                              {kit.description && (
                                <div style={{ marginTop: 8 }}>
                                  <Text type="secondary" style={{ fontSize: '12px' }} ellipsis>
                                    {kit.description}
                                  </Text>
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
          )}

          {/* Pagination Info */}
          {filteredKits.length > 0 && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Text type="secondary">
                Showing {filteredKits.length} of {kits.filter(k => k.quantityAvailable > 0).length} available kit(s)
              </Text>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};



// Refund Requests Component (currently unused)
// eslint-disable-next-line no-unused-vars
const RefundRequests = ({ refundRequests, setRefundRequests, user }) => {
  const [newRefundModal, setNewRefundModal] = useState(false);
  const [refundForm] = Form.useForm();

  const handleNewRefund = () => {
    setNewRefundModal(true);
  };

  const handleRefundSubmit = (values) => {
    // TODO: Implement refund request submission
    // const newRefund = {
    //   id: Date.now(),
    //   kitName: values.kitName,
    //   requester: user?.email,
    //   requestDate: new Date().toISOString().split('T')[0],
    //   refundDate: values.refundDate,
    //   status: 'pending_approval'
    // };

    setNewRefundModal(false);
    refundForm.resetFields();
    message.success('Refund request submitted successfully!');
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
          title="Refund Tracking"
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewRefund}
            >
              New Refund Request
            </Button>
          }
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          <Table
            dataSource={refundRequests}
            columns={[
              {
                title: 'Kit Name',
                dataIndex: 'kitName',
                key: 'kitName',
              },
              {
                title: 'Request Date',
                dataIndex: 'requestDate',
                key: 'requestDate',
                render: (date) => formatDate(date),
              },
              {
                title: 'Refund Date',
                dataIndex: 'refundDate',
                key: 'refundDate',
                render: (date) => formatDate(date),
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag color={getStatusColor(status)}>
                    {status.replace('_', ' ').toUpperCase()}
                  </Tag>
                ),
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                  <Space>
                    <Button size="small">
                      Details
                    </Button>
                  </Space>
                ),
              },
            ]}
            rowKey="id"
          />
        </Card>
      </motion.div>

      {/* New Refund Request Modal */}
      <Modal
        title="New Refund Request"
        open={newRefundModal}
        onCancel={() => setNewRefundModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={refundForm}
          layout="vertical"
          onFinish={handleRefundSubmit}
        >
          <Form.Item
            name="kitName"
            label="Kit Name"
            rules={[{ required: true, message: 'Please select a kit' }]}
          >
            <Select placeholder="Select a kit">
              <Option value="Arduino Starter Kit">Arduino Starter Kit</Option>
              <Option value="Raspberry Pi Kit">Raspberry Pi Kit</Option>
              <Option value="IoT Sensor Kit">IoT Sensor Kit</Option>
              <Option value="ESP32 Development Kit">ESP32 Development Kit</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="refundDate"
            label="Refund Date"
            rules={[{ required: true, message: 'Please select refund date' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="Select refund date"
            />
          </Form.Item>


          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Submit Request
              </Button>
              <Button onClick={() => setNewRefundModal(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Wallet Management Component
const WalletManagement = ({ wallet, setWallet }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    loadTransactionHistory();
    // Note: PayPal return is handled at portal level, not here
  }, []);

  const loadTransactionHistory = async () => {
    try {
      setLoading(true);
      const response = await walletTransactionAPI.getHistory();
      console.log('Transaction history response:', response);

      // Handle response format
      let transactionsData = [];
      if (Array.isArray(response)) {
        transactionsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        transactionsData = response.data;
      }

      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading transaction history:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = () => {
    navigate('/top-up');
  };

  const handlePayPenalties = () => {
    navigate('/penalty-payment');
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
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
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
                  onClick={handleTopUp}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                >
                  Top Up
                </Button>
                <Button
                  onClick={handlePayPenalties}
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
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
          >
            <Card
              title="Transaction History"
              extra={
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadTransactionHistory}
                  loading={loading}
                >
                  Refresh
                </Button>
              }
              style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            >
              <Spin spinning={loading}>
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
                        // Mapping type sang thông tin theme
                        let config = {
                          label: type || 'Khác',
                          color: 'default',
                          icon: null,
                          bg: '#f6f6f6',
                          border: '1.5px solid #e0e0e0',
                          text: '#333'
                        };
                        switch ((type || '').toUpperCase()) {
                          case 'TOP_UP':
                          case 'TOPUP':
                            config = { label: 'Nạp tiền', color: 'success', icon: <DollarOutlined />, bg: '#e8f8ee', border: '1.5px solid #52c41a', text: '#2a8731' }; break;
                          case 'RENTAL_FEE':
                            config = { label: 'Thuê kit', color: 'geekblue', icon: <ShoppingOutlined />, bg: '#e6f7ff', border: '1.5px solid #177ddc', text: '#177ddc' }; break;
                          case 'PENALTY_PAYMENT':
                          case 'PENALTY':
                          case 'FINE':
                            config = { label: 'Phí phạt', color: 'error', icon: <ExclamationCircleOutlined />, bg: '#fff1f0', border: '1.5px solid #ff4d4f', text: '#d4001a' }; break;
                          case 'REFUND':
                            config = { label: 'Hoàn tiền', color: 'purple', icon: <RollbackOutlined />, bg: '#f9f0ff', border: '1.5px solid #722ed1', text: '#722ed1' }; break;
                          default:
                            config = { label: type || 'Khác', color: 'default', icon: <InfoCircleOutlined />, bg: '#fafafa', border: '1.5px solid #bfbfbf', text: '#595959' };
                        }
                        return <Tag color={config.color} style={{ background: config.bg, border: config.border, color: config.text, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, letterSpacing: 1 }}>
                          {config.icon} <span>{config.label}</span>
                        </Tag>;
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
                        return new Date(date).toLocaleString('vi-VN');
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
                const getTypeColor = (t) => {
                  switch ((t || '').toUpperCase()) {
                    case 'TOP_UP':
                    case 'TOPUP':
                      return 'green';
                    case 'PENALTY_PAYMENT':
                    case 'PENALTY':
                    case 'FINE':
                      return 'red';
                    case 'REFUND':
                      return 'blue';
                    case 'RENTAL_FEE':
                      return 'purple';
                    default:
                      return 'default';
                  }
                };
                const getTypeIcon = (t) => {
                  switch ((t || '').toUpperCase()) {
                    case 'TOP_UP':
                    case 'TOPUP':
                      return <DollarOutlined />;
                    case 'PENALTY_PAYMENT':
                    case 'PENALTY':
                    case 'FINE':
                      return <ExclamationCircleOutlined />;
                    case 'REFUND':
                      return <RollbackOutlined />;
                    case 'RENTAL_FEE':
                      return <ShoppingOutlined />;
                    default:
                      return <InfoCircleOutlined />;
                  }
                };
                return (
                  <Tag color={getTypeColor(type)} icon={getTypeIcon(type)}>
                    {type ? type.replace(/_/g, ' ') : 'N/A'}
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

// Borrow Tracking Component
const BorrowTracking = ({ borrowingRequests, setBorrowingRequests, user, penalties, penaltyDetails }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [relatedPenalty, setRelatedPenalty] = useState(null);
  const [relatedPenaltyDetails, setRelatedPenaltyDetails] = useState([]);
  const [loadingPenalty, setLoadingPenalty] = useState(false);

  const fetchBorrowingRequests = useCallback(async () => {
    setLoading(true);
    try {
      if (!user || !user.id) {
        console.error('User or user ID is missing');
        setBorrowingRequests([]);
        return;
      }
      const requests = await borrowingRequestAPI.getByUser(user.id);
      console.log('Borrowing requests for user:', requests);

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
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      fetchBorrowingRequests();
    }
  }, [user?.id, fetchBorrowingRequests]);

  const showRequestDetails = async (request) => {
    setSelectedRequest(request);
    setDetailDrawerVisible(true);

    // If request is RETURNED, find related penalty
    if (request.status === 'RETURNED' && penalties && penalties.length > 0) {
      setLoadingPenalty(true);
      try {
        // Find penalty related to this request
        const penalty = penalties.find(p =>
          (p.borrowRequestId && p.borrowRequestId === request.id) ||
          (p.request && p.request.id === request.id) ||
          (p.requestId && p.requestId === request.id)
        );

        if (penalty) {
          setRelatedPenalty(penalty);

          // Load penalty details if available
          if (penaltyDetails && penaltyDetails[penalty.id]) {
            setRelatedPenaltyDetails(penaltyDetails[penalty.id]);
          } else {
            // Try to load penalty details
            try {
              const detailsResponse = await penaltyDetailAPI.findByPenaltyId(penalty.id);
              let detailsData = [];
              if (Array.isArray(detailsResponse)) {
                detailsData = detailsResponse;
              } else if (detailsResponse && detailsResponse.data && Array.isArray(detailsResponse.data)) {
                detailsData = detailsResponse.data;
              }
              setRelatedPenaltyDetails(detailsData);
            } catch (error) {
              console.error('Error loading penalty details:', error);
              setRelatedPenaltyDetails([]);
            }
          }
        } else {
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
    } else {
      setRelatedPenalty(null);
      setRelatedPenaltyDetails([]);
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
          title="Borrow Tracking"
          extra={
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchBorrowingRequests}
              loading={loading}
            >
              Refresh
            </Button>
          }
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          <Table
            columns={columns}
            dataSource={borrowingRequests}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
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
              <Descriptions.Item label="Borrow Date">
                {selectedRequest.approvedDate
                  ? new Date(selectedRequest.approvedDate).toLocaleString('vi-VN')
                  : selectedRequest.borrowDate
                    ? new Date(selectedRequest.borrowDate).toLocaleString('vi-VN')
                    : selectedRequest.createdAt
                      ? new Date(selectedRequest.createdAt).toLocaleString('vi-VN')
                      : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Expected Return Date">
                {selectedRequest.expectReturnDate ? new Date(selectedRequest.expectReturnDate).toLocaleString('vi-VN') : 'N/A'}
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
                                    • {detail.description || 'N/A'}: {detail.amount ? detail.amount.toLocaleString() : 0} VND
                                  </Text>
                                </List.Item>
                              )}
                            />
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

// Password validation helper
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

  const loadProfile = useCallback(async () => {
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
  }, [form, setLoading, setProfile]);

  // Load profile when component mounts
  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

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

                    <Divider />

                    <div style={{ marginTop: 16 }}>
                      <Button
                        type="default"
                        icon={<SettingOutlined />}
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

export default LeaderPortal; 
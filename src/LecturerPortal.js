import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Layout,
  Menu,
  Card,
  Table,
  Button,
  Input,
  InputNumber,
  Form,
  Alert,
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
  Descriptions,
  Empty,
  Spin,
  Popover,
  notification,
  Modal,
  DatePicker,
  Divider,
  Select,
  Pagination
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
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LoadingOutlined,
  RollbackOutlined,
  WalletOutlined,
  DollarOutlined,
  BookOutlined,
  BellOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  BuildOutlined,
  ReloadOutlined,
  EditOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { kitAPI, borrowingGroupAPI, studentGroupAPI, walletAPI, walletTransactionAPI, borrowingRequestAPI, penaltiesAPI, penaltyDetailAPI, notificationAPI, authAPI, classAssignmentAPI, paymentAPI, classesAPI, userAPI, kitComponentAPI } from './api';
import webSocketService from './utils/websocket';
import dayjs from 'dayjs';

// Default wallet structure
const defaultWallet = { balance: 0, transactions: [] };

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
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
      return 'warning';
    case 'rejected':
    case 'damaged':
      return 'error';
    default:
      return 'default';
  }
};

function LecturerPortal({ user, onLogout }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [kits, setKits] = useState([]);
  const [components, setComponents] = useState([]);
  const [lecturerGroups, setLecturerGroups] = useState([]);
  const [wallet, setWallet] = useState(defaultWallet);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [groupDetailModal, setGroupDetailModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // New state for borrow status
  const [borrowStatus, setBorrowStatus] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [penaltyDetails, setPenaltyDetails] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notificationPopoverOpen, setNotificationPopoverOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [groupBorrowStatus, setGroupBorrowStatus] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // State for detail modal
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRentalDetail, setSelectedRentalDetail] = useState(null);
  const [rentalComponents, setRentalComponents] = useState([]);
  const [loadingComponents, setLoadingComponents] = useState(false);

  // State for kit detail modal
  const [kitDetailModalVisible, setKitDetailModalVisible] = useState(false);
  const [selectedKitDetail, setSelectedKitDetail] = useState(null);
  const [kitDetailModalType, setKitDetailModalType] = useState('kit-rental'); // 'kit-rental' or 'component-rental'
  const [componentQuantities, setComponentQuantities] = useState({}); // Store quantities for each component
  const [componentPage, setComponentPage] = useState(1);
  const [componentPageSize] = useState(6);

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

  const loadData = useCallback(async () => {
    if (!user || !user.id) {
      console.warn('User or user.id is missing');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('===== Loading lecturer data =====');

      // Load all kits
      try {
        const kitsResponse = await kitAPI.getAllKits();
        console.log('Kits response:', kitsResponse);
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
        setKits(mappedKits);
      } catch (error) {
        console.error('Error loading kits:', error);
        setKits([]);
      }

      // Load global kit components (kitId = null) for component rental
      try {
        const componentsResponse = await kitComponentAPI.getAllComponents();
        const componentsData = Array.isArray(componentsResponse)
          ? componentsResponse
          : (componentsResponse?.data || []);
        setComponents(componentsData || []);
      } catch (error) {
        console.error('Error loading kit components for lecturer:', error);
        setComponents([]);
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

      // Load wallet
      try {
        const walletResponse = await walletAPI.getMyWallet();
        const walletData = walletResponse?.data || walletResponse || {};

        // Fetch transaction history separately
        let transactions = [];
        try {
          const transactionHistoryResponse = await walletTransactionAPI.getHistory();
          console.log('Transaction history response:', transactionHistoryResponse);

          // Handle response format - could be array or wrapped in data
          const transactionData = Array.isArray(transactionHistoryResponse)
            ? transactionHistoryResponse
            : (transactionHistoryResponse?.data || []);

          // Map transactions to expected format for WalletManagement component
          transactions = transactionData.map(txn => ({
            type: txn.type || txn.transactionType || 'UNKNOWN',
            amount: txn.amount || 0,
            previousBalance: txn.previousBalance || null,
            date: txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('vi-VN') : 'N/A',
            description: txn.description || '',
            status: txn.status || txn.transactionStatus || 'COMPLETED',
            id: txn.id
          }));

          console.log('Mapped transactions:', transactions);
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

      // Load groups for lecturer
      try {
        const allGroups = await studentGroupAPI.getAll();
        console.log('All groups response:', allGroups);

        // Filter groups where lecturer is assigned (check lecturerEmail or lecturerId)
        const lecturerGroups = allGroups.filter(group =>
          group.lecturerEmail === user.email ||
          group.accountId === user.id
        );

        console.log('Filtered lecturer groups:', lecturerGroups);

        // Load all class assignments
        let allClassAssignments = [];
        try {
          const classAssignmentsResponse = await classAssignmentAPI.getAll();
          allClassAssignments = Array.isArray(classAssignmentsResponse)
            ? classAssignmentsResponse
            : (classAssignmentsResponse?.data || []);
          console.log('All class assignments:', allClassAssignments);
        } catch (caError) {
          console.error('Error loading class assignments:', caError);
        }

        // Load all classes to get semester information
        let allClasses = [];
        try {
          const classesResponse = await classesAPI.getAllClasses();
          allClasses = Array.isArray(classesResponse)
            ? classesResponse
            : (classesResponse?.data || []);
          console.log('All classes:', allClasses);
        } catch (classesError) {
          console.error('Error loading classes:', classesError);
        }

        // Load borrowing groups for each lecturer group
        const groupsWithMembers = await Promise.all(
          lecturerGroups.map(async (group) => {
            const borrowingGroups = await borrowingGroupAPI.getByStudentGroupId(group.id);
            const members = (borrowingGroups || []).map(bg => ({
              id: bg.accountId,
              name: bg.accountName,
              email: bg.accountEmail,
              role: bg.roles,
              studentCode: bg.studentCode || null,
              isActive: bg.isActive !== undefined ? bg.isActive : true
            }));

            const leaderMember = members.find(member => (member.role || '').toUpperCase() === 'LEADER');

            // Filter class assignments for this group's class
            const classAssignments = group.classId
              ? allClassAssignments.filter(ca => ca.classId === group.classId)
              : [];

            // Find class to get semester
            const classInfo = group.classId
              ? allClasses.find(cls => cls.id === group.classId)
              : null;

            // Debug class info
            console.log(`Group ${group.groupName} (ClassId: ${group.classId}) - ClassInfo:`, classInfo);

            // Debug logging
            console.log(`Processing Group: ${group.groupName} (ID: ${group.id})`);
            console.log(`- Group Raw Status: status=${group.status}, isActive=${group.isActive}, active=${group.active}`);
            console.log(`- Class Info:`, classInfo);

            // Determine initial group status
            // Check multiple potential properties for status
            let isGroupActive = true; // Default to true

            if (group.status !== undefined && group.status !== null) {
              isGroupActive = group.status;
            } else if (group.isActive !== undefined && group.isActive !== null) {
              isGroupActive = group.isActive;
            } else if (group.active !== undefined && group.active !== null) {
              isGroupActive = group.active;
            }

            // Convert to boolean if it's a string
            if (typeof isGroupActive === 'string') {
              isGroupActive = isGroupActive.toLowerCase() === 'active' || isGroupActive.toLowerCase() === 'true' || isGroupActive === '1';
            }

            console.log(`- Initial Group Active State: ${isGroupActive}`);

            // If class exists, check class status
            if (classInfo) {
              const classStatus = classInfo.status !== undefined ? classInfo.status : classInfo.isActive;

              // Robust check for class active status
              const isClassActive = classStatus === true ||
                classStatus === 1 ||
                (typeof classStatus === 'string' && (
                  classStatus.toUpperCase() === 'ACTIVE' ||
                  classStatus === '1' ||
                  classStatus.toLowerCase() === 'true'
                ));

              console.log(`- Class Status Check: raw=${classStatus}, isActive=${isClassActive}`);

              // If class is NOT active, force group to be inactive
              if (!isClassActive && classStatus !== undefined && classStatus !== null) {
                console.log(`-> OVERRIDE: Class is inactive, setting group to INACTIVE`);
                isGroupActive = false;
              }
            }

            const finalStatus = isGroupActive ? 'active' : 'inactive';
            console.log(`-> Final Calculated Status: ${finalStatus}`);

            return {
              id: group.id,
              name: group.groupName,
              lecturer: group.lecturerEmail,
              lecturerName: group.lecturerName,
              leader: leaderMember ? (leaderMember.name || leaderMember.email || 'N/A') : 'N/A',
              leaderEmail: leaderMember?.email || null,
              leaderId: leaderMember?.id || null,
              members: members,
              status: finalStatus,
              classId: group.classId,
              className: group.className,
              semester: classInfo?.semester || null,
              classAssignments: classAssignments
            };
          })
        );

        setLecturerGroups(groupsWithMembers);
      } catch (error) {
        console.error('Error loading groups:', error);
        setLecturerGroups([]);
      }

      // Load borrowing requests for user (borrow status)
      try {
        const borrowRequests = await borrowingRequestAPI.getByUser(user.id);
        console.log('Borrow requests raw data:', borrowRequests);

        // Process each request to check for late status and update if needed
        const processedRequests = await Promise.all((Array.isArray(borrowRequests) ? borrowRequests : []).map(async (request) => {
          const borrowDate = request.approvedDate || request.borrowDate || request.startDate || request.createdAt;
          const dueDate = request.expectReturnDate || request.dueDate;
          const returnDate = request.actualReturnDate || request.returnDate || null;
          const normalizedStatus = (request.status || '').toUpperCase();

          // Calculate duration: now (or return date) - expected return date
          let duration = 0;
          let isLate = request.isLate || false;
          const now = dayjs();
          const dueDay = dayjs(dueDate);
          const returnDay = returnDate ? dayjs(returnDate) : null;

          if (dueDay.isValid()) {
            const compareDate = returnDay && returnDay.isValid() ? returnDay : now;

            if (compareDate.isValid()) {
              // Calculate duration as difference from expected return date
              duration = Math.max(0, compareDate.diff(dueDay, 'day'));

              // Check if rental is late
              if (compareDate.isAfter(dueDay)) {
                isLate = true;

                // Update database if status is APPROVED or BORROWED and not already marked as late
                if (isLate && !request.isLate && (normalizedStatus === 'APPROVED' || normalizedStatus === 'BORROWED')) {
                  try {
                    await borrowingRequestAPI.update(request.id, {
                      isLate: true
                    });
                    console.log(`Updated request ${request.id} as late`);
                  } catch (updateError) {
                    console.error(`Error updating late status for request ${request.id}:`, updateError);
                  }
                }
              } else {
                isLate = false;
                duration = 0; // Not late, so duration is 0
              }
            }
          }

          return {
            id: request.id || request.requestId || request.borrowingRequestId || request.rentalId || request.code,
            kitName: request.kitName || request.kit?.kitName || 'Unknown Kit',
            requestType: request.requestType || request.type || 'BORROW_KIT',
            rentalId: request.requestCode || request.rentalId || request.id || request.code || 'N/A',
            borrowDate,
            dueDate,
            returnDate,
            status: normalizedStatus || 'PENDING',
            depositAmount: request.depositAmount || request.deposit || 0,
            duration: duration,
            isLate: isLate,
            groupName: request.groupName || request.studentGroupName || request.borrowingGroup?.groupName || 'N/A',
            raw: request
          };
        }));

        const mappedBorrowStatus = processedRequests;

        // Sort by createdAt descending (newest first)
        const sortedBorrowStatus = mappedBorrowStatus.sort((a, b) => {
          const dateA = a.raw?.createdAt || a.borrowDate || 0;
          const dateB = b.raw?.createdAt || b.borrowDate || 0;
          return new Date(dateB) - new Date(dateA);
        });

        console.log('Mapped borrow status data:', sortedBorrowStatus);
        setBorrowStatus(sortedBorrowStatus);
      } catch (error) {
        console.error('Error loading borrow status:', error);
        setBorrowStatus([]);
      }

      // borrowStatus is already set from API above

      console.log('Lecturer data loaded successfully');
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
        } catch (error) {
          console.error('Error reloading wallet:', error);
          // Fallback: reload the page
          window.location.reload();
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
            }
          }
        } catch (redirectError) {
          console.error('Error handling afterTopupRedirect:', redirectError);
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
        } catch (error) {
          console.error('Error reloading wallet:', error);
          // Fallback: reload the page
          window.location.reload();
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
            }
          }
        } catch (redirectError) {
          console.error('Error handling afterTopupRedirect (PAYMENT_ALREADY_DONE):', redirectError);
        }
      } else {
        message.error(error.message || 'Payment execution failed. Please try again.');
        sessionStorage.removeItem('pendingPayPalPayment');
      }
    }
  }, [loadData, navigate, user]);

  const handlePayPalCancel = () => {
    message.warning('Payment was cancelled');
    sessionStorage.removeItem('pendingPayPalPayment');
    window.history.replaceState({}, document.title, window.location.pathname);
  };

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
      hasLoadData: !!loadData,
      alreadyProcessed: payPalReturnProcessedRef.current
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
      // Mark as processing immediately using both ref and sessionStorage
      sessionStorage.setItem(processingKey, 'true');
      payPalReturnProcessedRef.current = true;

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
          payPalReturnProcessedRef.current = false;
        });
    } else {
      console.log('Waiting for user or loadData...', { hasUser: !!user, hasLoadData: !!loadData });
    }
  }, [loadData, handlePayPalReturn, user]);

  useEffect(() => {
    console.log('===== LecturerPortal useEffect triggered =====');
    console.log('User:', user);
    payPalReturnProcessedRef.current = false;
    if (user) {
      loadData();
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
  const payPalReturnProcessedRef = useRef(false);

  useEffect(() => {
    if (user && user.id) {
      loadNotifications();

      // Connect to WebSocket and subscribe to user notifications
      webSocketService.connect(
        () => {
          console.log('WebSocket connected for lecturer notifications');
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
                // Add new notification at the beginning
                return [data, ...prev];
              }
              return prev;
            });
          });

          // Subscribe to rental request updates
          rentalRequestSubscriptionRef.current = webSocketService.subscribeToUserRentalRequests(userId, (data) => {
            console.log('Received rental request update via WebSocket:', data);

            // Update borrowStatus when rental request status changes
            setBorrowStatus(prev => {
              const exists = prev.find(req => req.id === data.id);
              if (exists) {
                // Update existing request
                const updated = prev.map(req => {
                  if (req.id === data.id) {
                    const borrowDate = data.borrowDate || data.startDate || data.createdAt;
                    const dueDate = data.dueDate || data.expectReturnDate;
                    const returnDate = data.returnDate || data.actualReturnDate || null;
                    const normalizedStatus = (data.status || '').toUpperCase();

                    let duration = data.duration;
                    if (!duration && borrowDate && (returnDate || dueDate)) {
                      const start = dayjs(borrowDate);
                      const end = dayjs(returnDate || dueDate);
                      if (start.isValid() && end.isValid()) {
                        const diff = end.diff(start, 'day');
                        duration = diff >= 0 ? diff : 0;
                      }
                    }

                    return {
                      ...req,
                      kitName: data.kitName || data.kit?.kitName || req.kitName,
                      requestType: data.requestType || data.type || req.requestType,
                      borrowDate,
                      dueDate,
                      returnDate,
                      status: normalizedStatus || req.status,
                      totalCost: data.totalCost || data.cost || req.totalCost,
                      depositAmount: data.depositAmount || data.deposit || req.depositAmount,
                      duration: duration ?? req.duration,
                      raw: data
                    };
                  }
                  return req;
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

                // Sort by createdAt descending (newest first)
                return updated.sort((a, b) => {
                  const dateA = a.raw?.createdAt || a.borrowDate || 0;
                  const dateB = b.raw?.createdAt || b.borrowDate || 0;
                  return new Date(dateB) - new Date(dateA);
                });
              } else {
                // Add new request if it doesn't exist
                const borrowDate = data.borrowDate || data.startDate || data.createdAt;
                const dueDate = data.dueDate || data.expectReturnDate;
                const returnDate = data.returnDate || data.actualReturnDate || null;
                const normalizedStatus = (data.status || '').toUpperCase();

                let duration = data.duration;
                if (!duration && borrowDate && (returnDate || dueDate)) {
                  const start = dayjs(borrowDate);
                  const end = dayjs(returnDate || dueDate);
                  if (start.isValid() && end.isValid()) {
                    const diff = end.diff(start, 'day');
                    duration = diff >= 0 ? diff : 0;
                  }
                }

                const newRequest = {
                  id: data.id,
                  kitName: data.kitName || data.kit?.kitName || 'Unknown Kit',
                  requestType: data.requestType || data.type || 'BORROW_KIT',
                  rentalId: data.requestCode || data.rentalId || data.id || 'N/A',
                  borrowDate,
                  dueDate,
                  returnDate,
                  status: normalizedStatus || 'PENDING',
                  totalCost: data.totalCost || data.cost || 0,
                  depositAmount: data.depositAmount || data.deposit || 0,
                  duration: duration ?? 0,
                  groupName: data.groupName || data.studentGroupName || data.borrowingGroup?.groupName || 'N/A',
                  raw: data
                };

                return [newRequest, ...prev];
              }
            });
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

          // Subscribe to group updates (for lecturers)
          groupSubscriptionRef.current = webSocketService.subscribeToUserGroups(userId, (data) => {
            console.log('Received group update via WebSocket:', data);
            setLecturerGroups(prev => {
              const exists = prev.find(group => group.id === data.id);
              if (exists) {
                // Update existing group
                return prev.map(group => {
                  if (group.id === data.id) {
                    return {
                      ...group,
                      name: data.groupName || group.name,
                      lecturer: data.lecturerEmail || group.lecturer,
                      lecturerName: data.lecturerName || group.lecturerName,
                      status: data.status ? 'active' : 'inactive',
                      classId: data.classId || group.classId,
                      className: data.className || group.className
                    };
                  }
                  return group;
                });
              } else {
                // Add new group if lecturer matches
                if (data.lecturerEmail === user.email || data.accountId === user.id) {
                  notification.info({
                    message: 'New Group',
                    description: `A new group "${data.groupName}" has been assigned to you.`,
                    placement: 'topRight',
                    duration: 5,
                  });
                  // Note: We need to load full group details, so reload data
                  loadData();
                }
                return prev;
              }
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
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'groups', icon: <TeamOutlined />, label: 'My Groups' },
    { key: 'kits', icon: <ToolOutlined />, label: 'Kit Rental' },
    { key: 'kit-component-rental', icon: <BuildOutlined />, label: 'Kit Component Rental' },
    { key: 'borrow-status', icon: <ShoppingOutlined />, label: 'Borrow Status' },
    { key: 'wallet', icon: <WalletOutlined />, label: 'Wallet' },
    { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
  ];

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  const handleTopUp = () => {
    navigate('/top-up');
  };

  const handlePayPenalties = () => {
    navigate('/penalty-payment');
  };

  const handleRent = (kit) => {
    // Check if lecturer has an active borrow request for a kit (kitType = Kit)
    // Active statuses: APPROVED, PENDING, WAITING_APPROVAL, BORROWED
    const activeKitRequest = borrowStatus.find(request => {
      const requestType = (request.requestType || '').toUpperCase();
      const status = (request.status || '').toUpperCase();
      const isKitRequest = requestType === 'BORROW_KIT';
      const isActiveStatus = status === 'APPROVED' ||
        status === 'PENDING' ||
        status === 'WAITING_APPROVAL' ||
        status === 'BORROWED';
      return isKitRequest && isActiveStatus;
    });

    if (activeKitRequest) {
      const statusText = activeKitRequest.status === 'APPROVED'
        ? 'approved'
        : activeKitRequest.status === 'BORROWED'
          ? 'borrowed'
          : 'pending';
      message.warning(`You already have an active kit rental request (status: ${statusText}). Please wait for the current request to be completed or rejected before renting a new one.`);
      return;
    }

    // Check the most recent request for kit (kitType = Kit)
    const kitRequests = borrowStatus
      .filter(request => {
        const requestType = (request.requestType || '').toUpperCase();
        return requestType === 'BORROW_KIT';
      })
      .sort((a, b) => {
        // Sort by createdAt descending (most recent first)
        const dateA = a.raw?.createdAt ? new Date(a.raw.createdAt) : new Date(a.borrowDate || 0);
        const dateB = b.raw?.createdAt ? new Date(b.raw.createdAt) : new Date(b.borrowDate || 0);
        return dateB - dateA;
      });

    if (kitRequests.length > 0) {
      const mostRecentRequest = kitRequests[0];
      const mostRecentStatus = (mostRecentRequest.status || '').toUpperCase();

      // Allow if the most recent request is in a completed/final state
      // Final states: REJECTED, RETURNED, COMPLETED, CANCELLED
      // Block if still in active state
      const finalStates = ['REJECTED', 'RETURNED', 'COMPLETED', 'CANCELLED'];
      const activeStates = ['APPROVED', 'PENDING', 'WAITING_APPROVAL', 'BORROWED'];

      if (!finalStates.includes(mostRecentStatus) && activeStates.includes(mostRecentStatus)) {
        message.warning(`You cannot rent a new kit. Your most recent request status is: ${mostRecentRequest.status}. Please wait for the current request to be processed or rejected.`);
        return;
      }
      // If status is in final states or unknown, allow proceeding
    }

    // Validation passed, proceed to rental request page
    navigate('/rental-request', {
      state: {
        kitId: kit?.id,
        kit,
        user
      }
    });
  };

  const handleViewGroupDetails = async (group) => {
    console.log('Viewing group details:', group);
    setSelectedGroup(group);
    setGroupBorrowStatus({ loading: true });

    // Load members from borrowing groups
    if (group.id) {
      try {
        const members = await borrowingGroupAPI.getByStudentGroupId(group.id);
        console.log('Group members:', members);
        setSelectedGroupMembers(members || []);

        // Detect leader from members (roles field on borrowing group)
        const leaderMember = (members || []).find(
          (m) => (m.roles || m.role || '').toUpperCase() === 'LEADER'
        );

        if (!leaderMember || !leaderMember.accountId) {
          setGroupBorrowStatus({
            loading: false,
            hasLeader: false,
            hasBorrowedKit: false,
          });
        } else {
          try {
            // Load borrowing requests for leader account
            const requests = await borrowingRequestAPI.getByUser(
              leaderMember.accountId
            );
            const normalizedRequests = Array.isArray(requests)
              ? requests
              : requests?.data || [];

            // Filter active kit requests
            const activeKitRequests = normalizedRequests.filter((req) => {
              const type = (req.requestType || req.type || '').toUpperCase();
              const status = (req.status || '').toUpperCase();
              const isKitRequest = type === 'BORROW_KIT';
              const isActiveStatus =
                status === 'APPROVED' ||
                status === 'BORROWED' ||
                status === 'WAITING_APPROVAL' ||
                status === 'PENDING';
              return isKitRequest && isActiveStatus;
            });

            if (activeKitRequests.length === 0) {
              setGroupBorrowStatus({
                loading: false,
                hasLeader: true,
                hasBorrowedKit: false,
              });
            } else {
              // Lấy request mới nhất theo createdAt hoặc borrowDate
              const latest = [...activeKitRequests].sort((a, b) => {
                const dateA = a.createdAt || a.borrowDate || a.approvedDate || 0;
                const dateB = b.createdAt || b.borrowDate || b.approvedDate || 0;
                return new Date(dateB) - new Date(dateA);
              })[0];

              setGroupBorrowStatus({
                loading: false,
                hasLeader: true,
                hasBorrowedKit: true,
                kitName: latest.kitName || latest.kit?.kitName || 'Unknown Kit',
                status: (latest.status || '').toUpperCase(),
              });
            }
          } catch (err) {
            console.error(
              'Error loading borrowing requests for leader:',
              err
            );
            setGroupBorrowStatus({
              loading: false,
              hasLeader: true,
              hasBorrowedKit: false,
            });
          }
        }
      } catch (err) {
        console.error('Error loading group members:', err);
        setSelectedGroupMembers([]);
        setGroupBorrowStatus({
          loading: false,
          hasLeader: false,
          hasBorrowedKit: false,
        });
      }
    } else {
      setSelectedGroupMembers([]);
      setGroupBorrowStatus({
        loading: false,
        hasLeader: false,
        hasBorrowedKit: false,
      });
    }

    setGroupDetailModal(true);
  };

  const handleViewDetail = async (rental) => {
    setSelectedRentalDetail(rental);
    setDetailModalVisible(true);

    // Fetch components if this is a component rental request
    if (rental.requestType === 'BORROW_COMPONENT' && rental.id) {
      setLoadingComponents(true);
      try {
        const components = await borrowingRequestAPI.getRequestComponents(rental.id);
        console.log('Rental components:', components);
        setRentalComponents(Array.isArray(components) ? components : []);
      } catch (error) {
        console.error('Error loading rental components:', error);
        setRentalComponents([]);
      } finally {
        setLoadingComponents(false);
      }
    } else {
      setRentalComponents([]);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedRentalDetail(null);
    setRentalComponents([]);
  };

  const handleViewKitDetail = (kit, modalType = 'kit-rental') => {
    setSelectedKitDetail(kit);
    setKitDetailModalType(modalType);
    setKitDetailModalVisible(true);
  };

  const handleCloseKitDetailModal = () => {
    setKitDetailModalVisible(false);
    setSelectedKitDetail(null);
    setComponentQuantities({});
    setComponentPage(1);
  };

  const handleComponentQuantityChange = (componentId, quantity) => {
    setComponentQuantities(prev => ({
      ...prev,
      [componentId]: quantity
    }));
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

    setLoading(true);
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
              message: `${user?.fullName || user?.email || 'Giảng viên'} đã gửi yêu cầu thuê ${selectedComponent.componentName} x${componentQuantity}.`
            }
          ]);
        } catch (notifyError) {
          console.error('Error sending notifications:', notifyError);
        }
        message.success('Component rental request created successfully! Waiting for admin approval.');
        handleCloseRentComponentModal();
        loadData();
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
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToLeader = async (studentGroupId, accountId) => {
    try {
      console.log('Promoting to leader:', { studentGroupId, accountId });
      const requestData = { studentGroupId, accountId };
      await borrowingGroupAPI.promoteToLeader(requestData);

      message.success('Successfully promoted member to leader');

      // Refresh the group members in the modal if it's open for this group
      if (selectedGroup && selectedGroup.id === studentGroupId) {
        try {
          // Fetch fresh members data directly from API
          const updatedMembers = await borrowingGroupAPI.getByStudentGroupId(studentGroupId);
          console.log('Refreshed group members:', updatedMembers);
          setSelectedGroupMembers(updatedMembers || []);
        } catch (refreshError) {
          console.error('Error refreshing group members:', refreshError);
        }
      }

      // Reload all data to update the groups list
      loadData();
    } catch (error) {
      console.error('Error promoting to leader:', error);
      message.error('Failed to promote member to leader');
    }
  };

  const handleDemoteToMember = async (studentGroupId, accountId) => {
    try {
      console.log('Demoting to member:', { studentGroupId, accountId });
      const requestData = { studentGroupId, accountId };
      await borrowingGroupAPI.demoteToMember(requestData);

      message.success('Successfully demoted leader to member');

      // Refresh the group members in the modal if it's open for this group
      if (selectedGroup && selectedGroup.id === studentGroupId) {
        try {
          // Fetch fresh members data directly from API
          const updatedMembers = await borrowingGroupAPI.getByStudentGroupId(studentGroupId);
          console.log('Refreshed group members:', updatedMembers);
          setSelectedGroupMembers(updatedMembers || []);
        } catch (refreshError) {
          console.error('Error refreshing group members:', refreshError);
        }
      }

      // Reload all data to update the groups list
      loadData();
    } catch (error) {
      console.error('Error demoting to member:', error);
      message.error('Failed to demote leader to member');
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
            {collapsed ? 'LCT' : 'Lecturer Portal'}
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
                  icon={<BookOutlined />}
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
                {selectedKey === 'dashboard' && <DashboardContent lecturerGroups={lecturerGroups} wallet={wallet} kits={kits} penalties={penalties} penaltyDetails={penaltyDetails} />}
                {selectedKey === 'groups' && <GroupsManagement lecturerGroups={lecturerGroups} onViewGroupDetails={handleViewGroupDetails} loadData={loadData} />}
                {selectedKey === 'kits' && (
                  <KitRental
                    kits={kits}
                    user={user}
                    onRent={handleRent}
                    onViewKitDetail={(kit) => handleViewKitDetail(kit, 'kit-rental')}
                  />
                )}
                {selectedKey === 'kit-component-rental' && (
                  <KitComponentRental
                    components={components}
                    onRentComponent={handleRentComponent}
                  />
                )}
                {selectedKey === 'borrow-status' && <BorrowStatus borrowStatus={borrowStatus} onViewDetail={handleViewDetail} />}
                {selectedKey === 'wallet' && <WalletManagement wallet={wallet} setWallet={setWallet} onTopUp={handleTopUp} onPayPenalties={handlePayPenalties} />}
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
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InfoCircleOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Kit Details</span>
          </div>
        }
        open={kitDetailModalVisible}
        onCancel={handleCloseKitDetailModal}
        footer={[
          <Button
            key="close"
            onClick={handleCloseKitDetailModal}
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
        {selectedKitDetail && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Kit ID" span={2}>
                <Text code style={{ fontSize: '14px' }}>{selectedKitDetail.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Kit Name">
                <Text strong style={{ fontSize: '16px' }}>{selectedKitDetail.name || selectedKitDetail.kitName || 'N/A'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Type">
                <Tag
                  color={selectedKitDetail.type === 'LECTURER_KIT' ? 'red' : selectedKitDetail.type === 'STUDENT_KIT' ? 'blue' : 'default'}
                  style={{ fontSize: '13px', padding: '4px 12px' }}
                >
                  {selectedKitDetail.type || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={selectedKitDetail.status === 'AVAILABLE' ? 'green' : selectedKitDetail.status === 'BORROWED' ? 'orange' : 'red'}
                  style={{ fontSize: '13px', padding: '4px 12px' }}
                >
                  {selectedKitDetail.status || 'N/A'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Quantity">
                <Text strong style={{ fontSize: '15px', color: '#1890ff' }}>
                  {selectedKitDetail.quantityTotal || 0}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Available Quantity">
                <Text strong style={{ fontSize: '15px', color: '#52c41a' }}>
                  {selectedKitDetail.quantityAvailable || 0}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="In Use Quantity">
                <Text strong style={{ fontSize: '15px', color: '#faad14' }}>
                  {(selectedKitDetail.quantityTotal || 0) - (selectedKitDetail.quantityAvailable || 0)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Amount">
                <Text strong style={{ fontSize: '15px', color: '#1890ff' }}>
                  {selectedKitDetail.amount ? `${Number(selectedKitDetail.amount).toLocaleString()} VND` : '0 VND'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Total Components">
                <Text strong style={{ fontSize: '15px' }}>
                  {selectedKitDetail.components?.length || 0} components
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                <Text>{selectedKitDetail.description || 'No description available'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Image" span={2}>
                {selectedKitDetail.imageUrl && selectedKitDetail.imageUrl !== 'null' && selectedKitDetail.imageUrl !== 'undefined' ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {selectedKitDetail.imageUrl.startsWith('http') && (
                      <img
                        src={selectedKitDetail.imageUrl}
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
                      onClick={() => window.open(selectedKitDetail.imageUrl, '_blank')}
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
            </Descriptions>

            <Divider orientation="left">
              <Space>
                <BuildOutlined style={{ color: '#1890ff' }} />
                <Text strong style={{ fontSize: '16px' }}>Components ({selectedKitDetail.components?.length || 0})</Text>
              </Space>
            </Divider>

            {selectedKitDetail.components && selectedKitDetail.components.length > 0 ? (
              <div style={{ marginTop: 16 }}>
                {/* Calculate pagination */}
                {(() => {
                  const startIndex = (componentPage - 1) * componentPageSize;
                  const endIndex = startIndex + componentPageSize;
                  const currentComponents = selectedKitDetail.components.slice(startIndex, endIndex);

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
                                          {/* For component-rental, show Total Quantity as fixed value; for kit-rental, show both Total and Available */}
                                          {kitDetailModalType === 'component-rental' ? (
                                            <Text type="secondary" style={{ fontSize: '13px' }}>
                                              <strong>Total Quantity:</strong> {component.quantityTotal || component.quantity || 0}
                                            </Text>
                                          ) : (
                                            <>
                                              <Text type="secondary" style={{ fontSize: '13px' }}>
                                                <strong>Total:</strong> {component.quantityTotal || component.quantity || 0}
                                              </Text>
                                              <Text type="secondary" style={{ fontSize: '13px', color: '#52c41a' }}>
                                                <strong>Available:</strong> {component.quantityAvailable || 0}
                                              </Text>
                                            </>
                                          )}
                                        </div>
                                        <div style={{ marginTop: 4 }}>
                                          <Text strong style={{ color: '#1890ff', fontSize: '14px' }}>
                                            Price: {component.pricePerCom ? Number(component.pricePerCom).toLocaleString() : 0} VND
                                          </Text>
                                        </div>
                                        {kitDetailModalType === 'component-rental' && (
                                          <>
                                            <div style={{ marginTop: 8 }}>
                                              <Input
                                                type="number"
                                                min={1}
                                                max={component.quantityAvailable || 0}
                                                value={componentQuantities[component.id] || 1}
                                                onChange={(e) => {
                                                  const qty = parseInt(e.target.value) || 1;
                                                  const validQty = Math.min(qty, component.quantityAvailable || 0);
                                                  handleComponentQuantityChange(component.id, validQty > 0 ? validQty : 1);
                                                }}
                                                onBlur={(e) => {
                                                  const qty = parseInt(e.target.value) || 1;
                                                  const available = component.quantityAvailable || 0;
                                                  if (qty > available) {
                                                    message.warning(`Quantity cannot exceed available amount (${available})`);
                                                    handleComponentQuantityChange(component.id, available);
                                                  }
                                                }}
                                                addonBefore="Qty:"
                                                style={{ width: '100%' }}
                                              />
                                            </div>
                                            <div style={{ marginTop: 8 }}>
                                              <Button
                                                type="primary"
                                                block
                                                icon={<ShoppingOutlined />}
                                                onClick={() => {
                                                  const qty = componentQuantities[component.id] || 1;
                                                  const available = component.quantityAvailable || 0;
                                                  if (qty > available) {
                                                    message.error(`Cannot rent ${qty} items. Only ${available} available.`);
                                                    return;
                                                  }
                                                  const componentWithQty = { ...component, rentQuantity: qty };
                                                  handleRentComponent(componentWithQty);
                                                }}
                                                disabled={!component.quantityAvailable || component.quantityAvailable === 0}
                                                style={{
                                                  borderRadius: '8px',
                                                  background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                                  border: 'none',
                                                  fontWeight: 'bold'
                                                }}
                                              >
                                                {component.quantityAvailable === 0 ? 'Sold Out' : 'Rent Component'}
                                              </Button>
                                            </div>
                                          </>
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
                          total={selectedKitDetail.components.length}
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
        )}
      </Modal>

      {/* Rental Detail Modal */}
      <Modal
        title="Rental Details"
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedRentalDetail && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Kit Name" span={2}>
              {selectedRentalDetail.kitName}
            </Descriptions.Item>
            <Descriptions.Item label="Rental ID">
              {selectedRentalDetail.rentalId}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedRentalDetail.status)}>
                {selectedRentalDetail.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Borrow Date">
              {formatDate(selectedRentalDetail.borrowDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Due Date">
              {formatDate(selectedRentalDetail.dueDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Return Date">
              {selectedRentalDetail.returnDate
                ? formatDate(selectedRentalDetail.returnDate)
                : 'Not returned'}
            </Descriptions.Item>
            <Descriptions.Item label="Duration (days)">
              {(() => {
                let days = 0;
                let isLate = false;

                if (selectedRentalDetail.dueDate) {
                  const dueDay = dayjs(selectedRentalDetail.dueDate);
                  const now = dayjs();
                  const returnDay = selectedRentalDetail.returnDate ? dayjs(selectedRentalDetail.returnDate) : null;
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
                if (!selectedRentalDetail.dueDate) return <Tag>N/A</Tag>;

                const dueDay = dayjs(selectedRentalDetail.dueDate);
                const now = dayjs();
                const returnDay = selectedRentalDetail.returnDate ? dayjs(selectedRentalDetail.returnDate) : null;
                const compareDate = returnDay && returnDay.isValid() ? returnDay : now;

                const isLate = dueDay.isValid() && compareDate.isValid() && compareDate.isAfter(dueDay);
                return isLate ? <Tag color="error">Yes</Tag> : <Tag color="success">No</Tag>;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Group" span={2}>
              {selectedRentalDetail.groupName}
            </Descriptions.Item>
            {selectedRentalDetail.requestType === 'BORROW_COMPONENT' && (
              <Descriptions.Item label="Kit Components" span={2}>
                <Spin spinning={loadingComponents}>
                  {rentalComponents.length > 0 ? (
                    <div style={{ marginTop: 8 }}>
                      {rentalComponents.map((component, index) => (
                        <Card
                          key={component.id || index}
                          size="small"
                          style={{
                            marginBottom: 8,
                            borderRadius: '8px',
                            border: '1px solid #e8e8e8'
                          }}
                        >
                          <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text strong style={{ fontSize: '14px' }}>
                                {component.componentName || 'Unnamed Component'}
                              </Text>
                              <Tag color="purple" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                Quantity: {component.quantity || 0}
                              </Tag>
                            </div>
                            {component.kitComponentsId && (
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Component ID: <Text code>{component.kitComponentsId.substring(0, 8)}...</Text>
                              </Text>
                            )}
                          </Space>
                        </Card>
                      ))}
                    </div>
                  ) : !loadingComponents ? (
                    <Text type="secondary">No components found for this rental</Text>
                  ) : null}
                </Spin>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* Group Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <span>Group Details - {selectedGroup?.name}</span>
          </div>
        }
        open={groupDetailModal}
        onCancel={() => {
          setGroupDetailModal(false);
          setSelectedGroup(null);
          setSelectedGroupMembers([]);
          setGroupBorrowStatus(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setGroupDetailModal(false);
            setSelectedGroup(null);
            setSelectedGroupMembers([]);
            setGroupBorrowStatus(null);
          }}>
            Close
          </Button>
        ]}
        width={700}
      >
        {selectedGroup && (
          <div>
            <Row gutter={[24, 24]}>
              <Col span={24}>
                <Card
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedGroup.name}</span>
                      <Tag color="blue">Group ID: {selectedGroup.id}</Tag>
                    </div>
                  }
                  style={{ marginBottom: '16px' }}
                >
                  <Descriptions column={2} bordered>
                    <Descriptions.Item label="Group Name" span={2}>
                      <Text strong>{selectedGroup.name}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Class Name">
                      <Tag color="cyan">
                        {selectedGroup.className || 'N/A'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Semester">
                      <Tag color="purple">
                        {selectedGroup.semester || 'N/A'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Group Leader">
                      <Tag color="gold" icon={<UserOutlined />}>
                        {selectedGroupMembers.find(m => m.roles === 'LEADER')?.accountName || 'N/A'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Members">
                      <Badge count={selectedGroupMembers.length} showZero color="#52c41a" />
                    </Descriptions.Item>
                    <Descriptions.Item label="Lecturer">
                      <Tag color="purple" icon={<UserOutlined />}>
                        {selectedGroup.lecturer}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Group Status">
                      <Tag color={getStatusColor(selectedGroup.status)}>
                        {selectedGroup.status ? selectedGroup.status.charAt(0).toUpperCase() + selectedGroup.status.slice(1) : 'N/A'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Kit Borrow Status" span={2}>
                      {(() => {
                        if (!groupBorrowStatus || groupBorrowStatus.loading) {
                          return <Tag color="default">Checking...</Tag>;
                        }

                        if (!groupBorrowStatus.hasLeader) {
                          return <Tag color="default">No leader assigned</Tag>;
                        }

                        if (groupBorrowStatus.hasBorrowedKit) {
                          return (
                            <Space direction="vertical" size={4}>
                              <Tag color="green">
                                Kit borrowed by leader
                              </Tag>
                              <Text type="secondary">
                                Kit: <Text strong>{groupBorrowStatus.kitName}</Text> | Status:{' '}
                                <Text>{groupBorrowStatus.status}</Text>
                              </Text>
                            </Space>
                          );
                        }

                        return (
                          <Tag color="red">
                            No active kit borrowing
                          </Tag>
                        );
                      })()}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Group Members" style={{ marginBottom: '16px' }}>
                  <List
                    header={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Members List</span>
                        <Badge count={selectedGroupMembers.length} showZero color="#52c41a" />
                      </div>
                    }
                    dataSource={selectedGroupMembers}
                    renderItem={(member) => {
                      const isLeader = member.roles === 'LEADER';
                      return (
                        <List.Item
                          actions={[
                            !isLeader ? (
                              <Button
                                size="small"
                                type="primary"
                                onClick={() => handlePromoteToLeader(selectedGroup.id, member.accountId)}
                              >
                                Promote to Leader
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                danger
                                onClick={() => handleDemoteToMember(selectedGroup.id, member.accountId)}
                              >
                                Demote to Member
                              </Button>
                            )
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar style={{ backgroundColor: isLeader ? '#1890ff' : '#52c41a' }}>
                                {isLeader ? 'L' : 'M'}
                              </Avatar>
                            }
                            title={
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{member.accountName || member.accountEmail}</span>
                                <Tag color={isLeader ? 'gold' : 'blue'} size="small">
                                  {member.roles}
                                </Tag>
                              </div>
                            }
                            description={`Email: ${member.accountEmail}`}
                          />
                        </List.Item>
                      );
                    }}
                  />
                </Card>
              </Col>

              <Col span={24}>
                <Card title="Group Statistics">
                  <Row gutter={[16, 16]}>
                    <Col span={8}>
                      <Statistic
                        title="Total Members"
                        value={selectedGroupMembers.length || 0}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Leaders"
                        value={selectedGroupMembers.filter(m => m.roles === 'LEADER').length || 0}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Members"
                        value={selectedGroupMembers.filter(m => m.roles === 'MEMBER').length || 0}
                        prefix={<UserOutlined />}
                        valueStyle={{ color: '#fa8c16' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </Layout>
  );
}

// Dashboard Component
const DashboardContent = ({ lecturerGroups, wallet, kits, penalties, penaltyDetails }) => (
  <div>
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={12} lg={6}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="My Groups"
              value={lecturerGroups.length}
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
              title="Total Students"
              value={lecturerGroups.reduce((total, group) => total + (group.members?.length || 0), 0)}
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
              title="Available Kits"
              value={kits.filter(kit => kit.status === 'AVAILABLE').length}
              prefix={<ToolOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>

      <Col xs={24} sm={12} lg={6}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <Statistic
              title="Wallet Balance"
              value={wallet.balance}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              suffix="VND"
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
            />
          </Card>
        </motion.div>
      </Col>
    </Row>

    <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
      <Col xs={24} lg={12}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
          <Card title="My Groups" style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            {lecturerGroups.length > 0 ? (
              <List
                size="small"
                dataSource={lecturerGroups}
                renderItem={(group) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar icon={<TeamOutlined />} />}
                      title={group.name}
                      description={`Leader: ${group.leader} | Members: ${group.members.length}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No groups assigned yet" />
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

// Groups Management Component
const GroupsManagement = ({ lecturerGroups, onViewGroupDetails, loadData }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedClassCode, setSelectedClassCode] = useState(null);
  const [studentCodeSearch, setStudentCodeSearch] = useState('');

  // Get unique class codes from groups
  const classCodes = [...new Set(lecturerGroups
    .map(group => group.className)
    .filter(className => className && className.trim() !== '')
  )].sort();

  // Filter groups based on search and filters
  const filteredGroups = lecturerGroups.filter(group => {
    // Filter by search text (GroupName)
    if (searchText && searchText.trim() !== '') {
      const groupName = (group.name || '').toLowerCase();
      if (!groupName.includes(searchText.toLowerCase())) {
        return false;
      }
    }

    // Filter by ClassCode
    if (selectedClassCode) {
      if (group.className !== selectedClassCode) {
        return false;
      }
    }

    // Filter by StudentCode (search)
    if (studentCodeSearch && studentCodeSearch.trim() !== '') {
      const searchLower = studentCodeSearch.toLowerCase();
      const hasStudent = (group.members || []).some(
        member => {
          const memberStudentCode = (member.studentCode || '').toLowerCase();
          return memberStudentCode.includes(searchLower);
        }
      );
      if (!hasStudent) {
        return false;
      }
    }

    return true;
  });

  return (
    <div>
      <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
        <Card
          title="My Groups"
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          {/* Filter and Search Section */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={24} md={8} lg={8}>
              <Input
                placeholder="Search by Group Name"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <Select
                placeholder="Filter by Class Code"
                value={selectedClassCode}
                onChange={setSelectedClassCode}
                allowClear
                style={{ width: '100%' }}
                suffixIcon={<FilterOutlined />}
              >
                {classCodes.map(classCode => (
                  <Select.Option key={classCode} value={classCode}>
                    {classCode}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <Input
                placeholder="Search by Student Code"
                prefix={<SearchOutlined />}
                value={studentCodeSearch}
                onChange={(e) => setStudentCodeSearch(e.target.value)}
                allowClear
                style={{ width: '100%' }}
              />
            </Col>
          </Row>

          {filteredGroups.length > 0 ? (
            <Row gutter={[24, 24]}>
              {filteredGroups.map((group) => (
                <Col xs={24} md={12} lg={8} key={group.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      title={group.name}
                      size="small"
                      hoverable
                      onClick={() => onViewGroupDetails(group)}
                      style={{ cursor: 'pointer' }}
                      extra={
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewGroupDetails(group);
                          }}
                        >
                          View Details
                        </Button>
                      }
                    >
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Class Name">
                          <Tag color="cyan">{group.className || 'N/A'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Semester">
                          <Tag color="purple">{group.semester || 'N/A'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Class Assignments">
                          <Badge
                            count={group.classAssignments?.length || 0}
                            showZero
                            color="#1890ff"
                            title={`${group.classAssignments?.length || 0} class assignments`}
                          />
                        </Descriptions.Item>
                        <Descriptions.Item label="Leader">
                          <Tag color="gold">{group.members.find(m => m.role === 'LEADER')?.email || 'N/A'}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Total Members">
                          <Badge count={group.members?.length || 0} showZero color="#52c41a" />
                        </Descriptions.Item>
                        <Descriptions.Item label="Members">
                          <div style={{ maxHeight: '60px', overflow: 'hidden' }}>
                            {group.members.filter(m => m.role === 'MEMBER').length > 0 ? (
                              group.members.filter(m => m.role === 'MEMBER').map((member, index) => (
                                <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>
                                  {member.name || member.email}
                                </Tag>
                              ))
                            ) : (
                              <Text type="secondary">No members yet</Text>
                            )}
                          </div>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description={
                lecturerGroups.length === 0
                  ? "No groups assigned yet"
                  : "No groups found matching the filters"
              }
            />
          )}
        </Card>
      </motion.div>
    </div>
  );
};

// Kit Rental Component
const KitRental = ({ kits, user, onRent, onViewKitDetail }) => {
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
                            onClick={() => onRent(kit)}
                            disabled={kit.quantityAvailable === 0}
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

// Kit Component Rental Component (global components with kitId = null)
const KitComponentRental = ({ components, onRentComponent }) => {
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const { Option } = Select;

  // Only global components (no kitId)
  const globalComponents = (components || []).filter((component) => !component.kitId);

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

  // Filter components
  const filteredComponents = globalComponents.filter((component) => {
    if ((component.quantityAvailable || 0) <= 0) return false;

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
                  placeholder="Search by component name or ID..."
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

          {/* Component Catalog Grid */}
          {filteredComponents.length === 0 ? (
            <Empty
              description="No components available for rental"
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
                            <BuildOutlined style={{ fontSize: 64, color: '#fff', opacity: 0.8 }} />
                          )}
                          <div style={{
                            position: 'absolute',
                            top: 12,
                            right: 12
                          }}>
                            <Tag
                              color={component.status === 'AVAILABLE' ? 'green' : component.status === 'BORROWED' ? 'orange' : component.status === 'MAINTENANCE' ? 'blue' : 'red'}
                              style={{
                                fontSize: '12px',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              {component.status}
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
                              fontSize: '18px',
                              color: '#2c3e50'
                            }}
                          >
                            {component.componentName || component.name || 'Unnamed Component'}
                          </Text>
                        }
                        description={
                          <div style={{ marginTop: 12 }}>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                              <div>
                                {component.componentType && (
                                  <Tag
                                    color="purple"
                                    style={{
                                      fontSize: '12px',
                                      padding: '4px 12px',
                                      borderRadius: '12px',
                                      marginBottom: 8
                                    }}
                                  >
                                    {component.componentType}
                                  </Tag>
                                )}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                  <strong>Available:</strong> {component.quantityAvailable || 0}
                                </Text>
                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                  <strong>Total:</strong> {component.quantityTotal || 0}
                                </Text>
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
                                  {component.pricePerCom ? `${Number(component.pricePerCom).toLocaleString()} VND` : '0 VND'}
                                </Text>
                              </div>
                              {component.description && (
                                <div style={{ marginTop: 8 }}>
                                  <Text type="secondary" style={{ fontSize: '12px' }} ellipsis>
                                    {component.description}
                                  </Text>
                                </div>
                              )}
                              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                  type="primary"
                                  icon={<ShoppingOutlined />}
                                  onClick={() => onRentComponent(component)}
                                  disabled={(component.quantityAvailable || 0) <= 0}
                                  style={{
                                    color: '#fff',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  Rent
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

          {/* Pagination Info */}
          {filteredComponents.length > 0 && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Text type="secondary">
                Showing {filteredComponents.length} component(s) available for rental
              </Text>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};


// Wallet Management Component
const WalletManagement = ({ wallet, setWallet, onTopUp, onPayPenalties }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferForm] = Form.useForm();
  const [transferLoading, setTransferLoading] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Note: PayPal return is handled at portal level, not here
  // Removed handlePayPalReturn from WalletManagement to avoid duplicate notifications

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

  useEffect(() => {
    loadTransactionHistory();
    // Note: PayPal return is handled at portal level, not here
  }, []);

  const handleShowDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setDetailsModalVisible(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalVisible(false);
    setSelectedTransaction(null);
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
      const walletResponse = await walletAPI.getMyWallet();
      const walletData = walletResponse?.data || walletResponse || {};
      setWallet({
        balance: walletData.balance || 0,
        transactions: transactions
      });
      await loadTransactionHistory();
    } catch (error) {
      console.error('Error transferring money:', error);
      message.error(error.message || 'Chuyển tiền thất bại. Vui lòng thử lại.');
    } finally {
      setTransferLoading(false);
    }
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
                  onClick={onTopUp}
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
                  onClick={onPayPenalties}
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
                          label: type || 'Other',
                          color: 'default',
                          icon: null,
                          bg: '#f6f6f6',
                          border: '1.5px solid #e0e0e0',
                          text: '#333'
                        };
                        switch ((type || '').toUpperCase()) {
                          case 'TOP_UP':
                          case 'TOPUP':
                            config = { label: 'Top Up', color: 'success', icon: <DollarOutlined />, bg: '#e8f8ee', border: '1.5px solid #52c41a', text: '#2a8731' }; break;
                          case 'RENTAL_FEE':
                            config = { label: 'Rental Fee', color: 'geekblue', icon: <ShoppingOutlined />, bg: '#e6f7ff', border: '1.5px solid #177ddc', text: '#177ddc' }; break;
                          case 'PENALTY_PAYMENT':
                          case 'PENALTY':
                          case 'FINE':
                            config = { label: 'Penalty', color: 'error', icon: <ExclamationCircleOutlined />, bg: '#fff1f0', border: '1.5px solid #ff4d4f', text: '#d4001a' }; break;
                          case 'REFUND':
                            config = { label: 'Refund', color: 'purple', icon: <RollbackOutlined />, bg: '#f9f0ff', border: '1.5px solid #722ed1', text: '#722ed1' }; break;
                          default:
                            config = { label: type || 'Other', color: 'default', icon: <InfoCircleOutlined />, bg: '#fafafa', border: '1.5px solid #bfbfbf', text: '#595959' };
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

// Borrow Status Component
const BorrowStatus = ({ borrowStatus, onViewDetail }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState(null);

  const statusColorMap = {
    PENDING: 'orange',
    WAITING_APPROVAL: 'orange',
    APPROVED: 'green',
    BORROWED: 'blue',
    RETURNED: 'default',
    COMPLETED: 'default',
    REJECTED: 'red',
    CANCELLED: 'red',
    OVERDUE: 'magenta'
  };

  const requestTypeColors = {
    BORROW_KIT: 'blue',
    BORROW_COMPONENT: 'purple',
    EXTEND_RENTAL: 'geekblue',
    RETURN_KIT: 'cyan'
  };

  const renderStatusTag = (status) => {
    const upperStatus = (status || 'PENDING').toUpperCase();
    return (
      <Tag color={statusColorMap[upperStatus] || 'default'}>
        {upperStatus.replace(/_/g, ' ')}
      </Tag>
    );
  };

  // Filter data based on status and date range
  const filteredDataSource = (Array.isArray(borrowStatus) ? borrowStatus : []).filter((record) => {
    // Filter by status
    if (filterStatus !== 'all') {
      const recordStatus = (record.status || '').toUpperCase();
      if (recordStatus !== filterStatus.toUpperCase()) {
        return false;
      }
    }

    // Filter by createdAt date range
    if (filterDateRange && filterDateRange.length === 2) {
      const createdAt = record.raw?.createdAt || record.borrowDate || record.createdAt;
      if (!createdAt) {
        return false;
      }

      const recordDate = dayjs(createdAt);
      const startDate = filterDateRange[0].startOf('day');
      const endDate = filterDateRange[1].endOf('day');

      if (!recordDate.isValid() || recordDate.isBefore(startDate) || recordDate.isAfter(endDate)) {
        return false;
      }
    }

    return true;
  });

  const columns = [
    {
      title: 'Request ID',
      dataIndex: 'rentalId',
      key: 'rentalId',
      render: (value, record) => {
        const display = value || record?.id || 'N/A';
        const displayString = display?.toString() || 'N/A';
        return (
          <Text code>
            {displayString.length > 10 ? `${displayString.slice(0, 8)}...` : displayString}
          </Text>
        );
      }
    },
    {
      title: 'Kit Name',
      dataIndex: 'kitName',
      key: 'kitName',
      render: (kitName) => <Text strong>{kitName || 'N/A'}</Text>
    },
    {
      title: 'Request Type',
      dataIndex: 'requestType',
      key: 'requestType',
      render: (type) => {
        const upperType = (type || 'BORROW_KIT').toUpperCase();
        return (
          <Tag color={requestTypeColors[upperType] || 'geekblue'}>
            {upperType.replace(/_/g, ' ')}
          </Tag>
        );
      }
    },
    {
      title: 'Expected Return Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => formatDateTimeDisplay(date)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatusTag(status)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => onViewDetail(record)}
          >
            View Details
          </Button>
        </Space>
      )
    }
  ];

  const { RangePicker } = DatePicker;
  const { Option } = Select;

  return (
    <div>
      <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
        <Card
          title="Borrow Tracking"
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          {/* Filter Section */}
          <div style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Filter by Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: '100%' }}
                  allowClear
                >
                  <Option value="all">All Status</Option>
                  <Option value="PENDING">Pending</Option>
                  <Option value="WAITING_APPROVAL">Waiting Approval</Option>
                  <Option value="APPROVED">Approved</Option>
                  <Option value="BORROWED">Borrowed</Option>
                  <Option value="RETURNED">Returned</Option>
                  <Option value="COMPLETED">Completed</Option>
                  <Option value="REJECTED">Rejected</Option>
                  <Option value="CANCELLED">Cancelled</Option>
                  <Option value="OVERDUE">Overdue</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['Start Date', 'End Date']}
                  value={filterDateRange}
                  onChange={setFilterDateRange}
                  format="DD/MM/YYYY"
                  allowClear
                />
              </Col>
              <Col xs={24} sm={24} md={8}>
                <Space>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterDateRange(null);
                    }}
                  >
                    Reset Filters
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>

          <Table
            dataSource={filteredDataSource}
            columns={columns}
            rowKey={(record, index) => record.id || record.rentalId || index}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
            size="middle"
            scroll={{ x: 900 }}
          />
        </Card>
      </motion.div>
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

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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

                      <Descriptions.Item label="Lecturer Code">
                        <Text>{profile.lecturerCode || 'N/A'}</Text>
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

export default LecturerPortal; 
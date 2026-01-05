import React, { useState, useEffect, useMemo } from 'react';
import {
  Layout,
  Menu,
  Card,
  Table,
  Button,
  Input,
  Select,
  AutoComplete,
  Modal,
  Form,
  message,
  Tag,
  Row,
  Col,
  Typography,
  Space,
  Avatar,
  Badge,
  List,
  Progress,
  Alert,
  Empty,
  Spin,
  notification,
  Popover
} from 'antd';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  ReadOutlined,
  LogoutOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BarChartOutlined,
  PieChartOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ImportOutlined,
  ExportOutlined,
  ToolOutlined,
  ThunderboltOutlined,
  UserAddOutlined,
  SearchOutlined,
  SortAscendingOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import { classesAPI, userAPI, classAssignmentAPI, excelImportAPI, notificationAPI } from './api';

// Mock data - TODO: Replace with real API calls
const mockSemesters = [];

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

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

// Format date time for display
const formatDateTimeDisplay = (dateString) => {
  if (!dateString) return 'N/A';
  const date = dayjs(dateString);
  return date.isValid() ? date.format('DD/MM/YYYY HH:mm') : 'N/A';
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

  // State for modals and forms
  const [semesterModal, setSemesterModal] = useState({ visible: false, data: {} });
  const [studentModal, setStudentModal] = useState({ visible: false, data: {} });
  const [lecturerModal, setLecturerModal] = useState({ visible: false, data: {} });
  const [iotSubjectModal, setIotSubjectModal] = useState({ visible: false, data: {} });
  const [iotSubjectStudentsModal, setIotSubjectStudentsModal] = useState({ visible: false, data: {} });
  const [classStudents, setClassStudents] = useState([]);
  const [loadingClassStudents, setLoadingClassStudents] = useState(false);
  const [importFormatModal, setImportFormatModal] = useState({ visible: false, type: null });

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [notificationPopoverOpen, setNotificationPopoverOpen] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Sheet selection state
  const [sheetSelectionModal, setSheetSelectionModal] = useState({ visible: false, sheets: [], selectedSheet: null, file: null, importType: null, importData: null });

  // Form instances
  const [semesterForm] = Form.useForm();
  const [studentForm] = Form.useForm();
  const [lecturerForm] = Form.useForm();
  const [iotSubjectForm] = Form.useForm();

  // State for semester-based management
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [iotSubjects, setIotSubjects] = useState([]);
  const [lecturersList, setLecturersList] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]); // For ClassCode dropdown in Student form

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

  // Load notifications when user is available
  useEffect(() => {
    if (user && user.id) {
      loadNotifications();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      setSemesters(mockSemesters);

      // Fetch Students from API
      try {
        const studentsData = await userAPI.getStudents();
        console.log('Fetched students data:', studentsData);

        // Fetch class assignments to get class codes for students
        let classAssignmentsData = [];
        try {
          classAssignmentsData = await classAssignmentAPI.getAll();
          console.log('Fetched class assignments data:', classAssignmentsData);
        } catch (error) {
          console.error('Error fetching class assignments:', error);
        }

        const formatDate = (dateStr) => {
          if (!dateStr) return '-';
          try {
            const date = new Date(dateStr);
            return date.toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          } catch (e) {
            console.error('Error formatting date:', e, dateStr);
            return '-';
          }
        };

        // Create a map of student IDs to their class codes
        const studentClassMap = {};
        const assignmentsArray = Array.isArray(classAssignmentsData) ? classAssignmentsData : [];
        assignmentsArray.forEach(assignment => {
          const roleName = assignment.roleName || assignment.role || '';
          const roleUpper = roleName.toUpperCase();
          const isStudent = roleUpper === 'STUDENT' || roleUpper === 'STUDENT_ROLE';

          if (isStudent && assignment.accountId && assignment.classCode) {
            const studentId = assignment.accountId.toString();
            if (!studentClassMap[studentId]) {
              studentClassMap[studentId] = [];
            }
            studentClassMap[studentId].push(assignment.classCode);
          }
        });

        const mappedStudents = studentsData.map(student => {
          const studentId = student.id?.toString();
          const classCodes = studentClassMap[studentId] || [];
          const studentClass = classCodes.length > 0 ? classCodes.join(', ') : 'N/A';

          return {
            id: student.id,
            name: student.fullName,
            email: student.email,
            studentCode: student.studentCode,
            phoneNumber: student.phoneNumber,
            studentClass: studentClass,
            createdAt: formatDate(student.createdAt),
            status: student.status
          };
        });

        setStudents(mappedStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
        setStudents([]);
      }

      // Fetch Lecturers from API
      try {
        const lecturersData = await userAPI.getLecturers();
        console.log('Fetched lecturers data:', lecturersData);

        // Fetch class assignments to get class codes for lecturers (if not already fetched)
        let classAssignmentsDataForLecturers = [];
        try {
          classAssignmentsDataForLecturers = await classAssignmentAPI.getAll();
          console.log('Fetched class assignments data for lecturers:', classAssignmentsDataForLecturers);
        } catch (error) {
          console.error('Error fetching class assignments for lecturers:', error);
        }

        const formatDate = (dateStr) => {
          if (!dateStr) return '-';
          try {
            const date = new Date(dateStr);
            return date.toLocaleString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          } catch (e) {
            console.error('Error formatting date:', e, dateStr);
            return '-';
          }
        };

        // Create a map of lecturer IDs to their class codes
        const lecturerClassMap = {};
        const assignmentsArrayForLecturers = Array.isArray(classAssignmentsDataForLecturers) ? classAssignmentsDataForLecturers : [];
        assignmentsArrayForLecturers.forEach(assignment => {
          const roleName = assignment.roleName || assignment.role || '';
          const roleUpper = roleName.toUpperCase();
          const isLecturer = roleUpper === 'LECTURER' || roleUpper === 'TEACHER' || roleUpper === 'LECTURER_ROLE';

          if (isLecturer && assignment.accountId && assignment.classCode) {
            const lecturerId = assignment.accountId.toString();
            if (!lecturerClassMap[lecturerId]) {
              lecturerClassMap[lecturerId] = [];
            }
            lecturerClassMap[lecturerId].push(assignment.classCode);
          }
        });

        const mappedLecturers = lecturersData.map(lecturer => {
          const lecturerId = lecturer.id?.toString();
          const classCodes = lecturerClassMap[lecturerId] || [];
          const lecturerClass = classCodes.length > 0 ? classCodes.join(', ') : 'N/A';

          return {
            id: lecturer.id || lecturer.email,
            name: lecturer.fullName,
            email: lecturer.email,
            lecturerCode: lecturer.lecturerCode || 'N/A',
            phoneNumber: lecturer.phone || '',
            lecturerClass: lecturerClass,
            createdAt: formatDate(lecturer.createdAt),
            status: lecturer.status || 'ACTIVE'
          };
        });

        setLecturers(mappedLecturers);
      } catch (error) {
        console.error('Error fetching lecturers:', error);
        setLecturers([]);
      }

      // Fetch IOT subjects from API
      try {
        const classesData = await classesAPI.getAllClasses();
        console.log('Fetched classes data:', classesData);

        // Map backend data to frontend format
        const mappedClasses = classesData.map(cls => {
          console.log('Processing class:', cls.id, 'createdAt:', cls.createdAt, 'updatedAt:', cls.updatedAt);

          // Format date từ LocalDateTime (format: "2024-01-15T10:30:00")
          const formatDate = (dateStr) => {
            if (!dateStr) return '-';
            try {
              const date = new Date(dateStr);
              return date.toLocaleString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });
            } catch (e) {
              console.error('Error formatting date:', e, dateStr);
              return '-';
            }
          };

          return {
            id: cls.id,
            classCode: cls.classCode,
            semester: cls.semester,
            status: cls.status,
            teacherId: cls.teacherId,
            teacherName: cls.teacherName,
            teacherEmail: cls.teacherEmail,
            createdAt: formatDate(cls.createdAt),
            updatedAt: formatDate(cls.updatedAt)
          };
        });

        console.log('Mapped classes:', mappedClasses);
        setIotSubjects(mappedClasses);

        // Extract unique semesters from classes
        const uniqueSemesters = [...new Set(mappedClasses
          .map(cls => cls.semester)
          .filter(semester => semester && semester.trim() !== '')
        )].map((semester, index) => ({
          id: `semester-${index}`,
          name: semester,
          value: semester,
          status: 'Active'
        }));

        console.log('Extracted semesters:', uniqueSemesters);
        setSemesters(uniqueSemesters);
      } catch (error) {
        console.error('Error fetching classes:', error);
        notification.error({
          message: 'Error',
          description: 'Failed to load IOT subjects',
          placement: 'topRight',
        });
        setIotSubjects([]);
        setSemesters([]);
      }

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

  // Notification Functions
  const loadNotifications = async () => {
    try {
      setNotificationLoading(true);
      // Use getMyNotifications to fetch notifications for current user
      const response = await notificationAPI.getMyNotifications();
      const data = response?.data ?? response;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setNotificationLoading(false);
    }
  };

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

  // Import/Export Functions
  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(dataBlob, `${filename}.xlsx`);
  };


  const handleExportStudents = () => {
    const studentData = students.map(student => ({
      // Sorted columns: ClassCode, StudentCode, name, email, phone number, Status, CreateDate
      ClassCode: student.studentClass && student.studentClass !== 'N/A' ? student.studentClass : '',
      StudentCode: student.studentCode,
      name: student.name,
      email: student.email,
      'phone number': student.phoneNumber || '',
      Status: student.status,
      CreateDate: student.createdAt,
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
      'Lecturer Code': lecturer.lecturerCode || 'N/A',
      'Phone Number': lecturer.phoneNumber || '',
      'Status': lecturer.status,
      'Hire Date': lecturer.createdAt
    }));
    exportToExcel(lecturerData, 'lecturers_list');
    notification.success({
      message: 'Export Successful',
      description: 'Lecturer list exported to Excel file',
      placement: 'topRight',
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
      if (importType === 'students') {
        await handleImportStudents(file, sheetName);
      } else if (importType === 'lecturers') {
        await handleImportLecturers(file, sheetName);
      } else {
        // Invalid import type - show error notification
        notification.error({
          message: 'Invalid Import Type',
          description: `Import type "${importType}" is not supported in Academic Affairs Portal. Only "students" and "lecturers" are allowed.`,
          placement: 'topRight',
          duration: 5,
        });
        console.error(`Unsupported import type: ${importType}`);
        return;
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

  const handleImportStudents = async (file, sheetName = null) => {
    try {
      // Use the generic import endpoint with STUDENT role
      const response = await excelImportAPI.importAccounts(file, 'STUDENT', sheetName);

      // Handle response format
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
          description: `Successfully imported ${successCount} student(s)${sheetName ? ` from sheet "${sheetName}"` : ''}. ${errorCount > 0 ? `${errorCount} error(s) occurred.` : ''}`,
          placement: 'topRight',
          duration: 5,
        });
        // Refresh students list only if import was successful
        await loadData();
      } else if (successCount > 0 && errorCount > 0) {
        // Partial success: some rows imported, some failed
        notification.warning({
          message: 'Import Completed with Errors',
          description: `${message}${errorDetails ? ` Errors: ${errorDetails}` : ''}`,
          placement: 'topRight',
          duration: 8,
        });
        // Refresh students list to show imported data
        await loadData();
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
    } catch (error) {
      console.error('Import error:', error);
      notification.error({
        message: 'Import Failed',
        description: error.message || 'Failed to import students. Please check file format. Expected Excel format with columns: studentCode, StudentName, email, phone, StudentClass. Password will be set to "1" by default.',
        placement: 'topRight',
        duration: 5,
      });
    }
  };

  const handleImportLecturers = async (file, sheetName = null) => {
    try {
      // Use the generic import endpoint with LECTURER role
      const response = await excelImportAPI.importAccounts(file, 'LECTURER', sheetName);

      // Handle response format
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
          description: `Successfully imported ${successCount} lecturer(s)${sheetName ? ` from sheet "${sheetName}"` : ''}. ${errorCount > 0 ? `${errorCount} error(s) occurred.` : ''}`,
          placement: 'topRight',
          duration: 5,
        });
        // Refresh lecturers list only if import was successful
        await loadData();
      } else if (successCount > 0 && errorCount > 0) {
        // Partial success: some rows imported, some failed
        notification.warning({
          message: 'Import Completed with Errors',
          description: `${message}${errorDetails ? ` Errors: ${errorDetails}` : ''}`,
          placement: 'topRight',
          duration: 8,
        });
        // Refresh lecturers list to show imported data
        await loadData();
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
    } catch (error) {
      console.error('Import error:', error);
      notification.error({
        message: 'Import Failed',
        description: error.message || 'Failed to import lecturers. Please check file format. Expected Excel format with columns: email, fullname, phone, class_code, Semester. Password will be set to "1" by default.',
        placement: 'topRight',
        duration: 5,
      });
    }
  };




  // IOT Subject Management Functions
  const handleAddIotSubject = async () => {
    iotSubjectForm.resetFields();
    setIotSubjectModal({ visible: true, data: {} });

    // Fetch lecturers when opening the modal
    try {
      const lecturers = await classesAPI.getListLecturers();
      setLecturersList(lecturers || []);
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      message.error('Failed to load lecturers');
    }
  };

  const handleEditIotSubject = async (record) => {
    // Fetch lecturers first before opening modal
    try {
      const lecturers = await classesAPI.getListLecturers();
      setLecturersList(lecturers || []);

      // Map record data to form values
      const formData = {
        classCode: record.classCode,
        semester: record.semester,
        status: record.status,
        lecturerId: record.teacherId  // Map teacherId to lecturerId field
      };

      iotSubjectForm.setFieldsValue(formData);
      setIotSubjectModal({ visible: true, data: record });
    } catch (error) {
      console.error('Error fetching lecturers:', error);
      message.error('Failed to load lecturers');
    }
  };

  const handleViewIotSubjectStudents = async (record) => {
    try {
      setLoadingClassStudents(true);
      setIotSubjectStudentsModal({ visible: true, data: record });

      // Get all assignments for this class (including students)
      const allAssignments = await classAssignmentAPI.getAll();
      console.log('ClassAssignments API Response (for students):', allAssignments);

      // Ensure we have an array
      const assignmentsArray = Array.isArray(allAssignments) ? allAssignments : [];

      // Filter students for this class
      const studentsInClass = assignmentsArray.filter(assignment => {
        const roleName = assignment.roleName || assignment.role || '';
        const roleUpper = roleName.toUpperCase();
        const isStudent = roleUpper === 'STUDENT' ||
          roleUpper === 'STUDENT_ROLE';

        // Compare classId (handle both UUID and string formats)
        const assignmentClassId = assignment.classId?.toString();
        const recordClassId = record.id?.toString();
        const matchesClass = assignmentClassId === recordClassId;

        console.log(`Assignment ${assignment.id}: roleName=${roleName}, classId=${assignmentClassId}, recordClassId=${recordClassId}, isStudent=${isStudent}, matchesClass=${matchesClass}`);

        return isStudent && matchesClass;
      });

      console.log('Filtered students in class:', studentsInClass);
      setClassStudents(studentsInClass);
    } catch (error) {
      console.error('Error loading class students:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load class students',
        placement: 'topRight',
      });
      setClassStudents([]);
    } finally {
      setLoadingClassStudents(false);
    }
  };

  const handleRemoveStudentFromClass = async (record, classId) => {
    Modal.confirm({
      title: 'Remove Student',
      content: `Are you sure you want to remove "${record.accountName || record.accountEmail}" from this class?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await classAssignmentAPI.delete(record.id);

          // Refresh the student list in the modal
          const allAssignments = await classAssignmentAPI.getAll();
          const assignmentsArray = Array.isArray(allAssignments) ? allAssignments : [];

          // Filter students for this class
          const studentsInClass = assignmentsArray.filter(assignment => {
            const roleName = assignment.roleName || assignment.role || '';
            const roleUpper = roleName.toUpperCase();
            const isStudent = roleUpper === 'STUDENT' || roleUpper === 'STUDENT_ROLE';

            const assignmentClassId = assignment.classId?.toString();
            const recordClassId = classId?.toString();
            const matchesClass = assignmentClassId === recordClassId;

            return isStudent && matchesClass;
          });

          setClassStudents(studentsInClass);

          notification.success({
            message: 'Success',
            description: 'Student removed from class successfully',
            placement: 'topRight',
          });
        } catch (error) {
          console.error('Error removing student:', error);
          notification.error({
            message: 'Error',
            description: error.message || 'Failed to remove student',
            placement: 'topRight',
          });
        }
      },
    });
  };

  const handleDeleteIotSubject = (record) => {
    Modal.confirm({
      title: 'Delete IOT Subject',
      content: `Are you sure you want to delete "${record.classCode}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await classesAPI.deleteClass(record.id);
          await loadData();
          message.success('IOT Subject deleted successfully');
        } catch (error) {
          console.error('Error deleting IOT subject:', error);
          message.error('Failed to delete IOT subject');
        }
      },
    });
  };

  // Form submission handlers



  const handleIotSubjectSubmit = async () => {
    try {
      const values = await iotSubjectForm.validateFields();

      if (iotSubjectModal.data.id) {
        // Edit existing IOT subject
        const updateData = {
          classCode: values.classCode,
          semester: values.semester,
          status: values.status,
          teacherId: values.lecturerId  // Add teacherId for update
        };

        await classesAPI.updateClass(iotSubjectModal.data.id, updateData);

        // Refresh data
        await loadData();
        message.success('IOT Subject updated successfully');
      } else {
        // Add new IOT subject
        const createData = {
          classCode: values.classCode,
          semester: values.semester,
          status: values.status,
          teacherId: values.lecturerId
        };

        await classesAPI.createClass(createData, values.lecturerId);

        // Refresh data
        await loadData();
        message.success('IOT Subject created successfully');
      }

      setIotSubjectModal({ visible: false, data: {} });
      iotSubjectForm.resetFields();
    } catch (error) {
      console.error('Error submitting IOT subject:', error);
      message.error('Failed to save IOT subject');
    }
  };

  // Student Management Functions
  const handleAddStudent = async () => {
    studentForm.resetFields();
    setStudentModal({ visible: true, data: {} });

    // Fetch available classes for ClassCode dropdown
    try {
      const classesData = await classesAPI.getAllClasses();
      const classOptions = classesData.map(cls => ({
        value: cls.classCode,
        label: `${cls.classCode} - ${cls.semester || ''}`
      }));
      setAvailableClasses(classOptions);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setAvailableClasses([]);
    }
  };

  const handleEditStudent = async (record) => {
    // Fetch available classes for ClassCode dropdown
    try {
      const classesData = await classesAPI.getAllClasses();
      const classOptions = classesData.map(cls => ({
        value: cls.classCode,
        label: `${cls.classCode} - ${cls.semester || ''}`
      }));
      setAvailableClasses(classOptions);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setAvailableClasses([]);
    }

    // Map record data to form values
    // Extract classCode from studentClass (format: "Class1, Class2" or "Class1")
    const studentClass = record.studentClass || '';
    const classCode = studentClass.includes(',') ? studentClass.split(',')[0].trim() : studentClass.trim();

    const formData = {
      ...record,
      classCode: classCode !== 'N/A' ? classCode : undefined
    };
    studentForm.setFieldsValue(formData);
    setStudentModal({ visible: true, data: record });
  };

  const handleDeleteStudent = async (record) => {
    try {
      // Fetch class assignments to get ClassCode
      setLoading(true);
      const allAssignments = await classAssignmentAPI.getAll();
      const assignmentsArray = Array.isArray(allAssignments) ? allAssignments : [];

      // Find class assignments for this student
      const studentAssignments = assignmentsArray.filter(assignment => {
        const assignmentAccountId = assignment.accountId?.toString();
        const recordId = record.id?.toString();
        const roleName = assignment.roleName || assignment.role || '';
        const roleUpper = roleName.toUpperCase();
        const isStudent = roleUpper === 'STUDENT' || roleUpper === 'STUDENT_ROLE';
        return assignmentAccountId === recordId && isStudent;
      });

      // Get ClassCodes from assignments
      const classCodes = studentAssignments
        .map(assignment => assignment.classCode || 'N/A')
        .filter(code => code !== 'N/A');

      const classCodeText = classCodes.length > 0
        ? `\n\nClass Code(s): ${classCodes.join(', ')}`
        : '\n\nClass Code: Not assigned';

      Modal.confirm({
        title: 'Are you sure you want to delete this student?',
        content: `This will permanently delete ${record.name} from the system.${classCodeText}`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            setLoading(true);
            await userAPI.deleteUser(record.id);

            // Refresh all data including ClassAssignments to update classCode
            await loadData();

            message.success('Student deleted successfully');
          } catch (error) {
            console.error('Error deleting student:', error);
            message.error('Failed to delete student: ' + error.message);
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (error) {
      console.error('Error fetching class assignments:', error);
      // Still show confirmation dialog even if fetch fails
      Modal.confirm({
        title: 'Are you sure you want to delete this student?',
        content: `This will permanently delete ${record.name} from the system.`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            setLoading(true);
            await userAPI.deleteUser(record.id);

            // Refresh students list from API
            const studentsData = await userAPI.getStudents();

            const formatDate = (dateStr) => {
              if (!dateStr) return '-';
              try {
                const date = new Date(dateStr);
                return date.toLocaleString('vi-VN', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
              } catch (e) {
                console.error('Error formatting date:', e, dateStr);
                return '-';
              }
            };

            const mappedStudents = studentsData.map(student => ({
              id: student.id,
              name: student.fullName,
              email: student.email,
              studentCode: student.studentCode,
              phoneNumber: student.phoneNumber,
              createdAt: formatDate(student.createdAt),
              status: student.status
            }));

            setStudents(mappedStudents);

            message.success('Student deleted successfully');
          } catch (error) {
            console.error('Error deleting student:', error);
            message.error('Failed to delete student: ' + error.message);
          } finally {
            setLoading(false);
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async () => {
    try {
      const values = await studentForm.validateFields();

      if (studentModal.data.id) {
        // Edit existing student - check for duplicates before updating
        const currentStudent = studentModal.data;

        // Check for duplicate email (excluding current student)
        if (values.email && values.email !== currentStudent.email) {
          const emailExists = students.some(s =>
            s.id !== currentStudent.id && s.email?.toLowerCase() === values.email?.toLowerCase()
          );
          if (emailExists) {
            studentForm.setFields([{ name: 'email', errors: ['Email already exists'] }]);
            throw new Error('Email already exists');
          }
        }

        // Check for duplicate studentCode (excluding current student)
        if (values.studentCode && values.studentCode !== currentStudent.studentCode) {
          const studentCodeExists = students.some(s =>
            s.id !== currentStudent.id && s.studentCode === values.studentCode
          );
          if (studentCodeExists) {
            studentForm.setFields([{ name: 'studentCode', errors: ['Student Code already exists'] }]);
            throw new Error('Student Code already exists');
          }
        }

        // Check for duplicate phoneNumber (excluding current student)
        if (values.phoneNumber && values.phoneNumber !== currentStudent.phoneNumber) {
          const phoneExists = students.some(s =>
            s.id !== currentStudent.id && s.phoneNumber === values.phoneNumber
          );
          if (phoneExists) {
            studentForm.setFields([{ name: 'phoneNumber', errors: ['Phone number already exists'] }]);
            throw new Error('Phone number already exists');
          }
        }

        // Update student via API
        try {
          await userAPI.updateStudent(studentModal.data.id, {
            name: values.name,
            email: values.email,
            studentCode: values.studentCode,
            phoneNumber: values.phoneNumber,
            classCode: values.classCode
          });

          // Refresh students list
          await loadData();
          message.success('Student updated successfully');
        } catch (apiError) {
          console.error('API error:', apiError);
          const errorMessage = apiError.message || 'Failed to update student';

          // Parse backend error messages
          if (errorMessage.includes('Email already exists')) {
            studentForm.setFields([{ name: 'email', errors: ['Email already exists'] }]);
          } else if (errorMessage.includes('Student Code already exists')) {
            studentForm.setFields([{ name: 'studentCode', errors: ['Student Code already exists'] }]);
          } else if (errorMessage.includes('Phone number already exists')) {
            studentForm.setFields([{ name: 'phoneNumber', errors: ['Phone number already exists'] }]);
          }

          message.error(errorMessage);
          throw apiError;
        }
      } else {
        // Create new student via API
        const response = await userAPI.createSingleStudent({
          name: values.name,
          email: values.email,
          studentCode: values.studentCode,
          phoneNumber: values.phoneNumber,
          classCode: values.classCode
        });

        console.log('Student created:', response);

        // Refresh students list
        await loadData();
        message.success('Student created successfully');
      }

      setStudentModal({ visible: false, data: {} });
      studentForm.resetFields();
    } catch (error) {
      console.error('Error submitting student:', error);
      // Error message already set above or by API
      if (!error.message || (!error.message.includes('already exists') && !error.message.includes('required'))) {
        message.error('Failed to save student: ' + (error.message || 'Unknown error'));
      }
    }
  };

  // Lecturer Management Functions
  const handleAddLecturer = async () => {
    lecturerForm.resetFields();

    // Fetch available classes for ClassCode dropdown
    try {
      const classesData = await classesAPI.getAllClasses();
      const classOptions = (classesData || []).map(cls => ({
        value: cls.classCode,
        label: `${cls.classCode} - ${cls.semester || ''}`,
        classCode: cls.classCode,
        semester: cls.semester
      }));
      setAvailableClasses(classOptions);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setAvailableClasses([]);
    }

    setLecturerModal({ visible: true, data: {} });
  };

  const handleEditLecturer = async (record) => {
    // Fetch available classes for ClassCode dropdown
    try {
      const classesData = await classesAPI.getAllClasses();
      const classOptions = (classesData || []).map(cls => ({
        value: cls.classCode,
        label: `${cls.classCode} - ${cls.semester || ''}`,
        classCode: cls.classCode,
        semester: cls.semester
      }));
      setAvailableClasses(classOptions);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setAvailableClasses([]);
    }

    // Get current classCode from lecturer's class assignments
    let currentClassCode = null;
    try {
      const allAssignments = await classAssignmentAPI.getAll();
      const assignmentsArray = Array.isArray(allAssignments) ? allAssignments : [];
      const lecturerAssignments = assignmentsArray.filter(assignment => {
        const roleName = assignment.roleName || assignment.role || '';
        const roleUpper = roleName.toUpperCase();
        const isLecturer = roleUpper === 'LECTURER' || roleUpper === 'LECTURER_ROLE';
        const assignmentAccountId = assignment.accountId?.toString();
        const recordId = record.id?.toString();
        return isLecturer && assignmentAccountId === recordId;
      });

      if (lecturerAssignments.length > 0) {
        // Get classCode from first assignment
        const firstAssignment = lecturerAssignments[0];
        if (firstAssignment.classCode) {
          currentClassCode = firstAssignment.classCode;
        } else if (firstAssignment.classId) {
          // Find class by ID
          const classesData = await classesAPI.getAllClasses();
          const targetClass = classesData.find(cls => cls.id?.toString() === firstAssignment.classId?.toString());
          if (targetClass) {
            currentClassCode = targetClass.classCode;
          }
        }
      }
    } catch (error) {
      console.error('Error fetching lecturer class assignments:', error);
    }

    // Convert date string to dayjs object for DatePicker
    const formData = {
      ...record,
      hireDate: record.hireDate ? dayjs(record.hireDate) : null,
      classCode: currentClassCode
    };
    lecturerForm.setFieldsValue(formData);
    setLecturerModal({ visible: true, data: record });
  };

  const handleDeleteLecturer = async (record) => {
    try {
      // Fetch class assignments to get ClassCode
      setLoading(true);
      const allAssignments = await classAssignmentAPI.getAll();
      const assignmentsArray = Array.isArray(allAssignments) ? allAssignments : [];

      // Find class assignments for this lecturer
      const lecturerAssignments = assignmentsArray.filter(assignment => {
        const assignmentAccountId = assignment.accountId?.toString();
        const recordId = record.id?.toString();
        const roleName = assignment.roleName || assignment.role || '';
        const roleUpper = roleName.toUpperCase();
        const isLecturer = roleUpper === 'LECTURER' || roleUpper === 'TEACHER' || roleUpper === 'LECTURER_ROLE';
        return assignmentAccountId === recordId && isLecturer;
      });

      // Get ClassCodes from assignments
      const classCodes = lecturerAssignments
        .map(assignment => assignment.classCode || 'N/A')
        .filter(code => code !== 'N/A');

      const classCodeText = classCodes.length > 0
        ? `\n\nClass Code(s): ${classCodes.join(', ')}`
        : '\n\nClass Code: Not assigned';

      Modal.confirm({
        title: 'Are you sure you want to delete this lecturer?',
        content: `This will permanently delete ${record.name} from the system.${classCodeText}`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            setLoading(true);
            await userAPI.deleteUser(record.id);

            // Refresh all data including ClassAssignments to update classCode
            await loadData();

            message.success('Lecturer deleted successfully');
          } catch (error) {
            console.error('Error deleting lecturer:', error);
            console.error('Error details:', {
              message: error.message,
              error: error,
              response: error.response,
              errorString: error.toString(),
              errorJSON: JSON.stringify(error, Object.getOwnPropertyNames(error))
            });

            // Parse error message - handleResponse throws Error with message from backend JSON
            // The error message from backend is in format: "Failed to delete user: Failed to delete borrowing requests: ..."
            let errorMessage = 'Unknown error';

            // Try multiple ways to extract error message
            // 1. Check error.message first
            if (error.message && error.message !== 'Unknown error' && error.message.trim() !== '') {
              errorMessage = error.message;
            }
            // 2. Check error.response.data (axios-style)
            else if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
              errorMessage = error.response.data.error;
            }
            // 3. Check error.stack (might contain message)
            else if (error.stack) {
              // Extract message from stack trace if it contains useful info
              const stackLines = error.stack.split('\n');
              if (stackLines.length > 0 && stackLines[0].includes('Error:')) {
                const stackMessage = stackLines[0].replace('Error:', '').trim();
                if (stackMessage && stackMessage !== 'Unknown error') {
                  errorMessage = stackMessage;
                }
              }
            }
            // 4. Check error.toString()
            else if (error.toString && error.toString() !== '[object Object]' && error.toString() !== 'Error: Unknown error') {
              const toStringResult = error.toString();
              if (toStringResult.includes('Error:')) {
                errorMessage = toStringResult.split('Error:')[1]?.trim() || errorMessage;
              } else {
                errorMessage = toStringResult;
              }
            }
            // 5. Check if error is a string
            else if (typeof error === 'string' && error !== 'Unknown error') {
              errorMessage = error;
            }
            // 6. Try to stringify and parse
            else {
              try {
                const errorStr = JSON.stringify(error, Object.getOwnPropertyNames(error));
                if (errorStr && errorStr !== '{}' && errorStr !== '{"message":"Unknown error"}') {
                  const parsed = JSON.parse(errorStr);
                  errorMessage = parsed.message || parsed.error || parsed.data?.message || errorStr;
                }
              } catch (e) {
                console.error('Failed to stringify error:', e);
              }
            }

            // Final fallback: if still "Unknown error", check if we can get more info from console
            if (errorMessage === 'Unknown error' || errorMessage.trim() === '') {
              console.warn('Could not extract error message, error object:', error);
              // Try one more time with a different approach
              if (error.constructor && error.constructor.name !== 'Error') {
                errorMessage = `Error type: ${error.constructor.name}`;
              }
            }

            // Log for debugging
            console.log('Parsed error message:', errorMessage);
            console.log('Error message length:', errorMessage.length);
            console.log('Error message includes "borrowing":', errorMessage.toLowerCase().includes('borrowing'));
            console.log('Error message includes "foreign key":', errorMessage.toLowerCase().includes('foreign key'));

            const errorMessageLower = errorMessage.toLowerCase();

            // Check for foreign key constraint violations
            // Error message format: "Failed to delete user: Failed to delete borrowing requests: ... violates foreign key constraint ... on table \"request_kit_components\""
            if (errorMessageLower.includes('foreign key constraint') ||
              errorMessageLower.includes('violates foreign key') ||
              errorMessageLower.includes('still referenced') ||
              errorMessageLower.includes('still referenced from table')) {

              // Check if it's related to borrowing requests and request_kit_components
              if (errorMessageLower.includes('borrowing_requests') ||
                errorMessageLower.includes('request_kit_components') ||
                errorMessageLower.includes('borrowing request') ||
                errorMessageLower.includes('failed to delete borrowing')) {
                notification.error({
                  message: 'Cannot Delete Lecturer',
                  description: `Cannot delete lecturer "${record.name}" because this lecturer has borrowing requests that contain kit components. Please resolve or delete all borrowing requests and their associated kit components first before deleting this lecturer.`,
                  placement: 'topRight',
                  duration: 8,
                });
                return; // Exit early to prevent showing generic error
              }
              // Check if it's related to class relationship
              else if (errorMessageLower.includes('class') ||
                errorMessageLower.includes('classes')) {
                notification.error({
                  message: 'Cannot Delete Lecturer',
                  description: `Cannot delete lecturer "${record.name}" because this lecturer is assigned to one or more classes. Please remove the lecturer from all classes first before deleting.`,
                  placement: 'topRight',
                  duration: 6,
                });
                return; // Exit early to prevent showing generic error
              }
              // Generic foreign key constraint error
              else {
                notification.error({
                  message: 'Cannot Delete Lecturer',
                  description: `Cannot delete lecturer "${record.name}" because this lecturer has relationships with other data in the system. Please remove all related records (classes, borrowing requests, etc.) first before deleting.`,
                  placement: 'topRight',
                  duration: 8,
                });
                return; // Exit early to prevent showing generic error
              }
            }
            // Check for other relationship errors (check this before generic constraint check)
            else if (errorMessageLower.includes('borrowing_requests') ||
              errorMessageLower.includes('request_kit_components') ||
              errorMessageLower.includes('failed to delete borrowing')) {
              notification.error({
                message: 'Cannot Delete Lecturer',
                description: `Cannot delete lecturer "${record.name}" because this lecturer has borrowing requests that contain kit components. Please resolve or delete all borrowing requests and their associated kit components first before deleting this lecturer.`,
                placement: 'topRight',
                duration: 8,
              });
              return; // Exit early to prevent showing generic error
            }
            // Check for other relationship errors
            else if (errorMessageLower.includes('relationship') ||
              errorMessageLower.includes('constraint') ||
              errorMessageLower.includes('cannot delete') ||
              errorMessageLower.includes('has relationship') ||
              errorMessageLower.includes('referenced') ||
              errorMessageLower.includes('borrowing') ||
              errorMessageLower.includes('request')) {
              notification.error({
                message: 'Cannot Delete Lecturer',
                description: `Cannot delete lecturer "${record.name}" because this lecturer is assigned to one or more classes or has borrowing requests. Please remove the lecturer from all classes and resolve all borrowing requests first before deleting.`,
                placement: 'topRight',
                duration: 6,
              });
              return; // Exit early to prevent showing generic error
            } else {
              // Show generic error only if no specific error was detected
              message.error('Failed to delete lecturer: ' + errorMessage);
            }
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (error) {
      console.error('Error fetching class assignments:', error);
      // Still show confirmation dialog even if fetch fails
      Modal.confirm({
        title: 'Are you sure you want to delete this lecturer?',
        content: `This will permanently delete ${record.name} from the system.`,
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk: async () => {
          try {
            setLoading(true);
            await userAPI.deleteUser(record.id);

            // Refresh all data including ClassAssignments to update classCode
            await loadData();

            message.success('Lecturer deleted successfully');
          } catch (error) {
            console.error('Error deleting lecturer:', error);
            message.error('Failed to delete lecturer: ' + error.message);
          } finally {
            setLoading(false);
          }
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLecturerSubmit = async () => {
    try {
      const values = await lecturerForm.validateFields();

      // Normalize classCode
      const classCodeToUse = values.classCode ? values.classCode.trim() : null;

      if (lecturerModal.data.id) {
        // Edit existing lecturer - check for duplicates before updating
        const currentLecturer = lecturerModal.data;

        // Check for duplicate email (excluding current lecturer)
        if (values.email && values.email !== currentLecturer.email) {
          const emailExists = lecturers.some(l =>
            l.id !== currentLecturer.id && l.email?.toLowerCase() === values.email?.toLowerCase()
          );
          if (emailExists) {
            lecturerForm.setFields([{ name: 'email', errors: ['Email already exists'] }]);
            throw new Error('Email already exists');
          }
        }

        // Check for duplicate phoneNumber (excluding current lecturer)
        if (values.phoneNumber && values.phoneNumber !== currentLecturer.phoneNumber) {
          const phoneExists = lecturers.some(l =>
            l.id !== currentLecturer.id && l.phoneNumber === values.phoneNumber
          );
          if (phoneExists) {
            lecturerForm.setFields([{ name: 'phoneNumber', errors: ['Phone number already exists'] }]);
            throw new Error('Phone number already exists');
          }
        }

        // Update lecturer via API - backend will handle class creation/assignment
        try {
          await userAPI.updateLecturer(lecturerModal.data.id, {
            name: values.name,
            email: values.email,
            phoneNumber: values.phoneNumber,
            lecturerCode: values.lecturerCode,
            classCode: classCodeToUse
          });

          // Refresh lecturers list
          await loadData();
          message.success('Lecturer updated successfully');
        } catch (apiError) {
          console.error('API error:', apiError);
          const errorMessage = apiError.message || 'Failed to update lecturer';

          // Parse backend error messages
          if (errorMessage.includes('Email already exists')) {
            lecturerForm.setFields([{ name: 'email', errors: ['Email already exists'] }]);
          } else if (errorMessage.includes('Phone number already exists')) {
            lecturerForm.setFields([{ name: 'phoneNumber', errors: ['Phone number already exists'] }]);
          }

          message.error(errorMessage);
          throw apiError;
        }
      } else {
        // Create new lecturer - backend will handle class creation/assignment
        try {
          const response = await userAPI.createSingleLecturer({
            name: values.name,
            email: values.email,
            phoneNumber: values.phoneNumber,
            lecturerCode: values.lecturerCode,
            classCode: classCodeToUse
          });

          console.log('Lecturer created:', response);

          // Refresh lecturers list
          await loadData();
          message.success('Lecturer created successfully');
        } catch (apiError) {
          console.error('API error:', apiError);
          const errorMessage = apiError.message || 'Failed to create lecturer';
          message.error(errorMessage);
          throw apiError;
        }
      }

      setLecturerModal({ visible: false, data: {} });
      lecturerForm.resetFields();
    } catch (error) {
      console.error('Error submitting lecturer:', error);
      // Error message already set above or by API
      if (!error.message || (!error.message.includes('already exists') && !error.message.includes('required'))) {
        message.error('Failed to save lecturer: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleMenuClick = ({ key }) => {
    setSelectedKey(key);
  };

  // Menu items for Academic Affairs Portal
  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: 'student-enrollment', icon: <ReadOutlined />, label: 'Student Enrollment' },
    { key: 'students', icon: <UserOutlined />, label: 'Students' },
    { key: 'lecturers', icon: <TeamOutlined />, label: 'Lecturers' },
    { key: 'iot-subjects', icon: <ToolOutlined />, label: 'IOT Subjects' },
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
                <Popover
                  trigger="click"
                  placement="bottomRight"
                  open={notificationPopoverOpen}
                  onOpenChange={handleNotificationOpenChange}
                  content={renderNotificationContent()}
                >
                  <Badge count={unreadNotificationsCount} size="small" overflowCount={99} style={{ cursor: 'pointer' }}>
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
                {selectedKey === 'dashboard' && <DashboardContent semesters={semesters} students={students} lecturers={lecturers} iotSubjects={iotSubjects} />}
                {selectedKey === 'student-enrollment' && <StudentEnrollment semesters={semesters} setSemesters={setSemesters} semesterModal={semesterModal} setSemesterModal={setSemesterModal} semesterForm={semesterForm} />}
                {selectedKey === 'students' && <StudentManagement students={students} setStudents={setStudents} studentModal={studentModal} setStudentModal={setStudentModal} studentForm={studentForm} handleExportStudents={handleExportStudents} handleImportStudents={handleImportStudents} handleAddStudent={handleAddStudent} handleEditStudent={handleEditStudent} handleDeleteStudent={handleDeleteStudent} showSheetSelectionAndImport={showSheetSelectionAndImport} importFormatModal={importFormatModal} setImportFormatModal={setImportFormatModal} />}
                {selectedKey === 'lecturers' && <LecturerManagement lecturers={lecturers} setLecturers={setLecturers} lecturerModal={lecturerModal} setLecturerModal={setLecturerModal} lecturerForm={lecturerForm} handleExportLecturers={handleExportLecturers} handleImportLecturers={handleImportLecturers} handleAddLecturer={handleAddLecturer} handleEditLecturer={handleEditLecturer} handleDeleteLecturer={handleDeleteLecturer} showSheetSelectionAndImport={showSheetSelectionAndImport} importFormatModal={importFormatModal} setImportFormatModal={setImportFormatModal} />}
                {selectedKey === 'iot-subjects' && <IotSubjectsManagement iotSubjects={iotSubjects} setIotSubjects={setIotSubjects} selectedSemester={selectedSemester} setSelectedSemester={setSelectedSemester} semesters={semesters} handleAddIotSubject={handleAddIotSubject} handleEditIotSubject={handleEditIotSubject} handleViewIotSubjectStudents={handleViewIotSubjectStudents} handleDeleteIotSubject={handleDeleteIotSubject} handleRemoveStudent={handleRemoveStudentFromClass} />}
              </motion.div>
            </AnimatePresence>
          </Spin>
        </Content>
      </Layout>

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
                name="studentCode"
                label="Student Code"
                rules={[{ required: true, message: 'Please enter student code' }]}
              >
                <Input placeholder="Enter student code" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  {
                    pattern: /^0\d{9}$/,
                    message: 'Phone number must start with 0 and have exactly 10 digits'
                  },
                  {
                    validator: (_, value) => {
                      if (!value || /^[0-9]+$/.test(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Phone number must contain only numbers'));
                    }
                  }
                ]}
              >
                <Input
                  placeholder="Enter phone number (e.g., 0123456789)"
                  maxLength={10}
                  onKeyPress={(e) => {
                    // Only allow numeric input
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="classCode"
                label="Class Code"
                rules={[{ required: false, message: 'Please select class code' }]}
              >
                <Select
                  placeholder="Select class code"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={availableClasses}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
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
                name="phoneNumber"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please enter phone number' },
                  {
                    pattern: /^0\d{9}$/,
                    message: 'Phone number must start with 0 and have exactly 10 digits'
                  },
                  {
                    validator: (_, value) => {
                      if (!value || /^[0-9]+$/.test(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Phone number must contain only numbers'));
                    }
                  }
                ]}
              >
                <Input
                  placeholder="Enter phone number (e.g., 0123456789)"
                  maxLength={10}
                  onKeyPress={(e) => {
                    // Only allow numeric input
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lecturerCode"
                label="Lecturer Code"
                rules={[{ required: false, message: 'Please enter lecturer code' }]}
              >
                <Input placeholder="Enter lecturer code" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="classCode"
                label="Class Code"
                rules={[{ required: false, message: 'Please select or enter class code' }]}
                tooltip="Select existing class from dropdown or type to create new class"
              >
                <AutoComplete
                  placeholder="Select existing class or type to create new"
                  options={Array.isArray(availableClasses) ? availableClasses.map(cls => ({
                    value: cls.classCode || cls.value,
                    label: cls.classCode ? `${cls.classCode} - ${cls.semester || ''}`.trim() : (cls.label || cls.value || '')
                  })) : []}
                  filterOption={(inputValue, option) =>
                    (option?.label ?? '').toLowerCase().includes(inputValue.toLowerCase()) ||
                    (option?.value ?? '').toLowerCase().includes(inputValue.toLowerCase())
                  }
                  allowClear
                  onSelect={(value) => {
                    // Keep the classCode value when selecting
                    lecturerForm.setFieldsValue({ classCode: value });
                  }}
                  onBlur={(e) => {
                    // When user types and blurs, keep the typed value
                    const typedValue = e.target.value;
                    if (typedValue) {
                      lecturerForm.setFieldsValue({ classCode: typedValue.trim() });
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
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
                name="classCode"
                label="Class Code"
                rules={[{ required: true, message: 'Please enter class code' }]}
              >
                <Input
                  placeholder="Enter class code"
                  disabled={iotSubjectModal.data.id ? true : false}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="semester"
                label="Semester"
                rules={[{ required: true, message: 'Please enter semester' }]}
              >
                <Input
                  placeholder="Enter semester"
                  disabled={iotSubjectModal.data.id ? true : false}
                />
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
                <Select
                  placeholder="Select lecturer"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={lecturersList.map(lecturer => ({
                    value: lecturer.id,
                    label: lecturer.fullName || lecturer.email,
                    email: lecturer.email
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Option value={true}>Active</Option>
                  <Option value={false}>Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* IOT Subject Students Modal */}
      <Modal
        title={`Students in ${iotSubjectStudentsModal.data.classCode || 'Class'} (${classStudents.length} students)`}
        open={iotSubjectStudentsModal.visible}
        onCancel={() => {
          setIotSubjectStudentsModal({ visible: false, data: {} });
          setClassStudents([]);
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => {
            setIotSubjectStudentsModal({ visible: false, data: {} });
            setClassStudents([]);
          }}>
            Close
          </Button>
        ]}
      >
        <Spin spinning={loadingClassStudents}>
          <Table
            dataSource={classStudents}
            columns={[
              {
                title: 'Student Code',
                dataIndex: 'studentCode',
                key: 'studentCode',
                render: (text) => text || 'N/A'
              },
              {
                title: 'Student Name',
                dataIndex: 'accountName',
                key: 'accountName',
                render: (text) => text || 'N/A'
              },
              {
                title: 'Student Email',
                dataIndex: 'accountEmail',
                key: 'accountEmail',
                render: (text) => text || 'N/A'
              },
              {
                title: 'Enrollment Date',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (date) => {
                  if (!date) return 'N/A';
                  try {
                    return new Date(date).toLocaleString('vi-VN');
                  } catch (e) {
                    return date.toString();
                  }
                }
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                  <Button
                    type="primary"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveStudentFromClass(record, iotSubjectStudentsModal.data?.id)}
                  >
                    Remove
                  </Button>
                ),
              },
            ]}
            rowKey="id"
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`
            }}
            locale={{
              emptyText: 'No students enrolled in this class'
            }}
          />
        </Spin>
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
    </Layout>
  );
}

// Dashboard Component
const DashboardContent = ({ semesters, students, lecturers, iotSubjects }) => {
  // Calculate statistics
  const activeSemesters = semesters.filter(s => s.status === 'Active').length;
  const totalStudents = students.length;
  const totalLecturers = lecturers.length;
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
                    Students: {totalStudents} | Lecturers: {totalLecturers}
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

// Student Enrollment Component
const StudentEnrollment = ({ semesters, setSemesters, semesterModal, setSemesterModal, semesterForm }) => {
  const [enrollmentModal, setEnrollmentModal] = useState({ visible: false, data: {} });
  const [studentModal, setStudentModal] = useState({ visible: false, data: {} });
  const [detailModal, setDetailModal] = useState({ visible: false, data: {} });
  const [enrollmentForm] = Form.useForm();
  const [studentForm] = Form.useForm();
  const [classAssignments, setClassAssignments] = useState([]);
  const [classes, setClasses] = useState([]); // Unassigned classes for lecturer assignment
  const [allClasses, setAllClasses] = useState([]); // All classes for student enrollment
  const [lecturers, setLecturers] = useState([]);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]); // All students (for filtering)
  const [classStudents, setClassStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data when component mounts
  useEffect(() => {
    loadEnrollmentData();
  }, []);

  const loadEnrollmentData = async () => {
    setLoading(true);
    try {
      // Load class assignments - only lecturers for main table
      const allAssignments = await classAssignmentAPI.getAll();
      console.log('ClassAssignments API Response:', allAssignments);

      // Ensure we have an array
      const assignmentsArray = Array.isArray(allAssignments) ? allAssignments : [];
      console.log('Assignments array:', assignmentsArray);

      // Filter only lecturers for main table
      const lecturerAssignments = assignmentsArray.filter(assignment => {
        const roleName = assignment.roleName || assignment.role || '';
        const roleUpper = roleName.toUpperCase();
        const isLecturer = roleUpper === 'LECTURER' ||
          roleUpper === 'TEACHER' ||
          roleUpper === 'LECTURER_ROLE';
        console.log(`Assignment ${assignment.id}: roleName=${roleName}, isLecturer=${isLecturer}`);
        return isLecturer;
      });

      console.log('Filtered lecturer assignments:', lecturerAssignments);
      setClassAssignments(lecturerAssignments);

      // Load unassigned classes (classes without lecturer assignment)
      const unassignedClassesData = await classAssignmentAPI.getUnassignedClasses();
      console.log('Unassigned classes:', unassignedClassesData);

      const unassignedClassOptions = (unassignedClassesData || []).map(cls => ({
        value: cls.id,
        label: `${cls.classCode} - ${cls.semester}`,
        classCode: cls.classCode,
        semester: cls.semester
      }));
      setClasses(unassignedClassOptions);

      // Also load all classes for student enrollment (students can be enrolled in any class)
      const allClassesData = await classesAPI.getAllClasses();
      const allClassOptions = allClassesData.map(cls => ({
        value: cls.id,
        label: `${cls.classCode} - ${cls.semester}`,
        classCode: cls.classCode,
        semester: cls.semester
      }));
      setAllClasses(allClassOptions);

      // Load lecturers
      const lecturersData = await userAPI.getLecturers();
      const lecturerOptions = lecturersData.map(lecturer => ({
        value: lecturer.id,
        label: `${lecturer.fullName} (${lecturer.email})`,
        email: lecturer.email,
        fullName: lecturer.fullName
      }));
      setLecturers(lecturerOptions);

      // Load students
      const studentsData = await userAPI.getStudents();
      const studentOptions = studentsData.map(student => ({
        value: student.id,
        label: `${student.fullName} (${student.email})`,
        email: student.email,
        fullName: student.fullName,
        studentCode: student.studentCode,
        phoneNumber: student.phoneNumber
      }));
      setAllStudents(studentOptions); // Store all students
      setStudents(studentOptions); // Set initial students list
    } catch (error) {
      console.error('Error loading enrollment data:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load enrollment data',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async () => {
    try {
      const values = await studentForm.validateFields();

      // Handle both single and multiple student IDs
      const studentIds = Array.isArray(values.accountId) ? values.accountId : [values.accountId];

      if (studentIds.length === 0) {
        notification.warning({
          message: 'Warning',
          description: 'Please select at least one student',
          placement: 'topRight',
        });
        return;
      }

      // Create assignments for all selected students
      const assignmentPromises = studentIds.map(accountId => {
        const studentData = {
          classId: values.classId,
          accountId: accountId
        };
        return classAssignmentAPI.create(studentData);
      });

      await Promise.all(assignmentPromises);

      // Refresh data
      await loadEnrollmentData();

      notification.success({
        message: 'Success',
        description: `Successfully enrolled ${studentIds.length} student(s)`,
        placement: 'topRight',
      });

      setStudentModal({ visible: false, data: {} });
      studentForm.resetFields();

      // Restore all students list after closing modal
      setStudents(allStudents);

      // Reload unassigned students to update the list
      await loadEnrollmentData();
    } catch (error) {
      console.error('Error enrolling students:', error);
      notification.error({
        message: 'Error',
        description: error.message || 'Failed to enroll students',
        placement: 'topRight',
      });
    }
  };

  const handleAddStudent = async (record) => {
    try {
      // Set the classId from the record
      studentForm.setFieldsValue({
        classId: record.classId
      });

      // Get all assignments to find students already in this class
      const allAssignments = await classAssignmentAPI.getAll();
      const assignmentsArray = Array.isArray(allAssignments) ? allAssignments : [];

      // Get students already enrolled in this class
      const enrolledStudentIds = assignmentsArray
        .filter(assignment => {
          const roleName = assignment.roleName || assignment.role || '';
          const roleUpper = roleName.toUpperCase();
          const isStudent = roleUpper === 'STUDENT' || roleUpper === 'STUDENT_ROLE';
          const assignmentClassId = assignment.classId?.toString();
          const recordClassId = record.classId?.toString();
          const matchesClass = assignmentClassId === recordClassId;
          return isStudent && matchesClass;
        })
        .map(assignment => assignment.accountId?.toString());

      // Filter out students already enrolled in this class from allStudents
      const unenrolledStudentOptions = allStudents.filter(student => {
        const studentId = student.value?.toString();
        return !enrolledStudentIds.includes(studentId);
      });

      // Update student options with only unenrolled students
      setStudents(unenrolledStudentOptions);
      setStudentModal({ visible: true, data: record });
    } catch (error) {
      console.error('Error loading unenrolled students:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load students',
        placement: 'topRight',
      });
    }
  };

  const handleShowDetail = async (record) => {
    try {
      // Get all assignments for this class (including students)
      const allAssignments = await classAssignmentAPI.getAll();
      console.log('ClassAssignments API Response (for students):', allAssignments);

      // Ensure we have an array
      const assignmentsArray = Array.isArray(allAssignments) ? allAssignments : [];

      // Filter students for this class
      const studentsInClass = assignmentsArray.filter(assignment => {
        const roleName = assignment.roleName || assignment.role || '';
        const roleUpper = roleName.toUpperCase();
        const isStudent = roleUpper === 'STUDENT' ||
          roleUpper === 'STUDENT_ROLE';

        // Compare classId (handle both UUID and string formats)
        const assignmentClassId = assignment.classId?.toString();
        const recordClassId = record.classId?.toString();
        const matchesClass = assignmentClassId === recordClassId;

        console.log(`Assignment ${assignment.id}: roleName=${roleName}, classId=${assignmentClassId}, recordClassId=${recordClassId}, isStudent=${isStudent}, matchesClass=${matchesClass}`);

        return isStudent && matchesClass;
      });

      console.log('Filtered students in class:', studentsInClass);
      setClassStudents(studentsInClass);
      setDetailModal({ visible: true, data: record });
    } catch (error) {
      console.error('Error loading class students:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to load class students',
        placement: 'topRight',
      });
    }
  };

  const handleEnrollmentSubmit = async () => {
    try {
      const values = await enrollmentForm.validateFields();

      const enrollmentData = {
        classId: values.classId,
        accountId: values.accountId
      };

      await classAssignmentAPI.create(enrollmentData);

      // Refresh data
      await loadEnrollmentData();

      notification.success({
        message: 'Success',
        description: 'Lecturer assigned successfully',
        placement: 'topRight',
      });

      setEnrollmentModal({ visible: false, data: {} });
      enrollmentForm.resetFields();
    } catch (error) {
      console.error('Error enrolling student:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to assign lecturer',
        placement: 'topRight',
      });
    }
  };

  const handleDeleteEnrollment = async (record) => {
    Modal.confirm({
      title: 'Delete Assignment',
      content: `Are you sure you want to delete this lecturer assignment?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await classAssignmentAPI.delete(record.id);
          await loadEnrollmentData();
          notification.success({
            message: 'Success',
            description: 'Assignment deleted successfully',
            placement: 'topRight',
          });
        } catch (error) {
          console.error('Error deleting assignment:', error);
          notification.error({
            message: 'Error',
            description: 'Failed to delete assignment',
            placement: 'topRight',
          });
        }
      },
    });
  };

  const handleRemoveStudent = async (record, classId) => {
    Modal.confirm({
      title: 'Remove Student',
      content: `Are you sure you want to remove "${record.accountName || record.accountEmail}" from this class?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          await classAssignmentAPI.delete(record.id);

          // Refresh the student list in the modal
          const allAssignments = await classAssignmentAPI.getAll();
          const assignmentsArray = Array.isArray(allAssignments) ? allAssignments : [];

          // Filter students for this class
          const studentsInClass = assignmentsArray.filter(assignment => {
            const roleName = assignment.roleName || assignment.role || '';
            const roleUpper = roleName.toUpperCase();
            const isStudent = roleUpper === 'STUDENT' || roleUpper === 'STUDENT_ROLE';

            const assignmentClassId = assignment.classId?.toString();
            const recordClassId = classId?.toString();
            const matchesClass = assignmentClassId === recordClassId;

            return isStudent && matchesClass;
          });

          setClassStudents(studentsInClass);

          // Also refresh main enrollment data
          await loadEnrollmentData();

          notification.success({
            message: 'Success',
            description: 'Student removed from class successfully',
            placement: 'topRight',
          });
        } catch (error) {
          console.error('Error removing student:', error);
          notification.error({
            message: 'Error',
            description: error.message || 'Failed to remove student',
            placement: 'topRight',
          });
        }
      },
    });
  };

  const columns = [
    {
      title: 'Class Code',
      dataIndex: 'classCode',
      key: 'classCode',
      render: (classCode, record) => {
        // Use classCode from response if available, otherwise fallback to classId lookup
        if (classCode) {
          return classCode;
        }
        // Fallback: try to find from allClasses
        if (record.classId) {
          const classInfo = allClasses.find(c => {
            const cValue = c.value?.toString();
            const classIdStr = record.classId?.toString();
            return cValue === classIdStr;
          });
          return classInfo ? classInfo.classCode || classInfo.label : (record.classId || 'N/A');
        }
        return 'N/A';
      }
    },
    {
      title: 'Lecturer Code',
      dataIndex: 'lecturerCode',
      key: 'lecturerCode',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Name',
      dataIndex: 'accountName',
      key: 'accountName',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Email',
      dataIndex: 'accountEmail',
      key: 'accountEmail',
      render: (text) => text || 'N/A'
    },
    {
      title: 'Enrollment',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        if (!date) return 'N/A';
        try {
          return new Date(date).toLocaleString('vi-VN');
        } catch (e) {
          return date.toString();
        }
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="default" size="small" icon={<EyeOutlined />} onClick={() => handleShowDetail(record)}>
            View Students
          </Button>
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleAddStudent(record)}>
            Add Student
          </Button>
          <Button type="primary" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteEnrollment(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Class Assignment Section */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
        <Card
          title="Class Assignment"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEnrollmentModal({ visible: true, data: {} })}>
              Assign Lecturer
            </Button>
          }
          style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          <Spin spinning={loading}>
            <Table
              dataSource={classAssignments}
              columns={columns}
              rowKey="id"
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
              }}
            />
          </Spin>
        </Card>
      </motion.div>

      {/* Assignment Modal */}
      <Modal
        title="Assign Lecturer to IoT Subject"
        open={enrollmentModal.visible}
        onOk={handleEnrollmentSubmit}
        onCancel={() => {
          setEnrollmentModal({ visible: false, data: {} });
          enrollmentForm.resetFields();
        }}
        width={600}
        okText="Assign"
        cancelText="Cancel"
      >
        <Form form={enrollmentForm} layout="vertical">
          <Form.Item
            name="classId"
            label="IoT Subject (Unassigned Only)"
            rules={[{ required: true, message: 'Please select a class' }]}
            extra="Only classes without assigned lecturers are shown"
          >
            <Select
              showSearch
              placeholder="Search and select IoT subject"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={classes}
              notFoundContent={classes.length === 0 ? "No unassigned classes available" : null}
            />
          </Form.Item>
          <Form.Item
            name="accountId"
            label="Lecturer"
            rules={[{ required: true, message: 'Please select a lecturer' }]}
          >
            <Select
              showSearch
              placeholder="Search and select lecturer"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={lecturers}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Student Modal */}
      <Modal
        title="Enroll Students to IoT Subject"
        open={studentModal.visible}
        onOk={handleStudentSubmit}
        onCancel={() => {
          setStudentModal({ visible: false, data: {} });
          studentForm.resetFields();
          // Restore all students list after closing modal
          setStudents(allStudents);
        }}
        width={600}
        okText="Enroll"
        cancelText="Cancel"
      >
        <Form form={studentForm} layout="vertical">
          <Form.Item
            name="classId"
            label="IoT Subject"
            rules={[{ required: true, message: 'Please select a class' }]}
          >
            <Select
              showSearch
              placeholder="Search and select IoT subject"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={allClasses}
              disabled={studentModal.data?.id && !studentModal.data?.classId ? false : true}
            />
          </Form.Item>
          <Form.Item
            name="accountId"
            label="Students (Not Enrolled)"
            rules={[{ required: true, message: 'Please select at least one student' }]}
            help="Only students not enrolled in this class are shown"
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Search and select students (multiple selection allowed)"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={students}
              maxTagCount="responsive"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Students in ${detailModal.data.classId ? classes.find(c => c.value === detailModal.data.classId)?.label : 'Class'} (${classStudents.length} students)`}
        open={detailModal.visible}
        onCancel={() => {
          setDetailModal({ visible: false, data: {} });
          setClassStudents([]);
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModal({ visible: false, data: {} });
            setClassStudents([]);
          }}>
            Close
          </Button>
        ]}
      >
        <Table
          dataSource={classStudents}
          columns={[
            {
              title: 'Student Code',
              dataIndex: 'studentCode',
              key: 'studentCode',
              render: (text) => text || 'N/A'
            },
            {
              title: 'Student Name',
              dataIndex: 'accountName',
              key: 'accountName',
              render: (text) => text || 'N/A'
            },
            {
              title: 'Student Email',
              dataIndex: 'accountEmail',
              key: 'accountEmail',
              render: (text) => text || 'N/A'
            },
            {
              title: 'Enrollment Date',
              dataIndex: 'createdAt',
              key: 'createdAt',
              render: (date) => {
                if (!date) return 'N/A';
                try {
                  return new Date(date).toLocaleString('vi-VN');
                } catch (e) {
                  return date.toString();
                }
              }
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemoveStudent(record, detailModal.data?.classId)}
                >
                  Remove
                </Button>
              ),
            },
          ]}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`
          }}
          locale={{
            emptyText: 'No students enrolled in this class'
          }}
        />
      </Modal>
    </div>
  );
};



// Student Management Component
const StudentManagement = ({ students, setStudents, studentModal, setStudentModal, studentForm, handleExportStudents, handleImportStudents, handleAddStudent, handleEditStudent, handleDeleteStudent, showSheetSelectionAndImport, importFormatModal, setImportFormatModal }) => {
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('none'); // 'none', 'asc', 'desc'

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = students;

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchLower) ||
        student.email?.toLowerCase().includes(searchLower) ||
        student.studentCode?.toLowerCase().includes(searchLower) ||
        student.phoneNumber?.toLowerCase().includes(searchLower) ||
        student.studentClass?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sort
    if (sortOrder === 'asc') {
      filtered = [...filtered].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortOrder === 'desc') {
      filtered = [...filtered].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameB.localeCompare(nameA);
      });
    }

    return filtered;
  }, [students, searchText, sortOrder]);

  return (
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
                <Button
                  icon={<ImportOutlined />}
                  onClick={() => setImportFormatModal({ visible: true, type: 'students' })}
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
          <div style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Input.Search
                  placeholder="Search by name, email, code, phone, or class..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              <Col span={12}>
                <Select
                  placeholder="Sort by Name"
                  value={sortOrder}
                  onChange={setSortOrder}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="none">No Sort</Option>
                  <Option value="asc">
                    <Space>
                      <SortAscendingOutlined />
                      A-Z
                    </Space>
                  </Option>
                  <Option value="desc">
                    <Space>
                      <SortAscendingOutlined style={{ transform: 'rotate(180deg)' }} />
                      Z-A
                    </Space>
                  </Option>
                </Select>
              </Col>
            </Row>
          </div>
          <Table
            dataSource={filteredAndSortedStudents}
            columns={[
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Email', dataIndex: 'email', key: 'email' },
              { title: 'Student Code', dataIndex: 'studentCode', key: 'studentCode' },
              { title: 'Class Code', dataIndex: 'studentClass', key: 'studentClass', render: (text) => text || 'N/A' },
              { title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber' },
              { title: 'Enrollment Date', dataIndex: 'createdAt', key: 'createdAt' },
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
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} students`
            }}
          />
        </Card>
      </motion.div>

      {/* Import Format Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImportOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
            <span>Student Import Format Guide</span>
          </div>
        }
        open={importFormatModal.visible && importFormatModal.type === 'students'}
        onCancel={() => setImportFormatModal({ visible: false, type: null })}
        footer={[
          <Button key="cancel" onClick={() => setImportFormatModal({ visible: false, type: null })}>
            Cancel
          </Button>,
          <Button
            key="proceed"
            type="primary"
            icon={<ImportOutlined />}
            onClick={() => {
              setImportFormatModal({ visible: false, type: null });
              // Trigger file input
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.xlsx,.xls';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  showSheetSelectionAndImport(file, 'students', {});
                }
              };
              input.click();
            }}
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none',
              fontWeight: 'bold'
            }}
          >
            I Understand, Proceed to Import
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <div style={{ padding: '10px 0' }}>
          <Alert
            message="File Format Requirements"
            description="Please ensure your Excel file follows the format below. The first row (header) will be automatically skipped."
            type="info"
            showIcon
            style={{ marginBottom: '20px' }}
          />

          <Title level={4}>Excel File Structure</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            File must be in <strong>.xlsx</strong> or <strong>.xls</strong> format
          </Text>

          <Table
            dataSource={[
              { column: 'A', field: 'studentCode', required: 'Yes', description: 'Mã số sinh viên', example: 'SV001, 2021001' },
              { column: 'B', field: 'StudentName', required: 'Yes', description: 'Họ và tên đầy đủ', example: 'Nguyễn Văn A' },
              { column: 'C', field: 'email', required: 'Yes', description: 'Email của sinh viên (phải unique)', example: 'student@example.com' },
              { column: 'D', field: 'phone', required: 'No', description: 'Số điện thoại', example: '0123456789' },
              { column: 'E', field: 'StudentClass', required: 'No', description: 'Mã lớp học (classCode)', example: 'IOT2024, CS101' },
            ]}
            columns={[
              { title: 'Column', dataIndex: 'column', key: 'column', width: 80, align: 'center' },
              { title: 'Field Name', dataIndex: 'field', key: 'field', width: 150 },
              { title: 'Required', dataIndex: 'required', key: 'required', width: 80, align: 'center', render: (text) => text === 'Yes' ? <Tag color="red">Required</Tag> : <Tag>Optional</Tag> },
              { title: 'Description', dataIndex: 'description', key: 'description' },
              { title: 'Example', dataIndex: 'example', key: 'example', render: (text) => <Text code>{text}</Text> },
            ]}
            pagination={false}
            size="small"
            style={{ marginBottom: '20px' }}
          />

          <Title level={5}>Example Data</Title>
          <div style={{
            background: '#f5f5f5',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            <div style={{ marginBottom: '8px' }}><strong>Row 1 (Header - will be skipped):</strong></div>
            <div style={{ marginBottom: '4px' }}>studentCode | StudentName | email | phone | StudentClass</div>
            <div style={{ marginBottom: '16px', marginTop: '12px' }}><strong>Row 2 (Data):</strong></div>
            <div style={{ marginBottom: '4px' }}>SV001 | Nguyễn Văn A | nva@example.com | 0123456789 | IOT2024</div>
            <div style={{ marginBottom: '4px' }}>SV002 | Trần Thị B | ttb@example.com | 0987654321 | IOT2024</div>
            <div>SV003 | Lê Văn C | lvc@example.com | | CS101</div>
          </div>

          <Alert
            message="Important Notes"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                <li>Password will be set to <strong>"1"</strong> by default for all imported students</li>
                <li>Each student will automatically receive a wallet with <strong>0 VND</strong> balance</li>
                <li>If <strong>StudentClass</strong> doesn't exist, it will be automatically created</li>
                <li>Email must be unique - duplicate emails will cause import errors</li>
                <li>Rows with missing required fields will be skipped</li>
              </ul>
            }
            type="warning"
            showIcon
            style={{ marginBottom: '20px' }}
          />

          <Alert
            message="Common Errors"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                <li><strong>"Email already exists"</strong>: Email is already registered in the system</li>
                <li><strong>"Full Name is required"</strong>: Missing student name in Column B</li>
                <li><strong>"Email is required"</strong>: Missing email in Column C</li>
                <li><strong>"Invalid file format"</strong>: File is not .xlsx or .xls format</li>
              </ul>
            }
            type="error"
            showIcon
          />
        </div>
      </Modal>

      {/* Lecturer Import Format Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImportOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
            <span>Lecturer Import Format Guide</span>
          </div>
        }
        open={importFormatModal.visible && importFormatModal.type === 'lecturers'}
        onCancel={() => setImportFormatModal({ visible: false, type: null })}
        footer={[
          <Button key="cancel" onClick={() => setImportFormatModal({ visible: false, type: null })}>
            Cancel
          </Button>,
          <Button
            key="proceed"
            type="primary"
            icon={<ImportOutlined />}
            onClick={() => {
              setImportFormatModal({ visible: false, type: null });
              // Trigger file input
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.xlsx,.xls';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  showSheetSelectionAndImport(file, 'lecturers', {});
                }
              };
              input.click();
            }}
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none',
              fontWeight: 'bold'
            }}
          >
            I Understand, Proceed to Import
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <div style={{ padding: '10px 0' }}>
          <Alert
            message="File Format Requirements"
            description="Please ensure your Excel file follows the format below. The first row (header) will be automatically skipped."
            type="info"
            showIcon
            style={{ marginBottom: '20px' }}
          />

          <Title level={4}>Excel File Structure</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            File must be in <strong>.xlsx</strong> or <strong>.xls</strong> format
          </Text>

          <Table
            dataSource={[
              { column: 'A', field: 'lecturer_code', required: 'Yes', description: 'Mã giảng viên (phải unique)', example: 'GV001, LEC001' },
              { column: 'B', field: 'email', required: 'Yes', description: 'Email của giảng viên (phải unique)', example: 'lecturer@example.com' },
              { column: 'C', field: 'fullname', required: 'Yes', description: 'Họ và tên đầy đủ', example: 'Nguyễn Văn A' },
              { column: 'D', field: 'phone', required: 'No', description: 'Số điện thoại (bắt đầu bằng 0, 10 chữ số)', example: '0123456789' },
              { column: 'E', field: 'class_code', required: 'No', description: 'Mã lớp học', example: 'IOT2024, CS101' },
              { column: 'F', field: 'Semester', required: 'No', description: 'Học kỳ', example: 'Fall 2024, Spring 2024' },
            ]}
            columns={[
              { title: 'Column', dataIndex: 'column', key: 'column', width: 80, align: 'center' },
              { title: 'Field Name', dataIndex: 'field', key: 'field', width: 150 },
              { title: 'Required', dataIndex: 'required', key: 'required', width: 80, align: 'center', render: (text) => text === 'Yes' ? <Tag color="red">Required</Tag> : <Tag>Optional</Tag> },
              { title: 'Description', dataIndex: 'description', key: 'description' },
              { title: 'Example', dataIndex: 'example', key: 'example', render: (text) => <Text code>{text}</Text> },
            ]}
            pagination={false}
            size="small"
            style={{ marginBottom: '20px' }}
          />

          <Title level={5}>Example Data</Title>
          <div style={{
            background: '#f5f5f5',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            <div style={{ marginBottom: '8px' }}><strong>Row 1 (Header - will be skipped):</strong></div>
            <div style={{ marginBottom: '4px' }}>lecturer_code | email | fullname | phone | class_code | Semester</div>
            <div style={{ marginBottom: '16px', marginTop: '12px' }}><strong>Row 2 (Data):</strong></div>
            <div style={{ marginBottom: '4px' }}>GV001 | lecturer1@example.com | Nguyễn Văn A | 0123456789 | IOT2024 | Fall 2024</div>
            <div style={{ marginBottom: '4px' }}>GV002 | lecturer2@example.com | Trần Thị B | 0987654321 | CS101 | Spring 2024</div>
            <div>GV003 | lecturer3@example.com | Lê Văn C | | IOT2024 | Fall 2024</div>
          </div>

          <Alert
            message="Important Notes"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                <li>Password will be set to <strong>"1"</strong> by default for all imported lecturers</li>
                <li>Each lecturer will automatically receive a wallet with <strong>0 VND</strong> balance</li>
                <li><strong>Lecturer Code</strong> must be unique - duplicate codes will cause import errors</li>
                <li>If <strong>class_code</strong> doesn't exist, it will be automatically created with the lecturer assigned as teacher</li>
                <li>If <strong>class_code</strong> already exists, the lecturer will be assigned to that class</li>
                <li>Email must be unique - duplicate emails will cause import errors</li>
                <li>Phone number must start with <strong>0</strong> and have exactly <strong>10 digits</strong> (if provided)</li>
                <li>Rows with missing required fields will be skipped</li>
              </ul>
            }
            type="warning"
            showIcon
            style={{ marginBottom: '20px' }}
          />

          <Alert
            message="Common Errors"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                <li><strong>"Lecturer Code already exists"</strong>: Lecturer code is already registered in the system</li>
                <li><strong>"Email already exists"</strong>: Email is already registered in the system</li>
                <li><strong>"Full Name is required"</strong>: Missing lecturer name in Column C</li>
                <li><strong>"Email is required"</strong>: Missing email in Column B</li>
                <li><strong>"Phone number must start with 0"</strong>: Phone number format is invalid</li>
                <li><strong>"Phone number must have exactly 10 digits"</strong>: Phone number length is incorrect</li>
                <li><strong>"Invalid file format"</strong>: File is not .xlsx or .xls format</li>
              </ul>
            }
            type="error"
            showIcon
          />
        </div>
      </Modal>
    </div>
  );
};

// Lecturer Management Component
const LecturerManagement = ({ lecturers, setLecturers, lecturerModal, setLecturerModal, lecturerForm, handleExportLecturers, handleImportLecturers, handleAddLecturer, handleEditLecturer, handleDeleteLecturer, showSheetSelectionAndImport, importFormatModal, setImportFormatModal }) => {
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('none'); // 'none', 'asc', 'desc'

  // Filter and sort lecturers
  const filteredAndSortedLecturers = useMemo(() => {
    let filtered = lecturers;

    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(lecturer =>
        lecturer.name?.toLowerCase().includes(searchLower) ||
        lecturer.email?.toLowerCase().includes(searchLower) ||
        lecturer.lecturerCode?.toLowerCase().includes(searchLower) ||
        lecturer.phoneNumber?.toLowerCase().includes(searchLower) ||
        lecturer.lecturerClass?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sort
    if (sortOrder === 'asc') {
      filtered = [...filtered].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
    } else if (sortOrder === 'desc') {
      filtered = [...filtered].sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameB.localeCompare(nameA);
      });
    }

    return filtered;
  }, [lecturers, searchText, sortOrder]);

  return (
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
                <Button
                  icon={<ImportOutlined />}
                  onClick={() => setImportFormatModal({ visible: true, type: 'lecturers' })}
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
          <div style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Input.Search
                  placeholder="Search by name, email, lecturer code, or phone..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              <Col span={12}>
                <Select
                  placeholder="Sort by Name"
                  value={sortOrder}
                  onChange={setSortOrder}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="none">No Sort</Option>
                  <Option value="asc">
                    <Space>
                      <SortAscendingOutlined />
                      A-Z
                    </Space>
                  </Option>
                  <Option value="desc">
                    <Space>
                      <SortAscendingOutlined style={{ transform: 'rotate(180deg)' }} />
                      Z-A
                    </Space>
                  </Option>
                </Select>
              </Col>
            </Row>
          </div>
          <Table
            dataSource={filteredAndSortedLecturers}
            columns={[
              { title: 'Lecturer Code', dataIndex: 'lecturerCode', key: 'lecturerCode', render: (text) => text || 'N/A' },
              { title: 'Name', dataIndex: 'name', key: 'name' },
              { title: 'Email', dataIndex: 'email', key: 'email' },
              { title: 'Phone Number', dataIndex: 'phoneNumber', key: 'phoneNumber' },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>
              },
              { title: 'Hire Date', dataIndex: 'createdAt', key: 'createdAt' },
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
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} lecturers`
            }}
          />
        </Card>
      </motion.div>

      {/* Lecturer Import Format Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImportOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
            <span>Lecturer Import Format Guide</span>
          </div>
        }
        open={importFormatModal.visible && importFormatModal.type === 'lecturers'}
        onCancel={() => setImportFormatModal({ visible: false, type: null })}
        footer={[
          <Button key="cancel" onClick={() => setImportFormatModal({ visible: false, type: null })}>
            Cancel
          </Button>,
          <Button
            key="proceed"
            type="primary"
            icon={<ImportOutlined />}
            onClick={() => {
              setImportFormatModal({ visible: false, type: null });
              // Trigger file input
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.xlsx,.xls';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  showSheetSelectionAndImport(file, 'lecturers', {});
                }
              };
              input.click();
            }}
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none',
              fontWeight: 'bold'
            }}
          >
            I Understand, Proceed to Import
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        <div style={{ padding: '10px 0' }}>
          <Alert
            message="File Format Requirements"
            description="Please ensure your Excel file follows the format below. The first row (header) will be automatically skipped."
            type="info"
            showIcon
            style={{ marginBottom: '20px' }}
          />

          <Title level={4}>Excel File Structure</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
            File must be in <strong>.xlsx</strong> or <strong>.xls</strong> format
          </Text>

          <Table
            dataSource={[
              { column: 'A', field: 'lecturer_code', required: 'Yes', description: 'Mã giảng viên (phải unique)', example: 'GV001, LEC001' },
              { column: 'B', field: 'email', required: 'Yes', description: 'Email của giảng viên (phải unique)', example: 'lecturer@example.com' },
              { column: 'C', field: 'fullname', required: 'Yes', description: 'Họ và tên đầy đủ', example: 'Nguyễn Văn A' },
              { column: 'D', field: 'phone', required: 'No', description: 'Số điện thoại (bắt đầu bằng 0, 10 chữ số)', example: '0123456789' },
              { column: 'E', field: 'class_code', required: 'No', description: 'Mã lớp học', example: 'IOT2024, CS101' },
              { column: 'F', field: 'Semester', required: 'No', description: 'Học kỳ', example: 'Fall 2024, Spring 2024' },
            ]}
            columns={[
              { title: 'Column', dataIndex: 'column', key: 'column', width: 80, align: 'center' },
              { title: 'Field Name', dataIndex: 'field', key: 'field', width: 150 },
              { title: 'Required', dataIndex: 'required', key: 'required', width: 80, align: 'center', render: (text) => text === 'Yes' ? <Tag color="red">Required</Tag> : <Tag>Optional</Tag> },
              { title: 'Description', dataIndex: 'description', key: 'description' },
              { title: 'Example', dataIndex: 'example', key: 'example', render: (text) => <Text code>{text}</Text> },
            ]}
            pagination={false}
            size="small"
            style={{ marginBottom: '20px' }}
          />

          <Title level={5}>Example Data</Title>
          <div style={{
            background: '#f5f5f5',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            <div style={{ marginBottom: '8px' }}><strong>Row 1 (Header - will be skipped):</strong></div>
            <div style={{ marginBottom: '4px' }}>lecturer_code | email | fullname | phone | class_code | Semester</div>
            <div style={{ marginBottom: '16px', marginTop: '12px' }}><strong>Row 2 (Data):</strong></div>
            <div style={{ marginBottom: '4px' }}>GV001 | lecturer1@example.com | Nguyễn Văn A | 0123456789 | IOT2024 | Fall 2024</div>
            <div style={{ marginBottom: '4px' }}>GV002 | lecturer2@example.com | Trần Thị B | 0987654321 | CS101 | Spring 2024</div>
            <div>GV003 | lecturer3@example.com | Lê Văn C | | IOT2024 | Fall 2024</div>
          </div>

          <Alert
            message="Important Notes"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                <li>Password will be set to <strong>"1"</strong> by default for all imported lecturers</li>
                <li>Each lecturer will automatically receive a wallet with <strong>0 VND</strong> balance</li>
                <li><strong>Lecturer Code</strong> must be unique - duplicate codes will cause import errors</li>
                <li>If <strong>class_code</strong> doesn't exist, it will be automatically created with the lecturer assigned as teacher</li>
                <li>If <strong>class_code</strong> already exists, the lecturer will be assigned to that class</li>
                <li>Email must be unique - duplicate emails will cause import errors</li>
                <li>Phone number must start with <strong>0</strong> and have exactly <strong>10 digits</strong> (if provided)</li>
                <li>Rows with missing required fields will be skipped</li>
              </ul>
            }
            type="warning"
            showIcon
            style={{ marginBottom: '20px' }}
          />

          <Alert
            message="Common Errors"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                <li><strong>"Lecturer Code already exists"</strong>: Lecturer code is already registered in the system</li>
                <li><strong>"Email already exists"</strong>: Email is already registered in the system</li>
                <li><strong>"Full Name is required"</strong>: Missing lecturer name in Column C</li>
                <li><strong>"Email is required"</strong>: Missing email in Column B</li>
                <li><strong>"Phone number must start with 0"</strong>: Phone number format is invalid</li>
                <li><strong>"Phone number must have exactly 10 digits"</strong>: Phone number length is incorrect</li>
                <li><strong>"Invalid file format"</strong>: File is not .xlsx or .xls format</li>
              </ul>
            }
            type="error"
            showIcon
          />
        </div>
      </Modal>
    </div>
  );
};

// IOT Subjects Management Component
const IotSubjectsManagement = ({ iotSubjects, setIotSubjects, selectedSemester, setSelectedSemester, semesters, handleAddIotSubject, handleEditIotSubject, handleViewIotSubjectStudents, handleDeleteIotSubject, handleRemoveStudent }) => {
  // Filter iotSubjects based on selected semester
  const filteredIotSubjects = selectedSemester
    ? iotSubjects.filter(subject => subject.semester === selectedSemester)
    : iotSubjects;

  return (
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
                allowClear
              >
                <Option value={null}>All Semesters</Option>
                {semesters.map(semester => (
                  <Option key={semester.id || semester.value} value={semester.value || semester.name}>
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
            dataSource={filteredIotSubjects}
            columns={[
              { title: 'Class Code', dataIndex: 'classCode', key: 'classCode' },
              { title: 'Semester', dataIndex: 'semester', key: 'semester' },
              { title: 'Lecturer', dataIndex: 'teacherName', key: 'teacherName' },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag color={status ? 'green' : 'red'}>
                    {status ? 'Active' : 'Inactive'}
                  </Tag>
                )
              },
              { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
              { title: 'Updated At', dataIndex: 'updatedAt', key: 'updatedAt' },
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
};

export default AcademicAffairsPortal; 
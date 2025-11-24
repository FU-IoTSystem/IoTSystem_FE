const API_BASE_URL = 'https://iot-system-kit.azurewebsites.net';
// const API_BASE_URL = 'http://localhost:8080';

// Helper function to get JWT token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    // Try to parse error response as JSON first
    try {
      const errorJson = await response.json();
      // Extract error message from common response structures
      const errorMessage = errorJson.message || errorJson.error || errorJson.details || JSON.stringify(errorJson);
      throw new Error(errorMessage);
    } catch (jsonError) {
      // If JSON parsing fails, fall back to text
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }
  }
  // Try to parse JSON based on content-type; fallback to text if not JSON
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (e) {
      // Fallback: read as text and try to parse, otherwise return raw text
      const text = await response.text().catch(() => '');
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    }
  } else {
    const text = await response.text().catch(() => '');
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }
};

const extractArrayFromPayload = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const candidateKeys = ['data', 'content', 'records', 'items', 'result', 'list'];

    for (const key of candidateKeys) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        const extracted = extractArrayFromPayload(payload[key]);
        if (Array.isArray(extracted)) {
          return extracted;
        }
      }
    }
  }

  return Array.isArray(payload) ? payload : [];
};


// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  // Merge headers properly
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers: mergedHeaders
  };

  console.log('Making API request:', {
    method: config.method || 'GET',
    url: url,
    headers: config.headers,
    body: config.body
  });

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};




// Authentication API
export const authAPI = {
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Login failed');
      }

      const token = await response.text();
      localStorage.setItem('authToken', token);
      return token;
    } catch (error) {
      console.error('Login failed:', error);
      // Provide more helpful error messages
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error(`Cannot connect to server at ${API_BASE_URL}. Please ensure the backend server is running on port 8080.`);
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  getProfile: async () => {
    return apiRequest('/api/me/profile');
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/register/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Update user failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    return apiRequest('/api/me/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  changePassword: async (oldPassword, newPassword) => {
    return apiRequest('/api/me/change-password', {
      method: 'POST',
      body: JSON.stringify({
        oldPassword,
        newPassword
      }),
    });
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  }
};

// User Management API
export const userAPI = {
  getUsers: async () => {
    return apiRequest('/api/admin/users');
  },

  createUser: async (userData) => {
    return apiRequest('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id, userData) => {
    return apiRequest(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id) => {
    return apiRequest(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Kit Management API
export const kitAPI = {
  // getKits: async () => {
  //   return apiRequest('/api/kits');
  // },
  // getAvailableKits: async () => {
  //   return apiRequest('/api/kits/available');
  // },
  // createKit: async (kitData) => {
  //   return apiRequest('/api/kits', {
  //     method: 'POST',
  //     body: JSON.stringify(kitData),
  //   });
  // },
  // updateKitStatus: async (id, status) => {
  //   return apiRequest(`/api/kits/${id}/status`, {
  //     method: 'POST',
  //     body: JSON.stringify({ status }),
  //   });
  // },
  // chooseKit: async (kitName) => {
  //   return apiRequest('/api/kits/choose', {
  //     method: 'POST',
  //     body: JSON.stringify({ kitName }),
  //   });
  // },
  // importKits: async (kitsData) => {
  //   return apiRequest('/api/kits/import', {
  //     method: 'POST',
  //     body: JSON.stringify({ kits: kitsData }),
  //   });
  // },
  // Use mocks for testing
};

// Group Management API
export const groupAPI = {
  // getGroups: async () => {
  //   return apiRequest('/api/groups');
  // },
  // getStudentGroup: async (email) => {
  //   return apiRequest(`/api/groups/student?email=${encodeURIComponent(email)}`);
  // },
  // getLecturerGroups: async (email) => {
  //   return apiRequest(`/api/groups/lecturer?email=${encodeURIComponent(email)}`);
  // },
  // createGroup: async (groupData) => {
  //   return apiRequest('/api/groups', {
  //     method: 'POST',
  //     body: JSON.stringify(groupData),
  //   });
  // },
  // addMemberToGroup: async (groupName, memberEmail) => {
  //   return apiRequest('/api/groups/add-member', {
  //     method: 'POST',
  //     body: JSON.stringify({ groupName, memberEmail }),
  //   });
  // },
  // moveMember: async (memberEmail, fromGroup, toGroup) => {
  //   return apiRequest('/api/groups/move-member', {
  //     method: 'POST',
  //     body: JSON.stringify({ memberEmail, fromGroup, toGroup }),
  //   });
  // },
  // importGroups: async (formData) => {
  //   return apiRequest('/api/groups/import', {
  //     method: 'POST',
  //     body: formData,
  //     headers: {}, // Let browser set Content-Type for FormData
  //   });
  // },
  // Use mocks for testing
};

// Wallet API
export const walletAPI = {
  // getWallet: async () => {
  //   return apiRequest('/api/wallet');
  // },
  // deposit: async () => {
  //   return apiRequest('/api/wallet/deposit', {
  //     method: 'POST',
  //   });
  // },
  // deduct: async (amount, description) => {
  //   return apiRequest('/api/wallet/deduct', {
  //     method: 'POST',
  //     body: JSON.stringify({ amount, description }),
  //   });
  // },
  // refund: async (amount, description) => {
  //   return apiRequest('/api/wallet/refund', {
  //     method: 'POST',
  //     body: JSON.stringify({ amount, description }),
  //   });
  // },
  // Use mocks for testing
};

// Rental API
export const rentalAPI = {
  // submitRentalRequest: async (rentalData) => {
  //   return apiRequest('/api/rentals/request', {
  //     method: 'POST',
  //     body: JSON.stringify(rentalData),
  //   });
  // },
  // getRentalRequests: async () => {
  //   return apiRequest('/api/admin/rental-requests');
  // },
  // approveRentalRequest: async (id) => {
  //   return apiRequest(`/api/admin/rental-requests/${id}/approve`, {
  //     method: 'POST',
  //   });
  // },
  // rejectRentalRequest: async (id, reason) => {
  //   return apiRequest(`/api/admin/rental-requests/${id}/reject`, {
  //     method: 'POST',
  //     body: JSON.stringify({ reason }),
  //   });
  // },
  // Use mocks for testing
};

// Refund API
export const refundAPI = {
  // submitRefundRequest: async (refundData) => {
  //   return apiRequest('/api/refunds/request', {
  //     method: 'POST',
  //     body: JSON.stringify(refundData),
  //   });
  // },
  // getRefundRequests: async () => {
  //   return apiRequest('/api/admin/refund-requests');
  // },
  // approveRefundRequest: async (id, damageAssessment) => {
  //   return apiRequest(`/api/admin/refund-requests/${id}/approve`, {
  //     method: 'POST',
  //     body: JSON.stringify({ damageAssessment }),
  //   });
  // },
  // rejectRefundRequest: async (id, reason) => {
  //   return apiRequest(`/api/admin/refund-requests/${id}/reject`, {
  //     method: 'POST',
  //     body: JSON.stringify({ reason }),
  //   });
  // },
  // Use mocks for testing
};

// Notification API
export const notificationAPI = {
  // sendNotification: async (notificationData) => {
  //   return apiRequest('/api/notifications/send', {
  //     method: 'POST',
  //     body: JSON.stringify(notificationData),
  //   });
  // },
  // getUserNotifications: async (userEmail) => {
  //   return apiRequest(`/api/notifications/${userEmail}`);
  // },
  // Use mocks for testing
};

// Student Import API
export const studentAPI = {
  // importStudents: async (studentsData) => {
  //   return apiRequest('/api/students/import', {
  //     method: 'POST',
  //     body: JSON.stringify({ students: studentsData }),
  //   });
  // },
  // Use mocks for testing
};

// Academic Affairs API
export const academicAPI = {
  // Semesters
  // getSemesters: async () => {
  //   return apiRequest('/api/academic/semesters');
  // },
  // createSemester: async (semesterData) => {
  //   return apiRequest('/api/academic/semesters', {
  //     method: 'POST',
  //     body: JSON.stringify(semesterData),
  //   });
  // },
  // updateSemester: async (id, semesterData) => {
  //   return apiRequest(`/api/academic/semesters/${id}`, {
  //     method: 'PUT',
  //     body: JSON.stringify(semesterData),
  //   });
  // },
  // deleteSemester: async (id) => {
  //   return apiRequest(`/api/academic/semesters/${id}`, {
  //     method: 'DELETE',
  //   });
  // },
  // Classes
  // getClasses: async (semesterId) => {
  //   if (semesterId) {
  //     return apiRequest(`/api/academic/semesters/${semesterId}/classes`);
  //   } else {
  //     return apiRequest('/api/academic/classes');
  //   }
  // },
  // createClass: async (semesterId, classData) => {
  //   return apiRequest(`/api/academic/semesters/${semesterId}/classes`, {
  //     method: 'POST',
  //     body: JSON.stringify(classData),
  //   });
  // },
  // updateClass: async (id, classData) => {
  //   return apiRequest(`/api/academic/classes/${id}`, {
  //     method: 'PUT',
  //     body: JSON.stringify(classData),
  //   });
  // },
  // deleteClass: async (id) => {
  //   return apiRequest(`/api/academic/classes/${id}`, {
  //     method: 'DELETE',
  //   });
  // },
  // Students
  // getStudents: async () => {
  //   return apiRequest('/api/academic/students');
  // },
  // createStudent: async (studentData) => {
  //   return apiRequest('/api/academic/students', {
  //     method: 'POST',
  //     body: JSON.stringify(studentData),
  //   });
  // },
  // updateStudent: async (id, studentData) => {
  //   return apiRequest(`/api/academic/students/${id}`, {
  //     method: 'PUT',
  //     body: JSON.stringify(studentData),
  //   });
  // },
  // deleteStudent: async (id) => {
  //   return apiRequest(`/api/academic/students/${id}`, {
  //     method: 'DELETE',
  //   });
  // },
  // Lecturers
  // getLecturers: async () => {
  //   return apiRequest('/api/academic/lecturers');
  // },
  // createLecturer: async (lecturerData) => {
  //   return apiRequest('/api/academic/lecturers', {
  //     method: 'POST',
  //     body: JSON.stringify(lecturerData),
  //   });
  // },
  // updateLecturer: async (id, lecturerData) => {
  //   return apiRequest(`/api/academic/lecturers/${id}`, {
  //     method: 'PUT',
  //     body: JSON.stringify(lecturerData),
  //   });
  // },
  // deleteLecturer: async (id) => {
  //   return apiRequest(`/api/academic/lecturers/${id}`, {
  //     method: 'DELETE',
  //   });
  // },
  // Enrollments
  // getEnrollments: async () => {
  //   return apiRequest('/api/academic/enrollments');
  // },
  // createEnrollment: async (enrollmentData) => {
  //   return apiRequest('/api/academic/enrollments', {
  //     method: 'POST',
  //     body: JSON.stringify(enrollmentData),
  //   });
  // },
  // deleteEnrollment: async (id) => {
  //   return apiRequest(`/api/academic/enrollments/${id}`, {
  //     method: 'DELETE',
  //   });
  // },
  // Assignments
  // getAssignments: async () => {
  //   return apiRequest('/api/academic/assignments');
  // },
  // createAssignment: async (assignmentData) => {
  //   return apiRequest('/api/academic/assignments', {
  //     method: 'POST',
  //     body: JSON.stringify(assignmentData),
  //   });
  // },
  // deleteAssignment: async (id) => {
  //   return apiRequest(`/api/academic/assignments/${id}`, {
  //     method: 'DELETE',
  //   });
  // },
  // Logs
  // getLogs: async () => {
  //   return apiRequest('/api/academic/logs');
  // },
  // Use mocks for testing
}; 
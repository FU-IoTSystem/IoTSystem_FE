// const API_BASE_URL = 'https://rental-kit-fvcrenhrbva3e4f2.eastasia-01.azurewebsites.net';
const API_BASE_URL = 'https://iot-system-kit.azurewebsites.net';

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

  getAllAccounts: async (page = 0, size = 10) => {
    const response = await apiRequest(`/api/admin/accounts?page=${page}&size=${size}`);
    // Handle different response formats: direct array, ApiResponse with array in data, or PageResponse
    return extractArrayFromPayload(response);
  },

  createUser: async (userData) => {
    return apiRequest('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  createSingleStudent: async (studentData) => {
    // Map FE data to BE RegisterRequest format
    // Note: username in BE is actually email
    console.log('Creating student with data:', studentData);

    if (!studentData.email) {
      throw new Error('Email is required');
    }

    const requestData = {
      username: studentData.email,  // username is email in RegisterRequest
      password: studentData.password || '1',
      studentCode: studentData.studentCode,
      roles: 'STUDENT',
      phoneNumber: studentData.phoneNumber,
      fullName: studentData.name
    };

    console.log('Request data:', requestData);

    return apiRequest('/api/aas/create-single-student', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  updateStudent: async (id, studentData) => {
    // Map FE data to BE RegisterRequest format for update
    console.log('Updating student with data:', studentData);

    if (!studentData.email) {
      throw new Error('Email is required');
    }

    const requestData = {
      username: studentData.email,  // username is email in RegisterRequest
      password: studentData.password || '1',  // Password may not be changed, but required by API
      studentCode: studentData.studentCode || '',
      roles: 'STUDENT',
      phoneNumber: studentData.phoneNumber || '',
      fullName: studentData.name
    };

    console.log('Update request data:', requestData);

    return apiRequest(`/api/register/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  },

  createSingleLecturer: async (lecturerData) => {
    // Map FE data to BE RegisterRequest format
    // Note: username in BE is actually email
    console.log('Creating lecturer with data:', lecturerData);

    if (!lecturerData.email) {
      throw new Error('Email is required');
    }

    const requestData = {
      username: lecturerData.email,  // username is email in RegisterRequest
      password: lecturerData.password || '1',
      studentCode: lecturerData.studentCode || '',
      roles: 'LECTURER',
      phoneNumber: lecturerData.phoneNumber,
      fullName: lecturerData.name
    };

    console.log('Request data:', requestData);

    return apiRequest('/api/aas/create-single-lecturer', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  updateLecturer: async (id, lecturerData) => {
    // Map FE data to BE RegisterRequest format for update
    console.log('Updating lecturer with data:', lecturerData);

    if (!lecturerData.email) {
      throw new Error('Email is required');
    }

    const requestData = {
      username: lecturerData.email,  // username is email in RegisterRequest
      password: lecturerData.password || '1',  // Password may not be changed, but required by API
      studentCode: lecturerData.studentCode || '',
      roles: 'LECTURER',
      phoneNumber: lecturerData.phoneNumber || '',
      fullName: lecturerData.name
    };

    console.log('Update request data:', requestData);

    return apiRequest(`/api/register/${id}`, {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  },

  updateUser: async (id, userData) => {
    return apiRequest(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  deleteUser: async (id) => {
    return apiRequest(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  },

  getLecturers: async () => {
    try {
      const response = await apiRequest('/api/classes/getListLecturers');
      if (response && Array.isArray(response)) {
        return response.map(lecturer => ({
          value: lecturer.email,
          label: lecturer.fullName || lecturer.email,
          email: lecturer.email,
          fullName: lecturer.fullName,
          id: lecturer.id,
          phone: lecturer.phone,
          createdAt: lecturer.createdAt,
          status: lecturer.isActive ? 'ACTIVE' : 'INACTIVE'
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch lecturers:', error);
      return [];
    }
  },

  getStudents: async () => {
    try {
      const response = await apiRequest('/api/getAllStudent');
      console.log('Students response:', response);

      if (response && response.data && Array.isArray(response.data)) {
        return response.data.map(student => ({
          id: student.id,
          email: student.email,
          fullName: student.fullName || student.email,
          studentCode: student.studentCode,
          phoneNumber: student.phone,
          createdAt: student.createdAt, // Backend trả về createdAt
          status: student.isActive ? 'ACTIVE' : 'INACTIVE'
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch students:', error);
      return [];
    }
  },
};

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Get API base URL from environment or default to localhost
const getWebSocketUrl = () => {
  // SockJS uses HTTP/HTTPS URL, not ws:// or wss://
  // const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
  const apiBaseUrl = 'https://iot-system-kit.azurewebsites.net';
  return `${apiBaseUrl}/ws`;
};

// Get JWT token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(onConnect, onError) {
    if (this.client && this.client.connected) {
      console.log('WebSocket already connected');
      if (onConnect) {
        // If caller expects subscription setup in onConnect,
        // invoke it immediately when we are already connected.
        onConnect();
      }
      return;
    }

    // Use SockJS with @stomp/stompjs
    // When using SockJS, we only need webSocketFactory, not brokerURL
    const token = getAuthToken();
    this.client = new Client({
      webSocketFactory: () => new SockJS(getWebSocketUrl()),
      connectHeaders: token ? {
        Authorization: `Bearer ${token}`
      } : {},
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      reconnectDelay: 5000,
      debug: (str) => {
        console.log('STOMP:', str);
      },
      onConnect: (frame) => {
        console.log('WebSocket connected:', frame);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        if (onConnect) onConnect();
      },
      onStompError: (frame) => {
        console.error('WebSocket STOMP error:', frame);
        this.isConnected = false;
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        this.isConnected = false;
        this.subscriptions.clear();
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.subscriptions.clear();
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.deactivate();
      this.isConnected = false;
    }
  }

  subscribe(destination, callback, id = null) {
    if (!this.client || !this.client.connected) {
      console.warn('WebSocket not connected. Attempting to connect...');
      this.connect(() => {
        this.subscribe(destination, callback, id);
      });
      return null;
    }

    const subscriptionId = id || `sub-${Date.now()}-${Math.random()}`;
    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        callback(message.body);
      }
    });

    this.subscriptions.set(subscriptionId, subscription);
    return subscriptionId;
  }

  unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
    }
  }

  send(destination, body) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.client.publish({
      destination: destination,
      body: JSON.stringify(body),
    });
  }

  // Helper methods for specific subscriptions
  subscribeToAdminRentalRequests(callback) {
    return this.subscribe('/topic/admin/rental-requests', callback, 'admin-rental-requests');
  }

  subscribeToAdminNotifications(callback) {
    return this.subscribe('/topic/admin/notifications', callback, 'admin-notifications');
  }

  subscribeToUserNotifications(userId, callback) {
    return this.subscribe(`/queue/notifications/${userId}`, callback, `user-notifications-${userId}`);
  }

  subscribeToUserRentalRequests(userId, callback) {
    return this.subscribe(`/queue/rental-requests/${userId}`, callback, `user-rental-requests-${userId}`);
  }

  subscribeToUserWallet(userId, callback) {
    return this.subscribe(`/queue/wallet/${userId}`, callback, `user-wallet-${userId}`);
  }

  subscribeToUserWalletTransactions(userId, callback) {
    return this.subscribe(`/queue/wallet-transactions/${userId}`, callback, `user-wallet-transactions-${userId}`);
  }

  subscribeToUserPenalties(userId, callback) {
    return this.subscribe(`/queue/penalties/${userId}`, callback, `user-penalties-${userId}`);
  }

  subscribeToUserGroups(userId, callback) {
    return this.subscribe(`/queue/groups/${userId}`, callback, `user-groups-${userId}`);
  }
}

// Export singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;


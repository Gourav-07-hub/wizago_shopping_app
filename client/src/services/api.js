const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiCall = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('wizago_token');

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(data && { body: JSON.stringify(data) }),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Something went wrong');
  }

  return result;
};

export const authAPI = {
  register: (data) => apiCall('/auth/register', 'POST', data),
  login: (data) => apiCall('/auth/login', 'POST', data),
  getMe: () => apiCall('/auth/me'),
};

export const ordersAPI = {
  create: (data) => apiCall('/orders', 'POST', data),
  getMyOrders: () => apiCall('/orders/my'),
  getAll: () => apiCall('/orders'),
  update: (id, data) => apiCall(`/orders/${id}`, 'PUT', data),
};

export const productsAPI = {
  getAll: (category) => apiCall(`/products${category ? `?category=${category}` : ''}`),
  getById: (id) => apiCall(`/products/${id}`),
  create: (data) => apiCall('/products', 'POST', data),
  update: (id, data) => apiCall(`/products/${id}`, 'PUT', data),
  delete: (id) => apiCall(`/products/${id}`, 'DELETE'),
};

export const deliveryAPI = {
  getPartners: () => apiCall('/delivery/partners'),
  createPartner: (data) => apiCall('/delivery/partners', 'POST', data),
  updatePartner: (id, data) => apiCall(`/delivery/partners/${id}`, 'PUT', data),
  deletePartner: (id) => apiCall(`/delivery/partners/${id}`, 'DELETE'),
  assignOrder: (orderId, data) => apiCall(`/delivery/assign/${orderId}`, 'PUT', data),
  verifyDelivery: (orderId, data) => apiCall(`/delivery/verify/${orderId}`, 'PUT', data),
};

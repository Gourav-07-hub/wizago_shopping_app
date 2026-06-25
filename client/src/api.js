const getLocal = (key, def = '[]') => JSON.parse(localStorage.getItem(key) || def);
const setLocal = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const defaultEmployees = [
  { id: 'EMP001', name: 'Albus D.', role: 'Headmaster', status: 'On Duty' },
  { id: 'EMP002', name: 'Minerva M.', role: 'Deputy Headmistress', status: 'On Duty' },
  { id: 'EMP003', name: 'Severus S.', role: 'Potion Master', status: 'On Duty' }
];

export const api = {
  employees: {
    list: async () => {
      let list = localStorage.getItem('wizago_employees');
      if (!list) {
        setLocal('wizago_employees', defaultEmployees);
        return defaultEmployees;
      }
      return JSON.parse(list);
    },
    create: async (data) => {
      const list = getLocal('wizago_employees', '[]');
      const newItem = { ...data, id: data.id || `EMP-${Date.now()}` };
      list.unshift(newItem);
      setLocal('wizago_employees', list);
      return newItem;
    },
    update: async (id, data) => {
      const list = getLocal('wizago_employees', '[]');
      const updated = list.map(item => item.id === id ? { ...item, ...data } : item);
      setLocal('wizago_employees', updated);
      return data;
    },
    remove: async (id) => {
      const list = getLocal('wizago_employees', '[]');
      const filtered = list.filter(item => item.id !== id);
      setLocal('wizago_employees', filtered);
      return { id };
    },
  },
  orders: {
    list: async () => {
      return getLocal('wizago_orders', '[]');
    },
    create: async (data) => {
      const list = getLocal('wizago_orders', '[]');
      // Ensure we map standard checkout order keys to POS keys if needed
      const mappedData = {
        ...data,
        invoiceNumber: data.invoiceNumber || data.id,
        id: data.id || data.invoiceNumber
      };
      list.unshift(mappedData);
      setLocal('wizago_orders', list);
      return mappedData;
    },
    update: async (invoiceNumber, data) => {
      const list = getLocal('wizago_orders', '[]');
      const updated = list.map(item => (item.invoiceNumber === invoiceNumber || item.id === invoiceNumber) ? { ...item, ...data } : item);
      setLocal('wizago_orders', updated);
      return data;
    },
    remove: async (invoiceNumber) => {
      const list = getLocal('wizago_orders', '[]');
      const filtered = list.filter(item => item.invoiceNumber !== invoiceNumber && item.id !== invoiceNumber);
      setLocal('wizago_orders', filtered);
      return { invoiceNumber };
    },
  },
  products: {
    list: async () => {
      return [];
    },
  },
};
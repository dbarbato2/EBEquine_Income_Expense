import React, { useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { toast, Toaster } from 'react-hot-toast';

const BASE_URL = "http://localhost:5001/api/v1/";

const GlobalContext = React.createContext();

export const GlobalProvider = ({ children }) => {
  const [revenue, setRevenue] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cookies, setCookie ,removeCookie] = useCookies([]);
  const navigate = useNavigate();

  // Login user
  const login = async (values) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}login`,
        {
          ...values,
        },
        { withCredentials: true }
      );
      if (data.errors) {
        const { email, password } = data.errors;
        if (email) setError(email);
        else if (password) setError(password);
      } else {
        console.log('Login successful, setting user to:', data.user);
        setUser(data.user);
        setName(data.name);
        setEmail(data.email);
        navigate('/');
        toast.success("Login Sucessful!")
        // Don't call checkUser here - the useEffect will trigger when user state updates
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Register user
  const register = async (values) => {
    try {
      console.log('Register attempt with:', values);
      const { data } = await axios.post(
        `${BASE_URL}register`,
        {
          ...values,
        },
        { withCredentials: true }
      );
      console.log('Register response:', data);
      if (data.errors && Object.values(data.errors).some(e => e)) {
        const { email, password, name } = data.errors;
        const errorMsg = email || password || name || "Registration failed";
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (data.status || data.user) {
        console.log('Setting user to:', data.user);
        setUser(data.user);
        setName(data.name);
        setEmail(data.email);
        toast.success("Register Successful!")
        navigate('/');
        // Don't call checkUser here - the useEffect will trigger when user state updates
      }
    } catch (err) {
      console.log('Register error:', err);
      const errorMsg = err.response?.data?.errors?.email || err.response?.data?.message || err.message;
      toast.error('Registration failed: ' + errorMsg);
    }
  };

  // Change user password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}change-password`,
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      if (data.status) {
        toast.success('Password changed successfully!');
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to change password');
        return { success: false, message: data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'An error occurred';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Check user authentication status
  const checkUser = useCallback(async (redirectIfNotAuth = true) => {
    try {
      const { data } = await axios.post(`${BASE_URL}check-user`, {}, {
        withCredentials: true,
      });
      if (data.status) {
        setUser(data.user);
        setName(data.name);
        setEmail(data.email);
      } else {
        setUser(null);
        if (redirectIfNotAuth) {
          navigate('/login');
        }
      }
    } catch (err) {
      console.log(err);
      setUser(null);
      if (redirectIfNotAuth) {
        navigate('/login');
      }
    }
}, [navigate]);

  // Sign out user
  const signOutUser = async () => {
    try {
      removeCookie('jwt', { path: '/' });
      setCookie(null);
      setUser(null);
      setEmail("");
      navigate('/login');
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  // Revenue and expense functions
  const addRevenue = async (revenue) => {
    try {
      await axios.post(`${BASE_URL}add-revenue`, revenue)
      toast.success('Revenue added successfully!');
      await getRevenue();
      return true;
    } catch (err) {
      setError(err.response.data.message);
      return false;
    }
  };

  const getRevenue = useCallback(async () => {
    if (!user) {
      console.log('Skipping getRevenue: user is not set');
      return;
    }
    try {
      console.log('Fetching revenue for user:', user);
      const response = await axios.get(`${BASE_URL}get-revenue?userid=${user}`);
      console.log('Revenue data received:', response.data);
      console.log('First revenue item:', response.data[0]);
      setRevenue(response.data);
    } catch (error) {
      console.error('Error fetching revenue:', error);
      setError('Failed to fetch revenue data');
    }
}, [user]);

  const getClients = useCallback(async () => {
    if (!user) {
      console.log('Skipping getClients: user is not set');
      return;
    }
    try {
      console.log('Fetching clients for user:', user);
      const response = await axios.get(`${BASE_URL}get-clients?userid=${user}`);
      console.log('Clients data received:', response.data);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to fetch clients data');
    }
}, [user]);

  const addClient = async (client) => {
    try {
      await axios.post(`${BASE_URL}add-client`, client)
      toast.success('Client added successfully!');
      await getClients();
      return true;
    } catch (err) {
      toast.error(err.response.data.message || 'Failed to add client');
      return false;
    }
  };

  const deleteRevenue = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-revenue/${id}`);
      toast.success('Revenue deleted successfully!');
      await getRevenue();
    } catch (error) {
      console.error('Error deleting revenue:', error);
      toast.error(error.response?.data?.message || 'Failed to delete revenue');
      throw error;
    }
  };

  const totalRevenue = () => {
    let totalRevenue = 0;
    revenue.forEach((item) => {
      // Handle Decimal128 objects from MongoDB
      const amount = item.actualRevenue ? parseFloat(item.actualRevenue.toString()) : 0;
      totalRevenue = totalRevenue + amount;
    });
    return totalRevenue;
  };

  const quarterlyRevenue = (year) => {
    const quarters = {
      Q1: 0,
      Q2: 0,
      Q3: 0,
      Q4: 0
    };

    const getQuarter = (month) => {
      // Q1: Jan-Mar (0-2), Q2: Apr-Jun (3-5), Q3: Jul-Aug (6-7), Q4: Sep-Dec (8-11)
      if (month <= 2) return 'Q1';
      if (month <= 5) return 'Q2';
      if (month <= 7) return 'Q3';
      return 'Q4';
    };

    revenue.forEach((item) => {
      let dateValue = item.date || item.Date || item.createdAt;
      
      if (dateValue && item['Actual Fees']) {
        const date = new Date(dateValue);
        if (year && date.getFullYear() !== year) return; // Filter by year if provided
        const month = date.getMonth(); // 0-11
        const quarterKey = getQuarter(month);
        
        // Parse the Actual Fees field (comes as string like "$107.81")
        const valueStr = item['Actual Fees'].toString().replace('$', '').trim();
        const amount = parseFloat(valueStr);
        
        if (!isNaN(amount) && amount > 0) {
          quarters[quarterKey] = quarters[quarterKey] + amount;
        }
      }
    });

    return quarters;
  };

  const quarterlyExpenses = (year) => {
    const quarters = {
      Q1: 0,
      Q2: 0,
      Q3: 0,
      Q4: 0
    };

    const getQuarter = (month) => {
      // Q1: Jan-Mar (0-2), Q2: Apr-Jun (3-5), Q3: Jul-Aug (6-7), Q4: Sep-Dec (8-11)
      if (month <= 2) return 'Q1';
      if (month <= 5) return 'Q2';
      if (month <= 7) return 'Q3';
      return 'Q4';
    };

    expenses.forEach((item) => {
      let dateValue = item.date || item.Date || item.createdAt;
      
      if (dateValue && item.Amount) {
        const date = new Date(dateValue);
        if (year && date.getFullYear() !== year) return; // Filter by year if provided
        const month = date.getMonth(); // 0-11
        const quarterKey = getQuarter(month);
        
        // Parse the amount field (comes as string or number)
        const valueStr = item.Amount.toString().replace('$', '').trim();
        const amount = parseFloat(valueStr);
        
        if (!isNaN(amount) && amount > 0) {
          quarters[quarterKey] = quarters[quarterKey] + amount;
        }
      }
    });

    return quarters;
  };

  const quarterlyDeductions = (year) => {
    const quarters = {
      Q1: 0,
      Q2: 0,
      Q3: 0,
      Q4: 0
    };

    const monthMap = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11,
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };

    const getQuarter = (month) => {
      // Q1: Jan-Mar (0-2), Q2: Apr-Jun (3-5), Q3: Jul-Aug (6-7), Q4: Sep-Dec (8-11)
      if (month <= 2) return 'Q1';
      if (month <= 5) return 'Q2';
      if (month <= 7) return 'Q3';
      return 'Q4';
    };

    deductions.forEach((item) => {
      if (item.Month && item['Deduction Amount'] && item.Year) {
        if (year && parseInt(item.Year) !== year) return; // Filter by year if provided
        // Convert month string to number
        const monthNum = monthMap[item.Month];
        if (monthNum !== undefined && monthNum >= 0 && monthNum <= 11) {
          const quarterKey = getQuarter(monthNum);
          
          // Parse the Deduction Amount field (comes as string or number)
          const valueStr = item['Deduction Amount'].toString().replace('$', '').trim();
          const amount = parseFloat(valueStr);
          
          if (!isNaN(amount) && amount > 0) {
            quarters[quarterKey] = quarters[quarterKey] + amount;
          }
        }
      }
    });

    return quarters;
  };

  const addDeduction = async (deduction) => {
    try {
      await axios.post(`${BASE_URL}add-deduction`, deduction)
      toast.success('Deduction added successfully!');
      await getDeductions();
      return true;
    } catch (err) {
      setError(err.response.data.message);
      return false;
    }
  };

  const getDeductions = useCallback(async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${BASE_URL}get-deductions?userid=${user}`);
      setDeductions(response.data);
    } catch (error) {
      console.error('Error fetching deductions:', error);
      setError('Failed to fetch deductions data');
    }
}, [user]);

  const deleteDeduction = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-deduction/${id}`);
      toast.success('Deduction deleted successfully!');
      await getDeductions();
    } catch (error) {
      console.error('Error deleting deduction:', error);
      toast.error(error.response?.data?.message || 'Failed to delete deduction');
      throw error;
    }
  };

  const updateDeduction = async (id, deductionData) => {
    try {
      console.log('Updating deduction with ID:', id);
      console.log('Deduction data:', deductionData);
      const response = await axios.put(`${BASE_URL}update-deduction/${id}`, deductionData);
      console.log('Update response:', response.data);
      toast.success('Deduction updated successfully!');
      getDeductions();
      return response.data;
    } catch (error) {
      console.error('Error updating deduction:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update deduction');
      throw error;
    }
  };

  const searchDeductions = async (year, month, deductionType, recordNumber) => {
    if (!user) return [];
    try {
      let queryParams = `userid=${user}`;
      if (year) queryParams += `&year=${year}`;
      if (month) queryParams += `&month=${month}`;
      if (deductionType) queryParams += `&deductionType=${deductionType}`;
      if (recordNumber) queryParams += `&recordNumber=${recordNumber}`;
      
      const response = await axios.get(`${BASE_URL}search-deductions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error searching deductions:', error);
      toast.error('Failed to search deductions');
      return [];
    }
  };

  // Revenue search and update
  const searchRevenue = async (date, client, service, invoiceNumber) => {
    if (!user) return [];
    try {
      let queryParams = `userid=${user}`;
      if (date) queryParams += `&date=${date}`;
      if (client) queryParams += `&client=${client}`;
      if (service) queryParams += `&service=${service}`;
      if (invoiceNumber) queryParams += `&invoiceNumber=${invoiceNumber}`;
      
      const response = await axios.get(`${BASE_URL}search-revenue?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error searching revenue:', error);
      toast.error('Failed to search revenue');
      return [];
    }
  };

  const updateRevenue = async (id, revenueData) => {
    try {
      console.log('Updating revenue with ID:', id);
      console.log('Revenue data:', revenueData);
      const response = await axios.put(`${BASE_URL}update-revenue/${id}`, revenueData);
      console.log('Update response:', response.data);
      toast.success('Revenue updated successfully!');
      getRevenue();
      return response.data;
    } catch (error) {
      console.error('Error updating revenue:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update revenue');
      throw error;
    }
  };

  // Expense search and update
  const searchExpenses = async (date, vendor, expenseType, location, recordNumber) => {
    if (!user) return [];
    try {
      let queryParams = `userid=${user}`;
      if (date) queryParams += `&date=${date}`;
      if (vendor) queryParams += `&vendor=${vendor}`;
      if (expenseType) queryParams += `&expenseType=${expenseType}`;
      if (location) queryParams += `&location=${location}`;
      if (recordNumber) queryParams += `&recordNumber=${recordNumber}`;
      
      const response = await axios.get(`${BASE_URL}search-expenses?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error searching expenses:', error);
      toast.error('Failed to search expenses');
      return [];
    }
  };

  const updateExpense = async (id, expenseData) => {
    try {
      console.log('Updating expense with ID:', id);
      console.log('Expense data:', expenseData);
      const response = await axios.put(`${BASE_URL}update-expense/${id}`, expenseData);
      console.log('Update response:', response.data);
      toast.success('Expense updated successfully!');
      getExpenses();
      return response.data;
    } catch (error) {
      console.error('Error updating expense:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update expense');
      throw error;
    }
  };

  // Client search and update
  const searchClients = async (name, phoneNumber, email, barnContact, horseName) => {
    if (!user) return [];
    try {
      let queryParams = `userid=${user}`;
      if (name) queryParams += `&name=${name}`;
      if (phoneNumber) queryParams += `&phoneNumber=${phoneNumber}`;
      if (email) queryParams += `&email=${email}`;
      if (barnContact) queryParams += `&barnContact=${barnContact}`;
      if (horseName) queryParams += `&horseName=${horseName}`;
      
      const response = await axios.get(`${BASE_URL}search-clients?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error searching clients:', error);
      toast.error('Failed to search clients');
      return [];
    }
  };

  const updateClient = async (id, clientData) => {
    try {
      console.log('Updating client with ID:', id);
      console.log('Client data:', clientData);
      const response = await axios.put(`${BASE_URL}edit-client/${id}`, clientData);
      console.log('Update response:', response.data);
      toast.success('Client updated successfully!');
      getClients();
      return response.data;
    } catch (error) {
      console.error('Error updating client:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update client');
      throw error;
    }
  };

  const deleteClient = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-client/${id}`);
      toast.success('Client deleted successfully!');
      await getClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(error.response?.data?.message || 'Failed to delete client');
      throw error;
    }
  };

  const totalDeductions = () => {
    let total = 0;
    deductions.forEach((d) => {
      total = total + (d['Deduction Amount'] ? Number(d['Deduction Amount']) : 0);
    });
    return total;
  };

  const addExpense = async (expense) => {
    try {
      await axios.post(`${BASE_URL}add-expense`, expense)
      toast.success('Expense added successfully!');
      await getExpenses();
      return true;
    } catch (err) {
      setError(err.response.data.message);
      return false;
    }
  };
  const getExpenses = useCallback(async () => {
    if (!user) {
      console.log('Skipping getExpenses: user is not set');
      return;
    }
    try {
      console.log('Fetching expenses for user:', user);
      const response = await axios.get(`${BASE_URL}get-expenses?userid=${user}`);
      console.log('Expenses data received:', response.data);
      setExpenses(response.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to fetch expenses data');
    }
}, [user]);

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${BASE_URL}delete-expense/${id}`);
      toast.success('Expense deleted successfully!');
      await getExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error(error.response?.data?.message || 'Failed to delete expense');
      throw error;
    }
  };

  const totalExpenses = () => {
    let totalExpense = 0;
    expenses.forEach((expense) => {
      // Handle Decimal128 objects from MongoDB
      const amount = expense.amount ? parseFloat(expense.amount.toString()) : 0;
      totalExpense = totalExpense + amount;
    });
    return totalExpense;
  };

  const totalBalance = () => {
    return totalRevenue() - totalExpenses();
  };

  useEffect(() => {
    checkUser(false); // Don't redirect on initial check
  }, [checkUser]);

  useEffect(() => {
    if (user) {
      getRevenue();
      getDeductions();
      getExpenses();
      getClients();
    }
  }, [user, getRevenue, getDeductions, getExpenses, getClients]);

  const transactionHistory = () => {
    const history = [...revenue, ...expenses];
    history.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return history.slice(0, 3);
  };

  const generateError = (error) => toast.error(error);


    useEffect(() => {
        if (error) generateError(error);
      }, [error]);

  return (
    <GlobalContext.Provider value={{
      addRevenue,
      getRevenue,
      revenue,
      deleteRevenue,
      searchRevenue,
      updateRevenue,
      addDeduction,
      getDeductions,
      deductions,
      deleteDeduction,
      updateDeduction,
      searchDeductions,
      totalDeductions,
      expenses,
      totalRevenue,
      addExpense,
      getExpenses,
      deleteExpense,
      searchExpenses,
      updateExpense,
      totalExpenses,
      totalBalance,
      quarterlyRevenue,
      quarterlyExpenses,
      quarterlyDeductions,
      transactionHistory,
      addClient,
      getClients,
      clients,
      deleteClient,
      searchClients,
      updateClient,
      error,
      setError,
      email,
      user,
      login,
      register,
      changePassword,
      signOutUser,
      name
    }}>
      {children}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
          error: {
            duration: 3000,
            theme: {
              primary: 'red',
              secondary: 'black',
            },
            closeOnClick: true
          },
        }}
      />
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};

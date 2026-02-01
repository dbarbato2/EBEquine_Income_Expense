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
    await axios.post(`${BASE_URL}add-revenue`, revenue)
      .then(() => {
        toast.success('Revenue added successfully!');
      })
      .catch((err) => {
        setError(err.response.data.message);
        toast.error(err.response.data.message || 'Failed to add revenue');
      });
    getRevenue();
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
    await axios.post(`${BASE_URL}add-client`, client)
      .then(() => {
        toast.success('Client added successfully!');
      })
      .catch((err) => {
        setError(err.response.data.message);
        toast.error(err.response.data.message || 'Failed to add client');
      });
    getClients();
  };

  const deleteRevenue = async (id) => {
    await axios.delete(`${BASE_URL}delete-revenue/${id}`);
    getRevenue();
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
    await axios.post(`${BASE_URL}add-deduction`, deduction)
      .then(() => {
        toast.success('Deduction added successfully!');
      })
      .catch((err) => {
        setError(err.response.data.message);
        toast.error(err.response.data.message || 'Failed to add deduction');
      });
    getDeductions();
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
    await axios.delete(`${BASE_URL}delete-deduction/${id}`);
    getDeductions();
  };

  const searchDeductions = async (year, month, deductionType) => {
    if (!user) return [];
    try {
      let queryParams = `userid=${user}`;
      if (year) queryParams += `&year=${year}`;
      if (month) queryParams += `&month=${month}`;
      if (deductionType) queryParams += `&deductionType=${deductionType}`;
      
      const response = await axios.get(`${BASE_URL}search-deductions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error searching deductions:', error);
      toast.error('Failed to search deductions');
      return [];
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
    await axios.post(`${BASE_URL}add-expense`, expense)
      .then(() => {
        toast.success('Expense added successfully!');
      })
      .catch((err) => {
        setError(err.response.data.message);
        toast.error(err.response.data.message || 'Failed to add expense');
      });
    getExpenses();
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
    await axios.delete(`${BASE_URL}delete-expense/${id}`);
    getExpenses();
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
      addDeduction,
      getDeductions,
      deductions,
      deleteDeduction,
      searchDeductions,
      totalDeductions,
      expenses,
      totalRevenue,
      addExpense,
      getExpenses,
      deleteExpense,
      totalExpenses,
      totalBalance,
      quarterlyRevenue,
      quarterlyExpenses,
      quarterlyDeductions,
      transactionHistory,
      addClient,
      getClients,
      clients,
      error,
      setError,
      email,
      user,
      login,
      register,
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

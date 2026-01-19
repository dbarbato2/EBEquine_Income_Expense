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
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
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
      navigate('/login');
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };

  // Revenue and expense functions
  const addRevenue = async (revenue) => {
    await axios.post(`${BASE_URL}add-revenue`, revenue)
      .catch((err) => {
        setError(err.response.data.message);
      });
    getRevenue();
  };
/*
  const getRevenue = async () => {
    const response = await axios.get(`${BASE_URL}get-revenue?userid=${user}`);
    setRevenue(response.data);
  };*/
  const getRevenue = useCallback(async () => {
    if (!user) {
      console.log('Skipping getRevenue: user is not set');
      return;
    }
    try {
      console.log('Fetching revenue for user:', user);
      const response = await axios.get(`${BASE_URL}get-revenue?userid=${user}`);
      console.log('Revenue data received:', response.data);
      setRevenue(response.data);
    } catch (error) {
      console.error('Error fetching revenue:', error);
      setError('Failed to fetch revenue data');
    }
}, [user]);

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

  const addDeduction = async (deduction) => {
    await axios.post(`${BASE_URL}add-deduction`, deduction)
      .catch((err) => {
        setError(err.response.data.message);
      });
    getDeductions();
  };
/*
  const getDeductions = async () => {
    const response = await axios.get(`${BASE_URL}get-deductions?userid=${user}`);
    setDeductions(response.data);
  };*/
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

  const totalDeductions = () => {
    let total = 0;
    deductions.forEach((d) => {
      total = total + (d.deductionAmount ? Number(d.deductionAmount) : 0);
    });
    return total;
  };

  const addExpense = async (expense) => {
    await axios.post(`${BASE_URL}add-expense`, expense)
      .catch((err) => {
        setError(err.response.data.message);
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
    }
  }, [user, getRevenue, getDeductions, getExpenses]);

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
      totalDeductions,
      expenses,
      totalRevenue,
      addExpense,
      getExpenses,
      deleteExpense,
      totalExpenses,
      totalBalance,
      transactionHistory,
      error,
      setError,
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

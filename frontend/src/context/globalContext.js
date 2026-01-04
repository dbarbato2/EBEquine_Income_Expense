import React, { useContext, useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { toast, Toaster } from 'react-hot-toast';

const BASE_URL = "http://localhost:5000/api/v1/";

const GlobalContext = React.createContext();

export const GlobalProvider = ({ children }) => {
  const [revenue, setRevenue] = useState([]);
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
        setUser(data.user);
        navigate('/');
        await checkUser();
        toast.success("Login Sucessful!")

      }
    } catch (err) {
      console.log(err);
    }
  };

  // Register user
  const register = async (values) => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}register`,
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
        setUser(data.user);
        navigate('/');
        await checkUser();
        toast.success("Register Sucessful!")
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Check user authentication status
  const checkUser = async () => {
    try {
      const { data } = await axios.post(`http://localhost:5000`,{}, {
        withCredentials: true,
      });
      if (data.status) {
        setUser(data.user);
        setName(data.name);
        navigate('/');
      } else {
        setUser(null);
        navigate('/login');
      }
    } catch (err) {
      console.log(err);
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
  }, [cookies]);

  useEffect(() => {
    if (user) {
      getRevenue();
      getExpenses();
    }
  }, [user]);

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

  const getRevenue = async () => {
    const response = await axios.get(`${BASE_URL}get-revenue?userid=${user}`);
    setRevenue(response.data);
  };

  const deleteRevenue = async (id) => {
    await axios.delete(`${BASE_URL}delete-revenue/${id}`);
    getRevenue();
  };

  const totalRevenue = () => {
    let totalRevenue = 0;
    revenue.forEach((revenue) => {
      totalRevenue = totalRevenue + revenue.amount;
    });
    return totalRevenue;
  };

  const addExpense = async (expense) => {
    await axios.post(`${BASE_URL}add-expense`, expense)
      .catch((err) => {
        setError(err.response.data.message);
      });
    getExpenses();
  };

  const getExpenses = async () => {
    const response = await axios.get(`${BASE_URL}get-expenses?userid=${user}`);
    setExpenses(response.data);
  };

  const deleteExpense = async (id) => {
    await axios.delete(`${BASE_URL}delete-expense/${id}`);
    getExpenses();
  };

  const totalExpenses = () => {
    let totalExpense = 0;
    expenses.forEach((expense) => {
      totalExpense = totalExpense + expense.amount;
    });
    return totalExpense;
  };

  const totalBalance = () => {
    return totalRevenue() - totalExpenses();
  };

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

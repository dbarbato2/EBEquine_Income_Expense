import React, {useState, useMemo} from 'react'
import styled from "styled-components";
import bg from './img/bg.png'
import {MainLayout} from './styles/Layouts'
import Orb from './Components/Orb/Orb'
import Navigation from './Components/Navigation/Navigation'
import Dashboard from './Components/Dashboard/Dashboard';
import Revenue from './Components/Revenue/Revenue'
import Expenses from './Components/Expenses/Expenses';
import Deductions from './Components/Deductions/Deductions';
import { GlobalProvider } from './context/globalContext';
import ViewRevenue from './Components/Transactions/ViewRevenue';
import ViewExpenses from './Components/Transactions/ViewExpenses';
import ViewDeductions from './Components/Transactions/ViewDeductions';
import ViewClients from './Components/Transactions/ViewClients';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Register from './Components/User/Register';
import Login from './Components/User/Login';
import { ToastContainer } from 'react-toastify';


function App() {
  const [active, setActive] = useState(1)

  const displayData = () => {
    switch(active){
      case 1:
        return <Dashboard />
      case 3:
        return <ViewExpenses />
      case 5:
        return <Revenue />
      case 6:
        return <Expenses />
      case 7:
        return <Deductions />
      case 8:
        return <ViewClients />
      case 50:
        return <ViewRevenue />
      case 51:
        return <Revenue />
      case 52:
        return <></>
      case 60:
        return <ViewExpenses />
      case 61:
        return <Expenses />
      case 62:
        return <></>
      case 70:
        return <ViewDeductions />
      case 71:
        return <Deductions />
      case 72:
        return <></>
      case 80:
        return <ViewClients />
      case 81:
        return <></>
      case 82:
        return <></>
      default: 
        return <Dashboard />
    }
  }

  const orbMemo = useMemo(() => {
    return <Orb />
  },[])


  return (
    <AppStyled bg={bg} className="App">
      {orbMemo}
        <BrowserRouter>
        <GlobalProvider>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <>
                      <MainLayout>

                  <Navigation active={active} setActive={setActive} />
                  <main>{displayData()}</main>
                  </MainLayout>

                </>
                  }
            />
          </Routes>
          <ToastContainer />
          </GlobalProvider>
        </BrowserRouter>
    </AppStyled>
  );
}

const AppStyled = styled.div`
  height: 100vh;
  width: 100vw;
  background-image: url(${props => props.bg});
  position: relative;
  main{
    flex: 1;
    background: rgba(252, 246, 249, 0.78);
    border: 3px solid #FFFFFF;
    backdrop-filter: blur(4.5px);
    border-radius: 32px;
    overflow-x: hidden;
    &::-webkit-scrollbar{
      width: 0;
    }
  }
`;

export default App;

import React, {useState, useMemo, useEffect} from 'react'
import styled from "styled-components";
import bg from './img/bg.png'
import bgWinter from './img/bg_winter.png'
import bgRainbow from './img/bg_rainbow.png'
import bgFire from './img/bg_fire.png'
import bgSpring from './img/bg_spring.png'
import bgMetallic from './img/bg_metal.png'
import {MainLayout} from './styles/Layouts'
import Orb from './Components/Orb/Orb'
import Navigation from './Components/Navigation/Navigation'
import Dashboard from './Components/Dashboard/Dashboard';
import Revenue from './Components/Revenue/Revenue'
import Expenses from './Components/Expenses/Expenses';
import Deductions from './Components/Deductions/Deductions';
import Clients from './Components/Clients/Clients';
import Settings from './Components/Settings/Settings';
import { GlobalProvider } from './context/globalContext';
import ViewRevenue from './Components/Transactions/ViewRevenue';
import ViewExpenses from './Components/Transactions/ViewExpenses';
import ViewDeductions from './Components/Transactions/ViewDeductions';
import ViewDeductionsWithModify from './Components/Transactions/ViewDeductionsWithModify';
import ViewClients from './Components/Transactions/ViewClients';
import ViewRevenueWithModify from './Components/Transactions/ViewRevenueWithModify';
import ViewExpensesWithModify from './Components/Transactions/ViewExpensesWithModify';
import ViewClientsWithModify from './Components/Transactions/ViewClientsWithModify';
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Register from './Components/User/Register';
import Login from './Components/User/Login';
import { ToastContainer } from 'react-toastify';


function App() {
  const [active, setActive] = useState(1)
  const [backgroundImage, setBackgroundImage] = useState(bg)

  // Load background preference on mount
  useEffect(() => {
    const savedBackground = localStorage.getItem('background') || 'ebequine'
    const getBgImage = (bgName) => {
      switch(bgName) {
        case 'coolblue': return bgWinter
        case 'rainbow': return bgRainbow
        case 'fire': return bgFire
        case 'spring': return bgSpring
        case 'metallic': return bgMetallic
        default: return bg
      }
    }
    setBackgroundImage(getBgImage(savedBackground))
  }, [])

  // Listen for localStorage changes from other tabs/windows or components
  useEffect(() => {
    const handleStorageChange = () => {
      const savedBackground = localStorage.getItem('background') || 'ebequine'
      const getBgImage = (bgName) => {
        switch(bgName) {
          case 'coolblue': return bgWinter
          case 'rainbow': return bgRainbow
          case 'fire': return bgFire
          case 'spring': return bgSpring
          case 'metallic': return bgMetallic
          default: return bg
        }
      }
      setBackgroundImage(getBgImage(savedBackground))
    }

    const handleBackgroundChange = (event) => {
      const background = event.detail?.background || 'ebequine'
      const getBgImage = (bgName) => {
        switch(bgName) {
          case 'coolblue': return bgWinter
          case 'rainbow': return bgRainbow
          case 'fire': return bgFire
          case 'spring': return bgSpring
          case 'metallic': return bgMetallic
          default: return bg
        }
      }
      setBackgroundImage(getBgImage(background))
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('backgroundChange', handleBackgroundChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('backgroundChange', handleBackgroundChange)
    }
  }, [])

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
        return <ViewRevenueWithModify />
      case 60:
        return <ViewExpenses />
      case 61:
        return <Expenses />
      case 62:
        return <ViewExpensesWithModify />
      case 70:
        return <ViewDeductionsWithModify />
      case 71:
        return <Deductions />
      case 72:
        return <ViewDeductions />
      case 80:
        return <ViewClients />
      case 81:
        return <Clients />
      case 82:
        return <ViewClientsWithModify />
      case 99:
        return <Settings />
      default: 
        return <Dashboard />
    }
  }

  const orbMemo = useMemo(() => {
    return <Orb />
  },[])


  return (
    <AppStyled bg={backgroundImage} className="App">
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

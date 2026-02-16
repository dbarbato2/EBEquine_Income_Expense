import React, { useEffect } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';
import { dateFormat } from '../../utils/dateFormat';

const ViewExpenses = () => {
  const { getExpenses, expenses } = useGlobalContext();

  useEffect(() => {
    getExpenses();
  }, [getExpenses]);

  const handleRowClick = (item) => {
    alert(JSON.stringify(item, null, 2));
  };

  return (
    <ViewExpensesStyled>
      <div className="content-wrapper">
      <h2>Expenses</h2>
      <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vendor</th>
            <th>Location</th>
            <th>Expense Type</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Payment Type</th>
            <th>Business Trip</th>
            <th>Record Number</th>
          </tr>
        </thead>
        <tbody>
          {[...expenses].sort((a, b) => {
            // Primary sort: by Date (newest first)
            const dateCompare = new Date(b.Date) - new Date(a.Date);
            if (dateCompare !== 0) return dateCompare;
            
            // Secondary sort: by Record Number (higher values first)
            const recordA = parseInt(a['Expense Record Number']) || 0;
            const recordB = parseInt(b['Expense Record Number']) || 0;
            return recordB - recordA;
          }).map(expenses => (
            <tr key={expenses._id} onClick={() => handleRowClick(expenses)}>
              <td>{dateFormat(expenses.Date)}</td>
              <td>{expenses['Vendor/Payee']}</td>
              <td>{expenses.Location}</td>
              <td>{expenses['Expense Type']}</td>
              <td>{expenses['Expense Description']}</td>
              <td>{expenses.Amount}</td>
              <td>{expenses['Payment Type']}</td>
              <td>{expenses['Associated with a Business Trip'] ? "Yes" : "No"}</td>
              <td>{expenses['Expense Record Number']}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
    </ViewExpensesStyled>
  );
}

const ViewExpensesStyled = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 0;

    .content-wrapper {
      padding: 2rem 1.5rem;
      width: 100%;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    h2{
    margin-bottom: 10px}

    .table-wrapper {
      flex: 1;
      overflow-x: auto;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .table-wrapper::-webkit-scrollbar {
      height: 10px;
      width: 10px;
    }

    .table-wrapper::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .table-wrapper::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 5px;
    }

    .table-wrapper::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    th {
    background-color:blue;
    }
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-bottom: 2rem;

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    thead th {
      background-color: #f2f2f2;
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
    }

    tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    tbody tr:hover {
      background-color: #f1f1f1;
      cursor: pointer;
    }


  }
`;

export default ViewExpenses;

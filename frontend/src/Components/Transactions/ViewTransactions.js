// ViewTransactions.js

import React, { useEffect } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';
import { InnerLayout } from '../../styles/Layouts';

const ViewTransactions = () => {
  const { getRevenue, getExpenses, getDeductions, revenue, expenses, deductions } = useGlobalContext();

  useEffect(() => {
    getRevenue();
    getExpenses();
    getDeductions();
  }, [getRevenue, getExpenses, getDeductions]);

  const handleRowClick = (item) => {
    alert(JSON.stringify(item, null, 2));
  };

  return (
    <ViewTransactionsStyled>
        <InnerLayout>
      <h2>Revenue</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Client</th>
            <th>Service</th>
            <th>Quantity</th>
            <th>Add-On Service</th>
            <th>Location</th>
            <th>Service Fee</th>
            <th>Travel Fee</th>
            <th>Discount</th>
            <th>Discount Reason</th>
            <th>Payment Type</th>
            <th>Transaction Fee</th>
            <th>Actual Revenue</th>
            <th>Invoice Number</th>
          </tr>
        </thead>
        <tbody>
          {revenue.map(revenue => (
            <tr key={revenue._id} onClick={() => handleRowClick(revenue)}>
              <td>{revenue.Date}</td>
              <td>{revenue.Client}</td>
              <td>{revenue.Service}</td>
              <td>{revenue.Quantity}</td>
              <td>{revenue['Add-On Service']}</td>
              <td>{revenue['Service Location']}</td>
              <td>{revenue['Service Fee']}</td>
              <td>{revenue['Travel Fee']}</td>
              <td>{revenue.Discount}</td>
              <td>{revenue['Discount Reason']}</td>
              <td>{revenue['Payment Type']}</td>
              <td>{revenue['Transaction Fees']}</td>
              <td>{revenue['Actual Fees']}</td>
              <td>{revenue['Invoice Number']}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Expenses</h2>
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
          {expenses.map(expenses => (
            <tr key={expenses._id} onClick={() => handleRowClick(expenses)}>
              <td>{expenses.Date}</td>
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

      <h2>Deductions</h2>
      <table>
        <thead>
          <tr>
            <th>Year</th>
            <th>Month</th>
            <th>Deduction Type</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Record Number</th>
          </tr>
        </thead>
        <tbody>
          {deductions.map(deductions => (
            <tr key={deductions._id} onClick={() => handleRowClick(deductions)}>
              <td>{deductions.Year}</td>
              <td>{deductions.Month}</td>
              <td>{deductions['Deduction Type']}</td>
              <td>{deductions['Deduction Description']}</td>
              <td>{deductions['Deduction Amount']}</td>
              <td>{deductions['Deduction Record Number']}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </InnerLayout>
    </ViewTransactionsStyled>
  );
}

const ViewTransactionsStyled = styled.div`

    h2{
    margin-bottom: 10px}

    th {
    background-color:blue;
    }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2rem;

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    th {
      background-color: #f2f2f2;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    tr:hover {
      background-color: #f1f1f1;
      cursor: pointer;
    }


  }
`;

export default ViewTransactions;

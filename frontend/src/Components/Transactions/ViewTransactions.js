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
              <td>{revenue.date}</td>
              <td>{revenue.client}</td>
              <td>{revenue.service}</td>
              <td>{revenue.quantity}</td>
              <td>{revenue.addOnService}</td>
              <td>{revenue.serviceLocation}</td>
              <td>{revenue.serviceFee}</td>
              <td>{revenue.travelFee}</td>
              <td>{revenue.discount}</td>
              <td>{revenue.discountReason}</td>
              <td>{revenue.paymentType}</td>
              <td>{revenue.transactionFee}</td>
              <td>{revenue.actualRevenue}</td>
              <td>{revenue.invoiceNumber}</td>
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
          {expenses.map(expense => (
            <tr key={expense._id} onClick={() => handleRowClick(expense)}>
              <td>{expense.date}</td>
              <td>{expense.vendor}</td>
              <td>{expense.location}</td>
              <td>{expense.expenseType}</td>
              <td>{expense.description}</td>
              <td>{expense.amount}</td>
              <td>{expense.paymentType}</td>
              <td>{expense.businessTrip ? "Yes" : "No"}</td>
              <td>{expense.recordNumber}</td>
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
          {deductions.map(deduction => (
            <tr key={deduction._id} onClick={() => handleRowClick(deduction)}>
              <td>{deduction.year}</td>
              <td>{deduction.month}</td>
              <td>{deduction.deductionType}</td>
              <td>{deduction.description}</td>
              <td>{deduction.amount}</td>
              <td>{deduction.recordNumber}</td>
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

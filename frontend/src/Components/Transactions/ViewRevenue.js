import React, { useEffect } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';
import { InnerLayout } from '../../styles/Layouts';
import { dateFormat } from '../../utils/dateFormat';

const ViewRevenue = () => {
  const { getRevenue, revenue } = useGlobalContext();

  useEffect(() => {
    getRevenue();
  }, [getRevenue]);

  const handleRowClick = (item) => {
    alert(JSON.stringify(item, null, 2));
  };

  return (
    <ViewRevenueStyled>
        <InnerLayout>
      <h2>Revenue</h2>
      <div className="table-wrapper">
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
          {[...revenue].sort((a, b) => {
            // Primary sort: by Date (newest first)
            const dateCompare = new Date(b.Date) - new Date(a.Date);
            if (dateCompare !== 0) return dateCompare;
            
            // Secondary sort: by Invoice Number (higher values first)
            const invoiceA = parseInt(a['Invoice Number']) || 0;
            const invoiceB = parseInt(b['Invoice Number']) || 0;
            return invoiceB - invoiceA;
          }).map(revenue => (
            <tr key={revenue._id} onClick={() => handleRowClick(revenue)}>
              <td>{dateFormat(revenue.Date)}</td>
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
      </div>
      </InnerLayout>
    </ViewRevenueStyled>
  );
}

const ViewRevenueStyled = styled.div`

    h2{
    margin-bottom: 10px}

    .table-wrapper {
      overflow-x: auto;
      overflow-y: auto;
      max-height: 400px;
      margin-bottom: 2rem;
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

export default ViewRevenue;

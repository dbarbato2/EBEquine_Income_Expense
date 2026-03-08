import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';
import { dateFormat } from '../../utils/dateFormat';
import InvoiceModal from '../Invoice/InvoiceModal';

const ViewRevenue = () => {
  const { getRevenue, revenue, clients, getClients } = useGlobalContext();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    getRevenue();
    getClients();
  }, [getRevenue, getClients]);

  const handleRowClick = (item) => {
    setSelectedRevenue(item);
    // Find matching client data if available
    const matchingClient = clients.find(c => c.Name === item.Client);
    setSelectedClient(matchingClient || null);
    setShowInvoiceModal(true);
  };

  const handleCloseModal = () => {
    setShowInvoiceModal(false);
    setSelectedRevenue(null);
    setSelectedClient(null);
  };

  return (
    <ViewRevenueStyled>
      <div className="content-wrapper">
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
      </div>
      
      {/* Invoice Modal */}
      <InvoiceModal 
        isOpen={showInvoiceModal}
        onClose={handleCloseModal}
        revenueData={selectedRevenue}
        clientData={selectedClient}
      />
    </ViewRevenueStyled>
  );
}

const ViewRevenueStyled = styled.div`
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
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }

    .table-wrapper::-webkit-scrollbar {
      height: 10px;
      width: 10px;
    }

    .table-wrapper::-webkit-scrollbar-track {
      background: var(--hover-bg);
    }

    .table-wrapper::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 5px;
    }

    .table-wrapper::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-bottom: 2rem;

    th, td {
      border: 1px solid var(--border-color);
      padding: 8px;
      text-align: left;
      color: var(--text-color);
    }

    thead th {
      background-color: var(--card-bg);
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: 0 2px 2px -1px rgba(0, 0, 0, 0.1);
    }

    tbody tr:nth-child(even) {
      background-color: var(--hover-bg);
    }

    tbody tr:hover {
      background-color: var(--hover-bg);
      cursor: pointer;
    }
  }
`;

export default ViewRevenue;

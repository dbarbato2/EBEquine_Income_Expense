
import React, { useEffect } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';
import { InnerLayout } from '../../styles/Layouts';

const ViewClients = () => {
  const { getClients, clients } = useGlobalContext();

  useEffect(() => {
    getClients();
  }, [getClients]);

  const handleRowClick = (item) => {
    alert(JSON.stringify(item, null, 2));
  };

  return (
    <ViewClientsStyled>
        <InnerLayout>
      <h2>Clients</h2>
      <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Owner Name</th>
            <th>Barn</th>
            <th>Address</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(clients => (
            <tr key={clients._id} onClick={() => handleRowClick(clients)}>
              <td>{clients.Name}</td>
              <td>{clients['Owner Name']}</td>
              <td>{clients.Barn}</td>
              <td>{clients.Address}</td>
              <td>{clients['Email Address']}</td>
              <td>{clients['Phone Number']}</td>
          </tr>
          ))}
        </tbody>
      </table>
      </div>
      
      </InnerLayout>
    </ViewClientsStyled>
  );
}

const ViewClientsStyled = styled.div`

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

export default ViewClients;

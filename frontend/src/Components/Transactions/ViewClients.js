
import React, { useEffect } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';

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
      <div className="content-wrapper">
      <h2>Clients</h2>
      <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Mailing Address</th>
            <th>Town/State/Zip</th>
            <th>Barn Address</th>
            <th>Barn Contact</th>
            <th>Horse Name</th>
            <th>Breed Type</th>
            <th>Age/DOB</th>
            <th>Gender</th>
            <th>Color</th>
            <th>Discipline</th>
            <th>Often Trained/Ridden</th>
            <th>Medications</th>
            <th>Prior Injuries</th>
            <th>Concerns/Problems</th>
            <th>Horse Tie</th>
            <th>Previous Massage</th>
            <th>Vet Clinic Name</th>
            <th>Photo/Video</th>
            <th>Waiver Permission</th>
            <th>Medical Update</th>
            <th>Referral Source</th>
            <th>Peppermint Cubes</th>
            <th>Additional Info</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client._id} onClick={() => handleRowClick(client)}>
              <td>{client.Name}</td>
              <td>{client.PhoneNumber}</td>
              <td>{client.Email}</td>
              <td>{client.MailingAddress}</td>
              <td>{client.TownStateZip}</td>
              <td>{client.BarnAddress}</td>
              <td>{client.BarnContact}</td>
              <td>{client.HorseName}</td>
              <td>{client.BreedType}</td>
              <td>{client.Age_DOB}</td>
              <td>{client.Gender}</td>
              <td>{client.Color}</td>
              <td>{client.Discipline}</td>
              <td>{client.OftenTrainedRidden}</td>
              <td>{client.Medications}</td>
              <td>{client.PriorInjuries}</td>
              <td>{client.ConcernsProblems}</td>
              <td>{client.HorseTie}</td>
              <td>{client.PreviousMassage}</td>
              <td>{client.VetClinicName}</td>
              <td>{client.PhotoVideo}</td>
              <td>{client.WaiverPermission}</td>
              <td>{client.MedicalConditionUpdate}</td>
              <td>{client.ReferralSource}</td>
              <td>{client.PeppermintSugarCubes}</td>
              <td>{client.AdditionalInformation}</td>
          </tr>
          ))}
        </tbody>
      </table>
      </div>
      
      </div>
    </ViewClientsStyled>
  );
}

const ViewClientsStyled = styled.div`
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

export default ViewClients;

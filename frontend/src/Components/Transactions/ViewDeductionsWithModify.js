import React, { useEffect } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';
import { InnerLayout } from '../../styles/Layouts';

const ViewDeductionsWithModify = () => {
  const { getDeductions, deductions } = useGlobalContext();

  useEffect(() => {
    getDeductions();
  }, [getDeductions]);

  const handleRowClick = (item) => {
    alert(JSON.stringify(item, null, 2));
  };

  const monthOrder = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
    'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
  };

  const sortedDeductions = [...deductions].sort((a, b) => {
    // Primary sort: by Year (newest first)
    if (b.Year !== a.Year) {
      return b.Year - a.Year;
    }
    // Secondary sort: by Month (newest first)
    const monthCompare = (monthOrder[b.Month] || 0) - (monthOrder[a.Month] || 0);
    if (monthCompare !== 0) {
      return monthCompare;
    }
    // Tertiary sort: by Record Number (highest first)
    const recordA = parseInt(a['Deduction Record Number']) || 0;
    const recordB = parseInt(b['Deduction Record Number']) || 0;
    return recordB - recordA;
  });

  return (
    <ViewDeductionsWithModifyStyled>
        <InnerLayout>
      <h2>View Deductions</h2>
      <div className="table-wrapper">
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
          {sortedDeductions.map(deductions => (
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
      </div>
      </InnerLayout>
    </ViewDeductionsWithModifyStyled>
  );
}

const ViewDeductionsWithModifyStyled = styled.div`

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

export default ViewDeductionsWithModify;

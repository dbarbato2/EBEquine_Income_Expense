import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';
import { InnerLayout } from '../../styles/Layouts';
import { toast } from 'react-hot-toast';

const ViewDeductions = () => {
  const { getDeductions, deductions, searchDeductions } = useGlobalContext();
  const [searchCriteria, setSearchCriteria] = useState({
    year: '',
    month: '',
    deductionType: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDeduction, setSelectedDeduction] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  useEffect(() => {
    getDeductions();
  }, [getDeductions]);

  const handleSearchInput = (name) => (e) => {
    setSearchCriteria({ ...searchCriteria, [name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const { year, month, deductionType } = searchCriteria;
    
    if (!year && !month && !deductionType) {
      toast.error('Please select at least one search criteria');
      return;
    }

    const results = await searchDeductions(year, month, deductionType);
    setSearchResults(results);
    setShowSearchResults(true);
    
    if (results.length === 0) {
      toast.error('No deductions found matching your criteria');
      setSelectedDeduction(null);
    } else if (results.length === 1) {
      setSelectedDeduction(results[0]);
      toast.success('Deduction found!');
    } else {
      toast.success(`${results.length} deductions found`);
      setSelectedDeduction(null);
    }
  };

  const handleResultClick = (deduction) => {
    setSelectedDeduction(deduction);
  };

  const handleRowClick = (item) => {
    alert(JSON.stringify(item, null, 2));
  };

  return (
    <ViewDeductionsStyled>
        <InnerLayout>
      <h2>Modify/Delete Deduction</h2>
      
      {/* Search Section */}
      <div className="search-section">
        <h3>Search Deductions</h3>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-controls">
            <div className="input-control">
              <input 
                type="number"
                value={searchCriteria.year}
                name="year"
                placeholder="Year (e.g., 2026)"
                onChange={handleSearchInput('year')}
                min="2000"
                max="2100"
              />
            </div>
            <div className="select-control">
              <select 
                value={searchCriteria.month} 
                name="month" 
                onChange={handleSearchInput('month')}
              >
                <option value="">Select Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
            </div>
            <div className="select-control">
              <select 
                value={searchCriteria.deductionType} 
                name="deductionType" 
                onChange={handleSearchInput('deductionType')}
              >
                <option value="">Select Deduction Type</option>
                <option value="Mileage">Mileage</option>
                <option value="Tolls">Tolls</option>
                <option value="Car Payment">Car Payment</option>
                <option value="Auto Insurance">Auto Insurance</option>
                <option value="Gym Membership">Gym Membership</option>
                <option value="Mortgage">Mortgage</option>
                <option value="Real Estate Taxes">Real Estate Taxes</option>
                <option value="Internet">Internet</option>
                <option value="Utilities - Electric">Utilities - Electric</option>
                <option value="Utilities - Gas">Utilities - Gas</option>
                <option value="Lawn Maintenance">Lawn Maintenance</option>
                <option value="Recycling/Rubbish">Recycling/Rubbish</option>
                <option value="Utilities - Water">Utilities - Water</option>
              </select>
            </div>
            <button type="submit" className="search-btn">Search</button>
          </div>
        </form>
      </div>

      {/* Search Results */}
      {showSearchResults && searchResults.length > 1 && (
        <div className="search-results">
          <h3>Search Results ({searchResults.length} found)</h3>
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
                {searchResults.map(deduction => (
                  <tr 
                    key={deduction._id} 
                    onClick={() => handleResultClick(deduction)}
                    className={selectedDeduction && selectedDeduction._id === deduction._id ? 'selected' : ''}
                  >
                    <td>{deduction.Year}</td>
                    <td>{deduction.Month}</td>
                    <td>{deduction['Deduction Type']}</td>
                    <td>{deduction['Deduction Description']}</td>
                    <td>{deduction['Deduction Amount']}</td>
                    <td>{deduction['Deduction Record Number']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Deduction Form */}
      {selectedDeduction && (
        <div className="deduction-form">
          <h3>Deduction Details</h3>
          <div className="form-content">
            <div className="form-group">
              <label>Year:</label>
              <input type="number" value={selectedDeduction.Year} readOnly />
            </div>
            <div className="form-group">
              <label>Month:</label>
              <input type="text" value={selectedDeduction.Month} readOnly />
            </div>
            <div className="form-group">
              <label>Deduction Type:</label>
              <input type="text" value={selectedDeduction['Deduction Type']} readOnly />
            </div>
            <div className="form-group">
              <label>Description:</label>
              <input type="text" value={selectedDeduction['Deduction Description'] || ''} readOnly />
            </div>
            <div className="form-group">
              <label>Amount:</label>
              <input type="text" value={selectedDeduction['Deduction Amount'] || ''} readOnly />
            </div>
            <div className="form-group">
              <label>Record Number:</label>
              <input type="text" value={selectedDeduction['Deduction Record Number'] || ''} readOnly />
            </div>
          </div>
        </div>
      )}

      {/* All Deductions Table */}
      <h3 style={{marginTop: '2rem'}}>All Deductions</h3>
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
      </div>
      </InnerLayout>
    </ViewDeductionsStyled>
  );
}

const ViewDeductionsStyled = styled.div`

    h2{
    margin-bottom: 10px}

    h3 {
      margin-top: 1.5rem;
      margin-bottom: 1rem;
    }

    .search-section {
      background: rgba(252, 246, 249, 0.78);
      border: 2px solid #FFFFFF;
      backdrop-filter: blur(4.5px);
      border-radius: 32px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .search-form {
      .search-controls {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: flex-start;
      }

      .input-control, .select-control {
        flex: 1;
        min-width: 200px;
        
        input, select {
          width: 100%;
          font-family: inherit;
          font-size: inherit;
          outline: none;
          border: none;
          padding: .5rem 1rem;
          border-radius: 5px;
          border: 2px solid #fff;
          background: transparent;
          resize: none;
          box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
          color: rgba(34, 34, 96, 0.9);
          &::placeholder{
              color: rgba(34, 34, 96, 0.4);
          }
        }
      }

      .search-btn {
        padding: .5rem 2rem;
        border-radius: 5px;
        border: 2px solid #fff;
        background: #222260;
        color: #fff;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: #42224a;
        }
      }
    }

    .search-results {
      margin-bottom: 2rem;
    }

    .deduction-form {
      background: rgba(252, 246, 249, 0.78);
      border: 2px solid #FFFFFF;
      backdrop-filter: blur(4.5px);
      border-radius: 32px;
      padding: 1.5rem;
      margin-bottom: 2rem;

      .form-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
          font-weight: 600;
          color: rgba(34, 34, 96, 0.9);
        }

        input {
          font-family: inherit;
          font-size: inherit;
          outline: none;
          border: none;
          padding: .5rem 1rem;
          border-radius: 5px;
          border: 2px solid #fff;
          background: transparent;
          box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
          color: rgba(34, 34, 96, 0.9);
        }
      }
    }

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

    tr.selected {
      background-color: #d4e8ff;
    }


  }
`;

export default ViewDeductions;

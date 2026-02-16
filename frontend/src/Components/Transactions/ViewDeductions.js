import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import Button from '../Button/Button';
import { edit, trash, plus, x } from '../../utils/Icons';

const ViewDeductions = () => {
  const { getDeductions, deductions, searchDeductions, deleteDeduction, updateDeduction } = useGlobalContext();
  const [searchCriteria, setSearchCriteria] = useState({
    year: '',
    month: '',
    deductionType: '',
    recordNumber: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDeduction, setSelectedDeduction] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDeduction, setEditedDeduction] = useState(null);

  useEffect(() => {
    getDeductions();
  }, [getDeductions]);

  const handleSearchInput = (name) => (e) => {
    setSearchCriteria({ ...searchCriteria, [name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const { year, month, deductionType, recordNumber } = searchCriteria;
    
    if (!year && !month && !deductionType && !recordNumber) {
      toast.error('Please select at least one search criteria');
      return;
    }

    const results = await searchDeductions(year, month, deductionType, recordNumber);
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
    setEditedDeduction(deduction);
    setIsEditing(false);
  };

  const handleRowClick = (item) => {
    alert(JSON.stringify(item, null, 2));
  };

  const handleModify = () => {
    setEditedDeduction({ ...selectedDeduction });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedDeduction(selectedDeduction);
  };

  const handleEditInput = (field) => (e) => {
    setEditedDeduction({ ...editedDeduction, [field]: e.target.value });
  };

  const handleSaveChanges = async () => {
    try {
      const updateData = {
        month: editedDeduction.Month,
        year: editedDeduction.Year,
        deductionType: editedDeduction['Deduction Type'],
        deductionDescription: editedDeduction['Deduction Description'],
        deductionAmount: editedDeduction['Deduction Amount'],
        deductionRecordNumber: editedDeduction['Deduction Record Number']
      };

      await updateDeduction(selectedDeduction._id, updateData);
      setSelectedDeduction(editedDeduction);
      setIsEditing(false);
      
      // Refresh search results if applicable
      if (showSearchResults) {
        const { year, month, deductionType, recordNumber } = searchCriteria;
        const results = await searchDeductions(year, month, deductionType, recordNumber);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this deduction?')) {
      try {
        await deleteDeduction(selectedDeduction._id);
        setSelectedDeduction(null);
        setEditedDeduction(null);
        setIsEditing(false);
        
        // Refresh search results if applicable
        if (showSearchResults) {
          const { year, month, deductionType, recordNumber } = searchCriteria;
          const results = await searchDeductions(year, month, deductionType, recordNumber);
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Error deleting deduction:', error);
      }
    }
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
    <ViewDeductionsStyled>
      <div className="content-wrapper">
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
            <div className="input-control">
              <input 
                type="text"
                value={searchCriteria.recordNumber}
                name="recordNumber"
                placeholder="Record Number"
                onChange={handleSearchInput('recordNumber')}
              />
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
              <input 
                type="number" 
                value={isEditing ? editedDeduction.Year : selectedDeduction.Year} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Year') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Month:</label>
              {isEditing ? (
                <select 
                  value={editedDeduction.Month} 
                  onChange={handleEditInput('Month')}
                >
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
              ) : (
                <input type="text" value={selectedDeduction.Month} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Deduction Type:</label>
              {isEditing ? (
                <select 
                  value={editedDeduction['Deduction Type']} 
                  onChange={handleEditInput('Deduction Type')}
                >
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
              ) : (
                <input type="text" value={selectedDeduction['Deduction Type']} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Description:</label>
              <input 
                type="text" 
                value={isEditing ? (editedDeduction['Deduction Description'] || '') : (selectedDeduction['Deduction Description'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Deduction Description') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Amount:</label>
              <input 
                type="text" 
                value={isEditing ? (editedDeduction['Deduction Amount'] || '') : (selectedDeduction['Deduction Amount'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Deduction Amount') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Record Number:</label>
              <input 
                type="number" 
                value={isEditing ? (editedDeduction['Deduction Record Number'] || '') : (selectedDeduction['Deduction Record Number'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Deduction Record Number') : undefined}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="button-group">
            {!isEditing ? (
              <>
                <Button 
                  name={'Modify Deduction'}
                  icon={edit}
                  onClick={handleModify}
                  bPad={'.8rem 1.6rem'}
                  bRad={'30px'}
                  bg={'var(--color-green)'}
                  color={'#fff'}
                />
                <button 
                  type="button"
                  onClick={handleDelete}
                  className="delete-btn"
                >
                  {trash}
                  Delete Deduction
                </button>
              </>
            ) : (
              <>
                <Button 
                  name={'Save Changes'}
                  icon={plus}
                  onClick={handleSaveChanges}
                  bPad={'.8rem 1.6rem'}
                  bRad={'30px'}
                  bg={'var(--color-green)'}
                  color={'#fff'}
                />
                <button 
                  type="button"
                  onClick={handleCancelEdit}
                  className="cancel-btn"
                >
                  {x}
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* All Deductions Table */}
      <h3>All Deductions</h3>
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
      </div>
    </ViewDeductionsStyled>
  );
}

const ViewDeductionsStyled = styled.div`
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
    margin-bottom: 10px;
    }

    h3 {
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }

    .search-section {
      background: rgba(252, 246, 249, 0.78);
      border: 2px solid #FFFFFF;
      backdrop-filter: blur(4.5px);
      border-radius: 32px;
      padding: 1.5rem;
      margin-bottom: 1rem;
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
        padding: .8rem 1.6rem;
        border-radius: 30px;
        border: none;
        background: #222260;
        color: #fff;
        font-size: inherit;
        font-family: inherit;
        font-weight: 600;
        cursor: pointer;
        transition: all .4s ease-in-out;
        box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        &:hover {
          filter: brightness(0.75);
        }
      }
    }

    .search-results {
      margin-bottom: 1rem;
    }

    .deduction-form {
      background: rgba(252, 246, 249, 0.78);
      border: 2px solid #FFFFFF;
      backdrop-filter: blur(4.5px);
      border-radius: 32px;
      padding: 1.5rem;
      margin-bottom: 1rem;

      .form-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        label {
          font-weight: 600;
          color: rgba(34, 34, 96, 0.9);
        }

        input, select {
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

        select {
          cursor: pointer;
        }
      }

      .button-group {
        display: flex;
        gap: 1rem;
        justify-content: flex-start;
        margin-top: 1rem;

        button {
          box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
          &:hover {
            background: var(--color-green) !important;
          }
        }

        .delete-btn, .cancel-btn {
          padding: .8rem 1.6rem;
          border-radius: 30px;
          background: #dc3545;
          color: #fff;
          border: none;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: inherit;
          font-size: inherit;
          transition: all .4s ease-in-out;
          
          &:hover {
            background: #c82333 !important;
          }
        }
      }
    }

    .table-wrapper {
      flex: 1;
      overflow-x: auto;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .search-results .table-wrapper {
      flex: none;
      max-height: 30vh;
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

    tbody tr.selected {
      background-color: #d4e8ff;
    }
  }
`;

export default ViewDeductions;

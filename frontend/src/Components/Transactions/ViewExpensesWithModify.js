import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import Button from '../Button/Button';
import { edit, trash, plus, x } from '../../utils/Icons';
import { dateFormat } from '../../utils/dateFormat';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ViewExpensesWithModify = () => {
  const { getExpenses, expenses, searchExpenses, deleteExpense, updateExpense } = useGlobalContext();
  const [searchCriteria, setSearchCriteria] = useState({
    date: '',
    vendor: '',
    expenseType: '',
    location: '',
    recordNumber: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedExpense, setEditedExpense] = useState(null);

  useEffect(() => {
    getExpenses();
  }, [getExpenses]);

  const handleSearchInput = (name) => (e) => {
    setSearchCriteria({ ...searchCriteria, [name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setSearchCriteria({ ...searchCriteria, date: date ? date.toISOString() : '' });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const { date, vendor, expenseType, location, recordNumber } = searchCriteria;
    
    if (!date && !vendor && !expenseType && !location && !recordNumber) {
      toast.error('Please select at least one search criteria');
      return;
    }

    const results = await searchExpenses(date, vendor, expenseType, location, recordNumber);
    setSearchResults(results);
    setShowSearchResults(true);
    
    if (results.length === 0) {
      toast.error('No expenses found matching your criteria');
      setSelectedExpense(null);
    } else if (results.length === 1) {
      setSelectedExpense(results[0]);
      toast.success('Expense found!');
    } else {
      toast.success(`${results.length} expenses found`);
      setSelectedExpense(null);
    }
  };

  const handleResultClick = (expenseItem) => {
    setSelectedExpense(expenseItem);
    setEditedExpense(expenseItem);
    setIsEditing(false);
  };

  const handleRowClick = (item) => {
    setSelectedExpense(item);
    setEditedExpense(item);
    setIsEditing(false);
  };

  const handleModify = () => {
    setEditedExpense({ ...selectedExpense });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedExpense(selectedExpense);
  };

  const handleEditInput = (field) => (e) => {
    setEditedExpense({ ...editedExpense, [field]: e.target.value });
  };

  const handleEditDateChange = (date) => {
    setEditedExpense({ ...editedExpense, Date: date });
  };

  const handleCheckboxChange = (e) => {
    setEditedExpense({ ...editedExpense, 'Associated with a Business Trip': e.target.checked ? 'Yes' : null });
  };

  const handleSaveChanges = async () => {
    try {
      const updateData = {
        date: editedExpense.Date,
        vendor: editedExpense['Vendor/Payee'],
        location: editedExpense.Location,
        expenseType: editedExpense['Expense Type'],
        expenseDescription: editedExpense['Expense Description'],
        amount: editedExpense.Amount,
        paymentType: editedExpense['Payment Type'],
        businessTrip: editedExpense['Associated with a Business Trip'] === 'Yes',
        expenseRecordNumber: editedExpense['Expense Record Number']
      };

      await updateExpense(selectedExpense._id, updateData);
      setSelectedExpense(editedExpense);
      setIsEditing(false);
      
      // Refresh search results if applicable
      if (showSearchResults) {
        const { date, vendor, expenseType, location, recordNumber } = searchCriteria;
        const results = await searchExpenses(date, vendor, expenseType, location, recordNumber);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(selectedExpense._id);
        setSelectedExpense(null);
        setEditedExpense(null);
        setIsEditing(false);
        
        // Refresh search results if applicable
        if (showSearchResults) {
          const { date, vendor, expenseType, location, recordNumber } = searchCriteria;
          const results = await searchExpenses(date, vendor, expenseType, location, recordNumber);
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  return (
    <ViewExpensesStyled>
      <div className="content-wrapper">
      <h2>Modify/Delete Expense</h2>
      
      {/* Search Section */}
      <div className="search-section">
        <h3>Search Expenses</h3>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-controls">
            <div className="input-control">
              <DatePicker
                selected={searchCriteria.date ? new Date(searchCriteria.date) : null}
                onChange={handleDateChange}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select Date"
              />
            </div>
            <div className="input-control">
              <input 
                type="text"
                value={searchCriteria.vendor}
                name="vendor"
                placeholder="Vendor/Payee"
                onChange={handleSearchInput('vendor')}
              />
            </div>
            <div className="select-control">
              <select 
                value={searchCriteria.expenseType} 
                name="expenseType" 
                onChange={handleSearchInput('expenseType')}
              >
                <option value="">Select Expense Type</option>
                <option value="Airfare">Airfare</option>
                <option value="Hotel">Hotel</option>
                <option value="Rental Car">Rental Car</option>
                <option value="Food">Food</option>
                <option value="Parking">Parking</option>
                <option value="Professional">Professional</option>
                <option value="Supplies">Supplies</option>
                <option value="Home Office Expenses">Home Office Expenses</option>
                <option value="Gas">Gas</option>
                <option value="Gym">Gym</option>
                <option value="Car Payment">Car Payment</option>
                <option value="Car Maintenance">Car Maintenance</option>
              </select>
            </div>
            <div className="input-control">
              <input 
                type="text"
                value={searchCriteria.location}
                name="location"
                placeholder="Expense Location"
                onChange={handleSearchInput('location')}
              />
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
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Location</th>
                  <th>Expense Type</th>
                  <th>Amount</th>
                  <th>Record Number</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map(expenseItem => (
                  <tr 
                    key={expenseItem._id} 
                    onClick={() => handleResultClick(expenseItem)}
                    className={selectedExpense && selectedExpense._id === expenseItem._id ? 'selected' : ''}
                  >
                    <td>{dateFormat(expenseItem.Date)}</td>
                    <td>{expenseItem['Vendor/Payee']}</td>
                    <td>{expenseItem.Location}</td>
                    <td>{expenseItem['Expense Type']}</td>
                    <td>{expenseItem.Amount}</td>
                    <td>{expenseItem['Expense Record Number']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Expense Form */}
      {selectedExpense && (
        <div className="expense-form">
          <h3>Expense Details</h3>
          <div className="form-content">
            <div className="form-group">
              <label>Date:</label>
              {isEditing ? (
                <DatePicker
                  selected={new Date(editedExpense.Date)}
                  onChange={handleEditDateChange}
                  dateFormat="MM/dd/yyyy"
                />
              ) : (
                <input type="text" value={dateFormat(selectedExpense.Date)} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Vendor/Payee:</label>
              <input 
                type="text" 
                value={isEditing ? (editedExpense['Vendor/Payee'] || '') : (selectedExpense['Vendor/Payee'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Vendor/Payee') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Location:</label>
              <input 
                type="text" 
                value={isEditing ? (editedExpense.Location || '') : (selectedExpense.Location || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Location') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Expense Type:</label>
              {isEditing ? (
                <select 
                  value={editedExpense['Expense Type']} 
                  onChange={handleEditInput('Expense Type')}
                >
                  <option value="Airfare">Airfare</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Rental Car">Rental Car</option>
                  <option value="Food">Food</option>
                  <option value="Parking">Parking</option>
                  <option value="Professional">Professional</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Home Office Expenses">Home Office Expenses</option>
                  <option value="Gas">Gas</option>
                  <option value="Gym">Gym</option>
                  <option value="Car Payment">Car Payment</option>
                  <option value="Car Maintenance">Car Maintenance</option>
                </select>
              ) : (
                <input type="text" value={selectedExpense['Expense Type']} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Description:</label>
              <input 
                type="text" 
                value={isEditing ? (editedExpense['Expense Description'] || '') : (selectedExpense['Expense Description'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Expense Description') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Amount:</label>
              <input 
                type="text" 
                value={isEditing ? (editedExpense.Amount || '') : (selectedExpense.Amount || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Amount') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Payment Type:</label>
              {isEditing ? (
                <select 
                  value={editedExpense['Payment Type'] || ''} 
                  onChange={handleEditInput('Payment Type')}
                >
                  <option value="">Select Payment Type</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Chase Credit Card">Chase Credit Card</option>
                  <option value="Venmo">Venmo</option>
                  <option value="AutoPay Needham Bank">AutoPay Needham Bank</option>
                </select>
              ) : (
                <input type="text" value={selectedExpense['Payment Type'] || ''} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Business Trip:</label>
              {isEditing ? (
                <input 
                  type="checkbox" 
                  checked={editedExpense['Associated with a Business Trip'] === 'Yes'} 
                  onChange={handleCheckboxChange}
                />
              ) : (
                <input type="text" value={selectedExpense['Associated with a Business Trip'] ? 'Yes' : 'No'} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Record Number:</label>
              <input 
                type="number" 
                value={isEditing ? (editedExpense['Expense Record Number'] || '') : (selectedExpense['Expense Record Number'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Expense Record Number') : undefined}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="button-group">
            {!isEditing ? (
              <>
                <Button 
                  name={'Modify Expense'}
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
                  Delete Expense
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

      {/* All Expenses Table */}
      <h3 style={{marginTop: '2rem'}}>All Expenses</h3>
      <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vendor</th>
            <th>Location</th>
            <th>Expense Type</th>
            <th>Amount</th>
            <th>Record Number</th>
          </tr>
        </thead>
        <tbody>
          {[...expenses].sort((a, b) => {
            // Primary sort: by Date (newest first)
            const dateCompare = new Date(b.Date) - new Date(a.Date);
            if (dateCompare !== 0) return dateCompare;
            
            // Secondary sort: by Record Number (highest first)
            const recordA = parseInt(a['Expense Record Number']) || 0;
            const recordB = parseInt(b['Expense Record Number']) || 0;
            return recordB - recordA;
          }).map(expenseItem => (
            <tr key={expenseItem._id} onClick={() => handleRowClick(expenseItem)} className={selectedExpense?._id === expenseItem._id ? 'selected' : ''}>
              <td>{dateFormat(expenseItem.Date)}</td>
              <td>{expenseItem['Vendor/Payee']}</td>
              <td>{expenseItem.Location}</td>
              <td>{expenseItem['Expense Type']}</td>
              <td>{expenseItem.Amount}</td>
              <td>{expenseItem['Expense Record Number']}</td>
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
      margin-bottom: 2rem;
    }

    .expense-form {
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

        input[type="checkbox"] {
          width: 20px;
          height: 20px;
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

    tbody tr.selected {
      background-color: #d4e8ff;
    }
  }
`;

export default ViewExpensesWithModify;

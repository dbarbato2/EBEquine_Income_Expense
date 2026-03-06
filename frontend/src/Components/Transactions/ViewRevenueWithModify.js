import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import Button from '../Button/Button';
import { edit, trash, plus, x } from '../../utils/Icons';
import { dateFormat } from '../../utils/dateFormat';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ViewRevenueWithModify = () => {
  const { getRevenue, revenue, searchRevenue, deleteRevenue, updateRevenue, getClients } = useGlobalContext();
  const [searchCriteria, setSearchCriteria] = useState({
    date: '',
    client: '',
    service: '',
    invoiceNumber: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRevenue, setSelectedRevenue] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRevenue, setEditedRevenue] = useState(null);

  useEffect(() => {
    getRevenue();
    getClients();
  }, [getRevenue, getClients]);

  const handleSearchInput = (name) => (e) => {
    setSearchCriteria({ ...searchCriteria, [name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setSearchCriteria({ ...searchCriteria, date: date ? date.toISOString() : '' });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const { date, client, service, invoiceNumber } = searchCriteria;
    
    if (!date && !client && !service && !invoiceNumber) {
      toast.error('Please select at least one search criteria');
      return;
    }

    const results = await searchRevenue(date, client, service, invoiceNumber);
    setSearchResults(results);
    setShowSearchResults(true);
    
    if (results.length === 0) {
      toast.error('No revenue records found matching your criteria');
      setSelectedRevenue(null);
    } else if (results.length === 1) {
      setSelectedRevenue(results[0]);
      toast.success('Revenue record found!');
    } else {
      toast.success(`${results.length} revenue records found`);
      setSelectedRevenue(null);
    }
  };

  const handleResultClick = (revenueItem) => {
    setSelectedRevenue(revenueItem);
    setEditedRevenue(revenueItem);
    setIsEditing(false);
  };

  const handleRowClick = (item) => {
    setSelectedRevenue(item);
    setEditedRevenue(item);
    setIsEditing(false);
  };

  const handleModify = () => {
    setEditedRevenue({ ...selectedRevenue });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedRevenue(selectedRevenue);
  };

  const handleEditInput = (field) => (e) => {
    setEditedRevenue({ ...editedRevenue, [field]: e.target.value });
  };

  const handleEditDateChange = (date) => {
    setEditedRevenue({ ...editedRevenue, Date: date });
  };

  const handleSaveChanges = async () => {
    try {
      const updateData = {
        date: editedRevenue.Date,
        client: editedRevenue.Client,
        service: editedRevenue.Service,
        quantity: editedRevenue.Quantity,
        addOnService: editedRevenue['Add-On Service'],
        serviceLocation: editedRevenue['Service Location'],
        serviceFee: editedRevenue['Service Fee'],
        travelFee: editedRevenue['Travel Fee'],
        discount: editedRevenue.Discount,
        discountReason: editedRevenue['Discount Reason'],
        paymentType: editedRevenue['Payment Type'],
        transactionFee: editedRevenue['Transaction Fees'],
        actualRevenue: editedRevenue['Actual Fees'],
        invoiceNumber: editedRevenue['Invoice Number']
      };

      await updateRevenue(selectedRevenue._id, updateData);
      setSelectedRevenue(editedRevenue);
      setIsEditing(false);
      
      // Refresh search results if applicable
      if (showSearchResults) {
        const { date, client, service, invoiceNumber } = searchCriteria;
        const results = await searchRevenue(date, client, service, invoiceNumber);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this revenue record?')) {
      try {
        await deleteRevenue(selectedRevenue._id);
        setSelectedRevenue(null);
        setEditedRevenue(null);
        setIsEditing(false);
        
        // Refresh search results if applicable
        if (showSearchResults) {
          const { date, client, service, invoiceNumber } = searchCriteria;
          const results = await searchRevenue(date, client, service, invoiceNumber);
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Error deleting revenue:', error);
      }
    }
  };

  return (
    <ViewRevenueStyled>
      <div className="content-wrapper">
      <h2>Modify/Delete Revenue</h2>
      
      {/* Search Section */}
      <div className="search-section">
        <h3>Search Revenue</h3>
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
                value={searchCriteria.client}
                name="client"
                placeholder="Client Name"
                onChange={handleSearchInput('client')}
              />
            </div>
            <div className="select-control">
              <select 
                value={searchCriteria.service} 
                name="service" 
                onChange={handleSearchInput('service')}
              >
                <option value="">Select Service</option>
                <option value="Introductory Massage">Introductory Massage</option>
                <option value="1 Hour Massage">1 Hour Massage</option>
                <option value="Kinesiology Tape">Kinesiology Tape</option>
                <option value="8 Hours Teaching">8 Hours Teaching</option>
                <option value="Gift Certificate">Gift Certificate</option>
              </select>
            </div>
            <div className="input-control">
              <input 
                type="text"
                value={searchCriteria.invoiceNumber}
                name="invoiceNumber"
                placeholder="Invoice Number"
                onChange={handleSearchInput('invoiceNumber')}
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
                  <th>Client</th>
                  <th>Service</th>
                  <th>Invoice Number</th>
                  <th>Actual Revenue</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map(revenueItem => (
                  <tr 
                    key={revenueItem._id} 
                    onClick={() => handleResultClick(revenueItem)}
                    className={selectedRevenue && selectedRevenue._id === revenueItem._id ? 'selected' : ''}
                  >
                    <td>{dateFormat(revenueItem.Date)}</td>
                    <td>{revenueItem.Client}</td>
                    <td>{revenueItem.Service}</td>
                    <td>{revenueItem['Invoice Number']}</td>
                    <td>{revenueItem['Actual Fees']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Revenue Form */}
      {selectedRevenue && (
        <div className="revenue-form">
          <h3>Revenue Details</h3>
          <div className="form-content">
            <div className="form-group">
              <label>Date:</label>
              {isEditing ? (
                <DatePicker
                  selected={new Date(editedRevenue.Date)}
                  onChange={handleEditDateChange}
                  dateFormat="MM/dd/yyyy"
                />
              ) : (
                <input type="text" value={dateFormat(selectedRevenue.Date)} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Client:</label>
              {isEditing ? (
                <input 
                  type="text"
                  value={editedRevenue.Client} 
                  onChange={handleEditInput('Client')}
                  placeholder="Enter Client Name"
                />
              ) : (
                <input type="text" value={selectedRevenue.Client} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Service:</label>
              {isEditing ? (
                <select 
                  value={editedRevenue.Service} 
                  onChange={handleEditInput('Service')}
                >
                  <option value="Introductory Massage">Introductory Massage</option>
                  <option value="1 Hour Massage">1 Hour Massage</option>
                  <option value="Kinesiology Tape">Kinesiology Tape</option>
                  <option value="8 Hours Teaching">8 Hours Teaching</option>
                  <option value="Gift Certificate">Gift Certificate</option>
                </select>
              ) : (
                <input type="text" value={selectedRevenue.Service} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Quantity:</label>
              <input 
                type="number" 
                value={isEditing ? (editedRevenue.Quantity || '') : (selectedRevenue.Quantity || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Quantity') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Add-On Service:</label>
              <input 
                type="text" 
                value={isEditing ? (editedRevenue['Add-On Service'] || '') : (selectedRevenue['Add-On Service'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Add-On Service') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Service Location:</label>
              {isEditing ? (
                <select 
                  value={editedRevenue['Service Location'] || ''} 
                  onChange={handleEditInput('Service Location')}
                >
                  <option value="">Select Location</option>
                  <option value="MA">MA</option>
                  <option value="NH">NH</option>
                  <option value="NJ">NJ</option>
                  <option value="FL">FL</option>
                </select>
              ) : (
                <input type="text" value={selectedRevenue['Service Location'] || ''} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Service Fee:</label>
              <input 
                type="text" 
                value={isEditing ? (editedRevenue['Service Fee'] || '') : (selectedRevenue['Service Fee'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Service Fee') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Travel Fee:</label>
              <input 
                type="text" 
                value={isEditing ? (editedRevenue['Travel Fee'] || '') : (selectedRevenue['Travel Fee'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Travel Fee') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Discount:</label>
              <input 
                type="text" 
                value={isEditing ? (editedRevenue.Discount || '') : (selectedRevenue.Discount || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Discount') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Discount Reason:</label>
              <input 
                type="text" 
                value={isEditing ? (editedRevenue['Discount Reason'] || '') : (selectedRevenue['Discount Reason'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Discount Reason') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Payment Type:</label>
              {isEditing ? (
                <select 
                  value={editedRevenue['Payment Type'] || ''} 
                  onChange={handleEditInput('Payment Type')}
                >
                  <option value="">Select Payment Type</option>
                  <option value="Venmo">Venmo</option>
                  <option value="Cash">Cash</option>
                  <option value="Check">Check</option>
                  <option value="Gift Certificate">Gift Certificate</option>
                </select>
              ) : (
                <input type="text" value={selectedRevenue['Payment Type'] || ''} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Transaction Fee:</label>
              <input 
                type="text" 
                value={isEditing ? (editedRevenue['Transaction Fees'] || '') : (selectedRevenue['Transaction Fees'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Transaction Fees') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Actual Revenue:</label>
              <input 
                type="text" 
                value={isEditing ? (editedRevenue['Actual Fees'] || '') : (selectedRevenue['Actual Fees'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Actual Fees') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Invoice Number:</label>
              <input 
                type="text" 
                value={isEditing ? (editedRevenue['Invoice Number'] || '') : (selectedRevenue['Invoice Number'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Invoice Number') : undefined}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="button-group">
            {!isEditing ? (
              <>
                <Button 
                  name={'Modify Revenue'}
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
                  Delete Revenue
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

      {/* All Revenue Table */}
      <h3 style={{marginTop: '2rem'}}>All Revenue</h3>
      <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Client</th>
            <th>Service</th>
            <th>Invoice Number</th>
            <th>Actual Revenue</th>
          </tr>
        </thead>
        <tbody>
          {[...revenue].sort((a, b) => new Date(b.Date) - new Date(a.Date)).map(revenueItem => (
            <tr key={revenueItem._id} onClick={() => handleRowClick(revenueItem)} className={selectedRevenue?._id === revenueItem._id ? 'selected' : ''}>
              <td>{dateFormat(revenueItem.Date)}</td>
              <td>{revenueItem.Client}</td>
              <td>{revenueItem.Service}</td>
              <td>{revenueItem['Invoice Number']}</td>
              <td>{revenueItem['Actual Fees']}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
    </ViewRevenueStyled>
  );
}

const ViewRevenueStyled = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 0;
    overflow: hidden;

    .content-wrapper {
      padding: 2rem 1.5rem;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }

    h2{
    margin-bottom: 10px}

    h3 {
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      color: var(--text-color);
    }

    .search-section {
      background: var(--card-bg);
      border: 2px solid var(--border-color);
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
          border: 2px solid var(--border-color);
          background: var(--input-bg);
          resize: none;
          box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
          color: var(--input-text);
          &::placeholder{
              color: var(--input-text);
              opacity: 0.4;
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

    .revenue-form {
      background: var(--card-bg);
      border: 2px solid var(--border-color);
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
          color: var(--text-color);
        }

        input, select {
          font-family: inherit;
          font-size: inherit;
          outline: none;
          border: none;
          padding: .5rem 1rem;
          border-radius: 5px;
          border: 2px solid var(--border-color);
          background: var(--input-bg);
          box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
          color: var(--input-text);
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
      overflow-x: auto;
      overflow-y: auto;
      border: 1px solid #ddd;
      border-radius: 8px;
      max-height: 400px;
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

export default ViewRevenueWithModify;

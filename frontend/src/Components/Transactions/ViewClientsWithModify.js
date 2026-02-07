import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';
import { InnerLayout } from '../../styles/Layouts';
import { toast } from 'react-hot-toast';
import Button from '../Button/Button';
import { edit, trash, plus, x } from '../../utils/Icons';

const ViewClientsWithModify = () => {
  const { getClients, clients, searchClients, updateClient, deleteClient } = useGlobalContext();
  const [searchCriteria, setSearchCriteria] = useState({
    name: '',
    ownerName: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState(null);

  useEffect(() => {
    getClients();
  }, [getClients]);

  const handleSearchInput = (name) => (e) => {
    setSearchCriteria({ ...searchCriteria, [name]: e.target.value });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const { name, ownerName } = searchCriteria;
    
    if (!name && !ownerName) {
      toast.error('Please enter at least one search criteria');
      return;
    }

    const results = await searchClients(name, ownerName);
    setSearchResults(results);
    setShowSearchResults(true);
    
    if (results.length === 0) {
      toast.error('No clients found matching your criteria');
      setSelectedClient(null);
    } else if (results.length === 1) {
      setSelectedClient(results[0]);
      toast.success('Client found!');
    } else {
      toast.success(`${results.length} clients found`);
      setSelectedClient(null);
    }
  };

  const handleResultClick = (clientItem) => {
    setSelectedClient(clientItem);
    setEditedClient(clientItem);
    setIsEditing(false);
  };

  const handleRowClick = (item) => {
    alert(JSON.stringify(item, null, 2));
  };

  const handleModify = () => {
    setEditedClient({ ...selectedClient });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedClient(selectedClient);
  };

  const handleEditInput = (field) => (e) => {
    setEditedClient({ ...editedClient, [field]: e.target.value });
  };

  const handleSaveChanges = async () => {
    try {
      const updateData = {
        name: editedClient.Name,
        ownerName: editedClient['Owner Name'],
        barn: editedClient.Barn,
        address: editedClient.Address,
        emailAddress: editedClient['Email Address'],
        phoneNumber: editedClient['Phone Number']
      };

      await updateClient(selectedClient._id, updateData);
      setSelectedClient(editedClient);
      setIsEditing(false);
      
      // Refresh search results if applicable
      if (showSearchResults) {
        const { name, ownerName } = searchCriteria;
        const results = await searchClients(name, ownerName);
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteClient(selectedClient._id);
        setSelectedClient(null);
        setEditedClient(null);
        setIsEditing(false);
        
        // Refresh search results if applicable
        if (showSearchResults) {
          const { name, ownerName } = searchCriteria;
          const results = await searchClients(name, ownerName);
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  return (
    <ViewClientsStyled>
        <InnerLayout>
      <h2>Modify/Delete Client</h2>
      
      {/* Search Section */}
      <div className="search-section">
        <h3>Search Clients</h3>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-controls">
            <div className="input-control">
              <input 
                type="text"
                value={searchCriteria.name}
                name="name"
                placeholder="Client Name"
                onChange={handleSearchInput('name')}
              />
            </div>
            <div className="input-control">
              <input 
                type="text"
                value={searchCriteria.ownerName}
                name="ownerName"
                placeholder="Owner Name"
                onChange={handleSearchInput('ownerName')}
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
                  <th>Client Name</th>
                  <th>Owner Name</th>
                  <th>Barn</th>
                  <th>Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map(clientItem => (
                  <tr 
                    key={clientItem._id} 
                    onClick={() => handleResultClick(clientItem)}
                    className={selectedClient && selectedClient._id === clientItem._id ? 'selected' : ''}
                  >
                    <td>{clientItem.Name}</td>
                    <td>{clientItem['Owner Name']}</td>
                    <td>{clientItem.Barn}</td>
                    <td>{clientItem['Phone Number']}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Client Form */}
      {selectedClient && (
        <div className="client-form">
          <h3>Client Details</h3>
          <div className="form-content">
            <div className="form-group">
              <label>Client Name:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.Name || '') : (selectedClient.Name || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Name') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Owner Name:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient['Owner Name'] || '') : (selectedClient['Owner Name'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Owner Name') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Barn:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.Barn || '') : (selectedClient.Barn || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Barn') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.Address || '') : (selectedClient.Address || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Address') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Email Address:</label>
              <input 
                type="email" 
                value={isEditing ? (editedClient['Email Address'] || '') : (selectedClient['Email Address'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Email Address') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Phone Number:</label>
              <input 
                type="tel" 
                value={isEditing ? (editedClient['Phone Number'] || '') : (selectedClient['Phone Number'] || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Phone Number') : undefined}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="button-group">
            {!isEditing ? (
              <>
                <Button 
                  name={'Modify Client'}
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
                  Delete Client
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

      {/* All Clients Table */}
      <h3 style={{marginTop: '2rem'}}>All Clients</h3>
      <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Owner Name</th>
            <th>Barn</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(clientItem => (
            <tr key={clientItem._id} onClick={() => handleRowClick(clientItem)}>
              <td>{clientItem.Name}</td>
              <td>{clientItem['Owner Name']}</td>
              <td>{clientItem.Barn}</td>
              <td>{clientItem['Phone Number']}</td>
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

    .client-form {
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

export default ViewClientsWithModify;

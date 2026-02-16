import React, { useEffect, useState } from 'react';
import { useGlobalContext } from '../../context/globalContext';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import Button from '../Button/Button';
import { edit, trash, plus, x } from '../../utils/Icons';

const ViewClientsWithModify = () => {
  const { getClients, clients, searchClients, updateClient, deleteClient } = useGlobalContext();
  const [searchCriteria, setSearchCriteria] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    barnContact: '',
    horseName: ''
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
    const { name, phoneNumber, email, barnContact, horseName } = searchCriteria;
    
    if (!name && !phoneNumber && !email && !barnContact && !horseName) {
      toast.error('Please enter at least one search criteria');
      return;
    }

    const results = await searchClients(name, phoneNumber, email, barnContact, horseName);
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
        phoneNumber: editedClient.PhoneNumber,
        email: editedClient.Email,
        mailingAddress: editedClient.MailingAddress,
        townStateZip: editedClient.TownStateZip,
        barnAddress: editedClient.BarnAddress,
        barnContact: editedClient.BarnContact,
        horseName: editedClient.HorseName,
        breedType: editedClient.BreedType,
        age_DOB: editedClient.Age_DOB,
        gender: editedClient.Gender,
        color: editedClient.Color,
        discipline: editedClient.Discipline,
        oftenTrainedRidden: editedClient.OftenTrainedRidden,
        medications: editedClient.Medications,
        priorInjuries: editedClient.PriorInjuries,
        concernsProblems: editedClient.ConcernsProblems,
        horseTie: editedClient.HorseTie,
        previousMassage: editedClient.PreviousMassage,
        additionalInformation: editedClient.AdditionalInformation,
        vetClinicName: editedClient.VetClinicName,
        photoVideo: editedClient.PhotoVideo,
        waiverPermission: editedClient.WaiverPermission,
        medicalConditionUpdate: editedClient.MedicalConditionUpdate,
        referralSource: editedClient.ReferralSource,
        peppermintSugarCubes: editedClient.PeppermintSugarCubes
      };

      await updateClient(selectedClient._id, updateData);
      setSelectedClient(editedClient);
      setIsEditing(false);
      
      // Refresh search results if applicable
      if (showSearchResults) {
        const { name, phoneNumber, email, barnContact, horseName } = searchCriteria;
        const results = await searchClients(name, phoneNumber, email, barnContact, horseName);
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
          const { name, phoneNumber, email, barnContact, horseName } = searchCriteria;
          const results = await searchClients(name, phoneNumber, email, barnContact, horseName);
          setSearchResults(results);
        }
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  return (
    <ViewClientsStyled>
      <div className="content-wrapper">
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
                value={searchCriteria.phoneNumber}
                name="phoneNumber"
                placeholder="Phone Number"
                onChange={handleSearchInput('phoneNumber')}
              />
            </div>
            <div className="input-control">
              <input 
                type="text"
                value={searchCriteria.email}
                name="email"
                placeholder="Email Address"
                onChange={handleSearchInput('email')}
              />
            </div>
            <div className="input-control">
              <input 
                type="text"
                value={searchCriteria.barnContact}
                name="barnContact"
                placeholder="Barn Contact"
                onChange={handleSearchInput('barnContact')}
              />
            </div>
            <div className="input-control">
              <input 
                type="text"
                value={searchCriteria.horseName}
                name="horseName"
                placeholder="Horse Name"
                onChange={handleSearchInput('horseName')}
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
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Barn Address</th>
                  <th>Barn Contact</th>
                  <th>Horse Name</th>
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
                    <td>{clientItem.PhoneNumber}</td>
                    <td>{clientItem.Email}</td>
                    <td>{clientItem.BarnAddress}</td>
                    <td>{clientItem.BarnContact}</td>
                    <td>{clientItem.HorseName}</td>
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
              <label>Phone Number:</label>
              <input 
                type="tel" 
                value={isEditing ? (editedClient.PhoneNumber || '') : (selectedClient.PhoneNumber || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('PhoneNumber') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input 
                type="email" 
                value={isEditing ? (editedClient.Email || '') : (selectedClient.Email || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Email') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Mailing Address:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.MailingAddress || '') : (selectedClient.MailingAddress || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('MailingAddress') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Town/State/Zip:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.TownStateZip || '') : (selectedClient.TownStateZip || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('TownStateZip') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Barn Address:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.BarnAddress || '') : (selectedClient.BarnAddress || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('BarnAddress') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Barn Contact:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.BarnContact || '') : (selectedClient.BarnContact || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('BarnContact') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Horse's Name:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.HorseName || '') : (selectedClient.HorseName || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('HorseName') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Breed Type:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.BreedType || '') : (selectedClient.BreedType || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('BreedType') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Age/DOB:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.Age_DOB || '') : (selectedClient.Age_DOB || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Age_DOB') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Gender:</label>
              {isEditing ? (
                <select 
                  value={editedClient.Gender || ''} 
                  onChange={handleEditInput('Gender')}
                >
                  <option value="">Select an option</option>
                  <option value="Mare">Mare</option>
                  <option value="Stallion">Stallion</option>
                  <option value="Gelding">Gelding</option>
                </select>
              ) : (
                <input type="text" value={selectedClient.Gender || ''} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Color:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.Color || '') : (selectedClient.Color || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Color') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Discipline:</label>
              {isEditing ? (
                <select 
                  value={editedClient.Discipline || ''} 
                  onChange={handleEditInput('Discipline')}
                >
                  <option value="">Select an option</option>
                  <option value="Dressage">Dressage</option>
                  <option value="Hunter/Jumper">Hunter/Jumper</option>
                  <option value="Western/Western Pleasure/Western Dressage">Western/Western Pleasure/Western Dressage</option>
                  <option value="Trails">Trails</option>
                  <option value="Backyard Best Friend">Backyard Best Friend</option>
                  <option value="Lesson Horse">Lesson Horse</option>
                  <option value="Eventing">Eventing</option>
                  <option value="Retired">Retired</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <input type="text" value={selectedClient.Discipline || ''} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Often Trained/Ridden:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.OftenTrainedRidden || '') : (selectedClient.OftenTrainedRidden || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('OftenTrainedRidden') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Medications:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.Medications || '') : (selectedClient.Medications || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('Medications') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Prior Injuries:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.PriorInjuries || '') : (selectedClient.PriorInjuries || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('PriorInjuries') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Concerns/Problems:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.ConcernsProblems || '') : (selectedClient.ConcernsProblems || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('ConcernsProblems') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Horse Tie:</label>
              {isEditing ? (
                <select 
                  value={editedClient.HorseTie || ''} 
                  onChange={handleEditInput('HorseTie')}
                >
                  <option value="">Select an option</option>
                  <option value="Cross">Cross</option>
                  <option value="Single">Single</option>
                  <option value="Both Cross and Single">Both Cross and Single</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <input type="text" value={selectedClient.HorseTie || ''} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Previous Massage:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.PreviousMassage || '') : (selectedClient.PreviousMassage || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('PreviousMassage') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Additional Information:</label>
              <textarea 
                value={isEditing ? (editedClient.AdditionalInformation || '') : (selectedClient.AdditionalInformation || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('AdditionalInformation') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Vet Clinic Name:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.VetClinicName || '') : (selectedClient.VetClinicName || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('VetClinicName') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Photo/Video:</label>
              {isEditing ? (
                <select 
                  value={editedClient.PhotoVideo || ''} 
                  onChange={handleEditInput('PhotoVideo')}
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <input type="text" value={selectedClient.PhotoVideo || ''} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Waiver Permission:</label>
              {isEditing ? (
                <select 
                  value={editedClient.WaiverPermission || ''} 
                  onChange={handleEditInput('WaiverPermission')}
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <input type="text" value={selectedClient.WaiverPermission || ''} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Medical Condition Update:</label>
              {isEditing ? (
                <select 
                  value={editedClient.MedicalConditionUpdate || ''} 
                  onChange={handleEditInput('MedicalConditionUpdate')}
                >
                  <option value="">Select an option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <input type="text" value={selectedClient.MedicalConditionUpdate || ''} readOnly />
              )}
            </div>
            <div className="form-group">
              <label>Referral Source:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.ReferralSource || '') : (selectedClient.ReferralSource || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('ReferralSource') : undefined}
              />
            </div>
            <div className="form-group">
              <label>Peppermint Sugar Cubes:</label>
              <input 
                type="text" 
                value={isEditing ? (editedClient.PeppermintSugarCubes || '') : (selectedClient.PeppermintSugarCubes || '')} 
                readOnly={!isEditing}
                onChange={isEditing ? handleEditInput('PeppermintSugarCubes') : undefined}
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
            <th>Phone</th>
            <th>Email</th>
            <th>Barn Address</th>
            <th>Barn Contact</th>
            <th>Horse Name</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(clientItem => (
            <tr key={clientItem._id} onClick={() => handleRowClick(clientItem)}>
              <td>{clientItem.Name}</td>
              <td>{clientItem.PhoneNumber}</td>
              <td>{clientItem.Email}</td>
              <td>{clientItem.BarnAddress}</td>
              <td>{clientItem['Barn Contact']}</td>
              <td>{clientItem.HorseName}</td>
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

export default ViewClientsWithModify;

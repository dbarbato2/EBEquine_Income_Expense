import React, { useState } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import Button from '../Button/Button';
import { plus, x } from '../../utils/Icons';
import { toast } from 'react-hot-toast';


function ClientForm() {
    const {addClient, error, setError, user} = useGlobalContext()
    const [inputState, setInputState] = useState({
        name: '',
        ownerName: '',
        barn: '',
        address: '',
        emailAddress: '',
        phoneNumber: ''
    })

    const { name, ownerName, barn, address, emailAddress, phoneNumber } = inputState;

    const handleInput = name => e => {
        setInputState({...inputState, [name]: e.target.value})
        setError('')
    }

    const formatPhoneNumber = (phone) => {
        // Remove all non-digit characters
        const cleaned = phone.replace(/\D/g, '');
        
        // Check if we have exactly 10 digits
        if (cleaned.length !== 10) {
            return null; // Invalid phone number
        }
        
        // Format as ###-###-####
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    const handleSubmit = e => {
        e.preventDefault()
        
        // Validate and format phone number if provided
        if (phoneNumber) {
            const formattedPhone = formatPhoneNumber(phoneNumber);
            if (!formattedPhone) {
                setError('Phone number must be 10 digits');
                return;
            }
            // Update the phone number with formatted version
            const updated = {...inputState, phoneNumber: formattedPhone, userid: user}
            addClient(updated)
        } else {
            const updated = {...inputState, userid: user}
            addClient(updated)
        }
        
        setInputState({
            name: '',
            ownerName: '',
            barn: '',
            address: '',
            emailAddress: '',
            phoneNumber: ''
        })
    }

    const handleReset = e => {
        e.preventDefault()
        setInputState({
            name: '',
            ownerName: '',
            barn: '',
            address: '',
            emailAddress: '',
            phoneNumber: ''
        })
        setError('')
        toast.success('Form reset successfully!')
    }

    return (
        <FormStyled onSubmit={handleSubmit}>
            {error && <p className='error'>{error}</p>}
            <div className="input-control">
                <input 
                    type="text" 
                    value={name}
                    name={'name'} 
                    placeholder="Client Name"
                    onChange={handleInput('name')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={ownerName}
                    name={'ownerName'} 
                    placeholder="Owner Name"
                    onChange={handleInput('ownerName')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={barn}
                    name={'barn'} 
                    placeholder="Barn"
                    onChange={handleInput('barn')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={address}
                    name={'address'} 
                    placeholder="Address"
                    onChange={handleInput('address')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="email" 
                    value={emailAddress}
                    name={'emailAddress'} 
                    placeholder="Email Address"
                    onChange={handleInput('emailAddress')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="tel" 
                    value={phoneNumber}
                    name={'phoneNumber'} 
                    placeholder="Phone Number"
                    onChange={handleInput('phoneNumber')}
                />
            </div>
            <div className="submit-btn">
                <Button 
                    name={'Add Client'}
                    icon={plus}
                    bPad={'.8rem 1.6rem'}
                    bRad={'30px'}
                    bg={'var(--color-green)'}
                    color={'#fff'}
                />
                <button 
                    type="button"
                    onClick={handleReset}
                    className="reset-form-btn"
                >
                    {x}
                    Reset Form
                </button>
            </div>
        </FormStyled>
    )
}


const FormStyled = styled.form`
    display: flex;
    flex-direction: column;
    gap: 2rem;
    input, textarea, select{
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
    .input-control{
        input{
            width: 100%;
        }
    }

    .submit-btn{
        display: flex;
        gap: 1rem;
        button{
            box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
            &:hover{
                background: var(--color-green) !important;
            }
        }
        .reset-form-btn{
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
            &:hover{
                background: #c82333 !important;
            }
        }
    }
`;

export default ClientForm

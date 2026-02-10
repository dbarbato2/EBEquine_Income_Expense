import React, { useState } from 'react'
import styled from 'styled-components'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import { useGlobalContext } from '../../context/globalContext';
import Button from '../Button/Button';
import { plus, x } from '../../utils/Icons';
import { toast } from 'react-hot-toast';


function RevenueForm() {
    const {addRevenue, error, setError, user} = useGlobalContext()
    const [inputState, setInputState] = useState({
        date: '',
        client: '',
        service: '1 Hour Massage',
        quantity: '',
        addOnService: '',
        serviceLocation: '',
        serviceFee: '',
        travelFee: '',
        discount: '',
        discountReason: '',
        paymentType: '',
        transactionFee: '',
        actualRevenue: '',
        invoiceNumber: ''
    })
    
    const [showInvoiceModal, setShowInvoiceModal] = useState(false)

    const { date, client, service, quantity, addOnService, serviceLocation, serviceFee, travelFee, discount, discountReason, paymentType, transactionFee, actualRevenue, invoiceNumber } = inputState;

    const handleInput = name => e => {
        setInputState({...inputState, [name]: e.target.value})
        setError('')
    }

    const fetchAndPopulateInvoiceNumber = async (invoiceType) => {
        try {
            const endpoint = invoiceType === 'individual' 
                ? 'get-max-individual-invoice' 
                : 'get-max-monthly-invoice'
            
            // console.log('Fetching invoice number for type:', invoiceType, 'endpoint:', endpoint);
            const response = await fetch(`http://localhost:5001/api/v1/${endpoint}?userid=${user}`);
            const data = await response.json();
            // console.log('Response data:', data);
            
            if (data.nextInvoiceNumber !== undefined) {
                // console.log('Setting invoice number to:', data.nextInvoiceNumber);
                setInputState(prevState => ({
                    ...prevState,
                    invoiceNumber: String(data.nextInvoiceNumber)
                }))
            } else {
                // console.log('No nextInvoiceNumber in response');
            }
        } catch (error) {
            console.error('Error fetching max invoice number:', error);
        }
    }
    
    const handleInvoiceTypeSelect = (invoiceType) => {
        fetchAndPopulateInvoiceNumber(invoiceType)
        setShowInvoiceModal(false)
    }

    const handleSubmit = e => {
        e.preventDefault()
        // Convert date object to ISO string if it exists
        const dateToSend = date ? new Date(date).toISOString() : ''
        const updated = {...inputState, date: dateToSend, userid: user}
        addRevenue(updated).then(success => {
            if (success) {
                setInputState({
                    date: '',
                    client: '',
                    service: '1 Hour Massage',
                    quantity: '',
                    addOnService: '',
                    serviceLocation: '',
                    serviceFee: '',
                    travelFee: '',
                    discount: '',
                    discountReason: '',
                    paymentType: '',
                    transactionFee: '',
                    actualRevenue: '',
                    invoiceNumber: ''
                })
            }
        })
    }

    const handleReset = e => {
        e.preventDefault()
        setInputState({
            date: '',
            client: '',
            service: '1 Hour Massage',
            quantity: '',
            addOnService: '',
            serviceLocation: '',
            serviceFee: '',
            travelFee: '',
            discount: '',
            discountReason: '',
            paymentType: '',
            transactionFee: '',
            actualRevenue: '',
            invoiceNumber: ''
        })
        setError('')
        toast.success('Form reset successfully!')
    }

    return (
        <FormStyled onSubmit={handleSubmit}>
            {error && <p className='error'>{error}</p>}
            <div className="input-control">
                <DatePicker 
                    id='date'
                    placeholderText='Enter A Date'
                    selected={date}
                    dateFormat="MM/dd/yyyy"
                    onChange={(date) => {
                        setInputState({...inputState, date: date})
                        setShowInvoiceModal(true)
                    }}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={client}
                    name={'client'} 
                    placeholder="Client Name"
                    onChange={handleInput('client')}
                />
            </div>
            <div className="selects input-control">
                <select value={service} name="service" id="service" onChange={handleInput('service')}>
                    <option value="Introductory Massage">Introductory Massage</option>
                    <option value="1 Hour Massage">1 Hour Massage</option>
                    <option value="Kinesiology Tape">Kinesiology Tape</option>
                    <option value="8 Hours Teaching">8 Hours Teaching</option>
                    <option value="Gift Certificate">Gift Certificate</option>
                </select>
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={quantity}
                    name={'quantity'} 
                    placeholder="Quantity"
                    onChange={handleInput('quantity')}
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={addOnService}
                    name={'addOnService'} 
                    placeholder="Add On Service"
                    onChange={handleInput('addOnService')}
                />
            </div>
            <div className="selects input-control">
                <select value={serviceLocation} name="serviceLocation" id="serviceLocation" onChange={handleInput('serviceLocation')} required>
                    <option value="" disabled>Select Service Location</option>
                    <option value="MA">MA</option>
                    <option value="NH">NH</option>
                    <option value="NJ">NJ</option>
                    <option value="FL">FL</option>
                </select>
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={serviceFee}
                    name={'serviceFee'} 
                    placeholder="Service Fee"
                    onChange={handleInput('serviceFee')}
                    step="0.01"
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={travelFee}
                    name={'travelFee'} 
                    placeholder="Travel Fee"
                    onChange={handleInput('travelFee')}
                    step="0.01"
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={discount}
                    name={'discount'} 
                    placeholder="Discount"
                    onChange={handleInput('discount')}
                    step="0.01"
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={discountReason}
                    name={'discountReason'} 
                    placeholder="Discount Reason"
                    onChange={handleInput('discountReason')}
                />
            </div>
            <div className="selects input-control">
                <select value={paymentType} name="paymentType" id="paymentType" onChange={handleInput('paymentType')} required>
                    <option value="" disabled>Select Payment Type</option>
                    <option value="Venmo">Venmo</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Gift Certificate">Gift Certificate</option>
                </select>
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={transactionFee}
                    name={'transactionFee'} 
                    placeholder="Transaction Fee"
                    onChange={handleInput('transactionFee')}
                    step="0.01"
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="number" 
                    value={actualRevenue}
                    name={'actualRevenue'} 
                    placeholder="Actual Revenue"
                    onChange={handleInput('actualRevenue')}
                    step="0.01"
                    min="0"
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={invoiceNumber}
                    name={'invoiceNumber'} 
                    placeholder="Invoice Number"
                    onChange={handleInput('invoiceNumber')}
                />
                <p className="input-note">Invoice Number populated automatically, but can be edited</p>
            </div>
            <div className="submit-btn">
                <Button 
                    name={'Add Revenue'}
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
            
            {showInvoiceModal && (
                <InvoiceModalOverlay>
                    <InvoiceModal>
                        <h3>Select Invoice Type</h3>
                        <p>What type of invoice would you like to create?</p>
                        <div className="modal-buttons">
                            <button 
                                className="modal-btn individual-btn"
                                onClick={() => handleInvoiceTypeSelect('individual')}
                            >
                                Individual Invoice
                            </button>
                            <button 
                                className="modal-btn monthly-btn"
                                onClick={() => handleInvoiceTypeSelect('monthly')}
                            >
                                Monthly Invoice
                            </button>
                        </div>
                    </InvoiceModal>
                </InvoiceModalOverlay>
            )}
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
        .input-note{
            font-size: 0.85rem;
            color: rgba(34, 34, 96, 0.6);
            margin-top: 0.3rem;
            margin-left: 0.1rem;
        }
    }

    .selects{
        display: flex;
        justify-content: flex-start;
        select{
            color: rgba(34, 34, 96, 0.9);
            &:invalid{
                color: rgba(34, 34, 96, 0.4);
            }
            &:focus, &:active{
                color: rgba(34, 34, 96, 1);
            }
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

const InvoiceModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const InvoiceModal = styled.div`
    background: white;
    border-radius: 10px;
    padding: 2rem;
    box-shadow: 0px 10px 40px rgba(0, 0, 0, 0.2);
    max-width: 400px;
    width: 90%;
    text-align: center;
    
    h3 {
        margin: 0 0 1rem 0;
        color: rgba(34, 34, 96, 0.9);
        font-size: 1.5rem;
    }
    
    p {
        color: rgba(34, 34, 96, 0.6);
        margin: 0 0 2rem 0;
        font-size: 0.95rem;
    }
    
    .modal-buttons {
        display: flex;
        gap: 1rem;
        flex-direction: column;
    }
    
    .modal-btn {
        padding: 0.8rem 1.6rem;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        cursor: pointer;
        font-size: 1rem;
        font-family: inherit;
        transition: all 0.3s ease;
        box-shadow: 0px 1px 15px rgba(0, 0, 0, 0.06);
        
        &:hover {
            transform: translateY(-2px);
            box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.12);
        }
    }
    
    .individual-btn {
        background: var(--color-green);
        color: #fff;
        
        &:hover {
            background: #3ddb66;
        }
    }
    
    .monthly-btn {
        background: #6c63ff;
        color: #fff;
        
        &:hover {
            background: #5651d8;
        }
    }
`;

export default RevenueForm


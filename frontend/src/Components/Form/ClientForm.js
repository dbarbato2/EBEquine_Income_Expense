import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import Button from '../Button/Button';
import { plus, x } from '../../utils/Icons';
import { toast } from 'react-hot-toast';


function ClientForm() {
    const {addClient, error, setError, user} = useGlobalContext()
    const [inputState, setInputState] = useState({
        Name: '',
        PhoneNumber: '',
        MailingAddress: '',
        TownStateZip: '',
        Email: '',
        BarnAddress: '',
        BarnContact: '',
        HorseName: '',
        BreedType: '',
        Age_DOB: '',
        Gender: '',
        Color: '',
        Discipline: '',
        OftenTrainedRidden: '',
        Medications: '',
        PriorInjuries: '',
        ConcernsProblems: '',
        HorseTie: '',
        PreviousMassage: '',
        AdditionalInformation: '',
        VetClinicName: '',
        PhotoVideo: '',
        WaiverPermission: '',
        MedicalConditionUpdate: '',
        ReferralSource: '',
        PeppermintSugarCubes: ''
    })

    useEffect(() => {
        // Clear any previous errors when component mounts
        setError('')
    }, [setError])

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
        
        // Validate required fields
        const missingFields = [];
        if (!inputState.Name.trim()) {
            missingFields.push('Client Name');
        }
        if (!inputState.HorseName.trim()) {
            missingFields.push('Horse\'s Name');
        }
        
        if (missingFields.length > 0) {
            setError(`${missingFields.join(' and ')} ${missingFields.length > 1 ? 'are' : 'is'} required`);
            return;
        }
        
        // Create timestamp in MM/D/YY H:MM AM/PM format
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const year = now.getFullYear().toString().slice(-2);
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        const timestamp = `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
        
        // Validate and format phone number if provided
        if (inputState.PhoneNumber) {
            const formattedPhone = formatPhoneNumber(inputState.PhoneNumber);
            if (!formattedPhone) {
                setError('Phone number must be 10 digits');
                return;
            }
            // Update the phone number with formatted version and add timestamp
            const updated = {...inputState, PhoneNumber: formattedPhone, userid: user, Timestamp: timestamp}
            addClient(updated).then(success => {
                if (success) {
                    resetForm()
                }
            })
        } else {
            const updated = {...inputState, userid: user, Timestamp: timestamp}
            addClient(updated).then(success => {
                if (success) {
                    resetForm()
                }
            })
        }
    }

    const resetForm = () => {
        setInputState({
            Name: '',
            PhoneNumber: '',
            MailingAddress: '',
            TownStateZip: '',
            Email: '',
            BarnAddress: '',
            BarnContact: '',
            HorseName: '',
            BreedType: '',
            Age_DOB: '',
            Gender: '',
            Color: '',
            Discipline: '',
            OftenTrainedRidden: '',
            Medications: '',
            PriorInjuries: '',
            ConcernsProblems: '',
            HorseTie: '',
            PreviousMassage: '',
            AdditionalInformation: '',
            VetClinicName: '',
            PhotoVideo: '',
            WaiverPermission: '',
            MedicalConditionUpdate: '',
            ReferralSource: '',
            PeppermintSugarCubes: ''
        })
        setError('')
    }

    const handleReset = e => {
        e.preventDefault()
        resetForm()
        toast.success('Form reset successfully!')
    }

    return (
        <FormStyled onSubmit={handleSubmit}>
            {error && <p className='error'>{error}</p>}
            
            <h3>Contact Information</h3>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.Name}
                    name={'Name'} 
                    placeholder="Name"
                    onChange={handleInput('Name')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="tel" 
                    value={inputState.PhoneNumber}
                    name={'PhoneNumber'} 
                    placeholder="Phone Number"
                    onChange={handleInput('PhoneNumber')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="email" 
                    value={inputState.Email}
                    name={'Email'} 
                    placeholder="Email Address"
                    onChange={handleInput('Email')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.MailingAddress}
                    name={'MailingAddress'} 
                    placeholder="Mailing Address"
                    onChange={handleInput('MailingAddress')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.TownStateZip}
                    name={'TownStateZip'} 
                    placeholder="Town, State, Zip"
                    onChange={handleInput('TownStateZip')}
                />
            </div>

            <h3>Barn Information</h3>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.BarnAddress}
                    name={'BarnAddress'} 
                    placeholder="Barn Street Address and Town"
                    onChange={handleInput('BarnAddress')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.BarnContact}
                    name={'BarnContact'} 
                    placeholder="Barn contact (responsible for your horse if you are not present)"
                    onChange={handleInput('BarnContact')}
                />
            </div>

            <h3>Horse Information</h3>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.HorseName}
                    name={'HorseName'} 
                    placeholder="Horse's Name"
                    onChange={handleInput('HorseName')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.BreedType}
                    name={'BreedType'} 
                    placeholder="Breed/Type"
                    onChange={handleInput('BreedType')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.Age_DOB}
                    name={'Age_DOB'} 
                    placeholder="Age or Date of Birth"
                    onChange={handleInput('Age_DOB')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.Color}
                    name={'Color'} 
                    placeholder="Color"
                    onChange={handleInput('Color')}
                />
            </div>
            <div className="input-control" style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Gender</label>
                <select 
                    value={inputState.Gender}
                    name={'Gender'} 
                    onChange={handleInput('Gender')}
                >
                    <option value="">Select an option</option>
                    <option value="Mare">Mare</option>
                    <option value="Stallion">Stallion</option>
                    <option value="Gelding">Gelding</option>
                </select>
            </div>
            <div className="input-control" style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Discipline</label>
                <select 
                    value={inputState.Discipline}
                    name={'Discipline'} 
                    onChange={handleInput('Discipline')}
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
            </div>

            <h3>Health & Training Information</h3>
            <div className="input-control">
                <textarea 
                    value={inputState.OftenTrainedRidden}
                    name={'OftenTrainedRidden'} 
                    placeholder="How often is your horse trained/worked/ridden?"
                    onChange={handleInput('OftenTrainedRidden')}
                    rows="3"
                />
            </div>
            <div className="input-control">
                <textarea 
                    value={inputState.Medications}
                    name={'Medications'} 
                    placeholder="List any medications, supplements, treatments, or other body work modalities (chiropractics, PEMF, light therapies, etc) your horse receives"
                    onChange={handleInput('Medications')}
                    rows="3"
                />
            </div>
            <div className="input-control">
                <textarea 
                    value={inputState.PriorInjuries}
                    name={'PriorInjuries'} 
                    placeholder="Prior Injuries or Falls"
                    onChange={handleInput('PriorInjuries')}
                    rows="3"
                />
            </div>
            <div className="input-control">
                <textarea 
                    value={inputState.ConcernsProblems}
                    name={'ConcernsProblems'} 
                    placeholder="Any concerns or problems (include issues under saddle, if any)"
                    onChange={handleInput('ConcernsProblems')}
                    rows="3"
                />
            </div>
            <div className="input-control" style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>Will your horse tie?</label>
                <select 
                    value={inputState.HorseTie}
                    name={'HorseTie'} 
                    onChange={handleInput('HorseTie')}
                >
                    <option value="">Select an option</option>
                    <option value="Cross">Cross</option>
                    <option value="Single">Single</option>
                    <option value="Both Cross and Single">Both Cross and Single</option>
                    <option value="No">No</option>
                </select>
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.PreviousMassage}
                    name={'PreviousMassage'} 
                    placeholder="Has your horse had a massage before?"
                    onChange={handleInput('PreviousMassage')}
                />
            </div>

            <h3>Additional Information</h3>
            <div className="input-control">
                <textarea 
                    value={inputState.AdditionalInformation}
                    name={'AdditionalInformation'} 
                    placeholder="Anything else you feel I should know about your horse?"
                    onChange={handleInput('AdditionalInformation')}
                    rows="4"
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.VetClinicName}
                    name={'VetClinicName'} 
                    placeholder="Veterinarian Name/Clinic Name"
                    onChange={handleInput('VetClinicName')}
                />
            </div>
            <div className="input-control" style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>May I have your consent to photograph/video your horse for his or her file or EB Equine, LLC business social media?</label>
                <select 
                    value={inputState.PhotoVideo}
                    name={'PhotoVideo'} 
                    onChange={handleInput('PhotoVideo')}
                >
                    <option value="">Select an option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>
            <div className="input-control" style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>I understand that massage and kinesiology taping are not replacements for professional veterinary medical care. I am giving Erin Barbato, EB Equine, LLC permission to massage and/or tape my horse.</label>
                <select 
                    value={inputState.WaiverPermission}
                    name={'WaiverPermission'} 
                    onChange={handleInput('WaiverPermission')}
                >
                    <option value="">Select an option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>
            <div className="input-control" style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ marginBottom: '0.5rem', color: 'var(--text-color)' }}>I will keep Erin Barbato, of EB Equine, LLC updated should my horse's medical condition change.</label>
                <select 
                    value={inputState.MedicalConditionUpdate}
                    name={'MedicalConditionUpdate'} 
                    onChange={handleInput('MedicalConditionUpdate')}
                >
                    <option value="">Select an option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.ReferralSource}
                    name={'ReferralSource'} 
                    placeholder="Whom may I thank for referring you to EB Equine?"
                    onChange={handleInput('ReferralSource')}
                />
            </div>
            <div className="input-control">
                <input 
                    type="text" 
                    value={inputState.PeppermintSugarCubes}
                    name={'PeppermintSugarCubes'} 
                    placeholder="Can your horse have Peppermints or Sugar Cubes?"
                    onChange={handleInput('PeppermintSugarCubes')}
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
    
    h3 {
        color: var(--text-color);
        margin: 1rem 0 0.5rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 0.5rem;
    }

    input, textarea, select{
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
            opacity: 0.5;
        }
    }
    .input-control{
        input, textarea{
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

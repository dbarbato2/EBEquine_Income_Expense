import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import { InnerLayout } from '../../styles/Layouts';
import DeductionForm from '../Form/DeductionForm';
import Button from '../Button/Button';
import { plus } from '../../utils/Icons';
import QuarterlyDeductionModal from './QuarterlyDeductionModal';

function Deductions() {
    const {getDeductions} = useGlobalContext()
    const [showQuarterlyModal, setShowQuarterlyModal] = useState(false)

    useEffect(() =>{
        getDeductions()
    }, [])
    return (
        <RevenueStyled>
            <InnerLayout>
                <h1>Add Deductions</h1>
                <div className="quarterly-btn-row">
                    <Button
                        name={'Add Quarterly House Deductions'}
                        icon={plus}
                        bPad={'.8rem 1.6rem'}
                        bRad={'30px'}
                        bg={'var(--color-green)'}
                        color={'#fff'}
                        onClick={() => setShowQuarterlyModal(true)}
                    />
                </div>
                <div className="form-container">
                    <DeductionForm />
                </div>
                {showQuarterlyModal && (
                    <QuarterlyDeductionModal onClose={() => setShowQuarterlyModal(false)} />
                )}
            </InnerLayout>
        </RevenueStyled>
    )
}

const RevenueStyled = styled.div`
    display: flex;
    overflow: auto;
    .quarterly-btn-row {
        margin-bottom: 1.5rem;
    }
    .form-container {
        background: var(--card-bg);
        border: 2px solid var(--border-color);
        backdrop-filter: blur(4.5px);
        border-radius: 32px;
        padding: 1.5rem;
        margin-bottom: 2rem;
    }
    .revenue-content{
        display: flex;
        gap: 2rem;
        .revenue{
            flex: 1;
        }
    }
`;

export default Deductions
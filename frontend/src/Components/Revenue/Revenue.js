import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useGlobalContext } from '../../context/globalContext';
import { InnerLayout } from '../../styles/Layouts';
import RevenueForm from '../Form/RevenueForm';

function Revenue() {
    const {getRevenue, user} = useGlobalContext()

    // Log the user ID to verify it's set correctly
    console.log('Current user ID:', user)

    useEffect(() =>{
        if (user) {
            getRevenue()
        }
    }, [user, getRevenue])
    return (
        <RevenueStyled>
            <InnerLayout>
                <h1>Add Revenue</h1>
                <div className="form-container">
                    <RevenueForm />
                </div>
            </InnerLayout>
        </RevenueStyled>
    )
}

const RevenueStyled = styled.div`
    display: flex;
    overflow: auto;
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

export default Revenue
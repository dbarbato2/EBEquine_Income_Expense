import React from 'react'
import styled from 'styled-components'
import { InnerLayout } from '../../styles/Layouts';
import ClientForm from '../Form/ClientForm';

function Clients() {
    return (
        <ClientsStyled>
            <InnerLayout>
                <h1>Add Client</h1>
                <div className="form-container">
                    <ClientForm />
                </div>
            </InnerLayout>
        </ClientsStyled>
    )
}

const ClientsStyled = styled.div`
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
`;

export default Clients

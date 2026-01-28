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
`;

export default Clients

import React from 'react';
import styled from 'styled-components';
import { previewInvoice, downloadInvoice, printInvoice } from './InvoiceGenerator';
import { x } from '../../utils/Icons';

const InvoiceModal = ({ isOpen, onClose, revenueData, clientData }) => {
  if (!isOpen || !revenueData) return null;

  const handlePreview = async () => {
    await previewInvoice(revenueData, clientData);
  };

  const handleDownload = async () => {
    await downloadInvoice(revenueData, clientData);
  };

  const handlePrint = async () => {
    await printInvoice(revenueData, clientData);
  };

  // Format currency for display
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `$${num.toFixed(2)}`;
  };

  // Helper function to safely parse currency values
  const parseValue = (value) => {
    if (!value || value === 'N/A' || value === '') return 0;
    const numStr = value.toString().replace('$', '').trim();
    const num = parseFloat(numStr);
    return isNaN(num) ? 0 : num;
  };

  // Calculate Balance = Service Fee + Travel Fee - Discount
  const calculateBalance = () => {
    const serviceFee = parseValue(revenueData['Service Fee']);
    const travelFee = parseValue(revenueData['Travel Fee']);
    const discount = parseValue(revenueData.Discount);
    const balance = serviceFee + travelFee - discount;
    return `$${balance.toFixed(2)}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Invoice</h2>
          <button className="close-btn" onClick={onClose}>
            {x}
          </button>
        </div>
        
        <div className="modal-body">
          <p className="question">Would you like to create an invoice for this transaction?</p>
          
          <div className="invoice-preview">
            <h3>Invoice Details</h3>
            <div className="preview-grid">
              <div className="preview-item">
                <span className="label">Invoice #:</span>
                <span className="value">{revenueData['Invoice Number'] || 'N/A'}</span>
              </div>
              <div className="preview-item">
                <span className="label">Date:</span>
                <span className="value">{formatDate(revenueData.Date)}</span>
              </div>
              <div className="preview-item">
                <span className="label">Client:</span>
                <span className="value">{revenueData.Client || 'N/A'}</span>
              </div>
              <div className="preview-item">
                <span className="label">Service:</span>
                <span className="value">{revenueData.Service || 'N/A'}</span>
              </div>
              <div className="preview-item">
                <span className="label">Location:</span>
                <span className="value">{revenueData['Service Location'] || 'N/A'}</span>
              </div>
              <div className="preview-item">
                <span className="label">Total:</span>
                <span className="value total">{calculateBalance()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-preview" onClick={handlePreview}>
            👁️ Preview
          </button>
          <button className="btn btn-print" onClick={handlePrint}>
            🖨️ Print
          </button>
          <button className="btn btn-download" onClick={handleDownload}>
            ⬇️ Download PDF
          </button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 20px;
  overflow-y: auto;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    background: linear-gradient(135deg, #283595 0%, #1a237e 100%);
    border-radius: 12px 12px 0 0;

    h2 {
      margin: 0;
      color: white;
      font-size: 1.5rem;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      color: white;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      svg {
        width: 20px;
        height: 20px;
      }
    }
  }

  .modal-body {
    padding: 1.5rem;

    .question {
      font-size: 1.1rem;
      color: #333;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .invoice-preview {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.25rem;
      border: 1px solid #e9ecef;

      h3 {
        margin: 0 0 1rem 0;
        color: #283595;
        font-size: 1rem;
        border-bottom: 2px solid #283595;
        padding-bottom: 0.5rem;
      }

      .preview-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;

        .preview-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .label {
            font-size: 0.75rem;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .value {
            font-size: 0.95rem;
            color: #333;
            font-weight: 500;

            &.total {
              color: #283595;
              font-size: 1.1rem;
              font-weight: 700;
            }
          }
        }
      }
    }
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid #eee;
    background: #f8f9fa;
    border-radius: 0 0 12px 12px;
    flex-wrap: wrap;

    .btn {
      padding: 0.6rem 1.2rem;
      border-radius: 6px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &.btn-secondary {
        background: #e9ecef;
        color: #495057;

        &:hover {
          background: #dee2e6;
        }
      }

      &.btn-preview {
        background: #17a2b8;
        color: white;

        &:hover {
          background: #138496;
        }
      }

      &.btn-print {
        background: #6c757d;
        color: white;

        &:hover {
          background: #5a6268;
        }
      }

      &.btn-download {
        background: #283595;
        color: white;

        &:hover {
          background: #1a237e;
        }
      }
    }
  }

  @media (max-width: 480px) {
    .modal-footer {
      justify-content: center;
      
      .btn {
        flex: 1;
        min-width: 100px;
        justify-content: center;
      }
    }

    .modal-body .invoice-preview .preview-grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default InvoiceModal;

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { x } from '../../utils/Icons';
import invoiceLogo from '../../img/invoiceLogo.png';

const InvoiceModal = ({ isOpen, onClose, revenueData, clientData }) => {
  const parseValue = (value) => {
    if (!value || value === 'N/A' || value === '') return 0;
    const numStr = value.toString().replace('$', '').trim();
    const num = parseFloat(numStr);
    return isNaN(num) ? 0 : num;
  };

  const fmt = (num) => `$${parseFloat(num || 0).toFixed(2)}`;

  const [fields, setFields] = useState({
    invoiceNumber: revenueData?.['Invoice Number'] || '',
    date: revenueData?.Date
      ? moment.utc(revenueData.Date).format('MMMM D, YYYY')
      : '',
    clientName: clientData?.Name || '',
    horseName: clientData?.HorseName || revenueData?.Client || '',
    barnAddress: clientData?.BarnAddress || '',
    service: revenueData?.Service || '',
    addOnService: revenueData?.['Add-On Service'] || '',
    addOnLabel: revenueData?.['Add-On Service'] ? `Add-On: ${revenueData['Add-On Service']}` : '',
    addOnQty: '1',
    addOnAmount: '0.00',
    quantity: revenueData?.Quantity || '1',
    serviceFee: parseValue(revenueData?.['Service Fee']).toFixed(2),
    travelFee: parseValue(revenueData?.['Travel Fee']).toFixed(2),
    travelFeeLabel: 'Travel Fee',
    travelFeeQty: '1',
    discount: parseValue(revenueData?.Discount).toFixed(2),
    discountReason: revenueData?.['Discount Reason'] || '',
    discountLabel: revenueData?.['Discount Reason'] ? `Discount (${revenueData['Discount Reason']})` : 'Discount',
    discountQty: '1',
    notes: '',
    project: revenueData?.Service || '',
    dueDate: revenueData?.Date
      ? moment.utc(revenueData.Date).format('MMMM D, YYYY')
      : '',
  });

  const [extraRows, setExtraRows] = useState([]);

  useEffect(() => {
    if (!revenueData) return;
    setFields({
      invoiceNumber: revenueData['Invoice Number'] || '',
      date: revenueData.Date
        ? moment.utc(revenueData.Date).format('MMMM D, YYYY')
        : '',
      clientName: clientData?.Name || '',
      horseName: clientData?.HorseName || revenueData.Client || '',
      barnAddress: clientData?.BarnAddress || '',
      service: revenueData.Service || '',
      addOnService: revenueData['Add-On Service'] || '',
      addOnLabel: revenueData['Add-On Service'] ? `Add-On: ${revenueData['Add-On Service']}` : '',
      addOnQty: '1',
      addOnAmount: '0.00',
      quantity: revenueData.Quantity || '1',
      serviceFee: parseValue(revenueData['Service Fee']).toFixed(2),
      travelFee: parseValue(revenueData['Travel Fee']).toFixed(2),
      travelFeeLabel: 'Travel Fee',
      travelFeeQty: '1',
      discount: parseValue(revenueData.Discount).toFixed(2),
      discountReason: revenueData['Discount Reason'] || '',
      discountLabel: revenueData['Discount Reason'] ? `Discount (${revenueData['Discount Reason']})` : 'Discount',
      discountQty: '1',
      notes: '',
      project: revenueData.Service || '',
      dueDate: revenueData.Date
        ? moment.utc(revenueData.Date).format('MMMM D, YYYY')
        : '',
    });
    setExtraRows([]);
  }, [revenueData, clientData]);

  if (!isOpen || !revenueData) return null;

  const update = (field) => (e) => setFields((prev) => ({ ...prev, [field]: e.target.value }));

  const serviceFee = parseFloat(fields.serviceFee) || 0;
  const travelFee  = parseFloat(fields.travelFee)  || 0;
  const discount   = parseFloat(fields.discount)   || 0;
  const qty        = parseInt(fields.quantity)      || 1;
  const addOnFee   = parseFloat(fields.addOnAmount) || 0;
  const extraTotal = extraRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);
  const subtotal   = serviceFee + travelFee + addOnFee + extraTotal;
  const total      = subtotal - discount;
  const unitPrice  = qty > 0 ? (serviceFee) / qty : 0;

  /* ── Extra row helpers ── */
  const addExtraRow    = () => setExtraRows(prev => [...prev, { description: '', qty: '1', unitPrice: '0.00', amount: '0.00' }]);
  const updateExtraRow = (i, field) => (e) => setExtraRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: e.target.value } : r));
  const removeExtraRow = (i) => setExtraRows(prev => prev.filter((_, idx) => idx !== i));

  /* ── Due date helpers ── */
  const toISODate = (formatted) => {
    if (!formatted) return '';
    const m = moment(formatted, 'MMMM D, YYYY', true);
    return m.isValid() ? m.format('YYYY-MM-DD') : '';
  };
  const handleDueDateChange = (e) => {
    const iso = e.target.value;
    if (!iso) { setFields(prev => ({ ...prev, dueDate: '' })); return; }
    const formatted = moment(iso, 'YYYY-MM-DD').format('MMMM D, YYYY');
    setFields(prev => ({ ...prev, dueDate: formatted }));
  };

  /* ── Convert logo to base64 so it works in standalone HTML files ── */
  const getLogoDataUrl = () => new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(invoiceLogo); // fallback to bundled URL
    img.src = invoiceLogo;
  });

  /* ── Print handler ── */
  const handlePrint = async () => {
    const logoDataUrl = await getLogoDataUrl();
    const html = buildFullHTML(fields, subtotal, total, discount, qty, unitPrice, logoDataUrl, extraRows);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  /* ── Save as HTML handler ── */
  const handleSaveHTML = async () => {
    const logoDataUrl = await getLogoDataUrl();
    const html = buildFullHTML(fields, subtotal, total, discount, qty, unitPrice, logoDataUrl, extraRows);
    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `Invoice_${fields.invoiceNumber || 'draft'}_${(fields.clientName || 'client').replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <h2>Create Invoice</h2>
          <button className="close-btn" onClick={onClose}>{x}</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <p className="hint">Edit any field below before saving or printing.</p>

          <div className="inv-top-line" />

          {/* Header row */}
          <div className="inv-header">
            <div className="inv-logo-col">
              <img src={invoiceLogo} className="inv-logo" alt="EB Equine" />
            </div>
            <div className="inv-company-center">
              <strong>EB Equine, LLC</strong>
              <span>50 Constitution St., Ashland, MA 01721</span>
              <span>508-579-4348</span>
            </div>
            <div className="inv-company-right">
              <span className="venmo">Venmo @EB-Equine</span>
            </div>
          </div>

          {/* Invoice title + date */}
          <div className="inv-title-row">
            <div className="inv-title">Invoice</div>
            <input className="inv-input inv-date-input" value={fields.date} onChange={update('date')} placeholder="Date" />
          </div>

          {/* Billing */}
          <div className="inv-billing">
            <div>
              <label>Invoice for</label>
              <input className="inv-input" value={fields.clientName} onChange={update('clientName')} placeholder="Client name" />
              <input className="inv-input" value={fields.horseName} onChange={update('horseName')} placeholder="Horse name" />
              <textarea className="inv-input inv-textarea-inline" rows={2} value={fields.barnAddress} onChange={update('barnAddress')} placeholder="Barn address" />
            </div>
            <div>
              <label>Payable to</label>
              <span>Erin Barbato</span>
              <label style={{ marginTop: '1rem' }}>Project</label>
              <input className="inv-input" value={fields.project} onChange={update('project')} placeholder="Project / Service" />
            </div>
            <div>
              <label>Invoice #</label>
              <input className="inv-input" value={fields.invoiceNumber} onChange={update('invoiceNumber')} placeholder="Invoice #" />
              <label style={{ marginTop: '1rem' }}>Due Date</label>
              <input className="inv-input" type="date" value={toISODate(fields.dueDate)} onChange={handleDueDateChange} />
            </div>
          </div>

          {/* Services table */}
          <table className="inv-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><input className="inv-input" value={fields.service} onChange={update('service')} placeholder="Service" /></td>
                <td style={{ textAlign: 'right' }}>
                  <input className="inv-input number-input" type="number" min="1" value={fields.quantity} onChange={update('quantity')} />
                </td>
                <td style={{ textAlign: 'right' }}>{fmt(unitPrice)}</td>
                <td style={{ textAlign: 'right' }}>
                  <input className="inv-input number-input" type="number" step="0.01" value={fields.serviceFee} onChange={update('serviceFee')} />
                </td>
              </tr>
              {fields.addOnLabel && (
                <tr>
                  <td><input className="inv-input" value={fields.addOnLabel} onChange={update('addOnLabel')} placeholder="Add-On description" /></td>
                  <td style={{ textAlign: 'right' }}>
                    <input className="inv-input number-input" type="number" min="1" value={fields.addOnQty} onChange={update('addOnQty')} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {(() => { const q = parseFloat(fields.addOnQty)||0; const a = parseFloat(fields.addOnAmount)||0; return q > 0 ? fmt(a/q) : '-'; })()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <input className="inv-input number-input" type="number" step="0.01" value={fields.addOnAmount} onChange={update('addOnAmount')} />
                  </td>
                </tr>
              )}
              {travelFee > 0 && (
                <tr>
                  <td><input className="inv-input" value={fields.travelFeeLabel} onChange={update('travelFeeLabel')} placeholder="Travel Fee" /></td>
                  <td style={{ textAlign: 'right' }}>
                    <input className="inv-input number-input" type="number" min="1" value={fields.travelFeeQty} onChange={update('travelFeeQty')} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {(() => { const q = parseFloat(fields.travelFeeQty)||0; return q > 0 ? fmt(travelFee/q) : '-'; })()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <input className="inv-input number-input" type="number" step="0.01" value={fields.travelFee} onChange={update('travelFee')} />
                  </td>
                </tr>
              )}
              {discount > 0 && (
                <tr>
                  <td><input className="inv-input" value={fields.discountLabel} onChange={update('discountLabel')} placeholder="Discount" /></td>
                  <td style={{ textAlign: 'right' }}>
                    <input className="inv-input number-input" type="number" min="1" value={fields.discountQty} onChange={update('discountQty')} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {(() => { const q = parseFloat(fields.discountQty)||0; return q > 0 ? `-${fmt(discount/q)}` : '-'; })()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <input className="inv-input number-input" type="number" step="0.01" value={fields.discount} onChange={update('discount')} />
                  </td>
                </tr>
              )}
              {extraRows.map((row, i) => {
                const rowQty    = parseFloat(row.qty) || 0;
                const rowAmount = parseFloat(row.amount) || 0;
                const rowUnit   = rowQty > 0 ? fmt(rowAmount / rowQty) : '-';
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input className="inv-input" value={row.description} onChange={updateExtraRow(i, 'description')} placeholder="Description" style={{ flex: 1 }} />
                        <button className="remove-row-btn" onClick={() => removeExtraRow(i)} title="Remove row">✕</button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <input className="inv-input number-input" type="number" min="1" value={row.qty} onChange={updateExtraRow(i, 'qty')} />
                    </td>
                    <td style={{ textAlign: 'right' }}>{rowUnit}</td>
                    <td style={{ textAlign: 'right' }}>
                      <input className="inv-input number-input" type="number" step="0.01" value={row.amount} onChange={updateExtraRow(i, 'amount')} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button className="add-row-btn" onClick={addExtraRow}>+ Add Row</button>

          {/* Totals */}
          <div className="inv-totals">
            <div className="tot-row"><span>Subtotal:</span><span>{fmt(subtotal)}</span></div>
            {discount > 0 && <div className="tot-row discount"><span>Discount:</span><span>-{fmt(discount)}</span></div>}
            <div className="tot-row payment"><span>Payment:</span><span>{fmt(total)}</span></div>
          </div>

          {/* Notes */}
          <div className="inv-notes-section">
            <label>Notes (optional)</label>
            <textarea className="inv-textarea" value={fields.notes} onChange={update('notes')} placeholder="Add any additional notes here..." rows={3} />
          </div>

          {/* Review link */}
          <div className="inv-review">
            <a href="https://g.page/r/CWbX4_cqMq6pEAI/review" target="_blank" rel="noreferrer">Leave us a review!</a>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-save" onClick={handleSaveHTML}>💾 Save as HTML</button>
          <button className="btn btn-print" onClick={handlePrint}>🖨️ Print</button>
        </div>

      </ModalContent>
    </ModalOverlay>
  );
};

/* ─── Full HTML document (shared by print and save) ────────────────────────── */
function buildFullHTML(fields, subtotal, total, discount, qty, unitPrice, logoDataUrl, extraRows = []) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Invoice #${fields.invoiceNumber} - ${fields.clientName}</title>
  <style>
    @page{margin:0}
    *{box-sizing:border-box}
    html,body{height:100%;margin:0;padding:0;background:#fff}
    body{font-family:Arial,sans-serif;color:#333;padding:30px}
    .invoice{max-width:780px;margin:0 auto;min-height:calc(100vh - 60px);display:flex;flex-direction:column}
    .top-line{height:4px;background:#283593;margin-bottom:24px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .inv-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .inv-logo-col{display:flex;align-items:center}
    .inv-logo{max-width:380px;max-height:260px;object-fit:contain}
    .inv-title-row{display:flex;flex-direction:column;align-items:flex-start;gap:0.25rem;margin-bottom:6px}
    .inv-title{font-size:36px;font-weight:bold;color:#283593}
    .inv-date{font-size:13px;color:#e01b84;margin-top:4px}
    .inv-company-center{text-align:right;font-size:16px;line-height:1.7}
    .inv-company-center strong{font-size:22px;display:block}
    .inv-company-right{text-align:right;font-size:16px;line-height:1.7}
    .venmo{color:#6d64e8;font-weight:bold}
    .inv-billing{display:flex;justify-content:space-between;margin-top:4rem;margin-bottom:24px;font-size:12px}
    .inv-billing>div{min-width:160px}
    .inv-billing label{display:block;font-weight:bold;font-size:13px;border-bottom:1px solid #283593;margin-bottom:6px;padding-bottom:4px;color:#283593}
    table{width:100%;border-collapse:collapse;margin-top:2rem;margin-bottom:16px}
    thead tr{background:#283593 !important;color:#fff !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    th{padding:8px 10px;text-align:left;font-size:12px;background:#283593 !important;color:#fff !important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    td{padding:7px 10px;font-size:12px;border-bottom:1px solid #eee}
    tr:nth-child(even) td{background:#f4f6ff}
    td:nth-child(2),td:nth-child(3),td:nth-child(4){text-align:right}
    th:nth-child(2),th:nth-child(3),th:nth-child(4){text-align:right}
    .inv-totals{text-align:right;font-size:13px;line-height:2}
    .discount{color:#dc3545}
    .payment{font-size:22px;font-weight:bold;color:#283593}
    .payment span{color:#e01b84}
    .inv-notes{margin:16px 0;padding:10px 14px;background:#f8f9fa;border-left:3px solid #283593;font-size:12px}
    .inv-review{margin:16px 0;font-size:12px}
    .inv-review a{color:#6d64e8}
    .inv-footer{margin-top:auto;border-top:4px solid #283593;text-align:center;padding-top:12px;padding-bottom:10px;font-size:10px;color:#777}
  </style>
</head>
<body>
  <div class="invoice">
    ${buildHTMLBody(fields, subtotal, total, discount, qty, unitPrice, logoDataUrl, extraRows)}
  </div>
</body>
</html>`;
}

/* ─── Shared HTML body builder ──────────────────────────────────────────────── */
function buildHTMLBody(fields, subtotal, total, discount, qty, unitPrice, logoDataUrl, extraRows = []) {
  const fmt = (n) => `$${parseFloat(n || 0).toFixed(2)}`;
  const travelFee  = parseFloat(fields.travelFee)  || 0;
  const addOnFee   = parseFloat(fields.addOnAmount) || 0;
  const addOnQty   = parseFloat(fields.addOnQty)    || 0;
  const addOnUnit  = addOnQty > 0 ? fmt(addOnFee / addOnQty) : '-';
  const tFeeQty    = parseFloat(fields.travelFeeQty) || 0;
  const tFeeUnit   = tFeeQty > 0 ? fmt(travelFee / tFeeQty) : '-';
  const discQty    = parseFloat(fields.discountQty)  || 0;
  const discUnit   = discQty > 0 ? `-${fmt(discount / discQty)}` : '-';

  const rows = [
    `<tr><td>${fields.service}</td><td>${qty}</td><td>${fmt(unitPrice)}</td><td>${fmt(fields.serviceFee)}</td></tr>`,
    fields.addOnLabel ? `<tr><td>${fields.addOnLabel}</td><td>${fields.addOnQty}</td><td>${addOnUnit}</td><td>${fmt(addOnFee)}</td></tr>` : '',
    travelFee > 0 ? `<tr><td>${fields.travelFeeLabel}</td><td>${fields.travelFeeQty}</td><td>${tFeeUnit}</td><td>${fmt(travelFee)}</td></tr>` : '',
    discount > 0 ? `<tr><td>${fields.discountLabel}</td><td>${fields.discountQty}</td><td>${discUnit}</td><td>-${fmt(discount)}</td></tr>` : '',
    ...extraRows.map(r => {
      const rQty  = parseFloat(r.qty) || 0;
      const rAmt  = parseFloat(r.amount) || 0;
      const rUnit = rQty > 0 ? fmt(rAmt / rQty) : '-';
      return `<tr><td>${r.description}</td><td>${r.qty}</td><td>${rUnit}</td><td>${fmt(rAmt)}</td></tr>`;
    }),
  ].join('');

  return `
    <div class="top-line"></div>
    <div class="inv-header">
      <div class="inv-logo-col">
        <img src="${logoDataUrl}" class="inv-logo" alt="EB Equine" />
      </div>
      <div class="inv-company-center">
        <strong>EB Equine, LLC</strong>
        50 Constitution St., Ashland, MA 01721<br/>508-579-4348
      </div>
      <div class="inv-company-right">
        <span class="venmo">Venmo @EB-Equine</span>
      </div>
    </div>
    <div class="inv-title-row">
      <div class="inv-title">Invoice</div>
      <div class="inv-date">${fields.date}</div>
    </div>
    <div class="inv-billing">
      <div>
        <label>Invoice for</label>
        <div>${fields.clientName}</div>
        ${fields.horseName ? `<div>Re: ${fields.horseName}</div>` : ''}
        ${fields.barnAddress ? `<div style="white-space:pre-line">${fields.barnAddress}</div>` : ''}
      </div>
      <div>
        <label>Payable to</label><div>Erin Barbato</div>
        ${fields.project ? `<label style="margin-top:0.75rem;display:block">Project</label><div>${fields.project}</div>` : ''}
      </div>
      <div>
        <label>Invoice #</label><div>${fields.invoiceNumber}</div>
        ${fields.dueDate ? `<label style="margin-top:0.75rem;display:block">Due Date</label><div>${fields.dueDate}</div>` : ''}
      </div>
    </div>
    <table>
      <thead><tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="inv-totals">
      <div>Subtotal: <strong>${fmt(subtotal)}</strong></div>
      ${discount > 0 ? `<div class="discount">Discount: <strong>-${fmt(discount)}</strong></div>` : ''}
      <div class="payment">Payment: <span>${fmt(total)}</span></div>
    </div>
    ${fields.notes ? `<div class="inv-notes"><strong>Notes:</strong> ${fields.notes}</div>` : ''}
    <div class="inv-review"><a href="https://g.page/r/CWbX4_cqMq6pEAI/review">Leave us a review!</a></div>
    <div class="inv-footer">
      <p>Thank you for your business!</p>
      <p>EB Equine, LLC</p>
      <p>Questions? Contact us at erin@ebequinemassage.com</p>
    </div>
  `;
}

/* ─── Styles ─────────────────────────────────────────────────────────────────── */
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.65);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  overflow-y: auto;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 820px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 1.5rem;
    background: linear-gradient(135deg, #283595 0%, #1a237e 100%);
    border-radius: 12px 12px 0 0;
    h2 { margin: 0; color: white; font-size: 1.4rem; }
    .close-btn {
      background: rgba(255,255,255,0.2); border: none; cursor: pointer;
      padding: 0.5rem; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: white; transition: background 0.2s;
      &:hover { background: rgba(255,255,255,0.35); }
      svg { width: 18px; height: 18px; }
    }
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    max-height: 75vh;
    .hint { font-size: 0.82rem; color: #888; margin-bottom: 1rem; font-style: italic; }
  }

  .inv-top-line {
    height: 4px; background: #283593; margin-bottom: 18px; border-radius: 2px;
  }

  .inv-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
    .inv-logo-col { display: flex; align-items: center; }
    .inv-logo { max-width: 190px; max-height: 130px; object-fit: contain; }
    .inv-company-center {
      text-align: right; display: flex; flex-direction: column; font-size: 15px; line-height: 1.7;
      strong { font-size: 20px; }
    }
    .inv-company-right {
      text-align: right; display: flex; flex-direction: column; font-size: 15px; line-height: 1.7;
      .venmo { color: #6d64e8; font-weight: bold; }
    }
  }

  .inv-title-row {
    display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem; margin-bottom: 6px;
    .inv-title { font-size: 30px; font-weight: bold; color: #283593; line-height: 1; }
    .inv-date-input { color: #e01b84 !important; font-weight: 600; width: auto; }
  }

  .inv-billing {
    display: flex; gap: 2rem; margin-top: 4rem; margin-bottom: 18px; flex-wrap: wrap;
    > div { display: flex; flex-direction: column; gap: 4px; min-width: 160px; font-size: 13px; }
    label {
      font-weight: 700; color: #283593; font-size: 13px;
      border-bottom: 1px solid #283593; padding-bottom: 3px; margin-bottom: 4px;
    }
  }

  .inv-input {
    border: 1px dashed #bbb; border-radius: 4px; padding: 3px 6px;
    font-size: 13px; font-family: inherit; color: #333; background: #fafafa;
    width: 100%; box-sizing: border-box;
    &:focus { outline: none; border-color: #283593; background: #fff; }
  }

  .number-input { width: 80px; text-align: right; }
  .inline-input { width: auto; display: inline-block; font-size: 12px; }

  .inv-table {
    width: 100%; border-collapse: collapse; margin-top: 2rem; margin-bottom: 14px; font-size: 13px;
    thead tr { background: #283593 !important; }
    thead tr th { background: #283593 !important; color: white !important; padding: 7px 10px; font-weight: 600; }
    td { padding: 5px 10px; border-bottom: 1px solid #eee; vertical-align: middle; }
    tbody tr:nth-child(even) td { background: #f4f6ff; }
  }

  .inv-totals {
    display: flex; flex-direction: column; align-items: flex-end; gap: 4px; margin-bottom: 18px; font-size: 13px;
    .tot-row {
      display: flex; gap: 2rem;
      span:first-child { font-weight: 600; color: #283593; }
      span:last-child { min-width: 80px; text-align: right; }
    }
    .discount span { color: #dc3545; }
    .payment {
      font-size: 19px; font-weight: bold;
      border-top: 2px solid #ddd; padding-top: 6px; margin-top: 4px;
      span:first-child { color: #283593; }
      span:last-child { color: #e01b84; }
    }
  }

  .inv-notes-section {
    margin-bottom: 14px;
    label { display: block; font-size: 12px; font-weight: 600; color: #555; margin-bottom: 4px; }
  }

  .inv-textarea {
    width: 100%; box-sizing: border-box; font-family: inherit; font-size: 13px;
    padding: 6px 10px; border: 1px dashed #bbb; border-radius: 4px; background: #fafafa;
    resize: vertical;
    &:focus { outline: none; border-color: #283593; background: #fff; }
  }

  .inv-textarea-inline {
    resize: vertical; font-family: inherit;
  }

  .inv-review { font-size: 12px; margin-bottom: 8px; a { color: #6d64e8; text-decoration: underline; } }

  .add-row-btn {
    margin-top: 6px; margin-bottom: 6px; padding: 4px 14px; font-size: 12px; font-weight: 600;
    background: #e8eaf6; color: #283593; border: 1px dashed #283593; border-radius: 4px;
    cursor: pointer; transition: background 0.2s;
    &:hover { background: #c5cae9; }
  }

  .remove-row-btn {
    background: none; border: none; color: #c62828; cursor: pointer; font-size: 14px;
    padding: 0 2px; line-height: 1; flex-shrink: 0;
    &:hover { color: #b71c1c; }
  }

  .modal-footer {
    display: flex; justify-content: flex-end; gap: 0.75rem;
    padding: 1rem 1.5rem; border-top: 1px solid #eee;
    background: #f8f9fa; border-radius: 0 0 12px 12px; flex-wrap: wrap;
    .btn {
      padding: 0.6rem 1.2rem; border-radius: 6px; font-size: 0.9rem; font-weight: 600;
      cursor: pointer; border: none; display: flex; align-items: center; gap: 0.4rem;
      transition: filter 0.2s; &:hover { filter: brightness(0.88); }
    }
    .btn-secondary { background: #e9ecef; color: #495057; }
    .btn-save      { background: #283595; color: white; }
    .btn-print     { background: #6c757d; color: white; }
  }
`;

export default InvoiceModal;

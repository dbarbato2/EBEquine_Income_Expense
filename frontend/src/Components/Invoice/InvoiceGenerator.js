import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import invoiceLogo from '../../img/invoiceLogo.png';

// Format currency
const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return `$${num.toFixed(2)}`;
};

// Parse currency values safely
const parseValue = (value) => {
  if (!value || value === 'N/A' || value === '') return 0;
  const numStr = value.toString().replace('$', '').trim();
  const num = parseFloat(numStr);
  return isNaN(num) ? 0 : num;
};

// Convert image to data URL
const getImageDataUrl = (imgSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = imgSrc;
  });
};

// Format date for invoice
const formatInvoiceDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Generate Invoice PDF
export const generateInvoicePDF = async (revenueData, clientData = null) => {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor = [40, 53, 147]; // Blue
  const headerBg = [240, 240, 240];
  const textColor = [51, 51, 51];
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  
  // ============ HEADER SECTION ============
  // Horizontal line at very top
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(3);
  doc.line(0, 5, pageWidth, 5);
  
  // Add logo to far left
  try {
    const logoDataUrl = await getImageDataUrl(invoiceLogo);
    doc.setLineWidth(0);
    doc.addImage(logoDataUrl, 'PNG', 5, 15, 62.5, 62.5);
  } catch (error) {
    console.error('Error loading logo:', error);
  }
  
  // Company Name in bold black - right justified moved left
  doc.setFontSize(20);
  doc.setFont('roboto', 'normal');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('EB Equine, LLC', pageWidth - 90, 36, { align: 'right' });
  
  // Company Address Line 1
  doc.setFontSize(10);
  doc.setFont('roboto', 'normal');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('50 Constitution St.', pageWidth - 90, 44, { align: 'right' });
  
  // Company Address Line 2
  doc.setFontSize(10);
  doc.setFont('roboto', 'normal');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('Ashland, MA 01721', pageWidth - 90, 52, { align: 'right' });
  
  // Company Phone
  doc.setFontSize(10);
  doc.setFont('roboto', 'normal');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('508-579-4348', pageWidth - 90, 60, { align: 'right' });
  
  // Venmo text on same line as company address line 1, to the right
  doc.setFontSize(10);
  doc.setFont('roboto', 'bold');
  doc.setTextColor(109, 100, 232); // #6d64e8
  doc.text('Venmo @EB-Equine', pageWidth - margin, 36, { align: 'right' });
  
  // Invoice title - left side below logo
  doc.setFontSize(34);
  doc.setFont('roboto', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('Invoice', margin, 82);
  
  // Date in pink color
  doc.setFontSize(12);
  doc.setTextColor(224, 27, 132); // #e01b84
  doc.text(`${formatInvoiceDate(revenueData.Date)}`, margin, 90);
  
  // ============ INVOICE FOR SECTION ============
  let invoiceForY = 108;
  
  // "Invoice for" label in bold, size 12
  doc.setFontSize(12);
  doc.setFont('roboto', 'bold');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('Invoice for', margin, invoiceForY);
  
  // "Payable to" in the middle, bold, size 12
  doc.setFontSize(12);
  doc.setFont('roboto', 'bold');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('Payable to', pageWidth / 2, invoiceForY, { align: 'center' });
  
  // "Invoice #" on the right, bold, size 12
  doc.setFontSize(12);
  doc.setFont('roboto', 'bold');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('Invoice #', pageWidth - margin, invoiceForY, { align: 'right' });
  
  // Values below the headers
  let valueY = invoiceForY + 8;
  
  // Owner Name from client data below "Invoice for"
  if (clientData && clientData.Name) {
    doc.setFontSize(10);
    doc.setFont('roboto', 'normal');
    doc.setTextColor(0, 0, 0); // Black
    doc.text(clientData.Name, margin, valueY);
  }
  
  // "Erin Barbato" below "Payable to"
  doc.setFontSize(10);
  doc.setFont('roboto', 'normal');
  doc.setTextColor(0, 0, 0); // Black
  doc.text('Erin Barbato', pageWidth / 2, valueY, { align: 'center' });
  
  // Invoice Number below "Invoice #"
  doc.setFontSize(10);
  doc.setFont('roboto', 'normal');
  doc.setTextColor(0, 0, 0); // Black
  doc.text(`${revenueData['Invoice Number'] || 'N/A'}`, pageWidth - margin, valueY, { align: 'right' });
  
  // "Re:" with Horse Name below the names section
  if (clientData && clientData.HorseName) {
    doc.setFontSize(10);
    doc.setFont('roboto', 'normal');
    doc.setTextColor(0, 0, 0); // Black
    let reY = valueY + 6;
    doc.text(`Re: ${clientData.HorseName}`, margin, reY);
  }
  
  // Barn Address
  if (clientData && clientData.BarnAddress) {
    doc.setFontSize(10);
    doc.setFont('roboto', 'normal');
    doc.setTextColor(0, 0, 0); // Black
    let barnAddressY = (clientData.HorseName ? valueY + 12 : valueY + 6);
    const barnAddressLines = doc.splitTextToSize(clientData.BarnAddress, 80);
    doc.text(barnAddressLines, margin, barnAddressY);
  }
  
  // ============ SERVICES TABLE ============
  let yPos = 175;
  
  // Calculate amounts
  const serviceFee = parseValue(revenueData['Service Fee']);
  const travelFee = parseValue(revenueData['Travel Fee']);
  const discount = parseValue(revenueData.Discount);
  const transactionFee = parseValue(revenueData['Transaction Fees']);
  const quantity = parseInt(revenueData.Quantity) || 1;
  
  // Calculate balance and unit price
  const balance = serviceFee + travelFee - discount;
  const unitPrice = balance / quantity;
  
  // Table data
  const tableData = [];
  
  // Main service
  tableData.push([
    revenueData.Service || 'Service',
    quantity.toString(),
    formatCurrency(unitPrice),
    formatCurrency(serviceFee)
  ]);
  
  // Add-on service if present
  if (revenueData['Add-On Service']) {
    tableData.push([
      `Add-On: ${revenueData['Add-On Service']}`,
      '1',
      'Included',
      'Included'
    ]);
  }
  
  // Travel fee if present and greater than 0
  if (travelFee > 0) {
    tableData.push([
      'Travel Fee',
      '1',
      formatCurrency(travelFee),
      formatCurrency(travelFee)
    ]);
  }
  
  // Discount if present and greater than 0
  if (discount > 0) {
    tableData.push([
      'Discount',
      '1',
      `-${formatCurrency(discount)}`,
      `-${formatCurrency(discount)}`
    ]);
  }
  
  // Create table
  autoTable(doc, {
    startY: yPos,
    head: [['Description', 'Qty', 'Unit Price', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 11
    },
    bodyStyles: {
      fontSize: 10,
      textColor: textColor
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { left: margin, right: margin }
  });
  
  // ============ TOTALS SECTION ============
  const finalY = doc.lastAutoTable.finalY + 10;
  const totalsX = pageWidth - margin - 70;
  
  // Subtotal (Service Fee + Travel Fee)
  const subtotal = serviceFee + travelFee;
  doc.setFontSize(10);
  doc.setFont('roboto', 'normal');
  doc.setTextColor(42, 57, 144); // #2a3990
  doc.text('Subtotal:', totalsX, finalY);
  doc.text(formatCurrency(subtotal), pageWidth - margin, finalY, { align: 'right' });
  
  // Discount if present
  let currentY = finalY;
  if (discount > 0) {
    currentY += 8;
    doc.setTextColor(220, 53, 69); // Red for discount
    doc.text(`Discount${revenueData['Discount Reason'] ? ` (${revenueData['Discount Reason']})` : ''}:`, totalsX, currentY);
    doc.text(`-${formatCurrency(discount)}`, pageWidth - margin, currentY, { align: 'right' });
    doc.setTextColor(...textColor);
  }
  
  // Total line
  currentY += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(totalsX, currentY, pageWidth - margin, currentY);
  
  // Payment (Service Fee + Travel Fee - Discount)
  currentY += 10;
  doc.setFontSize(20);
  doc.setFont('roboto', 'bold');
  doc.setTextColor(42, 57, 144); // #2a3990
  doc.text('Payment:', totalsX, currentY);
  const total = subtotal - discount;
  doc.setTextColor(224, 27, 132); // #e01b84 (pink)
  doc.text(formatCurrency(total), pageWidth - margin, currentY, { align: 'right' });
  
  // ============ REVIEW LINK ============
  currentY += 25;
  doc.setFontSize(11);
  doc.setFont('roboto', 'normal');
  doc.setTextColor(109, 100, 232); // #6d64e8 (same as Venmo)
  
  // Add underlined hyperlinked text
  const reviewText = 'Leave us a review!';
  doc.textWithLink(reviewText, margin, currentY, { url: 'https://g.page/r/CWbX4_cqMq6pEAI/review' });
  
  // Add underline decoration manually
  const textWidth = doc.getTextWidth(reviewText);
  doc.setDrawColor(109, 100, 232);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY + 1, margin + textWidth, currentY + 1);
  
  // ============ FOOTER ============
  const footerY = doc.internal.pageSize.getHeight() - 30;
  
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('roboto', 'normal');
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  doc.text('EB Equine, LLC', pageWidth / 2, footerY + 6, { align: 'center' });
  doc.text('Questions? Contact us at erin@ebequinemassage.com', pageWidth / 2, footerY + 12, { align: 'center' });
  
  return doc;
};

// Preview invoice in new window
export const previewInvoice = async (revenueData, clientData = null) => {
  try {
    const doc = await generateInvoicePDF(revenueData, clientData);
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  } catch (error) {
    console.error('Error previewing invoice:', error);
    alert('Error generating invoice preview');
  }
};

// Download invoice
export const downloadInvoice = async (revenueData, clientData = null) => {
  try {
    const doc = await generateInvoicePDF(revenueData, clientData);
    const invoiceNumber = revenueData['Invoice Number'] || 'invoice';
    const clientName = revenueData.Client ? revenueData.Client.replace(/\s+/g, '_') : 'client';
    doc.save(`Invoice_${invoiceNumber}_${clientName}.pdf`);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    alert('Error generating invoice for download');
  }
};

// Print invoice
export const printInvoice = async (revenueData, clientData = null) => {
  try {
    const doc = await generateInvoicePDF(revenueData, clientData);
    doc.autoPrint();
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  } catch (error) {
    console.error('Error printing invoice:', error);
    alert('Error generating invoice for printing');
  }
};

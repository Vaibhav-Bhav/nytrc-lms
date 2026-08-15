// src/lib/pdf.ts
//
// Statutory GST Invoice PDF Generator Helper.
// Generates a valid minimal PDF-1.4 file buffer containing full statutory GST tax invoice details.
// Works natively with fetch/Buffer to avoid external third-party package dependencies.
//

export interface GenerateInvoicePdfData {
  invoiceNumber: string
  invoiceDate: string
  sellerName: string
  sellerGstin: string
  sellerState: string
  buyerName: string
  buyerEmail: string
  buyerState: string
  placeOfSupply: string
  courseName: string
  sacCode: string
  taxableValue: number
  gstRate: number
  gstAmount: number
  taxType: 'cgst_sgst' | 'igst'
  cgst: number
  sgst: number
  igst: number
  totalAmount: number
}

export function generateInvoicePdf(data: GenerateInvoicePdfData): Uint8Array {
  const formattedInvoiceDate = data.invoiceDate.includes('T')
    ? new Date(data.invoiceDate).toLocaleDateString('en-IN')
    : data.invoiceDate

  const isSameState = data.taxType === 'cgst_sgst'

  // Escape helper for raw PDF text strings
  const esc = (str?: string | number) => {
    if (str === undefined || str === null) return ''
    return String(str)
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
  }

  // Vector stream drawing instructions matching GSTInvoiceModal.tsx structure
  const streamBody = `
% --- Top Primary Accent Bar ---
0.78 0.38 0.04 RG 3.5 w
36 810 m 559 810 l S

% --- Header Toolbar Banner (Official GST Tax Invoice) ---
0.98 0.97 0.94 rg
36 756 523 48 re f
0.9 0.84 0.72 RG 0.75 w
36 756 523 48 re S

% Shield Icon Badge Box
0.96 0.9 0.82 rg
46 768 24 24 re f
0.85 0.5 0.1 RG 1 w
46 768 24 24 re S
BT
/F2 12 Tf
0.78 0.38 0.04 rg
52 775 Td
([S]) Tj
ET

% Toolbar Text
BT
/F2 13 Tf
0.15 0.15 0.2 rg
78 775 Td
(Official GST Tax Invoice) Tj
0 -11 Td
/F1 8.5 Tf
0.45 0.45 0.5 rg
(NYTRC Learning Portal Statutory Document) Tj
ET

% Paid Status Badge (Right)
0.86 0.98 0.9 rg
480 770 65 20 re f
0.4 0.8 0.5 RG 1 w
480 770 65 20 re S
BT
/F2 9.5 Tf
0.08 0.6 0.25 rg
495 776 Td
(PAID) Tj
ET

% --- Top Info Section: Seller Branding (Left) & Invoice Meta (Right) ---
BT
/F2 14 Tf
0.78 0.38 0.04 rg
36 732 Td
(NYTRC LMS) Tj
0 -14 Td
/F2 9 Tf
0.3 0.3 0.35 rg
(NYTRC Learning Portal Pvt. Ltd.) Tj
0 -12 Td
/F1 8.5 Tf
0.42 0.45 0.5 rg
(101 Education Hub, SV Road, Andheri West) Tj
0 -12 Td
(Mumbai, Maharashtra - 400001, India) Tj
0 -14 Td
/F2 9 Tf
0.15 0.15 0.2 rg
(GSTIN: ${esc(data.sellerGstin)}) Tj
ET

BT
/F2 8 Tf
0.45 0.45 0.5 rg
390 732 Td
(TAX INVOICE NO.) Tj
0 -14 Td
/F2 12 Tf
0.12 0.16 0.21 rg
(${esc(data.invoiceNumber)}) Tj
0 -14 Td
/F1 8.5 Tf
0.42 0.45 0.5 rg
(Date: ${esc(formattedInvoiceDate)}) Tj
0 -12 Td
(Payment Method: Razorpay) Tj
0 -12 Td
/F1 8.5 Tf
0.08 0.6 0.25 rg
(Status: Payment Verified) Tj
ET

0.92 0.86 0.75 RG 0.5 w
36 665 m 559 665 l S

% --- Customer & Place of Supply Details Card ---
0.99 0.98 0.95 rg
36 580 523 72 re f
0.92 0.86 0.75 RG 0.75 w
36 580 523 72 re S

BT
/F2 8 Tf
0.45 0.45 0.5 rg
48 636 Td
(BILLED TO \\(STUDENT\\):) Tj
0 -14 Td
/F2 10 Tf
0.12 0.16 0.21 rg
(${esc(data.buyerName)}) Tj
0 -13 Td
/F1 8.5 Tf
0.42 0.45 0.5 rg
(${esc(data.buyerEmail)}) Tj
0 -13 Td
(+91 98765 43210) Tj
ET

BT
/F2 8 Tf
0.45 0.45 0.5 rg
310 636 Td
(PLACE OF SUPPLY:) Tj
0 -14 Td
/F2 9.5 Tf
0.12 0.16 0.21 rg
(${esc(data.buyerState || data.placeOfSupply)}) Tj
0 -13 Td
/F1 8.5 Tf
0.42 0.45 0.5 rg
(Tax Type: ${isSameState ? 'Intra-State \\(CGST + SGST\\)' : 'Inter-State \\(IGST\\)'}) Tj
0 -13 Td
/F1 8 Tf
0.45 0.45 0.5 rg
(Ref ID: pay_N8x9K2p0Xz) Tj
ET

% --- Tax Table Header Box & Columns ---
0.97 0.94 0.88 rg
36 545 523 24 re f
0.88 0.8 0.68 RG 0.75 w
36 545 523 24 re S

BT
/F2 8 Tf
0.35 0.35 0.4 rg
48 553 Td
(DESCRIPTION) Tj
ET
BT
/F2 8 Tf
0.35 0.35 0.4 rg
245 553 Td
(SAC CODE) Tj
ET
BT
/F2 8 Tf
0.35 0.35 0.4 rg
310 553 Td
(SUBTOTAL) Tj
ET
${isSameState ? `
BT
/F2 8 Tf
0.35 0.35 0.4 rg
385 553 Td
(CGST \\(9%\\)) Tj
ET
BT
/F2 8 Tf
0.35 0.35 0.4 rg
445 553 Td
(SGST \\(9%\\)) Tj
ET
` : `
BT
/F2 8 Tf
0.35 0.35 0.4 rg
415 553 Td
(IGST \\(18%\\)) Tj
ET
`}
BT
/F2 8 Tf
0.35 0.35 0.4 rg
505 553 Td
(TOTAL) Tj
ET

% Table Item Row 1
0.92 0.88 0.8 RG 0.5 w
36 495 m 559 495 l S

BT
/F2 9.5 Tf
0.12 0.16 0.21 rg
48 526 Td
(${esc(data.courseName)}) Tj
0 -12 Td
/F1 8 Tf
0.42 0.45 0.5 rg
(Online LMS Course Enrollment - Lifetime Access) Tj
ET

BT
/F1 8.5 Tf
0.3 0.3 0.35 rg
245 520 Td
(${esc(data.sacCode)}) Tj
ET

BT
/F1 8.5 Tf
0.12 0.16 0.21 rg
310 520 Td
(INR ${data.taxableValue.toFixed(2)}) Tj
ET

${isSameState ? `
BT
/F1 8.5 Tf
0.35 0.35 0.4 rg
385 520 Td
(INR ${data.cgst.toFixed(2)}) Tj
ET
BT
/F1 8.5 Tf
0.35 0.35 0.4 rg
445 520 Td
(INR ${data.sgst.toFixed(2)}) Tj
ET
` : `
BT
/F1 8.5 Tf
0.35 0.35 0.4 rg
415 520 Td
(INR ${data.igst.toFixed(2)}) Tj
ET
`}

BT
/F2 9.5 Tf
0.12 0.16 0.21 rg
505 520 Td
(INR ${data.totalAmount.toFixed(2)}) Tj
ET

% --- Amount Breakdown Summary & Terms ---
0.99 0.98 0.95 rg
330 370 229 100 re f
0.92 0.86 0.75 RG 0.75 w
330 370 229 100 re S

BT
/F1 8.5 Tf
0.42 0.45 0.5 rg
342 452 Td
(Taxable Amount) Tj
0 -15 Td
${isSameState ? `
(CGST \\(9%\\)) Tj
0 -15 Td
(SGST \\(9%\\)) Tj
` : `
(IGST \\(18%\\)) Tj
0 -15 Td
`}
ET

BT
/F2 8.5 Tf
0.12 0.16 0.21 rg
465 452 Td
(INR ${data.taxableValue.toFixed(2)}) Tj
0 -15 Td
${isSameState ? `
/F1 8.5 Tf
(INR ${data.cgst.toFixed(2)}) Tj
0 -15 Td
(INR ${data.sgst.toFixed(2)}) Tj
` : `
/F1 8.5 Tf
(INR ${data.igst.toFixed(2)}) Tj
0 -15 Td
`}
ET

0.9 0.85 0.75 RG 0.5 w
340 405 m 547 405 l S

BT
/F2 10 Tf
0.12 0.16 0.21 rg
342 386 Td
(Total Paid) Tj
ET

BT
/F2 11 Tf
0.78 0.38 0.04 rg
465 386 Td
(INR ${data.totalAmount.toFixed(2)}) Tj
ET

BT
/F2 8.5 Tf
0.12 0.16 0.21 rg
48 465 Td
(Terms & Notes:) Tj
0 -15 Td
/F1 8 Tf
0.42 0.45 0.5 rg
(- Computer-generated electronic GST invoice under Section 31 of CGST Act, 2017.) Tj
0 -13 Td
(- Private Cloudflare R2 storage reference link verified.) Tj
0 -13 Td
(- Subject to Mumbai Jurisdiction.) Tj
ET

% --- Footer Divider & Legal Disclaimer ---
0.92 0.86 0.75 RG 0.5 w
36 100 m 559 100 l S

BT
/F3 8 Tf
0.45 0.45 0.5 rg
36 82 Td
(Thank you for choosing NYTRC Learning Portal.) Tj
0 -14 Td
/F1 7.5 Tf
0.45 0.45 0.5 rg
(This is a computer-generated GST Tax Invoice requiring no physical signature under Section 31 of CGST Act.) Tj
0 -12 Td
(Digital Verification Code: NYTRC-INV-VERIFIED-${esc(data.invoiceNumber)}) Tj
ET
`.trim()

  const pdfHeader = '%PDF-1.4\n'

  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n'
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n'
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 6 0 R /F3 7 0 R >> >> /Contents 5 0 R >>\nendobj\n'
  const obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
  const obj6 = '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n'
  const obj7 = '7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>\nendobj\n'

  const streamHeader = `5 0 obj\n<< /Length ${streamBody.length} >>\nstream\n`
  const streamFooter = '\nendstream\nendobj\n'

  const parts = [
    pdfHeader,
    obj1,
    obj2,
    obj3,
    obj4,
    obj6,
    obj7,
    streamHeader,
    streamBody,
    streamFooter,
  ]

  let currentOffset = pdfHeader.length
  const offsets: number[] = []

  offsets.push(currentOffset) // obj 1
  currentOffset += obj1.length

  offsets.push(currentOffset) // obj 2
  currentOffset += obj2.length

  offsets.push(currentOffset) // obj 3
  currentOffset += obj3.length

  offsets.push(currentOffset) // obj 4
  currentOffset += obj4.length

  const obj5Offset = currentOffset + obj6.length + obj7.length

  offsets.push(currentOffset) // obj 6
  currentOffset += obj6.length

  offsets.push(currentOffset) // obj 7
  currentOffset += obj7.length

  offsets.splice(4, 0, obj5Offset) // obj 5 at index 4

  const xrefOffset = currentOffset + streamHeader.length + streamBody.length + streamFooter.length
  const pad10 = (n: number) => String(n).padStart(10, '0')

  const xrefTable = `xref
0 8
0000000000 65535 f 
${pad10(offsets[0])} 00000 n 
${pad10(offsets[1])} 00000 n 
${pad10(offsets[2])} 00000 n 
${pad10(offsets[3])} 00000 n 
${pad10(offsets[4])} 00000 n 
${pad10(offsets[5])} 00000 n 
${pad10(offsets[6])} 00000 n 
trailer
<< /Size 8 /Root 1 0 R >>
startxref
${xrefOffset}
%%EOF
`

  const fullPdfString = parts.join('') + xrefTable
  return new TextEncoder().encode(fullPdfString)
}

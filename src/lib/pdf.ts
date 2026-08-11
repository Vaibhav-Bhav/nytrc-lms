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

export function generateInvoicePdf(data: GenerateInvoicePdfData): Buffer {
  const formattedInvoiceDate = data.invoiceDate.includes('T')
    ? new Date(data.invoiceDate).toLocaleDateString('en-IN')
    : data.invoiceDate

  const content = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 2000 >>
stream
BT
/F1 14 Tf
50 750 Td
(NYTRC LMS - GST TAX INVOICE) Tj
0 -25 Td
/F1 10 Tf
(Invoice Number: ${data.invoiceNumber}) Tj
0 -15 Td
(Invoice Date: ${formattedInvoiceDate}) Tj
0 -25 Td
(SELLER DETAILS:) Tj
0 -15 Td
(Name: ${data.sellerName}) Tj
0 -15 Td
(GSTIN: ${data.sellerGstin}) Tj
0 -15 Td
(State: ${data.sellerState}) Tj
0 -25 Td
(BUYER DETAILS:) Tj
0 -15 Td
(Name: ${data.buyerName}) Tj
0 -15 Td
(Email: ${data.buyerEmail}) Tj
0 -15 Td
(State: ${data.buyerState}) Tj
0 -15 Td
(Place of Supply: ${data.placeOfSupply}) Tj
0 -25 Td
(COURSE / SERVICE DETAILS:) Tj
0 -15 Td
(Course: ${data.courseName}) Tj
0 -15 Td
(SAC Code: ${data.sacCode}) Tj
0 -25 Td
(TAX FINANCIAL SUMMARY:) Tj
0 -15 Td
(Taxable Value: INR ${data.taxableValue.toFixed(2)}) Tj
0 -15 Td
(GST Rate: ${(data.gstRate * 100).toFixed(0)}%) Tj
0 -15 Td
(Tax Type: ${data.taxType === 'cgst_sgst' ? 'CGST + SGST (Intrastate)' : 'IGST (Interstate)'}) Tj
0 -15 Td
(CGST: INR ${data.cgst.toFixed(2)}) Tj
0 -15 Td
(SGST: INR ${data.sgst.toFixed(2)}) Tj
0 -15 Td
(IGST: INR ${data.igst.toFixed(2)}) Tj
0 -15 Td
(Total Tax: INR ${data.gstAmount.toFixed(2)}) Tj
0 -20 Td
/F1 12 Tf
(GRAND TOTAL: INR ${data.totalAmount.toFixed(2)}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000213 00000 n 
0000000282 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
2350
%%EOF
  `.trim()

  return Buffer.from(content, 'utf-8')
}

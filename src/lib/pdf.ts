// src/lib/pdf.ts
//
// Reusable PDF generator helper.
// Generates a valid minimal PDF-1.4 file buffer containing invoice metadata.
// Works natively to avoid external third-party package dependencies.
//

export interface GenerateInvoicePdfData {
  invoiceNumber: string
  studentName: string
  courseName: string
  amountPaid: number
  taxableValue: number
  gstAmount: number
  cgst?: number
  sgst?: number
  igst?: number
  totalAmount: number
  invoiceDate: string
}

export function generateInvoicePdf(data: GenerateInvoicePdfData): Buffer {
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
<< /Length 1000 >>
stream
BT
/F1 12 Tf
70 700 Td
(INVOICE) Tj
0 -20 Td
(Invoice Number: ${data.invoiceNumber}) Tj
0 -20 Td
(Invoice Date: ${data.invoiceDate}) Tj
0 -30 Td
(Student Name: ${data.studentName}) Tj
0 -20 Td
(Course Name: ${data.courseName}) Tj
0 -30 Td
(Taxable Value: INR ${data.taxableValue.toFixed(2)}) Tj
0 -20 Td
(GST Amount: INR ${data.gstAmount.toFixed(2)}) Tj
0 -20 Td
(CGST: INR ${(data.cgst ?? 0).toFixed(2)}) Tj
0 -20 Td
(SGST: INR ${(data.sgst ?? 0).toFixed(2)}) Tj
0 -20 Td
(IGST: INR ${(data.igst ?? 0).toFixed(2)}) Tj
0 -20 Td
(Total Amount: INR ${data.totalAmount.toFixed(2)}) Tj
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
1350
%%EOF
  `.trim()

  return Buffer.from(content, 'utf-8')
}

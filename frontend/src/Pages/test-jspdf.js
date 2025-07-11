import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// This is a simple test function to verify that jsPDF and jspdf-autotable are working correctly
export const testPDF = () => {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set the title
    doc.setFontSize(16);
    doc.text('Test PDF with autoTable', 14, 20);
    
    // Create a test table
    autoTable(doc, {
      startY: 30,
      head: [['ID', 'Name', 'Value']],
      body: [
        ['1', 'Test Item 1', '$100'],
        ['2', 'Test Item 2', '$200'],
        ['3', 'Test Item 3', '$300'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [208, 136, 96], textColor: [255, 255, 255] },
    });
    
    // Save the PDF
    doc.save('test-pdf.pdf');
    
    return { success: true, message: 'PDF generated successfully!' };
  } catch (error) {
    console.error('Error generating test PDF:', error);
    return { success: false, error: error.message };
  }
};

export default testPDF; 
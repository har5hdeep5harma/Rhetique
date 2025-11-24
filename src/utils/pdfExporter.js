import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDF(oratorName, transcript, analysisResults) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - (margin * 2);
  
  // Title Page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Rhetorical Intelligence Report', pageWidth / 2, 30, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Linguistic Expert Edition v3.0', pageWidth / 2, 42, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Orator: ${oratorName}`, pageWidth / 2, 55, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 65, { align: 'center' });
  
  // Add transcript
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Original Transcript', margin, 20);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  // Split transcript into lines that fit the page
  const transcriptLines = pdf.splitTextToSize(transcript, maxWidth);
  let yPosition = 30;
  
  transcriptLines.forEach((line) => {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 5;
  });
  
  // Add section header for analysis
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Linguistic Analysis', margin, 20);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`9-Layer Framework + Global Synthesis`, margin, 28);
  
  // Helper function to render markdown tables in PDF
  const renderPdfTable = (tableLines, pdf, startY) => {
    if (tableLines.length < 2) return startY;
    
    let y = startY;
    const colWidth = maxWidth / 4; // Adjust based on typical column count
    
    // Parse table rows
    const rows = tableLines.map(line => {
      return line.split('|')
        .map(cell => cell.trim())
        .filter(cell => cell.length > 0);
    });
    
    // Skip separator row (usually second row with dashes)
    const headerRow = rows[0];
    const dataRows = rows.slice(2);
    
    // Render header
    pdf.setFillColor(71, 85, 105); // slate-600
    pdf.rect(margin, y, maxWidth, 7, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255); // white text for header
    
    headerRow.forEach((cell, idx) => {
      const cellText = cell.replace(/\*\*/g, '');
      pdf.text(cellText, margin + (idx * colWidth) + 2, y + 5);
    });
    
    y += 7;
    
    // Render data rows
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0); // black text for data rows
    
    dataRows.forEach((row, rowIdx) => {
      // Draw border line
      pdf.setDrawColor(200, 200, 200); // light gray border
      pdf.line(margin, y, margin + maxWidth, y);
      
      row.forEach((cell, colIdx) => {
        const cellText = cell.replace(/\*\*/g, '');
        const lines = pdf.splitTextToSize(cellText, colWidth - 4);
        pdf.text(lines[0] || '', margin + (colIdx * colWidth) + 2, y + 4);
      });
      
      y += 6;
      
      // Check if we need a new page
      if (y > pageHeight - margin - 20) {
        pdf.addPage();
        y = 20;
      }
    });
    
    // Draw bottom border
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, y, margin + maxWidth, y);
    
    pdf.setTextColor(0, 0, 0); // Reset to black
    return y + 5; // Add spacing after table
  };
  
  // Add analysis results as screenshots
  let cardsAdded = 0;
  let cardsFailed = 0;
  
  for (let i = 0; i < analysisResults.length; i++) {
    const card = document.getElementById(`analysis-card-${i}`);
    
    // Declare style variables outside try block for proper scope
    let originalLetterSpacing = '';
    let originalWordSpacing = '';
    
    if (!card) {
      console.warn(`Card ${i} not found in DOM - using text fallback`);
      cardsFailed++;
      
      // Add as formatted text instead
      pdf.addPage();
      
      let y = 20;
      const content = analysisResults[i].content;
      const lines = content.split('\n');
      
      let tableLines = [];
      let inTable = false;
      
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        
        // Detect table lines
        const isTableLine = trimmedLine.includes('|') && trimmedLine.split('|').length >= 3;
        
        if (isTableLine) {
          inTable = true;
          tableLines.push(trimmedLine);
        } else if (inTable && tableLines.length > 0) {
          // End of table - render it
          y = renderPdfTable(tableLines, pdf, y);
          tableLines = [];
          inTable = false;
          
          // Process current line as normal
          if (!trimmedLine) {
            y += 3;
            return;
          }
        }
        
        // Skip if we're collecting table lines
        if (inTable) return;
        
        if (!trimmedLine) {
          y += 3;
          return;
        }
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = 20;
        }
        
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(trimmedLine.replace(/\*\*/g, ''), margin, y);
          y += 6;
        } else if (trimmedLine.match(/^[-*•]\s/) || trimmedLine.match(/^\d+\.\s/)) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const displayText = trimmedLine.replace(/^[-*]\s/, '• ').replace(/\*\*/g, '');
          const textLines = pdf.splitTextToSize(displayText, maxWidth - 5);
          textLines.forEach((textLine, idx) => {
            if (y > pageHeight - margin) {
              pdf.addPage();
              y = 20;
            }
            pdf.text(textLine, margin + (idx > 0 ? 5 : 0), y);
            y += 5;
          });
        } else {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const displayText = trimmedLine.replace(/\*\*/g, '');
          const textLines = pdf.splitTextToSize(displayText, maxWidth);
          textLines.forEach((textLine) => {
            if (y > pageHeight - margin) {
              pdf.addPage();
              y = 20;
            }
            pdf.text(textLine, margin, y);
            y += 5;
          });
        }
      });
      
      // Render any remaining table at end
      if (tableLines.length > 0) {
        renderPdfTable(tableLines, pdf, y);
      }
      
      continue;
    }
    
    try {
      // Temporarily adjust card styles for better capture
      originalLetterSpacing = card.style.letterSpacing;
      originalWordSpacing = card.style.wordSpacing;
      card.style.letterSpacing = 'normal';
      card.style.wordSpacing = 'normal';
      
      // Wait for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(card, {
        backgroundColor: '#0f172a',
        scale: 2, // Higher quality capture
        logging: false, // Disable logging for cleaner output
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        windowWidth: card.scrollWidth,
        windowHeight: card.scrollHeight,
        letterRendering: true, // Better text rendering
        imageTimeout: 0,
        removeContainer: true,
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95); // Use JPEG with high quality for better compression
      const imgWidth = maxWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add new page for each card
      pdf.addPage();
      
      // Check if image is too tall for one page
      if (imgHeight > pageHeight - (margin * 2)) {
        // Scale down to fit one page
        const scaledHeight = pageHeight - (margin * 2);
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        pdf.addImage(imgData, 'JPEG', margin, margin, scaledWidth, scaledHeight, undefined, 'FAST');
      } else {
        pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight, undefined, 'FAST');
      }
      
      // Restore original styles
      card.style.letterSpacing = originalLetterSpacing;
      card.style.wordSpacing = originalWordSpacing;
      
      cardsAdded++;
      console.log(`Successfully captured card ${i}`);
    } catch (error) {
      // Restore styles on error
      if (card) {
        card.style.letterSpacing = originalLetterSpacing || '';
        card.style.wordSpacing = originalWordSpacing || '';
      }
      console.error(`Error capturing card ${i}:`, error);
      
      // Fallback: Add as formatted text if image capture fails
      pdf.addPage();
      
      let y = 20;
      
      // Parse and format the content
      const content = analysisResults[i].content;
      const lines = content.split('\n');
      
      let tableLines = [];
      let inTable = false;
      
      lines.forEach((line) => {
        const trimmedLine = line.trim();
        
        // Detect table lines
        const isTableLine = trimmedLine.includes('|') && trimmedLine.split('|').length >= 3;
        
        if (isTableLine) {
          inTable = true;
          tableLines.push(trimmedLine);
        } else if (inTable && tableLines.length > 0) {
          // End of table - render it
          y = renderPdfTable(tableLines, pdf, y);
          tableLines = [];
          inTable = false;
          
          // Process current line as normal
          if (!trimmedLine) {
            y += 3;
            return;
          }
        }
        
        // Skip if we're collecting table lines
        if (inTable) return;
        
        if (!trimmedLine) {
          y += 3; // Add space for empty lines
          return;
        }
        
        // Check if we need a new page
        if (y > pageHeight - margin) {
          pdf.addPage();
          y = 20;
        }
        
        // Headers
        if (trimmedLine.startsWith('###')) {
          y += 3;
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(trimmedLine.replace(/^###\s*/, '').replace(/\*\*/g, ''), margin, y);
          y += 7;
        } else if (trimmedLine.startsWith('##')) {
          y += 3;
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(trimmedLine.replace(/^##\s*/, '').replace(/\*\*/g, ''), margin, y);
          y += 8;
        }
        // Standalone bold (like **Balanced Judgment:**)
        else if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
          y += 2;
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(trimmedLine.replace(/\*\*/g, ''), margin, y);
          y += 6;
        }
        // List items
        else if (trimmedLine.match(/^[-*]\s/) || trimmedLine.match(/^\d+\.\s/)) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          
          // Extract bold parts and regular text
          let displayText = trimmedLine.replace(/^[-*]\s/, '• ').replace(/^\d+\.\s/, '');
          
          // Simple approach: remove ** markers (jsPDF doesn't support mixed fonts easily)
          displayText = displayText.replace(/\*\*/g, '');
          
          const textLines = pdf.splitTextToSize(displayText, maxWidth - 5);
          textLines.forEach((textLine, idx) => {
            if (y > pageHeight - margin) {
              pdf.addPage();
              y = 20;
            }
            pdf.text(textLine, margin + (idx > 0 ? 5 : 0), y);
            y += 5;
          });
        }
        // Regular paragraph
        else {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          
          // Remove ** markers for PDF
          const displayText = trimmedLine.replace(/\*\*/g, '');
          
          const textLines = pdf.splitTextToSize(displayText, maxWidth);
          textLines.forEach((textLine) => {
            if (y > pageHeight - margin) {
              pdf.addPage();
              y = 20;
            }
            pdf.text(textLine, margin, y);
            y += 5;
          });
          y += 2; // Add small gap after paragraph
        }
      });
      
      // Render any remaining table at end
      if (tableLines.length > 0) {
        renderPdfTable(tableLines, pdf, y);
      }
    }
  }
  
  console.log(`PDF generated: ${cardsAdded} cards as images, ${cardsFailed} cards as text`);
  
  // Save the PDF
  const filename = `${oratorName.replace(/\s+/g, '_')}_Rhetorical_Analysis.pdf`;
  pdf.save(filename);
  
  return { cardsAdded, cardsFailed, filename };
}

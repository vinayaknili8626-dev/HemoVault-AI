const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a medical PDF report file for download
 * @param {Object} report - BloodReport database document
 * @param {Object} patient - Patient User object
 * @param {Object} lab - Laboratory User object
 * @param {Object} aiAnalysis - AIAnalysis database document (optional)
 * @param {String} outputPath - Path to save the file
 * @returns {Promise<String>} - Saved PDF file path
 */
const generateBloodReportPDF = (report, patient, lab, aiAnalysis, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // --- HEADER & LOGO ---
      doc.rect(0, 0, 595.28, 15).fill('#1e3a8a'); // Top banner blue
      doc.fillColor('#0f172a');

      // Title
      doc.fontSize(22).text('HEMOVAULT AI', 50, 40, { align: 'left', stroke: true });
      doc.fontSize(10).fillColor('#64748b').text('Secured Digital Health Records', 50, 65);

      // Lab Info (Right aligned)
      doc.fillColor('#1e293b');
      doc.fontSize(12).text(lab.name, 350, 40, { align: 'right' });
      doc.fontSize(8).fillColor('#64748b').text(`License: ${lab.licenseNumber || 'N/A'}`, 350, 55, { align: 'right' });
      doc.text(`Contact: ${lab.phone || lab.email || ''}`, 350, 68, { align: 'right' });

      // Horizontal separator
      doc.moveTo(50, 90).lineTo(545, 90).strokeColor('#e2e8f0').stroke();

      // --- PATIENT METADATA ---
      doc.fontSize(10).fillColor('#1e3a8a').text('PATIENT DEMOGRAPHICS', 50, 105);
      doc.fillColor('#1e293b');
      doc.fontSize(9);

      // Left Column
      doc.text(`Name: `, 50, 125, { bold: true });
      doc.text(patient.name, 120, 125);
      doc.text(`Email: `, 50, 140);
      doc.text(patient.email, 120, 140);
      doc.text(`Date of Birth: `, 50, 155);
      const dobStr = patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A';
      doc.text(dobStr, 120, 155);

      // Right Column
      doc.text(`Report ID: `, 300, 125);
      doc.text(report._id.toString(), 370, 125);
      doc.text(`Date of Test: `, 300, 140);
      doc.text(new Date(report.date).toLocaleDateString(), 370, 140);
      doc.text(`Report Type: `, 300, 155);
      doc.text(report.reportType, 370, 155);

      // Block boundary
      doc.moveTo(50, 180).lineTo(545, 180).strokeColor('#e2e8f0').stroke();

      // --- PARAMETERS TABLE HEADER ---
      doc.fontSize(11).fillColor('#1e3a8a').text('TEST PARAMETERS', 50, 195);

      let tableTop = 220;
      doc.rect(50, tableTop, 495, 20).fill('#f1f5f9');
      
      doc.fontSize(9).fillColor('#334155');
      doc.text('Parameter Name', 60, tableTop + 6);
      doc.text('Observed Value', 250, tableTop + 6);
      doc.text('Reference Range', 370, tableTop + 6);
      doc.text('Status', 480, tableTop + 6);

      let rowTop = tableTop + 20;
      doc.fillColor('#0f172a');

      // Import standard ranges mapping to show ranges on PDF
      const { REFERENCE_RANGES } = require('../services/localAIService');

      // Draw rows
      report.parameters.forEach((value, key) => {
        const norm = REFERENCE_RANGES[key.toLowerCase()] || { name: key, min: '-', max: '-', unit: '' };
        
        // Row background alternating
        if ((rowTop / 20) % 2 === 0) {
          doc.rect(50, rowTop, 495, 20).fill('#f8fafc');
        }
        
        doc.fillColor('#1e293b');
        // Column 1: Name
        doc.text(norm.name, 60, rowTop + 6);
        
        // Column 2: Value
        doc.text(`${value} ${norm.unit || ''}`, 250, rowTop + 6);
        
        // Column 3: Range
        const rangeText = norm.min !== '-' ? `${norm.min} - ${norm.max} ${norm.unit}` : 'N/A';
        doc.text(rangeText, 370, rowTop + 6);

        // Column 4: Status flag
        let status = 'Normal';
        let flagColor = '#10b981'; // Green
        
        if (norm.min !== '-') {
          const numVal = Number(value);
          if (norm.inverse) {
            if (numVal < norm.min) {
              status = numVal < norm.min * 0.7 ? 'Critical' : 'Low';
              flagColor = '#ef4444'; // Red
            }
          } else {
            if (numVal < norm.min) {
              status = numVal < norm.min * 0.7 ? 'Critical' : 'Low';
              flagColor = '#3b82f6'; // Blue
            } else if (numVal > norm.max) {
              status = numVal > norm.max * 1.3 ? 'Critical' : 'High';
              flagColor = '#ef4444'; // Red
            }
          }
        }

        doc.fillColor(flagColor).text(status, 480, rowTop + 6);
        rowTop += 20;
      });

      // Horizontal separator
      doc.moveTo(50, rowTop + 10).lineTo(545, rowTop + 10).strokeColor('#e2e8f0').stroke();

      // --- AI CLINICAL DIAGNOSTIC ANALYSIS (if available) ---
      let aiSectionTop = rowTop + 25;
      
      if (aiAnalysis) {
        doc.fontSize(11).fillColor('#1e3a8a').text('OFFLINE AI HEALTH ASSESSMENT', 50, aiSectionTop);
        doc.fillColor('#0f172a');
        
        // Health Score Card
        doc.rect(50, aiSectionTop + 15, 120, 50).fill('#eff6ff');
        doc.fontSize(8).fillColor('#1e3a8a').text('HEALTH SCORE', 60, aiSectionTop + 25);
        doc.fontSize(16).fillColor('#1e3a8a').text(`${aiAnalysis.healthScore || 100}/100`, 60, aiSectionTop + 38, { bold: true });

        // Health summary
        doc.fontSize(9).fillColor('#1e293b');
        doc.text(
          aiAnalysis.summary || '',
          185,
          aiSectionTop + 18,
          { width: 360, align: 'justify', lineGap: 3 }
        );

        // QR Code embedding
        if (report.qrCodeUrl) {
          doc.fontSize(10).fillColor('#1e3a8a').text('SECURITY VERIFICATION', 50, aiSectionTop + 80);
          try {
            doc.image(report.qrCodeUrl, 50, aiSectionTop + 95, { width: 90, height: 90 });
            doc.fontSize(8).fillColor('#64748b');
            doc.text('Scan QR code to verify report authenticity online.', 160, aiSectionTop + 115, { width: 300 });
            doc.text(`Verification ID: ${report.verificationToken}`, 160, aiSectionTop + 130);
          } catch (qrErr) {
            console.error('Error drawing QR to PDF:', qrErr);
          }
        }
      } else {
        // Fallback for QR Code when no AI analysis exists
        if (report.qrCodeUrl) {
          doc.fontSize(10).fillColor('#1e3a8a').text('SECURITY VERIFICATION', 50, aiSectionTop);
          try {
            doc.image(report.qrCodeUrl, 50, aiSectionTop + 15, { width: 90, height: 90 });
            doc.fontSize(8).fillColor('#64748b');
            doc.text('Scan QR code to verify report authenticity online.', 160, aiSectionTop + 35, { width: 300 });
            doc.text(`Verification ID: ${report.verificationToken}`, 160, aiSectionTop + 50);
          } catch (qrErr) {
            console.error('Error drawing QR to PDF:', qrErr);
          }
        }
      }

      // Footnote
      doc.rect(0, 815, 595.28, 30).fill('#f1f5f9');
      doc.fontSize(7).fillColor('#64748b').text('HemoVault AI is a medical records application. Clinical summaries are powered by rule-based algorithmic triggers. Consult a physician for official medical diagnoses.', 50, 825, { width: 495, align: 'center' });

      doc.end();

      writeStream.on('finish', () => {
        resolve(outputPath);
      });
      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateBloodReportPDF
};

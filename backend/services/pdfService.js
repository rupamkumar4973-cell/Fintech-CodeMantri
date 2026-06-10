const PDFDocument = require('pdfkit');

class PdfService {
  /**
   * Generates a clean, professional Loan Eligibility Report PDF
   * @param {Object} report - Eligibility details
   * @param {Object} user - User object
   * @param {Object} res - Express response stream
   */
  generateEligibilityReport(report, user, res) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SmartLoan_Eligibility_Report_${user.name.replace(/\s+/g, '_')}.pdf`);

    // Stream PDF directly to client response
    doc.pipe(res);

    // Color Palette
    const primaryColor = '#1e3a8a';   // Navy
    const secondaryColor = '#3b82f6'; // Light Blue
    const darkTextColor = '#1f2937';  // Dark Gray
    const lightBgColor = '#f3f4f6';   // Light Gray
    const accentGreen = '#16a34a';    // Green
    const accentRed = '#dc2626';      // Red

    // Header Logo/Title
    doc.fillColor(primaryColor)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('SmartLoan AI', 50, 50);

    doc.fillColor(secondaryColor)
       .fontSize(10)
       .font('Helvetica')
       .text('Advanced AI-Powered FinTech Loan Eligibility Assessment', 50, 78);

    doc.moveTo(50, 95)
       .lineTo(545, 95)
       .strokeColor('#e5e7eb')
       .lineWidth(1)
       .stroke();

    // Report Title
    doc.fillColor(darkTextColor)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('LOAN ELIGIBILITY REPORT', 50, 115);

    // Meta-Info Table (User Details)
    doc.fillColor(lightBgColor)
       .rect(50, 140, 495, 80)
       .fill();

    doc.fillColor(darkTextColor)
       .fontSize(10)
       .font('Helvetica-Bold').text('Applicant Name:', 65, 155)
       .font('Helvetica').text(user.name, 160, 155)
       .font('Helvetica-Bold').text('Email Address:', 65, 175)
       .font('Helvetica').text(user.email, 160, 175)
       .font('Helvetica-Bold').text('Mobile Number:', 65, 195)
       .font('Helvetica').text(user.phone || 'N/A', 160, 195);

    doc.font('Helvetica-Bold').text('Report Date:', 330, 155)
       .font('Helvetica').text(new Date().toLocaleDateString('en-IN'), 410, 155)
       .font('Helvetica-Bold').text('Assessment ID:', 330, 175)
       .font('Helvetica').text(report._id ? report._id.toString() : 'MOCK-EL-9921', 410, 175)
       .font('Helvetica-Bold').text('KYC Status:', 330, 195)
       .fillColor(user.kycStatus === 'Approved' ? accentGreen : accentRed)
       .font('Helvetica').text(user.kycStatus, 410, 195);

    // Restore text color
    doc.fillColor(darkTextColor);

    // Eligibility Score Summary
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Eligibility Evaluation', 50, 245);

    // CIBIL Score Card & Financial Health
    const isEligible = report.isEligible ?? true;
    const statusText = isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE';
    const statusColor = isEligible ? accentGreen : accentRed;

    doc.fillColor('#f8fafc')
       .rect(50, 270, 495, 100)
       .strokeColor('#cbd5e1')
       .lineWidth(1)
       .fillAndStroke();

    // Left Column: Result
    doc.fillColor(statusColor)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(statusText, 80, 290);
    
    doc.fillColor(darkTextColor)
       .fontSize(9)
       .font('Helvetica')
       .text('Eligibility Status', 80, 315);

    // Middle Column: CIBIL
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(report.cibilScore.toString(), 240, 290);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('CIBIL Credit Score', 240, 315);

    // Right Column: Probability
    const probability = report.approvalProbability || 0;
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(`${probability}%`, 400, 290);
    
    doc.fontSize(9)
       .font('Helvetica')
       .text('Approval Probability', 400, 315);

    // Financial Health score at bottom of card
    const health = report.financialHealthScore || 70;
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text(`Financial Health Score: ${health} / 100`, 80, 345);

    // Assessment Details Table
    doc.fillColor(darkTextColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Financial & Assessment Metrics', 50, 395);

    let y = 425;
    const metrics = [
      { label: 'Monthly Income', value: `INR ${report.monthlyIncome.toLocaleString('en-IN')}` },
      { label: 'Debt-to-Income (DTI) Ratio', value: `${report.debtToIncomeRatio}%` },
      { label: 'Max Eligible Loan Amount', value: `INR ${report.maxEligibleAmount.toLocaleString('en-IN')}` },
      { label: 'Suggested Interest Rate', value: `${report.suggestedInterestRate}% per annum` },
      { label: 'Assessed Risk Category', value: report.riskAnalysis.category }
    ];

    metrics.forEach((m, idx) => {
      // Row Background
      if (idx % 2 === 0) {
        doc.fillColor('#f9fafb')
           .rect(50, y - 5, 495, 24)
           .fill();
      }
      
      doc.fillColor(darkTextColor)
         .fontSize(10)
         .font('Helvetica')
         .text(m.label, 65, y)
         .font('Helvetica-Bold')
         .text(m.value, 380, y);

      y += 24;
    });

    // Risk Analysis & Improvement Suggestions
    doc.fillColor(darkTextColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('AI Risk Analysis & Recommendations', 50, y + 20);

    y += 45;
    doc.fontSize(10)
       .font('Helvetica')
       .text(report.riskAnalysis.details || 'Risk category is determined based on historical defaults and credit bureau inputs.', 50, y, { width: 495 });

    y += 35;
    doc.font('Helvetica-Bold')
       .text('Suggestions to Improve Eligibility:', 50, y);

    y += 18;
    const suggestions = report.riskAnalysis.suggestions || [];
    if (suggestions.length === 0) {
      doc.font('Helvetica')
         .text('• Maintain your current excellent financial behavior to secure high-tier rates.', 65, y);
    } else {
      suggestions.forEach(s => {
        doc.font('Helvetica')
           .text(`• ${s}`, 65, y, { width: 480 });
        y += 18;
      });
    }

    // Footer Disclaimer
    doc.fillColor('#9ca3af')
       .fontSize(8)
       .font('Helvetica-Oblique')
       .text('Disclaimer: This report is generated by SmartLoan AI scoring engine using mock and user-provided inputs. Actual loan disbursal depends on subsequent bank verification and submission of original legal documentation.', 50, 740, { align: 'center', width: 495 });

    // End stream
    doc.end();
  }
}

module.exports = new PdfService();

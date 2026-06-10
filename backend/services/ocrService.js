/**
 * Mock OCR Service Layer
 * Simulates details extraction from Aadhaar, PAN, and Selfie images.
 */
class OcrService {
  /**
   * Mock OCR text extraction
   * @param {string} fileType - 'pan' | 'aadhaar'
   * @param {string} filePath - Path to uploaded image
   * @returns {Promise<Object>} Extracted metadata
   */
  async extractDocumentData(fileType, filePath) {
    // Simulate OCR processing latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (fileType === 'pan') {
      // Mock PAN card OCR extraction
      // Generate a random but realistic PAN number if not matching a format
      const letters = 'ABCDE';
      const randomLetters = Array.from({ length: 5 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const lastChar = 'F';
      const panNumber = `${randomLetters}${randomNum}${lastChar}`;

      return {
        name: 'MOCK USER CARD',
        dob: '15/08/1995',
        panNumber,
        confidence: 0.96,
        rawText: `INCOME TAX DEPARTMENT\nGOVT. OF INDIA\nPAN: ${panNumber}\nName: MOCK USER CARD\nDOB: 15/08/1995`
      };
    } else if (fileType === 'aadhaar') {
      // Mock Aadhaar OCR extraction
      const randomNum1 = Math.floor(1000 + Math.random() * 9000);
      const randomNum2 = Math.floor(1000 + Math.random() * 9000);
      const randomNum3 = Math.floor(1000 + Math.random() * 9000);
      const aadhaarNumber = `${randomNum1} ${randomNum2} ${randomNum3}`;

      return {
        name: 'MOCK USER CARD',
        dob: '15/08/1995',
        aadhaarNumber,
        gender: 'MALE',
        confidence: 0.94,
        rawText: `GOVERNMENT OF INDIA\nUNIQUE IDENTIFICATION AUTHORITY OF INDIA\nEnrollment No: 1234/56789/01234\nTo,\nMOCK USER CARD\nDOB: 15/08/1995\nGender: MALE\n${aadhaarNumber}`
      };
    }

    return {
      confidence: 0.0,
      error: 'Unsupported document type for OCR'
    };
  }
}

module.exports = new OcrService();

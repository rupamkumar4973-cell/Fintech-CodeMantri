/**
 * Mock CIBIL Service Layer
 * Simulates integration with a credit bureau API like TransUnion CIBIL.
 */
class CibilService {
  /**
   * Fetches credit profile for a user based on their identity details
   * @param {string} name - User's name
   * @param {string} pan - User's PAN card number
   * @returns {Promise<Object>} Credit Profile
   */
  async fetchCreditProfile(name, pan) {
    // Simulate API network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate score deterministically using PAN hash or randomize it
    let hash = 0;
    for (let i = 0; i < pan.length; i++) {
      hash += pan.charCodeAt(i);
    }
    
    // Scale score to range between 550 and 850 based on hash
    const score = 550 + (hash % 301); // 550 to 850
    
    const activeLoans = (hash % 5) + 1; // 1 to 5
    const creditUtilization = 15 + (hash % 61); // 15% to 75%
    const repaymentHistory = 80 + (hash % 21); // 80% to 100%
    
    let riskCategory = 'Medium Risk';
    if (score > 750) {
      riskCategory = 'Low Risk';
    } else if (score < 650) {
      riskCategory = 'High Risk';
    }

    return {
      score,
      creditUtilization,
      activeLoans,
      repaymentHistory,
      riskCategory,
      provider: 'CIBIL Mock Bureau v1.0',
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new CibilService();

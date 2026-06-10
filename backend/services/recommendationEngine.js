/**
 * SmartLoan AI Eligibility & Recommendation Engine
 * Calculates risk levels, max eligible loan amounts, suggested interest rates,
 * and builds recommendations for loan types and credit improvement.
 */
class RecommendationEngine {
  /**
   * Evaluates loan eligibility based on user profile and loan requirements
   * @param {Object} input - { cibilScore, monthlyIncome, existingLoans, requestedAmount, tenure, age, employmentType, kycStatus }
   * @returns {Object} Eligibility Report
   */
  evaluateEligibility(input) {
    const {
      cibilScore = 600,
      monthlyIncome = 0,
      existingLoans = 0, // monthly EMI obligations of existing loans
      requestedAmount = 0,
      tenure = 12, // in months
      age = 18,
      employmentType = 'Salaried',
      kycStatus = 'Pending'
    } = input;

    // 1. Initial rejection criteria (Hard stops)
    const suggestions = [];
    let isEligible = true;
    let refusalReason = '';

    if (age < 21 || age > 65) {
      isEligible = false;
      refusalReason = 'Age must be between 21 and 65 years.';
      suggestions.push('Apply with a co-applicant who meets the age criteria.');
    }

    if (monthlyIncome < 15000) {
      isEligible = false;
      refusalReason = refusalReason || 'Minimum monthly income requirement is ₹15,000.';
      suggestions.push('Add an additional source of income or a co-applicant to increase pooled income.');
    }

    // 2. Calculate Debt-to-Income (DTI) ratio
    // Assume an interest rate of 12% for calculating mock EMI if requested amount is not set
    const baseInterestRate = cibilScore > 750 ? 9.5 : (cibilScore >= 650 ? 12.0 : 15.0);
    const r = (baseInterestRate / 12) / 100; // monthly rate
    const proposedEmi = requestedAmount > 0 
      ? Math.round((requestedAmount * r * Math.pow(1 + r, tenure)) / (Math.pow(1 + r, tenure) - 1))
      : 0;

    const totalObligations = existingLoans + proposedEmi;
    const debtToIncomeRatio = Math.round((totalObligations / monthlyIncome) * 100);

    if (debtToIncomeRatio > 55) {
      isEligible = false;
      refusalReason = refusalReason || `High Debt-to-Income ratio (${debtToIncomeRatio}%). Existing obligations are too high.`;
      suggestions.push('Clear existing small loans to reduce your current monthly obligations.');
      suggestions.push('Increase the loan tenure to reduce the monthly EMI requirement.');
    }

    if (kycStatus !== 'Approved') {
      suggestions.push('Complete your KYC verification to unlock full loan disbursal.');
    }

    // 3. Determine CIBIL Score Grade & Limits
    let maxMultiplier = 0;
    let approvalProbability = 0;
    let suggestedInterestRate = 0;
    let riskCategory = 'High Risk';

    if (cibilScore > 750) {
      // Highly Eligible
      maxMultiplier = 20; // can borrow up to 20x monthly income
      approvalProbability = Math.min(98, 85 + Math.round((cibilScore - 750) * 0.086)); // 85% to 98%
      suggestedInterestRate = employmentType === 'Salaried' ? 8.99 : 9.49;
      riskCategory = 'Low Risk';
    } else if (cibilScore >= 650) {
      // Eligible with Conditions
      maxMultiplier = 12; // can borrow up to 12x monthly income
      approvalProbability = 50 + Math.round((cibilScore - 650) * 0.34); // 50% to 84%
      suggestedInterestRate = employmentType === 'Salaried' ? 11.49 : 12.49;
      riskCategory = 'Medium Risk';
      suggestions.push('A higher CIBIL score (>750) would lower your interest rate by up to 3%.');
    } else {
      // Not Eligible
      isEligible = false;
      maxMultiplier = 4; // can borrow up to 4x monthly income max
      approvalProbability = Math.round((cibilScore / 750) * 45); // < 45%
      suggestedInterestRate = 16.99;
      riskCategory = 'High Risk';
      refusalReason = refusalReason || 'Credit score is below the minimum threshold (650).';
      suggestions.push('Avoid multiple loan applications in a short span.');
      suggestions.push('Pay all credit card bills and loan EMIs on time for the next 6 months.');
    }

    // Calculate maximum eligible loan amount
    const maxEligibleAmount = Math.max(0, Math.round(monthlyIncome * maxMultiplier));

    // If requested amount exceeds max eligible, adjust eligibility
    if (isEligible && requestedAmount > maxEligibleAmount) {
      isEligible = false;
      refusalReason = `Requested loan amount (₹${requestedAmount.toLocaleString()}) exceeds your maximum eligible amount (₹${maxEligibleAmount.toLocaleString()}).`;
      suggestions.push(`Apply for a lower loan amount within your eligibility threshold of ₹${maxEligibleAmount.toLocaleString()}.`);
    }

    // 4. Calculate Financial Health Score (0 - 100)
    // Formula components: Credit Score (40%), DTI (30%), Repayment History / Income stability (30%)
    const scoreFactor = ((cibilScore - 300) / 600) * 40; // max 40
    const dtiFactor = Math.max(0, 100 - debtToIncomeRatio) * 0.3; // max 30
    const incomeFactor = Math.min(30, (monthlyIncome / 100000) * 30); // max 30
    const financialHealthScore = Math.round(Math.max(10, Math.min(100, scoreFactor + dtiFactor + incomeFactor)));

    // 5. Generate Personalized Recommendations
    const recommendations = [];
    if (financialHealthScore > 80) {
      recommendations.push({
        title: 'Premium Interest Waiver',
        description: 'You qualify for our lowest interest rate of 8.99% on Personal & Housing Loans.',
        badge: 'Top Offer'
      });
    }
    if (debtToIncomeRatio < 30) {
      recommendations.push({
        title: 'Pre-Approved Top-up Facility',
        description: 'You have room to apply for an additional top-up loan of up to ₹2,00,000.',
        badge: 'Fast Track'
      });
    }
    
    // Suggest alternative Tenures if rejected due to DTI
    if (debtToIncomeRatio > 50 && requestedAmount > 0) {
      const longTenure = Math.min(84, tenure + 24);
      const longProposedEmi = Math.round((requestedAmount * r * Math.pow(1 + r, longTenure)) / (Math.pow(1 + r, longTenure) - 1));
      const longDti = Math.round(((existingLoans + longProposedEmi) / monthlyIncome) * 100);
      
      if (longDti < 50) {
        recommendations.push({
          title: `Extend Tenure to ${longTenure} months`,
          description: `Increasing tenure lowers your EMI to ₹${longProposedEmi.toLocaleString()} (reducing DTI to ${longDti}%), which makes your application eligible!`,
          badge: 'Smart Assist'
        });
      }
    }

    return {
      isEligible,
      refusalReason,
      maxEligibleAmount,
      suggestedInterestRate,
      approvalProbability,
      emi: proposedEmi,
      debtToIncomeRatio,
      financialHealthScore,
      riskAnalysis: {
        category: riskCategory,
        suggestions,
        details: isEligible 
          ? 'Profile displays strong repayment capacity with sustainable debt obligations.'
          : `Profile is categorized as ${riskCategory} due to: ${refusalReason || 'multiple credit risk indicators.'}`
      },
      recommendations
    };
  }
}

module.exports = new RecommendationEngine();

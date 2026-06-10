const twilio = require('twilio');

class SmsService {
  constructor() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const phone = process.env.TWILIO_PHONE_NUMBER;

    if (sid && token && phone) {
      try {
        this.client = twilio(sid, token);
        this.fromNumber = phone;
        this.enabled = true;
        console.log(`✅ Twilio Gateway initialized. Service Identifier: ${phone}`);
      } catch (err) {
        console.error('❌ Failed to initialize Twilio client:', err.message);
        this.enabled = false;
      }
    } else {
      this.enabled = false;
      console.log('ℹ️ Twilio credentials missing in .env. SMS gateway running in Simulation Mode.');
    }
  }

  /**
   * Sends OTP verification code
   * Supports both standard Messages API and Twilio Verify API (if phone starts with 'VA')
   * @param {string} toPhone - Recipient's mobile number
   * @param {string} otpCode - Generated 6-digit OTP code (for standard SMS)
   * @returns {Promise<boolean>}
   */
  async sendOtp(toPhone, otpCode) {
    if (this.enabled && this.client) {
      try {
        const useWhatsApp = process.env.USE_WHATSAPP === 'true';
        let toVal = toPhone.startsWith('+') ? toPhone : `+91${toPhone}`;

        if (this.fromNumber.startsWith('VA')) {
          // 1. Twilio Verify API v2 (Verify Service)
          // Note: Twilio handles OTP code generation and sending itself.
          await this.client.verify.v2.services(this.fromNumber)
            .verifications
            .create({ 
              to: useWhatsApp ? `whatsapp:${toVal}` : toVal, 
              channel: useWhatsApp ? 'whatsapp' : 'sms' 
            });
          console.log(`💬 Twilio Verify OTP request successfully sent to ${toPhone}`);
          return true;
        } else {
          // 2. Standard Twilio Messages API
          let fromVal = this.fromNumber;
          if (useWhatsApp) {
            fromVal = `whatsapp:${fromVal}`;
            toVal = `whatsapp:${toVal}`;
          }

          await this.client.messages.create({
            body: `SmartLoan AI Security Code: ${otpCode}. Valid for 10 minutes. Do not share this OTP.`,
            from: fromVal,
            to: toVal
          });
          console.log(`💬 Real ${useWhatsApp ? 'WhatsApp' : 'SMS'} OTP sent successfully to ${toPhone}`);
          return true;
        }
      } catch (error) {
        console.error(`❌ Twilio Delivery Failed to ${toPhone}:`, error.message);
        console.log('\n=============================================');
        console.log('📱 FALLBACK SIMULATOR SMS LOG ENTRY (Twilio Failed)');
        console.log(`   TO:       ${toPhone}`);
        console.log(`   MESSAGE:  SmartLoan AI Security Code: ${otpCode}`);
        console.log('=============================================\n');
        return false;
      }
    } else {
      // Simulation Logger Block
      console.log('\n=============================================');
      console.log('📱 SIMULATOR SMS LOG ENTRY');
      console.log(`   TO:       ${toPhone}`);
      console.log(`   MESSAGE:  SmartLoan AI Security Code: ${otpCode}`);
      console.log('=============================================\n');
      return true;
    }
  }

  /**
   * Verifies an OTP code (required if using Twilio Verify API)
   * @param {string} toPhone - Recipient's mobile number
   * @param {string} otpCode - User entered OTP code
   * @returns {Promise<boolean>}
   */
  async checkOtp(toPhone, otpCode) {
    if (this.enabled && this.client && this.fromNumber.startsWith('VA')) {
      try {
        const useWhatsApp = process.env.USE_WHATSAPP === 'true';
        const toVal = toPhone.startsWith('+') ? toPhone : `+91${toPhone}`;
        
        const check = await this.client.verify.v2.services(this.fromNumber)
          .verificationChecks
          .create({ 
            to: useWhatsApp ? `whatsapp:${toVal}` : toVal, 
            code: otpCode 
          });
          
        return check.status === 'approved';
      } catch (error) {
        console.error(`❌ Twilio Verification check failed for ${toPhone}:`, error.message);
        return false;
      }
    }
    return false; // Fall back to standard DB matching
  }
}

module.exports = new SmsService();

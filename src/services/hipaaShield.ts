export class HIPAAShield {
  private static redactionRules = [
    // Social Security Numbers
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replace: '[SSN-REDACTED]' },
    { pattern: /\b\d{9}\b/g, replace: '[SSN-REDACTED]' },
    
    // Insurance IDs
    { pattern: /\b[A-Z]{2}\d{10}\b/g, replace: '[INSURANCE-REDACTED]' },
    { pattern: /\b[A-Z]{3}\d{9}\b/g, replace: '[INSURANCE-REDACTED]' },
    
    // Phone Numbers
    { pattern: /\b\d{3}-\d{3}-\d{4}\b/g, replace: '[PHONE-REDACTED]' },
    { pattern: /\b\(\d{3}\)\s?\d{3}-\d{4}\b/g, replace: '[PHONE-REDACTED]' },
    
    // Credit Card Numbers
    { pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replace: '[CARD-REDACTED]' },
    
    // Email Addresses (partial redaction)
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replace: '[EMAIL-REDACTED]' },
    
    // Dates of Birth
    { pattern: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, replace: '[DOB-REDACTED]' },
    { pattern: /\b\d{1,2}-\d{1,2}-\d{4}\b/g, replace: '[DOB-REDACTED]' },
    
    // Medical Record Numbers
    { pattern: /\bMRN[\s:]?\d+/gi, replace: '[MRN-REDACTED]' },
    { pattern: /\bMR[\s:]?\d+/gi, replace: '[MRN-REDACTED]' }
  ];

  private static auditLog: Array<{
    timestamp: Date;
    action: string;
    dataType: string;
    redacted: boolean;
    originalLength: number;
    redactedLength: number;
  }> = [];

  static redactPHI(text: string): {
    redactedText: string;
    redactionCount: number;
    dataTypesFound: string[];
  } {
    let redactedText = text;
    let redactionCount = 0;
    const dataTypesFound: string[] = [];

    this.redactionRules.forEach(rule => {
      const matches = text.match(rule.pattern);
      if (matches) {
        redactionCount += matches.length;
        
        // Identify data type based on pattern
        let dataType = 'unknown';
        if (rule.replace.includes('SSN')) dataType = 'ssn';
        else if (rule.replace.includes('INSURANCE')) dataType = 'insurance';
        else if (rule.replace.includes('PHONE')) dataType = 'phone';
        else if (rule.replace.includes('CARD')) dataType = 'credit_card';
        else if (rule.replace.includes('EMAIL')) dataType = 'email';
        else if (rule.replace.includes('DOB')) dataType = 'date_of_birth';
        else if (rule.replace.includes('MRN')) dataType = 'medical_record';
        
        if (!dataTypesFound.includes(dataType)) {
          dataTypesFound.push(dataType);
        }
        
        redactedText = redactedText.replace(rule.pattern, rule.replace);
      }
    });

    // Log the redaction activity
    this.auditLog.push({
      timestamp: new Date(),
      action: 'phi_redaction',
      dataType: dataTypesFound.join(', '),
      redacted: redactionCount > 0,
      originalLength: text.length,
      redactedLength: redactedText.length
    });

    return {
      redactedText,
      redactionCount,
      dataTypesFound
    };
  }

  static createComplianceReport(): {
    totalRedactions: number;
    dataTypesProtected: string[];
    auditTrail: typeof HIPAAShield.auditLog;
    complianceScore: number;
  } {
    const totalRedactions = this.auditLog.reduce((sum, entry) => 
      sum + (entry.redacted ? 1 : 0), 0
    );

    const dataTypesProtected = [...new Set(
      this.auditLog
        .filter(entry => entry.redacted)
        .map(entry => entry.dataType)
        .join(', ')
        .split(', ')
        .filter(type => type !== '')
    )];

    // Calculate compliance score (0-100)
    const complianceScore = Math.min(100, 
      (this.auditLog.length > 0 ? (totalRedactions / this.auditLog.length) * 100 : 100)
    );

    return {
      totalRedactions,
      dataTypesProtected,
      auditTrail: this.auditLog.slice(-50), // Last 50 entries
      complianceScore: Math.round(complianceScore)
    };
  }

  static encryptData(data: string): string {
    // Simple encryption simulation (in production, use proper encryption)
    const encrypted = btoa(data).split('').reverse().join('');
    
    this.auditLog.push({
      timestamp: new Date(),
      action: 'data_encryption',
      dataType: 'patient_data',
      redacted: false,
      originalLength: data.length,
      redactedLength: encrypted.length
    });

    return encrypted;
  }

  static validateHIPAACompliance(transcript: string): {
    isCompliant: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const redactionResult = this.redactPHI(transcript);
    const violations: string[] = [];
    const recommendations: string[] = [];

    if (redactionResult.redactionCount > 0) {
      violations.push(`${redactionResult.redactionCount} PHI elements detected and redacted`);
      recommendations.push('Review staff training on PHI handling');
    }

    if (redactionResult.dataTypesFound.includes('ssn')) {
      violations.push('Social Security Number detected');
      recommendations.push('Implement SSN collection protocols');
    }

    if (redactionResult.dataTypesFound.includes('credit_card')) {
      violations.push('Credit card information detected');
      recommendations.push('Use secure payment processing only');
    }

    return {
      isCompliant: violations.length === 0,
      violations,
      recommendations
    };
  }

  static getAuditSummary(): {
    last24Hours: number;
    mostCommonDataType: string;
    complianceRate: number;
  } {
    const last24Hours = this.auditLog.filter(entry => 
      Date.now() - entry.timestamp.getTime() < 24 * 60 * 60 * 1000
    ).length;

    const dataTypeCounts = this.auditLog.reduce((acc, entry) => {
      if (entry.dataType) {
        acc[entry.dataType] = (acc[entry.dataType] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostCommonDataType = Object.entries(dataTypeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';

    const complianceRate = this.auditLog.length > 0 
      ? (this.auditLog.filter(entry => entry.redacted).length / this.auditLog.length) * 100
      : 100;

    return {
      last24Hours,
      mostCommonDataType,
      complianceRate: Math.round(complianceRate)
    };
  }
}
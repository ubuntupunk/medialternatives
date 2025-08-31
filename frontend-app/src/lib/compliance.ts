import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * GDPR and CCPA Compliance System
 * Handles data protection, user rights, and privacy compliance
 */

export interface DataSubject {
  id: string;
  email?: string;
  ipAddress: string;
  userAgent: string;
  consentGiven: boolean;
  consentDate?: string;
  dataProcessing: string[];
  createdAt: string;
  lastActivity: string;
}

export interface DataProcessingRecord {
  id: string;
  subjectId: string;
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation' | 'public_task' | 'vital_interest';
  dataCategories: string[];
  recipients: string[];
  retentionPeriod: number; // days
  createdAt: string;
  expiresAt: string;
}

export interface ConsentRecord {
  id: string;
  subjectId: string;
  consentType: string;
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Data Protection Officer (DPO) System
 */
export class DataProtectionOfficer {
  private subjects = new Map<string, DataSubject>();
  private processingRecords = new Map<string, DataProcessingRecord[]>();
  private consentRecords = new Map<string, ConsentRecord[]>();

  /**
   * Register a data subject
   */
  registerSubject(subject: Omit<DataSubject, 'id' | 'createdAt' | 'lastActivity'>): string {
    const id = `subject_${crypto.randomBytes(16).toString('hex')}`;
    const now = new Date().toISOString();

    const newSubject: DataSubject = {
      ...subject,
      id,
      createdAt: now,
      lastActivity: now
    };

    this.subjects.set(id, newSubject);
    return id;
  }

  /**
   * Record data processing activity
   */
  recordProcessing(record: Omit<DataProcessingRecord, 'id' | 'createdAt' | 'expiresAt'>): string {
    const id = `processing_${crypto.randomBytes(16).toString('hex')}`;
    const createdAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + (record.retentionPeriod * 24 * 60 * 60 * 1000)).toISOString();

    const processingRecord: DataProcessingRecord = {
      ...record,
      id,
      createdAt,
      expiresAt
    };

    if (!this.processingRecords.has(record.subjectId)) {
      this.processingRecords.set(record.subjectId, []);
    }

    this.processingRecords.get(record.subjectId)!.push(processingRecord);
    return id;
  }

  /**
   * Record consent
   */
  recordConsent(consent: Omit<ConsentRecord, 'id'>): string {
    const id = `consent_${crypto.randomBytes(16).toString('hex')}`;

    const consentRecord: ConsentRecord = {
      ...consent,
      id
    };

    if (!this.consentRecords.has(consent.subjectId)) {
      this.consentRecords.set(consent.subjectId, []);
    }

    this.consentRecords.get(consent.subjectId)!.push(consentRecord);

    // Update subject consent status
    const subject = this.subjects.get(consent.subjectId);
    if (subject) {
      subject.consentGiven = consent.granted;
      subject.consentDate = consent.granted ? consent.grantedAt : undefined;
    }

    return id;
  }

  /**
   * Get data subject information (GDPR Article 15)
   */
  getSubjectData(subjectId: string): {
    subject: DataSubject;
    processingRecords: DataProcessingRecord[];
    consentRecords: ConsentRecord[];
  } | null {
    const subject = this.subjects.get(subjectId);
    if (!subject) return null;

    const processingRecords = this.processingRecords.get(subjectId) || [];
    const consentRecords = this.consentRecords.get(subjectId) || [];

    return {
      subject,
      processingRecords,
      consentRecords
    };
  }

  /**
   * Rectify subject data (GDPR Article 16)
   */
  rectifySubjectData(subjectId: string, updates: Partial<DataSubject>): boolean {
    const subject = this.subjects.get(subjectId);
    if (!subject) return false;

    Object.assign(subject, updates);
    return true;
  }

  /**
   * Erase subject data (GDPR Right to Erasure)
   */
  eraseSubjectData(subjectId: string): boolean {
    const subject = this.subjects.get(subjectId);
    if (!subject) return false;

    // Remove all data related to the subject
    this.subjects.delete(subjectId);
    this.processingRecords.delete(subjectId);
    this.consentRecords.delete(subjectId);

    return true;
  }

  /**
   * Restrict processing (GDPR Article 18)
   */
  restrictProcessing(subjectId: string, restriction: boolean): boolean {
    const subject = this.subjects.get(subjectId);
    if (!subject) return false;

    // In a real implementation, this would modify processing behavior
    subject.dataProcessing = restriction ? [] : ['all'];
    return true;
  }

  /**
   * Data portability (GDPR Article 20)
   */
  exportSubjectData(subjectId: string): any | null {
    const data = this.getSubjectData(subjectId);
    if (!data) return null;

    return {
      exportDate: new Date().toISOString(),
      subjectId,
      personalData: data.subject,
      processingHistory: data.processingRecords,
      consentHistory: data.consentRecords,
      format: 'GDPR Article 20 Data Export'
    };
  }

  /**
   * Generate privacy policy
   */
  generatePrivacyPolicy(): string {
    return `# Privacy Policy

## Data Controller
Media Alternatives
Contact: privacy@medialternatives.com

## Data We Collect

### Personal Data
- Email addresses (for authenticated users)
- IP addresses (for security and analytics)
- User agent strings (for compatibility)
- Authentication tokens (encrypted)

### Usage Data
- API request logs
- Search queries (anonymized)
- Analytics data (aggregated)

## Legal Basis for Processing

We process personal data based on:
- **Consent**: When you explicitly agree to data processing
- **Contract**: To provide services you've requested
- **Legitimate Interest**: For security, analytics, and service improvement
- **Legal Obligation**: To comply with applicable laws

## Data Retention

- **Authentication data**: 30 days after last activity
- **Analytics data**: 2 years for trend analysis
- **Consent records**: 5 years for compliance
- **API logs**: 90 days for security

## Your Rights (GDPR)

### Right to Access (Article 15)
You can request a copy of all personal data we hold about you.

### Right to Rectification (Article 16)
You can request correction of inaccurate personal data.

### Right to Erasure (Article 17)
You can request deletion of your personal data ("right to be forgotten").

### Right to Restrict Processing (Article 18)
You can request limitation of how we process your data.

### Right to Data Portability (Article 20)
You can request your data in a structured, machine-readable format.

### Right to Object (Article 21)
You can object to processing based on legitimate interests.

## Contact Us

For privacy-related requests:
- Email: privacy@medialternatives.com
- Response time: Within 30 days
- Data Protection Officer: dpo@medialternatives.com

## Changes to This Policy

We will notify users of material changes via email or prominent notice.

Last updated: ${new Date().toISOString().split('T')[0]}
`;
  }

  /**
   * Generate cookie policy
   */
  generateCookiePolicy(): string {
    return `# Cookie Policy

## What Are Cookies

Cookies are small text files stored on your device when you visit our website.

## Cookies We Use

### Essential Cookies
**Purpose**: Authentication and security
**Duration**: Session or 30 days
**Legal Basis**: Contract performance

### Analytics Cookies
**Purpose**: Website usage analytics
**Duration**: 2 years
**Legal Basis**: Legitimate interest

### Functional Cookies
**Purpose**: Remember your preferences
**Duration**: 1 year
**Legal Basis**: Consent

## Managing Cookies

You can control cookies through your browser settings:
- Chrome: Settings > Privacy > Cookies
- Firefox: Preferences > Privacy > Cookies
- Safari: Preferences > Privacy > Cookies

## Third-Party Cookies

We may use third-party services that set their own cookies:
- Google Analytics (analytics)
- Google AdSense (advertising)

## Updates

This policy may be updated. Check this page for changes.

Last updated: ${new Date().toISOString().split('T')[0]}
`;
  }

  /**
   * Audit log for compliance
   */
  private auditLog: Array<{
    timestamp: string;
    action: string;
    subjectId?: string;
    details: any;
  }> = [];

  private logAudit(action: string, subjectId?: string, details?: any): void {
    this.auditLog.push({
      timestamp: new Date().toISOString(),
      action,
      subjectId,
      details
    });
  }

  /**
   * Get audit trail
   */
  getAuditTrail(subjectId?: string): any[] {
    if (subjectId) {
      return this.auditLog.filter(log => log.subjectId === subjectId);
    }
    return this.auditLog;
  }
}

// Global DPO instance
export const dpo = new DataProtectionOfficer();

/**
 * Privacy middleware
 */
export function withPrivacyCompliance(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Register or update data subject
    let subjectId = request.cookies.get('subject_id')?.value;

    if (!subjectId) {
      subjectId = dpo.registerSubject({
        ipAddress,
        userAgent,
        consentGiven: false,
        dataProcessing: ['analytics', 'security']
      });
    } else {
      // Update last activity
      const subject = dpo.getSubjectData(subjectId);
      if (subject) {
        dpo.rectifySubjectData(subjectId, { lastActivity: new Date().toISOString() });
      }
    }

    // Record data processing
    dpo.recordProcessing({
      subjectId,
      purpose: 'API Request Processing',
      legalBasis: 'legitimate_interest',
      dataCategories: ['IP Address', 'User Agent', 'Request Data'],
      recipients: ['Internal Systems'],
      retentionPeriod: 90 // 90 days
    });

    // Add privacy headers
    const response = await handler(request);

    response.headers.set('X-Privacy-Policy', 'https://medialternatives.com/privacy');
    response.headers.set('X-Data-Subject-ID', subjectId);

    // Set subject ID cookie
    response.cookies.set('subject_id', subjectId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 365 * 24 * 60 * 60 // 1 year
    });

    return response;
  };
}

/**
 * GDPR compliance endpoints
 */
export class GDPRComplianceAPI {
  /**
   * Handle data subject access request
   */
  async handleDataAccess(subjectId: string): Promise<any> {
    const data = dpo.getSubjectData(subjectId);

    if (!data) {
      return {
        success: false,
        error: { code: 'SUBJECT_NOT_FOUND', message: 'Data subject not found' }
      };
    }

    return {
      success: true,
      data: dpo.exportSubjectData(subjectId)
    };
  }

  /**
   * Handle data erasure request
   */
  async handleDataErasure(subjectId: string): Promise<any> {
    const success = dpo.eraseSubjectData(subjectId);

    return {
      success,
      message: success ? 'Data erased successfully' : 'Data erasure failed'
    };
  }

  /**
   * Handle consent management
   */
  async handleConsent(subjectId: string, consentType: string, granted: boolean): Promise<any> {
    const consentId = dpo.recordConsent({
      subjectId,
      consentType,
      granted,
      grantedAt: granted ? new Date().toISOString() : undefined,
      ipAddress: 'system', // Would be populated from request
      userAgent: 'system'
    });

    return {
      success: true,
      consentId,
      message: `Consent ${granted ? 'granted' : 'revoked'} for ${consentType}`
    };
  }
}

// Global compliance API instance
export const gdprAPI = new GDPRComplianceAPI();
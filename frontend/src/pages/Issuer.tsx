import React, { useState } from 'react';
import { FileText, Plus, Eye, Download, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface IssuedCredential {
  id: string;
  type: string;
  subject: string;
  issuanceDate: string;
  status: 'active' | 'expired' | 'revoked';
  credentialHash: string;
  metadataURI: string;
}

export default function Issuer() {
  const { isAuthenticated } = useAuth();
  const [issuedCredentials, setIssuedCredentials] = useState<IssuedCredential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showIssueForm, setShowIssueForm] = useState(false);

  const [formData, setFormData] = useState({
    type: 'IdentityCredential',
    subject: {
      id: '',
      type: 'Person',
      properties: {
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        nationality: '',
      }
    },
    expirationDate: '',
  });

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call the API
      const newCredential: IssuedCredential = {
        id: `urn:trustkey:credential:${Date.now()}`,
        type: formData.type,
        subject: formData.subject.id,
        issuanceDate: new Date().toISOString(),
        status: 'active',
        credentialHash: `0x${Math.random().toString(16).substring(2)}...`,
        metadataURI: `ipfs://Qm${Math.random().toString(16).substring(2)}`,
      };

      setIssuedCredentials(prev => [newCredential, ...prev]);
      toast.success('Credential issued successfully!');
      setShowIssueForm(false);
      setFormData({
        type: 'IdentityCredential',
        subject: {
          id: '',
          type: 'Person',
          properties: {
            name: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            nationality: '',
          }
        },
        expirationDate: '',
      });
    } catch (error: any) {
      console.error('Failed to issue credential:', error);
      toast.error('Failed to issue credential');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'expired':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'revoked':
        return <Clock className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>;
      case 'expired':
        return <span className="badge badge-warning">Expired</span>;
      case 'revoked':
        return <span className="badge badge-error">Revoked</span>;
      default:
        return <span className="badge badge-gray">Unknown</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication required</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please login to issue credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Credential Issuer
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Issue verifiable credentials to users
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={() => setShowIssueForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Issue Credential
          </button>
        </div>
      </div>

      {/* Issued Credentials */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Issued Credentials</h3>
        </div>
        <div className="card-body p-0">
          {issuedCredentials.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No credentials issued</h3>
              <p className="mt-1 text-sm text-gray-500">
                Issue your first credential to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {issuedCredentials.map((credential) => (
                <div key={credential.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(credential.status)}
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {credential.type}
                          </h4>
                          <div className="ml-2">
                            {getStatusBadge(credential.status)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          Subject: {credential.subject}
                        </p>
                        <p className="text-sm text-gray-500">
                          Issued on {formatDate(credential.issuanceDate)}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {credential.credentialHash}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="btn btn-sm btn-secondary">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="btn btn-sm btn-secondary">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Issue Credential Form */}
      {showIssueForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              <form onSubmit={handleIssueCredential}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Credential</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Credential Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="input"
                        required
                      >
                        <option value="IdentityCredential">Identity Credential</option>
                        <option value="EducationCredential">Education Credential</option>
                        <option value="ProfessionalCredential">Professional Credential</option>
                        <option value="MembershipCredential">Membership Credential</option>
                        <option value="CertificationCredential">Certification Credential</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Subject ID</label>
                      <input
                        type="text"
                        value={formData.subject.id}
                        onChange={(e) => setFormData({
                          ...formData,
                          subject: { ...formData.subject, id: e.target.value }
                        })}
                        className="input"
                        placeholder="did:ethr:0x..."
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Subject Type</label>
                      <select
                        value={formData.subject.type}
                        onChange={(e) => setFormData({
                          ...formData,
                          subject: { ...formData.subject, type: e.target.value }
                        })}
                        className="input"
                        required
                      >
                        <option value="Person">Person</option>
                        <option value="Organization">Organization</option>
                        <option value="Device">Device</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Name</label>
                      <input
                        type="text"
                        value={formData.subject.properties.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          subject: {
                            ...formData.subject,
                            properties: { ...formData.subject.properties, name: e.target.value }
                          }
                        })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        value={formData.subject.properties.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          subject: {
                            ...formData.subject,
                            properties: { ...formData.subject.properties, email: e.target.value }
                          }
                        })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input
                        type="tel"
                        value={formData.subject.properties.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          subject: {
                            ...formData.subject,
                            properties: { ...formData.subject.properties, phone: e.target.value }
                          }
                        })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.subject.properties.dateOfBirth}
                        onChange={(e) => setFormData({
                          ...formData,
                          subject: {
                            ...formData.subject,
                            properties: { ...formData.subject.properties, dateOfBirth: e.target.value }
                          }
                        })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Nationality</label>
                      <input
                        type="text"
                        value={formData.subject.properties.nationality}
                        onChange={(e) => setFormData({
                          ...formData,
                          subject: {
                            ...formData.subject,
                            properties: { ...formData.subject.properties, nationality: e.target.value }
                          }
                        })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Expiration Date (Optional)</label>
                      <input
                        type="date"
                        value={formData.expirationDate}
                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    className="btn btn-primary sm:ml-3"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Issuing...' : 'Issue Credential'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowIssueForm(false)}
                    className="btn btn-secondary mt-3 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

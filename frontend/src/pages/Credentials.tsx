import React, { useState, useEffect } from 'react';
import { Shield, Plus, Eye, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface Credential {
  id: string;
  type: string;
  issuer: string;
  subject: string;
  issuanceDate: string;
  expirationDate?: string;
  status: 'active' | 'expired' | 'revoked';
  credentialHash: string;
  metadataURI: string;
}

export default function Credentials() {
  const { isAuthenticated } = useAuth();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    type: 'IdentityCredential',
    subject: {
      id: '',
      type: 'Person',
      properties: {
        name: '',
        email: '',
        phone: '',
      }
    },
    expirationDate: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchCredentials();
    }
  }, [isAuthenticated]);

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      // Mock data for demonstration
      setTimeout(() => {
        setCredentials([
          {
            id: 'urn:trustkey:credential:12345',
            type: 'IdentityCredential',
            issuer: 'did:ethr:0x1234...5678',
            subject: 'did:ethr:0xabcd...efgh',
            issuanceDate: new Date().toISOString(),
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            credentialHash: '0x1234567890abcdef...',
            metadataURI: 'ipfs://QmExample123',
          },
          {
            id: 'urn:trustkey:credential:67890',
            type: 'EducationCredential',
            issuer: 'did:ethr:0x9876...5432',
            subject: 'did:ethr:0xabcd...efgh',
            issuanceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            credentialHash: '0xabcdef1234567890...',
            metadataURI: 'ipfs://QmExample456',
          },
        ]);
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error('Failed to fetch credentials:', error);
      toast.error('Failed to fetch credentials');
      setIsLoading(false);
    }
  };

  const handleCreateCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call the API
      toast.success('Credential created successfully!');
      setShowCreateForm(false);
      fetchCredentials();
    } catch (error: any) {
      console.error('Failed to create credential:', error);
      toast.error('Failed to create credential');
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
        return <XCircle className="h-5 w-5 text-red-500" />;
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
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication required</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please login to manage your credentials.
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
            Credentials
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your verifiable credentials and digital certificates
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Credential
          </button>
        </div>
      </div>

      {/* Credentials List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Your Credentials</h3>
        </div>
        <div className="card-body p-0">
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="loading-spinner mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading credentials...</p>
            </div>
          ) : credentials.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No credentials</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first credential.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {credentials.map((credential) => (
                <div key={credential.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(credential.status)}
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {credential.type}
                          </h4>
                          <div className="ml-2">
                            {getStatusBadge(credential.status)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          Issued on {formatDate(credential.issuanceDate)}
                          {credential.expirationDate && (
                            <span> • Expires on {formatDate(credential.expirationDate)}</span>
                          )}
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

      {/* Create Credential Form */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <form onSubmit={handleCreateCredential}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create Credential</h3>
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
                      <label className="label">Subject Name</label>
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
                      <label className="label">Subject Email</label>
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
                      <label className="label">Subject Phone</label>
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
                    {isLoading ? 'Creating...' : 'Create Credential'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
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

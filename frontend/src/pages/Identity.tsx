import React, { useState, useEffect } from 'react';
import { User, Shield, CheckCircle, AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface IdentityData {
  identityId: string;
  wallet: string;
  credentialHash: string;
  timestamp: string;
  isActive: boolean;
  metadataURI: string;
  metadata?: any;
}

export default function Identity() {
  const { account, isConnected } = useWeb3();
  const { user, isAuthenticated } = useAuth();
  const [identity, setIdentity] = useState<IdentityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const [formData, setFormData] = useState({
    type: 'IdentityCredential',
    properties: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      nationality: '',
    },
    expirationDate: '',
  });

  useEffect(() => {
    if (isAuthenticated && account) {
      fetchIdentity();
    }
  }, [isAuthenticated, account]);

  const fetchIdentity = async () => {
    if (!account) return;

    setIsLoading(true);
    try {
      // In a real implementation, this would call the API
      // const response = await identityService.getIdentity(account);
      // setIdentity(response.data);
      
      // Mock data for demonstration
      setTimeout(() => {
        setIdentity({
          identityId: 'urn:trustkey:credential:12345',
          wallet: account,
          credentialHash: '0x1234567890abcdef...',
          timestamp: new Date().toISOString(),
          isActive: true,
          metadataURI: 'ipfs://QmExample123',
          metadata: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
          }
        });
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error('Failed to fetch identity:', error);
      toast.error('Failed to fetch identity data');
      setIsLoading(false);
    }
  };

  const handleCreateIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call the API
      // await identityService.registerIdentity(formData);
      
      toast.success('Identity created successfully!');
      setShowCreateForm(false);
      fetchIdentity();
    } catch (error: any) {
      console.error('Failed to create identity:', error);
      toast.error('Failed to create identity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call the API
      // await identityService.updateIdentity(formData);
      
      toast.success('Identity updated successfully!');
      setShowUpdateForm(false);
      fetchIdentity();
    } catch (error: any) {
      console.error('Failed to update identity:', error);
      toast.error('Failed to update identity');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateIdentity = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    if (!confirm('Are you sure you want to deactivate your identity? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call the API
      // await identityService.deactivateIdentity();
      
      toast.success('Identity deactivated successfully');
      setIdentity(null);
    } catch (error: any) {
      console.error('Failed to deactivate identity:', error);
      toast.error('Failed to deactivate identity');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No wallet connected</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please connect your wallet to manage your identity.
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Shield className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication required</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please login to manage your identity.
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
            Identity Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your decentralized identity and verifiable credentials
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          {!identity ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Identity
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowUpdateForm(true)}
                className="btn btn-secondary"
              >
                <Edit className="h-4 w-4 mr-2" />
                Update
              </button>
              <button
                onClick={handleDeactivateIdentity}
                className="btn btn-error"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deactivate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Identity Status */}
      {identity && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {identity.isActive ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-500" />
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  {identity.isActive ? 'Active Identity' : 'Inactive Identity'}
                </h3>
                <p className="text-sm text-gray-500">
                  Created on {formatDate(identity.timestamp)}
                </p>
              </div>
            </div>
          </div>
          <div className="card-body">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Identity ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {identity.identityId}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Wallet Address</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {identity.wallet}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Credential Hash</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {identity.credentialHash}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Metadata URI</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">
                  {identity.metadataURI}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Identity Properties */}
      {identity?.metadata && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Identity Properties</h3>
          </div>
          <div className="card-body">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {Object.entries(identity.metadata).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-sm font-medium text-gray-500 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* Create Identity Form */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <form onSubmit={handleCreateIdentity}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create Identity</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Credential Type</label>
                      <input
                        type="text"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Name</label>
                      <input
                        type="text"
                        value={formData.properties.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          properties: { ...formData.properties, name: e.target.value }
                        })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        value={formData.properties.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          properties: { ...formData.properties, email: e.target.value }
                        })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input
                        type="tel"
                        value={formData.properties.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          properties: { ...formData.properties, phone: e.target.value }
                        })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.properties.dateOfBirth}
                        onChange={(e) => setFormData({
                          ...formData,
                          properties: { ...formData.properties, dateOfBirth: e.target.value }
                        })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Nationality</label>
                      <input
                        type="text"
                        value={formData.properties.nationality}
                        onChange={(e) => setFormData({
                          ...formData,
                          properties: { ...formData.properties, nationality: e.target.value }
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
                    {isLoading ? 'Creating...' : 'Create Identity'}
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

      {/* Update Identity Form */}
      {showUpdateForm && identity && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <form onSubmit={handleUpdateIdentity}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Update Identity</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Name</label>
                      <input
                        type="text"
                        value={formData.properties.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          properties: { ...formData.properties, name: e.target.value }
                        })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input
                        type="email"
                        value={formData.properties.email}
                        onChange={(e) => setFormData({
                          ...formData,
                          properties: { ...formData.properties, email: e.target.value }
                        })}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <input
                        type="tel"
                        value={formData.properties.phone}
                        onChange={(e) => setFormData({
                          ...formData,
                          properties: { ...formData.properties, phone: e.target.value }
                        })}
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
                    {isLoading ? 'Updating...' : 'Update Identity'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUpdateForm(false)}
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

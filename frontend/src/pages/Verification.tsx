import React, { useState } from 'react';
import { CheckCircle, Upload, FileText, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface VerificationRequest {
  id: string;
  credentialHash: string;
  verificationType: string;
  status: 'pending' | 'verified' | 'failed';
  timestamp: string;
  result?: any;
}

export default function Verification() {
  const { isAuthenticated } = useAuth();
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerifyForm, setShowVerifyForm] = useState(false);

  const [formData, setFormData] = useState({
    credentialHash: '',
    verificationType: 'identity_verification',
    proof: '',
    publicSignals: '',
  });

  const handleVerifyCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, this would call the API
      const newRequest: VerificationRequest = {
        id: Date.now().toString(),
        credentialHash: formData.credentialHash,
        verificationType: formData.verificationType,
        status: 'pending',
        timestamp: new Date().toISOString(),
      };

      setVerificationRequests(prev => [newRequest, ...prev]);
      toast.success('Verification request submitted!');
      setShowVerifyForm(false);
      setFormData({
        credentialHash: '',
        verificationType: 'identity_verification',
        proof: '',
        publicSignals: '',
      });
    } catch (error: any) {
      console.error('Failed to submit verification:', error);
      toast.error('Failed to submit verification request');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="badge badge-success">Verified</span>;
      case 'failed':
        return <span className="badge badge-error">Failed</span>;
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
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
        <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication required</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please login to verify credentials.
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
            Verification
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Verify credentials using zero-knowledge proofs
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={() => setShowVerifyForm(true)}
            className="btn btn-primary"
          >
            <Upload className="h-4 w-4 mr-2" />
            Verify Credential
          </button>
        </div>
      </div>

      {/* Verification Requests */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Verification Requests</h3>
        </div>
        <div className="card-body p-0">
          {verificationRequests.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No verification requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                Submit a verification request to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {verificationRequests.map((request) => (
                <div key={request.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(request.status)}
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {request.verificationType.replace('_', ' ').toUpperCase()}
                          </h4>
                          <div className="ml-2">
                            {getStatusBadge(request.status)}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          Hash: {request.credentialHash}
                        </p>
                        <p className="text-xs text-gray-400">
                          Submitted on {formatDate(request.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="btn btn-sm btn-secondary">
                        <FileText className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verify Credential Form */}
      {showVerifyForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <form onSubmit={handleVerifyCredential}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Verify Credential</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="label">Credential Hash</label>
                      <input
                        type="text"
                        value={formData.credentialHash}
                        onChange={(e) => setFormData({ ...formData, credentialHash: e.target.value })}
                        className="input"
                        placeholder="0x..."
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Verification Type</label>
                      <select
                        value={formData.verificationType}
                        onChange={(e) => setFormData({ ...formData, verificationType: e.target.value })}
                        className="input"
                        required
                      >
                        <option value="identity_verification">Identity Verification</option>
                        <option value="age_verification">Age Verification</option>
                        <option value="kyc_verification">KYC Verification</option>
                        <option value="reputation_verification">Reputation Verification</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">ZKP Proof (JSON)</label>
                      <textarea
                        value={formData.proof}
                        onChange={(e) => setFormData({ ...formData, proof: e.target.value })}
                        className="input"
                        rows={4}
                        placeholder='{"pi_a": [...], "pi_b": [...], "pi_c": [...]}'
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Public Signals (JSON)</label>
                      <textarea
                        value={formData.publicSignals}
                        onChange={(e) => setFormData({ ...formData, publicSignals: e.target.value })}
                        className="input"
                        rows={2}
                        placeholder='["signal1", "signal2"]'
                        required
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
                    {isLoading ? 'Submitting...' : 'Submit Verification'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVerifyForm(false)}
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

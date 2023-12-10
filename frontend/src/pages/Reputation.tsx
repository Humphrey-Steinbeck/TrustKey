import React, { useState, useEffect } from 'react';
import { Award, TrendingUp, TrendingDown, Star, Users, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReputationData {
  totalScore: number;
  trustLevel: number;
  lastUpdated: string;
  positiveEvents: number;
  negativeEvents: number;
  isActive: boolean;
}

interface ReputationEvent {
  id: string;
  type: string;
  description: string;
  scoreChange: number;
  timestamp: string;
  issuer: string;
}

export default function Reputation() {
  const { isAuthenticated } = useAuth();
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [events, setEvents] = useState<ReputationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReputation();
      fetchReputationEvents();
    }
  }, [isAuthenticated]);

  const fetchReputation = async () => {
    setIsLoading(true);
    try {
      // Mock data for demonstration
      setTimeout(() => {
        setReputation({
          totalScore: 750,
          trustLevel: 4,
          lastUpdated: new Date().toISOString(),
          positiveEvents: 15,
          negativeEvents: 2,
          isActive: true,
        });
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error('Failed to fetch reputation:', error);
      setIsLoading(false);
    }
  };

  const fetchReputationEvents = async () => {
    try {
      // Mock data for demonstration
      setTimeout(() => {
        setEvents([
          {
            id: '1',
            type: 'verification_completed',
            description: 'Successfully verified identity credential',
            scoreChange: 25,
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            issuer: 'did:ethr:0x1234...5678',
          },
          {
            id: '2',
            type: 'transaction_completed',
            description: 'Completed successful transaction',
            scoreChange: 15,
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            issuer: 'did:ethr:0x9876...5432',
          },
          {
            id: '3',
            type: 'review_positive',
            description: 'Received positive review',
            scoreChange: 10,
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            issuer: 'did:ethr:0xabcd...efgh',
          },
          {
            id: '4',
            type: 'verification_failed',
            description: 'Failed to verify credential',
            scoreChange: -5,
            timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            issuer: 'did:ethr:0x5678...9012',
          },
        ]);
      }, 1000);
    } catch (error: any) {
      console.error('Failed to fetch reputation events:', error);
    }
  };

  const getTrustLevelLabel = (level: number) => {
    switch (level) {
      case 1: return 'Newcomer';
      case 2: return 'Established';
      case 3: return 'Trusted';
      case 4: return 'Highly Trusted';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  const getTrustLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'text-gray-500';
      case 2: return 'text-blue-500';
      case 3: return 'text-green-500';
      case 4: return 'text-purple-500';
      case 5: return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'verification_completed':
      case 'transaction_completed':
      case 'review_positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'verification_failed':
      case 'review_negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
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

  // Mock chart data
  const chartData = [
    { date: '2023-01', score: 500 },
    { date: '2023-02', score: 520 },
    { date: '2023-03', score: 580 },
    { date: '2023-04', score: 620 },
    { date: '2023-05', score: 650 },
    { date: '2023-06', score: 680 },
    { date: '2023-07', score: 720 },
    { date: '2023-08', score: 750 },
  ];

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Award className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Authentication required</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please login to view your reputation.
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
            Reputation
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your reputation score and trust level
          </p>
        </div>
      </div>

      {/* Reputation Overview */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading reputation data...</p>
        </div>
      ) : reputation ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Score
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {reputation.totalScore}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Trust Level
                    </dt>
                    <dd className={`text-2xl font-semibold ${getTrustLevelColor(reputation.trustLevel)}`}>
                      {reputation.trustLevel}/5
                    </dd>
                    <dd className="text-sm text-gray-500">
                      {getTrustLevelLabel(reputation.trustLevel)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Positive Events
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {reputation.positiveEvents}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Negative Events
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {reputation.negativeEvents}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Award className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reputation data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start building your reputation by completing verifications and transactions.
          </p>
        </div>
      )}

      {/* Reputation Chart */}
      {reputation && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Reputation Score Over Time</h3>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Reputation Events */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Recent Reputation Events</h3>
        </div>
        <div className="card-body p-0">
          {events.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Reputation events will appear here as you interact with the system.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <div key={event.id} className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-900">{event.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-medium ${
                            event.scoreChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {event.scoreChange > 0 ? '+' : ''}{event.scoreChange}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(event.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        Issued by: {event.issuer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

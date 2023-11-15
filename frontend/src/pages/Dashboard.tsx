import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Shield, 
  Award, 
  CheckCircle, 
  TrendingUp, 
  Activity,
  Users,
  FileText,
  ArrowRight,
  Wallet
} from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { account, isConnected } = useWeb3();
  const { user, isAuthenticated } = useAuth();

  const stats = [
    {
      name: 'Total Identities',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Active Credentials',
      value: '5,678',
      change: '+8%',
      changeType: 'positive',
      icon: Shield,
    },
    {
      name: 'Verifications',
      value: '9,012',
      change: '+15%',
      changeType: 'positive',
      icon: CheckCircle,
    },
    {
      name: 'Reputation Score',
      value: '4.8/5.0',
      change: '+0.2',
      changeType: 'positive',
      icon: Award,
    },
  ];

  const quickActions = [
    {
      name: 'Create Identity',
      description: 'Register your decentralized identity',
      href: '/identity',
      icon: User,
      color: 'bg-blue-500',
    },
    {
      name: 'Issue Credential',
      description: 'Generate verifiable credentials',
      href: '/issuer',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      name: 'Verify Credential',
      description: 'Verify credential authenticity',
      href: '/verification',
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
    {
      name: 'View Reputation',
      description: 'Check your reputation score',
      href: '/reputation',
      icon: Award,
      color: 'bg-orange-500',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'credential_issued',
      message: 'Identity credential issued to 0x1234...5678',
      timestamp: '2 minutes ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'verification_completed',
      message: 'Credential verification completed',
      timestamp: '5 minutes ago',
      status: 'success',
    },
    {
      id: 3,
      type: 'reputation_updated',
      message: 'Reputation score increased by 10 points',
      timestamp: '1 hour ago',
      status: 'success',
    },
    {
      id: 4,
      type: 'identity_registered',
      message: 'New identity registered',
      timestamp: '2 hours ago',
      status: 'success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
            Welcome to TrustKey
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Your decentralized identity and reputation management platform
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          {!isConnected ? (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Wallet className="h-4 w-4" />
              <span>Connect your wallet to get started</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="h-2 w-2 bg-green-400 rounded-full"></div>
              <span>Connected: {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Wallet'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="h-4 w-4 flex-shrink-0 self-center" />
                        <span className="sr-only">
                          {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="card hover:shadow-medium transition-shadow duration-200"
            >
              <div className="card-body">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`h-2 w-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-sm text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <Link
              to="/activity"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all activity
              <ArrowRight className="ml-1 h-4 w-4 inline" />
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-900">Blockchain Network</span>
                </div>
                <span className="badge badge-success">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-900">Smart Contracts</span>
                </div>
                <span className="badge badge-success">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-900">IPFS Storage</span>
                </div>
                <span className="badge badge-success">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-900">Verification Service</span>
                </div>
                <span className="badge badge-success">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

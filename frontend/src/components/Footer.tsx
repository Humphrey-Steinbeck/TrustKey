import React from 'react';
import { Shield, Github, Twitter, Discord, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-primary-400" />
              <span className="ml-2 text-xl font-bold">TrustKey</span>
            </div>
            <p className="text-gray-300 mb-4">
              A decentralized identity and reputation system built on blockchain technology. 
              Empowering users with privacy-preserving digital credentials and trust mechanisms.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/Humphrey-Steinbeck/TrustKey" className="text-gray-400 hover:text-white">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/trustkey" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://discord.gg/trustkey" className="text-gray-400 hover:text-white">
                <Discord className="h-5 w-5" />
              </a>
              <a href="mailto:contact@trustkey.io" className="text-gray-400 hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="/identity" className="text-gray-300 hover:text-white">Identity Management</a></li>
              <li><a href="/credentials" className="text-gray-300 hover:text-white">Verifiable Credentials</a></li>
              <li><a href="/reputation" className="text-gray-300 hover:text-white">Reputation System</a></li>
              <li><a href="/verification" className="text-gray-300 hover:text-white">Credential Verification</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="/docs" className="text-gray-300 hover:text-white">Documentation</a></li>
              <li><a href="/api" className="text-gray-300 hover:text-white">API Reference</a></li>
              <li><a href="/security" className="text-gray-300 hover:text-white">Security</a></li>
              <li><a href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2023 TrustKey. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="/terms" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              <a href="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="/cookies" className="text-gray-400 hover:text-white text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const blockchainService = require('../services/BlockchainService');

/**
 * Reputation Controller
 * Handles reputation-related operations
 */
class ReputationController {
  /**
   * Get reputation data for a wallet address
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getReputationData(req, res) {
    try {
      const { address } = req.params;

      // Get reputation data from blockchain
      const reputationData = await blockchainService.getReputationData(address);

      if (!reputationData || !reputationData.isActive) {
        return res.status(404).json({
          success: false,
          error: 'No reputation data found for this address'
        });
      }

      // Calculate trust level
      const trustLevel = this.calculateTrustLevel(reputationData.totalScore);
      const trustLevelLabel = this.getTrustLevelLabel(trustLevel);

      res.json({
        success: true,
        data: {
          address,
          totalScore: parseInt(reputationData.totalScore),
          trustLevel,
          trustLevelLabel,
          lastUpdated: reputationData.lastUpdated,
          positiveEvents: parseInt(reputationData.positiveEvents),
          negativeEvents: parseInt(reputationData.negativeEvents),
          isActive: reputationData.isActive,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting reputation data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reputation data',
        message: error.message
      });
    }
  }

  /**
   * Issue a reputation event
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async issueReputationEvent(req, res) {
    try {
      const { targetWallet, scoreChange, eventType, description, proofHash } = req.body;
      const issuerAddress = req.user.address;

      // Issue reputation event on blockchain
      const txResult = await blockchainService.issueReputationEvent(
        targetWallet,
        scoreChange,
        eventType,
        description,
        proofHash
      );

      res.status(201).json({
        success: true,
        message: 'Reputation event issued successfully',
        data: {
          targetWallet,
          scoreChange,
          eventType,
          description,
          issuer: issuerAddress,
          transactionHash: txResult.transactionHash,
          blockNumber: txResult.blockNumber,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error issuing reputation event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to issue reputation event',
        message: error.message
      });
    }
  }

  /**
   * Get reputation events for a wallet
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getReputationEvents(req, res) {
    try {
      const { address } = req.params;

      // Get reputation events from blockchain
      const eventIds = await blockchainService.getWalletEvents(address);
      
      // Get event details for each ID
      const events = await Promise.all(
        eventIds.map(async (eventId) => {
          try {
            return await blockchainService.getReputationEvent(eventId);
          } catch (error) {
            console.warn(`Failed to get event ${eventId}:`, error.message);
            return null;
          }
        })
      );

      // Filter out null results and format events
      const validEvents = events
        .filter(event => event !== null)
        .map(event => ({
          eventId: event.eventId,
          type: event.eventType,
          description: event.description,
          scoreChange: parseInt(event.scoreChange),
          timestamp: event.timestamp,
          issuer: event.issuerWallet,
          proofHash: event.proofHash
        }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.json({
        success: true,
        data: {
          address,
          events: validEvents,
          count: validEvents.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting reputation events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reputation events',
        message: error.message
      });
    }
  }

  /**
   * Get reputation event details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getReputationEvent(req, res) {
    try {
      const { eventId } = req.params;

      // Get reputation event from blockchain
      const eventData = await blockchainService.getReputationEvent(eventId);

      if (!eventData || !eventData.eventId) {
        return res.status(404).json({
          success: false,
          error: 'Reputation event not found'
        });
      }

      res.json({
        success: true,
        data: {
          eventId: eventData.eventId,
          targetWallet: eventData.targetWallet,
          issuerWallet: eventData.issuerWallet,
          scoreChange: parseInt(eventData.scoreChange),
          eventType: eventData.eventType,
          description: eventData.description,
          timestamp: eventData.timestamp,
          proofHash: eventData.proofHash
        }
      });
    } catch (error) {
      console.error('Error getting reputation event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reputation event',
        message: error.message
      });
    }
  }

  /**
   * Get reputation data for multiple wallets
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getBatchReputationData(req, res) {
    try {
      const { addresses } = req.body;

      const reputationData = await Promise.all(
        addresses.map(async (address) => {
          try {
            const data = await blockchainService.getReputationData(address);
            if (data && data.isActive) {
              return {
                address,
                totalScore: parseInt(data.totalScore),
                trustLevel: this.calculateTrustLevel(data.totalScore),
                trustLevelLabel: this.getTrustLevelLabel(this.calculateTrustLevel(data.totalScore)),
                positiveEvents: parseInt(data.positiveEvents),
                negativeEvents: parseInt(data.negativeEvents),
                isActive: data.isActive
              };
            } else {
              return {
                address,
                totalScore: 0,
                trustLevel: 1,
                trustLevelLabel: 'Newcomer',
                positiveEvents: 0,
                negativeEvents: 0,
                isActive: false
              };
            }
          } catch (error) {
            return {
              address,
              error: error.message
            };
          }
        })
      );

      res.json({
        success: true,
        data: {
          reputationData,
          count: reputationData.length,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting batch reputation data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get batch reputation data',
        message: error.message
      });
    }
  }

  /**
   * Get reputation leaderboard
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getReputationLeaderboard(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;

      // In a real implementation, this would query a database
      // For now, return mock data
      const leaderboard = [
        {
          rank: 1,
          address: '0x1234567890123456789012345678901234567890',
          totalScore: 1250,
          trustLevel: 5,
          trustLevelLabel: 'Expert',
          positiveEvents: 25,
          negativeEvents: 1
        },
        {
          rank: 2,
          address: '0x2345678901234567890123456789012345678901',
          totalScore: 1100,
          trustLevel: 5,
          trustLevelLabel: 'Expert',
          positiveEvents: 22,
          negativeEvents: 0
        },
        {
          rank: 3,
          address: '0x3456789012345678901234567890123456789012',
          totalScore: 950,
          trustLevel: 4,
          trustLevelLabel: 'Highly Trusted',
          positiveEvents: 19,
          negativeEvents: 2
        }
      ];

      res.json({
        success: true,
        data: {
          leaderboard: leaderboard.slice(offset, offset + parseInt(limit)),
          total: leaderboard.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting reputation leaderboard:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reputation leaderboard',
        message: error.message
      });
    }
  }

  /**
   * Get reputation system overview
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getReputationOverview(req, res) {
    try {
      // In a real implementation, this would query the database
      // For now, return mock data
      const overview = {
        totalUsers: 1234,
        totalEvents: 5678,
        averageScore: 450,
        trustLevelDistribution: {
          'Newcomer (1)': 234,
          'Established (2)': 456,
          'Trusted (3)': 345,
          'Highly Trusted (4)': 123,
          'Expert (5)': 76
        },
        eventTypeDistribution: {
          'verification_completed': 2345,
          'transaction_completed': 1234,
          'review_positive': 987,
          'review_negative': 123,
          'other': 989
        },
        recentActivity: {
          eventsLast24h: 45,
          eventsLast7d: 234,
          eventsLast30d: 987
        }
      };

      res.json({
        success: true,
        data: {
          overview,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error getting reputation overview:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get reputation overview',
        message: error.message
      });
    }
  }

  /**
   * Calculate trust level based on score
   * @param {number} score - Reputation score
   * @returns {number} - Trust level (1-5)
   */
  calculateTrustLevel(score) {
    if (score >= 1000) return 5;
    if (score >= 600) return 4;
    if (score >= 300) return 3;
    if (score >= 100) return 2;
    return 1;
  }

  /**
   * Get trust level label
   * @param {number} level - Trust level
   * @returns {string} - Trust level label
   */
  getTrustLevelLabel(level) {
    const labels = {
      1: 'Newcomer',
      2: 'Established',
      3: 'Trusted',
      4: 'Highly Trusted',
      5: 'Expert'
    };
    return labels[level] || 'Unknown';
  }
}

module.exports = new ReputationController();

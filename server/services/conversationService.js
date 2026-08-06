const { v4: uuidv4 } = require('uuid');
const Conversation = require('../models/Conversation');

/**
 * Save a message to the Conversation collection.
 * @param {string} sessionId - Unique identifier for the interview session.
 * @param {'candidate'|'ai'} speaker - Who sent the message.
 * @param {string} message - The text content.
 * @returns {Promise<void>}
 */
const saveMessage = async (sessionId, speaker, message) => {
  if (!sessionId || !speaker || !message) return;
  await Conversation.create({ sessionId, speaker, message });
};

/**
 * Retrieve the most recent messages for a session.
 * @param {string} sessionId - Session identifier.
 * @param {number} limit - Number of recent messages to fetch.
 * @returns {Promise<Array<{speaker:string,message:string,timestamp:Date}>>}
 */
const getRecentMessages = async (sessionId, limit = 10) => {
  if (!sessionId) return [];
  return Conversation.find({ sessionId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean()
    .exec();
};

module.exports = { saveMessage, getRecentMessages };

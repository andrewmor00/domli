import express from 'express';
import gigaChatService from '../services/gigachatService.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Store conversation history temporarily (in production, use Redis or database)
const conversationSessions = new Map();

// Initialize GigaChat service
gigaChatService.initialize().catch(error => {
  console.error('Failed to initialize GigaChat service:', error);
});

// Chat endpoint - Main chat interaction
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const userMessage = message.trim();
    const session = sessionId || `session_${Date.now()}`;

    // Get conversation history
    let conversationHistory = conversationSessions.get(session) || [];

    console.log(`💬 Chat request - Session: ${session}, Message: "${userMessage}"`);

    // Generate AI response
    const aiResponse = await gigaChatService.generateResponse(userMessage, conversationHistory);

    // Update conversation history
    conversationHistory.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    });

    conversationHistory.push({
      role: 'assistant',
      content: aiResponse.message,
      timestamp: new Date().toISOString()
    });

    // Keep only last 10 messages to avoid memory issues
    if (conversationHistory.length > 10) {
      conversationHistory = conversationHistory.slice(-10);
    }

    // Store updated history
    conversationSessions.set(session, conversationHistory);

    // Clean up old sessions (keep sessions for 2 hours)
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    for (const [key, value] of conversationSessions.entries()) {
      const lastMessage = value[value.length - 1];
      if (lastMessage && new Date(lastMessage.timestamp).getTime() < twoHoursAgo) {
        conversationSessions.delete(key);
      }
    }

    res.json({
      success: true,
      response: aiResponse.message,
      properties: aiResponse.properties || [],
      filters: aiResponse.filters || {},
      sessionId: session,
      conversationHistory: conversationHistory
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Произошла ошибка при обработке сообщения. Попробуйте позже.'
    });
  }
});

// Get conversation history
router.get('/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = conversationSessions.get(sessionId) || [];

    res.json({
      success: true,
      sessionId,
      history
    });
  } catch (error) {
    console.error('History endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation history'
    });
  }
});

// Clear conversation history
router.delete('/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    conversationSessions.delete(sessionId);

    res.json({
      success: true,
      message: 'Conversation history cleared'
    });
  } catch (error) {
    console.error('Clear history endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear conversation history'
    });
  }
});

// Property search endpoint (direct search without AI)
router.post('/search', async (req, res) => {
  try {
    const filters = req.body;
    console.log('🔍 Direct property search:', filters);

    const properties = await gigaChatService.searchProperties(filters);

    res.json({
      success: true,
      properties,
      count: properties.length,
      filters
    });

  } catch (error) {
    console.error('Search endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      properties: []
    });
  }
});

// Get available AI models (optional endpoint for admin/debugging)
router.get('/models', verifyToken, async (req, res) => {
  try {
    const modelsResponse = await gigaChatService.getModels();
    res.json(modelsResponse);
  } catch (error) {
    console.error('Models endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get models',
      models: []
    });
  }
});

// Health check for chat service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'Chat service is running',
    sessionCount: conversationSessions.size,
    timestamp: new Date().toISOString()
  });
});

// Get suggested questions for users
router.get('/suggestions', (req, res) => {
  const suggestions = [
    "Покажи мне однокомнатные квартиры до 5 млн рублей",
    "Найди квартиры в центре Краснодара",
    "Что есть из готового жилья?",
    "Покажи студии и малогабаритные квартиры",
    "Найди квартиры от 3 до 7 миллионов",
    "Какие есть новостройки в котловане?",
    "Покажи трехкомнатные квартиры",
    "Что есть в районе ЗИП?",
    "Найди квартиры с хорошей планировкой",
    "Покажи самые дешевые варианты"
  ];

  res.json({
    success: true,
    suggestions
  });
});

export default router; 
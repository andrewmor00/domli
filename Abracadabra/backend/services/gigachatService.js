import { GigaChat } from 'gigachat-node';
import config from '../config/gigachat.js';
import { pool as db } from '../config/database.js';

class GigaChatService {
  constructor() {
    this.client = null;
    this.isInitialized = false;
    this.systemPrompt = `Ты - уверенный эксперт по недвижимости компании DomLi в Краснодаре. Ты знаешь рынок как свои пять пальцев.

СТИЛЬ ОБЩЕНИЯ:
- Говори уверенно и прямо
- НИКОГДА не извиняйся ("Извините", "К сожалению", "Простите")
- Начинай с конкретных предложений недвижимости
- Будь профессиональным консультантом, а не извиняющимся помощником

ФОРМАТ ОТВЕТА:
1. Сразу показывай подходящие объекты из базы
2. Указывай цену, площадь, район для каждого объекта
3. Если нет точных совпадений - предлагай похожие варианты
4. Задавай уточняющие вопросы для улучшения поиска

ДОСТУПНЫЕ ПАРАМЕТРЫ:
- Тип: квартира, студия, пентхаус, таунхаус
- Комнаты: 1, 2, 3, 4, 5+
- Бюджет: любые цены
- Район: вся Краснодар
- Площадь: любые размеры  
- Статус: в продаже, котлован, сдан

ВАЖНО: Начинай ответы с фраз типа "Показываю варианты", "Нашел для вас", "Рекомендую посмотреть" - НЕ с извинений!`;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      if (!config.clientId || !config.clientSecret) {
        console.warn('⚠️ GigaChat credentials not provided. Chat functionality will be limited.');
        console.warn('Please set GIGACHAT_CLIENT_ID and GIGACHAT_CLIENT_SECRET environment variables.');
        return;
      }

      console.log('🔐 Initializing GigaChat with authorization key...');
      
      this.client = new GigaChat({
        clientSecretKey: config.authorizationKey, // Using the base64 encoded Client ID:Client Secret
        isPersonal: config.isPersonal,
        isIgnoreTSL: config.isIgnoreTSL,
        autoRefreshToken: config.autoRefreshToken
      });

      await this.client.createToken();
      this.isInitialized = true;
      console.log('✅ GigaChat service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize GigaChat:', error);
      console.error('Check your GIGACHAT_CLIENT_ID and GIGACHAT_CLIENT_SECRET values');
      throw new Error('GigaChat initialization failed');
    }
  }

  async searchProperties(filters = {}) {
    try {
      let query = 'SELECT * FROM properties WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      // Add filters based on the search criteria
      if (filters.propertyType) {
        query += ` AND property_type ILIKE $${paramIndex}`;
        params.push(`%${filters.propertyType}%`);
        paramIndex++;
      }

      if (filters.minPrice) {
        query += ` AND CAST(REPLACE(REPLACE(price, ' ', ''), '₽', '') AS INTEGER) >= $${paramIndex}`;
        params.push(filters.minPrice);
        paramIndex++;
      }

      if (filters.maxPrice) {
        query += ` AND CAST(REPLACE(REPLACE(price, ' ', ''), '₽', '') AS INTEGER) <= $${paramIndex}`;
        params.push(filters.maxPrice);
        paramIndex++;
      }

      if (filters.rooms) {
        if (filters.rooms === 'studio') {
          query += ` AND (property_type ILIKE '%студия%' OR rooms = 0)`;
        } else if (filters.rooms === '5+') {
          query += ` AND rooms >= 5`;
        } else {
          query += ` AND rooms = $${paramIndex}`;
          params.push(parseInt(filters.rooms));
          paramIndex++;
        }
      }

      if (filters.address) {
        query += ` AND address ILIKE $${paramIndex}`;
        params.push(`%${filters.address}%`);
        paramIndex++;
      }

      if (filters.status) {
        query += ` AND deadline ILIKE $${paramIndex}`;
        params.push(`%${filters.status}%`);
        paramIndex++;
      }

      // Limit results to avoid overwhelming the AI
      query += ' ORDER BY created_at DESC LIMIT 10';

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error searching properties:', error);
      return [];
    }
  }

  parseUserQuery(userMessage) {
    const filters = {};
    const message = userMessage.toLowerCase();

    // Extract property type
    if (message.includes('квартир') || message.includes('квартир')) filters.propertyType = 'квартира';
    if (message.includes('студи')) filters.propertyType = 'студия';
    if (message.includes('пентхаус')) filters.propertyType = 'пентхаус';
    if (message.includes('таунхаус')) filters.propertyType = 'таунхаус';

    // Extract room count
    if (message.includes('однокомнатн') || message.includes('1-комнатн') || message.includes('1 комнат')) filters.rooms = '1';
    if (message.includes('двухкомнатн') || message.includes('2-комнатн') || message.includes('2 комнат')) filters.rooms = '2';
    if (message.includes('трехкомнатн') || message.includes('3-комнатн') || message.includes('3 комнат')) filters.rooms = '3';
    if (message.includes('четырехкомнатн') || message.includes('4-комнатн') || message.includes('4 комнат')) filters.rooms = '4';
    if (message.includes('студи')) filters.rooms = 'studio';

    // Extract price range
    const priceMatches = message.match(/(\d+(?:\s?\d+)*)\s*(?:млн|миллион|тысяч|тыс|руб|₽)/g);
    if (priceMatches) {
      const prices = priceMatches.map(match => {
        const num = parseInt(match.replace(/\D/g, ''));
        if (match.includes('млн') || match.includes('миллион')) return num * 1000000;
        if (match.includes('тысяч') || match.includes('тыс')) return num * 1000;
        return num;
      });

      if (prices.length === 1) {
        if (message.includes('до') || message.includes('максимум') || message.includes('не более')) {
          filters.maxPrice = prices[0];
        } else if (message.includes('от') || message.includes('минимум') || message.includes('не менее')) {
          filters.minPrice = prices[0];
        } else {
          filters.maxPrice = prices[0];
        }
      } else if (prices.length >= 2) {
        filters.minPrice = Math.min(...prices);
        filters.maxPrice = Math.max(...prices);
      }
    }

    // Extract location
    const locationKeywords = ['центр', 'район', 'улица', 'микрорайон', 'мкр'];
    for (const keyword of locationKeywords) {
      const regex = new RegExp(`${keyword}\\s+([а-яё\\s]+?)(?:\\s|$|,|\\.)`, 'i');
      const match = message.match(regex);
      if (match) {
        filters.address = match[1].trim();
        break;
      }
    }

    // Extract status
    if (message.includes('готов') || message.includes('сдан')) filters.status = 'Сдан';
    if (message.includes('строительство') || message.includes('котлован')) filters.status = 'Котлован';
    if (message.includes('продаж')) filters.status = 'В продаже';

    return filters;
  }

  formatPropertiesForAI(properties) {
    if (!properties || properties.length === 0) {
      return "В базе данных не найдено подходящих объектов.";
    }

    let formatted = `Найдено ${properties.length} объектов недвижимости:\n\n`;
    
    properties.forEach((property, index) => {
      formatted += `${index + 1}. ${property.name || property.property_type}
📍 Адрес: ${property.address}
💰 Цена: ${property.formatted_price || property.price}
📐 Площадь: ${property.area || 'не указана'}
🏠 Комнат: ${property.rooms || 'не указано'}
🏗️ Статус: ${property.deadline || 'В продаже'}
🏢 Застройщик: ${property.developer || 'не указан'}

`;
    });

    return formatted;
  }

  async generateResponse(userMessage, conversationHistory = []) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.client) {
      // Still provide property search even without AI
      const filters = this.parseUserQuery(userMessage);
      const properties = await this.searchProperties(filters);
      
      let message = '';
      if (properties.length > 0) {
        message = `Нашел ${properties.length} подходящих объектов:\n\n`;
        properties.slice(0, 3).forEach((property, index) => {
          message += `${index + 1}. ${property.name || property.property_type}\n`;
          message += `   📍 ${property.address}\n`;
          message += `   💰 ${property.formatted_price || property.price}\n\n`;
        });
      } else {
        message = 'По вашим критериям объектов не найдено. Уточните параметры поиска.';
      }
      
      return {
        success: false,
        message: message,
        properties: properties.slice(0, 5),
        filters: filters
      };
    }

    try {
      // Parse user query to extract search criteria
      const filters = this.parseUserQuery(userMessage);
      console.log('🔍 Parsed filters:', filters);

      // Search for relevant properties
      const properties = await this.searchProperties(filters);
      console.log(`📊 Found ${properties.length} properties`);

      // Format properties data for AI
      const propertiesData = this.formatPropertiesForAI(properties);

      // Build conversation context
      const messages = [
        {
          role: "system",
          content: this.systemPrompt
        }
      ];

      // Add conversation history
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });

      // Add current user message and property data
      messages.push({
        role: "user",
        content: `${userMessage}

Объекты в базе данных:
${propertiesData}`
      });

      // Generate AI response
      const response = await this.client.completion({
        model: config.model,
        messages: messages,
        max_tokens: config.maxTokens,
        temperature: config.temperature
      });

      const aiMessage = response.choices?.[0]?.message?.content;

      if (!aiMessage) {
        throw new Error('No response from AI');
      }

      return {
        success: true,
        message: aiMessage,
        properties: properties.slice(0, 5), // Return top 5 properties for frontend display
        filters: filters
      };

    } catch (error) {
      console.error('❌ GigaChat error:', error);
      
      // Fallback response with property search
      const filters = this.parseUserQuery(userMessage);
      const properties = await this.searchProperties(filters);
      
      let fallbackMessage = '';
      
      if (properties.length > 0) {
        fallbackMessage = `Я нашел ${properties.length} подходящих объектов:\n\n`;
        properties.slice(0, 3).forEach((property, index) => {
          fallbackMessage += `${index + 1}. ${property.name || property.property_type}\n`;
          fallbackMessage += `   📍 ${property.address}\n`;
          fallbackMessage += `   💰 ${property.formatted_price || property.price}\n\n`;
        });
        fallbackMessage += 'Хотите узнать подробности о каком-то из этих объектов?';
      } else {
        fallbackMessage = 'По вашим критериям подходящих объектов не найдено. Попробуем расширить поиск или изменить параметры?';
      }

      return {
        success: false,
        message: fallbackMessage,
        properties: properties.slice(0, 5),
        filters: filters,
        error: error.message
      };
    }
  }

  async getModels() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.client) {
      return { success: false, models: [] };
    }

    try {
      const models = await this.client.allModels();
      return { success: true, models };
    } catch (error) {
      console.error('Error getting models:', error);
      return { success: false, models: [], error: error.message };
    }
  }
}

export default new GigaChatService(); 
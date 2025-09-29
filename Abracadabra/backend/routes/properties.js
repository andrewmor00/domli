import express from 'express';
import { query } from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Apply optional auth middleware to all routes
router.use(optionalAuth);

// Real locations in Krasnodar for different districts/projects
const krasnodarLocations = {
  // Central district (центр)
  'Режиссёр': [45.0355, 38.9753], // ул. Старокубанская
  'The Grand Palace': [45.0400, 38.9800], // ул.Уральская
  'Сердце': [45.0320, 38.9720], // ул. Школьная
  
  // Karasunsky district (карасунский район)
  'Небо': [45.0500, 39.0100], // ул. Ярославская
  'Новелла': [45.0450, 39.0050], // ул.Питерская
  'Смородина': [45.0520, 39.0120], // ул. Владимира Жириновского
  
  // Zapadny district (западный район)
  'Сегодня': [45.0200, 38.9500], // ул. Ветеранов
  'Дыхание': [45.0180, 38.9450], // ул. Летчика Позднякова
  'Фонтаны': [45.0350, 38.9750], // ул. Старокубанская
  
  // Prikubansky district (прикубанский район)
  'REEDS': [45.0600, 39.0200], // ул. Николая Огурцова
  'DOGMA PARK': [45.0580, 39.0180], // ул. Марины Цветаевой
  'Квартал САМОЛЁТ': [45.0620, 39.0220], // ул. им. Ивана Беличенко
  'МКР САМОЛЁТ': [45.0625, 39.0225], // ул. Ивана Беличенко
  'Рекорд2': [45.0300, 38.9600], // ул. Новороссийская
  'ПАРК ПОБЕДЫ': [45.0280, 38.9580], // ул. им. Героя Пешкова
  
  // Festivalny district (фестивальный район)
  'Все Свои VIP': [45.0100, 38.9300], // ул. Колхозная
  'Все Свои Vip': [45.0100, 38.9300], // ул. Колхозная
  'Тёплые края': [45.0120, 38.9320], // ул. им. Александра Гикало
  
  // Yuzhny district (южный район)
  'Южане': [45.0000, 38.9200], // ул. им. Даниила Смоляна
  'Айвазовский': [45.0350, 38.9750], // ул. Старокубанская
  
  // Yablonovsky (пгт. Яблоновский)
  'Традиции': [45.0800, 38.9000] // пгт. Яблоновский
};

// Function to get coordinates for a project
const getProjectCoordinates = (projectName, developer, index) => {
  // Try exact project match first
  if (krasnodarLocations[projectName]) {
    const baseCoords = krasnodarLocations[projectName];
    // Add small random offset to avoid overlapping markers
    const offsetLat = (Math.random() - 0.5) * 0.002; // ~200m radius
    const offsetLng = (Math.random() - 0.5) * 0.003;
    return [baseCoords[0] + offsetLat, baseCoords[1] + offsetLng];
  }
  
  // Fallback to developer-based location
  const developerAreas = {
    'Ava Dom': [45.0350, 38.9750],     // Central
    'ССК': [45.0200, 38.9500],         // West
    'DOGMA': [45.0600, 39.0200],       // East
    'СЕМЬЯ': [45.0100, 38.9300],       // South
    'НЕОМЕТРИЯ': [45.0000, 38.9200]    // South
  };
  
  const baseCoords = developerAreas[developer] || [45.0355, 38.9753]; // Default to city center
  const offsetLat = (Math.random() - 0.5) * 0.01; // Larger area for fallback
  const offsetLng = (Math.random() - 0.5) * 0.015;
  return [baseCoords[0] + offsetLat, baseCoords[1] + offsetLng];
};

// Function to get property status based on completion year and other factors
const getPropertyStatus = (completionYear, projectName, index) => {
  const currentYear = new Date().getFullYear();
  
  // If completion year is available, use it
  if (completionYear) {
    const year = parseInt(completionYear);
    if (!isNaN(year)) {
      if (year <= currentYear) {
        return 'Сдан';
      } else if (year === currentYear + 1) {
        return 'Котлован';
      } else {
        return 'В продаже';
      }
    }
  }
  
  // If no completion year, distribute statuses realistically
  // 40% completed, 35% for sale, 25% under construction
  const statusIndex = (index + projectName.length) % 100;
  
  if (statusIndex < 40) {
    return 'Сдан';
  } else if (statusIndex < 75) {
    return 'В продаже';
  } else {
    return 'Котлован';
  }
};

// Get all properties from CSV
router.get('/map-data', async (req, res) => {
  try {
    const properties = [];
    const csvPath = path.join(__dirname, '../data/properties.csv');
    
    // Check if CSV file exists
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Properties CSV file not found' 
      });
    }

    // Read and parse CSV
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row, index) => {
        // Skip rows with invalid or missing price
        if (!row.price_total || row.price_total.includes('*')) {
          return;
        }

        // Parse price (remove commas and convert to number)
        const priceString = row.price_total.replace(/,/g, '');
        const price = parseFloat(priceString);
        const formattedPrice = price ? `${(price / 1000000).toFixed(1)} млн ₽` : 'Цена по запросу';

        // Get realistic coordinates based on project and developer
        const coordinates = getProjectCoordinates(row.project_name, row.developer_name, properties.length);

        // Use the actual address from CSV
        const address = row.address || 'г. Краснодар';

        // Create property object
        const property = {
          id: properties.length + 1,
          name: `ЖК ${row.project_name}`,
          address: address,
          price: `от ${formattedPrice}`,
          coordinates: coordinates,
          type: row.property_type || 'Недвижимость',
          developer: row.developer_name,
          project: row.project_name,
          rooms: row.rooms_count || 'Не указано',
          area: row.area ? `${row.area} м²` : 'Не указана',
          completion: row.completion_year || 'Не указан'
        };

        properties.push(property);
      })
      .on('end', () => {
        res.json({
          success: true,
          data: properties,
          count: properties.length
        });
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Error reading properties data',
          error: error.message 
        });
      });

  } catch (error) {
    console.error('Error in /map-data endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// @route   GET /api/properties/csv
// @desc    Get all properties from CSV
// @access  Public
router.get('/csv', async (req, res) => {
  try {
    const properties = [];
    const csvPath = path.join(__dirname, '../data/properties.csv');
    
    // Check if CSV file exists
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Properties CSV file not found' 
      });
    }

    // Read and parse CSV
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        properties.push(row);
      })
      .on('end', () => {
        res.json(properties);
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Error reading properties data',
          error: error.message 
        });
      });

  } catch (error) {
    console.error('Error in /csv endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// @route   GET /api/properties
// @desc    Get properties with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      propertyType,
      rooms,
      budget,
      city,
      developer
    } = req.query;

    const offset = (page - 1) * limit;

    // Build WHERE clause dynamically
    const whereConditions = [];
    const values = [];
    let paramCount = 1;

    if (propertyType) {
      whereConditions.push(`property_type = $${paramCount}`);
      values.push(propertyType);
      paramCount++;
    }

    if (rooms) {
      whereConditions.push(`rooms = $${paramCount}`);
      values.push(rooms);
      paramCount++;
    }

    if (budget) {
      whereConditions.push(`price <= $${paramCount}`);
      values.push(budget);
      paramCount++;
    }

    if (city) {
      whereConditions.push(`city ILIKE $${paramCount}`);
      values.push(`%${city}%`);
      paramCount++;
    }

    if (developer) {
      whereConditions.push(`developer ILIKE $${paramCount}`);
      values.push(`%${developer}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM properties ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Get properties
    const propertiesResult = await query(
      `SELECT 
        id, name, description, property_type, rooms, area, price, 
        city, address, developer, completion_date, status,
        images, amenities, created_at, updated_at
       FROM properties 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...values, limit, offset]
    );

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        properties: propertiesResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении списка недвижимости'
    });
  }
});

// @route   GET /api/properties/recommendations
// @desc    Get general property recommendations (public)
// @access  Public
router.get('/recommendations', async (req, res) => {
  try {
    const properties = [];
    const csvPath = path.join(__dirname, '../data/properties_with_photos.csv');
    
    // Check if CSV file exists
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Properties data not found' 
      });
    }

    // Read and parse CSV
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          properties.push(row);
        })
        .on('end', () => {
          try {
            // Get all valid properties
            const recommendations = properties
              .filter(property => {
                // Skip properties with invalid prices
                return property.price_total && !property.price_total.includes('*');
              });

            // Format recommendations for response
            const formattedRecommendations = recommendations.map((property, index) => {
              const priceString = property.price_total.replace(/,/g, '');
              const price = parseFloat(priceString);
              const formattedPrice = price ? `${(price / 1000000).toFixed(1)} млн ₽` : 'Цена по запросу';
              
              // Get coordinates for the property
              const coordinates = getProjectCoordinates(property.project_name, property.developer_name, index);
              
              // Get property status
              const status = getPropertyStatus(property.completion_year, property.project_name, index);

              return {
                id: index + 1,
                name: `ЖК ${property.project_name}`,
                description: `${property.property_type} в ${property.project_name}`,
                property_type: property.property_type,
                rooms: property.rooms_count,
                area: property.area ? parseFloat(property.area) : null,
                price: price,
                formatted_price: `от ${formattedPrice}`,
                city: 'Краснодар',
                address: property.address || 'г. Краснодар',
                developer: property.developer_name,
                project: property.project_name,
                completion_date: property.completion_year,
                status: status,
                coordinates: coordinates,
                main_photo_url: property.main_photo_url || null,
                gallery_photos_urls: property.gallery_photos_urls ? property.gallery_photos_urls.split(',') : []
              };
            });

            res.json({
              success: true,
              data: {
                recommendations: formattedRecommendations,
                total: formattedRecommendations.length,
                message: 'Рекомендуемые объекты недвижимости'
              }
            });

          } catch (error) {
            console.error('Error processing general recommendations:', error);
            res.status(500).json({
              success: false,
              message: 'Ошибка при обработке рекомендаций'
            });
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV for general recommendations:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Ошибка при чтении данных недвижимости' 
          });
        });
    });

  } catch (error) {
    console.error('Get general recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении рекомендаций'
    });
  }
});

// @route   GET /api/properties/personalized-recommendations
// @desc    Get personalized property recommendations
// @access  Private
router.get('/personalized-recommendations', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Требуется авторизация для получения рекомендаций'
      });
    }

    // Get user preferences
    const preferencesResult = await query(
      `SELECT property_type, rooms, area, budget, move_in_date, living_with
       FROM user_preferences WHERE user_id = $1`,
      [req.user.id]
    );

    if (preferencesResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Предпочтения пользователя не найдены'
      });
    }

    const preferences = preferencesResult.rows[0];
    const properties = [];
    const csvPath = path.join(__dirname, '../data/properties_with_photos.csv');
    
    // Check if CSV file exists
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Properties data not found' 
      });
    }

    // Read and parse CSV
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          properties.push(row);
        })
        .on('end', () => {
          try {
            // Filter properties based on user preferences
            let recommendations = properties.filter(property => {
              // Skip properties with invalid prices
              if (!property.price_total || property.price_total.includes('*')) {
                return false;
              }

              let matches = true;

              // Filter by property type
              if (preferences.property_type && property.property_type) {
                const propertyTypeMap = {
                  'apartment': ['Квартира', 'квартира'],
                  'penthouse': ['Пентхаус', 'пентхаус'],
                  'commercial': ['Коммерческая', 'коммерческая']
                };
                
                const allowedTypes = propertyTypeMap[preferences.property_type] || [];
                if (!allowedTypes.some(type => property.property_type.includes(type))) {
                  matches = false;
                }
              }

              // Filter by rooms
              if (preferences.rooms && property.rooms_count) {
                const userRooms = preferences.rooms.toString();
                const propertyRooms = property.rooms_count.toString();
                
                if (userRooms === '4+') {
                  if (parseInt(propertyRooms) < 4) {
                    matches = false;
                  }
                } else if (userRooms !== propertyRooms) {
                  matches = false;
                }
              }

              // Filter by budget
              if (preferences.budget && property.price_total) {
                const budgetMatch = preferences.budget.match(/(\d+)/);
                if (budgetMatch) {
                  const maxBudget = parseInt(budgetMatch[1]) * 1000000; // Convert to rubles
                  const priceString = property.price_total.replace(/,/g, '');
                  const propertyPrice = parseFloat(priceString);
                  
                  if (propertyPrice && propertyPrice > maxBudget) {
                    matches = false;
                  }
                }
              }

              return matches;
            });

            // If no matches found, return popular properties instead
            if (recommendations.length === 0) {
              recommendations = properties
                .filter(p => p.price_total && !p.price_total.includes('*'));
            }

            // Format recommendations for response
            const formattedRecommendations = recommendations.map((property, index) => {
              const priceString = property.price_total.replace(/,/g, '');
              const price = parseFloat(priceString);
              const formattedPrice = price ? `${(price / 1000000).toFixed(1)} млн ₽` : 'Цена по запросу';
              
              // Get coordinates for the property
              const coordinates = getProjectCoordinates(property.project_name, property.developer_name, index);
              
              // Get property status
              const status = getPropertyStatus(property.completion_year, property.project_name, index);

              return {
                id: index + 1,
                name: `ЖК ${property.project_name}`,
                description: `${property.property_type} в ${property.project_name}`,
                property_type: property.property_type,
                rooms: property.rooms_count,
                area: property.area ? parseFloat(property.area) : null,
                price: price,
                formatted_price: `от ${formattedPrice}`,
                city: 'Краснодар',
                address: property.address || 'г. Краснодар',
                developer: property.developer_name,
                project: property.project_name,
                completion_date: property.completion_year,
                status: status,
                coordinates: coordinates,
                main_photo_url: property.main_photo_url || null,
                gallery_photos_urls: property.gallery_photos_urls ? property.gallery_photos_urls.split(',') : []
              };
            });

            res.json({
              success: true,
              data: {
                recommendations: formattedRecommendations,
                preferences: preferences,
                total: formattedRecommendations.length,
                message: recommendations.length > 0 ? 
                  'Рекомендации основаны на ваших предпочтениях' : 
                  'Показаны популярные объекты (не найдено точных совпадений)'
              }
            });

          } catch (error) {
            console.error('Error processing recommendations:', error);
            res.status(500).json({
              success: false,
              message: 'Ошибка при обработке рекомендаций'
            });
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV for recommendations:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Ошибка при чтении данных недвижимости' 
          });
        });
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении рекомендаций'
    });
  }
});

// @route   GET /api/properties/:id
// @desc    Get property by ID from CSV
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const propertyId = parseInt(id);
    
    if (isNaN(propertyId) || propertyId < 1) {
      return res.status(400).json({
        success: false,
        message: 'Неверный ID недвижимости'
      });
    }

    const properties = [];
    const csvPath = path.join(__dirname, '../data/properties_with_photos.csv');
    
    // Check if CSV file exists
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Данные о недвижимости не найдены' 
      });
    }

    // Read and parse CSV
    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          properties.push(row);
        })
        .on('end', () => {
          try {
            // Get property by index (ID - 1)
            const propertyIndex = propertyId - 1;
            
            if (propertyIndex < 0 || propertyIndex >= properties.length) {
              return res.status(404).json({
                success: false,
                message: 'Недвижимость не найдена'
              });
            }

            const propertyData = properties[propertyIndex];
            
            // Parse price
            const priceString = propertyData.price_total ? propertyData.price_total.replace(/,/g, '') : '';
            const price = parseFloat(priceString);
            const formattedPrice = price ? `${(price / 1000000).toFixed(1)} млн ₽` : 'Цена по запросу';
            
            // Get coordinates for the property
            const coordinates = getProjectCoordinates(propertyData.project_name, propertyData.developer_name, propertyIndex);
            
            // Get property status
            const status = getPropertyStatus(propertyData.completion_year, propertyData.project_name, propertyIndex);
            
            // Format property data
            const property = {
              id: propertyId,
              name: `ЖК ${propertyData.project_name}`,
              description: `${propertyData.property_type} в ${propertyData.project_name}`,
              property_type: propertyData.property_type,
              rooms: propertyData.rooms_count,
              area: propertyData.area ? parseFloat(propertyData.area) : null,
              price: price,
              formatted_price: `от ${formattedPrice}`,
              city: 'Краснодар',
              address: propertyData.address || 'г. Краснодар',
              developer: propertyData.developer_name,
              project: propertyData.project_name,
              completion_date: propertyData.completion_year,
              status: status,
              coordinates: coordinates,
              main_photo_url: propertyData.main_photo_url || null,
              gallery_photos_urls: propertyData.gallery_photos_urls ? propertyData.gallery_photos_urls.split(',') : [],
              floor_plan_url: propertyData.floor_plan_url || null,
              // Add additional details
              raw_data: propertyData // Include original CSV data for any additional fields
            };

            res.json({
              success: true,
              data: {
                property
              }
            });

          } catch (error) {
            console.error('Error processing property data:', error);
            res.status(500).json({
              success: false,
              message: 'Ошибка при обработке данных недвижимости'
            });
          }
        })
        .on('error', (error) => {
          console.error('Error reading CSV for property details:', error);
          res.status(500).json({ 
            success: false, 
            message: 'Ошибка при чтении данных недвижимости' 
          });
        });
    });

  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении недвижимости'
    });
  }
});

// @route   GET /api/properties/filters/options
// @desc    Get filter options for properties
// @access  Public
router.get('/filters/options', async (req, res) => {
  try {
    // Get unique cities
    const citiesResult = await query(
      'SELECT DISTINCT city FROM properties WHERE city IS NOT NULL ORDER BY city'
    );

    // Get unique developers
    const developersResult = await query(
      'SELECT DISTINCT developer FROM properties WHERE developer IS NOT NULL ORDER BY developer'
    );

    // Get price ranges
    const priceRangesResult = await query(
      'SELECT MIN(price) as min_price, MAX(price) as max_price FROM properties'
    );

    res.json({
      success: true,
      data: {
        cities: citiesResult.rows.map(row => row.city),
        developers: developersResult.rows.map(row => row.developer),
        priceRange: {
          min: priceRangesResult.rows[0]?.min_price || 0,
          max: priceRangesResult.rows[0]?.max_price || 0
        },
        propertyTypes: ['apartment', 'penthouse', 'commercial'],
        roomOptions: ['1', '2', '3', '4+']
      }
    });

  } catch (error) {
    console.error('Get filter options error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении опций фильтров'
    });
  }
});

export default router; 
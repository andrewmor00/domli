import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...');
    
    // Hash password for test users
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('password123', saltRounds);
    
    // Insert test users
    const users = [
      {
        first_name: 'Иван',
        last_name: 'Иванов',
        email: 'ivan@example.com',
        phone: '+7 (999) 123-45-67',
        password_hash: hashedPassword
      },
      {
        first_name: 'Мария',
        last_name: 'Петрова',
        email: 'maria@example.com',
        phone: '+7 (999) 234-56-78',
        password_hash: hashedPassword
      }
    ];
    
    for (const user of users) {
      const userResult = await client.query(
        `INSERT INTO users (first_name, last_name, email, phone, password_hash)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [user.first_name, user.last_name, user.email, user.phone, user.password_hash]
      );
      
      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;
        
        // Insert user preferences
        await client.query(
          `INSERT INTO user_preferences (
            user_id, property_type, rooms, budget, move_in_date, living_with
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING`,
          [userId, 'apartment', '2', '6–9 млн ₽', 'В этом году', 'С партнёром']
        );
        
        console.log(`✅ Created user: ${user.email}`);
      } else {
        console.log(`⏭️  User already exists: ${user.email}`);
      }
    }
    
    // Insert sample properties
    const properties = [
      {
        title: 'Современная 2-комнатная квартира в центре',
        description: 'Просторная квартира с ремонтом, мебелью и техникой. Отличная транспортная доступность.',
        property_type: 'apartment',
        rooms: 2,
        area: 65.5,
        price: 8500000,
        address: 'ул. Тверская, 15',
        city: 'Москва'
      },
      {
        title: 'Элитный пентхаус с панорамными окнами',
        description: 'Роскошный пентхаус с видом на город. Отделка премиум-класса.',
        property_type: 'penthouse',
        rooms: 3,
        area: 120.0,
        price: 25000000,
        address: 'Кутузовский проспект, 25',
        city: 'Москва'
      },
      {
        title: 'Коммерческое помещение под офис',
        description: 'Готовое офисное помещение в бизнес-центре. Отличная инфраструктура.',
        property_type: 'commercial',
        area: 150.0,
        price: 18000000,
        address: 'Пресненская набережная, 8',
        city: 'Москва'
      },
      {
        title: 'Уютная 1-комнатная квартира',
        description: 'Компактная квартира для одного человека или пары. Удобное расположение.',
        property_type: 'apartment',
        rooms: 1,
        area: 35.0,
        price: 5500000,
        address: 'ул. Арбат, 10',
        city: 'Москва'
      },
      {
        title: 'Просторная 3-комнатная квартира',
        description: 'Большая семья будет чувствовать себя комфортно в этой квартире.',
        property_type: 'apartment',
        rooms: 3,
        area: 85.0,
        price: 12000000,
        address: 'Ленинский проспект, 45',
        city: 'Москва'
      }
    ];
    
    for (const property of properties) {
      await client.query(
        `INSERT INTO properties (
          title, description, property_type, rooms, area, price, address, city
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING`,
        [
          property.title,
          property.description,
          property.property_type,
          property.rooms,
          property.area,
          property.price,
          property.address,
          property.city
        ]
      );
      
      console.log(`✅ Created property: ${property.title}`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedData();
} 
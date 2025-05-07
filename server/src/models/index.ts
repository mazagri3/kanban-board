import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize';
import { UserFactory } from './user.js';
import { TicketFactory } from './ticket.js';

// Choose the database URL based on availability
const databaseUrl = process.env.DATABASE_URL_INTERNAL || process.env.DATABASE_URL;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // Allows self-signed certificates (necessary for Render)
        },
        decimalNumbers: true, // Ensures decimal precision
      },
    })
  : new Sequelize(
      process.env.DB_NAME || '', 
      process.env.DB_USER || '', 
      process.env.DB_PASSWORD || '', 
      {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        dialectOptions: {
          ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : undefined,
          decimalNumbers: true,
        },
      }
    );

const User = UserFactory(sequelize);
const Ticket = TicketFactory(sequelize);

User.hasMany(Ticket, { foreignKey: 'assignedUserId' });
Ticket.belongsTo(User, { foreignKey: 'assignedUserId', as: 'assignedUser' });

export { sequelize, User, Ticket };

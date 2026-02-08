require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('Please set DATABASE_URL in .env before running Sequelize CLI');
}

module.exports = {
  development: {
    url: DATABASE_URL,
    dialect: 'postgres'
  },
  test: {
    url: DATABASE_URL,
    dialect: 'postgres'
  },
  production: {
    url: DATABASE_URL,
    dialect: 'postgres'
  }
};

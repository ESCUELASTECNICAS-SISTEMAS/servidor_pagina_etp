'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface) {
    const hash = await bcrypt.hash('changeme', 10);
    return queryInterface.bulkInsert('users', [
      { name: 'Admin', email: 'admin@example.com', password_hash: hash, role: 'admin', created_at: new Date() }
    ]);
  },

  async down (queryInterface) {
    return queryInterface.bulkDelete('users', { email: 'admin@example.com' });
  }
};

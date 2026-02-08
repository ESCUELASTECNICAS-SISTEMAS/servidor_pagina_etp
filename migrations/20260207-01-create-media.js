'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('media', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      url: { type: Sequelize.STRING(1024), allowNull: false },
      alt_text: { type: Sequelize.STRING(255) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('media');
  }
};

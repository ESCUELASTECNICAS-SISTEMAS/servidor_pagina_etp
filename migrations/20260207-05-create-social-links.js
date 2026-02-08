'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('social_links', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      network: { type: Sequelize.STRING(50), allowNull: false },
      value: { type: Sequelize.STRING(1024), allowNull: false },
      active: { type: Sequelize.BOOLEAN, defaultValue: true }
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('social_links');
  }
};

'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('carousel_slides', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      media_id: { type: Sequelize.INTEGER, references: { model: 'media', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      title: { type: Sequelize.STRING(255) },
      order_index: { type: Sequelize.INTEGER, defaultValue: 0 },
      active: { type: Sequelize.BOOLEAN, defaultValue: true }
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('carousel_slides');
  }
};

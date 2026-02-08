'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('noticias', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      summary: { type: Sequelize.TEXT },
      featured_media_id: { type: Sequelize.INTEGER, references: { model: 'media', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      published: { type: Sequelize.BOOLEAN, defaultValue: false },
      published_at: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('noticias');
  }
};

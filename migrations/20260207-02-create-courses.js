'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('courses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      subtitle: { type: Sequelize.STRING(255) },
      description: { type: Sequelize.TEXT },
      type: { type: Sequelize.STRING(32), allowNull: false },
      thumbnail_media_id: { type: Sequelize.INTEGER, references: { model: 'media', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      slug: { type: Sequelize.STRING(255), unique: true },
      published: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('courses');
  }
};

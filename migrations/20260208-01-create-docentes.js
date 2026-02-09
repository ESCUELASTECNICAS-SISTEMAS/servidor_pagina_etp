'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('docentes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: Sequelize.STRING(255), allowNull: false },
      especialidad: { type: Sequelize.STRING(255) },
      bio: { type: Sequelize.TEXT },
      email: { type: Sequelize.STRING(255) },
      foto_media_id: { type: Sequelize.INTEGER, references: { model: 'media', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('docentes');
  }
};

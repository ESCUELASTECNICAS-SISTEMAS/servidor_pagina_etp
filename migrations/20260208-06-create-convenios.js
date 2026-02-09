'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('convenios', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      institucion: { type: Sequelize.STRING(255), allowNull: false },
      descripcion: { type: Sequelize.TEXT },
      url: { type: Sequelize.STRING(512) },
      logo_media_id: { type: Sequelize.INTEGER, references: { model: 'media', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      orden: { type: Sequelize.INTEGER, defaultValue: 0 },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('convenios', ['course_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('convenios');
  }
};

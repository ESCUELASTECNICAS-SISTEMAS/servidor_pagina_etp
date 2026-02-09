'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('certificados', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      titulo: { type: Sequelize.STRING(255), allowNull: false },
      descripcion: { type: Sequelize.TEXT },
      institucion_emisora: { type: Sequelize.STRING(255) },
      orden: { type: Sequelize.INTEGER, defaultValue: 0 },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('certificados', ['course_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('certificados');
  }
};

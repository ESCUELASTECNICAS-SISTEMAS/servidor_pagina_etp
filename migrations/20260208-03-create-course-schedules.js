'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('course_schedules', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      dia: { type: Sequelize.STRING(20), allowNull: false }, // lunes, martes, etc.
      turno: { type: Sequelize.STRING(50) }, // mañana, tarde, noche
      hora_inicio: { type: Sequelize.TIME },
      hora_fin: { type: Sequelize.TIME },
      aula: { type: Sequelize.STRING(50) },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('course_schedules', ['course_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('course_schedules');
  }
};

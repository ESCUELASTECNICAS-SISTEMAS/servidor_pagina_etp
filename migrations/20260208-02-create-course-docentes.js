'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('course_docentes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      docente_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'docentes', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      rol: { type: Sequelize.STRING(100) }, // ej: "titular", "adjunto", "invitado"
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('course_docentes', ['course_id', 'docente_id'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('course_docentes');
  }
};

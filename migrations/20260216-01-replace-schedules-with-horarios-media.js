'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Agregar columna horarios_media_id a courses (referencia a media)
    await queryInterface.addColumn('courses', 'horarios_media_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'media', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // 2. Eliminar tabla course_schedules (los datos existentes se pierden,
    //    pero se reemplazarán por imágenes)
    await queryInterface.dropTable('course_schedules');
  },

  async down(queryInterface, Sequelize) {
    // Revertir: re-crear course_schedules y quitar columna
    await queryInterface.createTable('course_schedules', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      dia: { type: Sequelize.STRING(20), allowNull: false },
      turno: { type: Sequelize.STRING(50) },
      hora_inicio: { type: Sequelize.TIME },
      hora_fin: { type: Sequelize.TIME },
      aula: { type: Sequelize.STRING(50) },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('course_schedules', ['course_id']);

    await queryInterface.removeColumn('courses', 'horarios_media_id');
  }
};

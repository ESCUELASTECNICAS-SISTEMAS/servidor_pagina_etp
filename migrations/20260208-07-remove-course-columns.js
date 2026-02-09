'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // eliminar columnas que ahora están normalizadas en tablas separadas
    await Promise.all([
      queryInterface.removeColumn('courses', 'horarios'),
      queryInterface.removeColumn('courses', 'dias'),
      queryInterface.removeColumn('courses', 'turnos'),
      queryInterface.removeColumn('courses', 'schedules'),
      queryInterface.removeColumn('courses', 'docente'),
      queryInterface.removeColumn('courses', 'certificados'),
      queryInterface.removeColumn('courses', 'seminarios'),
      queryInterface.removeColumn('courses', 'convenios')
    ]);
  },

  async down(queryInterface, Sequelize) {
    // volver a agregar las columnas con tipos anteriores
    await Promise.all([
      queryInterface.addColumn('courses', 'horarios', { type: Sequelize.TEXT }),
      queryInterface.addColumn('courses', 'dias', { type: Sequelize.STRING(255) }),
      queryInterface.addColumn('courses', 'turnos', { type: Sequelize.STRING(255) }),
      queryInterface.addColumn('courses', 'schedules', { type: Sequelize.JSON }),
      queryInterface.addColumn('courses', 'docente', { type: Sequelize.STRING(512) }),
      queryInterface.addColumn('courses', 'certificados', { type: Sequelize.TEXT }),
      queryInterface.addColumn('courses', 'seminarios', { type: Sequelize.TEXT }),
      queryInterface.addColumn('courses', 'convenios', { type: Sequelize.TEXT })
    ]);
  }
};

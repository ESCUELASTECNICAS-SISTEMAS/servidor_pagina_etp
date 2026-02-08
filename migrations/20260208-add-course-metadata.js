"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'hours', { type: Sequelize.INTEGER });
    await queryInterface.addColumn('courses', 'duration', { type: Sequelize.STRING(128) });
    await queryInterface.addColumn('courses', 'grado', { type: Sequelize.STRING(128) });
    await queryInterface.addColumn('courses', 'registro', { type: Sequelize.STRING(512) });
    await queryInterface.addColumn('courses', 'horarios', { type: Sequelize.TEXT });
    await queryInterface.addColumn('courses', 'dias', { type: Sequelize.STRING(255) });
    await queryInterface.addColumn('courses', 'turnos', { type: Sequelize.STRING(255) });
    await queryInterface.addColumn('courses', 'schedules', { type: Sequelize.JSON });
    await queryInterface.addColumn('courses', 'docente', { type: Sequelize.STRING(512) });
    await queryInterface.addColumn('courses', 'certificados', { type: Sequelize.TEXT });
    await queryInterface.addColumn('courses', 'seminarios', { type: Sequelize.TEXT });
    await queryInterface.addColumn('courses', 'convenios', { type: Sequelize.TEXT });
    await queryInterface.addColumn('courses', 'perfil_egresado', { type: Sequelize.TEXT });
    await queryInterface.addColumn('courses', 'mision', { type: Sequelize.TEXT });
    await queryInterface.addColumn('courses', 'vision', { type: Sequelize.TEXT });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('courses', 'vision');
    await queryInterface.removeColumn('courses', 'mision');
    await queryInterface.removeColumn('courses', 'perfil_egresado');
    await queryInterface.removeColumn('courses', 'convenios');
    await queryInterface.removeColumn('courses', 'seminarios');
    await queryInterface.removeColumn('courses', 'certificados');
    await queryInterface.removeColumn('courses', 'docente');
    await queryInterface.removeColumn('courses', 'schedules');
    await queryInterface.removeColumn('courses', 'turnos');
    await queryInterface.removeColumn('courses', 'dias');
    await queryInterface.removeColumn('courses', 'horarios');
    await queryInterface.removeColumn('courses', 'registro');
    await queryInterface.removeColumn('courses', 'grado');
    await queryInterface.removeColumn('courses', 'duration');
    await queryInterface.removeColumn('courses', 'hours');
  }
};

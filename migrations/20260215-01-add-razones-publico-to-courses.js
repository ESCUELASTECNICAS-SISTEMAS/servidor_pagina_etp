'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'razones_para_estudiar', { type: Sequelize.TEXT, allowNull: true });
    await queryInterface.addColumn('courses', 'publico_objetivo', { type: Sequelize.TEXT, allowNull: true });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('courses', 'publico_objetivo');
    await queryInterface.removeColumn('courses', 'razones_para_estudiar');
  }
};

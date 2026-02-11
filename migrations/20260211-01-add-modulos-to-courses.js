'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'modulos', { type: Sequelize.JSON, allowNull: true });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('courses', 'modulos');
  }
};
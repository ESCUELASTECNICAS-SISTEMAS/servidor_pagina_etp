'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'modalidad', { type: Sequelize.STRING(64), allowNull: true });
    await queryInterface.addColumn('courses', 'temario', { type: Sequelize.TEXT, allowNull: true });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('courses', 'temario');
    await queryInterface.removeColumn('courses', 'modalidad');
  }
};

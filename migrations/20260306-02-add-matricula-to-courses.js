'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'matricula', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('courses', 'matricula');
  }
};

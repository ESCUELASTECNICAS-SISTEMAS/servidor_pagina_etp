'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('media', 'category', { type: Sequelize.STRING(50), allowNull: true });
    await queryInterface.addIndex('media', ['category']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('media', ['category']);
    await queryInterface.removeColumn('media', 'category');
  }
};

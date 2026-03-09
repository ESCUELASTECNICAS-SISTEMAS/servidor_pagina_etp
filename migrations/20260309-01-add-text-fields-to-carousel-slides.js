'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('carousel_slides', 'subtitle', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('carousel_slides', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down (queryInterface) {
    await queryInterface.removeColumn('carousel_slides', 'description');
    await queryInterface.removeColumn('carousel_slides', 'subtitle');
  }
};

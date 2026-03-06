'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'precio', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });

    await queryInterface.addColumn('courses', 'descuento', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true
    });

    await queryInterface.addColumn('courses', 'oferta', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('courses', 'oferta');
    await queryInterface.removeColumn('courses', 'descuento');
    await queryInterface.removeColumn('courses', 'precio');
  }
};

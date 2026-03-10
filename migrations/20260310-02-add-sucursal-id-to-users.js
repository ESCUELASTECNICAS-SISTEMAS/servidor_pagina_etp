'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'sucursal_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'sucursales', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('users', ['sucursal_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('users', ['sucursal_id']);
    await queryInterface.removeColumn('users', 'sucursal_id');
  }
};
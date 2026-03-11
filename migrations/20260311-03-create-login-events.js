'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('login_events', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      sucursal_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'sucursales', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('login_events', ['created_at']);
    await queryInterface.addIndex('login_events', ['sucursal_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('login_events');
  }
};

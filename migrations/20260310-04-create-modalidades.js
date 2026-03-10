'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('modalidades', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: Sequelize.STRING(64), allowNull: false, unique: true },
      descripcion: { type: Sequelize.STRING(255), allowNull: true },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('modalidades', ['active']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('modalidades');
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sucursales', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      ciudad: { type: Sequelize.STRING(120), allowNull: false },
      direccion: { type: Sequelize.STRING(255), allowNull: true },
      telefono: { type: Sequelize.STRING(40), allowNull: true },
      email: { type: Sequelize.STRING(150), allowNull: true },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('sucursales', ['ciudad']);
    await queryInterface.addIndex('sucursales', ['active']);

    await queryInterface.addColumn('courses', 'sucursal_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'sucursales', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    await queryInterface.addIndex('courses', ['sucursal_id']);

    await queryInterface.createTable('course_sucursales', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      sucursal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sucursales', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('course_sucursales', ['course_id']);
    await queryInterface.addIndex('course_sucursales', ['sucursal_id']);
    await queryInterface.addConstraint('course_sucursales', {
      fields: ['course_id', 'sucursal_id'],
      type: 'unique',
      name: 'course_sucursales_course_id_sucursal_id_unique'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('courses', ['sucursal_id']);
    await queryInterface.removeColumn('courses', 'sucursal_id');
    await queryInterface.dropTable('course_sucursales');
    await queryInterface.dropTable('sucursales');
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pre_inscripciones', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: { type: Sequelize.STRING(120), allowNull: false },
      apellido: { type: Sequelize.STRING(120), allowNull: false },
      celular: { type: Sequelize.STRING(40), allowNull: false },
      dni: { type: Sequelize.STRING(20), allowNull: false },
      email: { type: Sequelize.STRING(150), allowNull: false },
      modalidad_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'modalidades', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
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
        onDelete: 'RESTRICT'
      },
      acepta_politicas: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('pre_inscripciones', ['course_id']);
    await queryInterface.addIndex('pre_inscripciones', ['sucursal_id']);
    await queryInterface.addIndex('pre_inscripciones', ['modalidad_id']);
    await queryInterface.addIndex('pre_inscripciones', ['active']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('pre_inscripciones');
  }
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('visit_counts', {
      day: { type: Sequelize.DATEONLY, allowNull: false },
      country: { type: Sequelize.STRING(50), allowNull: true },
      count: { type: Sequelize.BIGINT, allowNull: false, defaultValue: 0 }
    });

    await queryInterface.addConstraint('visit_counts', {
      fields: ['day', 'country'],
      type: 'primary key',
      name: 'visit_counts_pkey'
    });

    await queryInterface.addIndex('visit_counts', ['day']);
    await queryInterface.addIndex('visit_counts', ['country']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('visit_counts');
  }
};

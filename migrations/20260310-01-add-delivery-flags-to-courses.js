'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'is_virtual', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('courses', 'is_presencial', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.sequelize.query(`
      UPDATE courses
      SET
        is_virtual = CASE
          WHEN LOWER(COALESCE(modalidad, '')) IN ('virtual', 'hibrido', 'híbrido', 'mixto') THEN TRUE
          ELSE FALSE
        END,
        is_presencial = CASE
          WHEN LOWER(COALESCE(modalidad, '')) IN ('presencial', 'hibrido', 'híbrido', 'mixto') THEN TRUE
          ELSE FALSE
        END
    `);
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('courses', 'is_presencial');
    await queryInterface.removeColumn('courses', 'is_virtual');
  }
};

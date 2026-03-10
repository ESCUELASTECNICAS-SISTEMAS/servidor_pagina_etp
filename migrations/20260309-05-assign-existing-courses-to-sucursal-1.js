'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Ensure sucursal with id=1 exists (Ica by default for current data).
      await queryInterface.sequelize.query(
        `
        INSERT INTO sucursales (id, nombre, ciudad, active, created_at)
        VALUES (1, 'Sede Ica', 'Ica', true, NOW())
        ON CONFLICT (id) DO NOTHING;
        `,
        { transaction }
      );

      // Set all existing courses to sucursal_id = 1.
      await queryInterface.sequelize.query(
        `UPDATE courses SET sucursal_id = 1;`,
        { transaction }
      );

      // Keep many-to-many mapping aligned.
      await queryInterface.sequelize.query(
        `
        INSERT INTO course_sucursales (course_id, sucursal_id, active, created_at)
        SELECT c.id, 1, true, NOW()
        FROM courses c
        ON CONFLICT (course_id, sucursal_id) DO NOTHING;
        `,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `UPDATE courses SET sucursal_id = NULL WHERE sucursal_id = 1;`,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `DELETE FROM course_sucursales WHERE sucursal_id = 1;`,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

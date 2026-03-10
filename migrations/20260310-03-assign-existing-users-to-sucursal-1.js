'use strict';

module.exports = {
  async up(queryInterface) {
    const [rows] = await queryInterface.sequelize.query(
      "SELECT id FROM sucursales WHERE id = 1 LIMIT 1"
    );

    if (!rows || rows.length === 0) {
      throw new Error('Cannot assign users to sucursal_id=1 because sucursal 1 does not exist');
    }

    await queryInterface.sequelize.query(`
      UPDATE users
      SET sucursal_id = 1
      WHERE sucursal_id IS NULL OR sucursal_id <> 1
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE users
      SET sucursal_id = NULL
      WHERE sucursal_id = 1
    `);
  }
};
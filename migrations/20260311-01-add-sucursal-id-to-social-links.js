'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        `
        INSERT INTO sucursales (id, nombre, ciudad, active, created_at)
        VALUES (1, 'Sede Ica', 'Ica', true, NOW())
        ON CONFLICT (id) DO NOTHING;
        `,
        { transaction }
      );

      await queryInterface.addColumn('social_links', 'sucursal_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'sucursales', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }, { transaction });

      await queryInterface.addIndex('social_links', ['sucursal_id'], { transaction });

      await queryInterface.sequelize.query(
        `UPDATE social_links SET sucursal_id = 1 WHERE sucursal_id IS NULL;`,
        { transaction }
      );

      await queryInterface.changeColumn('social_links', 'sucursal_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'sucursales', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeIndex('social_links', ['sucursal_id'], { transaction });
      await queryInterface.removeColumn('social_links', 'sucursal_id', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

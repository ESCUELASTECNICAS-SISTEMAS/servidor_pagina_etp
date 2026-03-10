'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('courses');
    if (!table.extra_media_id) {
      await queryInterface.addColumn('courses', 'extra_media_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'media', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('courses');
    if (table.extra_media_id) {
      await queryInterface.removeColumn('courses', 'extra_media_id');
    }
  }
};

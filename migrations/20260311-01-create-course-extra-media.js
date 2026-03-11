'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('course_extra_media', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      course_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'courses', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      media_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'media', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      position: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('course_extra_media', ['course_id', 'media_id'], { unique: true });
    await queryInterface.addIndex('course_extra_media', ['course_id', 'position']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('course_extra_media');
  }
};

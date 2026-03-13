'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tips', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      slug: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT },
      image_url: { type: Sequelize.STRING(1024) },
      alt_text: { type: Sequelize.STRING(255) },
      category: { type: Sequelize.STRING(100) },
      meta_title: { type: Sequelize.STRING(255) },
      meta_description: { type: Sequelize.STRING(512) },
      tags: { type: Sequelize.JSON },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('tips', ['slug']);
    await queryInterface.addIndex('tips', ['category']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tips');
  }
};

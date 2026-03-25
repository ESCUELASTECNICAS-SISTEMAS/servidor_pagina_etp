"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('noticias', 'author', { type: Sequelize.STRING(255), allowNull: true });
    await queryInterface.addColumn('noticias', 'slug', { type: Sequelize.STRING(255), allowNull: true, unique: true });
    await queryInterface.addColumn('noticias', 'category', { type: Sequelize.STRING(100), allowNull: true });
    await queryInterface.addColumn('noticias', 'tags', { type: Sequelize.ARRAY ? Sequelize.ARRAY(Sequelize.STRING) : Sequelize.TEXT, allowNull: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('noticias', 'author');
    await queryInterface.removeColumn('noticias', 'slug');
    await queryInterface.removeColumn('noticias', 'category');
    await queryInterface.removeColumn('noticias', 'tags');
  }
};

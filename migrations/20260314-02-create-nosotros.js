'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('nosotros', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      imagen: { type: Sequelize.STRING(1024) },
      logo: { type: Sequelize.STRING(1024) },
      anios: { type: Sequelize.INTEGER },
      anios_texto: { type: Sequelize.STRING(255) },
      ciudad: { type: Sequelize.STRING(255) },
      titulo: { type: Sequelize.STRING(255), allowNull: false },
      descripcion: { type: Sequelize.TEXT },
      bullets: { type: Sequelize.JSON },
      mision: { type: Sequelize.TEXT },
      vision: { type: Sequelize.TEXT },
      valores: { type: Sequelize.JSON },
      video_url: { type: Sequelize.STRING(1024) },
      video_poster: { type: Sequelize.STRING(1024) },
      active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('nosotros');
  }
};

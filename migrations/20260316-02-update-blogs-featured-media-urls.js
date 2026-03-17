'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminar el campo anterior
    await queryInterface.removeColumn('blogs', 'featured_media_id');
    // Agregar el nuevo campo para hasta 3 urls
    await queryInterface.addColumn('blogs', 'featured_media_urls', {
      type: Sequelize.JSON,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir cambios
    await queryInterface.removeColumn('blogs', 'featured_media_urls');
    await queryInterface.addColumn('blogs', 'featured_media_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  }
};

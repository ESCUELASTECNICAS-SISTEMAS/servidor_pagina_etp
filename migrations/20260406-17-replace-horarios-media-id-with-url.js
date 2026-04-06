'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // 1. Agregar nueva columna horarios_media_url si no existe
      await queryInterface.addColumn('courses', 'horarios_media_url', {
        type: Sequelize.STRING(512),
        allowNull: true
      });
    } catch (error) {
      // Si la columna ya existe, ignoramos el error
      if (error.message.includes('already exists')) {
        console.log('Column horarios_media_url already exists');
      } else {
        throw error;
      }
    }

    try {
      // 2. Eliminar la columna antigua horarios_media_id si existe
      await queryInterface.removeColumn('courses', 'horarios_media_id');
    } catch (error) {
      // Si la columna ya no existe, ignoramos el error
      if (error.message.includes('does not exist')) {
        console.log('Column horarios_media_id does not exist');
      } else {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Revertir: agregar la columna antigua y eliminar la nueva
    await queryInterface.addColumn('courses', 'horarios_media_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'media', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.removeColumn('courses', 'horarios_media_url');
  }
};

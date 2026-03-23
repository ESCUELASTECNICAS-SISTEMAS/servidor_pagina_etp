'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('pre_inscripciones', 'atendido', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica si la preinscripción fue atendida o no'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('pre_inscripciones', 'atendido');
  }
};

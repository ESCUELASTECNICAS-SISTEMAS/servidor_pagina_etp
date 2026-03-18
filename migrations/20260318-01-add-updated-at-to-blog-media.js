module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('blog_media', 'updated_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: Sequelize.fn('NOW')
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('blog_media', 'updated_at');
  }
};

'use strict';

const tables = [
  'media',
  'courses',
  'noticias',
  'carousel_slides',
  'social_links',
  'users',
  'course_media',
  'noticia_media'
];

module.exports = {
  async up (queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;
    for (const table of tables) {
      // check if table exists
      const tableCheck = await sequelize.query(`SELECT to_regclass('public.${table}') as exists;`);
      const existsVal = tableCheck && tableCheck[0] && tableCheck[0][0] && tableCheck[0][0].exists;
      if (!existsVal) {
        // table does not exist — skip
        continue;
      }

      // check if column exists
      const colCheck = await sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = 'active' LIMIT 1;`
      );
      const hasColumn = colCheck && colCheck[0] && colCheck[0].length > 0;
      if (!hasColumn) {
        await queryInterface.addColumn(table, 'active', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true });
      }
    }
  },

  async down (queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;
    for (const table of tables) {
      const tableCheck = await sequelize.query(`SELECT to_regclass('public.${table}') as exists;`);
      const existsVal = tableCheck && tableCheck[0] && tableCheck[0][0] && tableCheck[0][0].exists;
      if (!existsVal) continue;

      const colCheck = await sequelize.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' AND column_name = 'active' LIMIT 1;`
      );
      const hasColumn = colCheck && colCheck[0] && colCheck[0].length > 0;
      if (hasColumn) {
        await queryInterface.removeColumn(table, 'active');
      }
    }
  }
};

'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('blogs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      slug: { type: Sequelize.STRING(255), unique: true, allowNull: false },
      summary: { type: Sequelize.TEXT },
      content: { type: Sequelize.TEXT },
      author_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      status: { type: Sequelize.ENUM('draft','published','archived'), defaultValue: 'draft' },
      published_at: { type: Sequelize.DATE },
      featured_media_id: { type: Sequelize.INTEGER, references: { model: 'media', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      views: { type: Sequelize.INTEGER, defaultValue: 0 },
      tags: { type: Sequelize.JSON },
      allow_comments: { type: Sequelize.BOOLEAN, defaultValue: false },
      meta_title: { type: Sequelize.STRING(255) },
      meta_description: { type: Sequelize.STRING(512) },
      canonical_url: { type: Sequelize.STRING(512) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.createTable('blog_media', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      blog_id: { type: Sequelize.INTEGER, references: { model: 'blogs', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      media_id: { type: Sequelize.INTEGER, references: { model: 'media', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      position: { type: Sequelize.INTEGER },
      caption: { type: Sequelize.STRING(512) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    // Add helpful columns to media for external links and types (allowNull to be safe)
    await queryInterface.addColumn('media', 'is_external', { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false });
    await queryInterface.addColumn('media', 'type', { type: Sequelize.STRING(50), allowNull: true });
    await queryInterface.addColumn('media', 'title', { type: Sequelize.STRING(255), allowNull: true });
    await queryInterface.addColumn('media', 'thumbnail_url', { type: Sequelize.STRING(1024), allowNull: true });
  },

  async down (queryInterface) {
    await queryInterface.dropTable('blog_media');
    await queryInterface.dropTable('blogs');
    await queryInterface.removeColumn('media', 'thumbnail_url');
    await queryInterface.removeColumn('media', 'title');
    await queryInterface.removeColumn('media', 'type');
    await queryInterface.removeColumn('media', 'is_external');
  }
};

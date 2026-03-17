module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define('Blog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    summary: { type: DataTypes.TEXT },
    content: { type: DataTypes.TEXT },
    author_id: { type: DataTypes.INTEGER },
    status: { type: DataTypes.ENUM('draft','published','archived'), defaultValue: 'draft' },
    published_at: { type: DataTypes.DATE },
    featured_media_urls: { type: DataTypes.JSON },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    tags: { type: DataTypes.JSON },
    allow_comments: { type: DataTypes.BOOLEAN, defaultValue: false },
    meta_title: { type: DataTypes.STRING(255) },
    meta_description: { type: DataTypes.STRING(512) },
    canonical_url: { type: DataTypes.STRING(512) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'blogs',
    timestamps: false
  });

  Blog.associate = function(models) {
    Blog.belongsTo(models.User, { foreignKey: 'author_id', as: 'author' });
    // featured_media_id eliminado, relación ya no aplica
    Blog.belongsToMany(models.Media, { through: 'blog_media', foreignKey: 'blog_id', otherKey: 'media_id', as: 'media' });
  };

  return Blog;
};

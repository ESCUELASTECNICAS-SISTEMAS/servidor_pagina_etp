const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BlogMedia = sequelize.define('blog_media', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    blog_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'blogs',
        key: 'id'
      }
    },
    media_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'media',
        key: 'id'
      }
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    caption: {
      type: DataTypes.STRING(512),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'blog_media',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return BlogMedia;
};

module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    subtitle: { type: DataTypes.STRING(255) },
    description: { type: DataTypes.TEXT },
    type: { type: DataTypes.STRING(32), allowNull: false },
    thumbnail_media_id: { type: DataTypes.INTEGER },
    slug: { type: DataTypes.STRING(255), unique: true },
    published: { type: DataTypes.BOOLEAN, defaultValue: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'courses',
    timestamps: false
  });

  Course.associate = function(models) {
    Course.belongsTo(models.Media, { foreignKey: 'thumbnail_media_id', as: 'thumbnail' });
  };

  return Course;
};

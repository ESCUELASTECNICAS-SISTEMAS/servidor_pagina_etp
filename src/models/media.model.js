module.exports = (sequelize, DataTypes) => {
  const Media = sequelize.define('Media', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    url: { type: DataTypes.STRING(1024), allowNull: false },
    alt_text: { type: DataTypes.STRING(255) },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'media',
    timestamps: false
  });
  return Media;
};

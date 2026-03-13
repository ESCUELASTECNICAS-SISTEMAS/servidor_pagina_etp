module.exports = (sequelize, DataTypes) => {
  const Tip = sequelize.define('Tip', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    image_url: { type: DataTypes.STRING(1024) },
    alt_text: { type: DataTypes.STRING(255) },
    category: { type: DataTypes.STRING(100) },
    meta_title: { type: DataTypes.STRING(255) },
    meta_description: { type: DataTypes.STRING(512) },
    tags: { type: DataTypes.JSON },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'tips',
    timestamps: false
  });

  Tip.associate = function(models) {
    // no associations for now
  };

  return Tip;
};

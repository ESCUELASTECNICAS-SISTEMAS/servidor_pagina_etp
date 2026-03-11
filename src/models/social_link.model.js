module.exports = (sequelize, DataTypes) => {
  const SocialLink = sequelize.define('SocialLink', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    network: { type: DataTypes.STRING(50), allowNull: false },
    value: { type: DataTypes.STRING(1024), allowNull: false },
    sucursal_id: { type: DataTypes.INTEGER, allowNull: false },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'social_links',
    timestamps: false
  });

  SocialLink.associate = function(models) {
    SocialLink.belongsTo(models.Sucursal, { foreignKey: 'sucursal_id', as: 'sucursal' });
  };

  return SocialLink;
};

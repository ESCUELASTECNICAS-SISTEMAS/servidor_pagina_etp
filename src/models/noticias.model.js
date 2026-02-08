module.exports = (sequelize, DataTypes) => {
  const Noticia = sequelize.define('Noticia', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    summary: { type: DataTypes.TEXT },
    featured_media_id: { type: DataTypes.INTEGER },
    published: { type: DataTypes.BOOLEAN, defaultValue: false },
    published_at: { type: DataTypes.DATE },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'noticias',
    timestamps: false
  });

  Noticia.associate = function(models) {
    Noticia.belongsTo(models.Media, { foreignKey: 'featured_media_id', as: 'featured_media' });
  };

  return Noticia;
};

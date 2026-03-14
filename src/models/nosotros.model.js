module.exports = (sequelize, DataTypes) => {
  const Nosotros = sequelize.define('Nosotros', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    imagen: { type: DataTypes.STRING(1024) },
    logo: { type: DataTypes.STRING(1024) },
    anios: { type: DataTypes.INTEGER },
    anios_texto: { type: DataTypes.STRING(255) },
    ciudad: { type: DataTypes.STRING(255) },
    titulo: { type: DataTypes.STRING(255), allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    bullets: { type: DataTypes.JSON },
    mision: { type: DataTypes.TEXT },
    vision: { type: DataTypes.TEXT },
    valores: { type: DataTypes.JSON },
    video_url: { type: DataTypes.STRING(1024) },
    video_poster: { type: DataTypes.STRING(1024) },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'nosotros',
    timestamps: false
  });

  Nosotros.associate = function(models) {
    // no immediate associations, but defined here for future relations
  };

  return Nosotros;
};

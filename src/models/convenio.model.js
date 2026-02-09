module.exports = (sequelize, DataTypes) => {
  const Convenio = sequelize.define('Convenio', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    institucion: { type: DataTypes.STRING(255), allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    url: { type: DataTypes.STRING(512) },
    logo_media_id: { type: DataTypes.INTEGER },
    orden: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'convenios',
    timestamps: false
  });

  Convenio.associate = function(models) {
    Convenio.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
    Convenio.belongsTo(models.Media, { foreignKey: 'logo_media_id', as: 'logo' });
  };

  return Convenio;
};

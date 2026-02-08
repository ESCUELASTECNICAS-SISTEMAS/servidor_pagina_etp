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
    hours: { type: DataTypes.INTEGER },
    duration: { type: DataTypes.STRING(128) },
    grado: { type: DataTypes.STRING(128) },
    registro: { type: DataTypes.STRING(512) },
    horarios: { type: DataTypes.TEXT },
    dias: { type: DataTypes.STRING(255) },
    turnos: { type: DataTypes.STRING(255) },
    schedules: { type: DataTypes.JSON },
    docente: { type: DataTypes.STRING(512) },
    certificados: { type: DataTypes.TEXT },
    seminarios: { type: DataTypes.TEXT },
    convenios: { type: DataTypes.TEXT },
    perfil_egresado: { type: DataTypes.TEXT },
    mision: { type: DataTypes.TEXT },
    vision: { type: DataTypes.TEXT },
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

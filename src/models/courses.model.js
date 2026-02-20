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
    perfil_egresado: { type: DataTypes.TEXT },
    mision: { type: DataTypes.TEXT },
    vision: { type: DataTypes.TEXT },
    modalidad: { type: DataTypes.STRING(64) },
    temario: { type: DataTypes.TEXT },
    razones_para_estudiar: { type: DataTypes.TEXT },
    publico_objetivo: { type: DataTypes.TEXT },
    modulos: { type: DataTypes.JSON },
    horarios_media_id: { type: DataTypes.INTEGER },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'courses',
    timestamps: false
  });

  Course.associate = function(models) {
    Course.belongsTo(models.Media, { foreignKey: 'thumbnail_media_id', as: 'thumbnail' });
    Course.belongsTo(models.Media, { foreignKey: 'horarios_media_id', as: 'horarios' });
    Course.belongsToMany(models.Docente, { through: models.CourseDocente, foreignKey: 'course_id', otherKey: 'docente_id', as: 'docentes' });
    Course.hasMany(models.Certificado, { foreignKey: 'course_id', as: 'certificados' });
    Course.hasMany(models.Seminario, { foreignKey: 'course_id', as: 'seminarios' });
    Course.hasMany(models.Convenio, { foreignKey: 'course_id', as: 'convenios' });
  };

  return Course;
};

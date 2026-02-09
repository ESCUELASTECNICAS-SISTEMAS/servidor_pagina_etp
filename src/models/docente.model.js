module.exports = (sequelize, DataTypes) => {
  const Docente = sequelize.define('Docente', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(255), allowNull: false },
    especialidad: { type: DataTypes.STRING(255) },
    bio: { type: DataTypes.TEXT },
    email: { type: DataTypes.STRING(255) },
    foto_media_id: { type: DataTypes.INTEGER },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'docentes',
    timestamps: false
  });

  Docente.associate = function(models) {
    Docente.belongsTo(models.Media, { foreignKey: 'foto_media_id', as: 'foto' });
    Docente.belongsToMany(models.Course, { through: models.CourseDocente, foreignKey: 'docente_id', otherKey: 'course_id', as: 'courses' });
  };

  return Docente;
};

module.exports = (sequelize, DataTypes) => {
  const CourseDocente = sequelize.define('CourseDocente', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    docente_id: { type: DataTypes.INTEGER, allowNull: false },
    rol: { type: DataTypes.STRING(100) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'course_docentes',
    timestamps: false
  });

  return CourseDocente;
};

module.exports = (sequelize, DataTypes) => {
  const CourseSchedule = sequelize.define('CourseSchedule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    dia: { type: DataTypes.STRING(20), allowNull: false },
    turno: { type: DataTypes.STRING(50) },
    hora_inicio: { type: DataTypes.TIME },
    hora_fin: { type: DataTypes.TIME },
    aula: { type: DataTypes.STRING(50) },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'course_schedules',
    timestamps: false
  });

  CourseSchedule.associate = function(models) {
    CourseSchedule.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
  };

  return CourseSchedule;
};

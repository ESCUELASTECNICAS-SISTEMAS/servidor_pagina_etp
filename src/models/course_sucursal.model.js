module.exports = (sequelize, DataTypes) => {
  const CourseSucursal = sequelize.define('CourseSucursal', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    sucursal_id: { type: DataTypes.INTEGER, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'course_sucursales',
    timestamps: false
  });

  return CourseSucursal;
};

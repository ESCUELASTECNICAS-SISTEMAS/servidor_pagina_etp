module.exports = (sequelize, DataTypes) => {
  const Seminario = sequelize.define('Seminario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    titulo: { type: DataTypes.STRING(255), allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    fecha: { type: DataTypes.DATE },
    duracion_horas: { type: DataTypes.INTEGER },
    orden: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'seminarios',
    timestamps: false
  });

  Seminario.associate = function(models) {
    Seminario.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
  };

  return Seminario;
};

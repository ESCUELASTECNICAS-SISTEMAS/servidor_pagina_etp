module.exports = (sequelize, DataTypes) => {
  const PreInscripcion = sequelize.define('PreInscripcion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    apellido: { type: DataTypes.STRING(120), allowNull: false },
    celular: { type: DataTypes.STRING(40), allowNull: false },
    dni: { type: DataTypes.STRING(20), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false },
    modalidad_id: { type: DataTypes.INTEGER, allowNull: false },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    sucursal_id: { type: DataTypes.INTEGER, allowNull: false },
    acepta_politicas: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    atendido: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    tableName: 'pre_inscripciones',
    timestamps: false
  });

  PreInscripcion.associate = function(models) {
    PreInscripcion.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
    PreInscripcion.belongsTo(models.Sucursal, { foreignKey: 'sucursal_id', as: 'sucursal' });
    PreInscripcion.belongsTo(models.Modalidad, { foreignKey: 'modalidad_id', as: 'modalidad' });
  };

  return PreInscripcion;
};

module.exports = (sequelize, DataTypes) => {
  const Certificado = sequelize.define('Certificado', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    titulo: { type: DataTypes.STRING(255), allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    institucion_emisora: { type: DataTypes.STRING(255) },
    orden: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'certificados',
    timestamps: false
  });

  Certificado.associate = function(models) {
    Certificado.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
  };

  return Certificado;
};

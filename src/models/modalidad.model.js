module.exports = (sequelize, DataTypes) => {
  const Modalidad = sequelize.define('Modalidad', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    descripcion: { type: DataTypes.STRING(255), allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'modalidades',
    timestamps: false
  });

  return Modalidad;
};

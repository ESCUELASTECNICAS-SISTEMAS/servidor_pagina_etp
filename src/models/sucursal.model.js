module.exports = (sequelize, DataTypes) => {
  const Sucursal = sequelize.define('Sucursal', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    ciudad: { type: DataTypes.STRING(120), allowNull: false },
    direccion: { type: DataTypes.STRING(255) },
    telefono: { type: DataTypes.STRING(40) },
    email: { type: DataTypes.STRING(150) },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'sucursales',
    timestamps: false
  });

  Sucursal.associate = function(models) {
    Sucursal.hasMany(models.User, { foreignKey: 'sucursal_id', as: 'users' });
    Sucursal.hasMany(models.Course, { foreignKey: 'sucursal_id', as: 'coursesPrincipal' });
    Sucursal.hasMany(models.SocialLink, { foreignKey: 'sucursal_id', as: 'socialLinks' });
    Sucursal.belongsToMany(models.Course, { through: models.CourseSucursal, foreignKey: 'sucursal_id', otherKey: 'course_id', as: 'courses' });
  };

  return Sucursal;
};
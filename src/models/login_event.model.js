module.exports = (sequelize, DataTypes) => {
  const LoginEvent = sequelize.define('LoginEvent', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    sucursal_id: { type: DataTypes.INTEGER, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'login_events',
    timestamps: false
  });

  LoginEvent.associate = function(models) {
    LoginEvent.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    LoginEvent.belongsTo(models.Sucursal, { foreignKey: 'sucursal_id', as: 'sucursal' });
  };

  return LoginEvent;
};

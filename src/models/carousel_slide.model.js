module.exports = (sequelize, DataTypes) => {
  const CarouselSlide = sequelize.define('CarouselSlide', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    media_id: { type: DataTypes.INTEGER },
    title: { type: DataTypes.STRING(255) },
    order_index: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, {
    tableName: 'carousel_slides',
    timestamps: false
  });

  CarouselSlide.associate = function(models) {
    CarouselSlide.belongsTo(models.Media, { foreignKey: 'media_id', as: 'media' });
  };

  return CarouselSlide;
};

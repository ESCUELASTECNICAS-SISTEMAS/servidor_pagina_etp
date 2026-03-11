module.exports = (sequelize, DataTypes) => {
  const CourseExtraMedia = sequelize.define('CourseExtraMedia', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    media_id: { type: DataTypes.INTEGER, allowNull: false },
    position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'course_extra_media',
    timestamps: false
  });

  CourseExtraMedia.associate = function(models) {
    CourseExtraMedia.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });
    CourseExtraMedia.belongsTo(models.Media, { foreignKey: 'media_id', as: 'media' });
  };

  return CourseExtraMedia;
};

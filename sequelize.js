
const Sequelize = require('sequelize'),
      sequelize = new Sequelize({
        dialect : "sqlite",
        storage : "fsjstd-restapi.db"
      });

const UserModel   = require('./models/user');
const CourseModel = require('./models/course');
const User        = UserModel(sequelize,Sequelize);
const Course      = CourseModel(sequelize,Sequelize);

User.hasMany(Course,{ 
  foreignKey : {
    fieldname : 'courseUserId'
  }
});

Course.belongsTo(User,{ 
  foreignKey : {
    fieldname : 'courseUserId'
  }
});

module.exports = {
  sequelize,
  User,
  Course
};

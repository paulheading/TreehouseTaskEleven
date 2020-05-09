
module.exports = (sequelize, type) => {
  return sequelize.define('user', {
    
    id: {
      type: type.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    firstName: {
      type: type.STRING,
      validate: {
        notEmpty: {
          msg: "First name is required"
        }
      }
    },

    lastName: {
      type: type.STRING,
      validate: {
        notEmpty: {
          msg: "Last name is required"
        }
      }
    },

    emailAddress: {
      type: type.STRING,
      validate: {
        notEmpty: {
          msg: "Email address is required"
        }
      }
    },

    password: {
      type: type.STRING,
      validate: {
        notEmpty: {
          msg: "Password is required"
        }
      }
    }
  })
}


const { sequelize, User } = require('../sequelize');

module.exports = (sequelize, type) => {
  return sequelize.define('course', {

    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    userId: {
      type: type.INTEGER,
      references: {
        // This is a reference to another model
        model: User,   
        // This is the column name of the referenced model
        key: 'id'
      }
    },

    title: {
      type: type.STRING,
      validate: {
        notEmpty: {
          msg: "Title is required"
        }
      }
    },

    description: {
      type: type.TEXT,
      validate: {
        notEmpty: {
          msg: "Description is required"
        }
      }
    },

    estimatedTime: {
      type: type.STRING,
      allowNull: true
    },

    materialsNeeded: {
      type: type.STRING,
      allowNull: true
    }

  })
}

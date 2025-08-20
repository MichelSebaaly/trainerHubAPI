const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const User = require("./users");

const Program = sequelize.define(
  "programs",
  {
    trainer_id: {
      type: DataTypes.INTEGER,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    file_url: {
      type: DataTypes.STRING,
      unique: true,
    },
    cover_photo: {
      type: DataTypes.STRING,
      unique: true,
    },
    equipment: {
      type: DataTypes.STRING,
    },
    goal: {
      type: DataTypes.STRING,
    },
  },
  {
    schema: "content",
    tableName: "programs",
  }
);

User.hasMany(Program, {
  foreignKey: {
    name: "trainer_id",
  },
});
Program.belongsTo(User, {
  foreignKey: {
    name: "trainer_id",
  },
});

module.exports = Program;

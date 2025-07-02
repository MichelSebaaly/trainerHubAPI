const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const User = require("./users");
const Program = require("./programs");

const ProgramSales = sequelize.define(
  "program_sales",
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    program_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    platform_fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    trainer_earnings: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM("UNPAID", "REFUNDED", "PAID"),
      defaultValue: "UNPAID",
      allowNull: false,
    },
  },
  {
    schema: "billing",
    timestamps: true,
    indexes: [{ fields: ["program_id"] }],
  }
);

User.belongsToMany(Program, {
  through: { model: ProgramSales, schema: "billing" },
  foreignKey: "user_id",
  otherKey: "program_id",
});
Program.belongsToMany(User, {
  through: { model: ProgramSales, schema: "billing" },
  foreignKey: "program_id",
  otherKey: "user_id",
});

User.hasMany(ProgramSales, { foreignKey: "user_id" });
ProgramSales.belongsTo(User, { foreignKey: "user_id" });

Program.hasMany(ProgramSales, { foreignKey: "program_id" });
ProgramSales.belongsTo(Program, {
  foreignKey: "program_id",
  as: "program",
});

module.exports = ProgramSales;

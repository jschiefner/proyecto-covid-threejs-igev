'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class caseweek extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  caseweek.init({
    country: DataTypes.STRING,
    region: DataTypes.STRING,
    nuts: DataTypes.STRING,
    date: DataTypes.DATE,
    incidence: DataTypes.INTEGER,
    source: DataTypes.STRING,
    count: DataTypes.INTEGER,
    population: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'caseweek',
  });
  return caseweek;
};
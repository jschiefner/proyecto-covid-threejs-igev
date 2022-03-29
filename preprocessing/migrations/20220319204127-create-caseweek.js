'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('caseweeks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      country: {
        type: Sequelize.STRING
      },
      region: {
        type: Sequelize.STRING
      },
      nuts: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATEONLY
      },
      incidence: {
        type: Sequelize.DECIMAL
      },
      source: {
        type: Sequelize.STRING
      },
      count: {
        type: Sequelize.INTEGER
      },
      population: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('caseweeks');
  }
};

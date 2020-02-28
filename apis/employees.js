const express = require('express');
const sqlite3 = require('sqlite3');

const timesheetsRouter = require('./timesheets');
const employeesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.use('/:employeeId/timesheet', timesheetsRouter);

employeesRouter.get('/', (req, res, next) => {

    const sql = 'SELECT * FROM Employees WHERE is_current_employee = 1';

    db.all(sql, (err, employees) => {
        if (err) {
            res.sendStatus(500);
        } else {
            res.status(200).send({employees: employees});
        }
    })

});






module.exports = employeesRouter;
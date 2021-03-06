const express = require('express');
const sqlite3 = require('sqlite3');

const timesheetsRouter = require('./timesheets');
const employeesRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);



employeesRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Employee WHERE is_current_employee = 1';
    db.all(sql, (err, employees) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({employees: employees});
        }
    });
});

const validateEmployee = (req, res, next) => {
  const employee = req.body.employee;
  if (!employee.name || !employee.position || !employee.wage) {
      return res.sendStatus(400);
  } else {
      next();
  }
};

employeesRouter.post('/', validateEmployee, (req, res, next) => {
    const employee = req.body.employee;
    const name = employee.name;
    const position = employee.position;
    const wage = employee.wage;
    const isCurrentEmployee = employee.isCurrentEmployee === 0 ? 0 : 1;

    const sql = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ' +
        '($name, $position, $wage, $isCurrentEmployee)';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee
    };

    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (error, employee) => {
                res.status(201).json({employee: employee})
            });
        }
    });
});

employeesRouter.param('employeeId', (req, res, next, employeeId) => {

    const sql = 'SELECT * FROM Employee WHERE Employee.Id = $employeeId';
    const values = {
        $employeeId: employeeId
    };
    db.get(sql, values, (error, employee) => {
        if (error) {
            next(error);
        } else if (employee) {
                req.employee = employee;
                next();
            } else {
            res.sendStatus(404);
        }
    });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
});

employeesRouter.put('/:employeeId', validateEmployee, (req, res, next) => {
    const employee = req.body.employee;
    const name = employee.name;
    const position = employee.position;
    const wage = employee.wage;
    const isCurrentEmployee = employee.isCurrentEmployee === 0 ? 0 : 1;

    const sql = 'UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee' +
        ' WHERE Employee.id = $employeeId';
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee,
        $employeeId: req.params.employeeId
    };

    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (error, employee) => {
                res.status(200).json({employee: employee});
            });
        }
    });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {

    const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
    const deleteSql = 'UPDATE Employee SET is_current_employee = 0 WHERE Employee.id = $employeeId';
    const value = {
        $employeeId: req.params.employeeId
    };
    db.run(deleteSql, value, (error) => {
        if (error) {
            next(error);
        } else {
            db.get(sql, value, (error, employee) => {
                res.status(200).json({employee: employee});
            });
        }
    });

});





module.exports = employeesRouter;
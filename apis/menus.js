const express = require('express');
const sqlite3 = require('sqlite3');

const menuItemsRouter = require('./menu-items')

const menusRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/', (req, res, next) => {
    const sql = "SELECT * FROM Menu";

    db.all(sql, (err, menus) => {
        if (err) {
            next(err);
        } else {
            res.status(200).send({menus: menus})
        }
    })

});

menusRouter.post('/', (req, res, next) => {
    const menu = req.body.menu;
    const title = menu.title;

    if (!title) {
        return res.sendStatus(400);
    }

    const sql = 'INSERT INTO Menu (title) VALUES ($title)';
    const values = {
        $title: title
    };

    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, (error, menu) => {
                res.status(201).json({menu: menu});
            });
        }
    });
});

menusRouter.param('menuId', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const values = {
        $menuId: menuId
    };
    db.get(sql, values, (error, menu) => {
        if (error) {
            next(error);
        } else if (menu) {
            req.menu = menu;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});
//
menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});

});
//
menusRouter.put('/:menuId', (req, res, next) => {
    const menu = req.body.menu;
    const title = menu.title;

    if (!title) {
        return res.sendStatus(400);
    }

    const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
    const values = {
        $title: title,
        $menuId: req.params.menuId
    };

    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, (error, menu) => {
                res.status(200).json({menu: menu});
            });
        }
    });

});

menusRouter.delete('/:menuId', (req, res, next) => {
    const menuSql = 'SELECT * FROM MenuItem Where MenuItem.menu_id = $menuId';
    const menuValue = {
        $menuId: req.params.menuId
    };

    db.get(menuSql, menuValue, (error, menuItem) => {
        if (error) {
            next(error);
        } else if (menuItem) {
            res.sendStatus(400);
        } else {
            const sql = 'DELETE FROM Menu WHERE Menu.id = $menuId';

            db.run(sql, menuValue, (error) => {
                if (error) {
                    next(error)
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });



});





module.exports = menusRouter;
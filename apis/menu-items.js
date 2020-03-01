const express = require('express');
const sqlite3 = require('sqlite3');

const menuItemsRouter = express.Router({mergeParams: true});

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');




menuItemsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const values = {
        $menuId: req.params.menuId
    };

    db.all(sql, values, (error, menuItems) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({menuItems: menuItems});
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {

    const name = req.body.menuItem.name;
    const description = req.body.menuItem.description;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const menuId = req.params.menuId;

    if (!name || !description || !inventory|| !price) {
        return res.sendStatus(400);
    }

    const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menu_Id) ' +
        'VALUES ($name, $description, $inventory, $price, $menuId)';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId
    };

    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
                (error, menuItem) => {
                    res.status(201).send({menuItem: menuItem});
                });
        }
    });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const menuItem = req.body.menuItem;
    const name = menuItem.name;
    const description = menuItem.description;
    const inventory = menuItem.inventory;
    const price = menuItem.price;
    const menuId = req.params.menuId;

    if (!name || !description || !inventory|| !price || !menuId) {
        return res.sendStatus(400);
    }

    const sql = 'UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE menuItem.id = $menuItemId';
    const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.params.menuItemId
    };

    db.run(sql, values, function(error) {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
                (error, menuItem) => {
                    res.status(200).json({menuItem: menuItem})
                });
        }
    });

});

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.Id = $menuItemId';
    const values = {
        $menuItemId: menuItemId
    };
    db.get(sql, values, (error, menuItem) => {
        if (error) {
            next(error);
        } else if (menuItem) {
            req.menuItem = menuItem;
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {

    const sql = 'DELETE FROM MenuItem WHERE MenuItem.id = $menuItemId';
    const value = {$menuItemId: req.params.menuItemId};

    db.run(sql, value, (error) => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(204);
        }
    });
});









module.exports = menuItemsRouter;
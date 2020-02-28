const express = require('express');
const sqlite3 = require('sqlite3');

const menuItemsRouter = express.Router({mergeParams: true});

const menusRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.use('/:menuId/menu-items', menuItemsRouter);











module.exports = menusRouter;
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sqlite3 = require('sqlite3').verbose();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// 打開資料庫
var db = new sqlite3.Database('db/sqlite.db', (err) => {
    if (err) {
        console.error('資料庫打開失敗：', err.message);
    } else {
        console.log('成功連接到資料庫');
    }
});

// 查詢API
app.get('/api/query', (req, res) => {
    const year = req.query.year;
    const month = req.query.month;

    if (!year || !month) {
        return res.status(400).json({ error: 'Year and month are required' });
    }

    const query = `SELECT money FROM sweetpotato WHERE year = ? AND month = ?`;
    db.get(query, [year, month], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'No data found' });
        }
        res.json(row);
    });
});

module.exports = app;

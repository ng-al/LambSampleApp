// Copyright (c) Alvin Pivowar 2015, 2016

var Promise = require("promise");
var sqlite3 = require("sqlite3").verbose();

var Sqlite3Method = {
    ALL: "all",
    GET: "get",
    RUN: "run"
};

function execute(method, sql, params, result) {
    var that = this;

    return new Promise(function(accept, reject) {
        that.db[method](sql, params, function(err, response) {
            if (err) {
                console.log("Sqlite3: " + err);
                reject(err);
            } else
                accept((typeof result !== "undefined") ? result : response);
        });
    });
}

function SqlLite3Helper(dbOrPath, mode) {
    this.db = (dbOrPath === Object(dbOrPath))
        ? dbOrPath
        : new sqlite3.Database(dbOrPath, mode, function(err) {
            if (err)
                console.log("Sqlite3: Unable to open \"" + dbOrPath + "\" (" + err + ")");
        });
}

SqlLite3Helper.prototype = {
    all: function(sql, params, result) {
        return execute.call(this, Sqlite3Method.ALL, sql, params, result);
    },

    close: function() {
        this.db.close(function(err) {
            if (err)
                console.log("Sqlite3: Database close failed");
        });
    },

    get: function(sql, params, result) {
        return execute.call(this, Sqlite3Method.GET, sql, params, result);
    },

    getRowCount: function(tableName) {
        var that = this;

        return new Promise(function(accept, reject) {
            execute.call(that, Sqlite3Method.GET, "select count(*) from " + tableName).then(function(row) {
                accept(row["count(*)"]);
            }, function(err) {
                reject(err);
            });
        });
    },

    run: function(sql, params, result) {
        return execute.call(this, Sqlite3Method.RUN, sql, params, result);
    }
};

module.exports = SqlLite3Helper;
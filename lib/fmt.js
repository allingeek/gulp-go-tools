'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var exec = require('child_process').exec;
var escape = require('any-shell-escape');
var path = require('path');

module.exports = function(pkg, opt) {
  if (!pkg) pkg = '';
  if (!opt) opt = {};
  if (!opt.cwd) opt.cwd = process.cwd();
  if (!opt.maxBuffer) opt.maxBuffer = 200 * 1024;

  var files = [];
  var paths = [];
  var fileCwd = process.cwd;

  var write = function(file, enc, cb){
    files.push(file);
    paths.push(file.path);
    fileCwd = file.cwd;
    cb();
  };

  var flush = function(cb) {
    var cwd = opt.cwd || fileCwd;

    var cmd = 'go fmt ' + escape(pkg);
    var that = this;
    exec(cmd, {cwd: cwd}, function(err, stdout, stderr) {
      if (err) cb(err);
      if (!opt.quiet) gutil.log(stdout, stderr);
      files.forEach(that.push.bind(that));
      that.emit('end');
      cb();
    });
  };

  return through.obj(write, flush);
};

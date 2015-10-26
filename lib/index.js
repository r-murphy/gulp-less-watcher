'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _accord = require('accord');

var _accord2 = _interopRequireDefault(_accord);

var _vinyl = require('vinyl');

var _vinyl2 = _interopRequireDefault(_vinyl);

var _through2 = require('through2');

var _through22 = _interopRequireDefault(_through2);

//import util     from 'gulp-util';

var _deepmerge = require('deepmerge');

var _deepmerge2 = _interopRequireDefault(_deepmerge);

var _createError = require('./createError');

var _createError2 = _interopRequireDefault(_createError);

var _createWatcher = require('./createWatcher');

var _createWatcher2 = _interopRequireDefault(_createWatcher);

//const {log} = util;
var less = _accord2['default'].load('less');

exports['default'] = function () {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var throughStream = _through22['default'].obj(function (file, enc, cb) {
    var _this = this;

    if (file.isNull()) {
      return cb(null, file);
    }

    if (file.isStream()) {
      return cb((0, _createError2['default'])('Streaming not supported'));
    }

    var filename = file.path;
    var watch = (0, _createWatcher2['default'])(filename);

    var scan = function scan() {
      var contents = _fs2['default'].readFileSync(filename);
      less.render(contents.toString(), (0, _deepmerge2['default'])(options, { filename: filename })).then(function (_ref) {
        var imports = _ref.imports;

        var newFile = new _vinyl2['default']({
          contents: contents,
          cwd: file.cwd,
          base: process.cwd(),
          path: file.path
        });
        _this.push(newFile);

        // Filter node_modules imports.
        imports = imports.filter(function (ffilename) {
          return !ffilename.match(/node_modules/);
        });
        watch(imports).on('all', scan);

        // cb(null, newFile);
      })['catch'](function (err) {
        return _this.emit('error', (0, _createError2['default'])(err));
      });
    };

    scan();
  });

  throughStream.end = function () {
    //suppress the end call on the stream
  };

  return throughStream;
};

module.exports = exports['default'];
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./server-src/main.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./config.json":
/*!*********************!*\
  !*** ./config.json ***!
  \*********************/
/*! exports provided: secret, default */
/***/ (function(module) {

eval("module.exports = {\"secret\":\"I LOVE MY WIFE XU LINA\"};\n\n//# sourceURL=webpack:///./config.json?");

/***/ }),

/***/ "./server-src/file-recv.js":
/*!*********************************!*\
  !*** ./server-src/file-recv.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return FileRecv; });\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\n\nvar FileRecv =\n/*#__PURE__*/\nfunction () {\n  function FileRecv(size, path) {\n    _classCallCheck(this, FileRecv);\n\n    this.fileSize = size, this.filePath = path, this.data = '', this.currLen = 0, this.handler = null;\n    this.blockSize = 524288;\n  }\n\n  _createClass(FileRecv, [{\n    key: \"getPercent\",\n    value: function getPercent() {\n      return parseInt(this.currLen / this.fileSize * 100);\n    }\n  }, {\n    key: \"getPosition\",\n    value: function getPosition() {\n      return this.currLen / this.blockSize;\n    }\n  }, {\n    key: \"updateLen\",\n    value: function updateLen(data) {\n      this.data += data;\n      this.currLen += data.length;\n    }\n  }, {\n    key: \"isFinished\",\n    value: function isFinished() {\n      return this.fileSize === this.currLen;\n    }\n  }, {\n    key: \"write\",\n    value: function write() {\n      // returns a promise\n      return this.handler.write(this.data, 0, \"Binary\");\n    }\n  }, {\n    key: \"open\",\n    value: function open() {\n      // https://nodejs.org/api/fs.html#fs_fspromises_open_path_flags_mode\n      // returns a Promise that finally resolved a FileHandle object\n      return fs__WEBPACK_IMPORTED_MODULE_0__[\"promises\"].open(this.filePath, 'a', 493);\n    }\n  }, {\n    key: \"close\",\n    value: function close() {\n      return this.handler.close();\n    }\n  }, {\n    key: \"delete\",\n    value: function _delete() {\n      return fs__WEBPACK_IMPORTED_MODULE_0__[\"promises\"].unlink(this.filePath);\n    }\n  }, {\n    key: \"progress\",\n    value: function progress() {\n      return {\n        'position': this.getPosition(),\n        'percent': this.getPercent()\n      };\n    }\n  }]);\n\n  return FileRecv;\n}();\n\n\n\n//# sourceURL=webpack:///./server-src/file-recv.js?");

/***/ }),

/***/ "./server-src/main.js":
/*!****************************!*\
  !*** ./server-src/main.js ***!
  \****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(__dirname) {/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! body-parser */ \"body-parser\");\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(body_parser__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! cors */ \"cors\");\n/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(cors__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var express_jwt__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! express-jwt */ \"express-jwt\");\n/* harmony import */ var express_jwt__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(express_jwt__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! jsonwebtoken */ \"jsonwebtoken\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var _config_json__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../config.json */ \"./config.json\");\nvar _config_json__WEBPACK_IMPORTED_MODULE_6___namespace = /*#__PURE__*/__webpack_require__.t(/*! ../config.json */ \"./config.json\", 1);\n/* harmony import */ var _file_recv_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./file-recv.js */ \"./server-src/file-recv.js\");\n/* harmony import */ var mssql__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! mssql */ \"mssql\");\n/* harmony import */ var mssql__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(mssql__WEBPACK_IMPORTED_MODULE_8__);\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nfunction _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }\n\nfunction _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }\n\n\n\n\n\n\n\n\n\nvar Files = {};\n\nvar config = {\n  user: \"marvin\",\n  password: \"1q0o2w9i3e8u\",\n  server: \"192.168.0.127\",\n  options: {\n    encrypt: true\n  },\n  authentication: {\n    type: \"default\",\n    options: {\n      userName: \"marvin\",\n      password: \"1q0o2w9i3e8u\"\n    }\n  }\n};\nvar app = express__WEBPACK_IMPORTED_MODULE_0___default()();\nvar server = app.listen(1337, function () {\n  console.log('Server is listening 1337');\n  console.log(\"run from the \" + __dirname);\n});\napp.use(express__WEBPACK_IMPORTED_MODULE_0___default.a.static(path__WEBPACK_IMPORTED_MODULE_1___default.a.join(__dirname, '../public')));\napp.use(body_parser__WEBPACK_IMPORTED_MODULE_2___default.a.urlencoded({\n  extended: false\n}));\napp.use(body_parser__WEBPACK_IMPORTED_MODULE_2___default.a.json());\napp.use(cors__WEBPACK_IMPORTED_MODULE_3___default()()); // use JWT auth to secure the api\n\napp.use(express_jwt__WEBPACK_IMPORTED_MODULE_4___default()({\n  secret: _config_json__WEBPACK_IMPORTED_MODULE_6__.secret\n}).unless({\n  path: ['/users/authenticate/']\n}));\nvar users = [{\n  id: 1,\n  username: 'test',\n  password: 'test',\n  firstName: 'Test',\n  lastName: 'User'\n}];\napp.post('/users/authenticate/', function authenticate(req, res, next) {\n  (function (_ref) {\n    var username = _ref.username,\n        password = _ref.password;\n    return new Promise(function (resolve, reject) {\n      var user = users.find(function (u) {\n        return u.username === username && u.password === password;\n      });\n\n      if (user) {\n        var _password = user.password,\n            userWOPass = _objectWithoutProperties(user, [\"password\"]);\n\n        resolve(_objectSpread({\n          token: jsonwebtoken__WEBPACK_IMPORTED_MODULE_5___default.a.sign({\n            sub: user.id\n          }, _config_json__WEBPACK_IMPORTED_MODULE_6__.secret)\n        }, userWOPass));\n      } else resolve(undefined);\n    });\n  })(req.body).then(function (user) {\n    return user ? res.json(user) : res.status(400).json({\n      message: '啊啦啦，用户名或密码不对'\n    });\n  }).catch(function (err) {\n    return next(err);\n  });\n});\napp.use(function errorHandler(err, req, res, next) {\n  if (typeof err === 'string') {\n    // custom application error\n    return res.status(400).json({\n      message: err\n    });\n  }\n\n  if (err.name === 'UnauthorizedError') {\n    // jwt authentication error\n    return res.status(401).json({\n      message: 'Invalid Token'\n    });\n  } // default to 500 server error\n\n\n  console.log(err);\n  return res.status(500).json({\n    message: err.message\n  });\n});\n\nvar restore = function restore(pool, path) {\n  var query = \"declare @mdfpath nvarchar(max),\" + \"        @ldfpath nvarchar(max)\" + \"\" + \"select @mdfpath = [0], @ldfpath = [1]\" + \"    from (select type, physical_name \" + \"            from sys.master_files\" + \"            WHERE database_id = DB_ID(N'rebase'))\" + \"    as paths \" + \"pivot(max(physical_name) for type in ([0], [1])) as pvt;\" + \"\" + \"restore database rebase from disk = N'\" + path + \"' WITH FILE = 1,\" + \"MOVE N'Ufmodel'     TO @mdfpath,\" + \"MOVE N'Ufmodel_LOG' TO @ldfpath, \" + \"NOUNLOAD,  REPLACE,  STATS = 10;\";\n  return pool.request().query(query);\n};\n\nvar fetchTable = function fetchTable(pool, tableName) {\n  var req = pool.request();\n  return req.query(\"use rebase; select * from \" + tableName + \";\");\n}; // io.sockets.on('connection', function (socket) {\n//     socket.on('start', function (data) { \n//         var fileStub;\n//         Files[data.name] = fileStub = new FileRecv(data.size, path.join('D:/temp', data.name));\n//         fileStub.open().then(function(fd){\n//             console.log(\"[start] file \" + data.name + \" desc created, ready to receive more.\");\n//             fileStub.handler = fd;\n//             socket.emit('more', { 'position': 0, 'percent': 0 });\n//         }).catch(function(err){\n//             console.error('[start] file open error: ' + err.toString());\n//         });\n//     });\n//     socket.on('single-table-request', function(message){\n//         sql.connect(config)\n//         .then(function(pool){\n//             return fetchTable(pool);\n//         }).then(function(res){\n//             console.log(Object.keys(res));\n//             socket.emit('msg', {type:\"VOUCHER\", voucher: res.recordset});\n//         }).catch(function(err){\n//             socket.emit('err', {type: err});\n//         }).finally(function(){\n//             sql.close();\n//         });\n//     });\n//     socket.on('upload', function (data) {\n//         var fileStub = Files[data.name];\n//         fileStub.updateLen(data.segment);\n//         if (fileStub.isFinished()) {\n//             fileStub.write().then(function(){\n//                 return fileStub.close();\n//             }).then(function(){\n//                 socket.emit('msg', { type:\"UPLOAD_DONE\", file: fileStub.name });\n//                 return sql.connect(config);\n//             }).then(function(pool){\n//                 return restore(pool, fileStub.filePath)\n//                         .then(function(res){\n//                             console.log(res);\n//                             socket.emit('msg', {type:\"RESTORE_DONE\"});\n//                             return fetchTable(pool, \"code\");\n//                         }).then(function(res){\n//                             socket.emit('msg', {type:\"DATA\", tableName:\"SYS_code\", data: res.recordset});\n//                             return pool.query('select * from RPT_ItmDEF');\n//                         }).then(function(res){\n//                             socket.emit('msg', {type:\"DATA\", tableName:\"SYS_RPT_ItmDEF\", data: res.recordset});\n//                             return fetchTable(pool, \"GL_accvouch\");\n//                         }).then(function(res){\n//                             socket.emit('msg', {type:\"DATA\", tableName:\"GL_accvouch\", data:res.recordset});\n//                             return fetchTable(pool, \"GL_accsum\");\n//                         }).then(function(res){\n//                             socket.emit('msg', {type:\"DATA\", tableName:\"GL_accsum\", data:res.recordset});\n//                         }).catch(function(err){\n//                             socket.emit('err', {type: err});\n//                         }).finally(function(){\n//                             // DURING DEVELOPMENT: delete the file anyway. \n//                             return fileStub.delete();\n//                         });\n//             }).then(function(){\n//                 fileStub = undefined;\n//                 return sql.close();\n//             }).catch(function(err){\n//                 console.error(err);\n//             });\n//         } else if (fileStub.data.length > 10485760) { //buffer >= 10MB\n//             fileStub.write().then(function(){\n//                 fileStub.data = ''; //reset the buffer\n//                 socket.emit('more', fileStub.progress());\n//             }).catch(function(err){\n//                 console.error(err);\n//             });\n//         } else {\n//             socket.emit('more', fileStub.progress());\n//         }\n//     });\n// });\n/* WEBPACK VAR INJECTION */}.call(this, \"server-src\"))\n\n//# sourceURL=webpack:///./server-src/main.js?");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"body-parser\");\n\n//# sourceURL=webpack:///external_%22body-parser%22?");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"cors\");\n\n//# sourceURL=webpack:///external_%22cors%22?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express\");\n\n//# sourceURL=webpack:///external_%22express%22?");

/***/ }),

/***/ "express-jwt":
/*!******************************!*\
  !*** external "express-jwt" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express-jwt\");\n\n//# sourceURL=webpack:///external_%22express-jwt%22?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"jsonwebtoken\");\n\n//# sourceURL=webpack:///external_%22jsonwebtoken%22?");

/***/ }),

/***/ "mssql":
/*!************************!*\
  !*** external "mssql" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"mssql\");\n\n//# sourceURL=webpack:///external_%22mssql%22?");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"path\");\n\n//# sourceURL=webpack:///external_%22path%22?");

/***/ })

/******/ });
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

/***/ "./server-src/database.js":
/*!********************************!*\
  !*** ./server-src/database.js ***!
  \********************************/
/*! exports provided: operate, retrieve, retrieveAndStore */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"operate\", function() { return operate; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"retrieve\", function() { return retrieve; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"retrieveAndStore\", function() { return retrieveAndStore; });\n/* harmony import */ var mssql__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mssql */ \"mssql\");\n/* harmony import */ var mssql__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mssql__WEBPACK_IMPORTED_MODULE_0__);\nfunction _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }\n\nfunction _nonIterableSpread() { throw new TypeError(\"Invalid attempt to spread non-iterable instance\"); }\n\nfunction _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === \"[object Arguments]\") return Array.from(iter); }\n\nfunction _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }\n\n\n\nvar fs = __webpack_require__(/*! fs */ \"fs\").promises;\n\nvar config = {\n  user: \"marvin\",\n  password: \"all4Jesus\",\n  server: \"192.168.0.128\",\n  connectionTimeout: 300000,\n  idleTimeoutMillis: 300000,\n  requestTimeout: 300000,\n  max: 100\n};\nvar queries = {\n  RESTORE: function RESTORE(path) {\n    return \"declare @mdfpath nvarchar(max),\\n@ldfpath nvarchar(max)\\n\\nselect @mdfpath = [0], @ldfpath = [1]\\nfrom (select type, physical_name\\n    from sys.master_files\\n    WHERE database_id = DB_ID(N'rebase'))\\nas paths\\npivot(max(physical_name) for type in ([0], [1])) as pvt;\\n\\nrestore database rebase from disk = N'\".concat(path, \"' WITH FILE=1,\\nMOVE N'Ufmodel'     TO @mdfpath,\\nMOVE N'Ufmodel_LOG' TO @ldfpath,\\nNOUNLOAD,  REPLACE,  STATS = 10;\");\n  },\n  PROGRESS: function PROGRESS() {\n    return \"SELECT command,\\n    start_time,\\n    percent_complete,\\n    CAST(estimated_completion_time/60000 as varchar) + 'min' as est_remaining_time\\nFROM sys.dm_exec_requests r\\nCROSS APPLY sys.dm_exec_sql_text(r.sql_handle) s\\nWHERE r.command='RESTORE DATABASE';\";\n  },\n  CHECKIYEAR: function CHECKIYEAR() {\n    return \"SELECT * FROM rebase.information_schema.columns WHERE column_name='iyear' AND table_name='GL_accvouch'\";\n  },\n  BALANCE: function BALANCE(iyearExisting) {\n    var year = iyearExisting ? \"iyear\" : \"0 as iyear\";\n    return \"select accsum.i_id, iperiod, \".concat(year, \", accsum.ccode, ccode_name, cclass, mb, md, mc, me from rebase.dbo.GL_accsum accsum\\n    join rebase.dbo.code code\\n    on code.ccode=accsum.ccode;\");\n  },\n  ENTRIES: function ENTRIES(iyearExisting) {\n    var year = iyearExisting ? \"iyear\" : \"0 as iyear\";\n    return \"select cus_vouchers.*, ccode_name, cclass from\\n    (select ino_id, inid, iperiod, \".concat(year, \", ccode, ccode_equal, cdigest, cCusCode, cCusName, md, mc from\\n        rebase.dbo.GL_accvouch vouchers\\n        left join (select cCusName, cCusCode from rebase.dbo.Customer) customer\\n        on vouchers.ccus_id = customer.cCusCode) as cus_vouchers\\n    join rebase.dbo.code code\\n    on cus_vouchers.ccode=code.ccode;\");\n  },\n  CATEGORY: function CATEGORY(iyearExisting) {\n    return \"select code.ccode, ccode_name, cclass\\n    from rebase.dbo.code code\\njoin (\\n    select distinct ccode\\n        from rebase.dbo.GL_accsum\\n    ) as accsum\\non code.ccode=accsum.ccode\";\n  }\n};\nfunction operate(method, args) {\n  return new Promise(function (resolve, reject) {\n    var pool = new mssql__WEBPACK_IMPORTED_MODULE_0___default.a.ConnectionPool(config);\n    return pool.connect().then(function (pool) {\n      return pool.request().query(queries[method](args));\n    }).then(function (res) {\n      resolve(res);\n    })[\"catch\"](function (err) {\n      reject(err);\n    })[\"finally\"](function () {\n      pool.close();\n    });\n  });\n}\nfunction retrieve(method, args) {\n  return new Promise(function (resolve, reject) {\n    var pool = new mssql__WEBPACK_IMPORTED_MODULE_0___default.a.ConnectionPool(config);\n    return pool.connect().then(function (pool) {\n      return pool.request().query(queries.CHECKIYEAR());\n    }).then(function (res) {\n      var iyearExisting = res.recordset.length === 1;\n      return pool.request().query(queries[method].apply(queries, [iyearExisting].concat(_toConsumableArray(args))));\n    }).then(function (res) {\n      resolve(res);\n    })[\"catch\"](function (err) {\n      reject(err);\n    })[\"finally\"](function () {\n      pool.close();\n    });\n  });\n}\nfunction retrieveAndStore(path, method) {\n  var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];\n  return retrieve(method, args).then(function (res) {\n    // console.log(res);\n    console.log(\"writing file\", path, method, \"\".concat(res.recordset.length, \" lines\"));\n    return fs.writeFile(\"\".concat(path, \".\").concat(method, \".JSON\"), JSON.stringify(res.recordset));\n  })[\"catch\"](function (err) {\n    console.error(path, method, err);\n  });\n}\n\n//# sourceURL=webpack:///./server-src/database.js?");

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
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(__dirname) {/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! body-parser */ \"body-parser\");\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(body_parser__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! cors */ \"cors\");\n/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(cors__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _file_recv_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./file-recv.js */ \"./server-src/file-recv.js\");\n/* harmony import */ var _database_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./database.js */ \"./server-src/database.js\");\nfunction ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n\nvar BACKUP_PATH = '/Users/yuetao/SimulateServerStorage';\n\n\n\n\n\nvar fs = __webpack_require__(/*! fs */ \"fs\").promises;\n\n\nvar Files = {};\n\nvar app = express__WEBPACK_IMPORTED_MODULE_0___default()();\nvar server = app.listen(1337, function () {\n  console.log('Server is listening 1337');\n  console.log(\"run from the \" + __dirname);\n});\n\nvar io = __webpack_require__(/*! socket.io */ \"socket.io\").listen(server);\n\nvar tableServer = io.of('/TABLES');\nvar uploadServer = io.of('/UPLOAD');\napp.use(express__WEBPACK_IMPORTED_MODULE_0___default.a[\"static\"](path__WEBPACK_IMPORTED_MODULE_1___default.a.join(__dirname, '../public')));\napp.use(body_parser__WEBPACK_IMPORTED_MODULE_2___default.a.urlencoded({\n  extended: false\n}));\napp.use(body_parser__WEBPACK_IMPORTED_MODULE_2___default.a.json());\napp.use(cors__WEBPACK_IMPORTED_MODULE_3___default()());\nuploadServer.on('connection', function (socket) {\n  socket.on('START', function (data) {\n    var fileStub;\n    Files[data.name] = fileStub = new _file_recv_js__WEBPACK_IMPORTED_MODULE_4__[\"default\"](data.size, path__WEBPACK_IMPORTED_MODULE_1___default.a.join(BACKUP_PATH, data.path));\n    fileStub.open('a').then(function (fd) {\n      console.log(\"[start] file \" + data.name + \" desc created, ready to receive more.\");\n      fileStub.handler = fd;\n      socket.emit('UPLOAD_MORE', {\n        'position': 0,\n        'percent': 0\n      });\n    })[\"catch\"](function (err) {\n      console.error('[start] file open error: ' + err.toString());\n    });\n  });\n  socket.on('SEND', function (data) {\n    var fileStub = Files[data.name];\n    fileStub.updateLen(data.segment);\n\n    if (fileStub.isFinished()) {\n      fileStub.write().then(function () {\n        return fileStub.close();\n      }).then(function () {\n        return fs.readdir(BACKUP_PATH);\n      }).then(function (res) {\n        socket.emit('DONE', {\n          list: res\n        });\n      });\n    } else if (fileStub.data.length > 10485760) {\n      //buffer >= 10MB\n      fileStub.write().then(function () {\n        fileStub.data = ''; //reset the buffer\n\n        socket.emit('MORE', fileStub.progress());\n      })[\"catch\"](function (err) {\n        console.error(err);\n      });\n    } else {\n      socket.emit('MORE', fileStub.progress());\n    }\n  });\n});\ntableServer.on('connection', function (socket) {\n  socket.on('REQUIRE_LIST', function () {\n    fs.readdir(BACKUP_PATH).then(function (res) {\n      socket.emit('LIST', {\n        list: res\n      });\n    })[\"catch\"](function (err) {\n      console.log('server reading local file failed', err);\n    });\n  });\n  socket.on('START', function (_ref) {\n    var projName = _ref.projName,\n        sheetName = _ref.sheetName,\n        type = _ref.type;\n    var fileName = \"\".concat(projName, \".\").concat(sheetName).concat(type === undefined ? \"\" : \".\" + type, \".JSON\"),\n        filePath = path__WEBPACK_IMPORTED_MODULE_1___default.a.join(BACKUP_PATH, fileName);\n    fs.open(filePath).then(function (fileHandle) {\n      Files[fileName] = {\n        fileHandle: fileHandle,\n        buffer: Buffer.alloc(524288),\n        blockSize: 524288,\n        currPosition: 0\n      };\n      console.log('opening file', fileName);\n      socket.emit('TRANS', {\n        projName: projName,\n        sheetName: sheetName,\n        progress: 0,\n        data: undefined,\n        type: 'FIRST'\n      });\n    })[\"catch\"](function (err) {\n      console.log('opening file failed', err);\n\n      if (err.code === 'ENOENT' && type === \"CONF\") {\n        console.log('CONF file not created yet. Now create it.');\n        fs.writeFile(filePath, '[]').then(function (res) {\n          return fs.open(filePath);\n        }).then(function (fileHandle) {\n          Files[fileName] = {\n            fileHandle: fileHandle,\n            buffer: Buffer.alloc(524288),\n            blockSize: 524288,\n            currPosition: 0\n          };\n          console.log('opening file', fileName);\n          socket.emit('TRANS', {\n            projName: projName,\n            sheetName: sheetName,\n            progress: 0,\n            data: undefined,\n            type: 'FIRST'\n          });\n        })[\"catch\"](function (err) {\n          console.log('opening file failed, even just the newly touched one', err);\n        });\n      }\n    });\n  });\n  socket.on('READY', function (_ref2) {\n    var projName = _ref2.projName,\n        sheetName = _ref2.sheetName,\n        type = _ref2.type;\n    var fileName = \"\".concat(projName, \".\").concat(sheetName).concat(type === undefined ? \"\" : \".\" + type, \".JSON\");\n    var _Files$fileName = Files[fileName],\n        fileHandle = _Files$fileName.fileHandle,\n        buffer = _Files$fileName.buffer,\n        blockSize = _Files$fileName.blockSize,\n        currPosition = _Files$fileName.currPosition;\n    var size;\n    fileHandle.stat().then(function (res) {\n      size = res.size;\n      return fileHandle.read(buffer, 0, blockSize);\n    }).then(function (_ref3) {\n      var bytesRead = _ref3.bytesRead,\n          buffer = _ref3.buffer;\n\n      if (currPosition === size) {\n        socket.emit('DONE', {\n          projName: projName,\n          sheetName: sheetName\n        });\n        fileHandle.close();\n      } else {\n        Files[fileName].currPosition += bytesRead;\n        var res = {\n          type: 'REST',\n          data: buffer.buffer.slice(0, bytesRead)\n        };\n        socket.emit('TRANS', _objectSpread({\n          projName: projName,\n          sheetName: sheetName,\n          progress: currPosition / size\n        }, res));\n      }\n    })[\"catch\"](function (err) {\n      console.log(err, 'file');\n    });\n  });\n  socket.on('SAVE', function (_ref4) {\n    var project = _ref4.project,\n        sheet = _ref4.sheet,\n        type = _ref4.type,\n        data = _ref4.data;\n    var filePath = \"\".concat(project, \".saved\").concat(sheet).concat(type === undefined ? \"\" : \".\" + type, \".JSON\");\n    fs.writeFile(path__WEBPACK_IMPORTED_MODULE_1___default.a.join(BACKUP_PATH, filePath), JSON.stringify(data, null, 4)).then(function (res) {\n      socket.emit('SAVED');\n    });\n  });\n  socket.on('RESTORE', function (data) {\n    var initialTables = ['BALANCE', 'ENTRIES', 'CATEGORY'];\n    console.log('begin restoring', data);\n    Object(_database_js__WEBPACK_IMPORTED_MODULE_5__[\"operate\"])('RESTORE', path__WEBPACK_IMPORTED_MODULE_1___default.a.join(BACKUP_PATH, \"\".concat(data.path, \".BAK\"))).then(function (res) {\n      var dataPath = path__WEBPACK_IMPORTED_MODULE_1___default.a.join(BACKUP_PATH, data.path);\n      Promise.all(initialTables.map(function (method) {\n        return Object(_database_js__WEBPACK_IMPORTED_MODULE_5__[\"retrieveAndStore\"])(dataPath, method);\n      })).then(function (res) {\n        return fs.writeFile(path__WEBPACK_IMPORTED_MODULE_1___default.a.join(BACKUP_PATH, \"\".concat(data.path, \".RESTORED\")));\n      }).then(function (res) {\n        socket.emit('FILEPREPARED', {});\n      });\n    })[\"catch\"](function (err) {\n      console.error(err, 'restore');\n      socket.emit('ERROR', {\n        type: \"ERROR\",\n        data: {\n          err: err,\n          from: \"restore\"\n        }\n      });\n    });\n    var processDetected = false;\n\n    (function polling() {\n      Object(_database_js__WEBPACK_IMPORTED_MODULE_5__[\"operate\"])('PROGRESS').then(function (res) {\n        if (res.recordset.length === 0) {\n          if (processDetected) {\n            console.log('no more restoring process');\n            socket.emit('RESTOREDONE', {});\n          } else {\n            setTimeout(polling, 100);\n          }\n        } else {\n          processDetected = true;\n          console.log(res.recordset[0], 'prog');\n          socket.emit('PROG', {\n            data: res.recordset[0]\n          });\n          setTimeout(polling, 100);\n        }\n      })[\"catch\"](function (err) {\n        console.log(err, 'polling');\n        socket.emit('ERROR', {\n          type: \"ERROR\",\n          data: {\n            err: err,\n            from: \"polling\"\n          }\n        });\n      });\n    })();\n  });\n});\n/* WEBPACK VAR INJECTION */}.call(this, \"server-src\"))\n\n//# sourceURL=webpack:///./server-src/main.js?");

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

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

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

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"socket.io\");\n\n//# sourceURL=webpack:///external_%22socket.io%22?");

/***/ })

/******/ });
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

/***/ "./server-src/book-restore.js":
/*!************************************!*\
  !*** ./server-src/book-restore.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return bookRestore; });\n/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! xlsx */ \"xlsx\");\n/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(xlsx__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var del__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! del */ \"del\");\n/* harmony import */ var del__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(del__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _parseTypeDictionary__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./parseTypeDictionary */ \"./server-src/parseTypeDictionary.js\");\nfunction _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }\n\nfunction _nonIterableSpread() { throw new TypeError(\"Invalid attempt to spread non-iterable instance\"); }\n\nfunction _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === \"[object Arguments]\") return Array.from(iter); }\n\nfunction _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }\n\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\n\n\n\nvar fs = __webpack_require__(/*! fs */ \"fs\").promises;\n\n\n\nvar BACKUP_PATH = '../ServerStorage';\n\nfunction parseRemap(type, book, year) {\n  var recRemap = _parseTypeDictionary__WEBPACK_IMPORTED_MODULE_3__[\"default\"][type];\n  var sheet = book.Sheets[book.SheetNames[0]],\n      // 尽管名字叫做sheet_to_json，但其实它指的是Plain Object\n  parsed = xlsx__WEBPACK_IMPORTED_MODULE_0___default.a.utils.sheet_to_json(sheet);\n  console.log(parsed);\n\n  for (var p = 0; p < parsed.length; p++) {\n    var rec = parsed[p],\n        newRec = {};\n\n    for (var ent = 0; ent < recRemap.length; ent++) {\n      var _recRemap$ent = _slicedToArray(recRemap[ent], 2),\n          oldKey = _recRemap$ent[0],\n          newKey = _recRemap$ent[1];\n\n      newRec[newKey] = rec[oldKey];\n    }\n\n    if (newRec.iyear === undefined) {\n      newRec.iyear = year;\n    }\n\n    parsed[p] = newRec;\n  }\n\n  return parsed;\n}\n\nfunction bookRestore(projName) {\n  var postProcess = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (x) {\n    return x;\n  };\n  return del__WEBPACK_IMPORTED_MODULE_2___default()([path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, projName, 'RESTORED.*')], {\n    force: true\n  }).then(function () {\n    return fs.readdir(path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, projName));\n  }).then(function (res) {\n    var fileNames = res.filter(function (path) {\n      return path.includes(projName) && path.includes('SOURCE');\n    });\n    console.log('ready to handle', fileNames); // let balancesPath = fileNames.filter(e => e.includes('BALANCE')),\n    //     journalsPath = fileNames.filter(e => e.includes('JOURNAL')),\n    //     assistedsPath = fileNames.filter(e => e.includes('ASSISTED')),\n    //     cashflowWorksheetPath = fileNames.filter(e => e.includes('CASHFLOW_WORKSHEET'));\n    // if((balancesPath.length !== journalsPath.length) || (journalsPath.length !== assistedsPath.length)){\n    //     console.log('RESTORE_MSG', '缺少某些期间/年份的数据表，对应期间的查询也无法生成，不过没有大碍。')\n    // }\n\n    var data = {\n      BALANCE: [],\n      JOURNAL: [],\n      ASSISTED: [],\n      CASHFLOW_WORKSHEET: [],\n      FINANCIAL_WORKSHEET: []\n    };\n    return Promise.all(fileNames.map(function (e) {\n      return fs.readFile(path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, projName, e)).then(function (fileBuffer) {\n        return xlsx__WEBPACK_IMPORTED_MODULE_0___default.a.read(fileBuffer, {\n          type: 'buffer'\n        });\n      })[\"catch\"](function (err) {\n        console.error(err, 'err in reading.');\n      });\n    })).then(function (result) {\n      for (var i = 0; i < fileNames.length; i++) {\n        var fileName = fileNames[i],\n            book = result[i],\n            _fileName$split = fileName.split('.'),\n            _fileName$split2 = _slicedToArray(_fileName$split, 5),\n            _S = _fileName$split2[0],\n            _N = _fileName$split2[1],\n            type = _fileName$split2[2],\n            year = _fileName$split2[3],\n            _FT = _fileName$split2[4];\n\n        var parsed = parseRemap(type, book, year); // 因为data中汇总了所有期间的数据，因此需要flatten，或者按记录push进来。\n\n        if (type === 'CASHFLOW_WORKSHEET' || type === 'FINANCIAL_WORKSHEET') {\n          data[type] = parsed;\n        } else {\n          var _data$type;\n\n          (_data$type = data[type]).push.apply(_data$type, _toConsumableArray(parsed));\n        }\n      }\n\n      data = postProcess(data);\n      console.log(Object.values(data).map(function (e) {\n        return e.length;\n      }), 'restoring');\n      return Promise.all(Object.keys(data).map(function (type) {\n        if (data[type].length === 0) {\n          return true;\n        } else {\n          return fs.writeFile(path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, projName, \"RESTORED.\".concat(projName, \".\").concat(type, \".JSON\")), JSON.stringify(data[type]));\n        }\n      }));\n    });\n  });\n}\n\n//# sourceURL=webpack:///./server-src/book-restore.js?");

/***/ }),

/***/ "./server-src/database.js":
/*!********************************!*\
  !*** ./server-src/database.js ***!
  \********************************/
/*! exports provided: operate, retrieve, retrieveAndStore */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"operate\", function() { return operate; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"retrieve\", function() { return retrieve; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"retrieveAndStore\", function() { return retrieveAndStore; });\n/* harmony import */ var mssql__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mssql */ \"mssql\");\n/* harmony import */ var mssql__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mssql__WEBPACK_IMPORTED_MODULE_0__);\nfunction _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }\n\nfunction _nonIterableSpread() { throw new TypeError(\"Invalid attempt to spread non-iterable instance\"); }\n\nfunction _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === \"[object Arguments]\") return Array.from(iter); }\n\nfunction _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }\n\n\n\nvar fs = __webpack_require__(/*! fs */ \"fs\").promises;\n\nvar config = {\n  user: \"marvin\",\n  password: \"all4Jesus\",\n  server: \"192.168.0.128\",\n  connectionTimeout: 300000,\n  idleTimeoutMillis: 300000,\n  requestTimeout: 300000,\n  max: 100\n};\nvar queries = {\n  RESTORE: function RESTORE(path) {\n    return \"declare @mdfpath nvarchar(max),\\n@ldfpath nvarchar(max)\\n\\nselect @mdfpath = [0], @ldfpath = [1]\\nfrom (select type, physical_name\\n    from sys.master_files\\n    WHERE database_id = DB_ID(N'rebase'))\\nas paths\\npivot(max(physical_name) for type in ([0], [1])) as pvt;\\n\\nrestore database rebase from disk = N'\".concat(path, \"' WITH FILE=1,\\nMOVE N'Ufmodel'     TO @mdfpath,\\nMOVE N'Ufmodel_LOG' TO @ldfpath,\\nNOUNLOAD,  REPLACE,  STATS = 10;\");\n  },\n  PROGRESS: function PROGRESS() {\n    return \"SELECT command,\\n    start_time,\\n    percent_complete,\\n    CAST(estimated_completion_time/60000 as varchar) + 'min' as est_remaining_time\\nFROM sys.dm_exec_requests r\\nCROSS APPLY sys.dm_exec_sql_text(r.sql_handle) s\\nWHERE r.command='RESTORE DATABASE';\";\n  },\n  CHECKIYEAR: function CHECKIYEAR() {\n    return \"SELECT * FROM rebase.information_schema.columns WHERE column_name='iyear' AND table_name='GL_accvouch'\";\n  },\n  BALANCE: function BALANCE(iyearExisting) {\n    var year = iyearExisting ? \"iyear\" : \"0 as iyear\";\n    return \"select accsum.i_id, iperiod, \".concat(year, \", accsum.ccode, ccode_name, cclass, mb, md, mc, me from rebase.dbo.GL_accsum accsum\\n    join rebase.dbo.code code\\n    on code.ccode=accsum.ccode;\");\n  },\n  JOURNAL: function JOURNAL(iyearExisting) {\n    var year = iyearExisting ? \"iyear\" : \"0 as iyear\";\n    return \"select cus_vouchers.*, ccode_name, cclass from\\n    (select ino_id, inid, iperiod, \".concat(year, \", ccode, ccode_equal, cdigest, cCusCode, cCusName, md, mc from\\n        rebase.dbo.GL_accvouch vouchers\\n        left join (select cCusName, cCusCode from rebase.dbo.Customer) customer\\n        on vouchers.ccus_id = customer.cCusCode) as cus_vouchers\\n    join rebase.dbo.code code\\n    on cus_vouchers.ccode=code.ccode;\");\n  },\n  CATEGORY: function CATEGORY(iyearExisting) {\n    return \"select code.ccode, ccode_name, cclass\\n    from rebase.dbo.code code\\njoin (\\n    select distinct ccode\\n        from rebase.dbo.GL_accsum\\n    ) as accsum\\non code.ccode=accsum.ccode\";\n  }\n};\nfunction operate(method, args) {\n  return new Promise(function (resolve, reject) {\n    var pool = new mssql__WEBPACK_IMPORTED_MODULE_0___default.a.ConnectionPool(config);\n    return pool.connect().then(function (pool) {\n      return pool.request().query(queries[method](args));\n    }).then(function (res) {\n      resolve(res);\n    })[\"catch\"](function (err) {\n      reject(err);\n    })[\"finally\"](function () {\n      pool.close();\n    });\n  });\n}\nfunction retrieve(method, args) {\n  return new Promise(function (resolve, reject) {\n    var pool = new mssql__WEBPACK_IMPORTED_MODULE_0___default.a.ConnectionPool(config);\n    return pool.connect().then(function (pool) {\n      return pool.request().query(queries.CHECKIYEAR());\n    }).then(function (res) {\n      var iyearExisting = res.recordset.length === 1;\n      return pool.request().query(queries[method].apply(queries, [iyearExisting].concat(_toConsumableArray(args))));\n    }).then(function (res) {\n      resolve(res);\n    })[\"catch\"](function (err) {\n      reject(err);\n    })[\"finally\"](function () {\n      pool.close();\n    });\n  });\n}\nfunction retrieveAndStore(path, method) {\n  var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];\n  return retrieve(method, args).then(function (res) {\n    // console.log(res);\n    console.log(\"writing file\", path, method, \"\".concat(res.recordset.length, \" lines\"));\n    return fs.writeFile(\"\".concat(path, \".\").concat(method, \".JSON\"), JSON.stringify(res.recordset));\n  })[\"catch\"](function (err) {\n    console.error(path, method, err);\n  });\n}\n\n//# sourceURL=webpack:///./server-src/database.js?");

/***/ }),

/***/ "./server-src/file-serv.js":
/*!*********************************!*\
  !*** ./server-src/file-serv.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return FileServ; });\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\n\nvar BLOCK_SIZE = 524288;\n/**\n * FileServer (originally FileRecv)\n * \n * 服务端的文件chunk分发机制。主要包含三个方法，分别是 open, read和write\n * \n * Open需要用户提供当文件找不到时的机制。在实际应用中，我们通过Open来指定新创建的\n * configuration file。\n * \n * 对于一个即将接受并写入服务器的文件，需要由客户端提供文件的尺寸，以及即将写入的文\n * 件chunk。由服务器更新当前写入的位置，并返回这个位置。对于一个即将读取并发送到客\n * 户端的文件，由客户更新即将读取的位置。\n * \n * Read和Write均需要用户提供读取一个完整文件块，和最后一个（可能不完整的）文件块的机制。\n */\n\nvar FileServ =\n/*#__PURE__*/\nfunction () {\n  function FileServ(path, size) {\n    _classCallCheck(this, FileServ);\n\n    this.filePath = path;\n    this.fileSize = size || 0;\n  }\n\n  _createClass(FileServ, [{\n    key: \"writeChunk\",\n    value: function writeChunk(position, chunkBuffer, afterWrite) {\n      var _this = this;\n\n      console.log('writeChunk', position, chunkBuffer);\n      return fs__WEBPACK_IMPORTED_MODULE_0__[\"promises\"].open(this.filePath, 'a', 493).then(function (fileHandle) {\n        return fileHandle.write(chunkBuffer).then(function (_ref) {\n          var bytesWritten = _ref.bytesWritten;\n          position += bytesWritten;\n          var percent = position / _this.fileSize,\n              part = position === _this.fileSize ? 'LAST' : 'MOST';\n          var message = {\n            position: position,\n            part: part,\n            percent: percent\n          }; // afterWrite receives the updated position for requesting\n          // next chunk of file.\n\n          return afterWrite(message);\n        })[\"catch\"](function (err) {\n          return console.error(\"Write@WriteChunk: \".concat(err));\n        })[\"finally\"](function () {\n          fileHandle.close();\n        });\n      })[\"catch\"](function (err) {\n        return console.error(\"Open@WriteChunk: \".concat(err));\n      });\n    }\n  }, {\n    key: \"readChunk\",\n    value: function readChunk(position, afterRead, notExisted) {\n      var _this2 = this;\n\n      // buffer 应当在第一次读取文件的时候创建，并在文件读取结束时deallocate\n      if (this.buffer === undefined) {\n        this.buffer = Buffer.allocUnsafe(BLOCK_SIZE);\n      } // 我们为何要在此处使用position? \n      // 如果不指派position的话，每次就会更新文件本身的位置指针。然而如果由多名\n      // 用户同时访问并传输同一个文件，那么就一定会出错。因此我们在这里指定\n      // position，并且read的position是从客户端发来，这样确保每个用户同时访问文\n      // 件的时候使用的是自己的指针。\n\n\n      return fs__WEBPACK_IMPORTED_MODULE_0__[\"promises\"].stat(this.filePath).then(function (_ref2) {\n        var size = _ref2.size;\n        _this2.fileSize = size;\n        return fs__WEBPACK_IMPORTED_MODULE_0__[\"promises\"].open(_this2.filePath, 'r', 493);\n      }).then(function (fileHandle) {\n        return fileHandle.read(_this2.buffer, 0, BLOCK_SIZE, position).then(function (_ref3) {\n          var bytesRead = _ref3.bytesRead,\n              buffer = _ref3.buffer;\n          var nextPos = position + bytesRead;\n          buffer = buffer.slice(0, bytesRead);\n          var percent = nextPos / _this2.fileSize,\n              part = nextPos === _this2.fileSize ? 'LAST' : 'MOST';\n          var message = {\n            part: part,\n            nextPos: nextPos,\n            percent: percent,\n            buffer: buffer\n          };\n          console.log(message);\n          return afterRead(message);\n        })[\"catch\"](function (err) {\n          return console.error(\"Read@ReadChunk: \".concat(err));\n        })[\"finally\"](function () {\n          fileHandle.close();\n        });\n      })[\"catch\"](function (err) {\n        if (notExisted) {\n          notExisted(err);\n        } else {\n          console.error(\"Open@ReadChunk: \".concat(err));\n        }\n      });\n    }\n  }, {\n    key: \"writeFile\",\n    value: function writeFile(data, afterWrite) {\n      var _this3 = this;\n\n      return fs__WEBPACK_IMPORTED_MODULE_0__[\"promises\"].open(this.filePath, 'w', 493).then(function (handle) {\n        return handle.writeFile(data).then(function (res) {\n          handle.close().then(function () {\n            if (afterWrite !== undefined) {\n              afterWrite(_this3);\n            }\n          })[\"catch\"](function (err) {\n            console.error('close on writeFile: ', err);\n          });\n        });\n      });\n    }\n  }]);\n\n  return FileServ;\n}();\n\n\n\n//# sourceURL=webpack:///./server-src/file-serv.js?");

/***/ }),

/***/ "./server-src/main.js":
/*!****************************!*\
  !*** ./server-src/main.js ***!
  \****************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(__dirname) {/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! body-parser */ \"body-parser\");\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(body_parser__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! cors */ \"cors\");\n/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(cors__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var del__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! del */ \"del\");\n/* harmony import */ var del__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(del__WEBPACK_IMPORTED_MODULE_4__);\n/* harmony import */ var _file_serv_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./file-serv.js */ \"./server-src/file-serv.js\");\n/* harmony import */ var _database_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./database.js */ \"./server-src/database.js\");\n/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! xlsx */ \"xlsx\");\n/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(xlsx__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var _book_restore__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./book-restore */ \"./server-src/book-restore.js\");\nfunction _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\nvar BACKUP_PATH = '../ServerStorage';\n\n\n\n\n\n\nvar fs = __webpack_require__(/*! fs */ \"fs\").promises;\n\nvar DataStore = __webpack_require__(/*! nedb */ \"nedb\"),\n    db = new DataStore({\n  filename: path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(__dirname, '../passwords'),\n  autoload: true\n});\n\ndb.ensureIndex({\n  fieldName: 'username',\n  unique: true\n});\n\nvar Files = {};\n\n\n\nvar app = express__WEBPACK_IMPORTED_MODULE_0___default()();\nvar server = app.listen(8080, function () {\n  console.log('Server is listening 8080, for HTTPS');\n  console.log(\"run from the \" + __dirname);\n});\n\nvar io = __webpack_require__(/*! socket.io */ \"socket.io\").listen(server);\n\nvar tableServer = io.of('/TABLES');\nvar uploadServer = io.of('/UPLOAD');\nvar authServer = io.of('/AUTH');\napp.use(express__WEBPACK_IMPORTED_MODULE_0___default.a[\"static\"](path__WEBPACK_IMPORTED_MODULE_1___default.a.join(__dirname, '../public')));\napp.use(body_parser__WEBPACK_IMPORTED_MODULE_2___default.a.urlencoded({\n  extended: false\n}));\napp.use(body_parser__WEBPACK_IMPORTED_MODULE_2___default.a.json());\napp.use(cors__WEBPACK_IMPORTED_MODULE_3___default()());\napp.get('*', function (req, res) {\n  res.redirect('/');\n}); // 上传文件的handler响应两种message：\n// \n// PREP：接受一个包含文件名和文件尺寸的信息，创建文件并返回SEND指令，\n//       包含文件名和起始位置。\n// RECV：接受文件名和buffer的信息。返回新的百分比，和下次读取的位置。\n//       客户端如果使用file position其实可以不需要这个位置。\n\nuploadServer.on('connection', function (socket) {\n  socket.on('CREATE', function (_ref) {\n    var id = _ref.id,\n        projName = _ref.projName;\n    console.log('Creating directory of ', projName);\n    var filePath = path__WEBPACK_IMPORTED_MODULE_1___default.a.join(BACKUP_PATH, id, projName);\n    fs.mkdir(filePath).then(function () {\n      console.log('create directory done');\n      socket.emit('CREATE_DONE', {});\n    })[\"catch\"](function (_ref2) {\n      var code = _ref2.code;\n      socket.emit('ERROR', {\n        msg: code\n      });\n    });\n  });\n  socket.on('DELETE', function (_ref3) {\n    var id = _ref3.id,\n        projName = _ref3.projName;\n    console.log('received DELETE', projName, path__WEBPACK_IMPORTED_MODULE_1___default.a.join(BACKUP_PATH, id, projName));\n    var projPath = path__WEBPACK_IMPORTED_MODULE_1___default.a.join(BACKUP_PATH, id, projName);\n    del__WEBPACK_IMPORTED_MODULE_4___default()([projPath], {\n      force: true\n    }).then(function () {\n      console.log('remove directory done');\n      socket.emit('DELETE_DONE', {});\n    })[\"catch\"](function (err) {\n      console.log(err);\n      socket.emit('ERROR', {\n        msg: err.code\n      });\n    }); // fs\n  });\n  socket.on('PREP', function (_ref4) {\n    var id = _ref4.id,\n        projName = _ref4.projName,\n        name = _ref4.name,\n        size = _ref4.size;\n    var filePath = path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, id, projName, name);\n    fs.access(filePath).then(function () {\n      return fs.unlink(filePath);\n    }).then(function () {\n      console.log('File with same name has been removed.');\n    })[\"finally\"](function () {\n      Files[\"\".concat(id, \"-\").concat(name)] = new _file_serv_js__WEBPACK_IMPORTED_MODULE_5__[\"default\"](filePath, size);\n      socket.emit('SEND', {\n        name: name,\n        percent: 0,\n        position: 0\n      });\n    });\n  });\n  socket.on('RECV', function (_ref5) {\n    var id = _ref5.id,\n        position = _ref5.position,\n        name = _ref5.name,\n        data = _ref5.data;\n\n    var afterWrite = function afterWrite(_ref6) {\n      var part = _ref6.part,\n          percent = _ref6.percent,\n          position = _ref6.position;\n      console.log('afterWrite', part, percent, position);\n      var label = {\n        LAST: 'DONE',\n        MOST: 'SEND'\n      }[part];\n      socket.emit(label, {\n        name: name,\n        percent: percent,\n        position: position\n      });\n    };\n\n    Files[\"\".concat(id, \"-\").concat(name)].writeChunk(position, data, afterWrite);\n  });\n});\n\nfunction getRestoredFileName(projName, sheetName, type) {\n  return \"RESTORED.\".concat(projName, \".\").concat(sheetName).concat(type === undefined ? \"\" : \".\" + type, \".JSON\");\n}\n\ntableServer.on('connection', function (socket) {\n  socket.on('REQUIRE_LIST', function (_ref7) {\n    var id = _ref7.id;\n    console.log('Received requiring list of projects from ', id);\n    fs.readdir(path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, id), {\n      withFileTypes: true\n    }).then(function (res) {\n      socket.emit('LIST', {\n        list: res.filter(function (e) {\n          return e.isDirectory();\n        }).map(function (e) {\n          return e.name;\n        })\n      });\n    })[\"catch\"](function (err) {\n      console.log('server reading local file failed', err);\n    });\n  });\n  socket.on('SEND', function (_ref8) {\n    var id = _ref8.id,\n        projName = _ref8.projName,\n        sheetName = _ref8.sheetName,\n        type = _ref8.type,\n        position = _ref8.position;\n    console.log(\"SENDING \".concat(projName, \"-\").concat(sheetName).concat(type ? \"-\".concat(type) : '', \" FROM@ \").concat(position));\n    var fileName = getRestoredFileName(projName, sheetName, type); // 以下是读取一个块之后的操作。块的大小是固定的，并封装在了FileServ中，不难\n    // 理解，如果buffer读取的字节数小于一个块的长度，它肯定会是最后一个块（当然\n    // 也可能是第一个）。我们没有设计额外的用于通知客户端已发送完的消息，当发送\n    // 最后一个块时，标签为\"DONE\"，否则为\"RECV\"，其余信息都一样。\n\n    var afterRead = function afterRead(_ref9) {\n      var part = _ref9.part,\n          percent = _ref9.percent,\n          nextPos = _ref9.nextPos,\n          buffer = _ref9.buffer;\n      var label = {\n        LAST: 'DONE',\n        MOST: 'RECV'\n      }[part];\n      console.log(\"SENDING \".concat(projName, \"-\").concat(sheetName, \" ENDS@ \").concat(nextPos, \" \").concat(part, \" \").concat(label));\n      socket.emit(label, {\n        projName: projName,\n        sheetName: sheetName,\n        percent: percent,\n        position: nextPos,\n        data: buffer\n      });\n    }; // 以下是在打开文件时执行的后续操作，当文件打开之后，就会直接读取文件\n    // 并发送。特别注意这里的position，在afterOpen中的position总是0，尽管\n    // 从client这边传来的position也一定是0，但是我们仍然强制它是0.\n    // ifNotExist是当文件没找到时采取的操作。\n\n\n    var notExisted = function notExisted(err) {\n      if (err.code === 'ENOENT') {\n        if (type === 'CONF') {\n          console.log('CONF not created yet.');\n          socket.emit('DONE', {\n            projName: projName,\n            sheetName: sheetName,\n            data: Buffer.from('[]')\n          });\n        } else {\n          socket.emit('NOTFOUND', {\n            sheetName: sheetName,\n            projName: projName\n          });\n        }\n      }\n    }; // 如果FileServ不存在，则创建一个。由于是已经存在于本地并待发送的文件，\n    // 初始化的时候不需要指明size。会在open的时候获取。打开文件的后续操作即\n    // 上面所述的发送第一个块。如果FileServ存在，则只需要完成后续的读取-发送\n    // 操作，当然也是根据客户端发送来的position来读取。\n\n\n    var fileID = \"\".concat(id, \"-\").concat(fileName);\n\n    if (Files[fileID] === undefined) {\n      Files[fileID] = new _file_serv_js__WEBPACK_IMPORTED_MODULE_5__[\"default\"](path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, id, projName, fileName));\n    }\n\n    Files[fileID].readChunk(position, afterRead, notExisted);\n  });\n  socket.on('SAVE', function (_ref10) {\n    var id = _ref10.id,\n        projName = _ref10.projName,\n        sheetName = _ref10.sheetName,\n        type = _ref10.type,\n        data = _ref10.data;\n    var dataBuffer;\n\n    switch (_typeof(data)) {\n      case \"string\":\n        console.log('received data as string');\n        dataBuffer = Buffer.from(data);\n        break;\n\n      case 'object':\n        console.log('received data as object, whoa');\n        dataBuffer = Buffer.from(JSON.stringify(data));\n        break;\n    }\n\n    var fileName = getRestoredFileName(projName, \"saved\".concat(sheetName), type),\n        filePath = path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, id, projName, fileName);\n    fs.writeFile(filePath, dataBuffer);\n  });\n  socket.on('EXPORT', function (_ref11) {\n    var id = _ref11.id,\n        projName = _ref11.projName,\n        sheetName = _ref11.sheetName,\n        data = _ref11.data;\n    var xlsBook = xlsx__WEBPACK_IMPORTED_MODULE_7___default.a.utils.book_new();\n\n    if (Array.isArray(data)) {\n      var xlsSheet = xlsx__WEBPACK_IMPORTED_MODULE_7___default.a.utils.json_to_sheet(data);\n      xlsBook.SheetNames.push('sheet1');\n      xlsBook.Sheets['sheet1'] = xlsSheet;\n    } else if (Array.isArray(data.content)) {\n      var _xlsSheet = xlsx__WEBPACK_IMPORTED_MODULE_7___default.a.utils.json_to_sheet(data.content);\n\n      xlsBook.SheetNames.push('sheet1');\n      xlsBook.Sheets['sheet1'] = _xlsSheet;\n    } else {\n      socket.emit('ERROR', {\n        msg: '前端生成的数据不能用来导出Excel文件，请联系程序员解决这个问题。'\n      });\n      return;\n    }\n\n    var xlsOutput = xlsx__WEBPACK_IMPORTED_MODULE_7___default.a.write(xlsBook, {\n      bookType: 'xlsx',\n      type: 'binary'\n    });\n\n    function s2ab(s) {\n      var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer\n\n      var view = new Uint8Array(buf); //create uint8array as viewer\n\n      for (var i = 0; i < s.length; i++) {\n        view[i] = s.charCodeAt(i) & 0xFF;\n      } //convert to octet\n\n\n      return buf;\n    }\n\n    var outputArrayBuffed = s2ab(xlsOutput);\n    socket.emit('EXPORTED', {\n      outputArrayBuffed: outputArrayBuffed,\n      projName: projName,\n      sheetName: sheetName\n    });\n  });\n  socket.on('RESTORE', function (_ref12) {\n    var projName = _ref12.projName,\n        path = _ref12.path;\n    Object(_book_restore__WEBPACK_IMPORTED_MODULE_8__[\"default\"])(projName).then(function (result) {\n      socket.emit('FILEPREPARED', {});\n    })[\"catch\"](function (err) {\n      console.log('error during restoring xls files', err);\n    }); // console.log('begin restoring', data);\n    // operate('RESTORE', path.join(BACKUP_PATH, `${data.path}.BAK`)).then(res => {\n    //     let dataPath = path.join(BACKUP_PATH, data.path);\n    //     Promise.all(initialTables.map(method => retrieveAndStore(dataPath, method)))\n    //         .then(res => {\n    //             return fs.writeFile(path.join(BACKUP_PATH, `${data.path}.RESTORED`))\n    //         })\n    //         .then(res => {\n    //             socket.emit('FILEPREPARED', {})\n    //         })\n    // }).catch(err=>{\n    //     console.error(err, 'restore');\n    //     socket.emit('ERROR', {type:\"ERROR\", data:{err, from:\"restore\"}})\n    // });\n    // let processDetected = false;\n    // (function polling(){\n    //     operate('PROGRESS').then(function(res){\n    //         if(res.recordset.length === 0){\n    //             if(processDetected){\n    //                 console.log('no more restoring process');\n    //                 socket.emit('RESTOREDONE', {});    \n    //             } else {\n    //                 setTimeout(polling, 100);\n    //             }\n    //         } else {\n    //             processDetected = true;\n    //             console.log(res.recordset[0], 'prog');\n    //             socket.emit('PROG', {data : res.recordset[0] });\n    //             setTimeout(polling, 100);\n    //         }\n    //     }).catch(err=>{\n    //         console.log(err, 'polling');\n    //         socket.emit('ERROR', {type:\"ERROR\", data: {err, from:\"polling\"}})\n    //     })\n    // })();\n  });\n});\nauthServer.on('connection', function (socket) {\n  socket.on('LOGIN', function (_ref13) {\n    var username = _ref13.username,\n        password = _ref13.password;\n    console.log(username, password, 'recved');\n    db.findOne({\n      username: username,\n      password: password\n    }, function (err, doc) {\n      if (doc !== null) {\n        console.log(doc, 'account found');\n        var _username = doc.username,\n            nickname = doc.nickname,\n            id = doc._id;\n        socket.emit('LOG_DONE', {\n          username: _username,\n          nickname: nickname,\n          id: id\n        });\n      } else {\n        socket.emit('LOG_NOT_FOUND');\n      }\n    });\n  });\n  socket.on('REGISTER', function (_ref14) {\n    var username = _ref14.username,\n        password = _ref14.password,\n        nickname = _ref14.nickname;\n    db.insert({\n      username: username,\n      password: password,\n      nickname: nickname\n    }, function (err, newDoc) {\n      if (!err) {\n        console.log(newDoc, 'reged');\n        var id = newDoc._id;\n        fs.mkdir(path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, id)).then(function () {\n          socket.emit('REG_DONE', {\n            id: newDoc._id\n          });\n        })[\"catch\"](function (err) {\n          socket.emit('ERROR', JSON.stringify(err));\n        });\n      } else if (err.errorType === 'uniqueViolated') {\n        socket.emit('REG_DUP_NAME');\n      } else {\n        socket.emit('ERROR', JSON.stringify(err));\n      }\n    });\n  });\n});\n/* WEBPACK VAR INJECTION */}.call(this, \"server-src\"))\n\n//# sourceURL=webpack:///./server-src/main.js?");

/***/ }),

/***/ "./server-src/parseTypeDictionary.js":
/*!*******************************************!*\
  !*** ./server-src/parseTypeDictionary.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nvar ASSISTED = [['科目名称', 'ccode_name'], ['科目编号', 'ccode'], ['会计月', 'iperiod'], ['凭证编号', 'ino_id'], ['编号', 'inid'], ['业务说明', 'cdigest'], ['核算项目类型编号', 'check_type_code'], ['核算项目类型名称', 'check_type_name'], ['核算项目ID', 'check_id'], ['核算项目名称', 'check_name'], ['核算项目序号', 'check_num'], ['借方发生额', 'mb'], ['贷方发生额', 'mc'], ['会计年', 'iyear'], ['对方科目名称', 'ccode_equal'], ['记账时间', 'dbill_date']];\nvar JOURNAL = [['会计年', 'iyear'], ['会计月', 'iperiod'], ['记账时间', 'dbill_date'], ['凭证编号', 'ino_id'], ['编号', 'inid'], ['业务说明', 'cdigest'], ['科目编号', 'ccode'], ['科目名称', 'ccode_name'], ['借方发生额', 'md'], ['贷方发生额', 'mc'], ['对方科目名称', 'ccode_equal']];\nvar BALANCE = [['会计年', 'iyear'], ['会计月', 'iperiod'], ['科目编号', 'ccode'], ['科目名称', 'ccode_name'], ['科目类别', 'cclass'], ['账面期初数', 'mb'], ['账面借方发生额', 'md'], ['账面贷方发生额', 'mc'], ['账面期末数', 'me']];\nvar CASHFLOW_WORKSHEET = [['项目', 'item'], ['值', 'value']];\nvar FINANCIAL_WORKSHEET = [['项目', 'item'], ['值', 'value']];\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  BALANCE: BALANCE,\n  JOURNAL: JOURNAL,\n  ASSISTED: ASSISTED,\n  CASHFLOW_WORKSHEET: CASHFLOW_WORKSHEET,\n  FINANCIAL_WORKSHEET: FINANCIAL_WORKSHEET\n});\n\n//# sourceURL=webpack:///./server-src/parseTypeDictionary.js?");

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

/***/ "del":
/*!**********************!*\
  !*** external "del" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"del\");\n\n//# sourceURL=webpack:///external_%22del%22?");

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

/***/ "nedb":
/*!***********************!*\
  !*** external "nedb" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"nedb\");\n\n//# sourceURL=webpack:///external_%22nedb%22?");

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

/***/ }),

/***/ "xlsx":
/*!***********************!*\
  !*** external "xlsx" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"xlsx\");\n\n//# sourceURL=webpack:///external_%22xlsx%22?");

/***/ })

/******/ });
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
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return bookRestore; });\n/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! xlsx */ \"xlsx\");\n/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(xlsx__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var del__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! del */ \"del\");\n/* harmony import */ var del__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(del__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var _parseTypeDictionary__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./parseTypeDictionary */ \"./server-src/parseTypeDictionary.js\");\nfunction _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }\n\nfunction _nonIterableSpread() { throw new TypeError(\"Invalid attempt to spread non-iterable instance\"); }\n\nfunction _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === \"[object Arguments]\") return Array.from(iter); }\n\nfunction _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }\n\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\n\n\n\nvar fs = __webpack_require__(/*! fs */ \"fs\").promises;\n\n\n\nvar BACKUP_PATH = '../ServerStorage';\n\nfunction parseRemap(type, book) {\n  var recRemap = _parseTypeDictionary__WEBPACK_IMPORTED_MODULE_3__[\"default\"][type];\n  var sheet = book.Sheets[book.SheetNames[0]],\n      // 尽管名字叫做sheet_to_json，但其实它指的是Plain Object\n  parsed = xlsx__WEBPACK_IMPORTED_MODULE_0___default.a.utils.sheet_to_json(sheet);\n  console.log(parsed);\n\n  for (var p = 0; p < parsed.length; p++) {\n    var rec = parsed[p],\n        newRec = {};\n\n    for (var ent = 0; ent < recRemap.length; ent++) {\n      var _recRemap$ent = _slicedToArray(recRemap[ent], 2),\n          oldKey = _recRemap$ent[0],\n          newKey = _recRemap$ent[1];\n\n      if (oldKey in rec) {\n        newRec[newKey] = rec[oldKey];\n      }\n    }\n\n    if (newRec.iperiod === undefined) {\n      newRec.iperiod = 0;\n    }\n\n    parsed[p] = newRec;\n  }\n\n  return parsed;\n}\n\nfunction bookRestore(id, projName) {\n  var postProcess = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function (x) {\n    return x;\n  };\n  console.log('restoring', path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, id, projName));\n  return del__WEBPACK_IMPORTED_MODULE_2___default()([path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, id, projName, 'RESTORED.*')], {\n    force: true\n  }).then(function () {\n    return fs.readdir(path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, id, projName));\n  }).then(function (res) {\n    var fileNames = res.filter(function (filePath) {\n      return filePath.includes('SOURCE');\n    });\n    console.log('ready to handle', res, fileNames);\n    var data = {\n      BALANCE: [],\n      JOURNAL: [],\n      ASSISTED: [],\n      CASHFLOW_WORKSHEET: [],\n      FINANCIAL_WORKSHEET: []\n    };\n    return Promise.all(fileNames.map(function (e) {\n      return fs.readFile(path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, id, projName, e)).then(function (fileBuffer) {\n        return xlsx__WEBPACK_IMPORTED_MODULE_0___default.a.read(fileBuffer, {\n          type: 'buffer'\n        });\n      })[\"catch\"](function (err) {\n        console.error(err, 'err in reading.');\n      });\n    })).then(function (result) {\n      for (var i = 0; i < fileNames.length; i++) {\n        var fileName = fileNames[i],\n            book = result[i],\n            _fileName$split = fileName.split('.'),\n            _fileName$split2 = _slicedToArray(_fileName$split, 3),\n            _S = _fileName$split2[0],\n            bookType = _fileName$split2[1],\n            _FileType = _fileName$split2[2];\n\n        var parsed = parseRemap(bookType, book); // 因为data中汇总了所有期间的数据，因此需要flatten，或者按记录push进来。\n\n        if (['CASHFLOW_WORKSHEET', 'FINANCIAL_WORKSHEET'].includes(bookType)) {\n          data[bookType] = parsed;\n        } else {\n          var _data$bookType;\n\n          (_data$bookType = data[bookType]).push.apply(_data$bookType, _toConsumableArray(parsed));\n        }\n      }\n\n      data = postProcess(data);\n      console.log(Object.values(data).map(function (e) {\n        return e.length;\n      }), 'restoring');\n      return Promise.all(Object.keys(data).map(function (type) {\n        if (data[type].length === 0) {\n          return true;\n        } else {\n          return fs.writeFile(path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(BACKUP_PATH, id, projName, \"RESTORED.\".concat(type, \".JSON\")), JSON.stringify(data[type]));\n        }\n      }));\n    });\n  });\n}\n\n//# sourceURL=webpack:///./server-src/book-restore.js?");

/***/ }),

/***/ "./server-src/config.js":
/*!******************************!*\
  !*** ./server-src/config.js ***!
  \******************************/
/*! exports provided: BACKUP_PATH */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"BACKUP_PATH\", function() { return BACKUP_PATH; });\nvar BACKUP_PATH = '../ServerStorage';\n\n//# sourceURL=webpack:///./server-src/config.js?");

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
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(__dirname) {/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ \"express\");\n/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(express__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! body-parser */ \"body-parser\");\n/* harmony import */ var body_parser__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(body_parser__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! cors */ \"cors\");\n/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(cors__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./config */ \"./server-src/config.js\");\n/* harmony import */ var _file_serv_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./file-serv.js */ \"./server-src/file-serv.js\");\n/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! xlsx */ \"xlsx\");\n/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(xlsx__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var _book_restore__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./book-restore */ \"./server-src/book-restore.js\");\n/* harmony import */ var _proj_server__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./proj-server */ \"./server-src/proj-server.js\");\n/* harmony import */ var _upload_server__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./upload-server */ \"./server-src/upload-server.js\");\nfunction _typeof(obj) { if (typeof Symbol === \"function\" && typeof Symbol.iterator === \"symbol\") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === \"function\" && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj; }; } return _typeof(obj); }\n\n\n\n\n\n\n\nvar fs = __webpack_require__(/*! fs */ \"fs\").promises;\n\nvar DataStore = __webpack_require__(/*! nedb */ \"nedb\"),\n    db = new DataStore({\n  filename: path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(__dirname, '../passwords'),\n  autoload: true\n});\n\ndb.ensureIndex({\n  fieldName: 'username',\n  unique: true\n});\n\nvar Files = {};\n\n\nvar app = express__WEBPACK_IMPORTED_MODULE_0___default()();\nvar server = app.listen(8080, function () {\n  console.log('Server is listening 8080, for HTTPS');\n  console.log(\"run from the \" + __dirname);\n});\n\nvar io = __webpack_require__(/*! socket.io */ \"socket.io\").listen(server);\n\n\n\nvar tableServer = io.of('/TABLES');\nvar uploadServer = io.of('/UPLOAD');\nvar projServer = io.of('/PROJECT');\nvar authServer = io.of('/AUTH');\napp.use(express__WEBPACK_IMPORTED_MODULE_0___default.a[\"static\"](path__WEBPACK_IMPORTED_MODULE_1___default.a.join(__dirname, '../public')));\napp.use(body_parser__WEBPACK_IMPORTED_MODULE_2___default.a.urlencoded({\n  extended: false\n}));\napp.use(body_parser__WEBPACK_IMPORTED_MODULE_2___default.a.json());\napp.use(cors__WEBPACK_IMPORTED_MODULE_3___default()());\napp.get('*', function (req, res) {\n  res.redirect('/');\n});\nprojServer.on('connection', function (socket) {\n  socket = Object(_proj_server__WEBPACK_IMPORTED_MODULE_8__[\"default\"])(socket);\n});\nuploadServer.on('connection', function (socket) {\n  socket = Object(_upload_server__WEBPACK_IMPORTED_MODULE_9__[\"default\"])(socket, Files);\n});\n\nfunction getRestoredFileName(sheetName, type) {\n  return \"RESTORED.\".concat(sheetName).concat(type === undefined ? \"\" : \".\" + type, \".JSON\");\n}\n\ntableServer.on('connection', function (socket) {\n  socket.on('SEND', function (_ref) {\n    var id = _ref.id,\n        projName = _ref.projName,\n        sheetName = _ref.sheetName,\n        type = _ref.type,\n        position = _ref.position;\n    console.log(\"SENDING \".concat(projName, \"-\").concat(sheetName).concat(type ? \"-\".concat(type) : '', \" FROM@ \").concat(position));\n    var fileName = getRestoredFileName(sheetName, type);\n    console.log('restored filename', fileName); // 以下是读取一个块之后的操作。块的大小是固定的，并封装在了FileServ中，不难\n    // 理解，如果buffer读取的字节数小于一个块的长度，它肯定会是最后一个块（当然\n    // 也可能是第一个）。我们没有设计额外的用于通知客户端已发送完的消息，当发送\n    // 最后一个块时，标签为\"DONE\"，否则为\"RECV\"，其余信息都一样。\n\n    var afterRead = function afterRead(_ref2) {\n      var part = _ref2.part,\n          percent = _ref2.percent,\n          nextPos = _ref2.nextPos,\n          buffer = _ref2.buffer;\n      var label = {\n        LAST: 'DONE',\n        MOST: 'RECV'\n      }[part];\n      console.log(\"SENDING \".concat(projName, \"-\").concat(sheetName, \" ENDS@ \").concat(nextPos, \" \").concat(part, \" \").concat(label));\n      socket.emit(label, {\n        projName: projName,\n        sheetName: sheetName,\n        percent: percent,\n        position: nextPos,\n        data: buffer\n      });\n    }; // 以下是在打开文件时执行的后续操作，当文件打开之后，就会直接读取文件\n    // 并发送。特别注意这里的position，在afterOpen中的position总是0，尽管\n    // 从client这边传来的position也一定是0，但是我们仍然强制它是0.\n    // ifNotExist是当文件没找到时采取的操作。\n\n\n    var notExisted = function notExisted(err) {\n      if (err.code === 'ENOENT') {\n        if (type === 'CONF') {\n          console.log('CONF not created yet.');\n          socket.emit('DONE', {\n            projName: projName,\n            sheetName: sheetName,\n            data: Buffer.from('[]')\n          });\n        } else {\n          socket.emit('NOTFOUND', {\n            sheetName: sheetName,\n            projName: projName\n          });\n        }\n      }\n    }; // 如果FileServ不存在，则创建一个。由于是已经存在于本地并待发送的文件，\n    // 初始化的时候不需要指明size。会在open的时候获取。打开文件的后续操作即\n    // 上面所述的发送第一个块。如果FileServ存在，则只需要完成后续的读取-发送\n    // 操作，当然也是根据客户端发送来的position来读取。\n\n\n    var fileID = \"\".concat(id, \"-\").concat(fileName);\n\n    if (Files[fileID] === undefined) {\n      Files[fileID] = new _file_serv_js__WEBPACK_IMPORTED_MODULE_5__[\"default\"](path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(_config__WEBPACK_IMPORTED_MODULE_4__[\"BACKUP_PATH\"], id, projName, fileName));\n    }\n\n    Files[fileID].readChunk(position, afterRead, notExisted);\n  });\n  socket.on('SAVE', function (_ref3) {\n    var id = _ref3.id,\n        projName = _ref3.projName,\n        sheetName = _ref3.sheetName,\n        type = _ref3.type,\n        data = _ref3.data;\n    var dataBuffer;\n\n    switch (_typeof(data)) {\n      case \"string\":\n        console.log('received data as string');\n        dataBuffer = Buffer.from(data);\n        break;\n\n      case 'object':\n        console.log('received data as object, whoa');\n        dataBuffer = Buffer.from(JSON.stringify(data));\n        break;\n    }\n\n    console.log(_config__WEBPACK_IMPORTED_MODULE_4__[\"BACKUP_PATH\"], id, projName, fileName);\n    var fileName = getRestoredFileName(\"saved\".concat(sheetName), type),\n        filePath = path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(_config__WEBPACK_IMPORTED_MODULE_4__[\"BACKUP_PATH\"], id, projName, fileName);\n    fs.writeFile(filePath, dataBuffer);\n  });\n  socket.on('EXPORT', function (_ref4) {\n    var id = _ref4.id,\n        projName = _ref4.projName,\n        sheetName = _ref4.sheetName,\n        data = _ref4.data;\n    var xlsBook = xlsx__WEBPACK_IMPORTED_MODULE_6___default.a.utils.book_new();\n\n    if (Array.isArray(data)) {\n      var xlsSheet = xlsx__WEBPACK_IMPORTED_MODULE_6___default.a.utils.json_to_sheet(data);\n      xlsBook.SheetNames.push('sheet1');\n      xlsBook.Sheets['sheet1'] = xlsSheet;\n    } else {\n      console.log(data);\n\n      for (var key in data) {\n        var _xlsSheet = xlsx__WEBPACK_IMPORTED_MODULE_6___default.a.utils.json_to_sheet(data[key]);\n\n        xlsBook.SheetNames.push(key);\n        xlsBook.Sheets[key] = _xlsSheet;\n      }\n    }\n\n    var xlsOutput = xlsx__WEBPACK_IMPORTED_MODULE_6___default.a.write(xlsBook, {\n      bookType: 'xlsx',\n      type: 'binary'\n    });\n\n    function s2ab(s) {\n      var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer\n\n      var view = new Uint8Array(buf); //create uint8array as viewer\n\n      for (var i = 0; i < s.length; i++) {\n        view[i] = s.charCodeAt(i) & 0xFF;\n      } //convert to octet\n\n\n      return buf;\n    }\n\n    var outputArrayBuffed = s2ab(xlsOutput);\n    socket.emit('EXPORTED', {\n      outputArrayBuffed: outputArrayBuffed,\n      projName: projName,\n      sheetName: sheetName\n    });\n  });\n});\nauthServer.on('connection', function (socket) {\n  socket.on('LOGIN', function (_ref5) {\n    var username = _ref5.username,\n        password = _ref5.password;\n    console.log(username, password, 'recved');\n    db.findOne({\n      username: username,\n      password: password\n    }, function (err, doc) {\n      if (doc !== null) {\n        console.log(doc, 'account found');\n        var _username = doc.username,\n            nickname = doc.nickname,\n            id = doc._id;\n        socket.emit('LOG_DONE', {\n          username: _username,\n          nickname: nickname,\n          id: id\n        });\n      } else {\n        socket.emit('LOG_NOT_FOUND');\n      }\n    });\n  });\n  socket.on('REGISTER', function (_ref6) {\n    var username = _ref6.username,\n        password = _ref6.password,\n        nickname = _ref6.nickname;\n    db.insert({\n      username: username,\n      password: password,\n      nickname: nickname\n    }, function (err, newDoc) {\n      if (!err) {\n        console.log(newDoc, 'reged');\n        var id = newDoc._id;\n        fs.mkdir(path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(_config__WEBPACK_IMPORTED_MODULE_4__[\"BACKUP_PATH\"], id)).then(function () {\n          socket.emit('REG_DONE', {\n            id: newDoc._id\n          });\n        })[\"catch\"](function (err) {\n          socket.emit('ERROR', JSON.stringify(err));\n        });\n      } else if (err.errorType === 'uniqueViolated') {\n        socket.emit('REG_DUP_NAME');\n      } else {\n        socket.emit('ERROR', JSON.stringify(err));\n      }\n    });\n  });\n});\n/* WEBPACK VAR INJECTION */}.call(this, \"server-src\"))\n\n//# sourceURL=webpack:///./server-src/main.js?");

/***/ }),

/***/ "./server-src/parseTypeDictionary.js":
/*!*******************************************!*\
  !*** ./server-src/parseTypeDictionary.js ***!
  \*******************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\nvar ASSISTED = [['科目名称', 'ccode_name'], ['科目编号', 'ccode'], ['会计月', 'iperiod'], ['凭证编号', 'ino_id'], ['编号', 'inid'], ['业务说明', 'cdigest'], ['核算项目类型编号', 'check_type_code'], ['核算项目类型名称', 'check_type_name'], ['核算项目ID', 'check_id'], ['核算项目名称', 'check_name'], ['核算项目序号', 'check_num'], ['借方发生额', 'mb'], ['贷方发生额', 'mc'], ['会计年', 'iyear'], ['对方科目名称', 'ccode_equal'], ['记账时间', 'dbill_date']];\nvar JOURNAL = [['会计年', 'iyear'], ['会计月', 'iperiod'], ['记账时间', 'dbill_date'], ['凭证编号', 'ino_id'], ['编号', 'inid'], ['行', 'inid'], ['业务说明', 'cdigest'], ['摘要', 'cdigest'], ['科目编号', 'ccode'], ['科目名称', 'ccode_name'], ['借方发生额', 'md'], ['贷方发生额', 'mc'], ['对方科目名称', 'ccode_equal']];\nvar BALANCE = [['会计年', 'iyear'], ['会计月', 'iperiod'], ['科目编号', 'ccode'], ['科目名称', 'ccode_name'], ['科目类别', 'cclass'], ['账面期初数', 'mb'], ['期初金额', 'mb'], ['期初余额', 'mb'], ['账面借方发生额', 'md'], ['借方发生额', 'md'], ['账面贷方发生额', 'mc'], ['贷方发生额', 'mc'], ['账面期末数', 'me'], ['期末金额', 'me'], ['期末余额', 'me']];\nvar CASHFLOW_WORKSHEET = [['项目', 'item'], ['值', 'value']];\nvar FINANCIAL_WORKSHEET = [['项目', 'item'], ['值', 'value']];\n/* harmony default export */ __webpack_exports__[\"default\"] = ({\n  BALANCE: BALANCE,\n  JOURNAL: JOURNAL,\n  ASSISTED: ASSISTED,\n  CASHFLOW_WORKSHEET: CASHFLOW_WORKSHEET,\n  FINANCIAL_WORKSHEET: FINANCIAL_WORKSHEET\n});\n\n//# sourceURL=webpack:///./server-src/parseTypeDictionary.js?");

/***/ }),

/***/ "./server-src/proj-server.js":
/*!***********************************!*\
  !*** ./server-src/proj-server.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var del__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! del */ \"del\");\n/* harmony import */ var del__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(del__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./config */ \"./server-src/config.js\");\nfunction _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }\n\nfunction _nonIterableRest() { throw new TypeError(\"Invalid attempt to destructure non-iterable instance\"); }\n\nfunction _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i[\"return\"] != null) _i[\"return\"](); } finally { if (_d) throw _e; } } return _arr; }\n\nfunction _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }\n\nvar fs = __webpack_require__(/*! fs */ \"fs\").promises;\n\n\n\n\n\nvar requireProjectList = function requireProjectList(socket) {\n  return function (_ref) {\n    var id = _ref.id;\n    console.log('Received requiring list of projects from ', id);\n    fs.readdir(path__WEBPACK_IMPORTED_MODULE_1___default.a.resolve(_config__WEBPACK_IMPORTED_MODULE_2__[\"BACKUP_PATH\"], id), {\n      withFileTypes: true\n    }).then(function (res) {\n      var list = res.filter(function (e) {\n        return e.isDirectory();\n      }).map(function (e) {\n        var _e$name$split = e.name.split('-'),\n            _e$name$split2 = _slicedToArray(_e$name$split, 2),\n            projName = _e$name$split2[0],\n            year = _e$name$split2[1];\n\n        return {\n          projName: projName,\n          year: year\n        };\n      });\n      socket.emit('PROJECT_LIST', {\n        list: list\n      });\n    })[\"catch\"](function (err) {\n      console.log('server reading local file failed', err);\n    });\n  };\n};\n\nfunction copyFromPublic(fileName, id, projPath) {\n  var sourceFileName = fileName,\n      sourcePath = path__WEBPACK_IMPORTED_MODULE_1___default.a.join(_config__WEBPACK_IMPORTED_MODULE_2__[\"BACKUP_PATH\"], 'public', sourceFileName),\n      targetFileName = \"SOURCE.\".concat(sourceFileName),\n      targetPath = path__WEBPACK_IMPORTED_MODULE_1___default.a.join(_config__WEBPACK_IMPORTED_MODULE_2__[\"BACKUP_PATH\"], id, projPath, targetFileName);\n  return {\n    sourcePath: sourcePath,\n    targetPath: targetPath\n  };\n}\n\nvar createProject = function createProject(socket) {\n  return function (_ref2) {\n    var id = _ref2.id,\n        projName = _ref2.projName,\n        year = _ref2.year;\n    console.log('Creating directory of ', projName);\n    var projPath = \"\".concat(projName, \"-\").concat(year),\n        filePath = path__WEBPACK_IMPORTED_MODULE_1___default.a.join(_config__WEBPACK_IMPORTED_MODULE_2__[\"BACKUP_PATH\"], id, projPath);\n    fs.mkdir(filePath).then(function () {\n      var _copyFromPublic = copyFromPublic('CASHFLOW_WORKSHEET.xlsx', id, projPath),\n          sourcePath = _copyFromPublic.sourcePath,\n          targetPath = _copyFromPublic.targetPath;\n\n      return fs.copyFile(sourcePath, targetPath);\n    }).then(function () {\n      var _copyFromPublic2 = copyFromPublic('FINANCIAL_WORKSHEET.xlsx', id, projPath),\n          sourcePath = _copyFromPublic2.sourcePath,\n          targetPath = _copyFromPublic2.targetPath;\n\n      return fs.copyFile(sourcePath, targetPath);\n    }).then(function () {\n      console.log('create directory done');\n      socket.emit('CREATE_PROJECT_DONE', {});\n    })[\"catch\"](function (_ref3) {\n      var code = _ref3.code;\n      socket.emit('ERROR', {\n        msg: code\n      });\n    });\n  };\n};\n\nvar deleteProject = function deleteProject(socket) {\n  return function (_ref4) {\n    var id = _ref4.id,\n        projName = _ref4.projName;\n    console.log('received DELETE', projName, path__WEBPACK_IMPORTED_MODULE_1___default.a.join(_config__WEBPACK_IMPORTED_MODULE_2__[\"BACKUP_PATH\"], id, projName));\n    var projPath = path__WEBPACK_IMPORTED_MODULE_1___default.a.join(_config__WEBPACK_IMPORTED_MODULE_2__[\"BACKUP_PATH\"], id, projName);\n    del__WEBPACK_IMPORTED_MODULE_0___default()([projPath], {\n      force: true\n    }).then(function () {\n      console.log('remove directory done');\n      socket.emit('DELETE_PROJECT_DONE', {});\n    })[\"catch\"](function (err) {\n      console.log(err);\n      socket.emit('ERROR', {\n        msg: err.code\n      });\n    });\n  };\n};\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (function (socket) {\n  socket.on('REQUIRE_PROJECT_LIST', requireProjectList(socket));\n  socket.on('CREATE_PROJECT', createProject(socket));\n  socket.on('DELETE_PROJECT', deleteProject(socket));\n  return socket;\n});\n\n//# sourceURL=webpack:///./server-src/proj-server.js?");

/***/ }),

/***/ "./server-src/upload-server.js":
/*!*************************************!*\
  !*** ./server-src/upload-server.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _file_serv__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./file-serv */ \"./server-src/file-serv.js\");\n/* harmony import */ var _book_restore__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./book-restore */ \"./server-src/book-restore.js\");\n/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./config */ \"./server-src/config.js\");\nvar fs = __webpack_require__(/*! fs */ \"fs\").promises;\n\n\n\n\n\n\nvar prepareToReceive = function prepareToReceive(socket, fileHolder) {\n  return function (_ref) {\n    var id = _ref.id,\n        projName = _ref.projName,\n        name = _ref.name,\n        size = _ref.size;\n    console.log('prep to receive', id, projName, name, size);\n    var filePath = path__WEBPACK_IMPORTED_MODULE_0___default.a.resolve(_config__WEBPACK_IMPORTED_MODULE_3__[\"BACKUP_PATH\"], id, projName, name);\n    fs.access(filePath).then(function () {\n      console.log('File with same name has been removed.');\n      return fs.unlink(filePath);\n    })[\"catch\"](function (err) {\n      console.log(err);\n    })[\"finally\"](function () {\n      console.log(filePath, size, 'finally');\n      fileHolder[\"\".concat(id, \"-\").concat(projName, \"-\").concat(name)] = new _file_serv__WEBPACK_IMPORTED_MODULE_1__[\"default\"](filePath, size);\n      socket.emit('SEND', {\n        name: name,\n        percent: 0,\n        position: 0\n      });\n    });\n  };\n};\n\nvar receive = function receive(socket, fileHolder) {\n  return function (_ref2) {\n    var id = _ref2.id,\n        position = _ref2.position,\n        projName = _ref2.projName,\n        name = _ref2.name,\n        data = _ref2.data;\n    console.log('receiving', id, name);\n\n    var afterWrite = function afterWrite(_ref3) {\n      var part = _ref3.part,\n          percent = _ref3.percent,\n          position = _ref3.position;\n      console.log('afterWrite', part, percent, position);\n      var label = {\n        LAST: 'RECEIVE_DONE',\n        MOST: 'SEND'\n      }[part];\n      socket.emit(label, {\n        name: name,\n        percent: percent,\n        position: position\n      });\n    };\n\n    fileHolder[\"\".concat(id, \"-\").concat(projName, \"-\").concat(name)].writeChunk(position, data, afterWrite);\n  };\n};\n\nvar restore = function restore(socket) {\n  return function (_ref4) {\n    var id = _ref4.id,\n        projName = _ref4.projName;\n    Object(_book_restore__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(id, projName).then(function (result) {\n      socket.emit('RESTORE_DONE', {});\n    })[\"catch\"](function (err) {\n      console.log('error during restoring xls files', err);\n    });\n  };\n};\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (function (socket, fileHolder) {\n  socket.on('PREPARE_TO_RECEIVE', prepareToReceive(socket, fileHolder));\n  socket.on('RECEIVE', receive(socket, fileHolder));\n  socket.on('RESTORE', restore(socket));\n  return socket;\n}); // 以下部分代码留在这里，等到收集到足够多的.bak文件再继续启用\n// import {operate, retrieveAndStore} from './database.js';\n// console.log('begin restoring', data);\n// operate('RESTORE', path.join(BACKUP_PATH, `${data.path}.BAK`)).then(res => {\n//     let dataPath = path.join(BACKUP_PATH, data.path);\n//     Promise.all(initialTables.map(method => retrieveAndStore(dataPath, method)))\n//         .then(res => {\n//             return fs.writeFile(path.join(BACKUP_PATH, `${data.path}.RESTORED`))\n//         })\n//         .then(res => {\n//             socket.emit('FILEPREPARED', {})\n//         })\n// }).catch(err=>{\n//     console.error(err, 'restore');\n//     socket.emit('ERROR', {type:\"ERROR\", data:{err, from:\"restore\"}})\n// });\n// let processDetected = false;\n// (function polling(){\n//     operate('PROGRESS').then(function(res){\n//         if(res.recordset.length === 0){\n//             if(processDetected){\n//                 console.log('no more restoring process');\n//                 socket.emit('RESTOREDONE', {});    \n//             } else {\n//                 setTimeout(polling, 100);\n//             }\n//         } else {\n//             processDetected = true;\n//             console.log(res.recordset[0], 'prog');\n//             socket.emit('PROG', {data : res.recordset[0] });\n//             setTimeout(polling, 100);\n//         }\n//     }).catch(err=>{\n//         console.log(err, 'polling');\n//         socket.emit('ERROR', {type:\"ERROR\", data: {err, from:\"polling\"}})\n//     })\n// })();\n\n//# sourceURL=webpack:///./server-src/upload-server.js?");

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
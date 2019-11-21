!function(e){var n={};function t(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,t),r.l=!0,r.exports}t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:o})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(t.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var r in e)t.d(o,r,function(n){return e[n]}.bind(null,r));return o},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=10)}([function(e,n){e.exports=require("path")},function(e,n){e.exports=require("fs")},function(e,n){e.exports=require("xlsx")},function(e,n){e.exports=require("del")},function(e,n){e.exports=require("express")},function(e,n){e.exports=require("body-parser")},function(e,n,t){"use strict";t.d(n,"a",(function(){return i}));var o=t(1);function r(e,n){for(var t=0;t<n.length;t++){var o=n[t];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}var i=function(){function e(n,t){!function(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}(this,e),this.filePath=n,this.fileSize=t||0}var n,t,i;return n=e,(t=[{key:"writeChunk",value:function(e,n,t){var r=this;return console.log("writeChunk",e,n),o.promises.open(this.filePath,"a",493).then((function(o){return o.write(n).then((function(n){var o=n.bytesWritten,i=(e+=o)/r.fileSize,c=e===r.fileSize?"LAST":"MOST";return t({position:e,part:c,percent:i})})).catch((function(e){return console.error("Write@WriteChunk: ".concat(e))})).finally((function(){o.close()}))})).catch((function(e){return console.error("Open@WriteChunk: ".concat(e))}))}},{key:"readChunk",value:function(e,n,t){var r=this;return void 0===this.buffer&&(this.buffer=Buffer.allocUnsafe(524288)),o.promises.stat(this.filePath).then((function(e){var n=e.size;return r.fileSize=n,o.promises.open(r.filePath,"r",493)})).then((function(t){return t.read(r.buffer,0,524288,e).then((function(t){var o=t.bytesRead,i=t.buffer,c=e+o;i=i.slice(0,o);var a=c/r.fileSize,u={part:c===r.fileSize?"LAST":"MOST",nextPos:c,percent:a,buffer:i};return console.log(u),n(u)})).catch((function(e){return console.error("Read@ReadChunk: ".concat(e))})).finally((function(){t.close()}))})).catch((function(e){t?t(e):console.error("Open@ReadChunk: ".concat(e))}))}},{key:"writeFile",value:function(e,n){var t=this;return o.promises.open(this.filePath,"w",493).then((function(o){return o.writeFile(e).then((function(e){o.close().then((function(){void 0!==n&&n(t)})).catch((function(e){console.error("close on writeFile: ",e)}))}))}))}}])&&r(n.prototype,t),i&&r(n,i),e}()},function(e,n){e.exports=require("mssql")},function(e,n){e.exports=require("cors")},function(e,n,t){"use strict";var o=t(2),r=t.n(o),i=t(0),c=t.n(i),a=t(3),u=t.n(a),s={BALANCE:[["会计年","iyear"],["会计月","iperiod"],["科目编号","ccode"],["科目名称","ccode_name"],["科目类别","cclass"],["账面期初数","mb"],["账面借方发生额","md"],["账面贷方发生额","mc"],["账面期末数","me"]],JOURNAL:[["会计年","iyear"],["会计月","iperiod"],["记账时间","dbill_date"],["凭证编号","ino_id"],["编号","inid"],["业务说明","cdigest"],["科目编号","ccode"],["科目名称","ccode_name"],["借方发生额","md"],["贷方发生额","mc"],["对方科目名称","ccode_equal"]],ASSISTED:[["科目名称","ccode_name"],["科目编号","ccode"],["会计月","iperiod"],["凭证编号","ino_id"],["编号","inid"],["业务说明","cdigest"],["核算项目类型编号","check_type_code"],["核算项目类型名称","check_type_name"],["核算项目ID","check_id"],["核算项目名称","check_name"],["核算项目序号","check_num"],["借方发生额","mb"],["贷方发生额","mc"],["会计年","iyear"],["对方科目名称","ccode_equal"],["记账时间","dbill_date"]],CASHFLOW_WORKSHEET:[["项目","item"],["值","value"]],FINANCIAL_WORKSHEET:[["项目","item"],["值","value"]]};function l(e){return function(e){if(Array.isArray(e)){for(var n=0,t=new Array(e.length);n<e.length;n++)t[n]=e[n];return t}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function f(e,n){return function(e){if(Array.isArray(e))return e}(e)||function(e,n){var t=[],o=!0,r=!1,i=void 0;try{for(var c,a=e[Symbol.iterator]();!(o=(c=a.next()).done)&&(t.push(c.value),!n||t.length!==n);o=!0);}catch(e){r=!0,i=e}finally{try{o||null==a.return||a.return()}finally{if(r)throw i}}return t}(e,n)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}t.d(n,"a",(function(){return h}));var d=t(1).promises,p="../ServerStorage";function m(e,n,t){var o=s[e],i=n.Sheets[n.SheetNames[0]],c=r.a.utils.sheet_to_json(i);console.log(c);for(var a=0;a<c.length;a++){for(var u=c[a],l={},d=0;d<o.length;d++){var p=f(o[d],2),m=p[0];l[p[1]]=u[m]}void 0===l.iyear&&(l.iyear=t),void 0===l.iperiod&&(l.iperiod=0),c[a]=l}return c}function h(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(e){return e};return u()([c.a.resolve(p,e,"RESTORED.*")],{force:!0}).then((function(){return d.readdir(c.a.resolve(p,e))})).then((function(t){var o=t.filter((function(n){return n.includes(e)&&n.includes("SOURCE")}));console.log("ready to handle",o);var i={BALANCE:[],JOURNAL:[],ASSISTED:[],CASHFLOW_WORKSHEET:[],FINANCIAL_WORKSHEET:[]};return Promise.all(o.map((function(n){return d.readFile(c.a.resolve(p,e,n)).then((function(e){return r.a.read(e,{type:"buffer"})})).catch((function(e){console.error(e,"err in reading.")}))}))).then((function(t){for(var r=0;r<o.length;r++){var a,u=o[r],s=t[r],h=f(u.split("."),5),v=(h[0],h[1],h[2]),y=h[3],E=(h[4],m(v,s,y));if("CASHFLOW_WORKSHEET"===v||"FINANCIAL_WORKSHEET"===v)i[v]=E;else(a=i[v]).push.apply(a,l(E))}return i=n(i),console.log(Object.values(i).map((function(e){return e.length})),"restoring"),Promise.all(Object.keys(i).map((function(n){return 0===i[n].length||d.writeFile(c.a.resolve(p,e,"RESTORED.".concat(e,".").concat(n,".JSON")),JSON.stringify(i[n]))})))}))}))}},function(e,n,t){"use strict";t.r(n),function(e){var n=t(4),o=t.n(n),r=t(0),i=t.n(r),c=t(5),a=t.n(c),u=t(8),s=t.n(u),l=t(3),f=t.n(l),d=t(6),p=(t(12),t(2)),m=t.n(p),h=t(9);function v(e){return(v="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var y="../ServerStorage",E=t(1).promises,S=new(t(11))({filename:i.a.resolve(e,"../passwords"),autoload:!0});S.ensureIndex({fieldName:"username",unique:!0});var g={},O=o()(),N=O.listen(8080,(function(){console.log("Server is listening 8080, for HTTPS"),console.log("run from the "+e)})),b=t(13).listen(N),R=b.of("/TABLES"),_=b.of("/UPLOAD"),T=b.of("/AUTH");function A(e,n,t){return"RESTORED.".concat(e,".").concat(n).concat(void 0===t?"":"."+t,".JSON")}O.use(o.a.static(i.a.join(e,"../public"))),O.use(a.a.urlencoded({extended:!1})),O.use(a.a.json()),O.use(s()()),O.get("*",(function(e,n){n.redirect("/")})),_.on("connection",(function(e){e.on("CREATE",(function(n){var t=n.id,o=n.projName;console.log("Creating directory of ",o);var r=i.a.join(y,t,o);E.mkdir(r).then((function(){console.log("create directory done"),e.emit("CREATE_DONE",{})})).catch((function(n){var t=n.code;e.emit("ERROR",{msg:t})}))})),e.on("DELETE",(function(n){var t=n.id,o=n.projName;console.log("received DELETE",o,i.a.join(y,t,o));var r=i.a.join(y,t,o);f()([r],{force:!0}).then((function(){console.log("remove directory done"),e.emit("DELETE_DONE",{})})).catch((function(n){console.log(n),e.emit("ERROR",{msg:n.code})}))})),e.on("PREP",(function(n){var t=n.id,o=n.projName,r=n.name,c=n.size,a=i.a.resolve(y,t,o,r);E.access(a).then((function(){return E.unlink(a)})).then((function(){console.log("File with same name has been removed.")})).finally((function(){g["".concat(t,"-").concat(r)]=new d.a(a,c),e.emit("SEND",{name:r,percent:0,position:0})}))})),e.on("RECV",(function(n){var t=n.id,o=n.position,r=n.name,i=n.data;g["".concat(t,"-").concat(r)].writeChunk(o,i,(function(n){var t=n.part,o=n.percent,i=n.position;console.log("afterWrite",t,o,i);var c={LAST:"DONE",MOST:"SEND"}[t];e.emit(c,{name:r,percent:o,position:i})}))}))})),R.on("connection",(function(e){e.on("REQUIRE_LIST",(function(n){var t=n.id;console.log("Received requiring list of projects from ",t),E.readdir(i.a.resolve(y,t),{withFileTypes:!0}).then((function(n){e.emit("LIST",{list:n.filter((function(e){return e.isDirectory()})).map((function(e){return e.name}))})})).catch((function(e){console.log("server reading local file failed",e)}))})),e.on("SEND",(function(n){var t=n.id,o=n.projName,r=n.sheetName,c=n.type,a=n.position;console.log("SENDING ".concat(o,"-").concat(r).concat(c?"-".concat(c):""," FROM@ ").concat(a));var u=A(o,r,c),s="".concat(t,"-").concat(u);void 0===g[s]&&(g[s]=new d.a(i.a.resolve(y,t,o,u))),g[s].readChunk(a,(function(n){var t=n.part,i=n.percent,c=n.nextPos,a=n.buffer,u={LAST:"DONE",MOST:"RECV"}[t];console.log("SENDING ".concat(o,"-").concat(r," ENDS@ ").concat(c," ").concat(t," ").concat(u)),e.emit(u,{projName:o,sheetName:r,percent:i,position:c,data:a})}),(function(n){"ENOENT"===n.code&&("CONF"===c?(console.log("CONF not created yet."),e.emit("DONE",{projName:o,sheetName:r,data:Buffer.from("[]")})):e.emit("NOTFOUND",{sheetName:r,projName:o}))}))})),e.on("SAVE",(function(e){var n,t=e.id,o=e.projName,r=e.sheetName,c=e.type,a=e.data;switch(v(a)){case"string":console.log("received data as string"),n=Buffer.from(a);break;case"object":console.log("received data as object, whoa"),n=Buffer.from(JSON.stringify(a))}console.log(y,t,o,u);var u=A(o,"saved".concat(r),c),s=i.a.resolve(y,t,o,u);E.writeFile(s,n)})),e.on("EXPORT",(function(n){n.id;var t=n.projName,o=n.sheetName,r=n.data,i=m.a.utils.book_new();if(Array.isArray(r)){var c=m.a.utils.json_to_sheet(r);i.SheetNames.push("sheet1"),i.Sheets.sheet1=c}else for(var a in console.log(r),r){var u=m.a.utils.json_to_sheet(r[a]);i.SheetNames.push(a),i.Sheets[a]=u}var s=function(e){for(var n=new ArrayBuffer(e.length),t=new Uint8Array(n),o=0;o<e.length;o++)t[o]=255&e.charCodeAt(o);return n}(m.a.write(i,{bookType:"xlsx",type:"binary"}));e.emit("EXPORTED",{outputArrayBuffed:s,projName:t,sheetName:o})})),e.on("RESTORE",(function(n){var t=n.projName;n.path;Object(h.a)(t).then((function(n){e.emit("FILEPREPARED",{})})).catch((function(e){console.log("error during restoring xls files",e)}))}))})),T.on("connection",(function(e){e.on("LOGIN",(function(n){var t=n.username,o=n.password;console.log(t,o,"recved"),S.findOne({username:t,password:o},(function(n,t){if(null!==t){console.log(t,"account found");var o=t.username,r=t.nickname,i=t._id;e.emit("LOG_DONE",{username:o,nickname:r,id:i})}else e.emit("LOG_NOT_FOUND")}))})),e.on("REGISTER",(function(n){var t=n.username,o=n.password,r=n.nickname;S.insert({username:t,password:o,nickname:r},(function(n,t){if(n)"uniqueViolated"===n.errorType?e.emit("REG_DUP_NAME"):e.emit("ERROR",JSON.stringify(n));else{console.log(t,"reged");var o=t._id;E.mkdir(i.a.resolve(y,o)).then((function(){e.emit("REG_DONE",{id:t._id})})).catch((function(n){e.emit("ERROR",JSON.stringify(n))}))}}))}))}))}.call(this,"server-src")},function(e,n){e.exports=require("nedb")},function(e,n,t){"use strict";t(7);t(1).promises},function(e,n){e.exports=require("socket.io")}]);
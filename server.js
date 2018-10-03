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
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/server/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./config sync recursive ^\\.\\/.*\\.json$":
/*!************************************!*\
  !*** ./config sync ^\.\/.*\.json$ ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var map = {\n\t\"./development.json\": \"./config/development.json\",\n\t\"./production.json\": \"./config/production.json\",\n\t\"./test.json\": \"./config/test.json\"\n};\n\n\nfunction webpackContext(req) {\n\tvar id = webpackContextResolve(req);\n\treturn __webpack_require__(id);\n}\nfunction webpackContextResolve(req) {\n\tvar id = map[req];\n\tif(!(id + 1)) { // check for number or string\n\t\tvar e = new Error(\"Cannot find module '\" + req + \"'\");\n\t\te.code = 'MODULE_NOT_FOUND';\n\t\tthrow e;\n\t}\n\treturn id;\n}\nwebpackContext.keys = function webpackContextKeys() {\n\treturn Object.keys(map);\n};\nwebpackContext.resolve = webpackContextResolve;\nmodule.exports = webpackContext;\nwebpackContext.id = \"./config sync recursive ^\\\\.\\\\/.*\\\\.json$\";\n\n//# sourceURL=webpack:///./config_sync_^\\.\\/.*\\.json$?");

/***/ }),

/***/ "./config/development.json":
/*!*********************************!*\
  !*** ./config/development.json ***!
  \*********************************/
/*! exports provided: db, mailgun, default */
/***/ (function(module) {

eval("module.exports = {\"db\":{\"host\":\"127.0.0.1\",\"user\":\"root\",\"password\":\"password\",\"database\":\"thefifthworld\",\"insecureAuth\":true},\"mailgun\":{\"key\":\"key-f1c8bcb853bb542fca3c4ad7f0cc0078\",\"domain\":\"thefifthworld.com\",\"from\":\"The Fifth World <web@thefifthworld.com>\"}};\n\n//# sourceURL=webpack:///./config/development.json?");

/***/ }),

/***/ "./config/index.js":
/*!*************************!*\
  !*** ./config/index.js ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nvar env = \"development\" || 'development';\nvar config = __webpack_require__(\"./config sync recursive ^\\\\.\\\\/.*\\\\.json$\")('./' + env + '.json');\n\nexports.default = config;\n\n//# sourceURL=webpack:///./config/index.js?");

/***/ }),

/***/ "./config/production.json":
/*!********************************!*\
  !*** ./config/production.json ***!
  \********************************/
/*! exports provided: db, mailgun, default */
/***/ (function(module) {

eval("module.exports = {\"db\":{\"host\":\"127.0.0.1\",\"user\":\"root\",\"password\":\"password\",\"database\":\"thefifthworld\",\"insecureAuth\":true},\"mailgun\":{\"key\":\"key-f1c8bcb853bb542fca3c4ad7f0cc0078\",\"domain\":\"thefifthworld.com\",\"from\":\"The Fifth World <web@thefifthworld.com>\"}};\n\n//# sourceURL=webpack:///./config/production.json?");

/***/ }),

/***/ "./config/test.json":
/*!**************************!*\
  !*** ./config/test.json ***!
  \**************************/
/*! exports provided: db, mailgun, default */
/***/ (function(module) {

eval("module.exports = {\"db\":{\"host\":\"127.0.0.1\",\"user\":\"root\",\"password\":\"password\",\"database\":\"thefifthworld\",\"insecureAuth\":true},\"mailgun\":{\"key\":\"key-f1c8bcb853bb542fca3c4ad7f0cc0078\",\"domain\":\"thefifthworld.com\",\"from\":\"The Fifth World <web@thefifthworld.com>\"}};\n\n//# sourceURL=webpack:///./config/test.json?");

/***/ }),

/***/ "./src/components/error-404/component.js":
/*!***********************************************!*\
  !*** ./src/components/error-404/component.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _react = __webpack_require__(/*! react */ \"react\");\n\nvar _react2 = _interopRequireDefault(_react);\n\nvar _propTypes = __webpack_require__(/*! prop-types */ \"prop-types\");\n\nvar _propTypes2 = _interopRequireDefault(_propTypes);\n\nvar _reactAutobind = __webpack_require__(/*! react-autobind */ \"react-autobind\");\n\nvar _reactAutobind2 = _interopRequireDefault(_reactAutobind);\n\nvar _reactRedux = __webpack_require__(/*! react-redux */ \"react-redux\");\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\n/**\n * This component handles a 404 error page.\n */\n\nvar Error404 = function (_React$Component) {\n  _inherits(Error404, _React$Component);\n\n  function Error404(props) {\n    _classCallCheck(this, Error404);\n\n    var _this = _possibleConstructorReturn(this, (Error404.__proto__ || Object.getPrototypeOf(Error404)).call(this, props));\n\n    (0, _reactAutobind2.default)(_this);\n    return _this;\n  }\n\n  /**\n   * The render function\n   * @returns {string} - The rendered output.\n   */\n\n  _createClass(Error404, [{\n    key: 'render',\n    value: function render() {\n      return _react2.default.createElement(\n        _react2.default.Fragment,\n        null,\n        _react2.default.createElement(\n          'h1',\n          null,\n          '404'\n        ),\n        _react2.default.createElement(\n          'p',\n          null,\n          'Sorry, ',\n          this.props.name,\n          ', could not find that page'\n        )\n      );\n    }\n  }]);\n\n  return Error404;\n}(_react2.default.Component);\n\n/**\n * Maps Redux state to the component's props.\n * @param state - The state from Redux.\n * @returns {Object} - The component's new props.\n */\n\nvar mapStateToProps = function mapStateToProps(state) {\n  return {\n    name: state.Home.name\n  };\n};\n\nError404.propTypes = {\n  name: _propTypes2.default.string\n};\n\nexports.default = (0, _reactRedux.connect)(mapStateToProps)(Error404);\n\n//# sourceURL=webpack:///./src/components/error-404/component.js?");

/***/ }),

/***/ "./src/components/home/component.js":
/*!******************************************!*\
  !*** ./src/components/home/component.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _react = __webpack_require__(/*! react */ \"react\");\n\nvar _react2 = _interopRequireDefault(_react);\n\nvar _propTypes = __webpack_require__(/*! prop-types */ \"prop-types\");\n\nvar _propTypes2 = _interopRequireDefault(_propTypes);\n\nvar _reactAutobind = __webpack_require__(/*! react-autobind */ \"react-autobind\");\n\nvar _reactAutobind2 = _interopRequireDefault(_reactAutobind);\n\nvar _reactRedux = __webpack_require__(/*! react-redux */ \"react-redux\");\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\n/**\n * This component handles the home page.\n */\n\nvar Home = function (_React$Component) {\n  _inherits(Home, _React$Component);\n\n  function Home(props) {\n    _classCallCheck(this, Home);\n\n    var _this = _possibleConstructorReturn(this, (Home.__proto__ || Object.getPrototypeOf(Home)).call(this, props));\n\n    (0, _reactAutobind2.default)(_this);\n    return _this;\n  }\n\n  /**\n   * The render function\n   * @returns {string} - The rendered output.\n   */\n\n  _createClass(Home, [{\n    key: 'render',\n    value: function render() {\n      return _react2.default.createElement(\n        _react2.default.Fragment,\n        null,\n        _react2.default.createElement(\n          'h1',\n          null,\n          'Home'\n        ),\n        _react2.default.createElement(\n          'p',\n          null,\n          'Hello, ',\n          this.props.name\n        )\n      );\n    }\n  }]);\n\n  return Home;\n}(_react2.default.Component);\n\n/**\n * Maps Redux state to the component's props.\n * @param state - The state from Redux.\n * @returns {Object} - The component's new props.\n */\n\nvar mapStateToProps = function mapStateToProps(state) {\n  return {\n    name: state.MemberLogin.name\n  };\n};\n\nHome.propTypes = {\n  loggedIn: _propTypes2.default.number\n};\n\nexports.default = (0, _reactRedux.connect)(mapStateToProps)(Home);\n\n//# sourceURL=webpack:///./src/components/home/component.js?");

/***/ }),

/***/ "./src/components/member-login/action-types.js":
/*!*****************************************************!*\
  !*** ./src/components/member-login/action-types.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nvar LOGIN = exports.LOGIN = 'member-login.LOGIN';\nvar LOGOUT = exports.LOGOUT = 'member-login.LOGOUT';\n\n//# sourceURL=webpack:///./src/components/member-login/action-types.js?");

/***/ }),

/***/ "./src/components/member-login/component.js":
/*!**************************************************!*\
  !*** ./src/components/member-login/component.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _react = __webpack_require__(/*! react */ \"react\");\n\nvar _react2 = _interopRequireDefault(_react);\n\nvar _propTypes = __webpack_require__(/*! prop-types */ \"prop-types\");\n\nvar _propTypes2 = _interopRequireDefault(_propTypes);\n\nvar _reactAutobind = __webpack_require__(/*! react-autobind */ \"react-autobind\");\n\nvar _reactAutobind2 = _interopRequireDefault(_reactAutobind);\n\nvar _reactRedux = __webpack_require__(/*! react-redux */ \"react-redux\");\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\n/**\n * This component handles the login form.\n */\n\nvar MemberLogin = function (_React$Component) {\n  _inherits(MemberLogin, _React$Component);\n\n  function MemberLogin(props) {\n    _classCallCheck(this, MemberLogin);\n\n    var _this = _possibleConstructorReturn(this, (MemberLogin.__proto__ || Object.getPrototypeOf(MemberLogin)).call(this, props));\n\n    (0, _reactAutobind2.default)(_this);\n    return _this;\n  }\n\n  /**\n   * The render function\n   * @returns {string} - The rendered output.\n   */\n\n  _createClass(MemberLogin, [{\n    key: 'render',\n    value: function render() {\n      return _react2.default.createElement(\n        _react2.default.Fragment,\n        null,\n        _react2.default.createElement(\n          'h1',\n          null,\n          'Login'\n        )\n      );\n    }\n  }]);\n\n  return MemberLogin;\n}(_react2.default.Component);\n\n/**\n * Maps Redux state to the component's props.\n * @param state - The state from Redux.\n * @returns {Object} - The component's new props.\n */\n\nvar mapStateToProps = function mapStateToProps(state) {\n  return {\n    loggedIn: state.MemberLogin.loggedIn\n  };\n};\n\nMemberLogin.propTypes = {\n  loggedIn: _propTypes2.default.number\n};\n\nexports.default = (0, _reactRedux.connect)(mapStateToProps)(MemberLogin);\n\n//# sourceURL=webpack:///./src/components/member-login/component.js?");

/***/ }),

/***/ "./src/components/member-login/reducers.js":
/*!*************************************************!*\
  !*** ./src/components/member-login/reducers.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = MemberLogin;\n\nvar _actionTypes = __webpack_require__(/*! ./action-types */ \"./src/components/member-login/action-types.js\");\n\nvar types = _interopRequireWildcard(_actionTypes);\n\nfunction _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }\n\nvar init = { loggedIn: null\n\n  /**\n   * The Redux reducer function for state data related to the member login.\n   * @param state {Object} - The previous state.\n   * @param action {Object} - The action object.\n   * @returns {Object} - The new state.\n   * @constructor\n   */\n\n};function MemberLogin() {\n  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : init;\n  var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};\n\n  switch (action.type) {\n    case types.LOGIN:\n      // User is being logged in\n      return { loggedIn: action.payload };\n    case types.LOGOUT:\n      // User is being logged out\n      return { loggedIn: null };\n    default:\n      return state;\n  }\n}\n\n//# sourceURL=webpack:///./src/components/member-login/reducers.js?");

/***/ }),

/***/ "./src/components/member-profile/action-types.js":
/*!*******************************************************!*\
  !*** ./src/components/member-profile/action-types.js ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nvar MEMBER_PROFILE_LOAD = exports.MEMBER_PROFILE_LOAD = 'member-profile.MEMBER_PROFILE_LOAD';\n\n//# sourceURL=webpack:///./src/components/member-profile/action-types.js?");

/***/ }),

/***/ "./src/components/member-profile/actions.js":
/*!**************************************************!*\
  !*** ./src/components/member-profile/actions.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.load = load;\n\nvar _actionTypes = __webpack_require__(/*! ./action-types */ \"./src/components/member-profile/action-types.js\");\n\nvar types = _interopRequireWildcard(_actionTypes);\n\nfunction _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }\n\nfunction load(member) {\n  return {\n    type: types.MEMBER_PROFILE_LOAD,\n    payload: member\n  };\n}\n\n//# sourceURL=webpack:///./src/components/member-profile/actions.js?");

/***/ }),

/***/ "./src/components/member-profile/component.js":
/*!****************************************************!*\
  !*** ./src/components/member-profile/component.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _react = __webpack_require__(/*! react */ \"react\");\n\nvar _react2 = _interopRequireDefault(_react);\n\nvar _propTypes = __webpack_require__(/*! prop-types */ \"prop-types\");\n\nvar _propTypes2 = _interopRequireDefault(_propTypes);\n\nvar _routeParser = __webpack_require__(/*! route-parser */ \"route-parser\");\n\nvar _routeParser2 = _interopRequireDefault(_routeParser);\n\nvar _reactAutobind = __webpack_require__(/*! react-autobind */ \"react-autobind\");\n\nvar _reactAutobind2 = _interopRequireDefault(_reactAutobind);\n\nvar _reactRedux = __webpack_require__(/*! react-redux */ \"react-redux\");\n\nvar _actions = __webpack_require__(/*! ./actions */ \"./src/components/member-profile/actions.js\");\n\nvar actions = _interopRequireWildcard(_actions);\n\nvar _member = __webpack_require__(/*! ../../server/models/member */ \"./src/server/models/member.js\");\n\nvar _member2 = _interopRequireDefault(_member);\n\nfunction _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\n/**\n * This component handles the member profile page.\n */\n\nvar MemberProfile = function (_React$Component) {\n  _inherits(MemberProfile, _React$Component);\n\n  function MemberProfile(props) {\n    _classCallCheck(this, MemberProfile);\n\n    var _this = _possibleConstructorReturn(this, (MemberProfile.__proto__ || Object.getPrototypeOf(MemberProfile)).call(this, props));\n\n    (0, _reactAutobind2.default)(_this);\n    return _this;\n  }\n\n  /**\n   * This is a static function used on the server to load data from the\n   * database through the Member model. If a record is found, then an action is\n   * dispatched that adds that record to the Redux state.\n   * @param route {Object} - The route object that matched the request.\n   * @param url {string} - The URL requested.\n   * @param db {Pool} - A database connection to query.\n   * @param dispatch {function} - The Redux store dispatch function.\n   * @returns {Promise} - A promise that will resolve (without any parameters)\n   *   when a Member record that matches the request is loaded from the\n   *   database and dispatched to the Redux store.\n   */\n\n  _createClass(MemberProfile, [{\n    key: 'render',\n\n\n    /**\n     * The render function\n     * @returns {string} - The rendered output.\n     */\n\n    value: function render() {\n      return _react2.default.createElement(\n        _react2.default.Fragment,\n        null,\n        _react2.default.createElement(\n          'h1',\n          null,\n          this.props.member.name\n        ),\n        _react2.default.createElement(\n          'p',\n          null,\n          this.props.member.email\n        )\n      );\n    }\n  }], [{\n    key: 'load',\n    value: function load(route, url, db, dispatch) {\n      return new Promise(function (resolve, reject) {\n        if (true) {\n          if (route && route.path && url) {\n            var routeParser = new _routeParser2.default(route.path);\n            var params = routeParser.match(url);\n            if (params.id) {\n              _member2.default.get(params.id, db).then(function (member) {\n                dispatch(actions.load(member));\n                resolve();\n              }).catch(function (err) {\n                console.error(err);\n                reject(err);\n              });\n            } else {\n              reject(new Error('No ID specified in parameters'));\n            }\n          } else {\n            reject(new Error('Could not find matching route'));\n          }\n        } else {}\n      });\n    }\n  }]);\n\n  return MemberProfile;\n}(_react2.default.Component);\n\n/**\n * Maps Redux state to the component's props.\n * @param state - The state from Redux.\n * @returns {Object} - The component's new props.\n */\n\nvar mapStateToProps = function mapStateToProps(state) {\n  return {\n    member: state.MemberProfile\n  };\n};\n\nMemberProfile.propTypes = {\n  match: _propTypes2.default.object,\n  member: _propTypes2.default.object\n};\n\nexports.default = (0, _reactRedux.connect)(mapStateToProps)(MemberProfile);\n\n//# sourceURL=webpack:///./src/components/member-profile/component.js?");

/***/ }),

/***/ "./src/components/member-profile/reducers.js":
/*!***************************************************!*\
  !*** ./src/components/member-profile/reducers.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = MemberProfile;\n\nvar _actionTypes = __webpack_require__(/*! ./action-types */ \"./src/components/member-profile/action-types.js\");\n\nvar types = _interopRequireWildcard(_actionTypes);\n\nfunction _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }\n\n/**\n * The Redux reducer function for state data related to the member profile.\n * @param state {Object} - The previous state.\n * @param action {Object} - The action object.\n * @returns {Object} - The new state.\n * @constructor\n */\n\nfunction MemberProfile() {\n  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};\n  var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};\n\n  switch (action.type) {\n    case types.MEMBER_PROFILE_LOAD:\n      // Called when the member profile is loaded from the database, which\n      // should really only happen on the server.\n      return action.payload;\n    default:\n      return state;\n  }\n}\n\n//# sourceURL=webpack:///./src/components/member-profile/reducers.js?");

/***/ }),

/***/ "./src/components/router/component.js":
/*!********************************************!*\
  !*** ./src/components/router/component.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _react = __webpack_require__(/*! react */ \"react\");\n\nvar _react2 = _interopRequireDefault(_react);\n\nvar _reactRouterDom = __webpack_require__(/*! react-router-dom */ \"react-router-dom\");\n\nvar _routes = __webpack_require__(/*! ../../shared/routes */ \"./src/shared/routes.js\");\n\nvar _routes2 = _interopRequireDefault(_routes);\n\nvar _component = __webpack_require__(/*! ../error-404/component */ \"./src/components/error-404/component.js\");\n\nvar _component2 = _interopRequireDefault(_component);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\nvar Router = function (_React$Component) {\n  _inherits(Router, _React$Component);\n\n  function Router() {\n    _classCallCheck(this, Router);\n\n    return _possibleConstructorReturn(this, (Router.__proto__ || Object.getPrototypeOf(Router)).apply(this, arguments));\n  }\n\n  _createClass(Router, [{\n    key: 'render',\n    value: function render() {\n      return _react2.default.createElement(\n        _reactRouterDom.Switch,\n        null,\n        _routes2.default.map(function (_ref) {\n          var path = _ref.path,\n              exact = _ref.exact,\n              component = _ref.component;\n          return _react2.default.createElement(_reactRouterDom.Route, {\n            key: path,\n            path: path,\n            exact: exact,\n            component: component });\n        }),\n        _react2.default.createElement(_reactRouterDom.Route, { component: _component2.default })\n      );\n    }\n  }]);\n\n  return Router;\n}(_react2.default.Component);\n\nexports.default = Router;\n\n//# sourceURL=webpack:///./src/components/router/component.js?");

/***/ }),

/***/ "./src/server/db.js":
/*!**************************!*\
  !*** ./src/server/db.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _mysql = __webpack_require__(/*! mysql */ \"mysql\");\n\nvar _mysql2 = _interopRequireDefault(_mysql);\n\nvar _index = __webpack_require__(/*! ../../config/index */ \"./config/index.js\");\n\nvar _index2 = _interopRequireDefault(_index);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar db = _mysql2.default.createPool(_index2.default.db);\n\n/**\n * We add a new method to the `Pool` class that allows us to query the database\n * with a Promise.\n * @param query {string} - A MySQL query to execute.\n * @returns {Promise} - A promise that resolves with the results of the query.\n */\n\ndb.q = function (query) {\n  return new Promise(function (resolve, reject) {\n    db.query(query, function (err, rows, fields) {\n      if (err) {\n        reject(err);\n      } else {\n        resolve(rows, fields);\n      }\n    });\n  });\n};\n\nexports.default = db;\n\n//# sourceURL=webpack:///./src/server/db.js?");

/***/ }),

/***/ "./src/server/index.js":
/*!*****************************!*\
  !*** ./src/server/index.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _express = __webpack_require__(/*! express */ \"express\");\n\nvar _express2 = _interopRequireDefault(_express);\n\nvar _cors = __webpack_require__(/*! cors */ \"cors\");\n\nvar _cors2 = _interopRequireDefault(_cors);\n\nvar _react = __webpack_require__(/*! react */ \"react\");\n\nvar _react2 = _interopRequireDefault(_react);\n\nvar _server = __webpack_require__(/*! react-dom/server */ \"react-dom/server\");\n\nvar _reactRouterDom = __webpack_require__(/*! react-router-dom */ \"react-router-dom\");\n\nvar _reactRedux = __webpack_require__(/*! react-redux */ \"react-redux\");\n\nvar _redux = __webpack_require__(/*! redux */ \"redux\");\n\nvar _reduxThunk = __webpack_require__(/*! redux-thunk */ \"redux-thunk\");\n\nvar _reduxThunk2 = _interopRequireDefault(_reduxThunk);\n\nvar _db = __webpack_require__(/*! ./db */ \"./src/server/db.js\");\n\nvar _db2 = _interopRequireDefault(_db);\n\nvar _reducers = __webpack_require__(/*! ../shared/reducers */ \"./src/shared/reducers.js\");\n\nvar _reducers2 = _interopRequireDefault(_reducers);\n\nvar _routes = __webpack_require__(/*! ../shared/routes */ \"./src/shared/routes.js\");\n\nvar _routes2 = _interopRequireDefault(_routes);\n\nvar _ssr = __webpack_require__(/*! ./ssr */ \"./src/server/ssr.js\");\n\nvar _ssr2 = _interopRequireDefault(_ssr);\n\nvar _component = __webpack_require__(/*! ../components/router/component */ \"./src/components/router/component.js\");\n\nvar _component2 = _interopRequireDefault(_component);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n// Initialize server\nvar server = (0, _express2.default)();\nserver.use((0, _cors2.default)());\nserver.use(_express2.default.static('public'));\n\n// Sends the response\nvar respond = function respond(req, res, store) {\n  var markup = (0, _server.renderToString)(_react2.default.createElement(\n    _reactRedux.Provider,\n    { store: store },\n    _react2.default.createElement(\n      _reactRouterDom.StaticRouter,\n      { location: req.url, context: {} },\n      _react2.default.createElement(_component2.default, null)\n    )\n  ));\n  res.send((0, _ssr2.default)(markup, {}, store));\n};\n\n// GET requests\nserver.get('*', function (req, res) {\n  var store = (0, _redux.createStore)(_reducers2.default, (0, _redux.applyMiddleware)(_reduxThunk2.default));\n  var route = _routes2.default.find(function (route) {\n    return (0, _reactRouterDom.matchPath)(req.url, route);\n  });\n  if (route && route.load) {\n    route.load(route, req.url, _db2.default, store.dispatch).then(function () {\n      respond(req, res, store);\n    }).catch(function (err) {\n      console.error(err);\n    });\n  } else {\n    respond(req, res, store);\n  }\n});\n\n// Start listening\nserver.listen(3000, function () {\n  console.log('Listening on port 3000...');\n});\n\n//# sourceURL=webpack:///./src/server/index.js?");

/***/ }),

/***/ "./src/server/models/member.js":
/*!*************************************!*\
  !*** ./src/server/models/member.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _v = __webpack_require__(/*! uuid/v4 */ \"uuid/v4\");\n\nvar _v2 = _interopRequireDefault(_v);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\n/**\n * This model handles dealing with member data in the database.\n */\n\nvar Member = function () {\n  function Member(obj) {\n    _classCallCheck(this, Member);\n\n    this.id = obj.id;\n    this.name = obj.name;\n    this.email = obj.email;\n    this.active = obj.active;\n    this.admin = obj.admin;\n  }\n\n  /**\n   * Returns a member with the matching ID.\n   * @param id {int} - The user's ID number.\n   * @param db {Pool} - A database connection.\n   * @returns {Promise} - A promise which will return an object with the\n   *   member's name, email, and ID.\n   */\n\n  _createClass(Member, [{\n    key: 'getId',\n\n\n    /**\n     * Returns the member's ID.\n     * @returns {int} - The member's ID.\n     */\n\n    value: function getId() {\n      return this.id;\n    }\n\n    /**\n     * Returns the member's name. It starts with the name field. If that is not\n     * set, it instead returns the email address. If neither of those are set, it\n     * returns the member's ID number (e.g., \"Member #42\").\n     * @returns {string} - The member's name.\n     */\n\n  }, {\n    key: 'getName',\n    value: function getName() {\n      if (this.name) {\n        return this.name;\n      } else if (this.email) {\n        return this.email;\n      } else {\n        return 'Member #' + this.id;\n      }\n    }\n\n    /**\n     * Sends a reminder email for an invitation.\n     * @param invited {Object} - An object including an `email` field (a string\n     *   that is the email address that the reminder should be sent to) and an\n     *   `inviteCode` field (a string that is the unique invitation code for that\n     *   person).\n     * @param emailer {function} - A function that can send an email.\n     * @returns {Promise} - A promise that resolves when the email has been sent.\n     */\n\n  }, {\n    key: 'sendReminder',\n    value: function sendReminder(invited, emailer) {\n      return emailer({\n        to: invited.email,\n        subject: 'Welcome to the Fifth World',\n        body: this.getName() + ' has invited you to join the Fifth World community. Click below to begin:\\n\\nhttps://thefifthworld.com/join/' + invited.inviteCode\n      });\n    }\n\n    /**\n     * Iterates over a set of rows and calls the `sendReminder` method for each.\n     * @param rows {Array.<Object>} - An array of objects, each one including an\n     *   `email` field (a string that is the email address that the reminder\n     *   should be sent to) and an `inviteCode` field (a string that is the\n     *   unique invitation code for that person).\n     * @param emailer {function} - A function that can send an email.\n     * @returns {Promise} - A promise that resolves when the promises for each of\n     *   the individual `sendReminder` method calls for each row have resolved.\n     */\n\n  }, {\n    key: 'sendReminders',\n    value: function sendReminders(rows, emailer) {\n      var _this = this;\n\n      var reminders = [];\n      rows.forEach(function (row) {\n        reminders.push(_this.sendReminder(row, emailer));\n      });\n      return Promise.all(reminders);\n    }\n\n    /**\n     * Creates a new member entry in the database, creates a new invitation entry\n     * for that member, and sends an invitation email to the new member so she\n     * can access her new account.\n     * @param email {string} - The new member's email address.\n     * @param db {Pool} - A database connection.\n     * @param emailer {function} - A function that can send an email.\n     * @returns {Promise} - A promise that resolves when the new member entry and\n     *   invitation entries have been created in the database and the invitation\n     *   email has been sent.\n     */\n\n  }, {\n    key: 'createInvite',\n    value: function createInvite(email, db, emailer) {\n      var _this2 = this;\n\n      var invite = {};\n      return new Promise(function (resolve, reject) {\n        db.q('INSERT INTO members (email) VALUES (\\'' + email + '\\')').then(function (res) {\n          invite.code = (0, _v2.default)();\n          return db.q('INSERT INTO invitations (inviteFrom, inviteTo, inviteCode) VALUES (\\'' + _this2.id + '\\', \\'' + res.insertId + '\\', \\'' + invite.code + '\\')');\n        }).then(function (res) {\n          if (res.affectedRows === 1) {\n            invite.email = email;\n            invite.inviteId = res.insertId;\n            return emailer({\n              to: email,\n              subject: 'Welcome to the Fifth World',\n              body: _this2.getName() + ' has invited you to join the Fifth World community. Click below to begin:\\n\\nhttps://thefifthworld.com/join/' + invite.code\n            });\n          } else {\n            var warning = res.affectedRows === 0 ? 'Invitation was not created in database' : res.affectedRows > 1 ? 'More than one row was created when inserting invitation!' : 'Negative rows affected when inserting invitation?';\n            reject(warning);\n          }\n        }).then(function () {\n          resolve(invite);\n        }).catch(function (err) {\n          reject(err);\n        });\n      });\n    }\n\n    /**\n     * If the email is already in the members table, the array of matching rows\n     * is passed to `sendReminders`. If no record is found with the given email\n     * address, it is passed to `createInvite`.\n     * @param email {string} - An email address to send an invitation to.\n     * @param db {Pool} - A database connection.\n     * @param emailer {function} - A function that can send an email.\n     * @returns {Promise} - A Promise that queries the MySQL members table for\n     *   any members with the given email address. If found, the matching rows\n     *   are passed to `sendReminders`. If no records are found, the email is\n     *   passed to `createInvite`.\n     */\n\n  }, {\n    key: 'invite',\n    value: function invite(email, db, emailer) {\n      var _this3 = this;\n\n      return new Promise(function (resolve, reject) {\n        db.q('SELECT m.id, m.email, i.inviteCode FROM members m, invitations i WHERE m.email=\\'' + email + '\\' AND i.inviteTo = m.id').then(function (rows) {\n          if (rows.length > 0) {\n            return _this3.sendReminders(rows, emailer);\n          } else {\n            return _this3.createInvite(email, db, emailer);\n          }\n        }).then(function (res) {\n          resolve(res);\n        }).catch(function (err) {\n          reject(err);\n        });\n      });\n    }\n  }], [{\n    key: 'get',\n    value: function get(id, db) {\n      return new Promise(function (resolve, reject) {\n        db.q('SELECT id, name, email FROM members WHERE id=\\'' + id + '\\'').then(function (rows) {\n          resolve(new Member(rows[0]));\n        }).catch(function (err) {\n          reject(err);\n        });\n      });\n    }\n  }]);\n\n  return Member;\n}();\n\nexports.default = Member;\n\n//# sourceURL=webpack:///./src/server/models/member.js?");

/***/ }),

/***/ "./src/server/ssr.js":
/*!***************************!*\
  !*** ./src/server/ssr.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _serializeJavascript = __webpack_require__(/*! serialize-javascript */ \"serialize-javascript\");\n\nvar _serializeJavascript2 = _interopRequireDefault(_serializeJavascript);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n/**\n * Renders the core `<head>` elements for each page.\n * @param title {string} - The content of the page's `<title>` tag.\n * @param desc {string} - A description for the page.\n * @returns {string} - The rendered markup for a section of the page's `<head>`\n */\n\nvar core = function core(title, desc) {\n  return '<title>' + title + '</title>\\n    <link rel=\"apple-touch-icon\" sizes=\"180x180\" href=\"https://s3.amazonaws.com/thefifthworld/website/apple-touch-icon.png\" />\\n    <link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"https://s3.amazonaws.com/thefifthworld/website/favicon-32x32.png\" />\\n    <link rel=\"icon\" type=\"image/png\" sizes=\"16x16\" href=\"https://s3.amazonaws.com/thefifthworld/website/favicon-16x16.png\" />\\n    <link rel=\"manifest\" href=\"https://s3.amazonaws.com/thefifthworld/website/manifest.json\" />\\n    <link rel=\"mask-icon\" href=\"https://s3.amazonaws.com/thefifthworld/website/safari-pinned-tab.svg\" color=\"#5bbad5\" />\\n    <meta name=\"theme-color\" content=\"#ffffff\" />\\n\\n    <link rel=\"stylesheet\" media=\"all\" href=\"/css/style.css\" />\\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\\n    <meta name=\"description\" content=\"' + desc + '\" />';\n};\n\n/**\n * Renders the Twitter card metadata tags for a page's `<head>` element.\n * @param meta {Object} - An object that can add optional Twitter card metadata\n *   tags besides the title, description, and image.\n * @param title {string} - The title of the page.\n * @param description {string} - A description of the page.\n * @param image {string} - The URL of an image to use for the Twitter card for\n *   this page.\n * @returns {string} - The rendered output for the page's Twitter card metadata\n *   tags.\n */\n\nvar twitter = function twitter(meta, title, description, image) {\n  var val = Object.assign({}, {\n    title: title,\n    description: description,\n    image: image,\n    card: 'summary_large_image',\n    site: '@thefifthworld'\n  }, meta);\n\n  return '    <!-- Twitter Card data -->\\n    <meta name=\"twitter:title\" content=\"' + val.title + '\" />\\n    <meta name=\"twitter:card\" content=\"' + val.card + '\" />\\n    <meta name=\"twitter:site\" content=\"' + val.site + '\" />\\n    <meta name=\"twitter:description\" content=\"' + val.description + '\" />\\n    <meta name=\"twitter:image\" content=\"' + val.image + '\" />';\n};\n\n/**\n * Renders the Open Graph metadata tags for a page's `<head>` element (used by\n * Facebook).\n * @param meta {Object} - An object that can add optional Open Graph metadata\n *   tags besides the title, description, and image.\n * @param title {string} - The title of the page.\n * @param description {string} - A description of the page.\n * @param image {string} - The URL of an image to use for Open Graph for this\n *   page.\n * @returns {string} - The rendered output for the page's Open Graph metadata\n *   tags.\n */\n\nvar og = function og(meta, title, description, image) {\n  var val = Object.assign({}, {\n    title: title,\n    description: description,\n    image: image,\n    siteName: 'The Fifth World',\n    type: 'website',\n    url: 'https://thefifthworld.com',\n    appId: 241682169673933\n  }, meta);\n\n  return '    <!-- Open Graph data -->\\n    <meta property=\"og:title\" content=\"' + val.title + '\" />\\n    <meta property=\"og:site_name\" content=\"' + val.siteName + '\" />\\n    <meta property=\"og:type\" content=\"' + val.type + '\" />\\n    <meta property=\"og:url\" content=\"' + val.url + '\" />\\n    <meta property=\"og:description\" content=\"' + val.description + '\" />\\n    <meta property=\"og:image\" content=\"' + val.image + '\" />\\n    <meta property=\"fb:app_id\" content=\"' + val.appId + '\" />';\n};\n\n/**\n * Renders any properties passed in the `meta` object that aren't expected\n * (`title`, `description`, `twitter`, and `og`) as separate meta tags.\n * @param meta {Object} - An object that may contain additional meta tag\n *   content.\n * @returns {string} - Rendered output of any additional meta tags.\n */\n\nvar other = function other(meta) {\n  var other = '';\n\n  if (meta) {\n    var expected = ['title', 'description', 'twitter', 'og'];\n    var custom = [];\n    Object.keys(meta).forEach(function (key) {\n      if (!expected.includes(key)) custom.push(key);\n    });\n\n    if (custom.length > 0) {\n      other = '    <!-- Other -->';\n      custom.forEach(function (key) {\n        other = other + ('\\n    <meta name=\"' + key + '\" content=\"' + meta[key] + '\" />');\n      });\n    }\n  }\n\n  return other;\n};\n\n/**\n * Returns rendered output of a page's `<head>` element.\n * @param meta {Object} - A collection of information to include in the\n *   `<head>` element.\n * @returns {string} - Rendered output for the page's `<head>` element.\n */\n\nvar head = function head(meta) {\n  var defaultDesc = 'In the Fifth World tabletop roleplaying game, you and a handful of friends explore what happens to your descendants living beyond civilization in the Fifth World amongst the familiar places of your own life transformed by four centuries of change.';\n  var title = meta ? meta.title ? meta.title : 'The Fifth World' : 'The Fifth World';\n  var desc = meta ? meta.description ? meta.description : defaultDesc : defaultDesc;\n  var img = 'https://s3.amazonaws.com/thefifthworld/website/images/social/default.jpg';\n  var metaTwitter = meta ? meta.twitter : {};\n  var metaOg = meta ? meta.og : {};\n\n  var sections = {\n    core: core(title, desc),\n    twitter: twitter(metaTwitter, title, desc, img),\n    og: og(metaOg, title, desc, img),\n    other: other(meta)\n  };\n\n  sections.arr = [sections.core, sections.twitter, sections.og];\n  if (sections.other.length > 0) sections.arr.push(sections.other);\n  return sections.arr.join('\\n\\n');\n};\n\n/**\n * Returns the markup for the page.\n * @param markup {string} - The rendered markup for the body of the page.\n * @param meta {Object} - An object that contains all of the information unique\n *   to this page that should be represented in its `<head>` element.\n * @param store {Object} - The Redux store to pass into the initial state.\n * @returns {string} - The markup for the page.\n */\n\nvar getMarkup = function getMarkup(markup, meta, store) {\n  var state = store.getState && typeof store.getState === 'function' ? store.getState() : store;\n  var init = (0, _serializeJavascript2.default)(state);\n  return '<!DOCTYPE html>\\n<html>\\n  <head>\\n    ' + head(meta) + '\\n  </head>\\n  <body>\\n    <main>' + markup + '</main>\\n    <script>window.__INITIAL_STATE__ = ' + init + '</script>\\n    <script src=\"/bundle.js\" defer=\"defer\"></script>\\n  </body>\\n</html>';\n};\n\nexports.default = getMarkup;\n\n//# sourceURL=webpack:///./src/server/ssr.js?");

/***/ }),

/***/ "./src/shared/reducers.js":
/*!********************************!*\
  !*** ./src/shared/reducers.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _redux = __webpack_require__(/*! redux */ \"redux\");\n\nvar _reducers = __webpack_require__(/*! ../components/member-login/reducers */ \"./src/components/member-login/reducers.js\");\n\nvar _reducers2 = _interopRequireDefault(_reducers);\n\nvar _reducers3 = __webpack_require__(/*! ../components/member-profile/reducers */ \"./src/components/member-profile/reducers.js\");\n\nvar _reducers4 = _interopRequireDefault(_reducers3);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar reducers = {\n  MemberLogin: _reducers2.default,\n  MemberProfile: _reducers4.default\n};\n\nexports.default = (0, _redux.combineReducers)(reducers);\n\n//# sourceURL=webpack:///./src/shared/reducers.js?");

/***/ }),

/***/ "./src/shared/routes.js":
/*!******************************!*\
  !*** ./src/shared/routes.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _component = __webpack_require__(/*! ../components/home/component */ \"./src/components/home/component.js\");\n\nvar _component2 = _interopRequireDefault(_component);\n\nvar _component3 = __webpack_require__(/*! ../components/member-login/component */ \"./src/components/member-login/component.js\");\n\nvar _component4 = _interopRequireDefault(_component3);\n\nvar _component5 = __webpack_require__(/*! ../components/member-profile/component */ \"./src/components/member-profile/component.js\");\n\nvar _component6 = _interopRequireDefault(_component5);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nvar routes = [{\n  path: '/',\n  exact: true,\n  component: _component2.default\n}, {\n  path: '/login',\n  exact: true,\n  component: _component4.default\n}, {\n  path: '/member/:id',\n  exact: true,\n  component: _component6.default\n}];\n\n/*\n * On the server, add a `load` property to each route that uses a component\n * that has a static `load` function. This lets us auto-load these methods so\n * that they can be executed just because they exist, without having to add\n * them explicitly to each route individually.\n */\n\n/* global __isClient__ */\n\nif (true) {\n  routes.forEach(function (route) {\n    if (route.component && route.component.load && typeof route.component.load === 'function') {\n      route.load = route.component.load;\n    }\n  });\n}\n\nexports.default = routes;\n\n//# sourceURL=webpack:///./src/shared/routes.js?");

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

/***/ "mysql":
/*!************************!*\
  !*** external "mysql" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"mysql\");\n\n//# sourceURL=webpack:///external_%22mysql%22?");

/***/ }),

/***/ "prop-types":
/*!*****************************!*\
  !*** external "prop-types" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"prop-types\");\n\n//# sourceURL=webpack:///external_%22prop-types%22?");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react\");\n\n//# sourceURL=webpack:///external_%22react%22?");

/***/ }),

/***/ "react-autobind":
/*!*********************************!*\
  !*** external "react-autobind" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react-autobind\");\n\n//# sourceURL=webpack:///external_%22react-autobind%22?");

/***/ }),

/***/ "react-dom/server":
/*!***********************************!*\
  !*** external "react-dom/server" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react-dom/server\");\n\n//# sourceURL=webpack:///external_%22react-dom/server%22?");

/***/ }),

/***/ "react-redux":
/*!******************************!*\
  !*** external "react-redux" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react-redux\");\n\n//# sourceURL=webpack:///external_%22react-redux%22?");

/***/ }),

/***/ "react-router-dom":
/*!***********************************!*\
  !*** external "react-router-dom" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"react-router-dom\");\n\n//# sourceURL=webpack:///external_%22react-router-dom%22?");

/***/ }),

/***/ "redux":
/*!************************!*\
  !*** external "redux" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"redux\");\n\n//# sourceURL=webpack:///external_%22redux%22?");

/***/ }),

/***/ "redux-thunk":
/*!******************************!*\
  !*** external "redux-thunk" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"redux-thunk\");\n\n//# sourceURL=webpack:///external_%22redux-thunk%22?");

/***/ }),

/***/ "route-parser":
/*!*******************************!*\
  !*** external "route-parser" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"route-parser\");\n\n//# sourceURL=webpack:///external_%22route-parser%22?");

/***/ }),

/***/ "serialize-javascript":
/*!***************************************!*\
  !*** external "serialize-javascript" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"serialize-javascript\");\n\n//# sourceURL=webpack:///external_%22serialize-javascript%22?");

/***/ }),

/***/ "uuid/v4":
/*!**************************!*\
  !*** external "uuid/v4" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"uuid/v4\");\n\n//# sourceURL=webpack:///external_%22uuid/v4%22?");

/***/ })

/******/ });
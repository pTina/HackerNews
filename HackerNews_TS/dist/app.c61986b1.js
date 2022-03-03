// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"app.ts":[function(require,module,exports) {
"use strict"; // 2022-03-02
// 라우터가 실질적으로 동작하는 코드 작성

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

var __values = this && this.__values || function (o) {
  var s = typeof Symbol === "function" && Symbol.iterator,
      m = s && o[s],
      i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function next() {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};

var NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
var CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
var store = {
  currentPage: 1,
  feeds: []
};

var Api =
/** @class */
function () {
  function Api(url) {
    this.ajax = new XMLHttpRequest();
    this.url = url;
  }

  Api.prototype.getRequest = function () {
    this.ajax.open('GET', this.url, false);
    this.ajax.send();
    return JSON.parse(this.ajax.response);
  };

  return Api;
}();

var NewsFeedApi =
/** @class */
function (_super) {
  __extends(NewsFeedApi, _super);

  function NewsFeedApi() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  NewsFeedApi.prototype.getData = function () {
    return this.getRequest();
  };

  return NewsFeedApi;
}(Api);

var NewsDetailApi =
/** @class */
function (_super) {
  __extends(NewsDetailApi, _super);

  function NewsDetailApi() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  NewsDetailApi.prototype.getData = function () {
    return this.getRequest();
  };

  return NewsDetailApi;
}(Api); // 추상 메소드를 가지는 클래스는 
// 클래스 자체가 abstract 키워드를 가지고 있어야 한다.


var View =
/** @class */
function () {
  function View(containerId, template) {
    var containerElement = document.getElementById(containerId);

    if (!containerElement) {
      throw '최상위 컨테이터너가 없어 UI를 진행하지 못합니다.';
    }

    this.template = template;
    this.renderTemplate = template;
    this.container = containerElement;
    this.htmlList = [];
  } // 외부에서 접근하지 않고 자식요소에서만 접근이 가능한 것


  View.prototype.updateView = function () {
    this.container.innerHTML = this.renderTemplate;
    this.renderTemplate = this.template;
  };

  View.prototype.addHtml = function (htmlString) {
    this.htmlList.push(htmlString);
  };

  View.prototype.getHtml = function () {
    var snapshot = this.htmlList.join('');
    this.clearHtmlList();
    return snapshot;
  };

  View.prototype.setTemplateData = function (key, value) {
    this.renderTemplate = this.renderTemplate.replace("{{__".concat(key, "__}}"), value);
  };

  View.prototype.clearHtmlList = function () {
    this.htmlList = [];
  };

  return View;
}();

var Router =
/** @class */
function () {
  function Router() {
    // window.addEventListener('hashchange', this.route);
    // route 메소드는 브라우저의 이벤트 시스템이 호출시킴
    // 호출이 됐을 때 this 컨텍스트는 Router의 인스턴스가 아니게 된다.
    // 넘겨줄 때 this를 고정 시켜주어야 한다.
    // 현재 등록 시점의 this context
    window.addEventListener('hashchange', this.route.bind(this));
    this.routeTable = [];
    this.defaultRoute = null;
  }

  Router.prototype.setDefaultPage = function (page) {
    this.defaultRoute = {
      path: '',
      page: page
    };
  };

  Router.prototype.addRoutePath = function (path, page) {
    this.routeTable.push({
      path: path,
      page: page
    });
  }; // 라우터가 실질적으로 동작하는 코드 
  // hash를 가져옴
  // 디폴트 페이지 체크


  Router.prototype.route = function () {
    var e_1, _a;

    var routePath = location.hash;

    if (routePath === '' && this.defaultRoute) {
      // 현재 모든 뷰 페이지 클래스는
      // View 클래스를 상속 받음
      // UI를 업데이트하는 메소드 -> render 라는 동일한 이름을 가지고 있음
      // 라우터가 View 클래스마다 어떤 메소드가 UI를 업데이트 하는지 알 수 없기 때문에
      // 여태껏 해왔던 약속이 필요한 것이다.
      this.defaultRoute.page.render();
    }

    try {
      // routePath에 빈 값이 아닌 다른 값이 들어있으면?
      // routeTable에 들어있는 값들 중에 어떤 값이 맞는지 확인해 가면서
      // 맞으면 해당 페이지에 render()함수를 호출해주면 될 것이다.
      // 기존 for문에 비해 for of의 장점
      // index를 컨트롤하는 0 부터 시작해서 n보다 작은 동안 등의
      // 코드를 작성하지 않아도 되므로 깔끔함
      for (var _b = __values(this.routeTable), _c = _b.next(); !_c.done; _c = _b.next()) {
        var routeInfo = _c.value; // 해당 routeInfo.path가 routePath에 있다면

        if (routePath.indexOf(routeInfo.path) >= 0) {
          // 해당 페이지에 render() 함수 호출
          routeInfo.page.render(); // 다른 라우팅은 볼 필요가 없으므로 빠져나감

          break;
        }
      }
    } catch (e_1_1) {
      e_1 = {
        error: e_1_1
      };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  };

  return Router;
}();

var NewsFeedView =
/** @class */
function (_super) {
  __extends(NewsFeedView, _super);

  function NewsFeedView(containerId) {
    var _this = this;

    var template = "\n            <div class=\"continer m-auto p-10\">\n                <h1 class=\"mb-10\">Hacker News</h1>\n                <ul>\n                    {{__news_feed__}}\n                </ul>\n    \n                <div class=\"absolute top-[35px] right-[90px]\">\n                    <a href=\"#/page/{{__prev__page__}}\" class=\"mr-10\"><i class=\"fa-solid fa-angle-left text-[50px]\"></i></a>\n                    <a href=\"#/page/{{__next__page__}}\"><i class=\"fa-solid fa-angle-right text-[50px]\"></i></a>\n                </div>\n            </div>\n        ";
    _this = _super.call(this, containerId, template) || this;
    _this.api = new NewsFeedApi(NEWS_URL);
    _this.feeds = store.feeds;

    if (_this.feeds.length === 0) {
      _this.feeds = store.feeds = _this.api.getData();

      _this.makeFeed();
    }

    _this.lastPage = Math.round(_this.feeds.length / 10);
    return _this;
  }

  NewsFeedView.prototype.render = function () {
    // 커런트 페이지를 가져오는 코드 추가
    // 디폴트인 경우 store.currentPage는 없을 것이다.
    // 디폴트로 들어와도 뉴스피드는 보여야 하니깐
    // 없을 땐 1로 넣어라고 지정
    store.currentPage = Number(location.hash.substr(7) || 1);

    for (var i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
      var _a = this.feeds[i],
          id = _a.id,
          title = _a.title,
          user = _a.user,
          points = _a.points,
          comments_count = _a.comments_count,
          read = _a.read;
      this.addHtml("\n                <li class = \"".concat(read ? 'text-pink-700' : 'text-black', " bg-[#533CA6] p-10 mb-10 rounded-xl text-white flex justify-between\">\n                    <p>\n                        <a href=\"#/show/").concat(id, "\" class=\"block\">\n                            ").concat(title, "\n                        </a>\n                        <span class=\"mr-5\"><i class=\"fa-solid fa-user mr-2\"></i>").concat(user, "</span>\n                        <span><i class=\"fa-solid fa-heart mr-2\"></i>").concat(points, "</span>\n                    </p>\n                    <p class=\"flex items-center\">\n                        <i class=\"fa-solid fa-comments mr-2\"></i>\n                        <a href=\"#/show/").concat(id, "\">\n                            ").concat(comments_count, "\n                        </a>\n                    </p>\n                </li>\n            "));
    }

    this.setTemplateData('news_feed', this.getHtml());
    this.setTemplateData('prev__page', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
    this.setTemplateData('next__page', String(store.currentPage < this.lastPage ? store.currentPage + 1 : this.lastPage));
    this.updateView();
  };

  NewsFeedView.prototype.makeFeed = function () {
    for (var i = 0; i < this.feeds.length; i++) {
      this.feeds[i].read = false;
    }
  };

  return NewsFeedView;
}(View);

var NewsDetailView =
/** @class */
function (_super) {
  __extends(NewsDetailView, _super);

  function NewsDetailView(containerId) {
    var _this = this;

    var template = "\n            <div class=\"continer m-auto p-10\">\n                <div class=\"flex justify-between\">\n                    <h1 class=\"mb-10\">Hacker News</h1>\n                    <span><a href=\"#/page/{{__currentPage__}}\"><i class=\"fa-solid fa-xmark\"></i></a></span>\n                </div>\n                \n                <div class=\"bg-[#533CA6] rounded-xl text-white p-10\">\n                    <h1>{{__title__}}</h1>\n                    <div>{{__content__}}</div>\n                    <div>{{__comments__}}</div>\n                </div>\n            </div>\n        ";
    _this = _super.call(this, containerId, template) || this;
    return _this;
  }

  NewsDetailView.prototype.render = function () {
    var id = location.hash.substr(7);
    var api = new NewsDetailApi(CONTENT_URL.replace('@id', id));
    var newsDetail = api.getData();

    for (var i = 0; i < store.feeds.length; i++) {
      if (store.feeds[i].id === Number(id)) {
        store.feeds[i].read = true;
        break;
      }
    }

    this.setTemplateData('content', this.makeContent(newsDetail));
    this.setTemplateData('comments', this.makeComment(newsDetail.comments));
    this.setTemplateData('currentPage', String(store.currentPage));
    this.setTemplateData('title', newsDetail.title);
    this.updateView();
  };

  NewsDetailView.prototype.makeContent = function (newsDedtail) {
    if (newsDedtail.content) {
      return newsDedtail.content;
    } else {
      return "<a href=\"".concat(newsDedtail.url, "\" target=\"_black\">link click</a>");
    }
  };

  NewsDetailView.prototype.makeComment = function (comments, called) {
    if (called === void 0) {
      called = 0;
    }

    for (var i = 0; i < comments.length; i++) {
      this.addHtml("\n                <div class=\"ml-".concat(10 * called, "\">\n                    <div class=\"bg-[#fff] text-[#000]\">\n                        <i class=\"fa-solid fa-caret-down\"></i>\n                        <span class=\"mr-2\">").concat(comments[i].user, "</span>\n                        <span><i class=\"fa-solid fa-clock-rotate-left mr-2\"></i>").concat(comments[i].time_ago, "</span>\n                    </div>\n                    <div class=\"ml-10\">").concat(comments[i].content, "</div>\n                </div>\n            "));

      if (comments[i].comments.length > 0) {
        this.addHtml(this.makeComment(comments[i].comments, called + 1));
      }
    }

    return this.getHtml();
  };

  return NewsDetailView;
}(View);

var router = new Router();
var newFeedView = new NewsFeedView('root');
var newsDetailView = new NewsDetailView('root');
router.setDefaultPage(newFeedView);
router.addRoutePath('/page/', newFeedView);
router.addRoutePath('/show/', newsDetailView);
router.route();
},{}],"../../../../../.npm-globaal/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "54766" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../.npm-globaal/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","app.ts"], null)
//# sourceMappingURL=/app.c61986b1.js.map
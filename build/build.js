;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("yields-xhr/index.js", function(exports, require, module){

/**
 * XMLHttpRequest / ActiveXObject
 *
 * example:
 *
 *        var req = xhr();
 *
 * @return {Object}
 */

module.exports = function(){
  if (window.XMLHttpRequest) return new XMLHttpRequest();
  try{ return new ActiveXObject('msxml2.xmlhttp.6.0'); } catch(e){}
  try{ return new ActiveXObject('msxml2.xmlhttp.3.0'); } catch(e){}
  try{ return new ActiveXObject('msxml2.xmlhttp'); } catch(e){}
};

});
require.register("CamShaft-ws/index.js", function(exports, require, module){
/**
 * WebSocket / MozWebSocket
 *
 * example:
 *
 *        var req = ws();
 *
 * @return {Object}
 */

module.exports = function (host) {
  if (window.MozWebSocket) return new MozWebSocket(host);
  if (window.WebSocket) return new WebSocket(host);
};

});
require.register("component-pad/index.js", function(exports, require, module){

/**
 * Expose `pad()`.
 */

exports = module.exports = pad;

/**
 * Pad `str` to `len` with optional `c` char,
 * favoring the left when unbalanced.
 *
 * @param {String} str
 * @param {Number} len
 * @param {String} c
 * @return {String}
 * @api public
 */

function pad(str, len, c) {
  c = c || ' ';
  if (str.length >= len) return str;
  len = len - str.length;
  var left = Array(Math.ceil(len / 2) + 1).join(c);
  var right = Array(Math.floor(len / 2) + 1).join(c);
  return left + str + right;
}

/**
 * Pad `str` left to `len` with optional `c` char.
 *
 * @param {String} str
 * @param {Number} len
 * @param {String} c
 * @return {String}
 * @api public
 */

exports.left = function(str, len, c){
  c = c || ' ';
  if (str.length >= len) return str;
  return Array(len - str.length + 1).join(c) + str;
};

/**
 * Pad `str` right to `len` with optional `c` char.
 *
 * @param {String} str
 * @param {Number} len
 * @param {String} c
 * @return {String}
 * @api public
 */

exports.right = function(str, len, c){
  c = c || ' ';
  if (str.length >= len) return str;
  return str + Array(len - str.length + 1).join(c);
};
});
require.register("CamShaft-syslog.js/index.js", function(exports, require, module){
/**
 * Module dependencies
 */

var defaults = require('defaults');
var pad = require('pad');

// Default config
var config = {
  facility: 14,
  severity: 6,
  version: 1,
  hostname: 'nohost',
  app_name: 'browser',
  proc_id: 'web'
};

function toISOString(date) {
  return date.getUTCFullYear()
    + '-' + pad(date.getUTCMonth() + 1 + '', 2, '0')
    + '-' + pad(date.getUTCDate() + 1 + '', 2, '0')
    + 'T' + pad(date.getUTCHours() + 1 + '', 2, '0')
    + ':' + pad(date.getUTCMinutes() + 1 + '', 2, '0')
    + ':' + pad(date.getUTCSeconds() + 1 + '', 2, '0')
    + '.' + String((date.getUTCMilliseconds()/1000).toFixed(3)).slice(2, 5)
    + 'Z';
};

module.exports = exports = function(opts) {
  if(!opts) opts = {};

  defaults(opts, config);

  var prefix = ['<', (opts.priority || opts.facility * 8 + opts.severity), '>', opts.version].join('')
    , system = [opts.hostname, opts.app_name, opts.proc_id, '- -'].join(' ');

  return function() {
    var message = Array.prototype.join.call(arguments, ' ');
    var msg = [prefix, toISOString(new Date), system, message].join(' ');
    return [msg.length, msg].join(' ');
  };
};

});
require.register("matthewmueller-debounce/index.js", function(exports, require, module){
/**
 * Debounces a function by the given threshold.
 *
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`true`)
 * @api public
 */

module.exports = function debounce(func, threshold, execAsap){
  var timeout;
  if (false !== execAsap) execAsap = true;

  return function debounced(){
    var obj = this, args = arguments;

    function delayed () {
      if (!execAsap) {
        func.apply(obj, args);
      }
      timeout = null;
    }

    if (timeout) {
      clearTimeout(timeout);
    } else if (execAsap) {
      func.apply(obj, args);
    }

    timeout = setTimeout(delayed, threshold || 100);
  };
};

});
require.register("avetisk-defaults/index.js", function(exports, require, module){
'use strict';

/**
 * Merge default values.
 *
 * @param {Object} dest
 * @param {Object} defaults
 * @return {Object}
 * @api public
 */
var defaults = function (dest, src, recursive) {
  for (var prop in src) {
    if (recursive && dest[prop] instanceof Object && src[prop] instanceof Object) {
      dest[prop] = defaults(dest[prop], src[prop], true);
    } else if (! (prop in dest)) {
      dest[prop] = src[prop];
    }
  }

  return dest;
};

/**
 * Expose `defaults`.
 */
module.exports = defaults;

});
require.register("component-user-agent-parser/src/ua-parser.js", function(exports, require, module){
// UAParser.js v0.6.0
// Lightweight JavaScript-based User-Agent string parser
// https://github.com/faisalman/ua-parser-js
//
// Copyright © 2012-2013 Faisalman <fyzlman@gmail.com>
// Dual licensed under GPLv2 & MIT

(function (window, undefined) {

    'use strict';

    //////////////
    // Constants
    /////////////


    var EMPTY       = '',
        UNKNOWN     = '?',
        FUNC_TYPE   = 'function',
        UNDEF_TYPE  = 'undefined',
        OBJ_TYPE    = 'object',
        MAJOR       = 'major',
        MODEL       = 'model',
        NAME        = 'name',
        TYPE        = 'type',
        VENDOR      = 'vendor',
        VERSION     = 'version',
        ARCHITECTURE= 'architecture',
        CONSOLE     = 'console',
        MOBILE      = 'mobile',
        TABLET      = 'tablet';


    ///////////
    // Helper
    //////////


    var util = {
        has : function (str1, str2) {
            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
        },
        lowerize : function (str) {
            return str.toLowerCase();
        }
    };


    ///////////////
    // Map helper
    //////////////


    var mapper = {

        rgx : function () {

            // loop through all regexes maps
            for (var result, i = 0, j, k, p, q, matches, match, args = arguments; i < args.length; i += 2) {

                var regex = args[i],       // even sequence (0,2,4,..)
                    props = args[i + 1];   // odd sequence (1,3,5,..)

                // construct object barebones
                if (typeof(result) === UNDEF_TYPE) {
                    result = {};
                    for (p in props) {
                        q = props[p];
                        if (typeof(q) === OBJ_TYPE) {
                            result[q[0]] = undefined;
                        } else {
                            result[q] = undefined;
                        }
                    }
                }

                // try matching uastring with regexes
                for (j = k = 0; j < regex.length; j++) {
                    matches = regex[j].exec(this.getUA());
                    if (!!matches) {
                        for (p in props) {
                            match = matches[++k];
                            q = props[p];
                            // check if given property is actually array
                            if (typeof(q) === OBJ_TYPE && q.length > 0) {
                                if (q.length == 2) {
                                    if (typeof(q[1]) == FUNC_TYPE) {
                                        // assign modified match
                                        result[q[0]] = q[1].call(this, match);
                                    } else {
                                        // assign given value, ignore regex match
                                        result[q[0]] = q[1];
                                    }
                                } else if (q.length == 3) {
                                    // check whether function or regex
                                    if (typeof(q[1]) === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                        // call function (usually string mapper)
                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                    } else {
                                        // sanitize match using given regex
                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                    }
                                } else if (q.length == 4) {
                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                }
                            } else {
                                result[q] = match ? match : undefined;
                            }
                        }
                        break;
                    }
                }

                if(!!matches) break; // break the loop immediately if match found
            }
            return result;
        },

        str : function (str, map) {

            for (var i in map) {
                // check if array
                if (typeof(map[i]) === OBJ_TYPE && map[i].length > 0) {
                    for (var j in map[i]) {
                        if (util.has(map[i][j], str)) {
                            return (i === UNKNOWN) ? undefined : i;
                        }
                    }
                } else if (util.has(map[i], str)) {
                    return (i === UNKNOWN) ? undefined : i;
                }
            }
            return str;
        }
    };


    ///////////////
    // String map
    //////////////


    var maps = {

        browser : {
            oldsafari : {
                major : {
                    '1' : ['/8', '/1', '/3'],
                    '2' : '/4',
                    '?' : '/'
                },
                version : {
                    '1.0'   : '/8',
                    '1.2'   : '/1',
                    '1.3'   : '/3',
                    '2.0'   : '/412',
                    '2.0.2' : '/416',
                    '2.0.3' : '/417',
                    '2.0.4' : '/419',
                    '?'     : '/'
                }
            }
        },

        device : {
            sprint : {
                model : {
                    'Evo Shift 4G' : '7373KT'
                },
                vendor : {
                    'HTC'       : 'APA',
                    'Sprint'    : 'Sprint'
                }
            }
        },

        os : {
            windows : {
                version : {
                    'ME'        : '4.90',
                    'NT 3.11'   : 'NT3.51',
                    'NT 4.0'    : 'NT4.0',
                    '2000'      : 'NT 5.0',
                    'XP'        : ['NT 5.1', 'NT 5.2'],
                    'Vista'     : 'NT 6.0',
                    '7'         : 'NT 6.1',
                    '8'         : 'NT 6.2',
                    'RT'        : 'ARM'
                }
            }
        }
    };


    //////////////
    // Regex map
    /////////////


    var regexes = {

        browser : [[

            // Presto based
            /(opera\smini)\/((\d+)?[\w\.-]+)/i,                                 // Opera Mini
            /(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,                // Opera Mobi/Tablet
            /(opera).+version\/((\d+)?[\w\.]+)/i,                               // Opera > 9.80
            /(opera)[\/\s]+((\d+)?[\w\.]+)/i                                    // Opera < 9.80

            ], [NAME, VERSION, MAJOR], [

            /\s(opr)\/((\d+)?[\w\.]+)/i                                         // Opera Webkit
            ], [[NAME, 'Opera'], VERSION, MAJOR], [

            // Mixed
            /(kindle)\/((\d+)?[\w\.]+)/i,                                       // Kindle
            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,
                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

            // Trident based
            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,
                                                                                // Avant/IEMobile/SlimBrowser/Baidu
            /(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,                                  // Internet Explorer

            // Webkit/KHTML based
            /(rekonq)((?:\/)[\w\.]+)*/i,                                        // Rekonq
            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt)\/((\d+)?[\w\.-]+)/i
                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt
            ], [NAME, VERSION, MAJOR], [

            /(yabrowser)\/((\d+)?[\w\.]+)/i                                     // Yandex
            ], [[NAME, 'Yandex'], VERSION, MAJOR], [

            /(comodo_dragon)\/((\d+)?[\w\.]+)/i                                 // Comodo Dragon
            ], [[NAME, /_/g, ' '], VERSION, MAJOR], [

            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i
                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
            ], [NAME, VERSION, MAJOR], [

            /(dolfin)\/((\d+)?[\w\.]+)/i                                        // Dolphin
            ], [[NAME, 'Dolphin'], VERSION, MAJOR], [

            /((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i                       // Chrome for Android/iOS
            ], [[NAME, 'Chrome'], VERSION, MAJOR], [

            /version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i                 // Mobile Safari
            ], [VERSION, MAJOR, [NAME, 'Mobile Safari']], [

            /version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i              // Safari & Safari Mobile
            ], [VERSION, MAJOR, NAME], [

            /webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i                   // Safari < 3.0
            ], [NAME, [MAJOR, mapper.str, maps.browser.oldsafari.major], [VERSION, mapper.str, maps.browser.oldsafari.version]], [

            /(konqueror)\/((\d+)?[\w\.]+)/i,                                    // Konqueror
            /(webkit|khtml)\/((\d+)?[\w\.]+)/i
            ], [NAME, VERSION, MAJOR], [

            // Gecko based
            /(navigator|netscape)\/((\d+)?[\w\.-]+)/i                           // Netscape
            ], [[NAME, 'Netscape'], VERSION, MAJOR], [
            /(swiftfox)/i,                                                      // Swiftfox
            /(iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,
                                                                                // Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,
                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
            /(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,                    // Mozilla

            // Other
            /(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf)[\/\s]?((\d+)?[\w\.]+)/i,
                                                                                // UCBrowser/Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf
            /(links)\s\(((\d+)?[\w\.]+)/i,                                      // Links
            /(gobrowser)\/?((\d+)?[\w\.]+)*/i,                                  // GoBrowser
            /(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,                             // ICE Browser
            /(mosaic)[\/\s]((\d+)?[\w\.]+)/i                                    // Mosaic
            ], [NAME, VERSION, MAJOR]
        ],

        cpu : [[

            /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i                     // AMD64
            ], [[ARCHITECTURE, 'amd64']], [

            /((?:i[346]|x)86)[;\)]/i                                            // IA32
            ], [[ARCHITECTURE, 'ia32']], [

            /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i                           // PowerPC
            ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [

            /(sun4\w)[;\)]/i                                                    // SPARC
            ], [[ARCHITECTURE, 'sparc']], [

            /(ia64(?=;)|68k(?=\))|arm(?=v\d+;)|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
                                                                                // IA64, 68K, ARM, IRIX, MIPS, SPARC, PA-RISC
            ], [ARCHITECTURE, util.lowerize]
        ],

        device : [[

            /\((ipad|playbook);[\w\s\);-]+(rim|apple)/i                         // iPad/PlayBook
            ], [MODEL, VENDOR, [TYPE, TABLET]], [

            /(hp).+(touchpad)/i,                                                // HP TouchPad
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /\s(nook)[\w\s]+build\/(\w+)/i,                                     // Nook
            /(dell)\s(strea[kpr\s\d]*[\dko])/i                                  // Dell Streak
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /\((ip[honed]+);.+(apple)/i                                         // iPod/iPhone
            ], [MODEL, VENDOR, [TYPE, MOBILE]], [

            /(blackberry)[\s-]?(\w+)/i,                                         // BlackBerry
            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola)[\s_-]?([\w-]+)*/i,
                                                                                // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Huawei/Meizu/Motorola
            /(hp)\s([\w\s]+\w)/i,                                               // HP iPAQ
            /(asus)-?(\w+)/i                                                    // Asus
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /\((bb10);\s(\w+)/i                                                 // BlackBerry 10
            ], [[VENDOR, 'BlackBerry'], MODEL, [TYPE, MOBILE]], [

            /android.+((transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+))/i       // Asus Tablets
            ], [[VENDOR, 'Asus'], MODEL, [TYPE, TABLET]], [

            /(sony)\s(tablet\s[ps])/i                                           // Sony Tablets
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(nintendo)\s([wids3u]+)/i                                          // Nintendo
            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [

            /((playstation)\s[3portablevi]+)/i                                  // Playstation
            ], [[VENDOR, 'Sony'], MODEL, [TYPE, CONSOLE]], [

            /(sprint\s(\w+))/i                                                  // Sprint Phones
            ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [

            /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,                               // HTC
            /(zte)-(\w+)*/i,                                                    // ZTE
            /(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i
                                                                                // Alcatel/GeeksPhone/Huawei/Lenovo/Nexian/Panasonic/Sony
            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

            /\s((milestone|droid[2x]?))[globa\s]*\sbuild\//i,                   // Motorola
            /(mot)[\s-]?(\w+)*/i
            ], [[VENDOR, 'Motorola'], MODEL, [TYPE, MOBILE]], [
            /android.+\s((mz60\d|xoom[\s2]{0,2}))\sbuild\//i
            ], [[VENDOR, 'Motorola'], MODEL, [TYPE, TABLET]], [

            /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9))/i
            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [                  // Samsung
            /((s[cgp]h-\w+|gt-\w+|galaxy\snexus))/i,
            /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,
            /sec-((sgh\w+))/i
            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [
            /(sie)-(\w+)*/i                                                     // Siemens
            ], [[VENDOR, 'Siemens'], MODEL, [TYPE, MOBILE]], [

            /(maemo|nokia).*(n900|lumia\s\d+)/i,                                // Nokia
            /(nokia)[\s_-]?([\w-]+)*/i
            ], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [

            /android\s3\.[\s\w-;]{10}((a\d{3}))/i                               // Acer
            ], [[VENDOR, 'Acer'], MODEL, [TYPE, TABLET]], [

            /android\s3\.[\s\w-;]{10}(lg?)-([06cv9]{3,4})/i                     // LG
            ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
            /((nexus\s4))/i,
            /(lg)[e;\s-\/]+(\w+)*/i
            ], [[VENDOR, 'LG'], MODEL, [TYPE, MOBILE]], [

            /(mobile|tablet);.+rv\:.+gecko\//i                                  // Unidentifiable
            ], [TYPE, VENDOR, MODEL]
        ],

        engine : [[

            /(presto)\/([\w\.]+)/i,                                             // Presto
            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
            ], [NAME, VERSION], [

            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
            ], [VERSION, NAME]
        ],

        os : [[

            // Windows based
            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
            ], [NAME, [VERSION, mapper.str, maps.os.windows.version]], [
            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

            // Mobile/Embedded OS
            /\((bb)(10);/i                                                      // BlackBerry 10
            ], [[NAME, 'BlackBerry'], VERSION], [
            /(blackberry)\w*\/?([\w\.]+)*/i,                                    // Blackberry
            /(tizen)\/([\w\.]+)/i,                                              // Tizen
            /(android|webos|palm\os|qnx|bada|rim\stablet\sos|meego)[\/\s-]?([\w\.]+)*/i
                                                                                // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo
            ], [NAME, VERSION], [
            /(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i                 // Symbian
            ], [[NAME, 'Symbian'], VERSION],[
            /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
            ], [[NAME, 'Firefox OS'], VERSION], [

            // Console
            /(nintendo|playstation)\s([wids3portablevu]+)/i,                    // Nintendo/Playstation

            // GNU/Linux based
            /(mint)[\/\s\(]?(\w+)*/i,                                           // Mint
            /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk)[\/\s-]?([\w\.-]+)*/i,
                                                                                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
                                                                                // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk
            /(hurd|linux)\s?([\w\.]+)*/i,                                       // Hurd/Linux
            /(gnu)\s?([\w\.]+)*/i                                               // GNU
            ], [NAME, VERSION], [

            /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
            ], [[NAME, 'Chromium OS'], VERSION],[

            // Solaris
            /(sunos)\s?([\w\.]+\d)*/i                                           // Solaris
            ], [[NAME, 'Solaris'], VERSION], [

            // BSD based
            /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i                   // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
            ], [NAME, VERSION],[

            /(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i             // iOS
            ], [[NAME, 'iOS'], [VERSION, /_/g, '.']], [

            /(mac\sos\sx)\s?([\w\s\.]+\w)*/i                                    // Mac OS
            ], [NAME, [VERSION, /_/g, '.']], [

            // Other
            /(haiku)\s(\w+)/i,                                                  // Haiku
            /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,                               // AIX
            /(macintosh|mac(?=_powerpc)|plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos)/i,
                                                                                // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS
            /(unix)\s?([\w\.]+)*/i                                              // UNIX
            ], [NAME, VERSION]
        ]
    };

    var UAParser = function UAParser (uastring) {
        if (!(this instanceof UAParser)) return new UAParser(uastring).getResult();

        var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);

        if (!(this instanceof UAParser)) {
            return new UAParser(uastring).getResult();
        }
        this.getBrowser = function () {
            return mapper.rgx.apply(this, regexes.browser);
        };
        this.getCPU = function () {
            return mapper.rgx.apply(this, regexes.cpu);
        };
        this.getDevice = function () {
            return mapper.rgx.apply(this, regexes.device);
        };
        this.getEngine = function () {
            return mapper.rgx.apply(this, regexes.engine);
        };
        this.getOS = function () {
            return mapper.rgx.apply(this, regexes.os);
        };
        this.getResult = function() {
            return {
                browser : this.getBrowser(),
                engine  : this.getEngine(),
                os      : this.getOS(),
                device  : this.getDevice(),
                cpu     : this.getCPU()
            };
        };
        this.getUA = function () {
            return ua;
        };
        this.setUA = function (uastring) {
            ua = uastring;
            return this;
        };
        this.setUA(ua);
    };

    module.exports = UAParser;
})(this);

});
require.register("js-coder-loStorage.js/src/loStorage.js", function(exports, require, module){
// Copyright (c) 2012 Florian H., https://github.com/js-coder https://github.com/js-coder/lostorage.js
!function (window, undefined) {

   var utils = {

      isArray: Array.isArray || function (value) {
         return Object.prototype.toString.call(value) === '[object Array]';
      },

      isPlainObj: function (value) {
         return value === Object(value);
      },

      toArray: function (value) {
         return Array.prototype.slice.call(value);
      },

      // Convert arguments to an Array (`utils.toArray`) and prepend `element`.
      prepareArgs: function (args, element) {
         args = utils.toArray(args);
         args.unshift(element);
         return args;
      },

      getObjKeyByValue: function (obj, value) {
         for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
               if (obj[key] === value) return key;
            }
         }
      },

      // Prepares the return value to enable chaining.
      prepareReturn: function (type) {
         return window[utils.getObjKeyByValue(types, type)];
      },

      retrieve: function (value, fallback) { // Returns fallback if the value is undefined, otherwise value.
         return value == undefined ? fallback : value;
      },

      serialize: function (data) {
         return JSON.stringify(data);
      },

      unserialize: function (data) {
         if (data == undefined) return undefined;
         return JSON.parse(data);
      }

   };

   var _storage = function () {
         return _storage.get.apply(this, arguments);
   };

   var host = {
      storage: function () {
         return storage.get.apply(storage, arguments);
      },
      session: function () {
         return session.get.apply(session, arguments);
      }
   };

   _storage.set = function (type, key, value) {

      if (utils.isPlainObj(key)) {

         for (var k in key) {
            if (key.hasOwnProperty(k)) type.setItem(k, utils.serialize(key[k]));
         }

      } else type.setItem(key, utils.serialize(value));

      return utils.prepareReturn(type); // to enable chaining

   };

   _storage.invert = function (type, key) {
      return this.set(type, key, !(this.get(type, key)));
   };

   _storage.add = function (type, key, value) {
      return this.set(type, key, this.get(type, key) + parseInt(value, 10));
   };

   _storage.increase = function (type, key, value) {
      return this.add(type, key, utils.retrieve(value, 1));
   };

   _storage.decrease = function (type, key, value) {
      return this.add(type, key, -utils.retrieve(value, 1));
   };

   _storage.concat = function (type, key, string) { // append?
      return this.set(type, key, this.get(type, key) + string);
   };

   _storage.push = function (type, key, value) {

      var args = utils.toArray(arguments),
           arr = this.get(type, key, []);

      args.splice(0, 2);
      arr.push.apply(arr, args);

      return this.set(type, key, arr);

   }

   _storage.extend = function (type, key, k, v) { // variables?

      var value = this.get(type, key, {});

      if (utils.isPlainObj(k)) {

         for (var _k in k) {
            if (k.hasOwnProperty(_k)) value[_k] = k[_k];
         }

      } else value[k] = v;

      return this.set(type, key, value);

   };

   _storage.remove = function (type, keys) {

      keys = utils.isArray(keys) ? keys : utils.toArray(arguments);

      for (var i = 0, l = keys.length; i < l; i++) {
         delete type[keys[i]];
      }

      return utils.prepareReturn(type);

   };

   _storage.empty = function (type) {

      type.clear();

      return utils.prepareReturn(type);

   };

   _storage.get = function (type, keys, fallback) {

      fallback = fallback || undefined;

      if (utils.isArray(keys)) {
         var result = {};

         for (var i = 0, l = keys.length; i < l; i++) {
            var key = keys[i];
            result[key] = this.get(type, key, fallback);
         }

         return result;
      } else return utils.retrieve(utils.unserialize(type.getItem(keys)), fallback);

   };

   _storage.all = function (type) {

      var obj = {};

      for (var i = 0, l = type.length; i < l; i++) {
         var key = type.key(i);
         obj[key] = utils.unserialize(type.getItem(key));
      }

      return obj;
   };

   var methods = 'set invert add increase decrease concat push extend remove empty get all'.split(' '); // Methods of _storage that need to be copied to storage and session.

   var types = {
      storage: localStorage,
      session: sessionStorage
   };

   for (var i = 0, l = methods.length; i < l; i++) {

      var method = methods[i];

      for (var name in types) {

         if (!(types.hasOwnProperty(name))) continue;

         var storeType = types[name];

         host[name][method] = function (method, storeType) {
            return function () {
               var args = utils.prepareArgs(arguments, storeType);
               return _storage[method].apply(_storage, args);
            };
         }(method, storeType);

      }

   }

   // loStorage object for AMD & CommonJS.
   var loStorage = {
      storage: host.storage,
      session: host.session
   };

   // AMD, CommonJS or global.
   if (typeof define === 'function' && define.amd) {
      define(function () {
         return loStorage;
      });
   } else if (typeof exports !== 'undefined') {
      module.exports = loStorage;
   } else {
      window.storage = host.storage;
      window.session = host.session;
   }

}(window);

});
require.register("log/index.js", function(exports, require, module){
/**
 * Module dependencies
 */

var xhr = require('xhr')
  , ws = require('ws')
  , storage = require('loStorage.js').session
  , defaults = require('defaults')
  , debounce = require('debounce')
  , parse = require('user-agent-parser')
  , syslog = require('syslog');

/**
 * Get the system info for the default syslog format
 */

var ua = parse();
var hostname = window.location.host;
var proc_id =
  (ua.os.name || '').replace(/ /g, '_') + '-' +
  (ua.os.version || '').replace(/ /g, '_') + '/' +
  (ua.browser.name || '').replace(/ /g, '_') + '-' +
  (ua.browser.version || '').replace(/ /g, '_');

/**
 * Create a connection to a websocket to recieve syslog-style log messages
 *
 * @param {String} host
 * @param {Obj?} options
 * @return {WebSocket.send|XMLHttpRequest.send}
 * @api public
 */

module.exports = function(host, options) {
  options = options || {};

  defaults(options, {
    app: 'app',
    syslog: {}
  });

  defaults(options.syslog, {
    proc_id: proc_id,
    app_name: options.app,
    hostname: hostname
  });

  /**
   * Format logs in syslog format
   */

  var fmt = syslog(options.syslog);

  /**
   * Get the client connection
   */

  var send = connect(host, options);

  /**
   * Keep a log buffer
   */

  var buffer = [];

  /**
   * Emit a message to the server
   */

  var emit = debounce(function() {
    var str = buffer.join('');
    send(str);
    buffer = [];
    if(options.debug) console.log(str);
  }, options.debounce);

  return function(str) {
    buffer.push(fmt(str));
    emit();
  };
};

/**
 * Get client with fallback
 *
 * @param {String} host
 * @param {Obj?} options
 * @return {WebSocket.send|XMLHttpRequest.send}
 * @api private
 */

function connect(host, options) {
  /**
   * Try to create a ws connection
   */
  var wshost = host.replace('http://', 'ws://')
    , client = ws(wshost)
    , retries = 0;

  /**
   * We don't have ws support or XHR is forced
   */
  if (options.forceXHR || !client) {
    host = options.httpHost || host.replace('ws://', 'http://');
    return function(text) {
      var req = xhr();
      req.open('POST',host,true);
      req.send(text);
    };
  };

  /**
   * If we were kicked off, try to reconnect
   */
  function onclose (e) {
    if (e.type === 'close') {
      if (options.debug) console.log('could not connect to '+wshost+'. Trying again.');

      setTimeout(function() {
        if (retries > options.maxRetries) return;
        if (options.debug) console.log('reconnecting to '+wshost+'...');
        client = ws(wshost);
        client.onopen = onopen;
        client.onclose = onclose;
        retries++;
      }, options.timeout || 5000);

    };
  };

  /**
   * Send the saved messages to the server on a connection
   */
  function onopen () {
    if(options.debug) console.log('connected to '+wshost);

    // Send our stored message back to the server
    var message = (storage.get('log-messages')||[]).join('');
    if (message) {
      client.send(message);
      storage.set('log-messages', []);
    }
  };

  // Set our callbacks
  client.onopen = onopen;
  client.onclose = onclose;

  return function(data) {
    // It's not open
    if (client.readyState !== 1) return storage.push('log-messages', data);
    // It's open
    client.send(data);
  };
};

});







require.alias("yields-xhr/index.js", "log/deps/xhr/index.js");
require.alias("yields-xhr/index.js", "xhr/index.js");

require.alias("CamShaft-ws/index.js", "log/deps/ws/index.js");
require.alias("CamShaft-ws/index.js", "ws/index.js");

require.alias("CamShaft-syslog.js/index.js", "log/deps/syslog/index.js");
require.alias("CamShaft-syslog.js/index.js", "syslog/index.js");
require.alias("avetisk-defaults/index.js", "CamShaft-syslog.js/deps/defaults/index.js");

require.alias("component-pad/index.js", "CamShaft-syslog.js/deps/pad/index.js");

require.alias("matthewmueller-debounce/index.js", "log/deps/debounce/index.js");
require.alias("matthewmueller-debounce/index.js", "debounce/index.js");

require.alias("avetisk-defaults/index.js", "log/deps/defaults/index.js");
require.alias("avetisk-defaults/index.js", "defaults/index.js");

require.alias("component-user-agent-parser/src/ua-parser.js", "log/deps/user-agent-parser/src/ua-parser.js");
require.alias("component-user-agent-parser/src/ua-parser.js", "log/deps/user-agent-parser/index.js");
require.alias("component-user-agent-parser/src/ua-parser.js", "user-agent-parser/index.js");
require.alias("component-user-agent-parser/src/ua-parser.js", "component-user-agent-parser/index.js");
require.alias("js-coder-loStorage.js/src/loStorage.js", "log/deps/loStorage.js/src/loStorage.js");
require.alias("js-coder-loStorage.js/src/loStorage.js", "log/deps/loStorage.js/index.js");
require.alias("js-coder-loStorage.js/src/loStorage.js", "loStorage.js/index.js");
require.alias("js-coder-loStorage.js/src/loStorage.js", "js-coder-loStorage.js/index.js");if (typeof exports == "object") {
  module.exports = require("log");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("log"); });
} else {
  this["log"] = require("log");
}})();
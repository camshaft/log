/**
 * Module dependencies
 */

var xhr = require('xhr')
  , ws = require('ws')
  , storage = require('loStorage.js').session
  , defaults = require('defaults')
  , debounce = require('debounce')
  , parse = require('ua-parser-js')
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

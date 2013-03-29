/**
 * Module dependencies
 */
var xhr = require("xhr")
  , ws = require("ws")
  , console = require("console")
  , storage = require("loStorage.js").session
  , defaults = require("defaults")
  , debounce = require('debounce')
  , queue = require("queue")
  , metric = require("metric-log")
  , parse = require("user-agent-parser")
  , once = require("once")
  , syslog = require("syslog");

// Get basic browser info
var browser = parse(navigator.userAgent).browser
  , hostname = (browser.name || '').replace(/ /g, "-")+"."+browser.version
  , proc_id = window.location.href.substring(0, 128);

/**
 * Create a connection to a websocket to recieve syslog-style log messages
 *
 * @param {String} host
 * @param {Obj?} options
 * @return {WebSocket.send|XMLHttpRequest.send}
 * @api public
 */
module.exports = exports = once(function(host, options) {
  // Defaults
  if(!options) options = {};

  var send = getClient(host, options)
    , messages = queue()
    , err = syslog(defaults({severity: 3, proc_id: proc_id, hostname: hostname}, options.syslog))
    , info = syslog(defaults({proc_id: proc_id, hostname: hostname}, options.syslog));

  /**
   * Emit a message to the server
   */
  var emit = debounce(function() {
    var logs = [];
    while(!messages.isEmpty()) {
      logs.push(messages.dequeue());
    }
    var str = logs.join("");
    send(str);
    if(options.debug) console.debug(str);
  }, options.debounce);

  /**
   * Patch a console.* function to call emit
   */
  function patch(out, format) {
    return function() {
      var args = arguments;
      out.apply(console, args);
      setTimeout(function() {
        messages.enqueue(format.apply(format, args));
        emit();
      }, 0);
    };
  };

  // This hackery is required for IE8
  // where `console.log` doesn't have 'apply'
  var log = Function.prototype.bind.call(console.log, console)
    , error = Function.prototype.bind.call(console.error, console);

  /**
   * Load console.metric
   */
  metric.log = patch(log, info);
  console.metric = metric;

  /**
   * Patch console.log and console.error
   */
  console.log = patch(log, info);
  console.error = patch(error, err);

  /**
   * Emit any uncaught errors
   */
  _onerror = window.onerror;
  window.onerror = function(message, url, line) {
    var str = metric.format({
      error: message,
      url: url,
      line: line
    });

    messages.enqueue(err(str));
    emit();
    if(_onerror) _onerror.apply(this, arguments);
  };

  /**
   * Return the send method so they can use it other cases
   */
  return send;
});

/**
 * Get client with fallback
 *
 * @param {String} host
 * @param {Obj?} options
 * @return {WebSocket.send|XMLHttpRequest.send}
 * @api private
 */
function getClient(host, options) {
  if(!options) options = {};

  /**
   * Try to create a ws connection
   */
  var client = ws(host)
    , retries = 0;

  /**
   * We don't have ws support or XHR is forced
   */
  if (options.forceXHR || !client) {
    host = options.httpHost;
    return function(text) {
      var req = xhr();
      req.open("POST",host,true);
      req.send(text);
    };
  };

  /**
   * If we were kicked off, try to reconnect
   */
  function onclose (e) {
    if(e.type === "close") {
      if(options.debug) console.debug("could not connect to "+host+". Trying again.");

      setTimeout(function() {
        if(retries > options.maxRetries) return;
        if(options.debug) console.debug("reconnecting to "+host+"...");
        client = ws(host);
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
    if(options.debug) console.debug("connected to "+host);

    // Send our stored message back to the server
    client.send((storage.get('log-messages')||[]).join(""));
    storage.set('log-messages', []);
  };

  // Set our callbacks
  client.onopen = onopen;
  client.onclose = onclose;

  return function(data) {
    // It's not open
    if(client.readyState !== 1) return storage.push('log-messages', data);
    // It's open
    client.send(data);
  };
};

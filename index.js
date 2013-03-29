/**
 * Module dependencies
 */
var xhr = require("xhr")
  , ws = require("ws")
  , defaults = require("defaults")
  , debounce = require('debounce')
  , queue = require("queue")
  , metric = require("metric-log")
  , parse = require("user-agent-parser")
  , syslog = require("syslog");

// Get basic browser info
var browser = parse(navigator.userAgent).browser
  , hostname = (browser.name || '').replace(/ /g, "-")+"."+browser.version
  , proc_id = window.location.href.substring(0, 128);

module.exports = exports = function(host, options) {
  if(!options) options = {};

  var client = ws(host);

  if (options.forceXHR || !client) {
    host = host.replace("ws", options.httpProto || "http");
    return function(text) {
      var req = xhr();
      req.open("POST",host,true);
      req.send(text);
    };
  };

  // TODO handle reconnection
  client.onclose = function() {

  };

  return client.send.bind(client);
};

exports.connect = function(host, options) {
  if(!options) options = {};

  var send = exports(host, options)
    , messages = queue()
    , err = syslog(defaults({severity: 3, proc_id: proc_id, hostname: hostname}, options.syslog))
    , info = syslog(defaults({proc_id: proc_id, hostname: hostname}, options.syslog));

  var emit = debounce(function() {
    var logs = [];
    while(!messages.isEmpty()) {
      logs.push(messages.dequeue());
    }
    var str = logs.join("");
    send(str);
    if(options.debug) console.debug(str);
  }, options.debounce);

  function patch(out, format) {
    return function() {
      out.apply(console, arguments);
      var str = format.apply(format, arguments);
      setTimeout(function() {
        messages.enqueue(str);
        emit();
      }, 0);
    };
  };

  metric.log = patch(console.log.bind(console), info);
  console.metric = metric;
  console.log = patch(console.log, info);
  console.error = patch(console.error, err);

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
};

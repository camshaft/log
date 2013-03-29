/**
 * Module dependencies
 */
var xhr = require("xhr")
  , ws = require("ws")
  , debounce = require('debounce')
  , queue = require("queue")
  , metric = require("metric-log")
  , syslog = require("syslog");

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

exports.patch = function(host, options) {
  if(!options) options = {};

  var send = exports(host)
    , messages = queue()
    , format = syslog(options.syslog);

  var emit = debounce(function() {
    var text = [];
    while(!messages.isEmpty()) {
      text.push(messages.dequeue());
    }
    var str = text.join("");
    send(str);
    if(options.debug) console.debug(str);
  }, options.debounce);

  function patch(out) {
    return function() {
      out.apply(console, arguments);
      var str = format.apply(format, arguments);
      setTimeout(function() {
        messages.enqueue(str);
        emit();
      }, 0);
    };
  };

  metric.log = patch(console.log.bind(console));
  console.metric = metric;
  console.log = patch(console.log);
  console.error = patch(console.error);

  _onerror = window.onerror;
  window.onerror = function(err, url, line) {
    var str = metric({
      error: err,
      url: url,
      line: line
    });

    messages.enqueue(format(str));
    emit();
    if(_onerror) _onerror.apply(this, arguments);
  };
};

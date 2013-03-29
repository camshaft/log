/**
 * Module dependencies
 */
var xhr = require("xhr")
  , ws = require("ws")
  , console = require("console")
  , each = require("each")
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

module.exports = exports = once(function(host, options) {
  if(!options) options = {};

  var send = getClient(host, options)
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
      var args = arguments;
      out.apply(console, args);
      setTimeout(function() {
        messages.enqueue(format.apply(format, args));
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
});

function getClient(host, options) {
  if(!options) options = {};

  var client = ws(host)
    , retries = 0;

  if (options.forceXHR || !client) {
    host = options.httpHost;
    return function(text) {
      var req = xhr();
      req.open("POST",host,true);
      req.send(text);
    };
  };

  // handle reconnection
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
    }
  }

  function onopen () {
    if(options.debug) console.debug("connected to "+host);
    each(storage.get('log-messages'), function(chunk) {
      client.send(chunk);
    });
    storage.set('log-messages', []);
  }

  client.onopen = onopen;
  client.onclose = onclose;

  return function(data) {
    // It's not open
    if(client.readyState !== 1) return storage.push('log-messages', data);
    // It's open
    client.send(data);
  };
};

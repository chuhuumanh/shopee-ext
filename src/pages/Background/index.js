let urls = []; // Array of URLs to be processed
let currentIndex = 0;
let currentTabId = null; // To store the current tab ID

// import từ extension khác hic

/**
 * AnhNguyen
 *
 * Advanced cookie manager WebExtension by Nodetics <nodetics@gmail.com>
 * All Rights Reserved (C)
 */
var _whitelist = {}; // cookies from domains on the whitelist will be accepted and kept as long as the cookie is valid (based on expires or max-age attribute)
var _blacklist = {}; // cookies from domains on the blacklist will be immediately rejected (don't make it past the URL loading)
var _whitelistedCookies = {}; // keys: domains, values: hashMaps of cookie names that are protected from deletion
var _blacklistedCookies = {}; // keys: domains, values: hashMaps of cookie names that are automatically blocked
var _intervalId; // autopurge timer id
var _settings = {
  startupdelete: false,
  startupbrowsingpurge: false,
  startuppluginpurge: false,
  startupserviceworkerpurge: false,
  startuphistorypurge: false,
  period: 0,
  keepsession: true,
  blacklist: false,
  blacklistsession: false,
  filterEtag: false,
  filterLink: false,
  dynamicicon: true,
  disablefavicons: false,
  disablecookielog: false,
};

var _logIndex = 0;
var _log = new Array(200);
var _isFirefox;
var _isFirstPartyIsolationSupported;
var _lastUrl;
var _lastCookie;

function sortHosts(hosts) {
  var sorted_hosts = [];
  var split_hosts = [];
  var h;

  for (h in hosts) {
    segments = hosts[h].split('.');
    segments.reverse();
    split_hosts.push(segments);
  }
  split_hosts.sort();

  for (h in split_hosts) {
    split_hosts[h].reverse();
    sorted_hosts.push(split_hosts[h].join('.'));
  }
  return sorted_hosts;
}

/**
 * @see https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/cookies#First-party_isolation
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=1381197
 *
 * @return true if browser supports "First Party Isolation" of cookies
 */
function isFirstPartyIsolationSupported() {
  if (_isFirstPartyIsolationSupported != undefined) {
    return _isFirstPartyIsolationSupported;
  }

  _isFirstPartyIsolationSupported = isFirefox() && getBrowserVersion() >= 59;

  try {
    if (isFirefox()) {
      chrome.cookies.getAll({
        firstPartyDomain: null,
        domain: '.nonexistentdomain.net',
      });
    }
  } catch (error) {
    _isFirstPartyIsolationSupported = false;
    console.log('firstPartyIsolation not supported!');
  }
  return _isFirstPartyIsolationSupported;
}

function isFirefox() {
  if (_isFirefox != undefined) {
    return _isFirefox;
  }
  _isFirefox = navigator.userAgent.indexOf('Firefox') != -1;
  return _isFirefox;
}

/**
 * @return major version of the browser (Firefox or Chrome)
 */
function getBrowserVersion() {
  var match = navigator.userAgent.match(/(Firefox|Chrome)\/([0-9]+)\./);
  return match ? parseInt(match[2]) : 0;
}

function downloadFile(data, filename, mimeType) {
  var file = new Blob([data], { type: mimeType });
  var href = window.URL.createObjectURL(file);
  var a = document.createElement('a');
  a.href = href;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
}

function readFile(containerId, callback, type) {
  try {
    var fileInput = $(containerId);
    var f = fileInput.prop('files'); // returns an object of type "FileList" which has File elements

    if (f == undefined || f.length < 1) {
      console.log('No file selected!');
      return;
    }

    var file = f[0]; // select the first file
    var r = new FileReader();
    r.onload = function (e) {
      var contents = e.target.result;
      // e.target.fileName should contain the source filename (use it later as default when exporting)
      callback(contents, file, type);
      fileInput.val(null);
    };
    r.readAsText(file);
  } catch (exception) {
    console.log(exception);
  }
  return false;
}

/**
 * @param qs document.location.search
 */
function getQueryParams(qs) {
  qs = qs.split('+').join(' ');

  var params = {},
    tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

  tokens = re.exec(qs);
  while (tokens) {
    params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    tokens = re.exec(qs);
  }
  return params;
}

function getDomainIcon(domain) {
  // return "https://www.google.com/s2/favicons?domain=" + (domain.charAt(0) == '.' ? domain.substring(1) : domain);
  return (
    'https://icons.duckduckgo.com/ip3/' +
    (domain.charAt(0) == '.' ? domain.substring(1) : domain) +
    '.ico'
  );
}

/**
 * @see https://tools.ietf.org/html/rfc6265
 */
function checkDomain(list, domain) {
  if (list[domain] || list['.' + domain]) {
    return true; // direct hit
  }
  if (list['*.*'] || list['.*']) {
    return true; // match any
  }
  if (
    domain.length > 6 &&
    domain.charAt(0) == 'w' &&
    domain.charAt(1) == 'w' &&
    domain.charAt(2) == 'w' &&
    domain.charAt(3) == '.' &&
    list[domain.substring(4)]
  ) {
    return true; // if list has "mysite.com" and cookie domain is "www.mysite.com", consider it a match
  }

  if (domain && domain.length > 1 && domain.charAt(0) == '.') {
    domain = domain.substring(1); // .addons.mozilla.org -> addons.mozilla.org
    if (list[domain]) {
      return true;
    }
  }
  var a;
  while (true) {
    a = domain.indexOf('.', 1);
    if (a < 0) {
      return false;
    }
    domain = domain.substring(a);
    if (list[domain]) {
      return true;
    }
  }
  return false;
}

function isCookieWhitelisted(cookie) {
  return checkSingle(_whitelistedCookies, cookie);
}

function isCookieBlacklisted(cookie) {
  return checkSingle(_blacklistedCookies, cookie);
}

function checkSingle(list, cookie) {
  var domain = cookie.domain;

  if (doesMatch(list, domain, cookie.name)) {
    return true;
  }
  if (doesMatch(list, '.*', cookie.name)) {
    return true;
  }
  if (doesMatch(list, '.' + domain, cookie.name)) {
    return true;
  }
  if (domain && domain.length > 1 && domain.charAt(0) == '.') {
    domain = domain.substring(1); // .addons.mozilla.org -> addons.mozilla.org
    if (doesMatch(list, domain, cookie.name)) {
      return true;
    }
  }
  var a;
  while (true) {
    a = domain.indexOf('.', 1);
    if (a < 0) {
      return false;
    }
    domain = domain.substring(a);
    if (doesMatch(list, domain, cookie.name)) {
      return true;
    }
  }
  return false;
}

function doesMatch(list, domain, name) {
  return list && list[domain] && list[domain][name] == true;
}

function getIconFile(cookie) {
  if (cookie && isCookieWhitelisted(cookie)) {
    return 'images/anhnguyen16-green.png';
  }
  if (cookie && cookie.session) {
    return 'images/anhnguyen16-bw.png';
  }
  return 'images/anhnguyen16.png';
}

function getHostFromUrl(url) {
  if (url == undefined) {
    return url;
  }
  var a = url.indexOf('://');
  if (a == -1) {
    a = 0;
  } else {
    a = a + 3;
  }
  var b = url.indexOf('/', a);
  if (b == -1) {
    b = url.length;
  }
  var host = url.substring(a, b);
  var c = host.indexOf('@'); // jesse:james@www.google.com:3000
  if (c != -1) {
    host = host.substring(c + 1);
  }
  var d = host.indexOf(':'); // get rid of the possible port number
  if (d != -1) {
    host = host.substring(0, d);
  }
  return host;
}

function escapeHtml(text) {
  return text
    ? String(text).replace(/[&<>"'`]/g, function (chr) {
        return '&#' + chr.charCodeAt(0) + ';';
      })
    : text;
}

function getCookieUrl(cookie) {
  return (
    (cookie.secure ? 'https' : 'http') +
    '://' +
    (cookie.domain && cookie.domain.length > 0 && cookie.domain.charAt(0) == '.'
      ? cookie.domain.substring(1)
      : cookie.domain) +
    cookie.path
  );
}

function removeCookie(cookie, callback) {
  var url = getCookieUrl(cookie);
  var data = {
    url: url,
    name: cookie.name,
    storeId: cookie.storeId,
  };
  if (isFirstPartyIsolationSupported()) {
    data.firstPartyDomain = cookie.firstPartyDomain;
  }
  if (callback == undefined) {
    callback = removeCallback;
  }
  _lastCookie = cookie;
  _lastUrl = url;
  chrome.cookies.remove(data, callback);
}

function removeCallback(details) {
  if (details == null && chrome.runtime.lastError) {
    console.log('ERROR: Failed to remove cookie: ', chrome.runtime.lastError);
    if (_lastCookie != null) {
      console.log(
        '  ' +
          _lastCookie.name +
          ' domain: ' +
          _lastCookie.domain +
          ' url: ' +
          _lastUrl
      );
    }
  }
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === 'start') {
    urls = message.urls;
    currentIndex = 0;
    openNextTab();
  }

  if (message.action === 'importCookies') {
    var jsonText = message.data;
    try {
      var cookies = JSON.parse(jsonText);

      var cookie,
        count = 0,
        maxcount = cookies.length,
        now = new Date().getTime() / 1000;
      for (var i = 0; i < cookies.length; i++) {
        cookie = cookies[i];
        // eslint-disable-next-line no-undef
        cookie.url = getCookieUrl(cookie);
        if (cookie.hostOnly) {
          delete cookie.domain;
        }
        delete cookie.hostOnly;
        if (cookie.session) {
          delete cookie.expirationDate;
        }
        if (cookie.expirationDate < now) {
          maxcount--; // skip expired cookies
          console.log(
            'Skipped expired cookie ' + cookie.name + ' of URL ' + cookie.url
          );
          continue;
        }
        delete cookie.session;
        // eslint-disable-next-line no-loop-func
        (function (thisCookie) {
          removeCookie(thisCookie, function () {
            _settings.blacklist = false; // disable blacklist just temporarily to allow the new cookie to be created
            console.log(thisCookie, 'thisCookie');
            chrome.cookies.set(thisCookie, function (c) {
              count++;
              if (c == null) {
                console.log(
                  'Failed to import ' +
                    JSON.stringify(thisCookie) +
                    ' chrome.runtime.lastError: ',
                  chrome.runtime.lastError
                );
              }
              if (count == maxcount) {
                sendResponse({ result: 200 }); // all set!
              }
            });
          });
        })(cookie);
      }
      sendResponse(true);
    } catch (error) {
      console.log('Failed to import cookies!', error);
    }
  }
});

function openNextTab() {
  if (currentIndex < urls.length) {
    if (currentTabId !== null) {
      chrome.tabs.remove(currentTabId, () => {
        createNewTab();
      });
    } else {
      createNewTab();
    }
  }
}

function createNewTab() {
  chrome.tabs.create({ url: urls[currentIndex] }, (tab) => {
    currentTabId = tab.id;
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'next') {
    currentIndex++;
    openNextTab();
  }
});

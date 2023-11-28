//Code in here runs before snake-mod-loader-web.js
//Useful to help set stuff up specific to the web version, that doesn't belong in the mod-loader script

window.webSnake = window.webSnake ?? {};
window.webSnake.logUrlChanges = false;

//Disable analytics
window.navigator.sendBeacon = function() {
  //Do nothing
  window.webSnake.logUrlChanges && console.log('beacon disabled');
}

//Disable google logging
window.google.log = function() {
  //Do nothing
  window.webSnake.logUrlChanges && console.log('google.log disabled');
}

window.google.logUrl = function() {
  //Do nothing
  window.webSnake.logUrlChanges && console.log('google.logUrl disabled');
}

//Update url redirects to be relative
//Commented out as this might not be needed
/*
window.webSnake.urlMap.forEach(rule => {
  const thisUrl = new URL(document.location);
  const urlStart = thisUrl.origin + thisUrl.pathname;
  rule.newUrl = thisUrl.origin + thisUrl.pathname + rule.newUrl;
});
*/

//Block urls in xhr
window.oldXhrOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function () {
  let url = makeUrlAbsolute(arguments[1]);
  
  if(window.webSnake.blockedUrls.includes(url)) {
    window.webSnake.logUrlChanges && console.log('Blocking url: ' + url);
    throw new Error('Blocking url ' + url); //Slightly sketchy to error here as it may have side effects. This seems ok in practise
  }

  return oldXhrOpen.apply(this, arguments);
};

window.oldFetch = window.fetch;

window.fetch = function(url) {
  if(typeof url === 'string') {
    let mapping = window.webSnake.urlMap.find(m=>m.oldUrl === url);

    if(mapping && mapping.newUrl) {
      window.webSnake.logUrlChanges && console.log('Redirecting url: ' + url);
      arguments[0] = mapping.newUrl;
    }
  }

  return window.oldFetch(...arguments);
}

function makeUrlAbsolute(url) {
  //If url starts with / then add https://www.google.com
  if (/^\/[^\/]/.test(url)) {
    url = "https://www.google.com" + url;
  }
  return url;
}
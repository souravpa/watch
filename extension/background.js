'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
      // enables extensions on certain sites if video player controls are available
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostContains: 'youtube.com'},
          css: ['video', 'ytd-player']
        }),
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostContains: 'netflix.com'},
          css: ['.AkiraPlayer']
        }),
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

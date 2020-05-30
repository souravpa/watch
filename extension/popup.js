'use strict';

chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
  let url = new URL(tabs[0].url);
  let sessionid = url.searchParams.get('watchsessionid');
  console.log('id = ', sessionid);

  if (sessionid) {
    document.getElementById('create').classList.add('hidden');
    document.getElementById('session').classList.remove('hidden');
    chrome.tabs.executeScript({file: 'jquery.js'}, function() {
      chrome.tabs.executeScript({code: 'var sessionid = ' + sessionid + ';'}, function() {
        chrome.tabs.executeScript({file: 'controls.js'})
      });
    });
  } else {
    let start = document.getElementById('start');
    start.onclick = function() {
      document.getElementById('create').classList.add('hidden');
      
      link.value = 'sharable link goes here';
      document.getElementById('invite').classList.remove('hidden');
      let copy = document.getElementById('copy');
      copy.onclick = function() {
        var copyText = document.getElementById("link");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");
      }
      chrome.tabs.executeScript({file: 'jquery.js'}, function() {
        chrome.tabs.executeScript({file: 'controls.js'})
      });
    };
  }
});

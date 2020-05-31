'use strict';
//FIXME allows creator of session to create multiple for same video

chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
  let url = new URL(tabs[0].url);
  let sessionid = url.searchParams.get('watchsessionid');
  console.log('id = ', sessionid);
  chrome.tabs.sendMessage(tabs[0].id, "hello", function(response) {
    if (sessionid || response) {
      document.getElementById('create').classList.add('hidden');
      document.getElementById('session').classList.remove('hidden');
      if (response) {
        $('#watcher-num').html(response + " user(s) in session");
      } else {
        chrome.tabs.executeScript({file: 'jquery.js'}, function() {
          chrome.tabs.executeScript({code: 'var sessionid = "' + sessionid + '";'}, function() {
            chrome.tabs.executeScript({file: 'controls.js'})
          });
        });
      }
    } else {
      let start = document.getElementById('start');
      start.onclick = function() {
        $.get("http://84987f1a0bae.ngrok.io/rand", function (data) {
          sessionid = data;
          document.getElementById('create').classList.add('hidden');
          
          link.value = url + '&watchsessionid=' + data;
          document.getElementById('invite').classList.remove('hidden');
          let copy = document.getElementById('copy');
          copy.onclick = function() {
            var copyText = document.getElementById("link");
            copyText.select();
            copyText.setSelectionRange(0, 99999);
            document.execCommand("copy");
          }
          chrome.tabs.executeScript({file: 'jquery.js'}, function() {
            chrome.tabs.executeScript({code: 'var sessionid = "' + data + '";'}, function() {
              chrome.tabs.executeScript({file: 'controls.js'})
            });
          });
        }).fail(function() {
          document.getElementById('create').classList.add('hidden');
          document.getElementById('error').classList.remove('hidden');
        });
      };
    }
  });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  $('#watcher-num').html(message + " user(s) in session");
});
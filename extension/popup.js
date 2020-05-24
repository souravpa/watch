'use strict';

let start = document.getElementById('start');
start.onclick = function() {
  link.value = 'sharable link goes here';
  document.getElementById('create').classList.add('hidden');
  document.getElementById('invite').classList.remove('hidden');
  chrome.tabs.executeScript({file: 'jquery.js'}, function() {
    chrome.tabs.executeScript({file: 'controls.js'})
  });
};

let copy = document.getElementById('copy');
copy.onclick = function() {
  var copyText = document.getElementById("link");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");
}
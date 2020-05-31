(function() {
  if (window.watchcontrolsInjected != true || !sessionid) {    
    var siteTags = [
      {
        hostname: 'youtube.com',
        playButton: () => $('.ytp-play-button'),
        playing: () => $('.playing-mode#movie_player').length > 0,
        slider: () => $('.ytp-progress-bar'),
        progress: function () {
          let pb = $('.ytp-progress-bar');
          return parseFloat(pb.attr('aria-valuenow')) / parseFloat(pb.attr('aria-valuemax'));
        }
      },
      {
        hostname: 'netflix.com',
        playButton: () => {
          let button = $('.button-nfplayerPlay');
          if (button.length > 0) {
            return button;
          }
          return $('.button-nfplayerPause');
        },
        playing: () => $('.button-nfplayerPause').length > 0,
        slider: () => $('.track'),
        progress: () => {
          let pb = $('.scrubber-head');
          return parseFloat(pb.attr('aria-valuenow')) / parseFloat(pb.attr('aria-valuemax'));
        }
      }
    ];
    
    var site;
    for (let tags of siteTags) {
      if (window.location.hostname.includes(tags.hostname)) {
        site = tags;
        break;
      }
    }
  
    let playButton = site.playButton();
    let slider = site.slider();
    if (!playButton.length || !slider.length) {
      chrome.runtime.sendMessage("error");
      return;
    }
    let watchers = 1;
    
    console.log("hello sir");
    console.log(sessionid);
    console.log(site);
    console.log(site.playing(), site.progress());
    
    var socket = new WebSocket('wss://84987f1a0bae.ngrok.io/chat/' + sessionid + '/');
  
    socket.onmessage = function (event) {
      console.log('Message from server ', event.data);
      let parts = event.data.split(" ");
      switch (parts[0]) {
        case "sir":
          watchers = parts[1];
          chrome.runtime.sendMessage(parts[1]);
          resetPlayback();
          break;
        case "play":
          playButton.click();
          break;
        case "skip":
          skip(slider[0], parseFloat(parts[1]));
          break;
        default:
          break;
      }
    };
  
    playButton[0].addEventListener("click", (event) => {
      if (event.isTrusted) {
        console.log("sending play click");
        socket.send("play");
      }
    });
    slider[0].addEventListener("mousedown", (event) => {
      if (event.isTrusted) {
        console.log("sending slider click");
        setTimeout(() => socket.send("skip " + site.progress()), 0);
      }
    });
  
    // for responding to popup request for number in session
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
      sendResponse(watchers);
    });
  
    function skip(elem, progress) {
      let rect = elem.getBoundingClientRect(),
          posX = rect.left, posY = rect.top;
  
      posX += progress * rect.width;
      posY += rect.height / 2;
      let click = new MouseEvent('mousedown', {bubbles: true, clientX: posX, clientY: posY});
      elem.dispatchEvent(click);
      click = new MouseEvent('mouseup', {bubbles: true, clientX: posX, clientY: posY});
      elem.dispatchEvent(click);
    }

    function resetPlayback() {
      if (site.playing()) {
        playButton.click();
      }
      skip(slider[0], 0);
    }

    window.watchcontrolsInjected = true;
  }
})();

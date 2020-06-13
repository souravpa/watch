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
        },
        keytarget: () => $('body')
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
        // FIXME button doesn't always update on netflix
        playing: () => $('.button-nfplayerPause').length > 0,
        slider: () => $('.scrubber-container'),
        progress: () => {
          let pb = $('.scrubber-head');
          return parseFloat(pb.attr('aria-valuenow')) / parseFloat(pb.attr('aria-valuemax'));
        },
        keytarget: () => $('.NFPlayer')
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
    let keytarget = site.keytarget();
    let watchers = 1;
    
    console.log("hello sir");
    console.log(sessionid);
    console.log(site);
    console.log(site.playing(), site.progress());
    console.log(keytarget);
    
    var socket = new WebSocket('wss://84987f1a0bae.ngrok.io/chat/' + sessionid + '/');
  
    socket.onmessage = function (event) {
      console.log('Message from server ', event.data);
      let parts = event.data.split(" ");
      switch (parts[0]) {
        case "sir":
          watchers = parseInt(parts[1]);
          chrome.runtime.sendMessage(parts[1]);
          if (watchers > 1) {
            resetPlayback();
          } 
          break;
        case "play":
          playButton.click();
          break;
        case "skip":
          // FIXME sometimes skips to 0 - maybe fixed
          skip(slider[0], parseFloat(parts[1]));
          break;
        case "Space":
          var key = new KeyboardEvent("keydown", {key: " ", code: "Space", keyCode: 32, which: 32, bubbles: true, composed: true})
          keytarget[0].dispatchEvent(key);
          break;
        case "ArrowLeft":
          var key = new KeyboardEvent("keydown", {key: "ArrowLeft", code: "ArrowLeft", keyCode: 37, which: 37, bubbles: true, composed: true})
          keytarget[0].dispatchEvent(key);
          break;
        case "ArrowRight":
          var key = new KeyboardEvent("keydown", {key: "ArrowRight", code: "ArrowRight", keyCode: 39, which: 39, bubbles: true, composed: true})
          keytarget[0].dispatchEvent(key);
          break;
        default:
          break;
      }
    };

    socket.onerror = function (error) {
      chrome.runtime.sendMessage("error");
    }
  
    playButton[0].addEventListener("click", (event) => {
      if (event.isTrusted) {
        setTimeout(() => {
          console.log("sending play click");
          socket.send("play");
        }, 0);
      }
    });
    slider[0].addEventListener("mousedown", (event) => {
      if (event.isTrusted) {
        setTimeout(() => {
          console.log("sending slider click " + site.progress());
          socket.send("skip " + site.progress());
        }, 0);
      }
    });
    keytarget[0].addEventListener("keydown", (event) => {
      if (event.isTrusted) {
        switch (event.code) {
          case "Space":
          case "ArrowLeft":
          case "ArrowRight":
            setTimeout(() => {
              console.log("sending keydown " + event.code);
              socket.send(event.code);
            }, 0);
            break;
          default:
            break;
        }
      }
    });
  
    // for responding to popup request for number in session
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
      sendResponse(watchers);
    });
  
    function skip(elem, progress) {
      let rect = elem.getBoundingClientRect(),
          posX = rect.left, posY = rect.top;
  
      posX += Math.round(progress * rect.width);
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

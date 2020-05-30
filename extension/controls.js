if (window.watchcontrolsInjected != true) {
  window.watchcontrolsInjected = true;
  
  let host = "localhost:8080";
  var siteTags = [
    {
      hostname: 'youtube.com',
      playButton: '.ytp-play-button',
      pauseButton: '.ytp-play-button',
      playing: function () {
        return $('.ytp-play-button').attr('title').includes("Pause");
      },
      slider: '.ytp-progress-list',
      progress: function () {
        let pb = $('.ytp-progress-bar');
        return parseFloat(pb.attr('aria-valuenow')) / parseFloat(pb.attr('aria-valuemax'));
      }
    },
    {
      hostname: 'netflix.com',
      playButton: '.button-nfplayerPlay',
      pauseButton: '.button-nfplayerPause',
      playing: function () {
        return $('.button-nfplayerPause').length > 0;
      },
      slider: '.track',
      progress: function () {
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

  let playButton = $(site.playButton);
  let pauseButton = $(site.pauseButton);
  let slider = $(site.slider);
  
  console.log("hello sir");
  console.log(site);
  console.log(site.playing(), site.progress());
  
  $.get("http://" + host + "/rand", function (data) {
    var socket = new WebSocket('ws://' + host + "/chat/" + data);
  
    socket.onopen = function (event) {
      socket.send('hello');
    };
    
    socket.onmessage = function (event) {
      console.log('Message from server ', event.data);
      let parts = event.data.split(" ");
      switch (parts[0]) {
        case "sir":
          $('#watcher-num').html(parts[1] + " user in session");
          break;
        case "play":
          playButton.click();
          break;
        case "pause":
          pauseButton.click();
          break;
        case "skip":
          let progress = parseFloat(parts[1]);
          let rect = slider[0].getBoundingClientRect(),
              posX = rect.left, posY = rect.top;
      
          posX += progress * rect.width;
          posY += rect.height / 2;
          let click = new MouseEvent('mousedown', {bubbles: true, clientX: posX, clientY: posY});
          slider.dispatchEvent(click);
          click = new MouseEvent('mouseup', {bubbles: true, clientX: posX, clientY: posY});
          slider.dispatchEvent(click);
          break;
        default:
          break;
      }
    };
  
    playButton[0].addEventListener("click", () => socket.send("play"));
    // some sites like netflix have different elements for play and pause
    if (playButton[0] !== pauseButton[0]) {
      pauseButton[0].addEventListener("click", () => socket.send("pause"));
    }
    slider[0].addEventListener("mousedown", () => socket.send("skip " + site.progress()));
  });
}

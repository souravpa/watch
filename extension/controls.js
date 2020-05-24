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

function clickProgressBar(elem, progress) {
  var rect = elem.getBoundingClientRect(),
      posX = rect.left, posY = rect.top;
  
  posX += progress * rect.width;
  posY += rect.height / 2;
  var click = new MouseEvent('mousedown', {bubbles: true, clientX: posX, clientY: posY});    
  elem.dispatchEvent(click);
  click = new MouseEvent('mouseup', {bubbles: true, clientX: posX, clientY: posY});    
  elem.dispatchEvent(click);
}

function play() {
  if (!site.playing()) {
    $(site.playButton).click();
  }
}

function pause() {
  if (site.playing()) {
    $(site.pauseButton).click();
  }
}

function skip(progress) {
  clickProgressBar($(site.slider)[0], progress);
}

for (let tags of siteTags) {
  if (window.location.hostname.includes(tags.hostname)) {
    site = tags;
    break;
  }
}
console.log("hello sir");
console.log(site);
console.log(site.playing(), site.progress());
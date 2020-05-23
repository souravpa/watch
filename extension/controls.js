var siteTags = [
  {
    hostname: 'youtube.com',
    playButton: '.ytp-play-button',
    slider: '.ytp-progress-list',
    progress: function () {
      let pb = $('.ytp-progress-bar');
      return parseFloat(pb.attr('aria-valuenow')) / parseFloat(pb.attr('aria-valuemax'));
    }
  }
];

function clickProgressBar(elem, progress) {
  var rect = elem.getBoundingClientRect(),
      posX = rect.left, posY = rect.top;
  
  posX += progress * rect.width;
  posY += rect.height / 2;
  var click = new MouseEvent('mousedown', {bubbles: true, clientX: posX, clientY: posY});    
  elem.dispatchEvent(click);
}

console.log("hello");
for (let site of siteTags) {
  if (window.location.hostname.includes(site.hostname)) {
    $(site.playButton).click();
    var progress = 0.5; //FIXME
    clickProgressBar($(site.slider)[0], progress);
    break;
  }
}
console.log("sir");
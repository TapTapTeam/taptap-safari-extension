// gesture.js
TapTap.gesture = {
  lastTapTime: 0,
  
  init: function() {
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), false);
  },
  
  handleTouchEnd: function(event) {
    const currentTime = new Date().getTime();
    const timeSinceLastTap = currentTime - this.lastTapTime;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      console.log("더블탭 감지됨");
      TapTap.sentence.selectSentenceAt(event);
      event.preventDefault();
    }
    
    this.lastTapTime = currentTime;
  }
};

TapTap.gesture.init();


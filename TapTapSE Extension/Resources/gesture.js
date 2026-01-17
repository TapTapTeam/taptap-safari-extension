// gesture.js
window.TapTap = window.TapTap || {};
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
      
      const wrapper = event.target.closest('.taptap-wrapper');
      if (wrapper) {
        const highlightId = wrapper.dataset.highlightId;
        TapTap.highlight.removeHighlight(highlightId);
      } else {
        TapTap.sentence.selectSentenceAt(event);
      }
      
      event.preventDefault();
    }
    
    this.lastTapTime = currentTime;
  }
};


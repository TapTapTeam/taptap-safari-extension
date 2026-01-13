// highlight.js - Version 2 (User-driven selection)
TapTap.highlight = {
  isSelecting: false,

  init: function() {
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
    document.addEventListener('touchend', this.handleTouchEnd.bind(this));
  },

  handleSelectionChange: function() {
    const selection = window.getSelection();
    this.isSelecting = !selection.isCollapsed;
  },

  handleTouchEnd: function() {
    if (this.isSelecting) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        this.highlightRange(selection.getRangeAt(0));
      }
      // isSelecting 상태는 handleSelectionChange에서 
      // highlightRange가 selection을 지우면서 자동으로 false가 됨
    }
  },

  highlightRange: function(range) {
    if (!range || range.collapsed) {
      return;
    }

    try {
      const span = document.createElement('span');
      span.style.backgroundColor = 'yellow';
      range.surroundContents(span);
      window.getSelection().removeAllRanges();
    } catch (e) {
      console.error("하이라이트 생성 중 오류 발생:", e);
      window.getSelection().removeAllRanges();
    }
  }
};

TapTap.highlight.init();

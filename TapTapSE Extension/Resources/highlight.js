// highlight.js
TapTap.highlight = {
  init: function() {
    document.body.addEventListener('click', this.handleHighlightClick.bind(this));
  },

  handleHighlightClick: function(event) {
    const wrapper = event.target.closest('.taptap-wrapper');
    if (!wrapper) return;

    // 더블 탭으로 인한 하이라이트 생성을 방지하기 위해, 이미 툴팁이 보이거나 메모 창이 열려있으면 아무것도 하지 않음
    if (TapTap.tooltip.element.style.display === 'block' || TapTap.tooltip.memoUIElement.style.display === 'flex') {
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();

    TapTap.tooltip.isReopening = true;

    const highlightId = wrapper.dataset.highlightId;
    const range = document.createRange();
    range.selectNode(wrapper);
    TapTap.tooltip.show(range, highlightId);

    // 플래그를 곧바로 다시 false로 바꾸면 selectionchange 이벤트가 툴팁을 닫을 수 있으므로,
    // 한 프레임 뒤에 실행하여 렌더링 사이클이 지난 후 플래그를 리셋합니다.
    requestAnimationFrame(() => {
      TapTap.tooltip.isReopening = false;
    });
  },

  highlightRange: function(range, color, highlightId = 'taptap-' + Math.random().toString(36).substr(2, 9)) {
    if (!range || range.collapsed) {
      return null;
    }
    
    try {
      const highlightedTextSpan = document.createElement('span');
      highlightedTextSpan.classList.add('taptap-highlighted');
      highlightedTextSpan.style.fontWeight = 'inherit !important';
      highlightedTextSpan.style.fontStyle = 'inherit !important';
      highlightedTextSpan.style.lineHeight = 'inherit !important';
      highlightedTextSpan.style.backgroundColor = color || 'yellow';
      highlightedTextSpan.style.cursor = 'pointer !important';
      highlightedTextSpan.setAttribute('highlightid', highlightId);
      
      const wrapper = document.createElement('div');
      wrapper.classList.add('taptap-wrapper');
      wrapper.setAttribute('data-highlight-id', highlightId);
      wrapper.style.display = 'inline';
      wrapper.style.position = 'relative';
      
      const contents = range.extractContents();
      highlightedTextSpan.appendChild(contents);
      wrapper.appendChild(highlightedTextSpan);
      
      range.insertNode(wrapper);
      window.getSelection().removeAllRanges();
      
      console.log("highlightRange - Highlight ID returned:", highlightId);
      return highlightId;
    } catch (e) {
      console.error("하이라이트 생성 중 오류 발생:", e);
      window.getSelection().removeAllRanges();
      return null;
    }
  },
  
  getHighlightElementById: function(id) {
    return document.querySelector(`div.taptap-wrapper[data-highlight-id="${id}"]`);
  },
  
  updateHighlightColor: function(id, color) {
    const wrapper = this.getHighlightElementById(id);
    if (wrapper) {
      const highlightedTextSpan = wrapper.querySelector('span.taptap-highlighted');
      if (highlightedTextSpan) {
        highlightedTextSpan.style.backgroundColor = color;
      }
    }
  },
  
  removeHighlight: function(id) {
    const wrapper = this.getHighlightElementById(id);
    if (wrapper) {
      const highlightedTextSpan = wrapper.querySelector('span.taptap-highlighted');
      while (highlightedTextSpan.firstChild) {
        wrapper.insertBefore(highlightedTextSpan.firstChild, highlightedTextSpan);
      }
      highlightedTextSpan.remove();
      const parent = wrapper.parentNode;
      while (wrapper.firstChild) {
        parent.insertBefore(wrapper.firstChild, wrapper);
      }
      wrapper.remove();
    }
  }
};

TapTap.highlight.init();
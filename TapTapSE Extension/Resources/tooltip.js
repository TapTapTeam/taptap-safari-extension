// tooltip.js
TapTap.tooltip = {
  element: null,
  memoUIElement: null,
  currentMemoHighlightId: null,

  init: function() {
    this.injectCSS('tooltip.css');
    this.element = document.createElement('div');
    this.element.id = 'taptap-tooltip';
    this.element.style.display = 'none';
    this.element.innerHTML = `
      <div style="width: 100%; height: 100%; padding: 4px; background: white; border-radius: 30px; justify-content: flex-start; align-items: center; gap: 6px; display: inline-flex">
        <div data-property-1="Selected" data-color="#F247ED" style="width: 50px; height: 40px; position: relative; border-radius: 20px">
          <div style="width: 50px; height: 40px; left: 0px; top: 0px; position: absolute; background: var(--Chip-pink, #FFE0F7); border-radius: 20px; border: 2px var(--Chip-pink-line, #F247ED) solid"></div>
        </div>
        <div data-property-1="Default" data-color="yellow" style="width: 50px; height: 40px; position: relative; border-radius: 20px">
          <div style="width: 50px; height: 40px; left: 0px; top: 0px; position: absolute; background: var(--Chip-yellow, #FEF8CD); border-radius: 20px; border: 2px var(--State-defaultLine, rgba(255, 255, 255, 0.40)) solid"></div>
        </div>
        <div data-property-1="Default" data-color="#87CEEB" style="width: 50px; height: 40px; position: relative; border-radius: 20px">
          <div style="width: 50px; height: 40px; left: 0px; top: 0px; position: absolute; background: var(--Chip-blue, #DBF3FF); border-radius: 20px; border: 2px var(--State-defaultLine, rgba(255, 255, 255, 0.40)) solid"></div>
        </div>
        <div data-property-1="pressed" data-action="memo" style="width: 50px; height: 40px; position: relative; border-radius: 20px">
          <div style="width: 50px; height: 40px; left: 0px; top: 0px; position: absolute; background: var(--Chip-memo, #DEDEE3); box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.04); overflow: hidden; border-radius: 20px; outline: 2px var(--Chip-memo, #DEDEE3) solid; outline-offset: -2px">
            <div style="width: 16px; height: 16px; left: 17px; top: 12px; position: absolute; background: var(--Chip-memo-icon, #5C5C6E)"></div>
          </div>
          <div style="width: 50px; height: 40px; left: 0px; top: 0px; position: absolute; background: var(--State-pressedDim, rgba(175.20, 175.06, 183.25, 0.50)); border-radius: 20px"></div>
          </div>
        </div>
      `;
    document.body.appendChild(this.element);

    this.memoUIElement = document.createElement('div');
    this.memoUIElement.classList.add('taptap-memo-ui');
    this.memoUIElement.style.display = 'none';
    this.memoUIElement.innerHTML = 
    `
      <textarea class="taptap-memo-input" placeholder="메모를 입력하세요..."></textarea>
    `;
    document.body.appendChild(this.memoUIElement);
    const memoTextarea = this.memoUIElement.querySelector('.taptap-memo-input');
    
    if (memoTextarea) {
      memoTextarea.addEventListener('blur', this.handleMemoBlur.bind(this));
    }

    this.element.addEventListener('mousedown', this.handleTooltipMouseDown.bind(this));
    document.addEventListener('click', this.handleExternalClick.bind(this), true);
  },

  handleTooltipMouseDown: function(event) {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target.closest('[data-color], [data-action]');
    if (!target) return;

    const color = target.dataset.color;
    const action = target.dataset.action;
    const selection = window.getSelection();

    if (color && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      TapTap.highlight.highlightRange(range, color);
      this.hide();
    } else if (action === 'memo' && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const highlightId = TapTap.highlight.highlightRange(range, 'yellow');
      console.log("메모 버튼 클릭 후 하이라이팅 됨", highlightId);
      if (highlightId) {
        requestAnimationFrame(() => {
          this.showMemoInput(highlightId);
        });
      }
    }
  },

  handleExternalClick: function(event) {
    if (this.element.style.display === 'block' && !this.element.contains(event.target)) {
      const selection = window.getSelection();
      if (selection.isCollapsed) {
          this.hide();
      }
    }

    if (this.memoUIElement.style.display === 'flex' && !this.memoUIElement.contains(event.target)) {
        this.hideMemoInput();
    }
  },

  handleMemoBlur: function(event) {
    const memoText = event.target.value;
    if (this.currentMemoHighlightId) {
        this.saveMemo(this.currentMemoHighlightId, memoText);
    }
    this.hideMemoInput();
  },

  injectCSS: function(file) {
    fetch(browser.runtime.getURL(file))
      .then(response => response.text())
      .then(css => {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
      })
      .catch(err => console.error("Failed to inject CSS:", err));
  },

  show: function(range) {
    if (!range) return;

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    this.element.style.display = 'block';
    this.element.style.top = (window.scrollY + rect.top - this.element.offsetHeight - 10) + 'px';
    this.element.style.left = (window.scrollX + rect.left + (rect.width / 2) - (this.element.offsetWidth / 2)) + 'px';
  },

  hide: function() {
    this.element.style.display = 'none';
  },

  showMemoInput: function(highlightId, initialMemoText = "") {
    console.log("showMemoInput called with highlightId:", highlightId);
    const wrapper = TapTap.highlight.getHighlightElementById(highlightId);
    console.log("Wrapper found:", wrapper);
    if (!wrapper) return;

    wrapper.appendChild(this.memoUIElement);
    const textarea = this.memoUIElement.querySelector('.taptap-memo-input');
    if (textarea) {
      textarea.value = initialMemoText;
      textarea.focus();
    }
    this.memoUIElement.style.display = 'flex';
    console.log("memoUIElement display style set to:", this.memoUIElement.style.display);
    this.currentMemoHighlightId = highlightId;
  },

  hideMemoInput: function() {
    this.memoUIElement.style.display = 'none';
    document.body.appendChild(this.memoUIElement); 
    this.currentMemoHighlightId = null;
  },

  // TODO: 실제 저장 로직은 store.js에서 구현 (지금은 콘솔 로그)
  saveMemo: function(highlightId, memoText) {
    console.log(`메모 저장! Highlight ID: ${highlightId}, 내용: "${memoText}"`);
  }
};

TapTap.tooltip.init();

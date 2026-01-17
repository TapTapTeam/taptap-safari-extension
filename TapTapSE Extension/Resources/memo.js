// memo.js
window.TapTap = window.TapTap || {};
TapTap.memo = {
  memoUIElement: null,

  init: function() {
    this.injectCSS('memo.css');
    this.memoUIElement = document.createElement('div');
    this.memoUIElement.id = 'memo-box';
    this.memoUIElement.style.display = 'none';
    this.memoUIElement.innerHTML = `
      <textarea class="capsule-input-textarea" placeholder="메모를 입력하세요."></textarea>
    `;
    document.body.appendChild(this.memoUIElement);
    
    this.memoUIElement.addEventListener('touchend', (e) => e.stopPropagation(), { capture: true });
    this.memoUIElement.addEventListener('touchstart', (e) => e.stopPropagation(), { capture: true });
    
    const memoTextarea = this.memoUIElement.querySelector('.capsule-input-textarea');
    if (memoTextarea) {
      memoTextarea.addEventListener('blur', this.handleMemoBlur.bind(this));
    }

    document.addEventListener('click', this.handleExternalClick.bind(this), true);
  },

  handleExternalClick: function(event) {
    if (this.memoUIElement.style.display === 'flex' && !this.memoUIElement.contains(event.target)) {
        this.hideMemoInput();
    }
  },

  handleMemoBlur: function(event) {
    const memoText = event.target.value.trim();
    if (!memoText) {
      this.hideMemoInput(); // 내용이 없어도, 포커스를 잃으면 창을 닫습니다.
      return;
    }
    
    const activeHighlightId = this.memoUIElement.dataset.activeHighlightId;
    if (activeHighlightId) {
      this.saveMemo(activeHighlightId, memoText);

      this.renderMemoCapsule(activeHighlightId, memoText);

      event.target.value = '';
      this.hideMemoInput(); // 내용 저장 후에도 창을 닫습니다.
    }
  },
  
  renderMemoCapsule: function(highlightId, memoText) {
    const wrapper = TapTap.highlight.getHighlightElementById(highlightId);
    if (!wrapper) return;

    // 캡슐들을 담을 컨테이너를 찾거나 새로 만듭니다.
    let capsuleContainer = wrapper.nextElementSibling;
    if (!capsuleContainer || !capsuleContainer.classList.contains('taptap-capsules-container')) {
      capsuleContainer = document.createElement('div');
      capsuleContainer.className = 'taptap-capsules-container';
      wrapper.parentNode.insertBefore(capsuleContainer, wrapper.nextSibling);
    }

    const highlightColor = TapTap.highlight.getHighlightColor(highlightId) || 'yellow';
    const normalized = TapTap.tooltip.normalizeColor(highlightColor);
    const memoId = 'memo-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);

    const capsule = document.createElement('div');
    capsule.className = 'memo-capsule';
    capsule.setAttribute('data-highlight-color', normalized);
    capsule.setAttribute('data-memo-id', memoId);

    capsule.innerHTML = `
      <span class="capsule-text"></span>
      <button class="capsule-delete-btn" type="button" aria-label="Delete memo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6 6L18 18" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    `;

    capsule.querySelector('.capsule-text').textContent = memoText;

    capsule.addEventListener('click', (e) => {
      if (e.target.closest('.capsule-delete-btn')) return;
      capsule.classList.toggle('clicked');
    });

    capsule.querySelector('.capsule-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      capsule.remove();
      // TODO: 실제 저장소에서도 삭제
    });

    capsuleContainer.appendChild(capsule);
  },
  
  showMemoInput: function(highlightId, initialMemoText = "") {
    const wrapper = TapTap.highlight.getHighlightElementById(highlightId);
    if (!wrapper) return;
    
    this.memoUIElement.dataset.activeHighlightId = highlightId;

    wrapper.parentNode.insertBefore(this.memoUIElement, wrapper.nextSibling);
    const textarea = this.memoUIElement.querySelector('.capsule-input-textarea');
    if (textarea) {
      textarea.value = initialMemoText;
      textarea.focus();
    }
    this.memoUIElement.style.display = 'flex';
  },

  hideMemoInput: function() {
    this.memoUIElement.style.display = 'none';
    this.memoUIElement.dataset.activeHighlightId = '';
    document.body.appendChild(this.memoUIElement); 
  },

  saveMemo: function(highlightId, memoText) {
    console.log(`메모 저장! Highlight ID: ${highlightId}, 내용: "${memoText}"`);
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
};

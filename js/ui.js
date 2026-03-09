/**
 * UI module — manages sidebar panel state, tab switching, and event delegation.
 * All callbacks are injected from main.js so this module stays decoupled from Three.js.
 */

// ─── Toast ────────────────────────────────────────────────────────────────────

export function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');

  // Remove any running animation by cloning
  const clone = toast.cloneNode(true);
  toast.replaceWith(clone);
  clone.classList.remove('hidden');

  // Auto-hide after animation
  setTimeout(() => clone.classList.add('hidden'), 2700);
}

// ─── Tank Shape Panel ─────────────────────────────────────────────────────────

export function initShapePanel(onShapeChange) {
  const labels = document.querySelectorAll('.shape-btn');
  labels.forEach(label => {
    label.addEventListener('click', () => {
      labels.forEach(l => l.classList.remove('active'));
      label.classList.add('active');
      const shape = label.dataset.shape;
      onShapeChange(shape);
    });
  });
}

// ─── Water Presets ────────────────────────────────────────────────────────────

export function initWaterPresets(onWaterChange) {
  const chips = document.querySelectorAll('#water-presets .color-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      onWaterChange({
        bg: chip.dataset.bg,
        fog: chip.dataset.fog,
        water: chip.dataset.water,
      });
    });
  });
}

// ─── Substrate Presets ────────────────────────────────────────────────────────

export function initSubstratePresets(onSubstrateChange) {
  const chips = document.querySelectorAll('#substrate-presets .color-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      onSubstrateChange(chip.dataset.substrate);
    });
  });
}

// ─── Effects Toggles ──────────────────────────────────────────────────────────

export function initEffectToggles({ onBubblesToggle, onCausticsToggle, onFogToggle }) {
  document.getElementById('toggle-bubbles').addEventListener('change', e => {
    onBubblesToggle(e.target.checked);
  });
  document.getElementById('toggle-caustics').addEventListener('change', e => {
    onCausticsToggle(e.target.checked);
  });
  document.getElementById('toggle-fog').addEventListener('change', e => {
    onFogToggle(e.target.checked);
  });
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('tab-' + tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });
}

// ─── Item Cards (right panel) ─────────────────────────────────────────────────

export function initItemCards(onItemAdd) {
  document.querySelectorAll('.item-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.type;
      const category = card.dataset.category;
      onItemAdd(type, category);

      // Brief pulse animation on the card
      card.style.transform = 'scale(0.92)';
      setTimeout(() => (card.style.transform = ''), 120);
    });
  });
}

// ─── Selection Bar ────────────────────────────────────────────────────────────

export function initSelectionBar({ onRemove, onRotate, onScaleUp, onScaleDown, onDeselect }) {
  document.getElementById('btn-remove').addEventListener('click', onRemove);
  document.getElementById('btn-rotate-left').addEventListener('click', onRotate);
  document.getElementById('btn-scale-up').addEventListener('click', onScaleUp);
  document.getElementById('btn-scale-down').addEventListener('click', onScaleDown);
  document.getElementById('btn-deselect').addEventListener('click', onDeselect);
}

export function showSelectionBar(label) {
  const bar = document.getElementById('selection-bar');
  bar.classList.remove('hidden');
  document.getElementById('selection-name').textContent = label;
}

export function hideSelectionBar() {
  document.getElementById('selection-bar').classList.add('hidden');
}

// ─── Placement hint ───────────────────────────────────────────────────────────

export function showPlacementHint(text) {
  const hint = document.getElementById('placement-hint');
  hint.textContent = text || 'Click inside the tank to place item';
  hint.classList.remove('hidden');
}

export function hidePlacementHint() {
  document.getElementById('placement-hint').classList.add('hidden');
}

// ─── Export / Share buttons ───────────────────────────────────────────────────

export function initExportButtons({ onExport, onShare }) {
  document.getElementById('btn-export').addEventListener('click', onExport);
  document.getElementById('btn-share').addEventListener('click', onShare);
}

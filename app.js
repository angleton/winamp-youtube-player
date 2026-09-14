const controls = {
  speed: document.querySelector('#speed-slider'),
  pitch: document.querySelector('#pitch-slider'),
  tempo: document.querySelector('#tempo-slider'),
  scrubber: document.querySelector('#scrubber'),
  volume: document.querySelector('#volume'),
  balance: document.querySelector('#balance'),
};

const valueDisplays = {
  speed: document.querySelector('#val-speed'),
  pitch: document.querySelector('#val-pitch'),
  tempo: document.querySelector('#val-tempo'),
};

const eventStatus = document.querySelector('#event-status');

function formatValue(controlName, value) {
  if (controlName === 'speed') return `${Number(value).toFixed(3)}x`;
  if (controlName === 'pitch') return `${Number(value).toFixed(1)} st`;
  if (controlName === 'tempo') return `${Number(value).toFixed(1)}%`;
  return value;
}

function announceEvent(detail) {
  const event = new CustomEvent('eramp:control', { detail });
  document.dispatchEvent(event);
  eventStatus.textContent = `Event: ${detail.type} (${detail.name})`;
}

function updateControl(controlName, value) {
  const control = controls[controlName];
  if (!control) return;

  control.value = value;
  if (valueDisplays[controlName]) {
    valueDisplays[controlName].textContent = formatValue(controlName, value);
  }
  announceEvent({ type: 'input', name: controlName, value: control.value });
}

document.querySelectorAll('[data-control]').forEach((control) => {
  control.addEventListener('input', () => {
    const controlName = control.dataset.control;
    if (valueDisplays[controlName]) {
      valueDisplays[controlName].textContent = formatValue(controlName, control.value);
    }
    announceEvent({ type: 'input', name: controlName, value: control.value });
  });

  control.addEventListener('change', () => {
    announceEvent({ type: 'change', name: control.dataset.control, value: control.value });
  });
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.speed) {
    document.querySelectorAll('[data-speed]').forEach((preset) => preset.classList.remove('active'));
    button.classList.add('active');
    updateControl('speed', button.dataset.speed);
  }

  if (button.dataset.track) {
    document.querySelectorAll('[data-track]').forEach((track) => track.classList.remove('active'));
    button.classList.add('active');
  }

  if (button.dataset.action?.startsWith('toggle-')) {
    const isActive = button.classList.toggle('active');
    button.setAttribute('aria-pressed', String(isActive));
  }

  announceEvent({
    type: 'click',
    name: button.dataset.action || button.dataset.track || button.textContent.trim(),
  });
});

document.querySelector('#btn-reset-all').addEventListener('click', () => {
  updateControl('speed', '1.00');
  updateControl('pitch', '0.0');
  updateControl('tempo', '0.0');
  document.querySelector('#chk-preserve-pitch').checked = true;
  announceEvent({ type: 'reset', name: 'all playback controls' });
});

// Application code can react here without coupling the controls to playback yet.
document.addEventListener('eramp:control', (event) => {
  console.debug('ErAMP control event', event.detail);
});
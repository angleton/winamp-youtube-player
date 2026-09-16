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
const favoritesSelect = document.querySelector('#favorites-select');
const playlistSourceRow = document.querySelector('#playlist-source-row');
const playlistList = document.querySelector('#playlist-list');
const playlistInfo = document.querySelector('#playlist-info');
const favoritesStorageKey = 'eramp:selected-favorites-list';
const youtubeLoginButton = document.querySelector('#youtube-login');
const youtubeAccountStorageKey = 'eramp:youtube-account-name';

const favoriteLists = [
  {
    id: 'favorites',
    name: 'Favorites',
    tracks: [
      { title: 'Retro Synthwave - ErAMP Theme', duration: '03:45' },
      { title: 'Chiptune Symphony No. 9', duration: '04:12' },
      { title: 'HTML5 & Wasm Audio Demo', duration: '02:30' },
      { title: 'Pitchfork High Precision Speed Test', duration: '05:00' },
    ],
  },
];

function formatPlaylistDuration(tracks) {
  const seconds = tracks.reduce((total, track) => {
    const [minutes, remainingSeconds] = track.duration.split(':').map(Number);
    return total + (minutes * 60) + remainingSeconds;
  }, 0);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function renderFavoritesList(listId) {
  const selectedList = favoriteLists.find((list) => list.id === listId) || favoriteLists[0];
  localStorage.setItem(favoritesStorageKey, selectedList.id);
  favoritesSelect.value = selectedList.id;
  playlistList.replaceChildren(...selectedList.tracks.map((track, index) => {
    const item = document.createElement('button');
    item.className = `playlist-item${index === 0 ? ' active' : ''}`;
    item.type = 'button';
    item.dataset.track = String(index + 1);
    item.textContent = `${index + 1}. ${track.title} [${track.duration}]`;
    return item;
  }));
  playlistInfo.textContent = `${selectedList.name.toUpperCase()} / ${selectedList.tracks.length} TRACKS / ${formatPlaylistDuration(selectedList.tracks)} TOTAL`;
  announceEvent({ type: 'playlist', name: selectedList.name });
}

function initializeFavorites() {
  favoritesSelect.replaceChildren(...favoriteLists.map((list) => {
    const option = document.createElement('option');
    option.value = list.id;
    option.textContent = list.name;
    return option;
  }));
  playlistSourceRow.hidden = favoriteLists.length < 2;
  const savedListId = localStorage.getItem(favoritesStorageKey);
  renderFavoritesList(favoriteLists.some((list) => list.id === savedListId) ? savedListId : favoriteLists[0].id);
}

function setYouTubeAccount(accountName) {
  const normalizedName = String(accountName || '').trim();
  if (!normalizedName) return;

  localStorage.setItem(youtubeAccountStorageKey, normalizedName);
  youtubeLoginButton.textContent = `${normalizedName} ErAMP`;
  youtubeLoginButton.dataset.tooltip = `Signed in as ${normalizedName}`;
  youtubeLoginButton.setAttribute('aria-label', `YouTube account: ${normalizedName}`);
}

function requestYouTubeLogin() {
  document.dispatchEvent(new CustomEvent('eramp:youtube-login-request'));
  announceEvent({ type: 'login', name: 'YouTube' });
}

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

favoritesSelect.addEventListener('change', () => {
  renderFavoritesList(favoritesSelect.value);
});

youtubeLoginButton.addEventListener('click', requestYouTubeLogin);

document.addEventListener('eramp:youtube-authenticated', (event) => {
  setYouTubeAccount(event.detail?.accountName);
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

initializeFavorites();
setYouTubeAccount(localStorage.getItem(youtubeAccountStorageKey));

// Application code can react here without coupling the controls to playback yet.
document.addEventListener('eramp:control', (event) => {
  console.debug('ErAMP control event', event.detail);
});
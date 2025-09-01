const startEl = document.getElementById('start');
const storyEl = document.getElementById('story');
const storyTextEl = document.getElementById('storyText');
const choicesEl = document.getElementById('choices');
const sceneImg = document.getElementById('sceneImage');
const themeToggle = document.getElementById('themeToggle');
const restartBtn = document.getElementById('restart');

let currentScreen = null;
let currentGenre = null;

document.querySelectorAll('.genre').forEach(btn => {
  btn.addEventListener('click', async () => {
    const genre = btn.dataset.genre;
    currentGenre = genre;
    await startStory(genre);
  });
});

restartBtn.addEventListener('click', () => {
  currentScreen = null;
  storyEl.classList.add('hidden');
  startEl.classList.remove('hidden');
});

themeToggle.addEventListener('click', () => {
  const mode = document.documentElement.dataset.theme;
  document.documentElement.dataset.theme = mode === 'light' ? 'dark' : 'light';
});

async function startStory(genre) {
  setLoading(true);
  try {
    const res = await fetch('/api/start-story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ genre }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');
    currentScreen = data;
    renderScreen(data);
    startEl.classList.add('hidden');
    storyEl.classList.remove('hidden');
  } catch (e) {
    alert(e.message || e);
  } finally {
    setLoading(false);
  }
}

function renderScreen(scr) {
  sceneImg.src = scr.landscapeURL || scr.portraitURL;
  sceneImg.alt = 'AI generated scene';
  storyTextEl.textContent = scr.storyText;
  choicesEl.innerHTML = '';
  (scr.userChoices || []).forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = typeof choice === 'string' ? choice : (choice.text || JSON.stringify(choice));
    btn.addEventListener('click', () => onChoose(btn.textContent));
    choicesEl.appendChild(btn);
  });
}

async function onChoose(choiceText) {
  if (!currentScreen) return;
  setLoading(true);
  try {
    const res = await fetch('/api/advance-story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ parentScreenID: currentScreen.screenID, choice: choiceText }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed');
    currentScreen = data;
    renderScreen(data);
  } catch (e) {
    alert(e.message || e);
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  document.body.style.cursor = isLoading ? 'wait' : 'default';
}


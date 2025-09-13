// script.js - Cobra (Snake) + Caça-palavras
// Autor: entregue ao usuário — pronto para rodar

// ----------------------------- UI TABS -----------------------------
const btnSnake = document.getElementById('btn-snake');
const btnWS = document.getElementById('btn-wordsearch');
const snakeSection = document.getElementById('game-snake');
const wsSection = document.getElementById('game-wordsearch');

btnSnake.addEventListener('click', () => {
  btnSnake.classList.add('active'); btnWS.classList.remove('active');
  snakeSection.classList.remove('hidden'); wsSection.classList.add('hidden');
});
btnWS.addEventListener('click', () => {
  btnWS.classList.add('active'); btnSnake.classList.remove('active');
  wsSection.classList.remove('hidden'); snakeSection.classList.add('hidden');
});

// ----------------------------- SNAKE (Cobra clássica) -----------------------------
const canvas = document.getElementById('snake-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('snake-score');
const btnPause = document.getElementById('snake-pause');
const btnRestart = document.getElementById('snake-restart');

let gridSize = 20; // pixels por célula
let cols = Math.floor(canvas.width / gridSize);
let rows = Math.floor(canvas.height / gridSize);

let snake;
let dir;
let food;
let gameInterval;
let speed = 120; // ms por frame
let paused = false;

function resetSnake() {
  cols = Math.floor(canvas.width / gridSize);
  rows = Math.floor(canvas.height / gridSize);
  snake = [{x: Math.floor(cols/2), y: Math.floor(rows/2)}];
  dir = {x:1,y:0};
  placeFood();
  scoreEl.textContent = 0;
  paused = false;
  btnPause.textContent = 'Pausar';
  speed = 120;
  startGameLoop();
}

function placeFood(){
  let ok=false;
  while(!ok){
    const fx = Math.floor(Math.random()*cols);
    const fy = Math.floor(Math.random()*rows);
    ok = !snake.some(s => s.x===fx && s.y===fy);
    if(ok) food = {x:fx,y:fy};
  }
}

function drawCell(x,y,fill){
  ctx.fillStyle = fill;
  ctx.fillRect(x*gridSize+1, y*gridSize+1, gridSize-2, gridSize-2);
}

function draw(){
  // fundo
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // comida
  drawCell(food.x, food.y, '#fb7185');
  // cobra
  for(let i=0;i<snake.length;i++){
    const s = snake[i];
    const color = i===0 ? '#06b6d4' : '#06b6d480';
    drawCell(s.x, s.y, color);
  }
}

function step(){
  if(paused) return;
  const head = {...snake[0], x: snake[0].x + dir.x, y: snake[0].y + dir.y};

  // teletransporte pelas bordas (wrap)
  if(head.x < 0) head.x = cols-1;
  if(head.x >= cols) head.x = 0;
  if(head.y < 0) head.y = rows-1;
  if(head.y >= rows) head.y = 0;

  // colisão com o corpo?
  if(snake.some(s => s.x===head.x && s.y===head.y)){
    // game over
    clearInterval(gameInterval);
    alert('Game over! Score: ' + (snake.length-1));
    resetSnake();
    return;
  }

  snake.unshift(head);

  // pegou comida?
  if(head.x === food.x && head.y === food.y){
    placeFood();
    scoreEl.textContent = snake.length-1;
    // aumenta velocidade gradual
    if(speed > 40){ speed -= 4; restartInterval(); }
  } else {
    snake.pop();
  }

  draw();
}

function startGameLoop(){
  clearInterval(gameInterval);
  gameInterval = setInterval(step, speed);
}
function restartInterval(){
  clearInterval(gameInterval);
  gameInterval = setInterval(step, speed);
}

btnPause.addEventListener('click', () => {
  paused = !paused;
  btnPause.textContent = paused ? 'Continuar' : 'Pausar';
});

btnRestart.addEventListener('click', resetSnake);

// controles teclado
const keyMap = {
  'ArrowUp':'up','ArrowDown':'down','ArrowLeft':'left','ArrowRight':'right',
  'w':'up','s':'down','a':'left','d':'right'
};
window.addEventListener('keydown', e => {
  const k = e.key;
  const dirName = keyMap[k];
  if(!dirName) return;
  setDirection(dirName);
});

// controles touch
document.querySelectorAll('.touch-controls button').forEach(btn=>{
  btn.addEventListener('click', () => setDirection(btn.dataset.dir));
});

function setDirection(name){
  const old = dir;
  const map = {
    up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0}
  };
  const nd = map[name];
  // evita inverter a direção
  if(nd.x + old.x === 0 && nd.y + old.y === 0) return;
  dir = nd;
}

// redimensionamento simples: mantém canvas fixo, mas recalcula cols/rows
canvas.addEventListener('click', ()=> canvas.focus());

// inicia snake
resetSnake();

// ----------------------------- WORDSEARCH (Caça-palavras) -----------------------------
const wsGridEl = document.getElementById('ws-grid');
const wsListEl = document.getElementById('ws-list');
const wsFoundCountEl = document.getElementById('ws-found-count');
const wsTotalCountEl = document.getElementById('ws-total-count');
const wsRestartBtn = document.getElementById('ws-restart');

let WS_COLS = 12;
let WS_ROWS = 12;
let letters = []; // matriz
let wordList = []; // palavras alvo
let foundWords = new Set();
let selection = []; // seleção atual [ {r,c}, ... ]
let cellEls = []; // elementos DOM por índice r*cols + c

// Lista exemplo (pode trocar)
const SAMPLE_WORDS = [
  'JAVASCRIPT','HTML','CSS','PYTHON','SNAKE','GAME','ALGORITMO',
  'FUNCAO','MATRIZ','ARRAY','LOGICA','DEBUG'
];

function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } }

// coloca palavras numa grade vazia (simples, tenta várias vezes)
function generateGrid(cols=WS_COLS, rows=WS_ROWS, words=SAMPLE_WORDS){
  WS_COLS = cols; WS_ROWS = rows;
  // inicializa com espaços
  letters = Array.from({length:rows}, ()=> Array.from({length:cols}, ()=> ''));
  const directions = [
    {dr:0,dc:1}, {dr:1,dc:0}, {dr:1,dc:1}, {dr:-1,dc:1}, {dr:0,dc:-1}, {dr:-1,dc:0}, {dr:-1,dc:-1}, {dr:1,dc:-1}
  ];
  wordList = words.slice(0, Math.min(words.length, 12));
  shuffle(wordList);

  // tenta inserir cada palavra
  for(const word of wordList){
    let placed=false;
    for(let attempt=0; attempt<200 && !placed; attempt++){
      const dir = directions[randInt(0,directions.length-1)];
      const r = randInt(0, rows-1);
      const c = randInt(0, cols-1);
      // checar se cabe
      let rr=r, cc=c;
      let ok=true;
      for(let i=0;i<word.length;i++){
        if(rr<0||rr>=rows||cc<0||cc>=cols){ ok=false; break; }
        const cur = letters[rr][cc];
        if(cur && cur !== word[i]){ ok=false; break; }
        rr += dir.dr; cc += dir.dc;
      }
      if(ok){
        // colocar
        rr=r; cc=c;
        for(let i=0;i<word.length;i++){
          letters[rr][cc]=word[i];
          rr += dir.dr; cc += dir.dc;
        }
        placed=true;
      }
    }
    if(!placed){
      // se falhar em colocar, remove da lista
      wordList = wordList.filter(w => w !== word);
    }
  }

  // preencher espaços vazios com letras aleatórias
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for(let i=0;i<rows;i++){
    for(let j=0;j<cols;j++){
      if(!letters[i][j]) letters[i][j] = alphabet[randInt(0,alphabet.length-1)];
    }
  }

  foundWords = new Set();
  renderGrid();
  renderWordList();
  wsFoundCountEl.textContent = foundWords.size;
  wsTotalCountEl.textContent = wordList.length;
}

function renderGrid(){
  wsGridEl.innerHTML = '';
  wsGridEl.style.gridTemplateColumns = `repeat(${WS_COLS}, 34px)`;
  cellEls = [];
  for(let r=0;r<WS_ROWS;r++){
    for(let c=0;c<WS_COLS;c++){
      const div = document.createElement('div');
      div.className = 'ws-cell';
      div.textContent = letters[r][c];
      div.dataset.r = r; div.dataset.c = c;
      wsGridEl.appendChild(div);
      cellEls.push(div);
      // evento click/touch
      div.addEventListener('click', () => handleCellClick(r,c));
      div.addEventListener('touchstart', (ev) => {
        ev.preventDefault();
        handleCellClick(r,c);
      }, {passive:false});
    }
  }
}

function renderWordList(){
  wsListEl.innerHTML = '';
  for(const w of wordList){
    const li = document.createElement('li');
    li.textContent = w;
    li.dataset.word = w;
    li.id = 'ws-word-'+w;
    wsListEl.appendChild(li);
  }
}

function handleCellClick(r,c){
  // seleção: se vazio, inicia; se já tem e é segunda seleção, tenta validar linha/col/diag entre os pontos
  if(selection.length === 0){
    selection.push({r,c});
    markSelection();
    return;
  } else if(selection.length === 1){
    selection.push({r,c});
    markSelection();
    checkSelection();
    return;
  } else {
    // reiniciar seleção com novo primeiro ponto
    selection = [{r,c}]; markSelection();
  }
}

function markSelection(){
  // limpa estilos
  cellEls.forEach(el => el.classList.remove('selected'));
  for(const s of selection){
    const idx = s.r*WS_COLS + s.c;
    if(cellEls[idx]) cellEls[idx].classList.add('selected');
  }
}

function checkSelection(){
  if(selection.length < 2) return;
  const a = selection[0], b = selection[1];
  const dr = Math.sign(b.r - a.r);
  const dc = Math.sign(b.c - a.c);

  // gerar coordenadas entre a e b
  let path = [];
  let rr = a.r, cc = a.c;
  while(true){
    path.push({r:rr,c:cc});
    if(rr === b.r && cc === b.c) break;
    rr += dr; cc += dc;
    // proteção: se não avança (diagonal invál), aborta loop
    if(path.length > Math.max(WS_COLS, WS_ROWS)*2) break;
  }

  // construir palavra da seleção (em ordem normal e reversa)
  const chars = path.map(p => letters[p.r][p.c]).join('');
  const rev = chars.split('').reverse().join('');

  // verificar se bate com uma das palavras (exact match)
  const found = wordList.find(w => w === chars || w === rev);
  if(found && !foundWords.has(found)){
    // marcar path como encontrado
    for(const p of path){
      const idx = p.r*WS_COLS + p.c;
      if(cellEls[idx]) cellEls[idx].classList.add('found');
    }
    foundWords.add(found);
    document.getElementById('ws-word-'+found).style.textDecoration = 'line-through';
    wsFoundCountEl.textContent = foundWords.size;
    // se acabou
    if(foundWords.size === wordList.length){
      setTimeout(()=> alert('Parabéns — você encontrou todas as palavras!'), 200);
    }
  } else {
    // se não encontrou, efeito breve de erro
    for(const p of path){
      const idx = p.r*WS_COLS + p.c;
      if(cellEls[idx]) {
        cellEls[idx].classList.add('selected');
        setTimeout(()=> cellEls[idx].classList.remove('selected'), 400);
      }
    }
  }
  // reset seleção
  selection = [];
  setTimeout(()=> markSelection(), 50);
}

// botão gerar novo
wsRestartBtn.addEventListener('click', () => {
  generateGrid(12, 12, SAMPLE_WORDS);
});

// inicia grid ao carregar
generateGrid(12,12,SAMPLE_WORDS);

// ----------------------------- Ajustes extras -----------------------------
// hacks: manter canvas responsivo (escala visual)
function resizeCanvasForDisplay(){
  const rect = canvas.getBoundingClientRect();
  // manter resolução alta em dispositivos retina
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.width * dpr); // manter quadrado
  gridSize = Math.max(12, Math.floor(canvas.width / 20)); // ajustar gridSize
  cols = Math.floor(canvas.width / gridSize);
  rows = Math.floor(canvas.height / gridSize);
  // reposiciona snake dentro da nova grade
  if(!snake || snake.length === 0) resetSnake();
}
window.addEventListener('resize', () => {
  // pouquíssimos cálculos para não quebrar a experiência
  // mantemos canvas CSS width em 400px do HTML, então aqui só atualizamos resolução
});

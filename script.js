const API_URL = 'https://dummyjson.com/quotes';
const BATCH_SIZE = 1000;

const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteBox = document.getElementById('quoteBox');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const dateDisplay = document.getElementById('dateDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const particlesContainer = document.getElementById('particles');
const confettiContainer = document.getElementById('confettiContainer');
const shownCountEl = document.getElementById('shownCount');
const totalCountEl = document.getElementById('totalCount');

let audioContext;
let allQuotes = [];
let shownQuotes = new Set();
let isLoading = false;

function updateDateTime() {
  const now = new Date();
  
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = now.toLocaleDateString('en-US', options);
  dateDisplay.textContent = formattedDate;
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  timeDisplay.textContent = formattedTime;
}

const themes = ['theme-purple', 'theme-pink', 'theme-blue', 'theme-green', 'theme-orange'];
let currentThemeIndex = 0;

function createParticles() {
  const particleCount = 30;
  const shapes = ['circle', 'square', 'triangle', 'star'];
  const animations = ['float', 'floatHorizontal', 'floatDiagonal'];
  const colors = [
    'rgba(102, 126, 234, 0.6)',
    'rgba(118, 75, 162, 0.6)',
    'rgba(240, 147, 251, 0.6)',
    'rgba(79, 172, 254, 0.6)',
    'rgba(0, 242, 254, 0.6)',
    'rgba(255, 215, 0, 0.6)',
    'rgba(255, 105, 180, 0.6)'
  ];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    particle.classList.add(shape);
    
    const size = Math.random() * 12 + 6;
    if (shape !== 'triangle') {
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
    }
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    if (shape === 'triangle') {
      particle.style.borderBottomColor = color;
    } else {
      particle.style.background = color;
    }
    
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.bottom = `${Math.random() * 100}%`;
    
    const animation = animations[Math.floor(Math.random() * animations.length)];
    particle.style.animation = `${animation} ${Math.random() * 10 + 15}s ease-in-out ${Math.random() * 20}s infinite`;
    
    particlesContainer.appendChild(particle);
  }
}

function changeTheme() {
  themes.forEach(theme => quoteBox.classList.remove(theme));
  
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  quoteBox.classList.add(themes[currentThemeIndex]);
}

function createExplosion() {
  const rect = quoteBox.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const particleCount = 30;
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#ffd700', '#ff69b4', '#10b981'];
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('explosion-particle');
    
    const size = Math.random() * 10 + 5;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = `${centerX}px`;
    particle.style.top = `${centerY}px`;
    
    const angle = (Math.PI * 2 * i) / particleCount;
    const velocity = Math.random() * 150 + 100;
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;
    
    particle.style.setProperty('--tx', `${tx}px`);
    particle.style.setProperty('--ty', `${ty}px`);
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 1500);
  }
}

function createConfetti() {
  const confettiCount = 50;
  const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#ffd700', '#ff69b4', '#7fffd4'];
  
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    
    const size = Math.random() * 8 + 5;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.animationDelay = `${Math.random() * 0.3}s`;
    confetti.style.animationDuration = `${Math.random() * 1 + 2}s`;
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    
    confettiContainer.appendChild(confetti);
    
    setTimeout(() => {
      confetti.remove();
    }, 3500);
  }
}

function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playClickSound() {
  initAudio();
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

async function fetchQuoteBatch() {
  if (isLoading) return;
  
  isLoading = true;
  
  try {
    const response = await fetch(`${API_URL}?limit=${BATCH_SIZE}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      mode: 'cors'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    allQuotes = data.quotes.map(q => ({
      content: q.quote,
      author: q.author
    })).filter(quote => quote && quote.content && quote.author);
    
    shownQuotes.clear();
    
    updateStats();
    
  } catch (error) {
    
    allQuotes = [
      { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
      { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
      { content: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
      { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
      { content: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
      { content: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
      { content: "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.", author: "Roy T. Bennett" },
      { content: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
      { content: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
      { content: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
      { content: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
      { content: "If life were predictable it would cease to be life, and be without flavor.", author: "Eleanor Roosevelt" },
      { content: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
      { content: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
      { content: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
      { content: "Many of life's failures are people who did not realize how close they were to success when they gave up.", author: "Thomas Edison" },
      { content: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
      { content: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
      { content: "You learn more from failure than from success. Don't let it stop you. Failure builds character.", author: "Unknown" },
      { content: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" },
      { content: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.", author: "Steve Jobs" },
      { content: "People who are crazy enough to think they can change the world, are the ones who do.", author: "Rob Siltanen" },
      { content: "Failure will never overtake me if my determination to succeed is strong enough.", author: "Og Mandino" },
      { content: "Entrepreneurs are great at dealing with uncertainty and also very good at minimizing risk. That's the classic great entrepreneur.", author: "Mohnish Pabrai" },
      { content: "We may encounter many defeats but we must not be defeated.", author: "Maya Angelou" },
      { content: "Knowing is not enough; we must apply. Wishing is not enough; we must do.", author: "Johann Wolfgang von Goethe" },
      { content: "Imagine your life is perfect in every respect; what would it look like?", author: "Brian Tracy" },
      { content: "We generate fears while we sit. We overcome them by action.", author: "Dr. Henry Link" },
      { content: "Whether you think you can or think you can't, you're right.", author: "Henry Ford" },
      { content: "Security is mostly a superstition. Life is either a daring adventure or nothing.", author: "Helen Keller" },
      { content: "The man who has confidence in himself gains the confidence of others.", author: "Hasidic Proverb" },
      { content: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
      { content: "Creativity is intelligence having fun.", author: "Albert Einstein" },
      { content: "What you lack in talent can be made up with desire, hustle and giving 110% all the time.", author: "Don Zimmer" },
      { content: "Do what you can with all you have, wherever you are.", author: "Theodore Roosevelt" },
      { content: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
      { content: "Try to be a rainbow in someone's cloud.", author: "Maya Angelou" },
      { content: "Do one thing every day that scares you.", author: "Eleanor Roosevelt" },
      { content: "It's no use going back to yesterday, because I was a different person then.", author: "Lewis Carroll" },
      { content: "Smart people learn from everything and everyone, average people from their experiences, stupid people already have all the answers.", author: "Socrates" },
      { content: "Do what you feel in your heart to be right – for you'll be criticized anyway.", author: "Eleanor Roosevelt" },
      { content: "Happiness is not by chance, but by choice.", author: "Jim Rohn" },
      { content: "You can't use up creativity. The more you use, the more you have.", author: "Maya Angelou" },
      { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { content: "If you want to lift yourself up, lift up someone else.", author: "Booker T. Washington" },
      { content: "I have learned over the years that when one's mind is made up, this diminishes fear.", author: "Rosa Parks" },
      { content: "I alone cannot change the world, but I can cast a stone across the water to create many ripples.", author: "Mother Teresa" },
      { content: "Nothing is impossible, the word itself says, 'I'm possible!'", author: "Audrey Hepburn" },
      { content: "The question isn't who is going to let me; it's who is going to stop me.", author: "Ayn Rand" }
    ];
    shownQuotes.clear();
  } finally {
    isLoading = false;
  }
}

function updateStats() {
  shownCountEl.textContent = shownQuotes.size;
  totalCountEl.textContent = allQuotes.length;
}

async function displayQuote() {
  if (allQuotes.length === 0) {
    await fetchQuoteBatch();
  }
  
  if (shownQuotes.size >= allQuotes.length) {
    await fetchQuoteBatch();
  }
  
  const unshownQuotes = allQuotes.filter((_, index) => !shownQuotes.has(index));
  
  if (unshownQuotes.length === 0) {
    await fetchQuoteBatch();
    return displayQuote();
  }
  
  const randomIndex = Math.floor(Math.random() * unshownQuotes.length);
  const selectedQuote = unshownQuotes[randomIndex];
  
  const originalIndex = allQuotes.findIndex(q => 
    q.content === selectedQuote.content && 
    q.author === selectedQuote.author
  );
  shownQuotes.add(originalIndex);
  
  quoteBox.classList.remove('show');
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  quoteText.textContent = selectedQuote.content;
  quoteAuthor.textContent = `— ${selectedQuote.author}`;
  
  updateStats();
  
  setTimeout(() => {
    quoteBox.classList.add('show');
    createConfetti();
  }, 100);
}

newQuoteBtn.addEventListener('click', () => {
  playClickSound();
  createExplosion();
  changeTheme();
  displayQuote();
});

window.addEventListener('load', async () => {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  
  createParticles();
  
  quoteBox.classList.add(themes[currentThemeIndex]);
  
  await fetchQuoteBatch();
  await displayQuote();
});

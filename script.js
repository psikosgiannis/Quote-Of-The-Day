// API endpoint for random quotes
const API_URL = 'https://api.quotable.io/random';

// Get DOM elements
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const quoteBox = document.getElementById('quoteBox');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const dateDisplay = document.getElementById('dateDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const particlesContainer = document.getElementById('particles');
const confettiContainer = document.getElementById('confettiContainer');

// Create AudioContext for click sound
let audioContext;
let clickSoundBuffer;

// Update date and time display
function updateDateTime() {
  const now = new Date();
  
  // Format date
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = now.toLocaleDateString('en-US', options);
  dateDisplay.textContent = formattedDate;
  
  // Format time
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  timeDisplay.textContent = formattedTime;
}

// Theme colors for quote box
const themes = ['theme-purple', 'theme-pink', 'theme-blue', 'theme-green', 'theme-orange'];
let currentThemeIndex = 0;

// Create floating particles with random shapes
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

// Change quote box theme
function changeTheme() {
  themes.forEach(theme => quoteBox.classList.remove(theme));
  
  currentThemeIndex = (currentThemeIndex + 1) % themes.length;
  quoteBox.classList.add(themes[currentThemeIndex]);
}

// Create explosion particles from quote box
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

// Create confetti effect
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

// Initialize Audio Context
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Generate click sound using Web Audio API
function playClickSound() {
  initAudio();
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Create a pleasant click sound
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Fetch quote from API
async function fetchQuote() {
  try {
    // Remove show class for exit animation
    quoteBox.classList.remove('show');
    
    // Wait for exit animation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const response = await fetch(API_URL, {
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
    
    // Update quote text and author
    quoteText.textContent = data.content;
    quoteAuthor.textContent = `— ${data.author}`;
    
    // Add show class for entrance animation
    setTimeout(() => {
      quoteBox.classList.add('show');
      createConfetti();
    }, 100);
    
  } catch (error) {
    console.error('Error fetching quote:', error.message || error);
    
    // Fallback quotes array in case API fails
    const fallbackQuotes = [
      { content: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
      { content: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
      { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
      { content: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
      { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
      { content: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
      { content: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
      { content: "Believe in yourself. You are braver than you think, more talented than you know, and capable of more than you imagine.", author: "Roy T. Bennett" },
      { content: "I learned that courage was not the absence of fear, but the triumph over it.", author: "Nelson Mandela" },
      { content: "The only impossible journey is the one you never begin.", author: "Tony Robbins" }
    ];
    
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    quoteText.textContent = randomQuote.content;
    quoteAuthor.textContent = `— ${randomQuote.author}`;
    quoteBox.classList.add('show');
  }
}

// Event listener for the button
newQuoteBtn.addEventListener('click', () => {
  playClickSound();
  createExplosion();
  changeTheme();
  fetchQuote();
});

// Show initial quote box with animation on page load
window.addEventListener('load', () => {
  // Initialize and update date/time
  updateDateTime();
  setInterval(updateDateTime, 1000);
  
  // Create floating particles
  createParticles();
  
  // Set initial theme
  quoteBox.classList.add(themes[currentThemeIndex]);
  
  // Show quote box
  setTimeout(() => {
    quoteBox.classList.add('show');
  }, 500);
});

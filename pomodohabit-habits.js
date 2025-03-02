/**
 * gamification.js - Controls the achievements and rewards system
 * Updated with collapsible achievements list
 */

// Gamification state
const GamificationState = {
  points: 0,
  level: 1,
  achievements: [],
  pointsToNextLevel: 100
};

// DOM elements
const gamificationElements = {
  pointsDisplay: document.getElementById('points'),
  levelDisplay: document.getElementById('level'),
  progressBar: document.getElementById('progress-bar'),
  achievementsList: document.getElementById('achievements-list'),
  achievementsCount: document.getElementById('achievements-count'),
  viewMoreBtn: document.getElementById('view-more-btn'),
  confettiCanvas: document.getElementById('confetti-canvas')
};

/**
 * Adds points to the user's score
 * @param {number} points - Number of points to add
 */
function addPoints(points) {
  GamificationState.points += points;
  
  // Update points display with animation
  if (gamificationElements.pointsDisplay) {
    gamificationElements.pointsDisplay.textContent = `Points: ${GamificationState.points}`;
    gamificationElements.pointsDisplay.classList.add('point-animation');
    
    // Remove animation class after animation completes
    setTimeout(() => {
      gamificationElements.pointsDisplay.classList.remove('point-animation');
    }, 500);
  }
  
  // Check for level up
  checkLevelUp();
  
  // Check for point-based achievements
  checkPointAchievements();
  
  // Save state
  saveGamificationState();
}

/**
 * Checks if user has leveled up and updates UI accordingly
 */
function checkLevelUp() {
  const nextLevel = GamificationState.level + 1;
  const pointsRequired = nextLevel * 100; // Each level requires 100 more points
  
  // Update progress bar
  if (gamificationElements.progressBar) {
    const progressPercentage = (GamificationState.points / pointsRequired) * 100;
    gamificationElements.progressBar.style.width = `${Math.min(100, progressPercentage)}%`;
  }
  
  // Level up if enough points
  if (GamificationState.points >= pointsRequired) {
    GamificationState.level = nextLevel;
    
    if (gamificationElements.levelDisplay) {
      gamificationElements.levelDisplay.textContent = `Level: ${GamificationState.level}`;
    }
    
    // Add level up achievement
    addAchievement(`Leveled up to Level ${GamificationState.level}!`, 'level-up');
    
    // Trigger confetti celebration
    triggerConfetti();
  }
}

/**
 * Checks for achievements based on point milestones
 */
function checkPointAchievements() {
  const pointMilestones = [50, 100, 250, 500, 1000, 2500];
  
  pointMilestones.forEach(milestone => {
    if (GamificationState.points >= milestone && !hasAchievement(`${milestone} Points`)) {
      addAchievement(`Achievement Unlocked: ${milestone} Points!`, 'points');
    }
  });
}

/**
 * Adds a new achievement
 * @param {string} text - Achievement text
 * @param {string} type - Type of achievement (points, streak, milestone, etc.)
 */
function addAchievement(text, type = 'general') {
  // Check for duplicates
  if (hasAchievement(text)) {
    return;
  }
  
  // Create achievement object
  const achievement = {
    text: text,
    type: type,
    date: new Date(),
    icon: getAchievementIcon(type)
  };
  
  // Add to achievements array
  GamificationState.achievements.push(achievement);
  
  // Add to UI with animation
  renderAchievement(achievement);
  
  // Update achievements count
  if (gamificationElements.achievementsCount) {
    gamificationElements.achievementsCount.textContent = `(${GamificationState.achievements.length})`;
  }
  
  // Save state
  saveGamificationState();
  
  // If this is a welcome achievement, add some starter achievements
  if (text.includes('Welcome to PomodoHabit')) {
    addStarterAchievements();
  }
}

/**
 * Adds some starter achievements for new users
 */
function addStarterAchievements() {
  // Only add starter achievements if we have just one achievement (the welcome one)
  if (GamificationState.achievements.length === 1) {
    setTimeout(() => {
      addAchievement('Setup complete! Ready to build habits!', 'milestone');
      addAchievement('First timer session awaits!', 'general');
      addPoints(25); // Give starting points
    }, 500);
  }
}

/**
 * Gets icon for achievement type
 * @param {string} type - Type of achievement
 * @returns {string} - Icon character
 */
function getAchievementIcon(type) {
  switch (type) {
    case 'points':
      return '🎯';
    case 'streak':
      return '🔥';
    case 'level-up':
      return '⭐';
    case 'milestone':
      return '🏆';
    default:
      return '🎉';
  }
}

/**
 * Renders a single achievement in the UI
 * @param {Object} achievement - Achievement object
 */
function renderAchievement(achievement) {
  if (!gamificationElements.achievementsList) {
    return;
  }
  
  const li = document.createElement('li');
  const date = new Date(achievement.date);
  
  li.innerHTML = `
    <span class="achievement-icon">${achievement.icon}</span>
    <span class="achievement-text">${achievement.text}</span>
    <span class="achievement-date">${date.toLocaleDateString()}</span>
  `;
  
  // Add with animation
  li.style.opacity = '0';
  gamificationElements.achievementsList.prepend(li);
  
  setTimeout(() => {
    li.style.transition = 'opacity 0.5s ease';
    li.style.opacity = '1';
  }, 10);
}

/**
 * Renders all achievements in the UI
 */
function renderAchievements() {
  if (!gamificationElements.achievementsList) {
    console.warn('Achievements list element not found');
    return;
  }
  
  gamificationElements.achievementsList.innerHTML = '';
  
  if (GamificationState.achievements.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Complete tasks to earn achievements!';
    emptyMessage.className = 'empty-message';
    gamificationElements.achievementsList.appendChild(emptyMessage);
    
    // Hide the view more button if no achievements
    if (gamificationElements.viewMoreBtn) {
      gamificationElements.viewMoreBtn.style.display = 'none';
    }
    
    return;
  }
  
  // Show the view more button
  if (gamificationElements.viewMoreBtn) {
    gamificationElements.viewMoreBtn.style.display = 'block';
  }
  
  // Update achievement count
  if (gamificationElements.achievementsCount) {
    gamificationElements.achievementsCount.textContent = `(${GamificationState.achievements.length})`;
  }
  
  // Sort achievements by date (newest first)
  const sortedAchievements = [...GamificationState.achievements]
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Render each achievement
  sortedAchievements.forEach(achievement => {
    renderAchievement(achievement);
  });
}

/**
 * Checks if a specific achievement already exists
 * @param {string} text - Achievement text to check for
 * @returns {boolean} - True if achievement exists
 */
function hasAchievement(text) {
  return GamificationState.achievements.some(a => a.text.includes(text));
}

/**
 * Creates a confetti celebration effect
 */
function triggerConfetti() {
  // Simple confetti effect using canvas
  const canvas = gamificationElements.confettiCanvas;
  if (!canvas) {
    console.warn('Confetti canvas not found');
    return;
  }
  
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Confetti pieces
  const confetti = [];
  const confettiCount = 150;
  const gravity = 0.5;
  const colors = ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'];
  
  // Create confetti pieces
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 2 * Math.PI,
      speed: Math.random() * 3 + 2,
      rotationSpeed: Math.random() * 0.2 - 0.1,
      horizontalSpeed: Math.random() * 5 - 2.5
    });
  }
  
  // Animation function
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let stillFalling = false;
    
    confetti.forEach(piece => {

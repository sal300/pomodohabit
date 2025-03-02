/**
 * pomodohabit-init.js - Coordinates the initialization and communication between all modules
 */

// Create global namespaces for app components
window.PomodoHabit = window.PomodoHabit || {};
window.habits = window.habits || [];
window.GamificationState = window.GamificationState || {
  points: 0,
  level: 1,
  achievements: [],
  pointsToNextLevel: 100
};
window.TimerState = window.TimerState || {
  workDuration: 25,
  breakDuration: 5,
  timeRemaining: 25 * 60,
  isRunning: false,
  isWorkSession: true,
  completedSessions: 0,
  interval: null,
  activeHabitId: null
};

// Element references containers
window.habitElements = {};
window.gamificationElements = {};
window.timerElements = {};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded - running script coordinator');
  
  // Initialize all DOM references
  initializeDOMReferences();
  
  // Set up global function bridges between modules
  setupFunctionBridges();
  
  // Initialize app components
  initializeComponents();
  
  // Set up event listeners
  setupEventListeners();
  
  console.log('PomodoHabit initialization coordinator complete');
});

/**
 * Initialize all DOM references for the app
 */
function initializeDOMReferences() {
  console.log('Initializing DOM references');
  
  // Habit tracker elements
  window.habitElements = {
    form: document.getElementById('habit-form'),
    input: document.getElementById('habit-input'),
    list: document.getElementById('habit-list'),
    editModal: document.getElementById('edit-modal'),
    editForm: document.getElementById('edit-habit-form'),
    editNameInput: document.getElementById('edit-habit-name'),
    editIndexInput: document.getElementById('edit-habit-index'),
    deleteButton: document.getElementById('delete-habit-btn'),
    closeButton: document.querySelector('.close')
  };
  
  // Gamification elements
  window.gamificationElements = {
    pointsDisplay: document.getElementById('points'),
    levelDisplay: document.getElementById('level'),
    progressBar: document.getElementById('progress-bar'),
    achievementsList: document.getElementById('achievements-list'),
    achievementsCount: document.getElementById('achievements-count'),
    viewMoreBtn: document.getElementById('view-more-btn'),
    confettiCanvas: document.getElementById('confetti-canvas')
  };
  
  // Timer elements
  window.timerElements = {
    display: document.getElementById('timer-display'),
    sessionType: document.getElementById('session-type'),
    startBtn: document.getElementById('start-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    resetBtn: document.getElementById('reset-btn'),
    setTimerBtn: document.getElementById('set-timer-btn'),
    workDurationInput: document.getElementById('work-duration'),
    breakDurationInput: document.getElementById('break-duration'),
    habitSelect: document.getElementById('habit-select')
  };
  
  // Tab elements
  window.tabElements = {
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content')
  };
}

/**
 * Set up function bridges to ensure all modules can communicate
 */
function setupFunctionBridges() {
  console.log('Setting up function bridges between modules');
  
  // Create fallback implementations for key functions
  // This ensures the app won't break if a function is missing
  
  // Habits module functions
  if (!window.renderHabits) {
    window.renderHabits = function() {
      console.warn('renderHabits called but not properly implemented');
      if (typeof PomodoHabit.renderHabits === 'function') {
        return PomodoHabit.renderHabits();
      }
    };
  }
  
  if (!window.saveHabits) {
    window.saveHabits = function() {
      console.warn('saveHabits called but not properly implemented');
      localStorage.setItem('habits', JSON.stringify(window.habits));
    };
  }
  
  if (!window.loadHabits) {
    window.loadHabits = function() {
      console.warn('loadHabits called but not properly implemented');
      try {
        const savedHabits = JSON.parse(localStorage.getItem('habits'));
        if (savedHabits && Array.isArray(savedHabits)) {
          window.habits = savedHabits;
        } else {
          addSampleHabits();
        }
      } catch (e) {
        console.error('Error loading habits:', e);
        addSampleHabits();
      }
    };
  }
  
  if (!window.createHabit) {
    window.createHabit = function(name) {
      return {
        id: Date.now().toString(),
        name: name,
        streak: 0,
        sessions: 0,
        longestStreak: 0,
        created: new Date(),
        lastCompleted: null,
        history: []
      };
    };
  }
  
  // Gamification module functions
  if (!window.addAchievement) {
    window.addAchievement = function(text, type) {
      console.warn('addAchievement called but not properly implemented');
      if (!window.GamificationState.achievements) window.GamificationState.achievements = [];
      
      window.GamificationState.achievements.push({
        text: text,
        type: type || 'general',
        date: new Date(),
        icon: '🎉'
      });
      
      localStorage.setItem('gamification', JSON.stringify(window.GamificationState));
    };
  }
  
  if (!window.addPoints) {
    window.addPoints = function(points) {
      console.warn('addPoints called but not properly implemented');
      window.GamificationState.points += points;
      localStorage.setItem('gamification', JSON.stringify(window.GamificationState));
    };
  }
  
  if (!window.hasAchievement) {
    window.hasAchievement = function(text) {
      if (!window.GamificationState.achievements) return false;
      return window.GamificationState.achievements.some(a => a.text.includes(text));
    };
  }
  
  if (!window.renderAchievements) {
    window.renderAchievements = function() {
      console.warn('renderAchievements called but not properly implemented');
      if (typeof PomodoHabit.renderAchievements === 'function') {
        return PomodoHabit.renderAchievements();
      }
    };
  }
  
  if (!window.loadGamificationState) {
    window.loadGamificationState = function() {
      console.warn('loadGamificationState called but not properly implemented');
      try {
        const savedState = JSON.parse(localStorage.getItem('gamification'));
        if (savedState) {
          window.GamificationState = savedState;
        }
      } catch (e) {
        console.error('Error loading gamification state:', e);
      }
    };
  }
  
  // Timer module functions
  if (!window.updateHabitDropdown) {
    window.updateHabitDropdown = function() {
      console.warn('updateHabitDropdown called but not properly implemented');
      if (typeof PomodoHabit.updateHabitDropdown === 'function') {
        return PomodoHabit.updateHabitDropdown();
      }
    };
  }
  
  if (!window.loadTimerState) {
    window.loadTimerState = function() {
      console.warn('loadTimerState called but not properly implemented');
      try {
        const savedState = JSON.parse(localStorage.getItem('timerState'));
        if (savedState) {
          window.TimerState = {...window.TimerState, ...savedState};
        }
      } catch (e) {
        console.error('Error loading timer state:', e);
      }
    };
  }
}

/**
 * Initialize all app components
 */
function initializeComponents() {
  console.log('Initializing app components');
  
  // First load all data
  if (typeof window.loadGamificationState === 'function') {
    window.loadGamificationState();
  }
  
  if (typeof window.loadHabits === 'function') {
    window.loadHabits();
  }
  
  if (typeof window.loadTimerState === 'function') {
    window.loadTimerState();
  }
  
  // Add welcome achievement if first visit
  if (typeof window.hasAchievement === 'function' && 
      !window.hasAchievement('Welcome') &&
      typeof window.addAchievement === 'function') {
    window.addAchievement('Welcome to PomodoHabit!', 'milestone');
  }
  
  // Set up initial tab
  setupTabs();
  
  // Render UI components
  if (typeof window.renderHabits === 'function') {
    window.renderHabits();
  }
  
  if (typeof window.renderAchievements === 'function') {
    window.renderAchievements();
  }
  
  if (typeof window.updateHabitDropdown === 'function') {
    window.updateHabitDropdown();
  }
}

/**
 * Set up tab navigation
 */
function setupTabs() {
  console.log('Setting up tab navigation');
  
  const tabButtons = window.tabElements.tabButtons;
  const tabContents = window.tabElements.tabContents;
  
  // Define the mapping between tab buttons and content sections
  const tabMap = {
    'timer': 'timer-section',
    'habits': 'habit-section',
    'achievements': 'gamification-section'
  };
  
  // Load the active tab from localStorage or default to timer
  const savedTab = localStorage.getItem('activeTab') || 'timer';
  
  // Set the active tab
  setActiveTab(savedTab);
  
  // Add click event listeners to tab buttons
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      setActiveTab(tabName);
      localStorage.setItem('activeTab', tabName);
    });
  });
  
  function setActiveTab(tabName) {
    console.log('Setting active tab to:', tabName);
    
    // Update tab buttons
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Update tab content using the mapping
    tabContents.forEach(content => {
      if (content.id === tabMap[tabName]) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
    
    // Refresh content based on active tab
    refreshActiveTabContent(tabName);
  }
}

/**
 * Refresh the content of the active tab
 */
function refreshActiveTabContent(tabName) {
  console.log('Refreshing content for tab:', tabName);
  
  switch (tabName) {
    case 'habits':
      if (typeof window.renderHabits === 'function') {
        window.renderHabits();
      }
      break;
      
    case 'achievements':
      if (typeof window.renderAchievements === 'function') {
        window.renderAchievements();
      }
      break;
      
    case 'timer':
      if (typeof window.updateHabitDropdown === 'function') {
        window.updateHabitDropdown();
      }
      break;
  }
}

/**
 * Set up event listeners for the app
 */
function setupEventListeners() {
  console.log('Setting up event listeners');
  
  // View more button for achievements
  if (window.gamificationElements.viewMoreBtn.textContent = 'View Less';
      }
    });
  }
  
  // Habit form submission
  if (window.habitElements.form) {
    window.habitElements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const habitName = window.habitElements.input.value.trim();
      
      if (habitName) {
        const habit = window.createHabit(habitName);
        window.habits.push(habit);
        window.saveHabits();
        window.renderHabits();
        window.habitElements.input.value = '';
        
        // First habit achievement
        if (window.habits.length === 1 && typeof window.addAchievement === 'function') {
          window.addAchievement('First habit created! Your journey begins!', 'milestone');
        }
      }
    });
  }
  
  // Habit list click delegation
  if (window.habitElements.list) {
    window.habitElements.list.addEventListener('click', (e) => {
      if (e.target.classList.contains('log-btn')) {
        const index = parseInt(e.target.dataset.index, 10);
        if (typeof window.incrementHabit === 'function') {
          window.incrementHabit(index);
        }
      } else if (e.target.classList.contains('edit-btn')) {
        const index = parseInt(e.target.dataset.index, 10);
        if (typeof window.showEditModal === 'function') {
          window.showEditModal(index);
        }
      }
    });
  }
  
  // Add other event listeners as needed
  setupTimerEventListeners();
  setupModalEventListeners();
}

/**
 * Set up event listeners for the timer
 */
function setupTimerEventListeners() {
  if (window.timerElements.startBtn) {
    window.timerElements.startBtn.addEventListener('click', () => {
      if (typeof window.startTimer === 'function') {
        window.startTimer();
      }
    });
  }
  
  if (window.timerElements.pauseBtn) {
    window.timerElements.pauseBtn.addEventListener('click', () => {
      if (typeof window.pauseTimer === 'function') {
        window.pauseTimer();
      }
    });
  }
  
  if (window.timerElements.resetBtn) {
    window.timerElements.resetBtn.addEventListener('click', () => {
      if (typeof window.resetTimer === 'function') {
        window.resetTimer();
      }
    });
  }
  
  if (window.timerElements.setTimerBtn) {
    window.timerElements.setTimerBtn.addEventListener('click', () => {
      if (typeof window.setTimerForSession === 'function') {
        // Pause timer first
        if (typeof window.pauseTimer === 'function') {
          window.pauseTimer();
        }
        
        // Apply new settings
        window.TimerState.isWorkSession = true;
        window.TimerState.workDuration = Math.max(1, parseInt(window.timerElements.workDurationInput.value, 10));
        window.TimerState.breakDuration = Math.max(1, parseInt(window.timerElements.breakDurationInput.value, 10));
        
        window.setTimerForSession();
      }
    });
  }
  
  if (window.timerElements.habitSelect) {
    window.timerElements.habitSelect.addEventListener('change', (e) => {
      const selectedIndex = e.target.value;
      window.TimerState.activeHabitId = selectedIndex === '' ? null : parseInt(selectedIndex, 10);
      
      if (typeof window.saveTimerState === 'function') {
        window.saveTimerState();
      } else {
        localStorage.setItem('timerState', JSON.stringify(window.TimerState));
      }
    });
  }
}

/**
 * Set up event listeners for modals
 */
function setupModalEventListeners() {
  // Edit form submission
  if (window.habitElements.editForm) {
    window.habitElements.editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const index = parseInt(window.habitElements.editIndexInput.value, 10);
      const newName = window.habitElements.editNameInput.value.trim();
      
      if (newName && index >= 0 && index < window.habits.length) {
        window.habits[index].name = newName;
        window.saveHabits();
        window.renderHabits();
        
        if (typeof window.closeEditModal === 'function') {
          window.closeEditModal();
        } else {
          window.habitElements.editModal.style.display = 'none';
        }
      }
    });
  }
  
  // Delete button
  if (window.habitElements.deleteButton) {
    window.habitElements.deleteButton.addEventListener('click', () => {
      const index = parseInt(window.habitElements.editIndexInput.value, 10);
      
      if (confirm('Are you sure you want to delete this habit?')) {
        window.habits.splice(index, 1);
        window.saveHabits();
        window.renderHabits();
        
        if (typeof window.closeEditModal === 'function') {
          window.closeEditModal();
        } else {
          window.habitElements.editModal.style.display = 'none';
        }
      }
    });
  }
  
  // Close button
  if (window.habitElements.closeButton) {
    window.habitElements.closeButton.addEventListener('click', () => {
      if (typeof window.closeEditModal === 'function') {
        window.closeEditModal();
      } else {
        window.habitElements.editModal.style.display = 'none';
      }
    });
  }
  
  // Click outside modal
  window.addEventListener('click', (e) => {
    if (e.target === window.habitElements.editModal) {
      if (typeof window.closeEditModal === 'function') {
        window.closeEditModal();
      } else {
        window.habitElements.editModal.style.display = 'none';
      }
    }
  });
}

// Add a function to clear all data for testing
window.clearAllData = function() {
  if (confirm('Are you sure you want to clear all app data? This cannot be undone.')) {
    localStorage.clear();
    window.location.reload();
  }
};

// Expose functions globally
window.PomodoHabit.initializeComponents = initializeComponents;
window.PomodoHabit.refreshActiveTabContent = refreshActiveTabContent;
window.PomodoHabit.initializeDOMReferences = initializeDOMReferences;Btn && window.gamificationElements.achievementsList) {
    window.gamificationElements.viewMoreBtn.addEventListener('click', () => {
      window.gamificationElements.achievementsList.classList.toggle('collapsed');
      
      if (window.gamificationElements.achievementsList.classList.contains('collapsed')) {
        window.gamificationElements.viewMoreBtn.textContent = 'View More';
      } else {
        window.gamificationElements.viewMore

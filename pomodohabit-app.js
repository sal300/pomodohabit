/**
 * app.js - Main application file that initializes and connects all components
 */

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // First, set up tab navigation structure
  setupTabNavigation();
  
  // Then initialize the app data and components
  initializeApp();
});

/**
 * Initializes the application
 */
function initializeApp() {
  // Load saved data from localStorage
  loadGamificationState();
  loadHabits();
  loadTimerState();
  
  // Add welcome achievement if first visit
  if (!hasAchievement('Welcome')) {
    addAchievement('Welcome to PomodoHabit!', 'milestone');
  }
  
  // Set up service worker for PWA functionality
  setupServiceWorker();
  
  // Set up view more button for achievements
  setupAchievementsViewMore();
  
  // Ensure habit dropdown is updated
  updateHabitDropdown();
  
  // Make sure to render habits and achievements on initial load
  renderHabits();
  renderAchievements();
  
  console.log('PomodoHabit initialized successfully!');
}

/**
 * Sets up tab navigation functionality
 */
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Fix tab mapping
  const tabMap = {
    'timer': 'timer-section',
    'habits': 'habit-section',
    'achievements': 'gamification-section'
  };
  
  // Load the active tab from localStorage or default to timer
  const savedTab = localStorage.getItem('activeTab') || 'timer';
  setActiveTab(savedTab);
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      setActiveTab(tabName);
      
      // When switching tabs, ensure content is refreshed
      refreshTabContent(tabName);
      
      // Save active tab to localStorage
      localStorage.setItem('activeTab', tabName);
    });
  });
  
  function setActiveTab(tabName) {
    // Update tab buttons
    tabButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Update tab content using the corrected mapping
    tabContents.forEach(content => {
      if (content.id === tabMap[tabName]) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
    
    // Refresh the content of the active tab
    refreshTabContent(tabName);
  }
  
  // Initial loading of tab content
  refreshTabContent(savedTab);
}

/**
 * Refreshes the content of a specific tab
 * @param {string} tabName - Name of the tab to refresh
 */
function refreshTabContent(tabName) {
  // Refresh specific tab content
  switch (tabName) {
    case 'habits':
      // Force re-render of habits
      if (typeof renderHabits === 'function') {
        renderHabits();
      }
      break;
      
    case 'achievements':
      // Force re-render of achievements
      if (typeof renderAchievements === 'function') {
        renderAchievements();
      }
      break;
      
    case 'timer':
      // Update the habit dropdown in the timer section
      if (typeof updateHabitDropdown === 'function') {
        updateHabitDropdown();
      }
      break;
  }
}

/**
 * Sets up the "View More" button for achievements
 */
function setupAchievementsViewMore() {
  const achievementsList = document.getElementById('achievements-list');
  const viewMoreBtn = document.getElementById('view-more-btn');
  const achievementsCount = document.getElementById('achievements-count');
  
  if (viewMoreBtn && achievementsList) {
    viewMoreBtn.addEventListener('click', () => {
      achievementsList.classList.toggle('collapsed');
      
      if (achievementsList.classList.contains('collapsed')) {
        viewMoreBtn.textContent = 'View More';
      } else {
        viewMoreBtn.textContent = 'View Less';
      }
    });
    
    // Update the achievements count
    if (achievementsCount && GamificationState && GamificationState.achievements) {
      achievementsCount.textContent = `(${GamificationState.achievements.length})`;
    }
  }
}

/**
 * Sets up service worker for PWA functionality
 */
function setupServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Note: In a real application, you would include a service-worker.js file
      // and register it here for offline capabilities
    });
  }
}

/**
 * Checks for inactive habits and sends reminders
 */
function checkHabitReminders() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  habits.forEach(habit => {
    if (habit.lastCompleted) {
      const lastDate = new Date(habit.lastCompleted);
      const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysSince >= 2) {
        // In a real app, you could show notifications here
        console.log(`Reminder: You haven't logged "${habit.name}" for ${daysSince} days.`);
      }
    }
  });
}

/**
 * Adds sample habits for demo purposes
 */
function addSampleHabits() {
  // Only add samples if no habits exist
  if (!habits || habits.length === 0) {
    habits = [
      createHabit('Exercise'),
      createHabit('Reading'),
      createHabit('Meditation')
    ];
    
    // Add a sample achievement for each
    addAchievement('Started tracking Exercise!', 'milestone');
    addAchievement('Created Reading habit!', 'milestone');
    addAchievement('Added Meditation to your routine!', 'milestone');
    
    // Save the created habits
    saveHabits();
    
    // Add points for getting started
    if (typeof addPoints === 'function') {
      addPoints(50);
    }
  }
}

/**
 * Clears all application data (for testing/debugging)
 */
function clearAllData() {
  if (confirm('Are you sure you want to clear all app data? This cannot be undone.')) {
    localStorage.removeItem('habits');
    localStorage.removeItem('timerState');
    localStorage.removeItem('gamification');
    localStorage.removeItem('activeTab');
    
    // Reload the page to reset the app
    window.location.reload();
  }
}

/**
 * Helper function to trigger confetti if available
 */
function triggerConfetti() {
  if (typeof window.triggerConfetti === 'function') {
    window.triggerConfetti();
  }
}

// Add this line to window scope for debugging purposes
window.clearAllData = clearAllData;

// Export functions for easier testing and debugging
window.PomodoHabit = {
  clearAllData,
  addSampleHabits,
  triggerConfetti
};

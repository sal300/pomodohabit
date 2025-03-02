/**
 * app.js - Main application file that initializes and connects all components
 */

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  setupTabNavigation();
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
  
  console.log('PomodoHabit initialized successfully!');
}

/**
 * Sets up tab navigation functionality
 */
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Load the active tab from localStorage or default to timer
  const savedTab = localStorage.getItem('activeTab') || 'timer';
  setActiveTab(savedTab);
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      setActiveTab(tabName);
      
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
    
    // Update tab content
    tabContents.forEach(content => {
      if (content.id === `${tabName}-section`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
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
      // navigator.serviceWorker.register('/service-worker.js')
      //   .then(registration => {
      //     console.log('ServiceWorker registration successful');
      //   })
      //   .catch(error => {
      //     console.log('ServiceWorker registration failed:', error);
      //   });
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

// Add this line to window scope for debugging purposes
window.clearAllData = clearAllData;

// Export functions for easier testing and debugging
window.PomodoHabit = {
  clearAllData,
  addSampleHabits,
  triggerConfetti
};

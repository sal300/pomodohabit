/**
 * app.js - Main application file that initializes and connects all components
 */

// Initialize the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
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
  
  console.log('PomodoHabit initialized successfully!');
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

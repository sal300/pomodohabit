/**
 * habits.js - Controls the habit tracking functionality
 */

// Habits collection
let habits = [];

// DOM elements
const habitElements = {
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

/**
 * Creates a new habit object
 * @param {string} name - The name of the habit
 * @returns {Object} The new habit object
 */
function createHabit(name) {
  return {
    id: Date.now().toString(), // Unique ID based on timestamp
    name: name,
    streak: 0,
    sessions: 0,
    longestStreak: 0,
    created: new Date(),
    lastCompleted: null,
    history: []
  };
}

/**
 * Renders the habit list in the UI
 */
function renderHabits() {
  habitElements.list.innerHTML = '';
  
  if (habits.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No habits yet. Add one to get started!';
    emptyMessage.className = 'empty-message';
    habitElements.list.appendChild(emptyMessage);
    return;
  }
  
  habits.forEach((habit, index) => {
    const li = document.createElement('li');
    
    // Calculate days since last completion
    let daysStreak = 'No activity yet';
    if (habit.lastCompleted) {
      const lastDate = new Date(habit.lastCompleted);
      const now = new Date();
      const timeDiff = now - lastDate;
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        daysStreak = 'Completed today';
      } else if (daysDiff === 1) {
        daysStreak = 'Last completed yesterday';
      } else {
        daysStreak = `Last completed ${daysDiff} days ago`;
      }
    }
    
    li.innerHTML = `
      <div class="habit-info">
        <div class="habit-name">${habit.name}</div>
        <div class="habit-stats">
          Current streak: ${habit.streak} days
          <span class="separator">•</span>
          Best streak: ${habit.longestStreak} days
          <span class="separator">•</span>
          Total sessions: ${habit.sessions}
        </div>
        <div class="habit-last-completed">${daysStreak}</div>
      </div>
      <div class="habit-actions">
        <button class="log-btn" data-index="${index}">Log Session</button>
        <button class="edit-btn" data-index="${index}">Edit</button>
      </div>
    `;
    
    habitElements.list.appendChild(li);
  });
  
  // Update the habit dropdown in the timer section
  if (typeof updateHabitDropdown === 'function') {
    updateHabitDropdown();
  }
}

/**
 * Increments the habit completion count and streak
 * @param {number} index - Index of the habit to increment
 */
function incrementHabit(index) {
  if (index >= 0 && index < habits.length) {
    const habit = habits[index];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if already completed today
    let alreadyCompletedToday = false;
    if (habit.lastCompleted) {
      const lastDate = new Date(habit.lastCompleted);
      const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
      alreadyCompletedToday = today.getTime() === lastDay.getTime();
    }
    
    // Only increment streak if not already completed today
    if (!alreadyCompletedToday) {
      // Check if the streak is broken (more than 1 day since last completion)
      if (habit.lastCompleted) {
        const lastDate = new Date(habit.lastCompleted);
        const dayDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        // Reset streak if more than 1 day has passed
        if (dayDiff > 1) {
          habit.streak = 1;
        } else {
          habit.streak++;
        }
      } else {
        habit.streak = 1;
      }
    }
    
    // Always increment sessions
    habit.sessions++;
    
    // Update last completed date
    habit.lastCompleted = now;
    
    // Add to history
    habit.history.push({
      date: now,
      action: 'completed'
    });
    
    // Update longest streak if current streak is higher
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }
    
    // Check for streak achievements
    if (habit.streak === 3) {
      addAchievement(`3-Day Streak on ${habit.name}!`, 'streak');
    } else if (habit.streak === 7) {
      addAchievement(`1-Week Streak on ${habit.name}!`, 'streak');
      triggerConfetti();
    } else if (habit.streak === 30) {
      addAchievement(`Amazing! 30-Day Streak on ${habit.name}!`, 'streak');
      triggerConfetti();
    }
    
    // Award points based on streak
    const streakBonus = Math.min(5, Math.floor(habit.streak / 5));
    addPoints(5 + streakBonus);
    
    saveHabits();
    renderHabits();
  }
}

/**
 * Shows the edit modal for a habit
 * @param {number} index - Index of the habit to edit
 */
function showEditModal(index) {
  const habit = habits[index];
  habitElements.editNameInput.value = habit.name;
  habitElements.editIndexInput.value = index;
  habitElements.editModal.style.display = 'block';
}

/**
 * Closes the edit modal
 */
function closeEditModal() {
  habitElements.editModal.style.display = 'none';
}

/**
 * Deletes a habit
 * @param {number} index - Index of the habit to delete
 */
function deleteHabit(index) {
  if (confirm('Are you sure you want to delete this habit?')) {
    habits.splice(index, 1);
    saveHabits();
    renderHabits();
    closeEditModal();
  }
}

/**
 * Saves habits to localStorage
 */
function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

/**
 * Loads habits from localStorage
 */
function loadHabits() {
  try {
    const savedHabits = JSON.parse(localStorage.getItem('habits'));
    if (savedHabits && Array.isArray(savedHabits) && savedHabits.length > 0) {
      habits = savedHabits;
    } else {
      // Add sample habits if no habits exist
      addSampleHabits();
    }
    renderHabits();
  } catch (error) {
    console.warn('Error loading habits:', error);
    // Add sample habits if there's an error
    addSampleHabits();
    renderHabits();
  }
}

/**
 * Adds sample habits for first-time users
 */
function addSampleHabits() {
  habits = [
    createHabit('Exercise'),
    createHabit('Reading'),
    createHabit('Meditation')
  ];
  saveHabits();
}

// Event Listeners
habitElements.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const habitName = habitElements.input.value.trim();
  
  if (habitName) {
    const habit = createHabit(habitName);
    habits.push(habit);
    saveHabits();
    renderHabits();
    habitElements.input.value = '';
    
    // First habit achievement
    if (habits.length === 1) {
      addAchievement('First habit created! Your journey begins!', 'milestone');
    }
  }
});

// Event delegation for habit list buttons
habitElements.list.addEventListener('click', (e) => {
  if (e.target.classList.contains('log-btn')) {
    const index = parseInt(e.target.dataset.index, 10);
    incrementHabit(index);
  } else if (e.target.classList.contains('edit-btn')) {
    const index = parseInt(e.target.dataset.index, 10);
    showEditModal(index);
  }
});

// Edit form submission
habitElements.editForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const index = parseInt(habitElements.editIndexInput.value, 10);
  const newName = habitElements.editNameInput.value.trim();
  
  if (newName && index >= 0 && index < habits.length) {
    habits[index].name = newName;
    saveHabits();
    renderHabits();
    closeEditModal();
  }
});

// Delete button
habitElements.deleteButton.addEventListener('click', () => {
  const index = parseInt(habitElements.editIndexInput.value, 10);
  deleteHabit(index);
});

// Close button and click outside modal
habitElements.closeButton.addEventListener('click', closeEditModal);
window.addEventListener('click', (e) => {
  if (e.target === habitElements.editModal) {
    closeEditModal();
  }
});

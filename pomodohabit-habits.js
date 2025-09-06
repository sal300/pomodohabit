/**
 * habits.js - Manages habit creation, rendering and logging
 * Each habit: {id,name,streak,sessions,longestStreak,created,lastCompleted,history:[]}
 */

// Ensure global habits array exists
window.habits = window.habits || [];

// DOM references for habit module
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

/** Load habits from localStorage */
function loadHabits() {
  try {
    const saved = JSON.parse(localStorage.getItem('habits'));
    if (Array.isArray(saved)) {
      window.habits = saved;
    }
  } catch (e) {
    console.warn('Error loading habits:', e);
  }
}

/** Save habits to localStorage */
function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(window.habits));
}

/** Render habit cards in the UI */
function renderHabits() {
  if (!habitElements.list) return;

  habitElements.list.innerHTML = '';

  if (window.habits.length === 0) {
    habitElements.list.innerHTML = '<p class="empty-message">No habits yet. Add one above!</p>';
  } else {
    window.habits.forEach((habit, index) => {
      const card = document.createElement('div');
      card.className = 'habit-card';
      card.innerHTML = `
        <div class="habit-card-header">
          <div class="habit-name">${habit.name}</div>
          <div class="habit-stats">
            <div class="habit-stat"><span class="habit-stat-icon">🔥</span>Streak: ${habit.streak || 0}</div>
            <div class="habit-stat"><span class="habit-stat-icon">⏱️</span>Sessions: ${habit.sessions || 0}</div>
          </div>
        </div>
        <div class="habit-card-actions">
          <button class="log-btn" data-index="${index}">Log</button>
          <button class="edit-btn" data-index="${index}">Edit</button>
        </div>`;
      habitElements.list.appendChild(card);
    });
  }

  // Keep timer dropdown in sync
  if (typeof updateHabitDropdown === 'function') {
    updateHabitDropdown();
  }
}

/** Log a habit completion */
function incrementHabit(index) {
  const habit = window.habits[index];
  if (!habit) return;

  habit.sessions = (habit.sessions || 0) + 1;

  const today = new Date();
  const last = habit.lastCompleted ? new Date(habit.lastCompleted) : null;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (last && last.toDateString() === yesterday.toDateString()) {
    habit.streak = (habit.streak || 0) + 1;
  } else if (!last || last.toDateString() !== today.toDateString()) {
    habit.streak = 1;
  }
  habit.longestStreak = Math.max(habit.longestStreak || 0, habit.streak);
  habit.lastCompleted = today;
  habit.history = habit.history || [];
  habit.history.push(today);

  saveHabits();
  renderHabits();

  if (typeof addPoints === 'function') {
    addPoints(5);
  }
}

/** Show modal for editing a habit */
function showEditModal(index) {
  const habit = window.habits[index];
  if (!habit) return;
  habitElements.editIndexInput.value = index;
  habitElements.editNameInput.value = habit.name;
  habitElements.editModal.style.display = 'block';
}

/** Close edit modal */
function closeEditModal() {
  if (habitElements.editModal) {
    habitElements.editModal.style.display = 'none';
  }
}

// Expose functions globally
window.loadHabits = loadHabits;
window.saveHabits = saveHabits;
window.renderHabits = renderHabits;
window.incrementHabit = incrementHabit;
window.showEditModal = showEditModal;
window.closeEditModal = closeEditModal;

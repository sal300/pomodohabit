/**
 * timer.js - Controls the Pomodoro timer functionality
 */

// Timer state
const TimerState = {
  workDuration: 25, // default work duration in minutes
  breakDuration: 5, // default break duration in minutes
  timeRemaining: 25 * 60, // in seconds
  isRunning: false,
  isWorkSession: true,
  completedSessions: 0,
  interval: null,
  activeHabitId: null
};

// DOM elements
const timerElements = {
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

/**
 * Updates the timer display based on current time remaining
 */
function updateTimerDisplay() {
  const minutes = Math.floor(TimerState.timeRemaining / 60);
  const seconds = TimerState.timeRemaining % 60;
  
  timerElements.display.textContent = 
    String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
  
  // Update session type display
  timerElements.sessionType.textContent = TimerState.isWorkSession ? 'Work Session' : 'Break Session';
  timerElements.sessionType.className = TimerState.isWorkSession ? 
    'session-type work-session' : 'session-type break-session';
  
  // Update document title to show timer
  document.title = `${timerElements.display.textContent} - PomodoHabit`;
}

/**
 * Starts the timer countdown
 */
function startTimer() {
  if (!TimerState.isRunning) {
    TimerState.isRunning = true;
    timerElements.startBtn.textContent = 'Running...';
    
    TimerState.interval = setInterval(() => {
      if (TimerState.timeRemaining > 0) {
        TimerState.timeRemaining--;
        updateTimerDisplay();
      } else {
        clearInterval(TimerState.interval);
        playNotificationSound();
        
        // Handle session completion
        if (TimerState.isWorkSession) {
          TimerState.completedSessions++;
          
          // Award points and log for active habit
          addPoints(10);
          
          // Log for the currently active habit if selected
          if (TimerState.activeHabitId !== null) {
            incrementHabit(TimerState.activeHabitId);
          }
          
          // Save to localStorage
          saveTimerState();
        }
        
        // Switch between work and break sessions
        TimerState.isWorkSession = !TimerState.isWorkSession;
        setTimerForSession();
        TimerState.isRunning = false;
        timerElements.startBtn.textContent = 'Start';
        
        // Automatically start the next session
        startTimer();
      }
    }, 1000);
  }
}

/**
 * Pauses the timer
 */
function pauseTimer() {
  clearInterval(TimerState.interval);
  TimerState.isRunning = false;
  timerElements.startBtn.textContent = 'Start';
  saveTimerState();
}

/**
 * Resets the timer to the beginning of a work session
 */
function resetTimer() {
  pauseTimer();
  TimerState.isWorkSession = true;
  setTimerForSession();
  updateTimerDisplay();
  saveTimerState();
}

/**
 * Sets the timer duration based on current session type
 */
function setTimerForSession() {
  if (TimerState.isWorkSession) {
    TimerState.timeRemaining = Math.max(1, parseInt(timerElements.workDurationInput.value, 10)) * 60;
    TimerState.workDuration = Math.max(1, parseInt(timerElements.workDurationInput.value, 10));
  } else {
    TimerState.timeRemaining = Math.max(1, parseInt(timerElements.breakDurationInput.value, 10)) * 60;
    TimerState.breakDuration = Math.max(1, parseInt(timerElements.breakDurationInput.value, 10));
  }
  updateTimerDisplay();
  saveTimerState();
}

/**
 * Plays a notification sound when timer completes
 */
function playNotificationSound() {
  try {
    const audio = new Audio('https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js');
    audio.play().catch(e => console.warn('Audio play failed:', e));
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
}

/**
 * Updates the active habit dropdown options
 */
function updateHabitDropdown() {
  // Clear existing options except the default one
  while (timerElements.habitSelect.options.length > 1) {
    timerElements.habitSelect.remove(1);
  }
  
  // Add options for each habit
  habits.forEach((habit, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = habit.name;
    timerElements.habitSelect.appendChild(option);
  });
  
  // Set the selected habit if activeHabitId is set
  if (TimerState.activeHabitId !== null) {
    timerElements.habitSelect.value = TimerState.activeHabitId;
  }
}

/**
 * Saves the current timer state to localStorage
 */
function saveTimerState() {
  const state = {
    workDuration: TimerState.workDuration,
    breakDuration: TimerState.breakDuration,
    isWorkSession: TimerState.isWorkSession,
    completedSessions: TimerState.completedSessions,
    activeHabitId: TimerState.activeHabitId
  };
  localStorage.setItem('timerState', JSON.stringify(state));
}

/**
 * Loads the timer state from localStorage
 */
function loadTimerState() {
  try {
    const savedState = JSON.parse(localStorage.getItem('timerState'));
    if (savedState) {
      TimerState.workDuration = savedState.workDuration || 25;
      TimerState.breakDuration = savedState.breakDuration || 5;
      TimerState.isWorkSession = savedState.isWorkSession;
      TimerState.completedSessions = savedState.completedSessions || 0;
      TimerState.activeHabitId = savedState.activeHabitId;
      
      // Update input fields with saved values
      timerElements.workDurationInput.value = TimerState.workDuration;
      timerElements.breakDurationInput.value = TimerState.breakDuration;
      
      // Set the timer based on current session type
      setTimerForSession();
    }
  } catch (error) {
    console.warn('Error loading timer state:', error);
  }
}

// Event Listeners
timerElements.startBtn.addEventListener('click', startTimer);
timerElements.pauseBtn.addEventListener('click', pauseTimer);
timerElements.resetBtn.addEventListener('click', resetTimer);
timerElements.setTimerBtn.addEventListener('click', () => {
  pauseTimer();
  TimerState.isWorkSession = true; // Reset to work session
  TimerState.workDuration = Math.max(1, parseInt(timerElements.workDurationInput.value, 10));
  TimerState.breakDuration = Math.max(1, parseInt(timerElements.breakDurationInput.value, 10));
  setTimerForSession();
});

// Update active habit when selection changes
timerElements.habitSelect.addEventListener('change', (e) => {
  const selectedIndex = e.target.value;
  TimerState.activeHabitId = selectedIndex === '' ? null : parseInt(selectedIndex, 10);
  saveTimerState();
});

import { useState, useEffect } from 'react';

// Backend API URL
const API_URL = 'http://localhost:3000';

// Color themes for switcher
const THEMES = {
  classic: { name: 'Classic Red', primary: '#ef4444', secondary: '#dc2626' },
  fire: { name: 'Fire', primary: '#ff0000', secondary: '#cc0000' },
  crimson: { name: 'Crimson', primary: '#dc143c', secondary: '#b31234' },
};

function App() {
  // State management
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Additional features state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentTheme, setCurrentTheme] = useState('classic');
  const [showStats, setShowStats] = useState(true);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Apply theme colors dynamically
  useEffect(() => {
    const theme = THEMES[currentTheme];
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
  }, [currentTheme]);

  // ============================================
  // API FUNCTIONS
  // ============================================

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tasks`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      setTasks(data);
      setError('');
    } catch (err) {
      setError('⚠️ Backend not running. Start the server!');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError('⚠️ Please fill in both fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          description,
          priority,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      
      // Clear form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setError('');
    } catch (err) {
      setError('❌ Failed to add task');
      console.error('Error adding task:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => 
        task.id === id ? updatedTask : task
      ));
    } catch (err) {
      setError('❌ Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(task => task.id !== id));
      setError('');
    } catch (err) {
      setError('❌ Failed to delete task');
      console.error('Error updating task:', err);
    }
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Filter tasks based on search and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'active' && !task.completed) ||
                         (filterStatus === 'completed' && task.completed);
    
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    highPriority: tasks.filter(t => t.priority === 'high' && !t.completed).length,
  };

  const completionPercentage = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  // Priority colors and labels
  const priorityConfig = {
    high: { color: 'bg-red-500', label: '🔥 High', textColor: 'text-red-500', borderColor: 'border-red-500' },
    medium: { color: 'bg-orange-500', label: '⚡ Medium', textColor: 'text-orange-500', borderColor: 'border-orange-500' },
    low: { color: 'bg-green-500', label: '✓ Low', textColor: 'text-green-500', borderColor: 'border-green-500' },
  };

  // ============================================
  // RENDER UI - ALL WHITE REPLACED WITH GRAY
  // ============================================

  return (
    <div className="min-h-screen bg-dark-bg text-gray-300 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Theme Switcher */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2 animate-fade-in">
              ⚡ TASK MASTER
            </h1>
            <p className="text-gray-400">Dominate your assignments like a boss</p>
          </div>

          {/* Theme Switcher */}
          <div className="flex gap-2">
            {Object.entries(THEMES).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => setCurrentTheme(key)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  currentTheme === key
                    ? 'bg-accent-red text-gray-100 scale-105'
                    : 'bg-dark-card text-gray-400 hover:text-gray-300'
                }`}
                title={theme.name}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/30 border-2 border-accent-red text-gray-200 px-4 py-3 rounded-xl mb-6 animate-slide-in">
            {error}
          </div>
        )}

        {/* Statistics Dashboard */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-accent-red transition-all duration-300">
              <div className="text-3xl font-bold text-accent-red">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Tasks</div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-green-500 transition-all duration-300">
              <div className="text-3xl font-bold text-green-500">{stats.completed}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-orange-500 transition-all duration-300">
              <div className="text-3xl font-bold text-orange-500">{stats.active}</div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-red-500 transition-all duration-300">
              <div className="text-3xl font-bold text-red-500">{stats.highPriority}</div>
              <div className="text-sm text-gray-400">High Priority</div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-4 mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-gray-300">Progress</span>
            <span className="text-sm font-bold text-accent-red">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-dark-bg rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-red to-red-600 transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Add Task Form */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-200 mb-4 flex items-center gap-2">
            <span className="text-accent-red">+</span> Create New Task
          </h2>
          
          <form onSubmit={addTask} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  📌 Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Complete Math Assignment"
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-gray-200 placeholder-gray-500 focus:border-accent-red focus:ring-2 focus:ring-accent-red/50 outline-none transition"
                  disabled={loading}
                />
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  🎯 Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-gray-200 focus:border-accent-red focus:ring-2 focus:ring-accent-red/50 outline-none transition"
                  disabled={loading}
                >
                  <option value="low">✓ Low Priority</option>
                  <option value="medium">⚡ Medium Priority</option>
                  <option value="high">🔥 High Priority</option>
                </select>
              </div>
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                📝 Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add detailed information about the task..."
                rows="3"
                className="w-full px-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-gray-200 placeholder-gray-500 focus:border-accent-red focus:ring-2 focus:ring-accent-red/50 outline-none transition resize-none"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-red hover:bg-accent-red-dark text-gray-100 font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-accent-red/50"
            >
              {loading ? '⏳ Adding...' : '➕ Add Task'}
            </button>
          </form>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search tasks..."
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-gray-200 placeholder-gray-500 focus:border-accent-red outline-none transition"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {['all', 'active', 'completed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterStatus(filter)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all duration-300 ${
                  filterStatus === filter
                    ? 'bg-accent-red text-gray-100'
                    : 'bg-dark-bg text-gray-400 hover:text-gray-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-200">
              📋 Tasks ({filteredTasks.length})
            </h2>
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-sm text-gray-400 hover:text-accent-red transition"
            >
              {showStats ? '👁️ Hide Stats' : '👁️ Show Stats'}
            </button>
          </div>

          {loading && tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              Loading tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 bg-dark-card border border-dark-border rounded-xl">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-400">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No tasks match your filters' 
                  : 'No tasks yet. Create your first one above!'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className={`bg-dark-card border-2 rounded-xl p-5 transition-all duration-300 hover:scale-[1.01] animate-slide-in ${
                  task.completed
                    ? 'border-green-500/30 opacity-75'
                    : `${priorityConfig[task.priority || 'medium'].borderColor} hover:shadow-lg hover:shadow-accent-red/20`
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                        task.completed
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-600 hover:border-accent-red'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-5 h-5 text-gray-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    {/* Priority Badge */}
                    <div className="mb-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${priorityConfig[task.priority || 'medium'].color} text-gray-100`}>
                        {priorityConfig[task.priority || 'medium'].label}
                      </span>
                    </div>

                    <h3
                      className={`text-xl font-bold mb-2 transition ${
                        task.completed ? 'line-through text-gray-500' : 'text-gray-200'
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p
                      className={`text-sm mb-2 ${
                        task.completed ? 'line-through text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {task.description}
                    </p>
                    <p className="text-xs text-gray-600">
                      📅 {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-accent-red hover:bg-red-900/20 p-3 rounded-lg transition-all duration-300 transform hover:scale-110"
                    title="Delete task"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>⚡ Powered by React, Express & LowDB</p>
          <p className="mt-2">🎨 Designed with Black, Gray & Red</p>
        </div>
      </div>
    </div>
  );
}

export default App;
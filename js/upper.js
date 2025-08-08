// js/upper.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Create Supabase client
const supabase = createClient(
  'https://azhfffcwewjctoamaemd.supabase.co',
  'sb_publishable_HvjfhJYmK9zm94ra3LheoA_HtB5fplr'
);

// Wait for DOM to load before working with form
window.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = 'index.html';
    return;
  }

  const userId = session.user.id;
  const workoutForm = document.getElementById('workoutForm');
  const today = new Date().toISOString().split('T')[0];
  const tag = 'upper';

  // Show last weight and reps for each exercise
  const rows = workoutForm.querySelectorAll('tbody tr');
  for (const row of rows) {
    const name_exercise = row.cells[0].textContent.trim();

    // Add a cell for last values if not present
    let lastCell = row.querySelector('.last-values');
    if (!lastCell) {
      lastCell = document.createElement('td');
      lastCell.className = 'last-values';
      lastCell.style.fontSize = '0.9em';
      lastCell.style.color = '#888';
      row.appendChild(lastCell);
    }

    // Fetch any previous entry for this exercise (ignore date)
    try {
      const { data, error } = await supabase
        .from('workout_entries')
        .select('weight, reps')
        .eq('user_id', userId)
        .eq('tag', tag)
        .eq('name_exercise', name_exercise)
        .limit(1);

      if (error) {
        lastCell.textContent = 'Error loading last';
      } else if (Array.isArray(data) && data.length > 0 && data[0].weight !== undefined && data[0].reps !== undefined) {
        lastCell.textContent = `Last: ${data[0].weight}kg x ${data[0].reps}`;
      } else {
        lastCell.textContent = 'No previous entry';
      }
    } catch (err) {
      lastCell.textContent = 'Error loading last';
    }
  }

  workoutForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const rows = workoutForm.querySelectorAll('tbody tr');
    const entries = [];

    rows.forEach(row => {
      const name_exercise = row.cells[0].textContent.trim();
      const weight = Number(row.querySelector('input[name="weight"]').value);
      const reps = Number(row.querySelector('input[name="reps"]').value);

      // Only push rows with valid data
      if (!isNaN(weight) && !isNaN(reps)) {
        entries.push({
          date: today,
          name_exercise,
          weight,
          reps,
          tag,
          user_id: userId
        });
      }
    });

    // Insert into Supabase
    const { error } = await supabase.from('workout_entries').insert(entries);

    if (error) {
      alert('Failed to save workout: ' + error.message);
      console.error(error);
    } else {
      workoutForm.reset();
    }
  });
});

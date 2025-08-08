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
  const tag = 'lower';

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

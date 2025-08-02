const API_BASE = 'http://localhost:3000';

// Check if user is logged in (token exists)
export function isLoggedIn() {
  return !!localStorage.getItem('token');
}

// Get token from localStorage
export function getToken() {
  return localStorage.getItem('token');
}

// Fetch medicines for the logged-in user
export async function fetchMedicines() {
  const token = getToken();
  if (!token) throw new Error('User not logged in');

  const response = await fetch(`${API_BASE}/api/medications`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Failed to fetch medicines');
  }

  return response.json();  // Should be an array of meds
}
// ---------- Helper utilities ----------
const qs = (sel) => document.querySelector(sel);
const generateId = () => 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// ---------- DOM refs ----------
const form = qs('#studentForm');
const nameInput = qs('#studentName');
const ageInput = qs('#age');
const emailInput = qs('#email');
const submitBtn = qs('#submitBtn');
const cancelEditBtn = qs('#cancelEditBtn');
const searchInput = qs('#search');
const sortSelect = qs('#sortBy');
const tbody = qs('#studentsTbody');

// ---------- State ----------
let editingId = null;
const STORAGE_KEY = 'students_demo_v1';
const initialStudents = [
  { id: generateId(), name: 'Dinesh', age: 20, email: 'dinesh@example.com' },
  { id: generateId(), name: 'Kumar', age: 22, email: 'kumar@example.com' },
];

let students = (() => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : initialStudents.slice();
  } catch (e) {
    return initialStudents.slice();
  }
})();

// ---------- Persistence ----------
function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// ---------- Rendering ----------
function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = students.filter((s) => {
    return !query || s.name.toLowerCase().includes(query) || s.email.toLowerCase().includes(query);
  });

  tbody.innerHTML = '';
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="px-6 py-4 text-sm text-slate-500">No students found.</td></tr>`;
    return;
  }

  for (const s of filtered) {
    tbody.innerHTML += `
      <tr>
        <td class="px-6 py-4 text-sm font-medium text-slate-900">${escapeHtml(s.name)}</td>
        <td class="px-6 py-4 text-sm text-slate-500">${s.age}</td>
        <td class="px-6 py-4 text-sm text-slate-500">${escapeHtml(s.email)}</td>
        <td class="px-6 py-4 text-sm font-medium space-x-2">
          <button data-id="${s.id}" class="edit-btn text-blue-600 hover:text-blue-900">Edit</button>
          <button data-id="${s.id}" class="delete-btn text-red-600 hover:text-red-900">Delete</button>
        </td>
      </tr>
    `;
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// ---------- Sorting ----------
function sortStudents() {
  const by = sortSelect.value;
  if (by === 'age') {
    students.sort((a, b) => a.age - b.age);
  } else if (by === 'email') {
    students.sort((a, b) => a.email.localeCompare(b.email));
  } else {
    students.sort((a, b) => a.name.localeCompare(b.name));
  }
}

// ---------- Form actions ----------
function resetForm() {
  editingId = null;
  form.reset();
  submitBtn.textContent = 'Add Student';
  cancelEditBtn.classList.add('hidden');
}

function startEditing(id) {
  const stud = students.find((s) => s.id === id);
  if (!stud) return;
  editingId = id;
  nameInput.value = stud.name;
  ageInput.value = stud.age;
  emailInput.value = stud.email;
  submitBtn.textContent = 'Update Student';
  cancelEditBtn.classList.remove('hidden');
  nameInput.focus();
}

function handleDelete(id) {
  const stud = students.find((s) => s.id === id);
  if (!stud) return;
  if (!confirm(`Delete "${stud.name}" (${stud.email}) ?`)) return;
  students = students.filter((s) => s.id !== id);
  saveStudents();
  render();
}

// ---------- Events ----------
form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const name = nameInput.value.trim();
  const ageVal = ageInput.value.trim();
  const email = emailInput.value.trim();

  if (!name) return alert('Please enter a name.');
  if (!ageVal || isNaN(ageVal) || ageVal < 0) return alert('Please enter a valid age.');
  if (!isValidEmail(email)) return alert('Please enter a valid email.');

  if (editingId) {
    const idx = students.findIndex((s) => s.id === editingId);
    students[idx] = { id: editingId, name, age: Number(ageVal), email };
  } else {
    students.push({ id: generateId(), name, age: Number(ageVal), email });
  }

  sortStudents();
  saveStudents();
  resetForm();
  render();
});

cancelEditBtn.addEventListener('click', resetForm);

tbody.addEventListener('click', (ev) => {
  const btn = ev.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.classList.contains('edit-btn')) startEditing(id);
  if (btn.classList.contains('delete-btn')) handleDelete(id);
});

searchInput.addEventListener('input', render);
sortSelect.addEventListener('change', () => {
  sortStudents();
  saveStudents();
  render();
});

// ---------- Init ----------
sortStudents();
render();

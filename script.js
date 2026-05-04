/* ===== script.js — login logic ===== */

const form      = document.getElementById('loginform');
const emailEl   = document.getElementById('email');
const pwEl      = document.getElementById('password');
const termsEl   = document.getElementById('terms');
const togglePw  = document.getElementById('togglePw');
const submitBtn = document.getElementById('submitBtn');
const btnLoader = document.getElementById('btnLoader');
const btnText   = submitBtn.querySelector('.btn-text');

/* ---------- show/hide password ---------- */
togglePw.addEventListener('click', () => {
  const isHidden = pwEl.type === 'password';
  pwEl.type = isHidden ? 'text' : 'password';
  togglePw.innerHTML = isHidden
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
         <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
         <line x1="1" y1="1" x2="23" y2="23"/>
       </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
         <circle cx="12" cy="12" r="3"/>
       </svg>`;
});

/* ---------- inline validation helpers ---------- */
function setError(inputEl, errorId, msg) {
  const errEl = document.getElementById(errorId);
  errEl.textContent = msg;
  if (msg) inputEl.classList.add('error');
  else      inputEl.classList.remove('error');
}

function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

emailEl.addEventListener('input', () => {
  if (!emailEl.value) setError(emailEl, 'emailError', '');
  else if (!validateEmail(emailEl.value)) setError(emailEl, 'emailError', 'Invalid email address.');
  else setError(emailEl, 'emailError', '');
});

pwEl.addEventListener('input', () => {
  if (pwEl.value.length > 0 && pwEl.value.length < 8)
    setError(pwEl, 'pwError', 'Minimum 8 characters.');
  else
    setError(pwEl, 'pwError', '');
});

/* ---------- form submit ---------- */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  let valid = true;

  if (!validateEmail(emailEl.value)) {
    setError(emailEl, 'emailError', 'Please enter a valid email address.');
    valid = false;
  }
  if (pwEl.value.length < 8) {
    setError(pwEl, 'pwError', 'The password must contain at least 8 characters.');
    valid = false;
  }
  if (!termsEl.checked) {
    document.getElementById('termsError').textContent = 'You must accept the terms and conditions.';
    valid = false;
  } else {
    document.getElementById('termsError').textContent = '';
  }

  if (!valid) return;

  /* Simulate async account creation */
  btnText.textContent = 'Logging in…';
  btnLoader.classList.add('active');
  submitBtn.disabled = true;

  await new Promise(r => setTimeout(r, 1800));

  btnLoader.classList.remove('active');
  btnText.textContent = '✓ Logged in!';
  submitBtn.style.background = '#27AE60';

  /* Reset after 3s */
  setTimeout(() => {
    btnText.textContent = 'Login';
    submitBtn.style.background = '';
    submitBtn.disabled = false;
    form.reset();
  }, 3000);
});

// ─── CONFIG SUPABASE ───────────────────────────────────────────────────────────
// Mêmes valeurs que dans forgot-password.js
const SUPABASE_URL = 'https://dplbrolscjiyfemtdqmk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_s9vnKPQOf06ywI899ypFMw_Id2HmcU2';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── ÉTATS UI ──────────────────────────────────────────────────────────────────
function showState(id) {
  ['state-loading', 'state-invalid', 'state-form', 'state-success'].forEach(s => {
    document.getElementById(s).style.display = s === id ? 'block' : 'none';
  });
}

// ─── VÉRIFICATION DU TOKEN AU CHARGEMENT ──────────────────────────────────────
// Supabase place le token dans le hash de l'URL :
//   change-password.html#access_token=xxx&type=recovery
// getSession() le détecte automatiquement.
document.addEventListener('DOMContentLoaded', async () => {
  showState('state-loading');

  // Écoute les changements d'auth (notamment SIGNED_IN après recovery)
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      // Le token est valide → afficher le formulaire
      showState('state-form');
    }
  });

  // Essaie aussi de récupérer une session existante depuis l'URL
  const { data, error } = await sb.auth.getSession();

  // Si pas de session et pas d'événement PASSWORD_RECOVERY → lien invalide
  setTimeout(() => {
    const currentState = ['state-loading', 'state-invalid', 'state-form', 'state-success']
      .find(s => document.getElementById(s).style.display !== 'none');
    if (currentState === 'state-loading') {
      showState('state-invalid');
    }
  }, 3000); // 3s de délai max pour que onAuthStateChange se déclenche

  // Attachement des listeners
  document.getElementById('new-password')?.addEventListener('input', onPwInput);
  document.getElementById('new-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('confirm-password')?.focus();
  });
  document.getElementById('confirm-password')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') changePassword();
  });
});

// ─── TOGGLE AFFICHAGE MOT DE PASSE ─────────────────────────────────────────────
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  // Swap icon opacity pour feedback visuel
  btn.style.opacity = isHidden ? '1' : '0.5';
}

// ─── BARRE DE FORCE DU MOT DE PASSE ───────────────────────────────────────────
function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

function onPwInput() {
  const pw = document.getElementById('new-password').value;
  const score = getStrength(pw);
  const fill  = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');

  const levels = [
    { pct: '10%', color: '#E74C3C', text: 'Very low' },
    { pct: '25%', color: '#E74C3C', text: 'Low'      },
    { pct: '50%', color: '#F39C12', text: 'Medium'        },
    { pct: '75%', color: '#2980B9', text: 'High'         },
    { pct: '90%', color: '#27AE60', text: 'Very high'    },
    { pct: '100%',color: '#1E8449', text: 'Excellent'    },
  ];

  const lvl = levels[Math.min(score, 5)];
  fill.style.width = pw.length ? lvl.pct : '0%';
  fill.style.background = lvl.color;
  label.textContent = pw.length ? lvl.text : '';
  label.style.color  = lvl.color;
}

// ─── CHANGER LE MOT DE PASSE ───────────────────────────────────────────────────
async function changePassword() {
  const pw      = document.getElementById('new-password').value;
  const confirm = document.getElementById('confirm-password').value;

  // Reset erreurs
  document.getElementById('pw-error').textContent      = '';
  document.getElementById('confirm-error').textContent = '';
  document.getElementById('new-password').classList.remove('error');
  document.getElementById('confirm-password').classList.remove('error');

  // Validations
  if (!pw) {
    document.getElementById('pw-error').textContent = 'Enter a new password.';
    document.getElementById('new-password').classList.add('error');
    return;
  }
  if (pw.length < 8) {
    document.getElementById('pw-error').textContent = 'Minimum 8 characters.';
    document.getElementById('new-password').classList.add('error');
    return;
  }
  if (pw !== confirm) {
    document.getElementById('confirm-error').textContent = 'Passwords do not match.';
    document.getElementById('confirm-password').classList.add('error');
    return;
  }

  // Loading
  document.getElementById('btn-change-label').style.display   = 'none';
  document.getElementById('btn-change-spinner').style.display = 'inline-block';
  document.getElementById('btn-change').disabled = true;

  try {
    const { error } = await sb.auth.updateUser({ password: pw });

    if (error) {
      document.getElementById('pw-error').textContent =
        'Erreur : ' + (error.message || 'Unable to change password.');
      document.getElementById('new-password').classList.add('error');
      document.getElementById('btn-change-label').style.display   = 'inline';
      document.getElementById('btn-change-spinner').style.display = 'none';
      document.getElementById('btn-change').disabled = false;
      return;
    }

    // ✅ Succès
    showState('state-success');

    // Déconnexion + redirection dans 3 secondes
    let n = 3;
    const tick = setInterval(async () => {
      n--;
      const el = document.getElementById('countdown');
      if (el) el.textContent = n;
      if (n <= 0) {
        clearInterval(tick);
        await sb.auth.signOut();
        window.location.href = 'index.html';
      }
    }, 1000);

  } catch (err) {
    document.getElementById('pw-error').textContent = 'Network error. Please check your connection.';
    console.error(err);
    document.getElementById('btn-change-label').style.display   = 'inline';
    document.getElementById('btn-change-spinner').style.display = 'none';
    document.getElementById('btn-change').disabled = false;
  }
}

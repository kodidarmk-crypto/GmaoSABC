// ─── CONFIG SUPABASE ───────────────────────────────────────────────────────────
// Remplace ces deux valeurs par celles de ton projet Supabase
const SUPABASE_URL = 'https://dplbrolscjiyfemtdqmk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_s9vnKPQOf06ywI899ypFMw_Id2HmcU2';
const redirectTo = window.location.origin + '/change-password.html';
const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function setLoading(on) {
  document.getElementById('btn-send-label').style.display  = on ? 'none' : 'inline';
  document.getElementById('btn-send-spinner').style.display = on ? 'inline-block' : 'none';
  document.getElementById('btn-send').disabled = on;
}

function showError(msg) {
  document.getElementById('email-error').textContent = msg;
  document.getElementById('email').classList.toggle('error', !!msg);
}

// ─── SEND RESET LINK ───────────────────────────────────────────────────────────
async function sendResetLink() {
  const email = document.getElementById('email').value.trim();
  showError('');

  // Validation basique
  if (!email) {
    showError('Please enter your email address.');
    return;
  }
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) {
    showError('Invalid email address.');
    return;
  }

  setLoading(true);

  try {
    /*
     * Supabase envoie automatiquement un e-mail avec un lien du type :
     *   https://VOTRE_DOMAINE/change-password.html#access_token=xxx&type=recovery
     *
     * Le redirectTo ci-dessous doit correspondre à l'URL publique de ta page
     * change-password.html  (ex: https://ton-app.vercel.app/change-password.html)
     * Pour le dev local, utilise : http://127.0.0.1:5500/change-password.html
     */
    const redirectTo = window.location.origin + '/change-password.html';

    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      // Supabase renvoie une erreur seulement si l'e-mail n'existe pas OU si
      // la config SMTP est manquante. On affiche un message générique pour ne
      // pas révéler si l'e-mail est enregistré (sécurité).
      if (error.message.toLowerCase().includes('user not found')) {
        showError('No account found with this address.');
      } else {
        showError('An error occurred. Please try again later.');
        console.error('Supabase resetPassword error:', error.message);
      }
      setLoading(false);
      return;
    }

    // Succès → afficher l'étape de confirmation
    document.getElementById('confirm-email').textContent = email;
    document.getElementById('step-email').style.display   = 'none';
    document.getElementById('step-confirm').style.display = 'block';

  } catch (err) {
    showError('Network error. Please check your connection.');
    console.error(err);
    setLoading(false);
  }
}

// ─── ENTER KEY ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('email')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendResetLink();
  });
});

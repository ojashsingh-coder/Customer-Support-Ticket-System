// oauth.js
// handles mock google and github login popups for demo purposes
// no real credentials used - Ojash Singh

'use strict';

// --- MOCK PROVIDER PROFILES ---─────────────────────────────────
// Each provider has a pool of demo accounts. On click, one is
// picked (or retrieved if the user "logged in" before via that
// provider), stored in localStorage, and the user is redirected.

const GOOGLE_PROFILES = [
  { name: 'Ojash Singh',    email: 'ojash.singh@gmail.com',    avatar: 'av-purple',   initials: 'OJ', role: 'Agent',  provider: 'google' },
  { name: 'Sneha Kapoor',   email: 'sneha.kapoor@gmail.com',   avatar: 'av-pink',   initials: 'SK', role: 'Admin',  provider: 'google' },
  { name: 'Rahul Verma',    email: 'rahul.verma@gmail.com',    avatar: 'av-green',  initials: 'RV', role: 'Agent',  provider: 'google' },
  { name: 'Priya Nair',     email: 'priya.nair@gmail.com',     avatar: 'av-orange', initials: 'PN', role: 'Admin',  provider: 'google' },
];

const GITHUB_PROFILES = [
  { name: 'Dev Sharma',     email: 'dev.sharma@github.com',    avatar: 'av-purple', initials: 'DS', role: 'Agent',  provider: 'github' },
  { name: 'Ananya Singh',   email: 'ananya.singh@github.com',  avatar: 'av-teal',   initials: 'AS', role: 'Admin',  provider: 'github' },
  { name: 'Karan Patel',    email: 'karan.patel@github.com',   avatar: 'av-blue',   initials: 'KP', role: 'Agent',  provider: 'github' },
  { name: 'Nisha Gupta',    email: 'nisha.gupta@github.com',   avatar: 'av-orange', initials: 'NG', role: 'Admin',  provider: 'github' },
];

// --- OAUTH POPUP SIMULATION ---──────────────────────────────────

function createOAuthPopup(provider, profiles, onSuccess) {
  // Remove any existing popup
  const existing = document.getElementById('oauthPopup');
  if (existing) existing.remove();

  const isGoogle = provider === 'google';
  const brandColor = isGoogle ? '#4285F4' : '#24292e';
  const brandName  = isGoogle ? 'Google'  : 'GitHub';

  const overlay = document.createElement('div');
  overlay.id = 'oauthPopup';
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);
    z-index:9999;display:flex;align-items:center;justify-content:center;
    animation:fadeIn .2s ease;
  `;

  const popup = document.createElement('div');
  popup.style.cssText = `
    background:var(--bg-elevated,#1a1a2e);border:1px solid var(--border-default,rgba(255,255,255,0.1));
    border-radius:16px;padding:28px;width:340px;max-width:90vw;
    box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:slideUp .25s ease;
  `;

  const providerIcon = isGoogle
    ? `<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`
    : `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0012 0z"/></svg>`;

  popup.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:10px;">
        ${providerIcon}
        <div>
          <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary,#fff);">Sign in with ${brandName}</div>
          <div style="font-size:0.72rem;color:var(--text-muted,rgba(255,255,255,0.45));">Choose an account to continue</div>
        </div>
      </div>
      <button id="oauthClose" style="background:none;border:none;color:var(--text-muted,rgba(255,255,255,0.45));font-size:1.2rem;cursor:pointer;padding:4px;line-height:1;">✕</button>
    </div>

    <div id="oauthAccounts" style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
      ${profiles.map((p, i) => `
        <button class="oauth-account-btn" data-idx="${i}" style="
          display:flex;align-items:center;gap:12px;padding:10px 14px;
          background:var(--bg-tertiary,rgba(255,255,255,0.05));
          border:1px solid var(--border-subtle,rgba(255,255,255,0.06));
          border-radius:10px;cursor:pointer;text-align:left;width:100%;
          transition:background .15s,border-color .15s;color:var(--text-primary,#fff);
        ">
          <div style="
            width:36px;height:36px;border-radius:50%;display:flex;align-items:center;
            justify-content:center;font-size:0.78rem;font-weight:700;flex-shrink:0;
            background:${isGoogle ? ['#4285F4','#34A853','#FBBC05','#EA4335'][i%4] : ['#6e40c9','#2ea44f','#e36209','#0075ca'][i%4]};color:#fff;
          ">${p.initials}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:0.845rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
            <div style="font-size:0.75rem;color:var(--text-muted,rgba(255,255,255,0.45));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.email}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;opacity:.5;"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      `).join('')}
    </div>

    <div style="font-size:0.72rem;color:var(--text-muted,rgba(255,255,255,0.35));text-align:center;line-height:1.5;">
      This is a demo. No real ${brandName} credentials are used.<br>
      Selecting an account simulates the OAuth flow.
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Add hover effect via JS
  overlay.querySelectorAll('.oauth-account-btn').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'var(--bg-hover,rgba(255,255,255,0.09))';
      btn.style.borderColor = 'var(--border-brand,rgba(99,102,241,0.35))';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'var(--bg-tertiary,rgba(255,255,255,0.05))';
      btn.style.borderColor = 'var(--border-subtle,rgba(255,255,255,0.06))';
    });
  });

  // Inject keyframe animations if not present
  if (!document.getElementById('_oauthAnims')) {
    const style = document.createElement('style');
    style.id = '_oauthAnims';
    style.textContent = `
      @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
      @keyframes slideUp { from { transform:translateY(20px);opacity:0 } to { transform:translateY(0);opacity:1 } }
    `;
    document.head.appendChild(style);
  }

  // Close handlers
  document.getElementById('oauthClose').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });

  // Account selection
  overlay.querySelectorAll('.oauth-account-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const profile = profiles[parseInt(this.dataset.idx)];
      overlay.remove();

      // Show loading state briefly
      showOAuthLoading(brandName, profile, () => onSuccess(profile));
    });
  });
}

// --- LOADING ANIMATION ---───────────────────────────────────────

function showOAuthLoading(brandName, profile, callback) {
  const loader = document.createElement('div');
  loader.id = 'oauthLoader';
  loader.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);
    z-index:9999;display:flex;align-items:center;justify-content:center;
  `;
  loader.innerHTML = `
    <div style="text-align:center;color:#fff;">
      <div style="
        width:48px;height:48px;border:3px solid rgba(255,255,255,0.2);
        border-top-color:#fff;border-radius:50%;margin:0 auto 16px;
        animation:spin .7s linear infinite;
      "></div>
      <div style="font-size:0.9rem;font-weight:600;margin-bottom:4px;">Signing in as ${profile.name}</div>
      <div style="font-size:0.75rem;color:rgba(255,255,255,0.5);">Connecting via ${brandName}…</div>
    </div>
  `;

  if (!document.getElementById('_spinAnim')) {
    const s = document.createElement('style');
    s.id = '_spinAnim';
    s.textContent = `@keyframes spin { to { transform:rotate(360deg) } }`;
    document.head.appendChild(s);
  }

  document.body.appendChild(loader);
  setTimeout(() => {
    loader.remove();
    callback();
  }, 1100);
}

// --- MAIN AUTH HANDLER ---───────────────────────────────────────

function handleOAuthLogin(provider, redirectUrl) {
  redirectUrl = redirectUrl || 'index.html';
  const profiles = provider === 'google' ? GOOGLE_PROFILES : GITHUB_PROFILES;

  createOAuthPopup(provider, profiles, function (profile) {
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('ojashdesk_users') || '[]');
    let user = users.find(u => u.email.toLowerCase() === profile.email.toLowerCase());

    if (!user) {
      // Register new OAuth user
      user = {
        name:        profile.name,
        displayName: profile.name.split(' ')[0],
        email:       profile.email,
        role:        profile.role,
        avatar:      profile.avatar,
        initials:    profile.initials,
        provider:    profile.provider,
        createdAt:   new Date().toISOString(),
        password:    null, // OAuth users have no password
      };
      users.push(user);
      localStorage.setItem('ojashdesk_users', JSON.stringify(users));
    }

    localStorage.setItem('ojashdesk_current_user', JSON.stringify(user));

    if (typeof window.showToast === 'function') {
      window.showToast('Welcome, ' + user.name + '! Signed in via ' + (provider === 'google' ? 'Google' : 'GitHub') + '.', 'success');
    }

    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 500);
  });
}

// Expose globally
window.handleOAuthLogin = handleOAuthLogin;
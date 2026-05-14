import { supabase } from '../supabase'
import { renderCadetView } from './cadet_view'
import { renderOfficerView } from './officer_view'
import { renderInventory } from '../admin/inventory'

export function renderDashboard(container, profile) {
  if (!profile) {
    container.innerHTML = `<div class="p-8 text-center">Profile not found. Please contact an officer.</div>`
    return
  }

  const currencyName = profile.currency_name || 'Ardent Dollars'

  container.innerHTML = `
    <div class="flex-row" style="height: 100vh; gap: 0;">
      <!-- Sidebar -->
      <nav class="glass-card" style="width: 280px; height: 100vh; border-radius: 0; border-left: none; border-top: none; border-bottom: none; display: flex; flex-direction: column; padding: 2rem 1rem;">
        <div style="margin-bottom: 3rem; padding: 0 1rem;">
          <h2 style="margin: 0; color: var(--primary);">Ardent Exchange</h2>
          <p class="text-muted" style="font-size: 0.8rem;">${profile.unit_name || 'Unit Command'}</p>
        </div>

        <div class="flex-col" style="flex: 1;" id="nav-list">
          <a href="#home" class="nav-link active" data-view="home">Dashboard</a>
          ${profile.role === 'officer' ? `
            <a href="#pos" class="nav-link" data-view="pos">Point of Sale</a>
            <a href="#inventory" class="nav-link" data-view="inventory">Inventory</a>
            <a href="#cadets" class="nav-link" data-view="cadets">Cadet Ledger</a>
          ` : `
            <a href="#shop" class="nav-link" data-view="shop">Browse Shop</a>
            <a href="#history" class="nav-link" data-view="history">My History</a>
          `}
          <a href="#settings" class="nav-link" data-view="settings">Settings</a>
        </div>

        <div style="padding-top: 1rem; border-top: 1px solid var(--glass-border);">
          <div class="flex-row items-center nav-link" style="margin-bottom: 1rem; padding: 0.5rem 1rem;" data-view="profile">
            <div style="width: 32px; height: 32px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0; box-shadow: 0 0 10px var(--primary-glow);">
              ${profile.avatar_url || '🎖️'}
            </div>
            <div style="overflow: hidden;">
              <p style="margin: 0; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 700;">${profile.full_name || 'User'}</p>
              <p class="text-muted" style="margin: 0; font-size: 0.7rem; text-transform: uppercase;">${profile.rank || profile.role}</p>
            </div>
          </div>
          <button id="logout-btn" class="glass-btn" style="width: 100%; font-size: 0.8rem; padding: 0.5rem;">
            Sign Out
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main id="main-content" style="flex: 1; overflow-y: auto; padding: 2rem;">
      </main>
    </div>

    <style>
      .nav-link {
        padding: 0.75rem 1rem;
        border-radius: 8px;
        color: var(--text-muted);
        text-decoration: none;
        transition: all 0.2s;
        font-weight: 500;
        cursor: pointer;
      }
      .nav-link:hover { background: var(--glass); color: white; }
      .nav-link.active {
        background: var(--primary);
        color: white;
        box-shadow: 0 4px 12px var(--primary-glow);
      }
    </style>
  `

  const mainContent = document.getElementById('main-content')
  const logoutBtn = document.getElementById('logout-btn')
  const navLinks = document.querySelectorAll('.nav-link')

  function switchView(view) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.view === view)
    })

    mainContent.innerHTML = '' // Clear current view
    
    if (view === 'home') {
      if (profile.role === 'officer') renderOfficerView(mainContent, profile)
      else renderCadetView(mainContent, profile)
    } else if (view === 'inventory' && profile.role === 'officer') {
      renderInventory(mainContent)
    } else if (view === 'pos' && profile.role === 'officer') {
      import('../pos/pos').then(m => m.renderPOS(mainContent, profile))
    } else if (view === 'cadets' && profile.role === 'officer') {
      import('../admin/ledger').then(m => m.renderLedger(mainContent))
    } else if (view === 'settings') {
      import('../admin/settings').then(m => m.renderSettings(mainContent, profile))
    } else if (view === 'profile') {
      import('./profile_view').then(m => m.renderProfileView(mainContent, profile))
    } else {
      mainContent.innerHTML = `<div class="p-8 text-center text-muted">View "${view}" is coming soon!</div>`
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      switchView(link.dataset.view)
    })
  })

  logoutBtn.addEventListener('click', () => supabase.auth.signOut())

  // Default view
  switchView('home')
}

import { supabase } from '../supabase'

export async function renderSettings(container, profile) {
  container.innerHTML = `
    <div class="animate-fade-in" style="max-width: 600px;">
      <h1 style="margin-bottom: 2rem;">Unit Settings</h1>

      <div class="glass-card p-8 flex-col" style="margin-bottom: 2rem;">
        <h3>App Appearance</h3>
        <p class="text-muted" style="font-size: 0.8rem; margin-top: -1rem;">Select a theme for your device.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; margin-top: 1rem;">
          <div class="theme-option" data-theme="dark" style="background: #0f172a; border: 2px solid #3b82f6;">Dark</div>
          <div class="theme-option" data-theme="light" style="background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1;">Light</div>
          <div class="theme-option" data-theme="sea" style="background: #0c1a2e; color: #00d2ff; border: 1px solid #00d2ff;">Sea</div>
          <div class="theme-option" data-theme="air" style="background: #f0f9ff; color: #0284c7; border: 1px solid #0284c7;">Air</div>
          <div class="theme-option" data-theme="army" style="background: #1c1c16; color: #84cc16; border: 1px solid #84cc16;">Army</div>
          <div class="theme-option" data-theme="night-vision" style="background: #000; color: #0f0; border: 1px solid #0f0;">Night Vision</div>
        </div>
      </div>

      <div class="glass-card p-8 flex-col">
        <h3>Global Economy Configuration</h3>
        <form id="settings-form">
          <div class="input-group">
            <label>Unit Name</label>
            <input type="text" id="unit-name" value="${profile.unit_name || 'Ardent Cadet Corps'}" required />
          </div>
          
          <div class="input-group">
            <label>Currency Name (e.g. Ardent Dollars, Points, Credits)</label>
            <input type="text" id="currency-name" value="${profile.currency_name || 'Ardent Dollars'}" required />
          </div>

          <div style="margin-top: 1rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border-left: 4px solid var(--primary);">
            <p style="margin: 0; font-size: 0.8rem;" class="text-muted">
              These settings will change how the economy is displayed for ALL cadets and officers in this unit.
            </p>
          </div>

          <button type="submit" class="glass-btn primary" style="width: 100%; justify-content: center; margin-top: 2rem;">
            Save Global Settings
          </button>
        </form>
      </div>

      <div class="glass-card p-8" style="margin-top: 2rem; border-color: var(--danger);">
        <h3 style="margin-top: 0; color: var(--danger);">Danger Zone</h3>
        <p class="text-muted" style="font-size: 0.8rem;">These actions cannot be undone.</p>
        <button id="reset-economy-btn" class="glass-btn" style="color: var(--danger); border-color: var(--danger);">Reset All Cadet Balances to 0</button>
      </div>
    </div>

    <style>
      .theme-option {
        padding: 1.5rem 1rem;
        border-radius: 8px;
        text-align: center;
        cursor: pointer;
        font-weight: 700;
        font-size: 0.8rem;
        transition: var(--transition);
      }
      .theme-option:hover { transform: translateY(-3px); }
    </style>
  `

  // Theme Switching Logic
  const themeOptions = document.querySelectorAll('.theme-option')
  themeOptions.forEach(opt => {
    opt.onclick = () => {
      const theme = opt.dataset.theme
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('app-theme', theme)
      
      // Update visual selection
      themeOptions.forEach(o => o.style.borderWidth = '1px')
      opt.style.borderWidth = '3px'
    }
    
    // Highlight current theme
    if (localStorage.getItem('app-theme') === opt.dataset.theme) {
      opt.style.borderWidth = '3px'
    }
  })

  const form = document.getElementById('settings-form')
  form.onsubmit = async (e) => {
    e.preventDefault()
    const btn = form.querySelector('button')
    btn.textContent = 'Saving...'
    btn.disabled = true

    const { error } = await supabase
      .from('profiles')
      .update({
        unit_name: document.getElementById('unit-name').value,
        currency_name: document.getElementById('currency-name').value
      })
      .eq('id', profile.id)

    if (error) {
      alert(error.message)
      btn.textContent = 'Save Global Settings'
      btn.disabled = false
    } else {
      alert('Settings saved! Refreshing...')
      window.location.reload()
    }
  }

  document.getElementById('reset-economy-btn').onclick = async () => {
    if (confirm('Are you ABSOLUTELY sure? This will wipe the balance of EVERY cadet to 0.')) {
      const { error } = await supabase
        .from('profiles')
        .update({ balance: 0 })
        .eq('role', 'cadet')
      
      if (error) alert(error.message)
      else alert('Economy reset successfully.')
    }
  }
}

import { supabase } from '../supabase'

export async function renderProfileView(container, profile) {
  const avatars = ['🎖️', '⚓', '✈️', '🧭', '🎯', '🚢', '💂', '🚀', '📡', '🛡️']
  let selectedAvatar = profile.avatar_url || '🎖️'

  container.innerHTML = `
    <div class="animate-fade-in" style="max-width: 600px;">
      <h1 style="margin-bottom: 2rem;">My Profile</h1>

      <div class="glass-card p-8 flex-col">
        <div class="flex-row items-center" style="margin-bottom: 1.5rem; gap: 1.5rem;">
          <div id="avatar-preview" style="width: 80px; height: 80px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white; box-shadow: 0 0 20px var(--primary-glow);">
            ${selectedAvatar}
          </div>
          <div>
            <h2 style="margin: 0;">${profile.full_name || 'New Member'}</h2>
            <p class="text-muted" style="margin: 0;">${profile.rank || 'Cadet'} • ${profile.role.toUpperCase()}</p>
          </div>
        </div>

        <div style="margin-bottom: 2rem;">
          <label class="text-muted" style="font-size: 0.8rem; display: block; margin-bottom: 0.5rem;">Select Tactical Avatar</label>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem;">
            ${avatars.map(a => `
              <div class="avatar-option ${a === selectedAvatar ? 'active' : ''}" data-icon="${a}" style="cursor: pointer; font-size: 1.5rem; padding: 0.5rem; text-align: center; border: 1px solid var(--glass-border); border-radius: 8px; background: var(--glass);">
                ${a}
              </div>
            `).join('')}
          </div>
        </div>

        <form id="profile-form">
          <div class="input-group">
            <label>Full Name</label>
            <input type="text" id="prof-name" value="${profile.full_name || ''}" required />
          </div>
          
          <div class="input-group">
            <label>Current Rank</label>
            <input type="text" id="prof-rank" value="${profile.rank || 'Cadet'}" placeholder="e.g. Cpl, Sgt, WO2" required />
          </div>

          <div style="margin-top: 1rem; padding: 1rem; background: var(--glass); border-radius: 8px;">
            <p style="margin: 0; font-size: 0.8rem;" class="text-muted">
              Note: Role and Unit changes must be authorized by a Staff Officer.
            </p>
          </div>

          <button type="submit" class="glass-btn primary" style="width: 100%; justify-content: center; margin-top: 2rem;">
            Update Profile
          </button>
        </form>
      </div>

      <div class="glass-card p-8" style="margin-top: 2rem;">
        <h3 style="margin-top: 0;">Account Security</h3>
        <p class="text-muted" style="font-size: 0.8rem;">Email: ${profile.email || 'N/A'}</p>
        <button class="glass-btn" style="font-size: 0.8rem;" onclick="alert('Password reset link sent to your email!')">Reset Password</button>
      </div>
    </div>
  `

  // Avatar Selection Logic
  const avatarPreview = document.getElementById('avatar-preview')
  const avatarOptions = document.querySelectorAll('.avatar-option')
  
  avatarOptions.forEach(opt => {
    opt.onclick = () => {
      selectedAvatar = opt.dataset.icon
      avatarPreview.textContent = selectedAvatar
      avatarOptions.forEach(o => o.style.borderColor = 'var(--glass-border)')
      opt.style.borderColor = 'var(--primary)'
    }
    if (opt.dataset.icon === selectedAvatar) opt.style.borderColor = 'var(--primary)'
  })

  const form = document.getElementById('profile-form')
  form.onsubmit = async (e) => {
    e.preventDefault()
    const btn = form.querySelector('button')
    btn.textContent = 'Saving...'
    btn.disabled = true

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: document.getElementById('prof-name').value,
        rank: document.getElementById('prof-rank').value,
        avatar_url: selectedAvatar
      })
      .eq('id', profile.id)

    if (error) {
      alert(error.message)
      btn.textContent = 'Update Profile'
      btn.disabled = false
    } else {
      alert('Profile updated!')
      window.location.reload()
    }
  }
}

import { APP_VERSION, CHANGE_LOG } from '../utils/version'

export function initHelpHub() {
  const hub = document.createElement('div')
  hub.id = 'help-hub-container'
  
  hub.innerHTML = `
    <!-- Floating Button -->
    <div class="floating-help" id="help-btn">?</div>

    <!-- Modal Overlay -->
    <div class="modal-overlay" id="help-modal">
      <div class="glass-card modal-content animate-slide-in">
        <div class="flex-row justify-between" style="margin-bottom: 2rem;">
          <h2>Command Help Hub</h2>
          <button class="glass-btn" id="close-help">Close</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          <!-- Manual Section -->
          <div>
            <h3>Quick Start Guide</h3>
            <div class="flex-col" style="gap: 1.5rem;">
              <div>
                <p style="font-weight: 600; margin-bottom: 0.2rem; color: var(--primary);">For Officers</p>
                <p class="text-muted" style="font-size: 0.8rem;">Use the <strong>Ledger</strong> to reward cadets and the <strong>POS</strong> to process canteen sales. Manage stock in <strong>Inventory</strong>.</p>
              </div>
              <div>
                <p style="font-weight: 600; margin-bottom: 0.2rem; color: var(--primary);">For Cadets</p>
                <p class="text-muted" style="font-size: 0.8rem;">Check your balance in the <strong>Dashboard</strong>. View your full purchase history and rewards below your balance card.</p>
              </div>
              <div>
                <p style="font-weight: 600; margin-bottom: 0.2rem; color: var(--primary);">Personalization</p>
                <p class="text-muted" style="font-size: 0.8rem;">Click your name in the sidebar to access your <strong>Profile</strong>. Here you can set your <strong>Rank</strong> and choose a <strong>Tactical Avatar</strong> icon.</p>
              </div>
              <div>
                <p style="font-weight: 600; margin-bottom: 0.2rem; color: var(--primary);">Security</p>
                <p class="text-muted" style="font-size: 0.8rem;">Registration is restricted to official unit domains. Unauthorized access is audited.</p>
              </div>
            </div>
          </div>

          <!-- Change Log Section -->
          <div style="border-left: 1px solid var(--glass-border); padding-left: 2rem;">
            <div class="flex-row justify-between" style="align-items: baseline;">
              <h3>System Updates</h3>
              <span class="text-muted" style="font-size: 0.8rem;">Current: ${APP_VERSION}</span>
            </div>
            <div id="changelog-container" style="max-height: 400px; overflow-y: auto;">
              ${CHANGE_LOG.map(log => `
                <div style="margin-bottom: 1.5rem;">
                  <p style="font-weight: 700; margin: 0; color: var(--accent);">${log.version} <span style="font-weight: 400; font-size: 0.7rem; color: var(--text-muted); opacity: 0.7;">(${log.date})</span></p>
                  <ul style="margin: 0.5rem 0; padding-left: 1.2rem; font-size: 0.8rem; color: var(--text-muted);">
                    ${log.changes.map(change => `<li style="margin-bottom: 0.3rem;">${change}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(hub)

  const btn = document.getElementById('help-btn')
  const modal = document.getElementById('help-modal')
  const close = document.getElementById('close-help')

  btn.onclick = () => modal.style.display = 'flex'
  close.onclick = () => modal.style.display = 'none'
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none' }
}

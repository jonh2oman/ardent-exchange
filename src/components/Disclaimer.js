export function initDisclaimer() {
  const isAcknowledged = localStorage.getItem('ardent-disclaimer-ack')
  
  if (isAcknowledged === 'true') return

  const overlay = document.createElement('div')
  overlay.id = 'disclaimer-overlay'
  overlay.style = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(10px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `

  overlay.innerHTML = `
    <div class="glass-card animate-slide-in" style="max-width: 600px; padding: 2.5rem; border: 1px solid var(--primary);">
      <div class="flex-row" style="margin-bottom: 1.5rem; color: var(--accent);">
        <span style="font-size: 1.5rem;">⚠️</span>
        <h2 style="margin: 0; color: var(--text-main);">Important Notice</h2>
      </div>

      <div class="flex-col" style="gap: 1.2rem; margin-bottom: 2.5rem;">
        <p style="margin: 0; font-weight: 700; color: var(--text-main);">
          This application is provided "as is" without any guarantee or warranty of any kind, express or implied.
        </p>
        <p class="text-muted" style="margin: 0; font-size: 0.9rem; line-height: 1.6;">
          Please be advised that this is <span style="color: var(--text-main); font-weight: 600;">NOT</span> an official application of the Canadian Cadet Organization (CCO) or the Department of National Defence (DND).
        </p>
        <p class="text-muted" style="margin: 0; font-size: 0.9rem; line-height: 1.6;">
          Users are responsible for ensuring compliance with official rulebooks and financial protocols.
        </p>
      </div>

      <div class="flex-col" style="gap: 1.5rem;">
        <label style="display: flex; align-items: center; gap: 1rem; cursor: pointer; font-size: 0.9rem;">
          <input type="checkbox" id="disclaimer-check" style="width: 20px; height: 20px; accent-color: var(--primary);">
          <span>I acknowledge and accept these terms.</span>
        </label>

        <button id="disclaimer-btn" class="glass-btn primary" style="width: 100%; justify-content: center; height: 50px; opacity: 0.5; cursor: not-allowed;" disabled>
          ACK!
        </button>
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  const check = document.getElementById('disclaimer-check')
  const btn = document.getElementById('disclaimer-btn')

  check.onchange = () => {
    btn.disabled = !check.checked
    btn.style.opacity = check.checked ? '1' : '0.5'
    btn.style.cursor = check.checked ? 'pointer' : 'not-allowed'
  }

  btn.onclick = () => {
    localStorage.setItem('ardent-disclaimer-ack', 'true')
    overlay.classList.add('animate-fade-out')
    setTimeout(() => overlay.remove(), 400)
  }
}

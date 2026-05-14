import { supabase } from '../supabase'

export function renderLogin(container) {
  let isLogin = true

  function updateUI() {
    container.innerHTML = `
      <div class="m-auto animate-fade-in" style="max-width: 450px; width: 100%; padding: 20px;">
        <div class="glass-card p-8">
          <div class="text-center" style="margin-bottom: 2rem;">
            <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; background: linear-gradient(to right, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
              Ardent Exchange
            </h1>
            <p class="text-muted">${isLogin ? 'Secure Access' : 'New Member Registration'}</p>
          </div>

          <form id="auth-form">
            ${!isLogin ? `
              <div class="input-group">
                <label>Full Name</label>
                <input type="text" id="fullname" placeholder="Cpl John Doe" required />
              </div>
            ` : ''}
            <div class="input-group">
              <label>Email</label>
              <input type="email" id="email" placeholder="email@unit.com" required />
            </div>
            <div class="input-group">
              <label>Password</label>
              <input type="password" id="password" placeholder="••••••••" required />
            </div>
            
            <button type="submit" class="glass-btn primary" style="width: 100%; justify-content: center; margin-top: 1rem;">
              ${isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>
          
          <div class="text-center" style="margin-top: 1.5rem;">
            <p class="text-muted" style="font-size: 0.8rem; cursor: pointer;" id="toggle-auth">
              ${isLogin ? "Don't have an account? Register here" : "Already have an account? Login here"}
            </p>
          </div>
        </div>
      </div>
    `

    document.getElementById('toggle-auth').onclick = () => {
      isLogin = !isLogin
      updateUI()
    }

    const form = document.getElementById('auth-form')
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const email = document.getElementById('email').value
      const password = document.getElementById('password').value
      const btn = form.querySelector('button')
      
      btn.textContent = 'Processing...'
      btn.disabled = true

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          alert(error.message)
          btn.textContent = 'Login'
          btn.disabled = false
        }
      } else {
        const fullname = document.getElementById('fullname').value
        const allowedDomains = ['cadets.gc.ca', 'cdt.cadets.gc.ca', 'waterman.work']
        const emailDomain = email.split('@')[1]

        if (!allowedDomains.includes(emailDomain)) {
          alert('Error: Registration is restricted to official unit email domains (@cadets.gc.ca, @cdt.cadets.gc.ca, or @waterman.work).')
          btn.textContent = 'Create Account'
          btn.disabled = false
          return
        }

        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: fullname }
          }
        })
        if (error) {
          alert(error.message)
          btn.textContent = 'Create Account'
          btn.disabled = false
        } else {
          alert('Registration successful! Please login.')
          isLogin = true
          updateUI()
        }
      }
    })
  }

  updateUI()
}

import { supabase } from './supabase'
import { renderLogin } from './auth/login'
import { renderDashboard } from './dashboard/dashboard'
import { initHelpHub } from './components/HelpHub'

const app = document.getElementById('app')

// Apply saved theme
const savedTheme = localStorage.getItem('app-theme') || 'dark'
document.documentElement.setAttribute('data-theme', savedTheme)

initHelpHub()

async function init() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    console.log('No active session found')
    renderLogin(app)
  } else {
    console.log('Session found for user:', session.user.id)
    
    // Check user profile for role (officer vs cadet)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      
    if (error) {
      console.error('Error fetching profile:', error.message)
    }
    
    console.log('Profile data retrieved:', profile)
    renderDashboard(app, profile)
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      window.location.reload()
    }
    if (event === 'SIGNED_OUT') {
      renderLogin(app)
    }
  })
}

// Initializing routing
window.addEventListener('hashchange', () => {
  // Handle internal navigation if needed
})

init()

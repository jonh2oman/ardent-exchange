import { supabase } from '../supabase'

export async function renderOfficerView(container, profile) {
  const currencyName = profile.currency_name || 'Ardent Dollars'
  
  // Fetch real stats
  const { count: cadetCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'cadet')
  const { data: profiles } = await supabase.from('profiles').select('balance').eq('role', 'cadet')
  const { data: transactions } = await supabase.from('transactions').select('amount').eq('type', 'purchase')
  
  const totalInCirculation = profiles?.reduce((sum, p) => sum + (p.balance || 0), 0) || 0
  const totalSales = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="flex-row justify-between items-center" style="margin-bottom: 2rem;">
        <h1>Officer Command Hub</h1>
        <div class="text-muted">Economy Management</div>
      </div>

      <!-- Stats Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
        <div class="glass-card p-8">
          <p class="text-muted" style="font-size: 0.8rem; margin: 0;">TOTAL CURRENCY IN CIRCULATION</p>
          <div class="flex-row" style="align-items: baseline; gap: 0.5rem;">
            <span style="font-size: 2rem; font-weight: 700;">${totalInCirculation.toFixed(2)}</span>
            <span class="text-muted" style="font-size: 0.9rem;">${currencyName}</span>
          </div>
        </div>
        <div class="glass-card p-8">
          <p class="text-muted" style="font-size: 0.8rem; margin: 0;">ACTIVE CADET ACCOUNTS</p>
          <div class="flex-row" style="align-items: baseline; gap: 0.5rem;">
            <span style="font-size: 2rem; font-weight: 700;">${cadetCount || 0}</span>
            <span class="text-muted" style="font-size: 0.9rem;">Cadets</span>
          </div>
        </div>
        <div class="glass-card p-8">
          <p class="text-muted" style="font-size: 0.8rem; margin: 0;">TOTAL SALES (ALL TIME)</p>
          <div class="flex-row" style="align-items: baseline; gap: 0.5rem;">
            <span style="font-size: 2rem; font-weight: 700;">${totalSales.toFixed(2)}</span>
            <span class="text-muted" style="font-size: 0.9rem;">${currencyName}</span>
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
        <!-- Management Tools -->
        <div class="flex-col">
          <h3 style="margin-top: 0;">Economy Tools</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div class="glass-card p-8 hover-scale" id="tool-pos" style="cursor: pointer;">
              <h4 style="margin-top: 0;">Open POS System</h4>
              <p class="text-muted" style="font-size: 0.8rem;">Process sales for Canteen and Swag items.</p>
            </div>
            <div class="glass-card p-8 hover-scale" id="tool-ledger" style="cursor: pointer;">
              <h4 style="margin-top: 0;">Cadet Ledger</h4>
              <p class="text-muted" style="font-size: 0.8rem;">Manage individual balances and rewards.</p>
            </div>
            <div class="glass-card p-8 hover-scale" id="tool-inventory" style="cursor: pointer;">
              <h4 style="margin-top: 0;">Inventory Manager</h4>
              <p class="text-muted" style="font-size: 0.8rem;">Add new products and update stock levels.</p>
            </div>
            <div class="glass-card p-8 hover-scale" id="tool-settings" style="cursor: pointer;">
              <h4 style="margin-top: 0;">Unit Settings</h4>
              <p class="text-muted" style="font-size: 0.8rem;">Customize names and economy settings.</p>
            </div>
          </div>
        </div>

        <!-- System Alerts -->
        <div class="glass-card p-8">
          <h3 style="margin-top: 0;">Inventory Alerts</h3>
          <div id="alerts-list" class="flex-col">
            <p class="text-muted" style="font-size: 0.8rem;">Checking stock levels...</p>
          </div>
        </div>
      </div>
    </div>
  `

  // Hook up tools (shortcut logic)
  document.getElementById('tool-pos').onclick = () => document.querySelector('[data-view="pos"]').click()
  document.getElementById('tool-ledger').onclick = () => document.querySelector('[data-view="cadets"]').click()
  document.getElementById('tool-inventory').onclick = () => document.querySelector('[data-view="inventory"]').click()
  document.getElementById('tool-settings').onclick = () => document.querySelector('[data-view="settings"]').click()

  // Load Alerts
  const { data: lowStock } = await supabase.from('products').select('name, stock').lt('stock', 5).limit(3)
  const alertsList = document.getElementById('alerts-list')
  if (lowStock && lowStock.length > 0) {
    alertsList.innerHTML = lowStock.map(p => `
      <div style="padding: 1rem; background: rgba(245, 158, 11, 0.1); border-radius: 8px; border-left: 4px solid var(--accent);">
        <p style="margin: 0; font-size: 0.9rem; font-weight: 600;">Low Stock: ${p.name}</p>
        <p class="text-muted" style="margin: 0; font-size: 0.8rem;">Only ${p.stock} remaining in inventory.</p>
      </div>
    `).join('')
  } else {
    alertsList.innerHTML = `<p class="text-muted" style="font-size: 0.8rem;">All stock levels are healthy.</p>`
  }
}

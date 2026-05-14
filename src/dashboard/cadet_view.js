import { supabase } from '../supabase'

export async function renderCadetView(container, profile) {
  const currencyName = profile.currency_name || 'Ardent Dollars'
  
  // Fetch real transaction history
  const { data: history } = await supabase
    .from('transactions')
    .select('*')
    .eq('cadet_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const lastReward = history?.find(t => t.type === 'reward' || t.amount > 0)?.amount || 0
  const lastSpent = history?.find(t => t.type === 'purchase' || t.amount < 0)?.amount || 0
  
  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="flex-row justify-between items-center" style="margin-bottom: 2rem;">
        <h1>Dashboard</h1>
        <div class="text-muted">Welcome back, ${profile.full_name || 'Cadet'}</div>
      </div>

      <!-- Balance Card -->
      <div class="glass-card" style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 3rem; margin-bottom: 2rem; position: relative; overflow: hidden; border: 1px solid var(--primary);">
        <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: var(--primary); filter: blur(100px); opacity: 0.2;"></div>
        
        <p class="text-muted" style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.8rem; margin-bottom: 1rem;">
          Total Account Balance
        </p>
        <div class="flex-row" style="align-items: baseline;">
          <span style="font-size: 4rem; font-weight: 800; font-family: 'Outfit';">
            ${(profile.balance || 0).toFixed(2)}
          </span>
          <span class="text-muted" style="font-size: 1.5rem; margin-left: 0.5rem;">${currencyName}</span>
        </div>
        
        <div style="margin-top: 2rem; display: flex; gap: 2rem;">
          <div>
            <p class="text-muted" style="font-size: 0.7rem; margin: 0;">LAST REWARD</p>
            <p style="margin: 0; font-weight: 600; color: var(--success);">+${lastReward.toFixed(2)}</p>
          </div>
          <div>
            <p class="text-muted" style="font-size: 0.7rem; margin: 0;">LAST SPENT</p>
            <p style="margin: 0; font-weight: 600; color: var(--danger);">${lastSpent.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div class="flex-row" style="align-items: flex-start; gap: 2rem;">
        <!-- Recent History -->
        <div class="glass-card p-8" style="flex: 2;">
          <h3 style="margin-top: 0;">Recent Transactions</h3>
          <div id="transaction-list" class="flex-col" style="gap: 1px; background: var(--glass-border); border-radius: 8px; overflow: hidden;">
            ${history && history.length > 0 ? history.map(t => `
              <div class="flex-row justify-between p-8" style="background: var(--bg-surface); padding: 1rem;">
                <div>
                  <p style="margin: 0; font-weight: 600;">${t.description}</p>
                  <p class="text-muted" style="margin: 0; font-size: 0.7rem;">${new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <span style="font-weight: 700; color: ${t.amount >= 0 ? 'var(--success)' : 'var(--danger)'};">
                  ${t.amount >= 0 ? '+' : ''}${t.amount.toFixed(2)}
                </span>
              </div>
            `).join('') : `
              <div class="p-8 text-center text-muted" style="background: var(--bg-surface);">No transactions yet.</div>
            `}
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="glass-card p-8" style="flex: 1;">
          <h3 style="margin-top: 0;">Quick Actions</h3>
          <div class="flex-col">
            <button class="glass-btn" style="width: 100%;" onclick="alert('Store coming soon to Cadet View!')">Browse Shop</button>
            <button class="glass-btn" style="width: 100%;" onclick="alert('Rewards guide coming soon!')">View Rewards Guide</button>
          </div>
        </div>
      </div>
    </div>
  `
}

import { supabase } from '../supabase'

export async function renderLedger(container) {
  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="flex-row justify-between items-center" style="margin-bottom: 2rem;">
        <h1>Cadet Ledger</h1>
        <button id="add-member-btn" class="glass-btn primary">+ Add New Member</button>
      </div>

      <!-- Add Member Modal -->
      <div id="add-member-modal" class="glass-card" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 100; width: 400px; padding: 2rem;">
        <h3>Pre-Authorize Member</h3>
        <p class="text-muted" style="font-size: 0.8rem;">Enter their details below. When they sign up with this email, they will automatically get their role.</p>
        <form id="add-member-form">
          <div class="input-group">
            <label>Full Name</label>
            <input type="text" id="new-mem-name" placeholder="e.g. Cpl Bloggins" required />
          </div>
          <div class="input-group">
            <label>Email Address</label>
            <input type="email" id="new-mem-email" placeholder="cadet@unit.com" required />
          </div>
          <div class="input-group">
            <label>Role</label>
            <select id="new-mem-role" class="glass-btn" style="width: 100%; height: 45px;">
              <option value="cadet">Cadet</option>
              <option value="officer">Officer</option>
            </select>
          </div>
          <div class="flex-row" style="margin-top: 1rem;">
            <button type="submit" class="glass-btn primary" style="flex: 1;">Authorize</button>
            <button type="button" id="close-add-modal" class="glass-btn" style="flex: 1;">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Reward Modal -->
      <div id="ledger-modal" class="glass-card" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 100; width: 400px; padding: 2rem;">
        <h3>Adjust Balance</h3>
        <p id="cadet-target-name" class="text-muted"></p>
        <form id="ledger-form">
          <input type="hidden" id="target-cadet-id" />
          <div class="input-group">
            <label>Amount (Use negative for penalties)</label>
            <input type="number" step="0.01" id="adj-amount" placeholder="e.g. 5.00" required />
          </div>
          <div class="input-group">
            <label>Reason / Note</label>
            <input type="text" id="adj-reason" placeholder="e.g. Marksmanship Reward" required />
          </div>
          <div class="flex-row" style="margin-top: 1rem;">
            <button type="submit" class="glass-btn primary" style="flex: 1;">Apply Adjustment</button>
            <button type="button" id="close-ledger-modal" class="glass-btn" style="flex: 1;">Cancel</button>
          </div>
        </form>
      </div>

      <div class="glass-card" style="overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: var(--glass); border-bottom: 1px solid var(--glass-border);">
              <th style="padding: 1rem;">Cadet Name</th>
              <th style="padding: 1rem;">Current Balance</th>
              <th style="padding: 1rem;">Actions</th>
            </tr>
          </thead>
          <tbody id="cadet-list">
            <tr>
              <td colspan="3" style="padding: 2rem; text-align: center;" class="text-muted">Loading cadets...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `

  const list = document.getElementById('cadet-list')
  const modal = document.getElementById('ledger-modal')
  const addModal = document.getElementById('add-member-modal')
  const form = document.getElementById('ledger-form')
  const addForm = document.getElementById('add-member-form')

  // Add Member logic
  document.getElementById('add-member-btn').onclick = () => addModal.style.display = 'block'
  document.getElementById('close-add-modal').onclick = () => addModal.style.display = 'none'

  addForm.onsubmit = async (e) => {
    e.preventDefault()
    const member = {
      email: document.getElementById('new-mem-email').value,
      full_name: document.getElementById('new-mem-name').value,
      role: document.getElementById('new-mem-role').value
    }

    const { error } = await supabase.from('pre_authorized_members').insert([member])
    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert(`${member.full_name} has been pre-authorized! They can now sign up with that email.`)
      addModal.style.display = 'none'
      addForm.reset()
    }
  }

  async function loadCadets() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'cadet')
      .order('full_name')
    
    if (error) {
      alert(error.message)
      return
    }

    if (data.length === 0) {
      list.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 2rem;">No cadets found. Ask them to log in to create their profile!</td></tr>`
      return
    }

    list.innerHTML = data.map(c => `
      <tr>
        <td><strong>${c.full_name || 'Anonymous Cadet'}</strong></td>
        <td style="font-weight: 700; color: var(--primary);">${c.balance.toFixed(2)}</td>
        <td>
          <button class="glass-btn adjust-btn" data-id="${c.id}" data-name="${c.full_name}" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">Add/Subtract Funds</button>
        </td>
      </tr>
    `).join('')

    document.querySelectorAll('.adjust-btn').forEach(btn => {
      btn.onclick = () => {
        document.getElementById('target-cadet-id').value = btn.dataset.id
        document.getElementById('cadet-target-name').textContent = `Adjusting balance for ${btn.dataset.name}`
        modal.style.display = 'block'
      }
    })
  }

  document.getElementById('close-ledger-modal').onclick = () => modal.style.display = 'none'

  form.onsubmit = async (e) => {
    e.preventDefault()
    const id = document.getElementById('target-cadet-id').value
    const amount = parseFloat(document.getElementById('adj-amount').value)
    const reason = document.getElementById('adj-reason').value

    // 1. Get current balance
    const { data: cadet } = await supabase.from('profiles').select('balance').eq('id', id).single()
    const newBalance = (cadet.balance || 0) + amount

    // 2. Update balance
    const { error: updError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', id)
    
    if (updError) {
      alert(updError.message)
      return
    }

    // 3. Log transaction
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('transactions').insert({
      cadet_id: id,
      officer_id: user.id,
      amount: amount,
      type: amount >= 0 ? 'reward' : 'manual_adjustment',
      description: reason
    })

    modal.style.display = 'none'
    form.reset()
    loadCadets()
    alert('Ledger updated successfully!')
  }

  loadCadets()
}

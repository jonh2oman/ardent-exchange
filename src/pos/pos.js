import { supabase } from '../supabase'

export async function renderPOS(container, profile) {
  const currencyName = profile.currency_name || 'Ardent Dollars'
  let cart = []
  let selectedCadet = null
  let products = []

  container.innerHTML = `
    <div class="animate-fade-in flex-row" style="height: 100%; gap: 2rem;">
      <!-- Product Selection -->
      <div style="flex: 2; overflow-y: auto;">
        <div class="flex-row justify-between items-center" style="margin-bottom: 2rem;">
          <h1>Point of Sale</h1>
          <div class="flex-row">
            <input type="text" id="product-search" placeholder="Search products..." style="width: 250px;" />
          </div>
        </div>

        <div id="product-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.5rem;">
          <!-- Products will be loaded here -->
        </div>
      </div>

      <!-- Checkout Sidebar -->
      <div class="glass-card flex-col" style="flex: 1; min-width: 350px; padding: 1.5rem;">
        <h3 style="margin-top: 0;">New Sale</h3>
        
        <div class="input-group">
          <label>Identify Cadet</label>
          <div style="position: relative;">
            <input type="text" id="cadet-search" placeholder="Type name to search..." autocomplete="off" />
            <div id="cadet-results" class="glass-card" style="display: none; position: absolute; top: 100%; left: 0; right: 0; z-index: 50; max-height: 200px; overflow-y: auto;"></div>
          </div>
          <div id="selected-cadet-display" style="margin-top: 0.5rem; display: none;">
            <span class="glass-btn primary" style="font-size: 0.8rem; padding: 0.3rem 0.6rem; width: 100%; justify-content: space-between;">
              <span id="cadet-name-tag"></span>
              <span id="clear-cadet" style="cursor: pointer; opacity: 0.7;">&times;</span>
            </span>
          </div>
        </div>

        <div id="cart-items" style="flex: 1; border: 1px solid var(--glass-border); border-radius: 8px; margin-bottom: 1rem; overflow-y: auto; padding: 1rem;">
          <p class="text-center text-muted" style="margin-top: 2rem;">Cart is empty</p>
        </div>

        <div style="border-top: 1px solid var(--glass-border); padding-top: 1rem;">
          <div class="flex-row justify-between" style="margin-bottom: 0.5rem;">
            <span>Subtotal</span>
            <span id="cart-subtotal">0.00</span>
          </div>
          <div class="flex-row justify-between" style="font-weight: 700; font-size: 1.2rem; margin-bottom: 1.5rem;">
            <span>Total</span>
            <span style="color: var(--accent);"><span id="cart-total">0.00</span> ${currencyName}</span>
          </div>
          
          <button id="complete-sale-btn" class="glass-btn primary" style="width: 100%; justify-content: center; height: 60px; font-size: 1.2rem;" disabled>
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  `

  const grid = document.getElementById('product-grid')
  const cartList = document.getElementById('cart-items')
  const subtotalEl = document.getElementById('cart-subtotal')
  const totalEl = document.getElementById('cart-total')
  const cadetSearch = document.getElementById('cadet-search')
  const cadetResults = document.getElementById('cadet-results')
  const saleBtn = document.getElementById('complete-sale-btn')

  // Load products
  async function loadProducts() {
    const { data } = await supabase.from('products').select('*').gt('stock', 0).order('name')
    products = data || []
    renderProducts(products)
  }

  function renderProducts(items) {
    grid.innerHTML = items.map(p => `
      <div class="glass-card product-card" data-id="${p.id}" style="cursor: pointer; overflow: hidden; transition: all 0.2s;">
        <div style="height: 100px; background: var(--glass); display: flex; align-items: center; justify-content: center; font-size: 2rem;">
          ${p.category === 'Canteen' ? '🥤' : '👕'}
        </div>
        <div style="padding: 1rem;">
          <p style="margin: 0; font-weight: 600;">${p.name}</p>
          <div class="flex-row justify-between">
            <span class="text-muted" style="font-size: 0.8rem;">${p.price.toFixed(2)}</span>
            <span style="font-size: 0.7rem; color: var(--success);">${p.stock} in stock</span>
          </div>
        </div>
      </div>
    `).join('')

    document.querySelectorAll('.product-card').forEach(card => {
      card.onclick = () => addToCart(items.find(i => i.id === card.dataset.id))
    })
  }

  function addToCart(p) {
    const existing = cart.find(item => item.id === p.id)
    if (existing) {
      if (existing.quantity < p.stock) existing.quantity++
    } else {
      cart.push({ ...p, quantity: 1 })
    }
    updateCartUI()
  }

  function updateCartUI() {
    if (cart.length === 0) {
      cartList.innerHTML = `<p class="text-center text-muted" style="margin-top: 2rem;">Cart is empty</p>`
    } else {
      cartList.innerHTML = cart.map(item => `
        <div class="flex-row justify-between" style="margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--glass-border);">
          <div>
            <p style="margin: 0; font-size: 0.9rem;">${item.name}</p>
            <p class="text-muted" style="margin: 0; font-size: 0.7rem;">${item.quantity} x ${item.price.toFixed(2)}</p>
          </div>
          <span style="font-weight: 600;">${(item.quantity * item.price).toFixed(2)}</span>
        </div>
      `).join('')
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    subtotalEl.textContent = total.toFixed(2)
    totalEl.textContent = total.toFixed(2)
    
    saleBtn.disabled = cart.length === 0 || !selectedCadet
  }

  // Cadet Search Logic
  cadetSearch.oninput = async () => {
    const term = cadetSearch.value
    if (term.length < 2) {
      cadetResults.style.display = 'none'
      return
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, balance')
      .eq('role', 'cadet')
      .ilike('full_name', `%${term}%`)
      .limit(5)

    if (data && data.length > 0) {
      cadetResults.innerHTML = data.map(c => `
        <div class="p-8 cadet-item" data-id="${c.id}" style="cursor: pointer; border-bottom: 1px solid var(--glass-border); background: var(--bg-surface);">
          <p style="margin: 0;">${c.full_name}</p>
          <p class="text-muted" style="margin: 0; font-size: 0.7rem;">Balance: ${c.balance.toFixed(2)}</p>
        </div>
      `).join('')
      cadetResults.style.display = 'block'

      document.querySelectorAll('.cadet-item').forEach(item => {
        item.onclick = () => {
          selectedCadet = data.find(c => c.id === item.dataset.id)
          document.getElementById('cadet-name-tag').textContent = `${selectedCadet.full_name} (${selectedCadet.balance.toFixed(2)})`
          document.getElementById('selected-cadet-display').style.display = 'block'
          cadetSearch.style.display = 'none'
          cadetResults.style.display = 'none'
          updateCartUI()
        }
      })
    }
  }

  document.getElementById('clear-cadet').onclick = () => {
    selectedCadet = null
    document.getElementById('selected-cadet-display').style.display = 'none'
    cadetSearch.style.display = 'block'
    cadetSearch.value = ''
    updateCartUI()
  }

  // Complete Sale
  saleBtn.onclick = async () => {
    const totalCost = parseFloat(totalEl.textContent)
    
    if (selectedCadet.balance < totalCost) {
      alert('Insufficient funds! This cadet only has ' + selectedCadet.balance.toFixed(2))
      return
    }

    saleBtn.disabled = true
    saleBtn.textContent = 'Processing...'

    try {
      // 1. Subtract from Cadet Balance
      const { error: balError } = await supabase
        .from('profiles')
        .update({ balance: selectedCadet.balance - totalCost })
        .eq('id', selectedCadet.id)

      if (balError) throw balError

      // 2. Reduce Inventory Stock
      for (const item of cart) {
        const { error: stockError } = await supabase.rpc('decrement_stock', { 
          row_id: item.id, 
          amount: item.quantity 
        })
        // Note: We might need to create this RPC or just use update. 
        // For simplicity now, let's just use update.
        await supabase.from('products').update({ stock: item.stock - item.quantity }).eq('id', item.id)
      }

      // 3. Log Transaction
      await supabase.from('transactions').insert({
        cadet_id: selectedCadet.id,
        officer_id: profile.id,
        amount: totalCost,
        type: 'purchase',
        description: `Purchased: ${cart.map(i => i.name).join(', ')}`
      })

      alert('Sale successful!')
      window.location.reload() // Quickest way to reset state
    } catch (e) {
      alert('Error: ' + e.message)
      saleBtn.disabled = false
      saleBtn.textContent = 'Complete Sale'
    }
  }

  loadProducts()
}

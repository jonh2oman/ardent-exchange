import { supabase } from '../supabase'

export async function renderInventory(container) {
  container.innerHTML = `
    <div class="animate-fade-in">
      <div class="flex-row justify-between items-center" style="margin-bottom: 2rem;">
        <h1>Inventory Manager</h1>
        <button id="add-product-btn" class="glass-btn primary">
          + Add New Product
        </button>
      </div>

      <!-- Add Product Modal (Hidden by default) -->
      <div id="product-modal" class="glass-card" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 100; width: 400px; padding: 2rem;">
        <h3 id="modal-title">Add Product</h3>
        <form id="product-form">
          <input type="hidden" id="prod-id" />
          <div class="input-group">
            <label>Product Name</label>
            <input type="text" id="prod-name" placeholder="e.g. Ardent Hoodie" required />
          </div>
          <div class="input-group">
            <label>Category</label>
            <select id="prod-category" class="glass-btn" style="width: 100%; height: 45px;">
              <option value="Swag">Swag</option>
              <option value="Canteen">Canteen</option>
            </select>
          </div>
          <div class="input-group">
            <label>Price</label>
            <input type="number" step="0.01" id="prod-price" placeholder="0.00" required />
          </div>
          <div class="input-group">
            <label>Stock Level</label>
            <input type="number" id="prod-stock" placeholder="0" required />
          </div>
          <div class="flex-row" style="margin-top: 1rem;">
            <button type="submit" class="glass-btn primary" style="flex: 1;">Save Product</button>
            <button type="button" id="close-modal" class="glass-btn" style="flex: 1;">Cancel</button>
          </div>
        </form>
      </div>

      <!-- Inventory Table -->
      <div class="glass-card" style="overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="background: var(--glass); border-bottom: 1px solid var(--glass-border);">
              <th style="padding: 1rem;">Product</th>
              <th style="padding: 1rem;">Category</th>
              <th style="padding: 1rem;">Price</th>
              <th style="padding: 1rem;">Stock</th>
              <th style="padding: 1rem;">Actions</th>
            </tr>
          </thead>
          <tbody id="inventory-list">
            <tr>
              <td colspan="5" style="padding: 2rem; text-align: center;" class="text-muted">Loading inventory...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <style>
      th { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }
      td { padding: 1rem; border-bottom: 1px solid var(--glass-border); }
      tr:last-child td { border-bottom: none; }
    </style>
  `

  const list = document.getElementById('inventory-list')
  const modal = document.getElementById('product-modal')
  const form = document.getElementById('product-form')
  
  // Load products
  async function loadProducts() {
    const { data, error } = await supabase.from('products').select('*').order('name')
    if (error) {
      alert(error.message)
      return
    }
    
    if (data.length === 0) {
      list.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem;">No products found. Add one to get started!</td></tr>`
      return
    }

    list.innerHTML = data.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td><span class="glass-btn" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; cursor: default;">${p.category}</span></td>
        <td style="color: var(--accent); font-weight: 700;">${p.price.toFixed(2)}</td>
        <td>${p.stock}</td>
        <td>
          <button class="glass-btn edit-btn" data-id="${p.id}" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">Edit</button>
        </td>
      </tr>
    `).join('')

    // Add event listeners for edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = data.find(item => item.id === btn.dataset.id)
        openModal(p)
      })
    })
  }

  function openModal(p = null) {
    if (p) {
      document.getElementById('modal-title').textContent = 'Edit Product'
      document.getElementById('prod-id').value = p.id
      document.getElementById('prod-name').value = p.name
      document.getElementById('prod-category').value = p.category
      document.getElementById('prod-price').value = p.price
      document.getElementById('prod-stock').value = p.stock
    } else {
      document.getElementById('modal-title').textContent = 'Add Product'
      form.reset()
      document.getElementById('prod-id').value = ''
    }
    modal.style.display = 'block'
  }

  document.getElementById('add-product-btn').onclick = () => openModal()
  document.getElementById('close-modal').onclick = () => modal.style.display = 'none'

  form.onsubmit = async (e) => {
    e.preventDefault()
    const id = document.getElementById('prod-id').value
    const product = {
      name: document.getElementById('prod-name').value,
      category: document.getElementById('prod-category').value,
      price: parseFloat(document.getElementById('prod-price').value),
      stock: parseInt(document.getElementById('prod-stock').value)
    }

    let error
    if (id) {
      const { error: err } = await supabase.from('products').update(product).eq('id', id)
      error = err
    } else {
      const { error: err } = await supabase.from('products').insert([product])
      error = err
    }

    if (error) {
      alert(error.message)
    } else {
      modal.style.display = 'none'
      loadProducts()
    }
  }

  loadProducts()
}

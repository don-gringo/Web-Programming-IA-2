//Brandon Hibbert 2304765 | brandonbhibbert@students.utech.edu.jm | Friday 8AM

const PRODUCT_CATALOG = {
    'gold': {name:'Gold', price:60000},
    'iron': {name:'Iron', price:45000},
    'copper': {name:'Copper', price:50000},
    'lead': {name:'Lead', price:24000},
    'aluminum': {name:'Aluminum', price:10000},
    'zinc': {name:'Zinc', price:13000}
};

const TAX_RATE = 0.50; // 10% tax
const BULK_DISCOUNT_RATE = 0.05; // 5% if quantity > 20 MT (per item)

function $(sel){ 
    return document.querySelector(sel);
}

function $all(sel){
    return Array.from(document.querySelectorAll(sel));
}

function saveCart(cart){
    sessionStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();

}
function loadCart(){
    return JSON.parse(sessionStorage.getItem('cart')||'{}'); }

function updateCartCount(){
    const cart = loadCart();
    let count = 0;
    Object.values(cart).forEach(it => count += it.qty);
    $all('#cart-count').forEach(el => el.textContent = count);
}

function initProductsPage(){
    $all('.add-cart').forEach(btn=>{
        btn.addEventListener('click', (e)=>{
            const id = btn.dataset.id;
            const qtyInput = document.getElementById('qty-'+id);
            const qty = parseFloat(qtyInput.value) || 0;
            if(qty <= 0){
                alert('Please enter a quantity greater than 0');
                return;
            }
            const cart = loadCart();
            if(!cart[id]) cart[id] = {id:id, name: PRODUCT_CATALOG[id].name, price: PRODUCT_CATALOG[id].price, qty:0};
            cart[id].qty = parseFloat((cart[id].qty + qty).toFixed(2));
            saveCart(cart);
            alert(PRODUCT_CATALOG[id].name + ' added to cart.');
        });
    });
    updateCartCount();
}

function renderCartPage(){
    const area = $('#cart-area');
    if(!area) return;
    const cart = loadCart();
    area.innerHTML = '';
    if(Object.keys(cart).length === 0){
        area.innerHTML = '<p>Your cart is empty. Visit <a href="products.html">Products</a>.</p>';
        return;
    }
    const table = document.createElement('div');
    table.className = 'card';
    table.innerHTML = '<h3>Items</h3>';
    let subtotal = 0;
    Object.values(cart).forEach(item=>{
        const itemLine = document.createElement('div');
        const itemTotal = item.price * item.qty;
        // bulk discount per item if qty > 20
        const bulk = item.qty > 20 ? itemTotal * BULK_DISCOUNT_RATE : 0;
        const lineSubtotal = itemTotal - bulk;
        subtotal += lineSubtotal;
        itemLine.innerHTML = `<p><strong>${item.name}</strong> — JMD ${item.price.toLocaleString()} / Ton
        <br>Qty: <input type="number" min="0" step="0.1" value="${item.qty}" data-id="${item.id}" class="cart-qty" />
        &nbsp; Sub-total: JMD ${lineSubtotal.toLocaleString()} ${bulk ? '(bulk discount applied)' : ''} 
        <button class="btn remove-item" data-id="${item.id}">Remove</button></p>`;
        table.appendChild(itemLine);
    });
    area.appendChild(table);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    const summary = document.createElement('div');
    summary.className = 'card';
    summary.innerHTML = `<h3>Summary</h3>
        <p>Subtotal: JMD ${subtotal.toLocaleString()}</p>
        <p>Tax (10%): JMD ${tax.toLocaleString()}</p>
        <p><strong>Total: JMD ${total.toLocaleString()}</strong></p>`;
    area.appendChild(summary);

    $all('.remove-item').forEach(btn=>btn.addEventListener('click', (e)=>{
        const id = btn.dataset.id;
        const cart = loadCart();
        delete cart[id];
        saveCart(cart);
        renderCartPage();
    }));

    $all('.cart-qty').forEach(input=>{
        input.addEventListener('change', (e)=>{
            const id = input.dataset.id;
            const q = parseFloat(input.value) || 0;
            const cart = loadCart();
            if(q <= 0){
                delete cart[id];
                }else{
                    cart[id].qty = parseFloat(q.toFixed(2));
                }
            saveCart(cart);
            renderCartPage();
        });
    });

    // clear cart and checkout
    $('#clear-cart').addEventListener('click', ()=>{
        if(confirm('Clear all items?')){
            sessionStorage.removeItem('cart'); updateCartCount(); renderCartPage();
        }
    });
    $('#checkout').addEventListener('click', ()=>{
        $('#checkout-form').classList.remove('hidden');
        // fill summary
        $('#checkout-summary').textContent = summary.innerText;
    });

    $('#cancel-checkout').addEventListener('click', ()=>{
        $('#checkout-form').classList.add('hidden');
    });
}


function initAuthPage(){
  const loginForm = $('#loginForm');
  const regForm = $('#registerForm');
  if(loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const u = $('#login-username').value.trim();
      const p = $('#login-password').value;
      const accounts = JSON.parse(sessionStorage.getItem('accounts')||'{}');
      if(accounts[u] && accounts[u].password === p){
        sessionStorage.setItem('sessionUser', u);
        alert('Login successful');
        window.location.href = 'index.html';
      } else {
        alert('Invalid username or password.');
      }
    });
  }
  if(regForm){
    regForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const name = $('#reg-name').value.trim();
      const idnum = $('#reg-id').value.trim();
      const address = $('#reg-address').value.trim();
      const phone = $('#reg-phone').value.trim();
      const email = $('#reg-email').value.trim();
      const username = $('#reg-username').value.trim();
      const password = $('#reg-password').value;
      if(!username || !password){ alert('Please choose a username and password.'); return; }
      const accounts = JSON.parse(sessionStorage.getItem('accounts')||'{}');
      if(accounts[username]){ alert('Username already exists.'); return; }
      accounts[username] = {name, idnum, address, phone, email, password};
      sessionStorage.setItem('accounts', JSON.stringify(accounts));

      sessionStorage.setItem('sessionUser', username);
      alert('Registration complete. You are now logged in.');
      window.location.href = 'index.html';
    });
  }
}


document.addEventListener('DOMContentLoaded', ()=>{

  const user = sessionStorage.getItem('sessionUser');
  const accountLink = document.getElementById('account-link');
  if(accountLink){
    if(user){
      accountLink.textContent = user + ' (Logout)';
      accountLink.href = 'login.html';
      accountLink.addEventListener('click', (e)=>{if(confirm('Logout?'))
        { sessionStorage.removeItem('sessionUser');} 
      });
    }
    else { accountLink.textContent = 'Login'; accountLink.href = 'login.html'; }
  }
  initProductsPage();
  renderCartPage();
  initAuthPage();

  
});

document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.getElementById('checkoutForm');

  if (checkoutForm) {

    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('ship-name').value.trim();
      const phone = document.getElementById('ship-phone').value.trim();
      const address = document.getElementById('ship-address').value.trim();

      const cart = JSON.parse(JSON.stringify(
        JSON.parse(sessionStorage.getItem('cart') || '{}')
      ));

      let receipt = `RECEIPT\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nItems:\n`;
      let subtotal = 0;

      Object.values(cart).forEach(item => {
        const total = item.qty * item.price;
        subtotal += total;
        receipt += `- ${item.name}: ${item.qty}MT x JMD ${item.price} = ${total}\n`;
      });

      const tax = subtotal * 0.10;
      const grandTotal = subtotal + tax;

      receipt += `\nSubtotal: ${subtotal}\nTax (10%): ${tax}\nTotal: ${grandTotal}\n\nThank you for cleaning up Jamaica!`;

      sessionStorage.setItem('finalReceipt', receipt);

      sessionStorage.removeItem('cart');

      window.location.href = 'receipt.html';
    });
  }
});
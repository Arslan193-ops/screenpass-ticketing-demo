// ---- Demo content (shown with zero setup; switch to "Connect Live API" to hit a real Cinema instance) ----

const DEMO_MOVIES = [
  { title: 'Starlight Horizon', emoji: '🚀', c1: '#2b1055', c2: '#7597de', screen: 'Screen 1 - IMAX', priceVip: 1200, priceRegular: 800, pricePremium: 1000, inMin: 45 },
  { title: 'Midnight Caper', emoji: '🕵️', c1: '#1f1c2c', c2: '#928dab', screen: 'Screen 2', priceVip: 1100, priceRegular: 700, pricePremium: 900, inMin: 120 },
  { title: 'The Last Harvest', emoji: '🌾', c1: '#3a6b35', c2: '#c9d6a3', screen: 'Screen 1 - IMAX', priceVip: 1300, priceRegular: 850, pricePremium: 1050, inMin: 210 },
  { title: 'Crimson Tide Rising', emoji: '🌊', c1: '#7f1d1d', c2: '#f97373', screen: 'Screen 3', priceVip: 1250, priceRegular: 780, pricePremium: 980, inMin: 300 },
  { title: 'Paper Moon Diaries', emoji: '🎐', c1: '#3b2f63', c2: '#e0c3fc', screen: 'Screen 2', priceVip: 1150, priceRegular: 750, pricePremium: 950, inMin: 390 },
];

const DEMO_MENU = [
  { menuId: 1, name: 'Classic Popcorn (Large)', emoji: '🍿', description: 'Buttery, salty, freshly popped.', price: 450 },
  { menuId: 2, name: 'Nachos Supreme', emoji: '🧀', description: 'Crisp nachos with cheese & jalapeños.', price: 550 },
  { menuId: 3, name: 'Loaded Hot Dog', emoji: '🌭', description: 'Beef hotdog, mustard, fried onions.', price: 480 },
  { menuId: 4, name: 'Chilled Soda (Regular)', emoji: '🥤', description: 'Pick your favorite fizzy drink.', price: 250 },
  { menuId: 5, name: 'Chocolate Fudge Sundae', emoji: '🍨', description: 'Vanilla ice cream, warm fudge.', price: 380 },
  { menuId: 6, name: 'Cheesy Fries', emoji: '🍟', description: 'Golden fries drenched in cheese sauce.', price: 400 },
];

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function categoryForRow(row) {
  if (row === 'A' || row === 'B') return 'VIP';
  if (row === 'G' || row === 'H') return 'Premium';
  return 'Regular';
}

function generateDemoSeats(showIndex) {
  const rand = seededRandom(showIndex * 97 + 13);
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seats = [];
  rows.forEach(row => {
    for (let n = 1; n <= 10; n++) {
      const category = categoryForRow(row);
      seats.push({
        seatId: `${row}${n}`,
        seatNumber: `${row}${n}`,
        category,
        price: category === 'VIP' ? 1200 : category === 'Premium' ? 1000 : 800,
        isSold: rand() < 0.18,
      });
    }
  });
  return seats;
}

let demoSeatMaps = {};

function getDemoShows() {
  const now = Date.now();
  return DEMO_MOVIES.map((m, i) => ({
    showId: `demo-${i}`,
    movieTitle: m.title,
    screenName: m.screen,
    startTime: new Date(now + m.inMin * 60000).toISOString(),
    priceVip: m.priceVip,
    priceRegular: m.priceRegular,
    pricePremium: m.pricePremium,
    _emoji: m.emoji, _c1: m.c1, _c2: m.c2, _index: i,
  }));
}

// ---- Mode + settings ----

const state = { mode: 'demo' };

const modeBadge = document.getElementById('modeBadge');
const apiPanel = document.getElementById('apiPanel');
const baseUrlInput = document.getElementById('baseUrl');
const apiKeyInput = document.getElementById('apiKey');

baseUrlInput.value = localStorage.getItem('demoBaseUrl') || 'http://localhost:5272';
apiKeyInput.value = localStorage.getItem('demoApiKey') || '';

function setMode(mode) {
  state.mode = mode;
  if (mode === 'live') {
    modeBadge.textContent = '● Live API';
    modeBadge.className = 'badge live';
  } else {
    modeBadge.textContent = '● Demo Mode';
    modeBadge.className = 'badge demo';
  }
}

document.getElementById('toggleApiPanel').onclick = () => apiPanel.classList.toggle('hidden');
document.getElementById('useDemoBtn').onclick = () => {
  setMode('demo');
  apiPanel.classList.add('hidden');
  document.getElementById('settingsStatus').textContent = '';
};

document.getElementById('saveSettings').onclick = async () => {
  localStorage.setItem('demoBaseUrl', baseUrlInput.value.trim());
  localStorage.setItem('demoApiKey', apiKeyInput.value.trim());
  const status = document.getElementById('settingsStatus');
  status.textContent = 'Checking...';
  const res = await callApi('GET', '/ping');
  if (res.ok) {
    setMode('live');
    status.textContent = 'Connected — now using the live API.';
  } else {
    status.textContent = 'Failed: ' + (res.data.message || res.status);
  }
};

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.remove('hidden');
  };
});

async function callApi(method, path, body) {
  const baseUrl = localStorage.getItem('demoBaseUrl');
  const apiKey = localStorage.getItem('demoApiKey');
  const res = await fetch('/api/proxy' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-Base-Url': baseUrl || '',
      'X-Demo-Api-Key': apiKey || '',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function renderResult(container, obj, isError) {
  container.parentElement.classList.remove('hidden');
  if (isError) {
    container.innerHTML = `<div class="row"><span class="label">Error</span><span>${obj.message || 'Request failed'}</span></div>`;
    return;
  }
  const skip = new Set(['items']);
  const rows = Object.entries(obj)
    .filter(([k, v]) => !skip.has(k) && v !== null && v !== undefined && !k.startsWith('_'))
    .map(([k, v]) => {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
      return `<div class="row"><span class="label">${label}</span><span>${v}</span></div>`;
    }).join('');
  container.innerHTML = rows;
}

// ---- Movies & Tickets ----

let currentShows = [];
let selectedShow = null;
let selectedSeat = null;

function posterStyle(show) {
  if (show._c1) return `background: linear-gradient(135deg, ${show._c1}, ${show._c2});`;
  const palettes = [['#2b1055', '#7597de'], ['#1f1c2c', '#928dab'], ['#3a6b35', '#c9d6a3'], ['#7f1d1d', '#f97373']];
  const p = palettes[show.showId % palettes.length] || palettes[0];
  return `background: linear-gradient(135deg, ${p[0]}, ${p[1]});`;
}

document.getElementById('loadShows').onclick = async () => {
  const list = document.getElementById('showsList');
  list.textContent = 'Loading...';

  if (state.mode === 'demo') {
    currentShows = getDemoShows();
  } else {
    const res = await callApi('GET', '/shows');
    if (!res.ok) { list.textContent = 'Error: ' + (res.data.message || res.status); return; }
    currentShows = res.data.data || [];
  }

  list.innerHTML = '';
  if (currentShows.length === 0) {
    list.innerHTML = '<p style="color:var(--text-dim)">No upcoming shows found.</p>';
    return;
  }
  currentShows.forEach(show => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <div class="movie-poster" style="${posterStyle(show)}">${show._emoji || '🎬'}</div>
      <div class="movie-body">
        <div class="movie-title">${show.movieTitle}</div>
        <div class="movie-meta">${show.screenName} · ${new Date(show.startTime).toLocaleString()}</div>
        <div class="movie-prices">Regular <b>${show.priceRegular}</b> · VIP <b>${show.priceVip}</b> · Premium <b>${show.pricePremium}</b></div>
        <button class="btn-primary">Select Showtime</button>
      </div>
    `;
    card.querySelector('button').onclick = () => selectShow(show);
    list.appendChild(card);
  });
};

async function selectShow(show) {
  selectedShow = show;
  selectedSeat = null;
  document.getElementById('bookTicketBtn').disabled = true;
  document.getElementById('ticketResultSection').classList.add('hidden');
  document.getElementById('seatSection').classList.remove('hidden');
  document.getElementById('seatSectionTitle').textContent = `${show.movieTitle} — ${show.screenName}`;
  const seatMap = document.getElementById('seatMap');
  seatMap.textContent = 'Loading seats...';

  let seats;
  if (state.mode === 'demo') {
    if (!demoSeatMaps[show.showId]) demoSeatMaps[show.showId] = generateDemoSeats(show._index);
    seats = demoSeatMaps[show.showId];
  } else {
    const res = await callApi('GET', `/shows/${show.showId}/seats`);
    if (!res.ok) { seatMap.textContent = 'Error: ' + (res.data.message || res.status); return; }
    seats = res.data.data || [];
  }

  const rows = {};
  seats.forEach(s => { (rows[s.seatNumber[0]] = rows[s.seatNumber[0]] || []).push(s); });

  seatMap.innerHTML = '';
  Object.keys(rows).sort().forEach(rowLetter => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';
    rowEl.innerHTML = `<span class="row-label">${rowLetter}</span>`;
    rows[rowLetter].forEach(seat => {
      const el = document.createElement('div');
      const catClass = (seat.category || 'Regular').toLowerCase();
      el.className = 'seat ' + (seat.isSold ? 'sold' : catClass);
      el.textContent = seat.seatNumber.replace(/^[A-Z]/, '');
      el.title = `${seat.seatNumber} · ${seat.category} · ${seat.price}`;
      if (!seat.isSold) {
        el.onclick = () => {
          document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
          el.classList.add('selected');
          selectedSeat = seat;
          document.getElementById('bookTicketBtn').disabled = false;
        };
      }
      rowEl.appendChild(el);
    });
    seatMap.appendChild(rowEl);
  });
}

document.getElementById('bookTicketBtn').onclick = async () => {
  if (!selectedShow || !selectedSeat) return;
  const resultEl = document.getElementById('ticketResult');
  const custName = document.getElementById('custName').value.trim() || 'Demo Customer';
  const custPhone = document.getElementById('custPhone').value.trim() || '0300-0000000';

  if (state.mode === 'demo') {
    selectedSeat.isSold = true;
    renderResult(resultEl, {
      ticketToken: 'DEMO-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
      movieTitle: selectedShow.movieTitle,
      screenName: selectedShow.screenName,
      seatNumber: selectedSeat.seatNumber,
      category: selectedSeat.category,
      price: selectedSeat.price,
      customerName: custName,
      customerPhone: custPhone,
      status: 'Confirmed (Demo)',
    }, false);
    document.querySelectorAll('.seat.selected').forEach(s => s.classList.add('sold'));
    return;
  }

  const body = { showId: selectedShow.showId, seatId: selectedSeat.seatId, customerName: custName, customerPhone: custPhone };
  const res = await callApi('POST', '/tickets', body);
  renderResult(resultEl, res.ok ? res.data.data : res.data, !res.ok);
};

// ---- Food Order ----

let menuItems = [];
const cart = {};

function renderCart() {
  const list = document.getElementById('cartList');
  const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
  let total = 0;
  list.innerHTML = entries.map(([id, qty]) => {
    const item = menuItems.find(m => String(m.menuId) === String(id));
    if (!item) return '';
    const lineTotal = item.price * qty;
    total += lineTotal;
    return `<div class="cart-row"><span>${qty}× ${item.name}</span><b>${lineTotal}</b></div>`;
  }).join('') || '<div class="cart-row">No items yet.</div>';
  document.getElementById('cartTotal').textContent = 'PKR ' + total;
  document.getElementById('placeOrderBtn').disabled = total === 0;
}

document.getElementById('loadMenu').onclick = async () => {
  const list = document.getElementById('menuList');
  list.textContent = 'Loading...';

  if (state.mode === 'demo') {
    menuItems = DEMO_MENU;
  } else {
    const res = await callApi('GET', '/menu');
    if (!res.ok) { list.textContent = 'Error: ' + (res.data.message || res.status); return; }
    menuItems = res.data.data || [];
  }

  list.innerHTML = '';
  menuItems.forEach(item => {
    cart[item.menuId] = cart[item.menuId] || 0;
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.innerHTML = `
      <div class="menu-top">
        <div>
          <div class="menu-name">${item.name}</div>
          <div class="menu-desc">${item.description || ''}</div>
        </div>
        <div class="menu-icon">${item.emoji || '🍽️'}</div>
      </div>
      <div class="menu-price">PKR ${item.price}</div>
      <div class="qty-row">
        <button class="dec">−</button>
        <span class="qty">${cart[item.menuId]}</span>
        <button class="inc">+</button>
      </div>
    `;
    const qtySpan = card.querySelector('.qty');
    card.querySelector('.inc').onclick = () => { cart[item.menuId]++; qtySpan.textContent = cart[item.menuId]; renderCart(); };
    card.querySelector('.dec').onclick = () => { cart[item.menuId] = Math.max(0, cart[item.menuId] - 1); qtySpan.textContent = cart[item.menuId]; renderCart(); };
    list.appendChild(card);
  });
  renderCart();
};

document.getElementById('placeOrderBtn').onclick = async () => {
  const resultEl = document.getElementById('orderResult');
  const items = Object.entries(cart).filter(([, qty]) => qty > 0).map(([menuId, quantity]) => ({ menuId: Number(menuId), quantity }));
  const total = items.reduce((sum, i) => {
    const item = menuItems.find(m => String(m.menuId) === String(i.menuId));
    return sum + (item ? item.price * i.quantity : 0);
  }, 0);

  if (state.mode === 'demo') {
    renderResult(resultEl, {
      orderNo: 'DEMO-' + Math.floor(1000 + Math.random() * 9000),
      ticketReference: document.getElementById('ticketRef').value.trim() || '(not linked)',
      seatNumber: document.getElementById('seatNumber').value.trim() || '—',
      totalAmount: total,
      currency: 'PKR',
      status: 'Preparing (Demo)',
      paymentStatus: 'Paid (Demo)',
    }, false);
    return;
  }

  const dt = document.getElementById('showDateTime').value;
  const body = {
    ticketReference: document.getElementById('ticketRef').value.trim(),
    screenId: Number(document.getElementById('screenId').value),
    seatNumber: document.getElementById('seatNumber').value.trim(),
    showDateTime: dt ? new Date(dt).toISOString() : undefined,
    items,
  };
  const res = await callApi('POST', '/orders/prebook', body);
  renderResult(resultEl, res.ok ? res.data.data : res.data, !res.ok);
};

// auto-load demo content on first paint
document.getElementById('loadShows').click();
document.getElementById('loadMenu').click();

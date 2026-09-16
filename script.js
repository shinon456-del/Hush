// ---------- Data ----------
  const SPACES = [
    { id:'library-quiet', name:'Library Quiet Reading Area', category:'library', loc:'Main Library · Reading Room', hours:'7:00 AM – 5:00 PM', quiet:0, capacity:20, booked:14, amenities:['Individual desks','Natural light','No talking'], slots:['7–9am','9–11am','11am–1pm','1–3pm','3–5pm'] },
    { id:'library-pods', name:'Library Focus Pods', category:'library', loc:'Main Library · Pod Corner', hours:'7:00 AM – 5:00 PM', quiet:0, capacity:6, booked:6, amenities:['Soundproof','Power outlet','Single occupancy'], slots:['7–9am','9–11am','11am–1pm','1–3pm','3–5pm'] },
    { id:'room-204', name:'Room 204 (Free Period)', category:'classroom', loc:'Main Building · 2nd Floor', hours:'7:00 AM – 6:00 PM', quiet:1, capacity:30, booked:9, amenities:['Whiteboard','Projector','Aircon'], slots:['7–9am','9–11am','11am–1pm','1–3pm','3–5pm','5–6pm'] },
    { id:'research-group', name:'Room 108 — Research Group Room', category:'classroom', loc:'Main Building · 1st Floor', hours:'7:00 AM – 6:00 PM', quiet:2, capacity:8, booked:3, amenities:['Research databases','Large worktable','Whiteboard'], slots:['7–9am','9–11am','11am–1pm','1–3pm','3–5pm','5–6pm'] },
    { id:'grove', name:'The Grove (Courtyard)', category:'study-area', loc:'Central Courtyard', hours:'6:00 AM – 9:00 PM', quiet:1, capacity:25, booked:10, amenities:['Outdoor seating','Shade','Wi-Fi'], slots:['7–9am','9–11am','11am–1pm','1–3pm','3–5pm','5–7pm','7–9pm'] },
    { id:'commons', name:'Student Commons', category:'study-area', loc:'Main Building · Ground Floor', hours:'7:00 AM – 9:00 PM', quiet:1, capacity:40, booked:16, amenities:['Shared tables','Coffee nearby','Wi-Fi'], slots:['7–9am','9–11am','11am–1pm','1–3pm','3–5pm','5–7pm','7–9pm'] },
    { id:'guidance-annex', name:'Guidance Office Annex', category:'other', loc:'Admin Building · Room 3', hours:'8:00 AM – 5:00 PM', quiet:0, capacity:8, booked:2, amenities:['Reference materials','Lockers','Staff-monitored'], slots:['8–10am','10am–12pm','12–2pm','2–4pm','4–5pm'] },
    { id:'thesis-night', name:'Thesis Night Desk', category:'other', loc:'Faculty Wing · Room 12', hours:'1:00 PM – 3:00 AM', quiet:0, capacity:10, booked:4, lateNight:true, amenities:['Open until 3am','Individual desks','Coffee machine'], slots:['1–3pm','3–5pm','5–7pm','7–9pm','9pm–12am','12–3am · Night'] },
  ];
  const CATEGORIES = [
    { id:'library', label:'Library Seats', blurb:'Quiet individual seats and pods inside the library (7am–5pm only)', image:'https://images.unsplash.com/photo-1511027264035-14f38d508f11?auto=format&fit=crop&fm=jpg&q=85&w=1200', credit:'Alan Lin / Unsplash' },
    { id:'classroom', label:'Available Classrooms', blurb:'Empty classrooms released for study when not in use', image:'https://images.unsplash.com/photo-1565057748808-18c797216b0c?auto=format&fit=crop&fm=jpg&q=85&w=1200', credit:'Barry Zhou / Unsplash' },
    { id:'study-area', label:'Study Areas', blurb:'Lounges, courtyards, and common areas around campus', image:'https://images.unsplash.com/photo-1778735940467-1335c201966d?auto=format&fit=crop&fm=jpg&q=85&w=1200', credit:'Ashutosh Gupta / Unsplash' },
    { id:'other', label:'Other Approved Spaces', blurb:'Staff-approved rooms outside the usual spots', image:'https://images.unsplash.com/photo-1511027264035-14f38d508f11?auto=format&fit=crop&fm=jpg&q=85&w=1200', credit:'Alan Lin / Unsplash' },
  ];
  const QUIET_LABEL = { 0:'Silent', 1:'Low hum', 2:'Moderate' };
  const SLOTS = ['9–11am','11am–1pm','1–3pm','3–5pm','5–7pm'];

  const STORAGE_KEY = 'hush_reservations_v1';
  let reservations = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    reservations = raw ? JSON.parse(raw) : [];
  } catch(e) { reservations = []; }

  function saveReservations(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations)); } catch(e) {}
  }

  const STUDENT_KEY = 'hush_student_id_v1';
  let currentStudent = null;
  try { currentStudent = localStorage.getItem(STUDENT_KEY); } catch(e) { currentStudent = null; }

  function bookedSlotsFor(spaceId){
    return reservations.filter(r => r.spaceId === spaceId).map(r => r.slot);
  }

  // ---------- Rendering ----------
  const grid = document.getElementById('spaceGrid');
  const zoneStrip = document.getElementById('zoneStrip');
  const resultCount = document.getElementById('resultCount');
  const totalAvail = document.getElementById('totalAvail');

  function meterHTML(level){
    return `<div class="meter" data-level="${level}"><i></i><i></i><i></i></div>`;
  }

  function seatsLeft(space){
    const bookedHere = bookedSlotsFor(space.id).length;
    return Math.max(space.capacity - space.booked - Math.min(bookedHere,1), 0);
  }

  function renderZoneStrip(){
    zoneStrip.innerHTML = CATEGORIES.map(cat => {
      const spacesHere = SPACES.filter(s => s.category === cat.id);
      const open = spacesHere.reduce((a,s)=>a+seatsLeft(s),0);
      const total = spacesHere.reduce((a,s)=>a+s.capacity,0);
      const worstLevel = spacesHere.length ? Math.max(...spacesHere.map(s=>s.quiet)) : 0;
      const cls = worstLevel === 0 ? 'silent' : worstLevel === 1 ? 'low' : 'mod';
      return `<div class="zone-chip"><span class="dot ${cls}"></span><b>${cat.label}</b><span class="sep">·</span>${open}/${total} seats open</div>`;
    }).join('');
    const totalOpen = SPACES.reduce((a,s)=>a+seatsLeft(s),0);
    totalAvail.textContent = `${totalOpen} seats open now`;
  }

  function renderCategoryShowcase(){
    const wrap = document.getElementById('categoryShowcase');
    wrap.innerHTML = CATEGORIES.map(cat => `
      <button type="button" class="category-tile" data-category="${cat.id}">
        <img class="category-photo" src="${cat.image}" alt="${cat.label}" loading="lazy">
        <span class="category-copy">
          <span class="category-kicker">${cat.label}</span>
          <h4>${cat.label}</h4>
          <p>${cat.blurb}</p>
        </span>
      </button>
    `).join('');
    wrap.querySelectorAll('[data-category]').forEach(tile => {
      tile.addEventListener('click', () => {
        document.getElementById('fZone').value = tile.getAttribute('data-category');
        renderGrid();
        document.getElementById('browse').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function renderGrid(){
    const zoneFilter = document.getElementById('fZone').value;
    const quietFilter = document.getElementById('fQuiet').value;
    const nightOnly = document.getElementById('fNight').checked;
    const filtered = SPACES.filter(s => {
      const zoneOk = zoneFilter === 'all' || s.category === zoneFilter;
      const quietOk = quietFilter === 'all' || String(s.quiet) === quietFilter;
      const nightOk = !nightOnly || s.lateNight === true;
      return zoneOk && quietOk && nightOk;
    });
    resultCount.textContent = `${filtered.length} of ${SPACES.length} spaces shown`;

    grid.innerHTML = filtered.map(s => {
      const left = seatsLeft(s);
      const full = left <= 0;
      const cat = CATEGORIES.find(c => c.id === s.category);
      return `
      <div class="card" data-id="${s.id}">
        <div class="card-top">
          <div>
            <span class="cat-tag">${cat ? cat.label : ''}</span>
            <h3>${s.name}</h3>
            <div class="loc">${s.loc}</div>
            <div class="hours-line">Open ${s.hours}</div>
          </div>
          <div class="badge-stack">
            <span class="capacity-badge">Seats ${s.capacity}</span>
            ${s.lateNight ? '<span class="night-badge">Late-night</span>' : ''}
          </div>
        </div>

        <div>
          <div class="meter-label"><span>Noise level</span><span>${QUIET_LABEL[s.quiet]}</span></div>
          ${meterHTML(s.quiet)}
        </div>

        <div class="amenities">
          ${s.amenities.map(a => `<span class="tag">${a}</span>`).join('')}
        </div>

        <div class="avail-line">
          <span class="seats">${full ? 'Fully booked today' : `<b>${left}</b> seats left today`}</span>
          <button class="reserve-btn" data-open="${s.id}" ${full ? 'disabled' : ''}>${full ? 'Full' : 'Reserve'}</button>
        </div>
      </div>`;
    }).join('') || `<p class="res-empty">No spaces match those filters. Try widening your search.</p>`;

    attachCardHandlers();
  }

  function attachCardHandlers(){
    document.querySelectorAll('[data-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        const spaceId = btn.getAttribute('data-open');
        if (!currentStudent){ openLogin(spaceId); return; }
        openSheet(spaceId);
      });
    });
  }

  function makeReservation(spaceId, slot){
    const space = SPACES.find(s => s.id === spaceId);
    reservations.push({ id: Date.now(), spaceId, name: space.name, loc: space.loc, slot, studentId: currentStudent });
    saveReservations();
    showToast(`Reserved: ${space.name}, ${slot}`);
    closeSheet();
    renderAll();
    const target = document.getElementById('reservations');
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- Bottom sheet (reservation flow) ----------
  const sheet = document.getElementById('sheet');
  const sheetBackdrop = document.getElementById('sheetBackdrop');
  const sheetGrabber = document.getElementById('sheetGrabber');
  let sheetSpaceId = null;
  let sheetPickedSlot = null;

  function openSheet(spaceId){
    const space = SPACES.find(s => s.id === spaceId);
    if (!space) return;
    sheetSpaceId = spaceId;
    sheetPickedSlot = null;

    document.getElementById('sheetTitle').textContent = space.name;
    const sheetCat = CATEGORIES.find(c => c.id === space.category);
    document.getElementById('sheetCat').textContent = sheetCat ? sheetCat.label : '';
    document.getElementById('sheetLoc').textContent = space.loc;
    document.getElementById('sheetHours').textContent = `Open ${space.hours}`;
    document.getElementById('sheetQuietLabel').textContent = QUIET_LABEL[space.quiet];
    document.getElementById('sheetMeter').innerHTML = meterHTML(space.quiet);
    document.getElementById('sheetAmenities').innerHTML = space.amenities.map(a => `<span class="tag">${a}</span>`).join('');

    const bookedHere = bookedSlotsFor(space.id);
    const slotsWrap = document.getElementById('sheetSlots');
    slotsWrap.innerHTML = (space.slots || SLOTS).map(slot =>
      `<button class="slot" data-slot="${slot}" ${bookedHere.includes(slot) ? 'disabled' : ''}>${slot}</button>`
    ).join('');
    slotsWrap.querySelectorAll('.slot').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        slotsWrap.querySelectorAll('.slot').forEach(b => b.classList.remove('picked'));
        btn.classList.add('picked');
        sheetPickedSlot = btn.getAttribute('data-slot');
        const confirmBtn = document.getElementById('sheetConfirm');
        confirmBtn.disabled = false;
        confirmBtn.textContent = `Confirm ${sheetPickedSlot}`;
      });
    });

    const confirmBtn = document.getElementById('sheetConfirm');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Choose a time to reserve';
    confirmBtn.onclick = () => { if (sheetPickedSlot) makeReservation(sheetSpaceId, sheetPickedSlot); };

    sheet.style.transform = '';
    sheet.classList.remove('dragging');
    sheet.classList.add('open');
    sheetBackdrop.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeSheet(){
    sheet.classList.remove('open');
    sheet.classList.remove('dragging');
    sheet.style.transform = '';
    sheetBackdrop.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    sheetSpaceId = null;
  }

  document.getElementById('sheetClose').addEventListener('click', closeSheet);
  sheetBackdrop.addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheet.classList.contains('open')) closeSheet(); });

  // Direct-manipulation drag: the sheet follows the pointer 1:1, then either
  // springs back (interruptible) or is dismissed with projected momentum.
  let dragStartY = 0, dragCurrentY = 0, dragging = false;
  let lastY = 0, lastT = 0, velocity = 0;

  function sheetDragStart(e){
    dragging = true;
    dragStartY = e.clientY;
    dragCurrentY = 0;
    lastY = e.clientY;
    lastT = performance.now();
    velocity = 0;
    sheet.classList.add('dragging');
    sheetGrabber.setPointerCapture(e.pointerId);
  }
  function sheetDragMove(e){
    if (!dragging) return;
    const delta = Math.max(0, e.clientY - dragStartY);
    dragCurrentY = delta;
    sheet.style.transform = `translateY(${delta}px)`;

    const now = performance.now();
    const dt = now - lastT;
    if (dt > 0){ velocity = (e.clientY - lastY) / dt; }
    lastY = e.clientY;
    lastT = now;
  }
  function sheetDragEnd(){
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove('dragging');

    const sheetHeight = sheet.offsetHeight || 400;
    const projected = dragCurrentY + velocity * 180; // project momentum forward
    const shouldDismiss = projected > sheetHeight * 0.38;

    if (shouldDismiss){
      sheet.style.transform = '';
      closeSheet();
    } else {
      sheet.style.transform = '';
    }
  }
  sheetGrabber.addEventListener('pointerdown', sheetDragStart);
  sheetGrabber.addEventListener('pointermove', sheetDragMove);
  sheetGrabber.addEventListener('pointerup', sheetDragEnd);
  sheetGrabber.addEventListener('pointercancel', sheetDragEnd);

  // ---------- Student ID login ----------
  const loginBackdrop = document.getElementById('loginBackdrop');
  const loginModal = document.getElementById('loginModal');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const accountBtn = document.getElementById('accountBtn');
  let pendingSpaceId = null;

  function updateAccountUI(){
    if (currentStudent){
      accountBtn.classList.add('signed-in');
      accountBtn.innerHTML = `<span class="dot-live"></span>${currentStudent}`;
      accountBtn.title = 'Signed in — click to sign out';
    } else {
      accountBtn.classList.remove('signed-in');
      accountBtn.textContent = 'Sign in';
      accountBtn.title = 'Sign in with your Student ID';
    }
  }

  function openLogin(spaceId){
    pendingSpaceId = spaceId || null;
    loginError.textContent = '';
    loginForm.reset();
    loginBackdrop.classList.add('open');
    setTimeout(() => document.getElementById('loginId').focus(), 250);
  }

  function closeLogin(){
    loginBackdrop.classList.remove('open');
    pendingSpaceId = null;
  }

  loginBackdrop.addEventListener('click', (e) => { if (e.target === loginBackdrop) closeLogin(); });
  document.getElementById('loginCancel').addEventListener('click', closeLogin);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && loginBackdrop.classList.contains('open')) closeLogin(); });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('loginId').value.trim();
    const pin = document.getElementById('loginPin').value.trim();

    const idOk = /^[A-Za-z0-9](?:[A-Za-z0-9-]{4,12})[A-Za-z0-9]$/.test(id);
    const pinOk = /^\d{4,6}$/.test(pin);

    if (!idOk || !pinOk){
      loginError.textContent = !idOk
        ? 'Enter your ID as shown on your campus card, e.g. 2023-04567.'
        : 'PIN should be 4–6 digits.';
      loginModal.classList.remove('shake');
      void loginModal.offsetWidth; // restart animation
      loginModal.classList.add('shake');
      return;
    }

    currentStudent = id;
    try { localStorage.setItem(STUDENT_KEY, id); } catch(err) {}
    updateAccountUI();
    closeLogin();
    showToast(`Signed in as ${id}`);
    renderAll();

    if (pendingSpaceId){
      const openId = pendingSpaceId;
      pendingSpaceId = null;
      openSheet(openId);
    }
  });

  accountBtn.addEventListener('click', () => {
    if (currentStudent){
      currentStudent = null;
      try { localStorage.removeItem(STUDENT_KEY); } catch(err) {}
      updateAccountUI();
      showToast('Signed out');
      renderAll();
    } else {
      openLogin(null);
    }
  });

  updateAccountUI();

  function cancelReservation(id){
    const r = reservations.find(x => x.id === id);
    reservations = reservations.filter(x => x.id !== id);
    saveReservations();
    if (r) showToast(`Cancelled: ${r.name}, ${r.slot}`);
    renderAll();
  }

  function renderReservations(){
    const list = document.getElementById('resList');
    if (!currentStudent){
      list.innerHTML = `<p class="res-empty">Sign in with your Student ID to see and manage your reservations.</p>`;
      return;
    }
    const mine = reservations.filter(r => r.studentId === currentStudent);
    if (mine.length === 0){
      list.innerHTML = `<p class="res-empty">No reservations yet under ${currentStudent}. Reserve a slot above and it'll show up here.</p>`;
      return;
    }
    list.innerHTML = mine.map(r => `
      <div class="res-item">
        <div>
          <div class="res-name">${r.name}</div>
          <div class="res-time">${r.loc} · ${r.slot}</div>
        </div>
        <button class="cancel-btn" data-cancel="${r.id}">Cancel</button>
      </div>
    `).join('');
    list.querySelectorAll('[data-cancel]').forEach(btn => {
      btn.addEventListener('click', () => cancelReservation(Number(btn.getAttribute('data-cancel'))));
    });
  }

  let toastTimer;
  function showToast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function renderAll(){
    renderCategoryShowcase();
    renderZoneStrip();
    renderGrid();
    renderReservations();
  }

  document.getElementById('findBtn').addEventListener('click', renderGrid);
  document.getElementById('fZone').addEventListener('change', renderGrid);
  document.getElementById('fQuiet').addEventListener('change', renderGrid);
  document.getElementById('fNight').addEventListener('change', renderGrid);

  // theme toggle
  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    if (current === 'dark'){ root.setAttribute('data-theme','light'); }
    else if (current === 'light'){ root.removeAttribute('data-theme'); }
    else { root.setAttribute('data-theme','dark'); }
  });

  // default date field to today
  document.getElementById('fDate').valueAsDate = new Date();

  renderAll();

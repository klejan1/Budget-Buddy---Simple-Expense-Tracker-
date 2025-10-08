const $ = id => document.getElementById(id);
const rows = $('rows');
const total = $('total');
const cats = $('cats');
const form = $('form');
const range = $('range');

let data = [];

// Load existing expenses from localStorage
function load(){
  try { data = JSON.parse(localStorage.getItem('bb_data')||'[]'); } catch(e){ data = []; }
  render();
}

// Save expenses
function save(){
  localStorage.setItem('bb_data', JSON.stringify(data));
}

// Format money
function fmt(n){ return '$' + (Number(n)||0).toFixed(2); }

// Today’s date in YYYY-MM-DD
function todayISO(){ return new Date().toISOString().slice(0,10); }

// Filter by date range
function inRange(d){
  const date = new Date(d);
  const now = new Date();
  if (range.value === 'all') return true;
  if (range.value === 'month'){
    return date.getFullYear()===now.getFullYear() && date.getMonth()===now.getMonth();
  }
  if (range.value === 'week'){
    // Monday-based week
    const day = (now.getDay()+6)%7;
    const monday = new Date(now); monday.setDate(now.getDate()-day);
    const sunday = new Date(monday); sunday.setDate(monday.getDate()+6);
    monday.setHours(0,0,0,0); sunday.setHours(23,59,59,999);
    return date>=monday && date<=sunday;
  }
  return true;
}

// Render table & totals
function render(){
  rows.innerHTML = '';
  const filtered = data.filter(x => inRange(x.date));
  let sum = 0;
  const byCat = {};
  for (const x of filtered){
    sum += Number(x.amount)||0;
    byCat[x.category] = (byCat[x.category]||0) + (Number(x.amount)||0);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${x.title}</td>
                    <td>${x.category}</td>
                    <td>${x.date}</td>
                    <td class="right">${fmt(x.amount)}</td>
                    <td class="right"><button class="delete">Delete</button></td>`;
    tr.querySelector('.delete').onclick = () => {
      data = data.filter(y => y.id !== x.id);
      save(); render();
    };
    rows.appendChild(tr);
  }
  total.textContent = fmt(sum);
  cats.innerHTML = '';
  Object.entries(byCat).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>{
    const b = document.createElement('span');
    b.className = 'badge';
    b.textContent = `${k}: ${fmt(v)}`;
    cats.appendChild(b);
  });
}

// Handle new expense
form.addEventListener('submit', e => {
  e.preventDefault();
  const title = $('title').value.trim();
  const amount = $('amount').value;
  const category = $('category').value;
  const date = $('date').value || todayISO();
  if(!title || !amount) return;
  data.push({ id: crypto.randomUUID(), title, amount, category, date });
  $('title').value=''; $('amount').value=''; $('date').value='';
  save(); render();
});

range.addEventListener('change', render);

window.addEventListener('DOMContentLoaded', () => {
  $('date').value = todayISO();
  load();
});
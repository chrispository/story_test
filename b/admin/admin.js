const tBody = document.querySelector('#promptsTable tbody');
const saveBtn = document.getElementById('saveParams');

async function loadParams() {
  const res = await fetch('/api/admin/parameters');
  if (!res.ok) { alert('Auth required or failed'); return; }
  const data = await res.json();
  for (const [k,v] of Object.entries(data)) {
    const el = document.getElementById('param_' + k);
    if (el) el.value = v;
  }
}

async function saveParams() {
  const fields = Array.from(document.querySelectorAll('[id^="param_"]'));
  const payload = {};
  fields.forEach(f => {
    const key = f.id.replace('param_', '');
    payload[key] = f.value;
  });
  const res = await fetch('/api/admin/parameters', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) { alert('Failed to save'); return; }
}

async function loadPrompts() {
  const res = await fetch('/api/admin/prompts');
  const arr = await res.json();
  tBody.innerHTML = '';
  arr.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input data-id="${p.id}" data-field="name" value="${escapeHtml(p.name)}"/></td>
                    <td><select data-id="${p.id}" data-field="type"><option ${p.type==='meta'?'selected':''}>meta</option><option ${p.type==='template'?'selected':''}>template</option></select></td>
                    <td class="muted">${new Date(p.updatedAt).toLocaleString()}</td>
                    <td class="row"><button data-act="edit" data-id="${p.id}" class="ghost small">Edit</button><button data-act="del" data-id="${p.id}" class="ghost small">Delete</button></td>`;
    tBody.appendChild(tr);
  });
}

function escapeHtml(s='') { return s.replace(/[&<>"]+/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

async function onTableClick(e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = btn.dataset.id;
  const act = btn.dataset.act;
  if (act === 'edit') {
    const res = await fetch('/api/admin/prompts');
    const arr = await res.json();
    const rec = arr.find(x => x.id === id);
    if (!rec) return;
    const content = prompt(`Edit content for ${rec.name}:`, rec.content);
    if (content == null) return;
    await fetch(`/api/admin/prompts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content })});
    await loadPrompts();
  } else if (act === 'del') {
    if (!confirm('Delete this prompt?')) return;
    await fetch(`/api/admin/prompts/${id}`, { method: 'DELETE' });
    await loadPrompts();
  }
}

async function addPrompt() {
  const name = prompt('Name'); if (!name) return;
  const type = prompt('Type (meta/template)', 'template') || 'template';
  const content = prompt('Content', '') || '';
  await fetch('/api/admin/prompts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type, content }) });
  await loadPrompts();
}

document.getElementById('addPrompt').addEventListener('click', addPrompt);
document.getElementById('saveParams').addEventListener('click', saveParams);
document.querySelector('#promptsTable').addEventListener('click', onTableClick);

loadParams();
loadPrompts();


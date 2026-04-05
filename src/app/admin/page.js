'use client';
import { useState, useEffect } from 'react';

const API = '/api/admin';
async function req(url, opts = {}) {
  const r = await fetch(url, { ...opts, headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || 'Error');
  return d;
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [view, setView] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [selGroup, setSelGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const [progress, setProgress] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterSilent, setFilterSilent] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [showMsgs, setShowMsgs] = useState(false);

  useEffect(function () {
    req(API + '?action=groups').then(function (d) { setGroups(d.groups); setAuth(true); setLoading(false); }).catch(function () { setAuth(false); setLoading(false); });
  }, []);

  async function login() { try { setErr(''); await req(API, { method: 'POST', body: JSON.stringify({ action: 'login', password: pass }) }); const d = await req(API + '?action=groups'); setGroups(d.groups); setAuth(true); } catch (e) { setErr(e.message); } }
  async function loadGroups() { const d = await req(API + '?action=groups'); setGroups(d.groups); }
  async function createGroup() { try { setErr(''); await req(API, { method: 'POST', body: JSON.stringify({ action: 'create_group', code: newCode, name: newName, start_date: newDate }) }); setShowNew(false); setNewCode(''); setNewName(''); setNewDate(''); await loadGroups(); } catch (e) { setErr(e.message); } }
  async function deleteGroup(id) { if (!confirm('Удалить группу и всех участников?')) return; await req(API, { method: 'POST', body: JSON.stringify({ action: 'delete_group', id }) }); await loadGroups(); if (selGroup === id) { setSelGroup(null); setView('groups'); } }
  async function openGroup(id) { setSelGroup(id); setView('users'); setFilterSilent(false); const d = await req(API + '?action=users&group_id=' + id); setUsers(d.users); setGroupInfo(d.group); }
  async function openProgress(id) { setSelGroup(id); setView('progress'); const d = await req(API + '?action=progress&group_id=' + id); setProgress(d.progress); }
  async function openMessages(id) { setSelGroup(id); setShowMsgs(true); const d = await req(API + '?action=messages&group_id=' + id); setMessages(d.messages); }
  async function sendMessage() { if (!newMsg.trim()) return; await req(API, { method: 'POST', body: JSON.stringify({ action: 'send_message', group_id: selGroup, message: newMsg.trim() }) }); setNewMsg(''); openMessages(selGroup); }
  async function deleteMessage(id) { await req(API, { method: 'POST', body: JSON.stringify({ action: 'delete_message', id }) }); openMessages(selGroup); }

  var bg = '#F7F3EE', card = '#FDFBF8', accent = '#B8673E', text = '#2D2A26', soft = '#5C5650', muted = '#8A837B', border = '#EDE8E0';
  var sC = { background: card, borderRadius: 14, padding: 16, boxShadow: '0 1px 8px rgba(45,42,38,.04)', marginBottom: 12 };
  var sB = { padding: '10px 20px', borderRadius: 10, border: 'none', background: accent, color: '#FDFBF8', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };
  var sSm = { ...sB, padding: '6px 14px', fontSize: 12 };
  var sOut = { ...sSm, background: 'transparent', border: '1px solid ' + border, color: soft };
  var sIn = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid ' + border, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: bg, boxSizing: 'border-box', marginBottom: 10 };
  var sLab = { fontSize: 11, fontWeight: 600, color: soft, marginBottom: 4, display: 'block' };

  if (loading) return <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito Sans',sans-serif" }}><div style={{ color: accent }}>Загрузка...</div></div>;

  if (!auth) return <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Nunito Sans',sans-serif" }}><div style={{ width: '100%', maxWidth: 320 }}><div style={{ textAlign: 'center', marginBottom: 28 }}><div style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 600 }}>Админка</div><div style={{ fontSize: 13, color: muted, marginTop: 4 }}>Без износа</div></div><div style={sC}><label style={sLab}>Пароль</label><input type="password" value={pass} onChange={function (e) { setPass(e.target.value); setErr(''); }} onKeyDown={function (e) { if (e.key === 'Enter') login(); }} placeholder="Пароль" style={sIn} />{err && <div style={{ fontSize: 12, color: '#C0533A', marginBottom: 8, textAlign: 'center' }}>{err}</div>}<button onClick={login} style={{ ...sB, width: '100%' }}>Войти</button></div></div></div>;

  // Messages modal
  if (showMsgs) return <div style={{ minHeight: '100vh', background: bg, padding: 20, fontFamily: "'Nunito Sans',sans-serif", maxWidth: 600, margin: '0 auto' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
      <button onClick={function () { setShowMsgs(false); }} style={sOut}>← Назад</button>
      <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 600 }}>Сообщения группе</div>
    </div>
    <div style={sC}>
      <label style={sLab}>Новое сообщение (увидят все участники)</label>
      <textarea value={newMsg} onChange={function (e) { setNewMsg(e.target.value); }} placeholder="Сообщение от ведущего..." rows={3} style={{ ...sIn, resize: 'vertical' }} />
      <button onClick={sendMessage} style={{ ...sB, width: '100%' }}>Отправить</button>
    </div>
    {messages.map(function (m) {
      return <div key={m.id} style={{ ...sC, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.message}</div>
          <div style={{ fontSize: 10, color: muted, marginTop: 4 }}>{new Date(m.created_at).toLocaleString('ru-RU')}</div>
        </div>
        <button onClick={function () { deleteMessage(m.id); }} style={{ ...sOut, color: '#C0533A', borderColor: '#C0533A44', fontSize: 11, padding: '4px 10px', flexShrink: 0, marginLeft: 8 }}>×</button>
      </div>;
    })}
    {messages.length === 0 && <div style={{ textAlign: 'center', color: muted, padding: 20 }}>Нет сообщений</div>}
  </div>;

  // Groups
  if (view === 'groups') return <div style={{ minHeight: '100vh', background: bg, padding: 20, fontFamily: "'Nunito Sans',sans-serif", maxWidth: 600, margin: '0 auto' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 600 }}>Группы</div>
      <button onClick={function () { setShowNew(!showNew); }} style={sSm}>{showNew ? 'Отмена' : '+ Группа'}</button>
    </div>
    {showNew && <div style={{ ...sC, borderLeft: '3px solid ' + accent }}>
      <label style={sLab}>Код (латиницей)</label><input value={newCode} onChange={function (e) { setNewCode(e.target.value); }} placeholder="potok1" style={sIn} />
      <label style={sLab}>Название</label><input value={newName} onChange={function (e) { setNewName(e.target.value); }} placeholder="Первый поток" style={sIn} />
      <label style={sLab}>Дата старта</label><input type="date" value={newDate} onChange={function (e) { setNewDate(e.target.value); }} style={sIn} />
      {err && <div style={{ fontSize: 12, color: '#C0533A', marginBottom: 8 }}>{err}</div>}
      <button onClick={createGroup} style={{ ...sB, width: '100%' }}>Создать</button>
    </div>}
    {groups.length === 0 && <div style={{ textAlign: 'center', color: muted, padding: 40 }}>Нет групп</div>}
    {groups.map(function (g) {
      var sd = new Date(g.start_date); var now = new Date(); var dn = Math.floor((now - sd) / 86400000);
      var status = dn < 0 ? 'Не начата' : dn >= 42 ? 'Завершена' : 'День ' + (dn + 1);
      var sc = dn < 0 ? muted : dn >= 42 ? '#7AAE6E' : accent;
      return <div key={g.id} style={sC}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 600 }}>{g.name}</div>
            <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>Код: <b style={{ color: accent }}>{g.code}</b> · Старт: {sd.toLocaleDateString('ru-RU')}</div>
            <div style={{ fontSize: 12, color: sc, fontWeight: 600, marginTop: 2 }}>{status}</div>
          </div>
          <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: accent }}>{g.user_count}</div><div style={{ fontSize: 9, color: muted }}>чел.</div></div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
          <button onClick={function () { openGroup(g.id); }} style={sSm}>Участники</button>
          <button onClick={function () { openProgress(g.id); }} style={sOut}>Сетка</button>
          <button onClick={function () { openMessages(g.id); }} style={sOut}>✉️ Сообщения</button>
          <button onClick={function () { deleteGroup(g.id); }} style={{ ...sOut, color: '#C0533A', borderColor: '#C0533A44', marginLeft: 'auto' }}>Удалить</button>
        </div>
      </div>;
    })}
  </div>;

  // Users
  if (view === 'users') {
    var displayed = filterSilent ? users.filter(function (u) { return u.silent_days >= 2; }) : users;
    var silentCount = users.filter(function (u) { return u.silent_days >= 2; }).length;

    return <div style={{ minHeight: '100vh', background: bg, padding: 20, fontFamily: "'Nunito Sans',sans-serif", maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button onClick={function () { setView('groups'); }} style={sOut}>← Группы</button>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 600 }}>{groupInfo ? groupInfo.name : ''}</div>
      </div>

      {/* Silent filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={function () { setFilterSilent(false); }} style={filterSilent ? sOut : sSm}>Все ({users.length})</button>
        <button onClick={function () { setFilterSilent(true); }} style={{ ...(filterSilent ? sSm : sOut), background: filterSilent ? '#C0533A' : undefined, color: filterSilent ? '#FDFBF8' : silentCount > 0 ? '#C0533A' : soft, borderColor: filterSilent ? '#C0533A' : silentCount > 0 ? '#C0533A44' : border }}>
          🔇 Молчат 2+ дня ({silentCount})
        </button>
      </div>

      {displayed.length === 0 && <div style={{ textAlign: 'center', color: muted, padding: 40 }}>{filterSilent ? 'Все активны 👍' : 'Пока никто не зашёл'}</div>}

      {displayed.map(function (u) {
        var total = Math.min(42, Math.max(1, (u.current_day || 0) + 1));
        var pct = total > 0 ? Math.round((u.done_count / total) * 100) : 0;
        var isSilent = u.silent_days >= 2;

        return <div key={u.id} style={{ ...sC, borderLeft: isSilent ? '3px solid #C0533A' : '3px solid transparent' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{u.name} {isSilent && <span style={{ fontSize: 11, color: '#C0533A' }}>· молчит {u.silent_days} дн.</span>}</div>
              {u.anchor && <div style={{ fontSize: 11, color: accent, marginTop: 2 }}>⚓ {u.anchor}</div>}
              <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>
                Практик: <b style={{ color: text }}>{u.done_count}</b> · Тихих: {u.quiet_count} · А: {u.has_survey_a ? '✓' : '—'} · Б: {u.has_survey_b ? '✓' : '—'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: isSilent ? '#C0533A' : accent }}>{pct}%</div><div style={{ fontSize: 9, color: muted }}>регулярн.</div></div>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: border, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pct + '%', background: isSilent ? '#C0533A' : accent, borderRadius: 3 }} />
          </div>
        </div>;
      })}
    </div>;
  }

  // Progress grid
  if (view === 'progress') {
    var names = []; var grid = {};
    for (var i = 0; i < progress.length; i++) {
      var p = progress[i];
      if (!grid[p.name]) { grid[p.name] = {}; names.push(p.name); }
      grid[p.name][p.day_number] = p.status;
    }
    names = Array.from(new Set(names));

    return <div style={{ minHeight: '100vh', background: bg, padding: 20, fontFamily: "'Nunito Sans',sans-serif", overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={function () { setView('groups'); }} style={sOut}>← Группы</button>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 600 }}>Сетка прогресса</div>
      </div>
      {names.length === 0 && <div style={{ textAlign: 'center', color: muted, padding: 40 }}>Нет данных</div>}
      {names.length > 0 && <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 11, minWidth: 600 }}>
          <thead><tr>
            <th style={{ padding: '6px 10px', textAlign: 'left', color: soft, fontWeight: 600, position: 'sticky', left: 0, background: bg }}>Имя</th>
            {Array.from({ length: 42 }).map(function (_, d) {
              return <th key={d} style={{ padding: '4px 2px', color: muted, fontWeight: 400, fontSize: 9, borderLeft: d % 7 === 0 && d > 0 ? '2px solid ' + border : 'none' }}>{d + 1}</th>;
            })}
          </tr></thead>
          <tbody>{names.map(function (name) {
            return <tr key={name}>
              <td style={{ padding: '4px 10px', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', position: 'sticky', left: 0, background: bg }}>{name}</td>
              {Array.from({ length: 42 }).map(function (_, d) {
                var st = grid[name] ? grid[name][d] : null;
                var c2 = st === 'done' ? accent : st === 'quiet' ? '#E8E3DB' : 'transparent';
                return <td key={d} style={{ padding: 1, borderLeft: d % 7 === 0 && d > 0 ? '2px solid ' + border : 'none' }}><div style={{ width: 12, height: 12, borderRadius: 3, background: c2, margin: '0 auto' }} /></td>;
              })}
            </tr>;
          })}</tbody>
        </table>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 11, color: muted }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: accent }} /> Сделал</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#E8E3DB' }} /> Тихий</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, border: '1px solid ' + border }} /> Пусто</div>
        </div>
      </div>}
    </div>;
  }

  return null;
}

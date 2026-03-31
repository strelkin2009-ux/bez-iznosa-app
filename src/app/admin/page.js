'use client';
import { useState, useEffect, useCallback } from 'react';

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
  const [view, setView] = useState('groups'); // groups | users | progress
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

  // Check auth on load
  useEffect(function () {
    req(API + '?action=groups').then(function (d) {
      setGroups(d.groups);
      setAuth(true);
      setLoading(false);
    }).catch(function () {
      setAuth(false);
      setLoading(false);
    });
  }, []);

  async function login() {
    try {
      setErr('');
      await req(API, { method: 'POST', body: JSON.stringify({ action: 'login', password: pass }) });
      const d = await req(API + '?action=groups');
      setGroups(d.groups);
      setAuth(true);
    } catch (e) { setErr(e.message); }
  }

  async function loadGroups() {
    const d = await req(API + '?action=groups');
    setGroups(d.groups);
  }

  async function createGroup() {
    try {
      setErr('');
      await req(API, { method: 'POST', body: JSON.stringify({ action: 'create_group', code: newCode, name: newName, start_date: newDate }) });
      setShowNew(false); setNewCode(''); setNewName(''); setNewDate('');
      await loadGroups();
    } catch (e) { setErr(e.message); }
  }

  async function deleteGroup(id) {
    if (!confirm('Удалить группу и всех участников?')) return;
    await req(API, { method: 'POST', body: JSON.stringify({ action: 'delete_group', id }) });
    await loadGroups();
    if (selGroup === id) { setSelGroup(null); setView('groups'); }
  }

  async function openGroup(id) {
    setSelGroup(id);
    setView('users');
    const d = await req(API + '?action=users&group_id=' + id);
    setUsers(d.users);
    setGroupInfo(d.group);
  }

  async function openProgress(id) {
    setSelGroup(id);
    setView('progress');
    const d = await req(API + '?action=progress&group_id=' + id);
    setProgress(d.progress);
  }

  // Styles
  const bg = '#F7F3EE', card = '#FDFBF8', accent = '#B8673E', text = '#2D2A26', soft = '#5C5650', muted = '#8A837B', border = '#EDE8E0';
  const sCard = { background: card, borderRadius: 14, padding: 16, boxShadow: '0 1px 8px rgba(45,42,38,.04)', marginBottom: 12 };
  const sBtn = { padding: '10px 20px', borderRadius: 10, border: 'none', background: accent, color: '#FDFBF8', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };
  const sBtnSm = { ...sBtn, padding: '6px 14px', fontSize: 12 };
  const sBtnOut = { ...sBtnSm, background: 'transparent', border: '1px solid ' + border, color: soft };
  const sInput = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid ' + border, fontSize: 14, fontFamily: 'inherit', outline: 'none', background: bg, boxSizing: 'border-box', marginBottom: 10 };
  const sLabel = { fontSize: 11, fontWeight: 600, color: soft, marginBottom: 4, display: 'block' };

  if (loading) return <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Nunito Sans',sans-serif" }}><div style={{ color: accent }}>Загрузка...</div></div>;

  // Login screen
  if (!auth) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Nunito Sans',sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 600 }}>Админка</div>
          <div style={{ fontSize: 13, color: muted, marginTop: 4 }}>Без износа</div>
        </div>
        <div style={sCard}>
          <label style={sLabel}>Пароль</label>
          <input type="password" value={pass} onChange={function (e) { setPass(e.target.value); setErr(''); }}
            onKeyDown={function (e) { if (e.key === 'Enter') login(); }}
            placeholder="Пароль администратора" style={sInput} />
          {err && <div style={{ fontSize: 12, color: '#C0533A', marginBottom: 8, textAlign: 'center' }}>{err}</div>}
          <button onClick={login} style={{ ...sBtn, width: '100%' }}>Войти</button>
        </div>
      </div>
    </div>
  );

  // Groups list
  if (view === 'groups') return (
    <div style={{ minHeight: '100vh', background: bg, padding: 20, fontFamily: "'Nunito Sans',sans-serif", maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 600 }}>Группы</div>
        <button onClick={function () { setShowNew(!showNew); }} style={sBtnSm}>{showNew ? 'Отмена' : '+ Группа'}</button>
      </div>

      {showNew && <div style={{ ...sCard, borderLeft: '3px solid ' + accent }}>
        <label style={sLabel}>Код группы (латиницей, ученики вводят при входе)</label>
        <input value={newCode} onChange={function (e) { setNewCode(e.target.value); }} placeholder="поток1" style={sInput} />
        <label style={sLabel}>Название</label>
        <input value={newName} onChange={function (e) { setNewName(e.target.value); }} placeholder="Первый поток" style={sInput} />
        <label style={sLabel}>Дата старта программы</label>
        <input type="date" value={newDate} onChange={function (e) { setNewDate(e.target.value); }} style={sInput} />
        {err && <div style={{ fontSize: 12, color: '#C0533A', marginBottom: 8 }}>{err}</div>}
        <button onClick={createGroup} style={{ ...sBtn, width: '100%' }}>Создать</button>
      </div>}

      {groups.length === 0 && <div style={{ textAlign: 'center', color: muted, padding: 40 }}>Нет групп. Создай первую.</div>}

      {groups.map(function (g) {
        var startDate = new Date(g.start_date);
        var now = new Date();
        var dayNum = Math.floor((now - startDate) / 86400000);
        var status = dayNum < 0 ? 'Не начата' : dayNum >= 42 ? 'Завершена' : 'День ' + (dayNum + 1) + ' из 42';
        var statusColor = dayNum < 0 ? muted : dayNum >= 42 ? '#7AAE6E' : accent;

        return <div key={g.id} style={sCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 600 }}>{g.name}</div>
              <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>Код: <span style={{ color: accent, fontWeight: 600 }}>{g.code}</span></div>
              <div style={{ fontSize: 12, color: muted }}>Старт: {startDate.toLocaleDateString('ru-RU')}</div>
              <div style={{ fontSize: 12, color: statusColor, fontWeight: 600, marginTop: 2 }}>{status}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 24, fontWeight: 700, color: accent }}>{g.user_count}</div>
              <div style={{ fontSize: 10, color: muted }}>участников</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={function () { openGroup(g.id); }} style={sBtnSm}>Участники</button>
            <button onClick={function () { openProgress(g.id); }} style={sBtnOut}>Прогресс</button>
            <button onClick={function () { deleteGroup(g.id); }} style={{ ...sBtnOut, color: '#C0533A', borderColor: '#C0533A44', marginLeft: 'auto' }}>Удалить</button>
          </div>
        </div>;
      })}
    </div>
  );

  // Users in group
  if (view === 'users') return (
    <div style={{ minHeight: '100vh', background: bg, padding: 20, fontFamily: "'Nunito Sans',sans-serif", maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={function () { setView('groups'); }} style={sBtnOut}>← Группы</button>
        <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 600 }}>{groupInfo ? groupInfo.name : 'Участники'}</div>
      </div>

      {users.length === 0 && <div style={{ textAlign: 'center', color: muted, padding: 40 }}>Пока никто не зашёл</div>}

      {users.map(function (u) {
        var total = Math.min(42, Math.max(1, Math.floor((new Date() - new Date(groupInfo.start_date)) / 86400000) + 1));
        var pct = total > 0 ? Math.round((u.done_count / total) * 100) : 0;

        return <div key={u.id} style={sCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{u.name}</div>
              {u.anchor && <div style={{ fontSize: 11, color: accent, marginTop: 2 }}>⚓ {u.anchor}</div>}
              <div style={{ fontSize: 11, color: muted, marginTop: 4 }}>
                Практик: <b style={{ color: text }}>{u.done_count}</b> · Тихих: {u.quiet_count} · Анкета А: {u.has_survey_a ? '✓' : '—'} · Б: {u.has_survey_b ? '✓' : '—'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: accent }}>{pct}%</div>
              <div style={{ fontSize: 9, color: muted }}>регулярность</div>
            </div>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: border, marginTop: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: pct + '%', background: accent, borderRadius: 3 }} />
          </div>
        </div>;
      })}
    </div>
  );

  // Progress grid
  if (view === 'progress') {
    // Build grid: rows = users, cols = days
    var userNames = [];
    var grid = {};
    for (var i = 0; i < progress.length; i++) {
      var p = progress[i];
      if (!grid[p.name]) { grid[p.name] = {}; userNames.push(p.name); }
      grid[p.name][p.day_number] = p.status;
    }
    // Deduplicate names
    userNames = Array.from(new Set(userNames));

    return (
      <div style={{ minHeight: '100vh', background: bg, padding: 20, fontFamily: "'Nunito Sans',sans-serif", maxWidth: '100%', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={function () { setView('groups'); }} style={sBtnOut}>← Группы</button>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 18, fontWeight: 600 }}>Прогресс</div>
        </div>

        {userNames.length === 0 && <div style={{ textAlign: 'center', color: muted, padding: 40 }}>Нет данных</div>}

        {userNames.length > 0 && <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 11, minWidth: 600 }}>
            <thead>
              <tr>
                <th style={{ padding: '6px 10px', textAlign: 'left', color: soft, fontWeight: 600, position: 'sticky', left: 0, background: bg }}>Имя</th>
                {Array.from({ length: 42 }).map(function (_, d) {
                  var weekBorder = d % 7 === 0 && d > 0;
                  return <th key={d} style={{ padding: '4px 2px', color: muted, fontWeight: 400, fontSize: 9, borderLeft: weekBorder ? '2px solid ' + border : 'none' }}>{d + 1}</th>;
                })}
              </tr>
            </thead>
            <tbody>
              {userNames.map(function (name) {
                return <tr key={name}>
                  <td style={{ padding: '4px 10px', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', position: 'sticky', left: 0, background: bg }}>{name}</td>
                  {Array.from({ length: 42 }).map(function (_, d) {
                    var st = grid[name] ? grid[name][d] : null;
                    var bg2 = st === 'done' ? accent : st === 'quiet' ? '#E8E3DB' : 'transparent';
                    var weekBorder = d % 7 === 0 && d > 0;
                    return <td key={d} style={{ padding: 1, borderLeft: weekBorder ? '2px solid ' + border : 'none' }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: bg2, margin: '0 auto' }} />
                    </td>;
                  })}
                </tr>;
              })}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, fontSize: 11, color: muted }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: accent }} /> Сделал</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#E8E3DB' }} /> Тихий день</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 10, height: 10, borderRadius: 2, background: 'transparent', border: '1px solid ' + border }} /> Пусто</div>
          </div>
        </div>}
      </div>
    );
  }

  return null;
}

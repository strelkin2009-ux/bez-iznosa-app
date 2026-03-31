'use client';
export default function Home() {
  return <App />;
}

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

/* ── CONFIG (same as prototype) ── */
const DAYS=42;
const WT=[
  {n:"Заметить",f:"Тело",c:"#B8673E",pt:"Чек-ин",pd:"3 мин"},
  {n:"Сбросить",f:"Тело",c:"#C4784A",pt:"Сброс",pd:"3 мин"},
  {n:"Восстановить",f:"Тело",c:"#D08B5E",pt:"Выключение",pd:"5 мин"},
  {n:"Увидеть целиком",f:"Голова",c:"#8B7355",pt:"Разгрузка",pd:"4 мин"},
  {n:"Поймать паттерн",f:"Голова",c:"#7A6B5A",pt:"Пауза",pd:"3 мин"},
  {n:"Закрепить",f:"Интеграция",c:"#6B5D4F",pt:"ВОЗВРАТ",pd:"2–7 мин"},
];
const PD=[
  {t:"Чек-ин",s:"Сканирование четырёх точек",st:["Закрой глаза.","Челюсть — сжата? Заметь.","Плечи — подняты? Заметь.","Дыхание — поверхностное?","Живот — напряжён?","Назови состояние.","Отпусти. Заметил — сделал."],a:"Якорь: чайник, обед, кровать."},
  {t:"Сброс",s:"Вздох + заземление",st:["Двойной вдох через нос.","Длинный выдох через рот.","Повтори 3 раза.","Стопы на полу.","Три звука — назови."],a:"Каждый день + при нарастании."},
  {t:"Выключение",s:"Расслабление + 4-2-7",st:["Ляг. Глаза закрыты.","Сверху вниз: лоб→стопы.","Напряги→отпусти→разница.","Вдох 4, пауза 2, выдох 7.","3–5 циклов."],a:"Расслабить тело, не уснуть."},
  {t:"Разгрузка",s:"Выгрузка из головы",st:["Сядь. Глаза закрыты.","Назови всё в голове.","«Слышу. Потом.»","Одну — самую важную.","Остальное в очередь."],a:"Утром или днём."},
  {t:"Пауза",s:"Зазор",st:["Что за мысль?","Что чувствует тело?","Факт или интерпретация?","«Знакомая.»","Выбери реакцию."],a:"Просто замечай."},
  {t:"ВОЗВРАТ",s:"Система",st:["Тревога→Сброс","Бессонница→Выключение","Голова→Разгрузка","Реакция→Пауза","Чек→Чек-ин"],a:"Работает через год."},
];
const CQ={0:[{q:"Челюсть сжата?",o:["Да","Нет","Не проверял"]},{q:"Плечи подняты?",o:["Да","Нет","Не смотрел"]},{q:"К якорю привязал?",o:["Да","Забыл","Поздно"]},{q:"Дыхание мелкое?",o:["Да","Нет","Не понял"]},{q:"Нарастание?",o:["Да","Нет","Не было"]},{q:"Живот?",o:["Да","Нет","Не чувствую"]},{q:"Сколько раз?",o:["0","1–2","3+"]}],1:[{q:"Вздох применил?",o:["Да","Нет","Не было"]},{q:"Снизилось?",o:["Заметно","Немного","Нет"]},{q:"До реакции?",o:["До","После","Нет"]},{q:"Срывался?",o:["Да","Почти","Нет"]},{q:"Связка?",o:["Да","Частично","Нет"]},{q:"Незаметно?",o:["Да","Нет","Нет"]},{q:"Тело?",o:["Да","Немного","Нет"]}],2:[{q:"Заснул как?",o:["Быстро","Норм","Долго"]},{q:"Практика?",o:["Да","Частично","Нет"]},{q:"Телефон?",o:["Выключил","Нет","Забыл"]},{q:"Утром?",o:["Да","Средне","Нет"]},{q:"Время?",o:["Стабильно","Ищу","Нет"]},{q:"Расслабилось?",o:["Да","Частично","Нет"]},{q:"Ритуал?",o:["Да","Нет","Не понял"]}],3:[{q:"Убрал?",o:["Да","Планирую","Нет"]},{q:"Тише?",o:["Да","Немного","Нет"]},{q:"Отложил?",o:["Да","Пробовал","Забыл"]},{q:"Помощь?",o:["Да","Нет","Нет"]},{q:"Мысли?",o:["Да","Не уверен","Нет"]},{q:"Действие?",o:["Да","В процессе","Нет"]},{q:"Разгрузка?",o:["Да","Немного","Нет"]}],4:[{q:"Мысль?",o:["Да","Нет","Не было"]},{q:"Пауза?",o:["Да","Частично","Нет"]},{q:"Факт?",o:["Помог","Иногда","Нет"]},{q:"Реакция?",o:["Да","Пробовал","Нет"]},{q:"Какая?",o:["Тихая","Громкая","Нет"]},{q:"Связка?",o:["Да","Иногда","Нет"]},{q:"Автоматика?",o:["Да","Нет"]}],5:[{q:"Какую?",o:["Чек-ин","Сброс","Выключение","Разгрузку"]},{q:"Автомат?",o:["Да","Почти","Нет"]},{q:"Сигнал?",o:["Да","Нет","Не было"]},{q:"Среагировал?",o:["Да","Нет","Нет"]},{q:"Сдвиг?",o:["Да","Немного","Нет"]},{q:"Энергия?",o:["Да","Так же","Нет"]},{q:"Часть жизни?",o:["Да","Частично","Нет"]}]};
const SQ=[{id:"sleep",q:"Как засыпаешь?",o:["Быстро","20–30 мин","Долго","Часами/вырубает"]},{id:"jaw",q:"Челюсть сжата?",o:["Нет","Немного","Да, и плечи","Не замечал"]},{id:"snap",q:"Срываешься?",o:["Никогда","Раз в неделю","Несколько раз","Каждый день"]},{id:"anxiety",q:"Тревога?",o:["Нет","Иногда","Почти всегда","Волнами"]},{id:"decisions",q:"Решения?",o:["Легко","К вечеру устаю","Через силу","Не могу выбрать"]},{id:"morning",q:"Утром?",o:["Бодрый","Без запаса","Уставший","Как не спал"]},{id:"rest",q:"Отдых?",o:["Помогает","Ненадолго","Не помогает","Какой?"]},{id:"joy",q:"Радость?",o:["Радует","Реже","Задача","Не помню"]}];
const ANCH=["Перестать срываться","Нормально спать","Вернуть энергию","Чувствовать себя живым"];
const MILES={7:"Замечаешь напряжение до того, как накрывает",14:"Вздох — рефлекс",21:"Сон меняется",28:"Голова яснее",35:"Ловишь мысли до реакции",42:"Инструменты — твои"};
const _f=["Вздох снижает пульс за 30 сек","Стресс уменьшает кору","3 мин покоя = восстановление","Челюсть — хранилище","Сон = ремонт мозга","Мнимая угроза = реальная","Длинный выдох — переключатель","Решения истощают","Расслабление→−кортизол","Назвать = снизить","Перегрузка глушит тело","6 сек паузы","Система обучаема","Поддержка→−кортизол"];
const _a=["Заметил—сделал","Пропуск≠провал","Тело→голова","1×7","Видеть=шаг","−20%","Отдых≠ремонт","Скролл=обезболивание","Дата возврата","Стенки тонкие","Инструменты остаются","Направление>скорость","Развернул","Снизить пик"];
const _c=["Челюсть—когда?","Решения до обеда","Телефон просто так","60 сек тишины","Эмоция утром","Плечи к ушам","3 выдоха","Что чувствует тело?","Телефон в др. комнату","Маленькое «нет»","Вздох→ответ","2 мин на полу","Мысль утром","Спасибо телу"];
const MOS=[];for(let i=0;i<DAYS;i++){const c=i%3,x=Math.floor(i/3)%14;MOS.push(c===0?{t:"fact",tx:_f[x]}:c===1?{t:"anchor",tx:_a[x]}:{t:"chal",tx:_c[x]});}
const TE={fact:"🧠",anchor:"⚓",chal:"⚡"};const TL={fact:"Факт",anchor:"Якорь",chal:"Челлендж"};
function gdn(s){const n=new Date(),st=new Date(s);st.setHours(0,0,0,0);n.setHours(0,0,0,0);return Math.floor((n-st)/864e5);}

/* ── UI helpers ── */
function Btn({children,primary,disabled,onClick,style}){return<button onClick={disabled?undefined:onClick} style={{width:"100%",padding:primary?"14px":"10px",borderRadius:12,border:primary?"none":"1px solid #EDE8E0",background:disabled?"#EDE8E0":primary?"#B8673E":"transparent",color:disabled?"#8A837B":primary?"#FDFBF8":"#8A837B",fontSize:primary?14:12,fontWeight:primary?600:400,cursor:disabled?"default":"pointer",fontFamily:"inherit",...(style||{})}}>{children}</button>;}
function Card({children,style}){return<div style={{background:"#FDFBF8",borderRadius:14,padding:14,boxShadow:"0 1px 8px rgba(45,42,38,.04)",marginBottom:10,...(style||{})}}>{children}</div>;}
function Opt({children,selected,onClick}){return<div onClick={onClick} style={{padding:"11px 14px",borderRadius:12,border:"1.5px solid "+(selected?"#B8673E":"#EDE8E0"),background:selected?"#B8673E":"#FDFBF8",color:selected?"#FDFBF8":"#2D2A26",fontSize:13,cursor:"pointer",transition:"all .2s",textAlign:"left",lineHeight:1.4,width:"100%",boxSizing:"border-box"}}>{children}</div>;}
function Vessel({level}){const fh=180*(level/100),fy=230-fh,co=Math.max(0,1-level/100);return<svg viewBox="0 0 200 280" style={{width:"100%",maxWidth:130,height:"auto"}}><defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#D4956E" stopOpacity=".6"/><stop offset="100%" stopColor="#B8673E" stopOpacity=".3"/></linearGradient><clipPath id="vc"><path d="M50,50 Q40,50 38,65 L30,220 Q28,245 50,250 L150,250 Q172,245 170,220 L162,65 Q160,50 150,50 Z"/></clipPath></defs><path d="M50,50 Q40,50 38,65 L30,220 Q28,245 50,250 L150,250 Q172,245 170,220 L162,65 Q160,50 150,50 Z" fill="#EDE8E0" fillOpacity=".3" stroke="#B8673E" strokeWidth="2" strokeOpacity=".3"/><g clipPath="url(#vc)"><rect x="25" y={fy} width="150" height={fh+10} fill="url(#wg)"/></g><g opacity={co*.5}><path d="M55,80 L60,110 L52,135" fill="none" stroke="#B8673E" strokeWidth="1.2" strokeLinecap="round"/><path d="M145,90 L138,120 L148,145" fill="none" stroke="#B8673E" strokeWidth="1" strokeLinecap="round"/></g><rect x="45" y="42" width="110" height="12" rx="4" fill="#EDE8E0" stroke="#B8673E" strokeWidth="1.5" strokeOpacity=".3"/><text x="100" y="270" textAnchor="middle" fontFamily="Georgia,serif" fontSize="14" fill="#B8673E" fontWeight="600">{Math.round(level)}%</text></svg>;}

/* ── APP ── */
function App(){
  const[phase,setPhase]=useState("loading"); // loading,login,onboard,anchor,letter,survey-a,main,survey-b,compare
  const[user,setUser]=useState(null);
  const[group,setGroup]=useState(null);
  const[prog,setProg]=useState({completedDays:{},quietDays:{},checkinAnswers:{}});
  const[pulse,setPulse]=useState({done:0,total:8});
  const[tab,setTab]=useState("main");
  const[showCI,setCI]=useState(false);
  const[rev,setRev]=useState(null);
  const[pExp,setPE]=useState(false);
  const[showS,setSS]=useState(false);
  const[err,setErr]=useState("");

  // Check session on load
  useEffect(function(){
    api.me().then(function(d){
      setUser(d.user);setGroup(d.group);
      if(!d.user.onboarded)setPhase("onboard");
      else if(!d.user.letterDone)setPhase("letter");
      else setPhase("main");
      return api.getProgress();
    }).then(function(p){setProg(p);api.getPulse().then(setPulse).catch(function(){});}).catch(function(){setPhase("login");});
  },[]);

  async function handleLogin(name,code){
    try{
      setErr("");
      const d=await api.login(name,code);
      setUser(d.user);setGroup(d.group);
      const p=await api.getProgress();setProg(p);
      api.getPulse().then(setPulse).catch(function(){});
      if(!d.user.onboarded)setPhase("onboard");
      else if(!d.user.letterDone)setPhase("letter");
      else setPhase("main");
    }catch(e){setErr(e.message);}
  }

  // Computed
  var cd=group?gdn(group.start_date):0;
  var active=cd>=0&&cd<DAYS;
  var ended=cd>=DAYS;
  var cw=Math.min(5,Math.max(0,Math.floor(cd/7)));
  var diw=cd%7;
  var tDone=!!prog.completedDays[cd];
  var tQuiet=!!prog.quietDays[cd];
  var cc=Object.keys(prog.completedDays).length;
  var vl=Math.min(100,8+(cc/DAYS)*82);
  var wq=CQ[cw]||CQ[5];var tq=wq[diw%wq.length];
  var w=WT[cw];
  var ms=MILES[cd+1];
  var streak=0;for(var si=cd;si>=0;si--){if(prog.completedDays[si])streak++;else break;}
  var eve=false;try{eve=new Date().getHours()>=21;}catch(e){}
  var needSA=user&&!user.survey_a&&user.onboarded;
  var needSB=ended&&user&&!user.survey_b;
  var show2Q=user&&user.anchor&&cd>=2&&prog.quietDays[cd-1]&&prog.quietDays[cd-2]&&!tDone&&!tQuiet;

  async function markP(){
    if(!active||tDone||tQuiet)return;
    setRev(MOS[cd]);setCI(true);
  }
  async function markQ(){
    if(!active||tDone||tQuiet)return;
    await api.markDay(cd,"quiet",null);
    setProg(function(p){return{...p,quietDays:{...p.quietDays,[cd]:true}};});
  }
  async function subCI(a){
    await api.markDay(cd,"done",a);
    setProg(function(p){return{...p,completedDays:{...p.completedDays,[cd]:true},checkinAnswers:{...p.checkinAnswers,[cd]:a}};});
    setCI(false);setRev(null);
    api.getPulse().then(setPulse).catch(function(){});
  }
  async function saveAnchor(v){
    await api.updateProfile({anchor:v});
    setUser(function(u){return{...u,anchor:v,onboarded:true};});
    if(!user.letterDone)setPhase("letter");else setPhase("main");
  }
  async function saveLetter(v){
    await api.updateProfile({letter:v});
    setUser(function(u){return{...u,letter:v,letterDone:true};});
    setPhase("main");
  }
  async function saveSurveyA(a){
    await api.updateProfile({survey_a:a});
    setUser(function(u){return{...u,survey_a:a};});
    setPhase("main");
  }
  async function saveSurveyB(b){
    await api.updateProfile({survey_b:b});
    setUser(function(u){return{...u,survey_b:b};});
    setPhase("compare");
  }
  async function handleLogout(){
    await api.logout();setUser(null);setGroup(null);setPhase("login");
  }

  // ── RENDER ──
  var CSS=`@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(184,103,62,.3)}50%{box-shadow:0 0 0 8px rgba(184,103,62,0)}}@keyframes su{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes fi{from{opacity:0}to{opacity:1}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}`;

  if(phase==="loading")return<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#F7F3EE"}}><style>{CSS}</style><div style={{fontFamily:"Georgia,serif",color:"#B8673E"}}>Загрузка...</div></div>;

  if(phase==="login")return<div><style>{CSS}</style><LoginScreen onLogin={handleLogin} err={err}/></div>;
  if(phase==="onboard")return<div><style>{CSS}</style><OnboardScreen name={user.name} onDone={function(){setPhase("anchor");}}/></div>;
  if(phase==="anchor")return<div><style>{CSS}</style><AnchorScreen onDone={saveAnchor}/></div>;
  if(phase==="letter")return<div><style>{CSS}</style><LetterScreen onDone={saveLetter}/></div>;
  if(phase==="survey-a")return<div><style>{CSS}</style><SurveyScreen title="Точка А" sub="8 вопросов — как сейчас" onDone={saveSurveyA}/></div>;
  if(phase==="survey-b")return<div><style>{CSS}</style><SurveyScreen title="Точка Б" sub="Что изменилось" onDone={saveSurveyB}/></div>;
  if(phase==="compare")return<div><style>{CSS}</style><CompareScreen a={user.survey_a} b={user.survey_b} letter={user.letter} onDone={function(){api.updateProfile({compare_viewed:true});setUser(function(u){return{...u,compare_viewed:true};});setPhase("main");}}/></div>;

  return<div style={{minHeight:"100vh",background:eve?"#2D2A26":"#F7F3EE",color:eve?"#EDE8E0":"#2D2A26",maxWidth:480,margin:"0 auto",transition:"background .5s"}}><style>{CSS}</style>
    {/* Header */}
    <div style={{padding:"12px 16px 0",background:eve?"#333029":"linear-gradient(180deg,#EDE8E0,#F7F3EE)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:600}}>{eve?"🌙 ":""}Без износа</div>{active&&<div style={{fontSize:10,color:"#8A837B",marginTop:1}}>Нед. {cw+1} · «{w.n}» · День {cd+1}</div>}{ended&&<div style={{fontSize:10,color:"#7AAE6E"}}>Завершено</div>}</div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {needSA&&<div onClick={function(){setPhase("survey-a");}} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",animation:"blink 1.5s infinite",background:"#B8673E",color:"#FDFBF8"}}>Анкета</div>}
          {needSB&&<div onClick={function(){setPhase("survey-b");}} style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",animation:"blink 1.5s infinite",background:"#B8673E",color:"#FDFBF8"}}>Точка Б</div>}
          <div onClick={function(){setSS(!showS);}} style={{width:26,height:26,borderRadius:"50%",background:"#B8673E",color:"#FDFBF8",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia,serif",fontSize:12,fontWeight:600,cursor:"pointer"}}>{user.name[0].toUpperCase()}</div>
        </div>
      </div>
      {showS&&<Card style={{marginTop:8,animation:"su .2s"}}>{user.anchor&&<div style={{fontSize:10,color:"#8A837B",marginBottom:6}}>⚓ {user.anchor}</div>}<Btn onClick={handleLogout}>Выйти</Btn></Card>}
      {(active||ended)&&<div style={{display:"flex",marginTop:8,borderBottom:"1px solid "+(eve?"#44403A":"#EDE8E0")}}>{["Сегодня","42 дня","Мой путь"].map(function(t,i){var k=["main","mosaic","stats"][i];return<button key={k} onClick={function(){setTab(k);}} style={{flex:1,padding:"9px 0",fontSize:12,fontWeight:600,border:"none",background:"none",color:tab===k?"#B8673E":"#8A837B",borderBottom:tab===k?"2px solid #B8673E":"2px solid transparent",cursor:"pointer",fontFamily:"inherit"}}>{t}</button>;})}</div>}
    </div>

    {(active||ended)&&<div style={{padding:"0 16px 32px"}}>
      {tab==="main"&&<div style={{animation:"fi .3s",paddingTop:12}}>
        {eve&&active&&!tDone&&!tQuiet&&<Card style={{textAlign:"center"}}><div style={{fontSize:13,color:"#D4956E"}}>3 минуты вместо скроллинга</div></Card>}
        {ms&&tDone&&<Card style={{textAlign:"center",background:eve?"#3A3632":"#F0E6DC"}}><div style={{fontSize:12,color:"#B8673E",fontWeight:600}}>{ms}</div></Card>}
        {show2Q&&<Card style={{textAlign:"center",border:"1px solid #D4956E44"}}><div style={{fontSize:10,color:"#8A837B"}}>Помнишь, зачем?</div><div style={{fontSize:13,color:"#B8673E",fontWeight:600}}>«{user.anchor}»</div></Card>}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"4px 0"}}><Vessel level={vl}/><div style={{display:"flex",gap:16,marginTop:8}}>{[{v:cc,l:"практик"},{v:(cc>0&&cd>0?Math.round(cc/Math.min(cd+1,DAYS)*100):0)+"%",l:"регулярность"},{v:streak,l:"подряд"}].map(function(s,i){return<div key={i} style={{textAlign:"center"}}><div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:700,color:"#B8673E"}}>{s.v}</div><div style={{fontSize:9,color:"#8A837B"}}>{s.l}</div></div>;})}</div></div>
        {active&&<div style={{textAlign:"center",padding:6,fontSize:11,color:"#8A837B",fontStyle:"italic"}}>«{MOS[cd].tx}»</div>}
        {active&&<Card><div onClick={function(){setPE(!pExp);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}><div><div style={{fontSize:9,color:w.c,fontWeight:700,textTransform:"uppercase"}}>Практика · {w.pd}</div><div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:600}}>{PD[cw].t}</div><div style={{fontSize:11,color:"#8A837B"}}>{PD[cw].s}</div></div><div style={{fontSize:14,color:"#8A837B",transform:pExp?"rotate(180deg)":"none"}}>▾</div></div>{pExp&&<div style={{borderTop:"1px solid #EDE8E0",paddingTop:10,marginTop:10,animation:"su .3s"}}>{PD[cw].st.map(function(s,i){return<div key={i} style={{display:"flex",gap:8,marginBottom:5}}><div style={{width:18,height:18,borderRadius:"50%",background:w.c+"15",color:w.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,flexShrink:0}}>{i+1}</div><div style={{fontSize:12,color:"#5C5650",lineHeight:1.5}}>{s}</div></div>;})}<div style={{marginTop:8,padding:"7px 10px",borderRadius:8,background:"#F0E6DC",fontSize:11,color:"#5C5650"}}>⚓ {PD[cw].a}</div></div>}</Card>}
        {active&&!tDone&&!tQuiet&&!showCI&&<div style={{display:"flex",flexDirection:"column",gap:8}}><Btn primary onClick={markP}>Сделал «{w.pt}»</Btn><Btn onClick={markQ}>Сегодня не получилось</Btn></div>}
        {tQuiet&&!tDone&&<Card style={{textAlign:"center"}}><div style={{fontSize:13,color:"#5C5650"}}>Пропуск — не провал.</div><div style={{fontSize:12,color:"#8A837B",marginTop:2}}>Завтра начни заново.</div></Card>}
        {showCI&&!tDone&&<Card style={{animation:"su .3s"}}>{rev&&<div style={{marginBottom:10,padding:8,borderRadius:8,background:"#F0E6DC",textAlign:"center"}}><div style={{fontSize:9,color:"#B8673E",fontWeight:600,textTransform:"uppercase"}}>{TE[rev.t]} {TL[rev.t]}</div><div style={{fontSize:11,marginTop:2}}>{rev.tx}</div></div>}<div style={{fontSize:13,fontWeight:600,marginBottom:8}}>{tq.q}</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{tq.o.map(function(o){return<Opt key={o} onClick={function(){subCI(o);}}>{o}</Opt>;})}</div></Card>}
        {tDone&&active&&<Card style={{textAlign:"center"}}><div style={{fontSize:24}}>✓</div><div style={{fontFamily:"Georgia,serif",fontSize:14,fontWeight:600}}>Практика сделана</div><div style={{fontSize:10,color:"#B8673E",marginTop:8}}>Увидимся завтра</div></Card>}
        {ended&&<Card style={{textAlign:"center"}}><div style={{fontSize:26}}>🎉</div><div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:600}}>42 дня позади</div></Card>}
        {active&&<Card style={{padding:10}}><div style={{fontSize:9,color:"#8A837B",marginBottom:4}}>Пульс группы</div><div style={{display:"flex",gap:3}}>{Array.from({length:Math.max(pulse.total,1)}).map(function(_,i){return<div key={i} style={{flex:1,height:5,borderRadius:3,background:i<pulse.done?"#B8673E":"#EDE8E0",opacity:i<pulse.done?.7:.4}}/>;})}</div><div style={{fontSize:9,color:"#B8673E",marginTop:3,fontWeight:600}}>{pulse.done}/{pulse.total}</div></Card>}
      </div>}

      {tab==="mosaic"&&<div style={{animation:"fi .3s",paddingTop:12}}>{WT.map(function(wk,wi){return<div key={wi} style={{marginBottom:12}}><div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}><div style={{width:4,height:4,borderRadius:"50%",background:wk.c}}/><div style={{fontSize:9,fontWeight:600,color:wk.c}}>Нед. {wi+1} — {wk.n}</div></div><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>{Array.from({length:7}).map(function(_,di){var d=wi*7+di;if(d>=DAYS)return<div key={di}/>;var done=!!prog.completedDays[d];var today=d===cd;var missed=d<cd&&!done;var quiet=!!prog.quietDays[d];if(missed&&quiet)return<div key={di} style={{width:"100%",aspectRatio:"1",borderRadius:5,background:"#E8E3DB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:"#B0A99F"}}>·</div>;if(missed)return<div key={di} style={{width:"100%",aspectRatio:"1",borderRadius:5,background:"#E0DBD3",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"#B0A99F"}}>—</div>;if(!done&&!today)return<div key={di} style={{width:"100%",aspectRatio:"1",borderRadius:5,background:"#EDE8E0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#8A837B",opacity:.4}}>{d+1}</div>;if(today&&!done)return<div key={di} style={{width:"100%",aspectRatio:"1",borderRadius:5,background:wk.c+"22",border:"2px solid "+wk.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:wk.c,fontWeight:700,animation:"pulse 2s infinite"}}>{d+1}</div>;return<div key={di} style={{width:"100%",aspectRatio:"1",borderRadius:5,background:wk.c,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#FDFBF8",fontWeight:600}}>{TE[MOS[d].t]}</div>;})}</div></div>;})}</div>}

      {tab==="stats"&&<div style={{animation:"fi .3s",paddingTop:12}}><div style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:600,marginBottom:10}}>Мой путь</div>{WT.map(function(wk,wi){var wd=[];for(var di=0;di<7;di++){var d=wi*7+di;if(d<DAYS)wd.push(d);}var wc2=wd.filter(function(d){return prog.completedDays[d];}).length;var wqt=wd.filter(function(d){return prog.quietDays[d];}).length;var wa=wd.filter(function(d){return prog.checkinAnswers[d];}).map(function(d){return prog.checkinAnswers[d];});var isCur=wi===cw&&active;var isFut=wi*7>cd;return<Card key={wi} style={{marginBottom:6,opacity:isFut?.3:1,borderLeft:isCur?"3px solid "+wk.c:"3px solid transparent"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><div><span style={{fontSize:10,fontWeight:600,color:wk.c}}>{wk.n}</span></div><div style={{fontSize:10,fontWeight:700,color:wk.c}}>{wc2}/7{wqt>0?<span style={{fontSize:8,color:"#8A837B"}}> +{wqt}т</span>:null}</div></div><div style={{height:4,borderRadius:2,background:"#EDE8E0",overflow:"hidden"}}><div style={{height:"100%",width:(wc2/7*100)+"%",background:wk.c,borderRadius:2}}/></div>{wa.length>0&&<div style={{marginTop:4,display:"flex",flexWrap:"wrap",gap:2}}>{wa.map(function(a,i){return<span key={i} style={{fontSize:7,padding:"1px 5px",borderRadius:5,background:"#F0E6DC",color:"#5C5650"}}>{a}</span>;})}</div>}</Card>;})}
      <Card><div style={{fontFamily:"Georgia,serif",fontSize:13,fontWeight:600,marginBottom:6}}>Итого</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>{[{v:cc,l:"с практикой"},{v:Object.keys(prog.quietDays).length,l:"тихих"},{v:Math.round(vl)+"%",l:"сосуд"},{v:ended?"✓":Math.max(0,DAYS-cd-1),l:ended?"завершено":"осталось"}].map(function(s,i){return<div key={i} style={{textAlign:"center",padding:8,background:"#F7F3EE",borderRadius:6}}><div style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:700,color:"#B8673E"}}>{s.v}</div><div style={{fontSize:8,color:"#8A837B"}}>{s.l}</div></div>;})}</div></Card>
      {user.anchor&&<Card style={{textAlign:"center"}}><div style={{fontSize:9,color:"#8A837B"}}>⚓</div><div style={{fontSize:12,color:"#B8673E",fontWeight:600}}>«{user.anchor}»</div></Card>}
      {user.letter&&!ended&&<Card style={{textAlign:"center"}}><div style={{fontSize:9,color:"#8A837B"}}>✉️ Запечатано до дня 42</div></Card>}
      </div>}
    </div>}
  </div>;
}

/* Sub-screens */
function LoginScreen({onLogin,err}){const[n,sN]=useState("");const[c,sC]=useState("");return<div style={{minHeight:"100vh",background:"#F7F3EE",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}><div style={{width:"100%",maxWidth:320}}><div style={{textAlign:"center",marginBottom:28}}><div style={{fontFamily:"Georgia,serif",fontSize:28,fontWeight:600}}>Без износа</div><div style={{fontSize:13,color:"#8A837B",marginTop:4}}>Личный кабинет</div></div><Card><div style={{marginBottom:12}}><div style={{fontSize:11,fontWeight:600,color:"#5C5650",marginBottom:4}}>Имя</div><input value={n} onChange={function(x){sN(x.target.value);}} placeholder="Как к тебе обращаться" style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #EDE8E0",fontSize:14,fontFamily:"inherit",outline:"none",background:"#F7F3EE",boxSizing:"border-box"}}/></div><div style={{marginBottom:14}}><div style={{fontSize:11,fontWeight:600,color:"#5C5650",marginBottom:4}}>Код группы</div><input value={c} onChange={function(x){sC(x.target.value);}} placeholder="От ведущего" style={{width:"100%",padding:"10px 12px",borderRadius:10,border:"1.5px solid #EDE8E0",fontSize:14,fontFamily:"inherit",outline:"none",background:"#F7F3EE",boxSizing:"border-box"}}/></div>{err&&<div style={{fontSize:11,color:"#C0533A",marginBottom:8,textAlign:"center"}}>{err}</div>}<Btn primary onClick={function(){onLogin(n.trim(),c.trim());}}>Войти</Btn></Card></div></div>;}

function OnboardScreen({name,onDone}){const[i,sI]=useState(0);const ss=[{icon:"👋",title:"Привет, "+name,text:"Твоё пространство на 42 дня."},{icon:"🫙",title:"Сосуд",text:"Каждая практика наполняет и затягивает трещины."},{icon:"📅",title:"42 клетки",text:"Пропущенный день не вернуть. И это нормально."},{icon:"📋",title:"Ритуал",text:"Прочитай → сделай → отметь → ответь. 5 минут."},{icon:"👥",title:"Группа",text:"Анонимный пульс. Ты не один."}];var s=ss[i];return<div style={{minHeight:"100vh",background:"#F7F3EE",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}><div style={{width:"100%",maxWidth:320,textAlign:"center"}}><div style={{fontSize:48,marginBottom:14}}>{s.icon}</div><div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:600,marginBottom:8}}>{s.title}</div><div style={{fontSize:14,color:"#5C5650",lineHeight:1.7,marginBottom:28}}>{s.text}</div><div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:20}}>{ss.map(function(_,j){return<div key={j} style={{width:8,height:8,borderRadius:"50%",background:j===i?"#B8673E":"#EDE8E0"}}/>;})}</div><Btn primary onClick={function(){if(i<ss.length-1)sI(i+1);else onDone();}}>{i<ss.length-1?"Дальше":"Начать"}</Btn></div></div>;}

function AnchorScreen({onDone}){const[sel,sS]=useState("");const[cust,sC]=useState("");var val=sel==="custom"?cust:sel;return<div style={{minHeight:"100vh",background:"#F7F3EE",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}><div style={{width:"100%",maxWidth:340}}><div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:32}}>⚓</div><div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:600}}>Ради чего?</div></div><div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>{ANCH.map(function(a){return<Opt key={a} selected={sel===a} onClick={function(){sS(a);}}>{a}</Opt>;})}<Opt selected={sel==="custom"} onClick={function(){sS("custom");}}>Своё...</Opt></div>{sel==="custom"&&<input value={cust} onChange={function(e){sC(e.target.value);}} placeholder="Одной фразой" style={{width:"100%",padding:10,borderRadius:10,border:"1.5px solid #EDE8E0",fontSize:13,fontFamily:"inherit",outline:"none",background:"#FDFBF8",marginBottom:14,boxSizing:"border-box"}}/>}<Btn primary disabled={!val} onClick={function(){onDone(val);}}>Сохранить</Btn></div></div>;}

function LetterScreen({onDone}){const[txt,sT]=useState("");return<div style={{minHeight:"100vh",background:"#F7F3EE",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}><div style={{width:"100%",maxWidth:340,textAlign:"center"}}><div style={{fontSize:32}}>✉️</div><div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:600}}>Письмо себе</div><div style={{fontSize:12,color:"#8A837B",marginTop:4,marginBottom:16}}>Прочитаешь через 42 дня.</div><textarea value={txt} onChange={function(e){sT(e.target.value);}} placeholder="Одно предложение" rows={3} style={{width:"100%",padding:12,borderRadius:12,border:"1.5px solid #EDE8E0",fontSize:14,fontFamily:"inherit",outline:"none",background:"#FDFBF8",resize:"none",boxSizing:"border-box"}}/><div style={{display:"flex",gap:8,marginTop:14}}><Btn onClick={function(){onDone("");}}>Пропустить</Btn><Btn primary disabled={!txt.trim()} onClick={function(){onDone(txt.trim());}} style={{flex:2}}>Запечатать ✉️</Btn></div></div></div>;}

function SurveyScreen({title,sub,onDone}){const[step,sS]=useState(0);const[ans,sA]=useState({});var q=SQ[step];function pick(v){var a={...ans};a[q.id]=v;sA(a);setTimeout(function(){if(step<SQ.length-1)sS(step+1);else onDone(a);},350);}return<div style={{minHeight:"100vh",background:"#F7F3EE",padding:24}}><div style={{textAlign:"center",marginBottom:6}}><div style={{fontFamily:"Georgia,serif",fontSize:17,fontWeight:600}}>{title}</div><div style={{fontSize:11,color:"#8A837B"}}>{sub}</div></div><div style={{height:4,borderRadius:2,background:"#EDE8E0",marginBottom:20}}><div style={{height:"100%",width:((step+1)/SQ.length*100)+"%",background:"#B8673E",borderRadius:2,transition:"width .4s"}}/></div><div key={step} style={{animation:"fi .3s",maxWidth:380,margin:"0 auto"}}><div style={{fontSize:15,fontWeight:600,marginBottom:14}}>{q.q}</div><div style={{display:"flex",flexDirection:"column",gap:8}}>{q.o.map(function(o){return<Opt key={o} selected={ans[q.id]===o} onClick={function(){pick(o);}}>{o}</Opt>;})}</div><div style={{marginTop:20,fontSize:11,color:"#8A837B",textAlign:"center"}}>{step+1}/{SQ.length}</div></div></div>;}

function CompareScreen({a,b,letter,onDone}){return<div style={{minHeight:"100vh",background:"#F7F3EE",padding:24}}><div style={{maxWidth:380,margin:"0 auto"}}><div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:28}}>🎉</div><div style={{fontFamily:"Georgia,serif",fontSize:20,fontWeight:600}}>Сравнение</div></div>{letter&&<Card style={{textAlign:"center"}}><div style={{fontSize:10,color:"#B8673E",fontWeight:600}}>✉️ Письмо</div><div style={{fontSize:14,fontStyle:"italic"}}>«{letter}»</div></Card>}{SQ.map(function(q){var va=a?a[q.id]:"—";var vb=b?b[q.id]:"—";var ch=va!==vb;return<Card key={q.id} style={{borderLeft:ch?"3px solid #7AAE6E":"3px solid #EDE8E0"}}><div style={{fontSize:11,fontWeight:600,color:"#5C5650",marginBottom:4}}>{q.q}</div><div style={{display:"flex",gap:8,fontSize:12}}><div style={{flex:1,padding:5,borderRadius:6,background:"#F0E6DC",textAlign:"center"}}>{va}</div><div style={{alignSelf:"center",color:"#8A837B"}}>→</div><div style={{flex:1,padding:5,borderRadius:6,background:ch?"#E8F5E4":"#F0E6DC",color:ch?"#4A7A42":"#5C5650",textAlign:"center",fontWeight:ch?600:400}}>{vb}</div></div></Card>;})}<Btn primary onClick={onDone}>Готово</Btn></div></div>;}

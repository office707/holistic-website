(() => {
  const app = document.querySelector('[data-portal-app]');
  if (!app) return;
  const clinician = app.dataset.portalMode === 'practitioner';
  const $ = (id) => document.getElementById(id);
  const form = $('portal-entry-form');
  const fields = form.elements;
  const sessionKey = 'norbu-visual-demo-session';
  const todayParts = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Vienna',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const part = (type) => todayParts.find((value) => value.type === type).value;
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  const dateLabel = (value) => new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Europe/Vienna'}).format(new Date(`${value}T12:00:00Z`));
  const daysAgo = (days) => { const date = new Date(`${today}T12:00:00Z`); date.setUTCDate(date.getUTCDate()-days); return date.toISOString().slice(0,10); };
  const typeLabels = {'check-in':'Daily check-in',therapy:'Therapy visit',symptom:'Symptom note'};
  const seed = () => [
    {id:'example-1',date:today,type:'check-in',mood:'Steady',sleep:'Mixed',pain:3,location:'Lower back',energy:'Moderate',impact:'A little uncomfortable after sitting.',note:'I noticed the discomfort most after a long period at my desk. A short break felt helpful.',context:'A busy morning; a quiet walk at lunchtime.',questions:'What observations would be useful to bring to my next appointment?',example:true},
    {id:'example-2',date:daysAgo(1),type:'therapy',mood:'Okay',sleep:'Restful',pain:5,location:'Lower back',energy:'Moderate',therapy:'Example therapy appointment',practitioner:'Example practitioner',impact:'I took a slower afternoon.',note:'After the example appointment I wanted to note how I felt, rather than trying to remember it at the next visit.',context:'I rested afterwards. These are illustrative notes, not a treatment outcome.',questions:'What changes should I keep track of between visits?',example:true},
    {id:'example-3',date:daysAgo(3),type:'symptom',mood:'Unsettled',sleep:'Interrupted',pain:4,location:'Shoulder',energy:'Low',impact:'Carrying a bag felt uncomfortable.',note:'A short note about where I noticed discomfort and how it affected the day.',context:'A longer journey and less sleep than usual.',questions:'Is this observation worth discussing?',example:true},
  ];
  let entries = seed(), editing = null, selected = new Set();
  const quotes = [
    'You do not have to do everything today.',
    'A small observation can be enough for today.',
    'You are allowed to take things at your own pace.',
    'Rest is a valid part of your day.',
    'Your experience deserves to be heard.',
    'There is room for difficult days here, too.',
    'You can start again with one small note.',
    'Noticing how you feel is already a way of checking in.',
    'You do not need perfect words to describe your day.',
    'A little gentleness can make space for the next step.',
  ];
  let quoteIndex = -1;
  const nextQuote = () => { let next; do { next = Math.floor(Math.random()*quotes.length); } while (next === quoteIndex); quoteIndex = next; $('portal-quote').textContent = quotes[next]; };
  const node = (tag, text, className) => { const element = document.createElement(tag); if(text !== undefined) element.textContent = text; if(className) element.className = className; return element; };
  const announce = (message) => { $('portal-form-status').textContent = message; };
  const readSession = () => { try { return sessionStorage.getItem(sessionKey)==='open'; } catch { return false; } };
  const setSession = (open) => { try { if(open) sessionStorage.setItem(sessionKey,'open'); else sessionStorage.removeItem(sessionKey); } catch {} };
  const showWorkspace = (open) => {
    $('portal-gate').hidden = open; $('portal-workspace').hidden = !open;
    if (open) { nextQuote(); render(); $('portal-workspace').setAttribute('tabindex','-1'); $('portal-workspace').focus({preventScroll:true}); }
  };
  $('portal-enter').addEventListener('click',()=>{setSession(true);showWorkspace(true);});
  $('portal-signout').addEventListener('click',()=>{setSession(false);entries=seed();selected.clear();resetForm();$('portal-report').close();showWorkspace(false);$('portal-enter').focus();});
  app.querySelectorAll('[data-auth-tab]').forEach((button)=>button.addEventListener('click',()=>{
    app.querySelectorAll('[data-auth-tab]').forEach((item)=>item.setAttribute('aria-pressed',String(item===button)));
    $('portal-auth-explanation').textContent=button.dataset.authTab==='signup'?'Account creation is a visual preview only. No account will be created and no email will be sent.':'This preview does not check a password or create an account. Do not enter real sign-in details.';
    $('portal-enter').textContent=button.dataset.authTab==='signup'?'Explore the account preview →':clinician?'Open the practitioner demo →':'Open the demo journal →';
  }));
  $('portal-next-quote').addEventListener('click',nextQuote);
  $('portal-today').textContent = `${dateLabel(today)} · A place for your own observations.`;
  fields.date.max=today;
  const resetForm=()=>{form.reset();fields.date.value=today;editing=null;$('portal-form-title').textContent='What would you like to note?';$('portal-save-entry').textContent='Save demo entry →';$('portal-cancel-edit').hidden=true;$('portal-therapy-fields').hidden=true;};
  $('entry-type').addEventListener('change',()=>{$('portal-therapy-fields').hidden=fields.type.value!=='therapy';});
  $('portal-cancel-edit').addEventListener('click',()=>{resetForm();announce('Editing cancelled.');});
  const syncSelection = () => {
    $('portal-prepare-summary').disabled=selected.size===0;
    $('portal-prepare-summary').textContent=`Prepare summary (${selected.size})`;
    $('portal-selection-status').textContent=selected.size?`${selected.size} ${selected.size===1?'entry':'entries'} selected. Review the summary before printing.`:'No entries selected.';
  };
  const describe = (article,label,value) => { if(!value&&value!==0)return; const row=node('p'); row.append(node('strong',label+': '),node('span',String(value)));article.append(row); };
  const renderChart = () => {
    const container=$('portal-pain-chart');container.replaceChildren();
    const points=entries.filter((entry)=>entry.pain!==null&&entry.pain!==undefined&&Number.isFinite(entry.pain)).slice().sort((a,b)=>a.date.localeCompare(b.date));
    if(!points.length){container.append(node('p','No pain scores logged. Recording pain is optional.','portal-small'));return;}
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 600 180');svg.setAttribute('role','img');svg.setAttribute('aria-label',`${points.length} logged pain scores, from 0 to 10. This is an observation chart, not a clinical assessment.`);
    const make=(tag,attrs)=>{const e=document.createElementNS(svg.namespaceURI,tag);Object.entries(attrs).forEach(([key,value])=>e.setAttribute(key,value));return e;};
    [0,5,10].forEach(score=>{const y=145-score*11;svg.append(make('line',{x1:30,x2:570,y1:y,y2:y,stroke:'#dfe7d5','stroke-dasharray':'4 4'}));const label=make('text',{x:5,y:y+4,fill:'#73876b','font-size':11});label.textContent=String(score);svg.append(label);});
    const timestamps=points.map(p=>new Date(`${p.date}T12:00:00Z`).getTime()),min=Math.min(...timestamps),max=Math.max(...timestamps);
    const coords=points.map((entry,index)=>({entry,x:max===min?300:40+(timestamps[index]-min)/(max-min)*515,y:145-entry.pain*11}));
    svg.append(make('polyline',{points:coords.map(p=>`${p.x},${p.y}`).join(' '),fill:'none',stroke:'#729782','stroke-width':2}));
    coords.forEach(({entry,x,y})=>{const circle=make('circle',{cx:x,cy:y,r:5,fill:entry.example?'#a6b991':'#194e46'});const title=make('title',{});title.textContent=`${dateLabel(entry.date)}: ${entry.pain}/10${entry.example?' · illustrative entry':''}`;circle.append(title);svg.append(circle);});
    container.append(svg,node('p',`${dateLabel(points[0].date)} — ${dateLabel(points[points.length-1].date)} · 0 = no pain; 10 = strongest imaginable pain.`,'portal-small'));
  };
  const renderList = () => {
    const query=$('portal-entry-search').value.trim().toLowerCase(),type=$('portal-entry-filter').value;
    const shown=entries.filter(entry=>(type==='all'||entry.type===type)&&(!query||[entry.note,entry.therapy,entry.questions,entry.location,entry.practitioner].filter(Boolean).join(' ').toLowerCase().includes(query))).sort((a,b)=>b.date.localeCompare(a.date));
    const list=$('portal-entry-list');list.replaceChildren();
    $('portal-list-status').textContent=`${shown.length} of ${entries.length} entries shown.`;
    if(!shown.length){list.append(node('p','No entries match. Try another search or write a new note.','portal-empty'));return;}
    shown.forEach((entry)=>{
      const article=node('article',undefined,'portal-entry');article.dataset.entryId=entry.id;
      const header=node('div',undefined,'portal-entry-header');const title=node('div');title.append(node('span',dateLabel(entry.date),'portal-entry-date'),node('h3',typeLabels[entry.type]));
      const badges=node('div',undefined,'portal-entry-badges');if(entry.example)badges.append(node('span','Illustrative example'));if(entry.pain!==null&&entry.pain!==undefined)badges.append(node('span',`Pain ${entry.pain}/10`));header.append(title,badges);article.append(header);
      article.append(node('p',entry.note,'portal-entry-note'));
      const details=node('div',undefined,'portal-entry-details');describe(details,'Location',entry.location);describe(details,'Mood',entry.mood);describe(details,'Sleep',entry.sleep);describe(details,'Energy',entry.energy);describe(details,'Everyday activities',entry.impact);describe(details,'Therapy',entry.therapy);describe(details,'Practitioner',entry.practitioner);describe(details,'Context',entry.context);describe(details,'Questions for next time',entry.questions);article.append(details);
      const actions=node('div',undefined,'portal-entry-actions');const label=node('label');const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=selected.has(entry.id);checkbox.setAttribute('aria-label',`Include ${typeLabels[entry.type]} from ${dateLabel(entry.date)} in summary`);checkbox.addEventListener('change',()=>{if(checkbox.checked)selected.add(entry.id);else selected.delete(entry.id);syncSelection();});label.append(checkbox,node('span','Include in summary'));actions.append(label);
      if(!clinician){const edit=node('button','Edit entry');edit.type='button';edit.addEventListener('click',()=>{
        editing=entry.id;Object.keys(entry).forEach(key=>{if(fields.namedItem(key))fields.namedItem(key).value=entry[key]??'';});
        $('portal-form-title').textContent='Edit your demo entry';$('portal-save-entry').textContent='Save changes →';$('portal-cancel-edit').hidden=false;$('portal-therapy-fields').hidden=entry.type!=='therapy';announce('');form.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});fields.note.focus({preventScroll:true});
      });const remove=node('button','Delete');remove.type='button';remove.addEventListener('click',()=>{entries=entries.filter(item=>item.id!==entry.id);selected.delete(entry.id);if(editing===entry.id)resetForm();render();announce('Demo entry deleted.');});actions.append(edit,remove);}
      article.append(actions);list.append(article);
    });
  };
  function render(){
    $('portal-entry-count').textContent=String(entries.length);$('portal-visit-count').textContent=String(entries.filter(entry=>entry.type==='therapy').length);
    const scores=entries.filter(entry=>Number.isFinite(entry.pain)).map(entry=>entry.pain);$('portal-pain-average').textContent=scores.length?(scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1)+' / 10':'—';
    renderChart();renderList();syncSelection();
  }
  form.addEventListener('submit',(event)=>{
    event.preventDefault();if(clinician||!form.reportValidity())return;
    const data=new FormData(form),entry={id:editing||crypto.randomUUID(),date:String(data.get('date')),type:String(data.get('type')),pain:data.get('pain')===''?null:Number(data.get('pain')),example:false};
    ['mood','sleep','location','energy','impact','therapy','practitioner','note','context','questions'].forEach(key=>entry[key]=String(data.get(key)||'').trim());
    if(!entry.note){fields.note.setCustomValidity('Please write an observation.');fields.note.reportValidity();return;}fields.note.setCustomValidity('');
    if(entry.type!=='therapy'){entry.therapy='';entry.practitioner='';}
    const wasEditing=!!editing;entries=wasEditing?entries.map(item=>item.id===editing?entry:item):[entry,...entries];resetForm();render();announce(wasEditing?'Demo entry updated.':'Demo entry saved for this open page.');
  });
  fields.note.addEventListener('input',()=>fields.note.setCustomValidity(''));
  $('portal-entry-search').addEventListener('input',renderList);$('portal-entry-filter').addEventListener('change',renderList);
  $('portal-reset-demo').addEventListener('click',()=>{entries=seed();selected.clear();resetForm();render();announce('Illustrative entries restored.');});
  $('portal-clear-selection').addEventListener('click',()=>{selected.clear();renderList();syncSelection();});
  const report=$('portal-report');
  $('portal-prepare-summary').addEventListener('click',()=>{
    const content=$('portal-report-content');content.replaceChildren();const chosen=entries.filter(entry=>selected.has(entry.id)).sort((a,b)=>a.date.localeCompare(b.date));if(!chosen.length)return;
    content.append(node('span','Norbu · demo journal summary','portal-eyebrow'),node('h1','Notes for a conversation'),node('p',`Prepared ${dateLabel(today)} · ${chosen.length} selected entries. Only the entries chosen by the user are included.`),node('p','This is a demo summary, not a clinical assessment. Illustrative records are explicitly marked. Nothing has been sent to a practitioner.','portal-report-note'));
    chosen.forEach(entry=>{const article=node('article',undefined,'portal-report-entry');article.append(node('h2',`${dateLabel(entry.date)} · ${typeLabels[entry.type]}`));if(entry.example)article.append(node('strong','Illustrative example — not a real patient observation'));article.append(node('p',entry.note));describe(article,'Pain score',entry.pain===null?null:`${entry.pain}/10`);['location','mood','sleep','energy','impact','therapy','practitioner','context','questions'].forEach(key=>describe(article,({impact:'Everyday activities',context:'Context / what helped',questions:'Questions for next visit'})[key]||key.charAt(0).toUpperCase()+key.slice(1),entry[key]));content.append(article);});
    report.showModal();
  });
  $('portal-close-report').addEventListener('click',()=>report.close());$('portal-print-report').addEventListener('click',()=>window.print());
  resetForm();showWorkspace(readSession());
})();

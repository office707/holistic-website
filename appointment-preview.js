// Explicitly illustrative UI: no real slots, appointments or booking requests.
(() => {
  const now = new Date();
  const today = new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  const dayLabel = (date) => new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date);
  document.querySelectorAll('[data-appointment-preview]').forEach((root,index)=>{
    let month=today.getMonth(), year=today.getFullYear(), selected=null;
    const prefix=`appointment-demo-${index}`;
    root.className+=' appointment-preview';
    const el=(tag,content,className)=>{const node=document.createElement(tag);if(content)node.textContent=content;if(className)node.className=className;return node;};
    const badge=el('span','Design preview · example times','appointment-preview-badge');
    const heading=el('h3','Example calendar');
    if(root.hasAttribute('data-practice-calendar')){
      const params=new URLSearchParams(location.search),profiles=window.norbuPractitioners||[];
      const requested=params.get('id')||params.get('practitioner');
      const profile=requested?profiles.find(p=>p.id===requested):profiles[0];
      if(profile) heading.textContent=`Calendar preview · ${profile.name}`;
    }
    const note=el('p','The dates and times below are examples, not confirmed availability. Booking is not available in this preview.','appointment-preview-note');note.id=prefix+'-note';
    const navigation=el('div','','appointment-month-nav');
    const previous=el('button','←'),next=el('button','→'),monthLabel=el('strong');
    previous.type=next.type='button';previous.setAttribute('aria-label','Previous month');next.setAttribute('aria-label','Next month');monthLabel.setAttribute('aria-live','polite');
    navigation.append(previous,monthLabel,next);
    const weekdays=el('div','','appointment-weekdays');['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(day=>weekdays.append(el('span',day)));
    const days=el('div','','appointment-days');days.setAttribute('role','group');days.setAttribute('aria-label','Example calendar dates');days.setAttribute('aria-describedby',note.id);
    const panel=el('div','','appointment-example-times');panel.setAttribute('aria-live','polite');
    const legend=el('p','A dot marks a date used to illustrate available times. Actual practice schedules are not connected.','appointment-preview-legend');
    const contact=el('a',root.hasAttribute('data-practice-calendar')?'Check with the practice →':'Find a practice →','appointment-calendar-contact');
    const external=document.getElementById('profile-website-link');const maps=document.getElementById('profile-map-link');
    contact.href=root.hasAttribute('data-practice-calendar')?(external&&!external.hidden?external.href:maps?.href||'practitioners.html'):'practitioners.html';
    if(contact.href.startsWith('http')&&new URL(contact.href).origin!==location.origin){contact.target='_blank';contact.rel='noopener noreferrer';}
    root.append(badge,heading,note,navigation,weekdays,days,panel,legend,contact);
    const isExample=(date)=>date>=today&&[1,3,5].includes(date.getDay());
    const renderTimes=()=>{
      panel.replaceChildren();
      if(!selected){panel.append(el('p','Choose a date to explore the example layout.'));return;}
      panel.append(el('strong',`Example times · ${dayLabel(selected)}`));
      if(!isExample(selected)){panel.append(el('p','No sample times are shown for this date. This says nothing about real availability.'));return;}
      const slots=el('div','','appointment-slots');
      ['09:30','11:00','14:30'].forEach(time=>{const button=el('button',time);button.type='button';button.disabled=true;button.title='Example only — not bookable';slots.append(button);});
      panel.append(slots);
    };
    const render=()=>{
      monthLabel.textContent=new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric'}).format(new Date(year,month,1));
      previous.disabled=year===today.getFullYear()&&month===today.getMonth();
      next.disabled=(year-today.getFullYear())*12+month-today.getMonth()>=6;
      days.replaceChildren();
      const first=new Date(year,month,1,12),offset=(first.getDay()+6)%7,total=new Date(year,month+1,0).getDate();
      for(let i=0;i<offset;i++){const space=el('span');space.setAttribute('aria-hidden','true');days.append(space);}
      for(let day=1;day<=total;day++){
        const date=new Date(year,month,day,12),button=el('button',String(day));button.type='button';button.disabled=date<today;
        button.setAttribute('aria-label',`${dayLabel(date)}${isExample(date)?', example times shown':''}`);
        button.setAttribute('aria-pressed',String(!!selected&&date.getTime()===selected.getTime()));
        if(isExample(date))button.classList.add('has-example');
        button.addEventListener('click',()=>{selected=date;render();});days.append(button);
      }
      renderTimes();
    };
    const changeMonth=(delta)=>{const date=new Date(year,month+delta,1,12);year=date.getFullYear();month=date.getMonth();selected=null;render();};
    previous.addEventListener('click',()=>changeMonth(-1));next.addEventListener('click',()=>changeMonth(1));render();
  });
})();

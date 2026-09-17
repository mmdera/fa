
(() => {
  const d = window.FORGE_DATA;

  // Centralized rendering
  const stats = document.querySelector('#stats-grid');
  stats.innerHTML = d.stats.map(([i,n,l]) => `<div class="stat reveal"><span class="stat-index">${i}</span><div class="stat-num" data-count="${n}">${n}</div><small>${l}</small></div>`).join('');

  document.querySelector('#program-list').innerHTML = d.programs.map(p => `
    <article class="program reveal" data-cursor="OPEN">
      <span class="program-index">${p.n}</span><div><div class="program-name">${p.name}</div><div class="program-meta">${p.meta}</div></div>
      <p class="program-desc">${p.desc}</p><span class="program-arrow">↗</span>
    </article>`).join('');

  document.querySelector('#coach-grid').innerHTML = d.coaches.map(c => `
    <article class="coach reveal">
      <img src="${c.img}" alt="${c.name}, ${c.role}" loading="lazy">
      <div class="coach-info"><span class="coach-role">${c.role}</span><h3>${c.name}</h3><p>${c.bio}</p><span class="coach-exp">${c.exp} experience / demo profile</span></div>
    </article>`).join('');

  document.querySelector('#facility-stack').innerHTML = d.facilities.map(f => `
    <article class="facility reveal"><span class="facility-num">${f[0]}</span><div class="facility-copy"><h3>${f[1]}</h3><p>${f[2]}</p></div><div class="facility-media"><img src="${f[3]}" alt="${f[1]}" loading="lazy"></div></article>`).join('');

  document.querySelector('#plan-grid').innerHTML = d.plans.map(p => `
    <article class="plan ${p.popular?'popular':''} reveal">${p.popular?'<span class="plan-tag">MOST POPULAR</span>':''}
      <span class="plan-name">${p.name}</span><div class="plan-price">${p.price}</div><span class="plan-period">${p.period}</span><p class="plan-desc">${p.desc}</p>
      <ul>${p.features.map(x=>`<li>${x}</li>`).join('')}</ul><a href="#visit" class="btn ${p.popular?'btn-accent':'btn-light'}" data-track="membership_${p.name.toLowerCase()}">Enquire <span>↗</span></a>
    </article>`).join('');

  const scheduleList = document.querySelector('#schedule-list');
  function renderSchedule(day='MON'){
    scheduleList.innerHTML = d.schedule.map((s,idx)=>`
      <div class="schedule-item reveal visible"><span class="time">${s[0]}</span><div><b>${s[1]}</b><br><span>${day} · ${s[2]}</span></div><span class="coach-name">${s[2]}</span><span class="duration">${s[3]}</span><button class="book-mini" data-class="${s[1]}">BOOK / ${s[4]}</button></div>`).join('');
  }
  renderSchedule();
  document.querySelectorAll('.day').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.day').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-selected','false')});
    btn.classList.add('active');btn.setAttribute('aria-selected','true');renderSchedule(btn.dataset.day);
  }));
  scheduleList.addEventListener('click', e=>{
    if(e.target.matches('.book-mini')){
      document.querySelector('[name="message"]').value = `I'd like to book: ${e.target.dataset.class}.`;
      document.querySelector('#visit').scrollIntoView({behavior:'smooth'});
      track('schedule_book', {class:e.target.dataset.class});
    }
  });

  document.querySelector('#faq-list').innerHTML = d.faqs.map((f,i)=>`
    <div class="faq-item"><button class="faq-q" aria-expanded="false">${f[0]}<span>+</span></button><div class="faq-a"><p>${f[1]}</p></div></div>`).join('');
  document.querySelectorAll('.faq-q').forEach(q=>q.addEventListener('click',()=>{
    const item=q.parentElement, answer=q.nextElementSibling, open=item.classList.toggle('open');
    q.setAttribute('aria-expanded',open); answer.style.maxHeight=open?answer.scrollHeight+'px':'0px';
  }));

  // Scroll navigation
  const nav = document.querySelector('#nav');
  const onScroll=()=>nav.classList.toggle('scrolled',scrollY>35);
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // Mobile menu
  const toggle=document.querySelector('.menu-toggle'), menu=document.querySelector('#mobile-menu');
  const setMenu=(open)=>{
    menu.classList.toggle('open',open);document.body.classList.toggle('menu-open',open);
    toggle.setAttribute('aria-expanded',open);menu.setAttribute('aria-hidden',!open);
  };
  toggle.addEventListener('click',()=>setMenu(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));

  // Scroll reveal + subtle stagger for a more editorial, premium feel.
  const revealItems=[...document.querySelectorAll('.reveal')];
  revealItems.forEach((el,i)=>{
    const parent=el.parentElement;
    if(parent && (parent.classList.contains('stats-grid') || parent.classList.contains('program-list') || parent.classList.contains('coach-grid') || parent.classList.contains('facility-stack') || parent.classList.contains('plan-grid'))){
      const siblings=[...parent.querySelectorAll(':scope > .reveal')];
      const index=siblings.indexOf(el);
      el.dataset.delay=Math.min(index,3);
    }
  });
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'0px 0px -50px'});
  revealItems.forEach(el=>revealObserver.observe(el));

  // Scroll progress + restrained hero parallax.
  const motionOK=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ticking=false;
  const updateScrollEffects=()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    document.documentElement.style.setProperty('--scroll-progress',(scrollY/max).toFixed(4));
    if(motionOK){
      const hero=document.querySelector('.hero-media');
      if(hero && scrollY < innerHeight*1.15){
        hero.style.transform=`translate3d(0,${Math.min(scrollY*.055,38)}px,0) scale(${1.04+Math.min(scrollY/innerHeight*.015,.015)})`;
      }
    }
    ticking=false;
  };
  addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScrollEffects);ticking=true}},{passive:true});
  updateScrollEffects();

  // Lightweight stat count-up when the stats enter the viewport.
  const statNumbers=[...document.querySelectorAll('.stat-num[data-count]')];
  const countObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      const el=entry.target, raw=el.dataset.count, match=raw.match(/([\d,]+)(.*)/);
      if(!match){countObserver.unobserve(el);return;}
      const target=Number(match[1].replace(/,/g,'')), suffix=match[2]||'';
      const start=performance.now(), duration=900;
      const tick=(now)=>{
        const progress=Math.min(1,(now-start)/duration), eased=1-Math.pow(1-progress,3);
        el.textContent=Math.round(target*eased).toLocaleString('en-IN')+suffix;
        if(progress<1)requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  },{threshold:.65});
  statNumbers.forEach(el=>countObserver.observe(el));

  // Conversion events: easy to swap for GA4, Plausible, PostHog etc.
  function track(name, props={}){
    window.dispatchEvent(new CustomEvent('forge:track',{detail:{name,props,timestamp:Date.now()}}));
    window.dataLayer=window.dataLayer||[];window.dataLayer.push({event:name,...props});
  }
  document.querySelectorAll('[data-track]').forEach(el=>el.addEventListener('click',()=>track(el.dataset.track)));

  // Lead form → direct WhatsApp enquiry
  const form=document.querySelector('#lead-form'), status=document.querySelector('.form-status');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    status.className='form-status'; status.textContent='';
    const fd=new FormData(form);
    const fields={
      name:String(fd.get('name')||'').trim(),
      phone:String(fd.get('phone')||'').trim(),
      email:String(fd.get('email')||'').trim(),
      goal:String(fd.get('goal')||'').trim(),
      time:String(fd.get('time')||'').trim(),
      message:String(fd.get('message')||'').trim()
    };
    if(!fields.name||!fields.phone||!fields.email||!fields.goal){
      status.classList.add('error'); status.textContent='Please complete the required fields.'; return;
    }
    if(!/^\S+@\S+\.\S+$/.test(fields.email)){
      status.classList.add('error'); status.textContent='Please enter a valid email address.'; return;
    }

    const whatsappText =
`Hello FORGE ATHLETICS 👋

I’d like to book a free gym visit.

Name: ${fields.name}
Phone: ${fields.phone}
Email: ${fields.email}
Goal: ${fields.goal}
Preferred time: ${fields.time || 'Not specified'}
Message: ${fields.message || 'No additional message'}

Sent from the Forge Athletics website.`;

    localStorage.setItem('forge_last_lead',JSON.stringify(fields));
    track('lead_submitted',{goal:fields.goal});
    status.classList.add('success');
    status.textContent='Opening WhatsApp…';

    // Direct redirect to the gym's configured WhatsApp number.
    const url=`https://wa.me/${d.brand.whatsapp}?text=${encodeURIComponent(whatsappText)}`;
    setTimeout(()=>{ window.location.href=url; },180);
  });

  // Desktop premium cursor
  if(matchMedia('(min-width:1100px)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const cursor=document.querySelector('#cursor-label');let mx=0,my=0,cx=0,cy=0;
    addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
    const loop=()=>{cx+=(mx-cx)*.14;cy+=(my-cy)*.14;cursor.style.left=cx+'px';cursor.style.top=cy+'px';requestAnimationFrame(loop)};loop();
    document.querySelectorAll('[data-cursor]').forEach(el=>{
      el.addEventListener('mouseenter',()=>{cursor.style.opacity='1';cursor.textContent=el.dataset.cursor});
      el.addEventListener('mouseleave',()=>cursor.style.opacity='0');
    });
    cursor.style.opacity='0';
  }

  // Keyboard focus helper
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape' && menu.classList.contains('open'))setMenu(false);
  });
})();

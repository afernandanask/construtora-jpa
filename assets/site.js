(function(){
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const root=document.documentElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animate=!reduce&&window.gsap&&window.ScrollTrigger;
  const hideCurtain=()=>root.classList.add('ready');

  /* menu do celular: entrada e saída suaves */
  const ov=$('#menu'),ob=$('#menu-open');
  if(ov&&ob){
    let closing=false;
    const openMenu=()=>{
      ov.hidden=false;ov.classList.remove('out');ob.setAttribute('aria-expanded','true');
      document.body.style.overflow='hidden';window.__lenis&&window.__lenis.stop();
      requestAnimationFrame(()=>requestAnimationFrame(()=>ov.classList.add('in')));
      setTimeout(()=>$('#menu-close').focus({preventScroll:true}),reduce?0:250);
    };
    const closeMenu=(then)=>{
      if(closing||ov.hidden)return;closing=true;ov.classList.remove('in');ov.classList.add('out');ob.setAttribute('aria-expanded','false');
      const done=()=>{ov.hidden=true;ov.classList.remove('out');closing=false;document.body.style.overflow='';window.__lenis&&window.__lenis.start();if(typeof then==='function')then();else ob.focus({preventScroll:true})};
      reduce?done():setTimeout(done,420);
    };
    ob.addEventListener('click',openMenu);
    $('#menu-close').addEventListener('click',()=>closeMenu());
    $$('a',ov).forEach(a=>a.addEventListener('click',e=>{
      const h=a.getAttribute('href')||'';
      if(a.target==='_blank')return;
      if(h.startsWith('#')){closeMenu(()=>{})}else{ov.hidden||(document.body.style.overflow='')}
    }));
    addEventListener('keydown',e=>{if(e.key==='Escape'&&!ov.hidden)closeMenu()});
  }

  /* menu do celular: acordeão de projetos */
  $$('.ov-acc-btn').forEach(b=>{
    const panel=document.getElementById(b.getAttribute('aria-controls'));
    b.addEventListener('click',()=>{
      const opening=b.getAttribute('aria-expanded')!=='true';
      b.setAttribute('aria-expanded',opening);b.parentElement.classList.toggle('open',opening);
      if(opening){panel.hidden=false;if(!reduce&&panel.animate){panel.animate([{height:'0px',opacity:0},{height:panel.scrollHeight+'px',opacity:1}],{duration:520,easing:'cubic-bezier(.22,1,.36,1)'});$$('.ovm-all,.ovm-item',panel).forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:420,delay:80+i*45,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}))}}
      else if(!reduce&&panel.animate){panel.animate([{height:panel.scrollHeight+'px',opacity:1},{height:'0px',opacity:0}],{duration:360,easing:'cubic-bezier(.65,0,.35,1)'}).onfinish=()=>{panel.hidden=true}}
      else panel.hidden=true;
    });
  });

  /* mega menus (Empreendimentos e Serviços): abrem só com clique */
  const scrim=$('.mega-scrim'),desk=()=>matchMedia('(min-width: 821px)').matches;
  const megas=$$('.mega-trigger').map(trg=>({trg,li:trg.parentElement,panel:document.getElementById(trg.getAttribute('aria-controls'))})).filter(m=>m.panel);
  const closeMega=(m,instant)=>{m.panel.classList.remove('on');m.trg.setAttribute('aria-expanded','false');m.li.classList.remove('open');setTimeout(()=>{if(!m.panel.classList.contains('on'))m.panel.hidden=true},instant?0:380)};
  const closeAll=()=>{megas.forEach(m=>closeMega(m));scrim&&scrim.classList.remove('on')};
  const openMega=m=>{megas.forEach(o=>{if(o!==m)closeMega(o,true)});m.panel.hidden=false;requestAnimationFrame(()=>{m.panel.classList.add('on');scrim&&scrim.classList.add('on')});m.trg.setAttribute('aria-expanded','true');m.li.classList.add('open')};
  megas.forEach(m=>{
    m.trg.addEventListener('click',e=>{if(!desk())return;e.preventDefault();m.panel.classList.contains('on')?closeAll():openMega(m)});
    m.trg.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();openMega(m);$('a',m.panel).focus()}});
    m.panel.addEventListener('focusout',e=>{if(!m.panel.contains(e.relatedTarget)&&e.relatedTarget!==m.trg){closeMega(m);if(!megas.some(o=>o.panel.classList.contains('on')))scrim&&scrim.classList.remove('on')}});
  });
  if(megas.length){
    document.addEventListener('click',e=>{if(megas.some(m=>m.panel.classList.contains('on'))&&!megas.some(m=>m.panel.contains(e.target)||m.li.contains(e.target)))closeAll()});
    addEventListener('keydown',e=>{const o=megas.find(m=>m.panel.classList.contains('on'));if(e.key==='Escape'&&o){closeAll();o.trg.focus()}});
    addEventListener('scroll',()=>{if(megas.some(m=>m.panel.classList.contains('on')))closeAll()},{passive:true});
  }

  /* copiar telefone e e-mail */
  $$('.copy').forEach(b=>b.addEventListener('click',()=>{
    const el=document.getElementById(b.dataset.copy),t=el.textContent.trim();
    const done=()=>{b.textContent='Copiado';setTimeout(()=>b.textContent='Copiar',1600)};
    const sel=()=>{const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selecionado'};
    try{navigator.clipboard.writeText(t).then(done,sel)}catch(e){sel()}
  }));

  /* formulário: monta a mensagem para o WhatsApp */
  const f=$('#form');
  if(f)f.addEventListener('submit',e=>{
    e.preventDefault();
    const nome=f.nome.value.trim(),msg=f.mensagem.value.trim(),note=$('#form-note');
    if(!nome||!msg){note.textContent=!nome?'Preencha seu primeiro nome para enviar.':'Escreva sua mensagem para enviar.';(nome?f.mensagem:f.nome).focus();return}
    const assunto=f.assunto?f.assunto.value:'';const l=['Olá, Construtora JPA!',assunto?'Assunto: '+assunto:'',msg,'',('Nome: '+nome+' '+f.sobrenome.value.trim()).trim()];
    if(f.email.value.trim())l.push('E-mail: '+f.email.value.trim());
    if(f.whatsapp.value.trim())l.push('WhatsApp: '+f.whatsapp.value.trim());
    $('#wa-link').href='https://wa.me/5583996903313?text='+encodeURIComponent(l.filter((x,i)=>x||i>2).join('\n'));
    note.textContent='Sua mensagem segue pelo WhatsApp da Construtora JPA.';
    $('#form-ok').hidden=false;$('#wa-link').focus();
  });

  /* carrossel de serviços: setas, arraste e barra de progresso */
  $$('[data-car]').forEach(car=>{
    const tr=$('.car-track',car),cards=[...tr.children],n=cards.length,bar=$('.car-bar i',car),cnt=$('.car-count b',car);
    const prev=$('[data-prev]',car),next=$('[data-next]',car);
    const step=()=>cards.length>1?cards[1].offsetLeft-cards[0].offsetLeft:tr.clientWidth;
    const update=()=>{
      const max=tr.scrollWidth-tr.clientWidth,x=tr.scrollLeft,t=max>0?x/max:1;
      const atEnd=x>=max-4;
      const idx=atEnd?n-1:Math.min(n-1,Math.round(x/step()));
      bar.style.transform='scaleX('+(1/n+(1-1/n)*t)+')';
      cnt.textContent=String(idx+1).padStart(2,'0');
      prev.disabled=x<=4;next.disabled=atEnd;
    };
        // rolagem própria com easing (mais suave que o scroll nativo)
    let anim=null,target=null;
    const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
    const glide=to=>{
      const max=tr.scrollWidth-tr.clientWidth;to=Math.max(0,Math.min(max,to));
      if(reduce){tr.scrollLeft=to;return}
      cancelAnimationFrame(anim);const from=tr.scrollLeft,d=to-from;if(Math.abs(d)<1)return;
      target=to;const dur=Math.min(900,420+Math.abs(d)*.45),t0=performance.now();
      tr.classList.add('gliding');
      const tick=now=>{const p=Math.min(1,(now-t0)/dur);tr.scrollLeft=from+d*ease(p);if(p<1)anim=requestAnimationFrame(tick);else{tr.classList.remove('gliding');target=null}};
      anim=requestAnimationFrame(tick);
    };
    const go=dir=>{const s=step(),base=target??tr.scrollLeft;glide(Math.round(base/s+dir)*s)};
    prev.addEventListener('click',()=>go(-1));
    next.addEventListener('click',()=>go(1));
    tr.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();next.click()}if(e.key==='ArrowLeft'){e.preventDefault();prev.click()}});
    tr.addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update();
    // arrastar com o mouse no desktop
    let down=false,sx=0,sl=0,moved=0;
    tr.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;down=true;moved=0;sx=e.clientX;sl=tr.scrollLeft});
    addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-sx;moved=Math.max(moved,Math.abs(dx));if(moved>4)tr.classList.add('drag');tr.scrollLeft=sl-dx});
    addEventListener('pointerup',()=>{if(!down)return;down=false;if(tr.classList.contains('drag')){const s=step();tr.classList.remove('drag');glide(Math.round(tr.scrollLeft/s)*s)}});
    tr.addEventListener('click',e=>{if(moved>4){e.preventDefault();e.stopPropagation();moved=0}},true);
  });

  /* filtro de empreendimentos por situação */
  $$('.pj-filter').forEach(f=>{
    const grid=f.parentElement.querySelector('.pj-grid'),cards=$$('.pj-card',grid);
    f.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      $$('button',f).forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});
      const k=b.dataset.filter;
      cards.forEach(c=>{const show=k==='todos'||c.dataset.status===k;c.hidden=!show;if(show&&c.animate&&!reduce)c.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:450,easing:'cubic-bezier(.2,.7,.2,1)'})});
      window.ScrollTrigger&&ScrollTrigger.refresh();
    });
  });

  /* contato: assunto vindo do link (#visita, #orcamento, #compra) */
  if(f&&f.assunto){const h=location.hash.slice(1),map={visita:'Agendar uma visita',orcamento:'Orçamento de obra',compra:'Comprar um imóvel'};if(map[h])f.assunto.value=map[h]}

  /* FAQ com abertura suave */
  $$('.faq-list details').forEach(d=>{
    const s=$('summary',d),a=$('.ans',d);
    s.addEventListener('click',e=>{
      if(reduce||!a.animate)return;
      e.preventDefault();
      if(d.open){const h=a.offsetHeight;a.animate([{height:h+'px'},{height:'0px'}],{duration:350,easing:'ease'}).onfinish=()=>{d.open=false}}
      else{d.open=true;const h=a.offsetHeight;a.animate([{height:'0px'},{height:h+'px'}],{duration:400,easing:'ease'})}
    });
  });

  if(!animate){hideCurtain();return}

  /* ===================== narrativa de scroll ===================== */
  root.classList.add('motion');
  gsap.registerPlugin(ScrollTrigger);
  const hasSplit=!!window.SplitText;if(hasSplit)gsap.registerPlugin(SplitText);
  let lenis=null;
  if(window.Lenis){
    lenis=new Lenis({lerp:.085});window.__lenis=lenis;
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href'),t=id.length>1&&$(id);if(!t)return;
    e.preventDefault();lenis?lenis.scrollTo(t,{duration:1.6}):t.scrollIntoView({behavior:'smooth'});
  }));

  /* cortina: entrada e saída de página */
  const curtain=$('.curtain');
  const intro=gsap.timeline({delay:.1,onComplete:hideCurtain});
  if(curtain){
    intro.to('.curtain .logo',{opacity:0,y:-10,duration:.35,ease:'power1.in'})
         .to(curtain,{yPercent:-100,duration:.9,ease:'power3.inOut'},'-=.05');
  }
  setTimeout(hideCurtain,2500);
  $$('a[href$=".html"]').forEach(a=>a.addEventListener('click',e=>{
    if(e.metaKey||e.ctrlKey||e.shiftKey||a.target==='_blank'||!curtain||e.defaultPrevented||(a.classList.contains('mega-trigger')&&matchMedia('(min-width: 821px)').matches))return;
    e.preventDefault();const href=a.getAttribute('href');
    root.classList.remove('ready');
    gsap.fromTo(curtain,{yPercent:100},{yPercent:0,duration:.6,ease:'power3.inOut',onComplete:()=>{location.href=href}});
    gsap.fromTo('.curtain .logo',{opacity:0},{opacity:1,duration:.3,delay:.35});
  }));
  addEventListener('pageshow',e=>{if(e.persisted){gsap.set(curtain,{yPercent:-100});hideCurtain()}});

  /* título de abertura sobe linha a linha */
  const h1=$('h1');
  if(h1&&hasSplit){
    const s=new SplitText(h1,{type:'lines',mask:'lines',linesClass:'split-line'});
    intro.from(s.lines,{yPercent:105,duration:1.1,ease:'power3.out',stagger:.09},.75);
    h1.__lines=s.lines;
  }
  intro.from('.intro-fade',{opacity:0,y:16,duration:.8,stagger:.1,ease:'power2.out'},1.2);

  /* títulos de seção */
  if(hasSplit)$$('.split').forEach(el=>{
    const s=new SplitText(el,{type:'lines',mask:'lines',linesClass:'split-line'});
    gsap.from(s.lines,{yPercent:100,ease:'none',stagger:.08,scrollTrigger:{trigger:el,start:'top 88%',end:'top 55%',scrub:.5}});
  });

  /* cards do carrossel entram em sequência */
  $$('[data-car]').forEach(c=>gsap.from($$('.svc',c),{opacity:0,stagger:.12,ease:'none',scrollTrigger:{trigger:c,start:'top 92%',end:'top 60%',scrub:.6}}));

  /* andamento da obra: barras preenchem ao entrar na tela */
  $$('.obra').forEach(o=>gsap.from($$('.ob-bar i',o),{scaleX:0,transformOrigin:'left',duration:1.2,ease:'power3.out',stagger:.12,scrollTrigger:{trigger:o,start:'top 85%'}}));
  /* cards de empreendimento entram em sequência */
  $$('.pj-grid').forEach(g=>(matchMedia('(max-width:820px)').matches?$$('.pj-card',g).forEach(card=>gsap.from(card,{y:40,opacity:0,ease:'none',scrollTrigger:{trigger:card,start:'top 98%',end:'top 75%',scrub:.4}})):gsap.from($$('.pj-card',g),{y:60,opacity:0,stagger:.1,ease:'none',scrollTrigger:{trigger:g,start:'top 92%',end:'top 55%',scrub:.6}})));

  /* fotos com parallax dentro do recorte */
  $$('[data-par]').forEach(ph=>{
    gsap.fromTo($('img',ph),{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{trigger:ph,start:'top bottom',end:'bottom top',scrub:.8}});
  });

  /* faixa de diferenciais simples */
  $$('.dif.plain').forEach(d=>{
    gsap.from($$('.dif-lead,.dif-item',d),{opacity:0,y:40,ease:'none',stagger:.08,scrollTrigger:{trigger:d,start:'top 80%',end:'top 30%',scrub:.6}});
  });

  /* HOME: a fotografia da fachada se abre para os diferenciais.
     O recorte é recalculado a cada quadro a partir da posição real da moldura,
     então acompanha carregamento de fonte, redimensionamento e rolagem em qualquer direção. */
  const hx=$('.hx');
  if(hx){
    const frame=$('.hx-frame'),dif=$('.hx-dif .dif'),bg=$('.dif-bg',dif);
    const st={reveal:0,open:0};
    const apply=()=>{
      const r=frame.getBoundingClientRect(),w=document.documentElement.clientWidth,h=innerHeight,k=1-st.open;
      const top=r.bottom-(r.bottom-r.top)*st.reveal;
      dif.style.clipPath=`inset(${Math.max(0,top*k)}px ${Math.max(0,(w-r.right)*k)}px ${Math.max(0,(h-r.bottom)*k)}px ${Math.max(0,r.left*k)}px round ${28*k}px)`;
    };
    gsap.set($$('.dif-lead,.dif-item,.dif-head .acts',dif),{opacity:0,y:40});
    gsap.set($('.dif-grid',dif),{borderTopColor:'rgba(69,72,76,0)'});
    apply();
    intro.to(st,{reveal:1,duration:1.2,ease:'power3.inOut',onUpdate:apply},.55);
    intro.from($('img',bg),{scale:1.35,duration:1.6,ease:'power3.out'},.55);
    intro.from('.hx-over > *',{opacity:0,y:20,duration:.8,stagger:.1,ease:'power2.out'},1.3);
    const tl=gsap.timeline({scrollTrigger:{trigger:hx,start:'top top',end:'bottom bottom',scrub:.6,invalidateOnRefresh:true,onRefresh:apply}});
    tl.to(h1,{yPercent:-25,opacity:0,ease:'none',duration:.2},0)
      .to('.hx-side,.hx-over',{opacity:0,y:-20,ease:'none',duration:.15},0)
      .to(st,{open:1,ease:'power2.inOut',duration:.36,onUpdate:apply},.12)
      .fromTo(bg,{'--shade':0},{'--shade':.8,ease:'none',duration:.2,immediateRender:false},.34)
      .to($('.dif-lead',dif),{opacity:1,y:0,ease:'none',duration:.14},.5)
      .to($('.dif-head .acts',dif),{opacity:1,y:0,ease:'none',duration:.1},.54)
      .to($('.dif-grid',dif),{borderTopColor:'rgba(69,72,76,1)',ease:'none',duration:.06},.54)
      .to($$('.dif-item',dif),{opacity:1,y:0,ease:'none',stagger:.05,duration:.16},.56)
      .to({},{duration:.1});
    addEventListener('resize',apply);
    if(window.ResizeObserver)new ResizeObserver(apply).observe(frame);
    document.fonts&&document.fonts.ready.then(apply);
  }

  /* serviços: trilho horizontal no desktop; imóveis: lista que troca a foto */
  const mm=gsap.matchMedia();
  mm.add('(min-width: 900px)',()=>{
    root.classList.add('motion-desk');
    const track=$('.svc-track'),rail=$('.svc-rail');
    let cleanTrack=()=>{};
    if(track&&rail){
      const dist=()=>Math.max(0,rail.scrollWidth-innerWidth);
      const setH=()=>{track.style.height=(dist()+innerHeight*1.15)+'px'};setH();
      const ht=gsap.to(rail,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:track,start:'top top',end:'bottom bottom',scrub:.6,invalidateOnRefresh:true,onRefreshInit:setH}});
      $$('.svc',rail).forEach((s,i)=>{
        gsap.fromTo($('img',s),{xPercent:-8,scale:1.2},{xPercent:8,scale:1.2,ease:'none',scrollTrigger:{trigger:s,containerAnimation:ht,start:'left right',end:'right left',scrub:.6}});
        gsap.fromTo(s,{y:i%2?-36:36},{y:i%2?36:-36,ease:'none',scrollTrigger:{trigger:s,containerAnimation:ht,start:'left right',end:'right left',scrub:.8}});
      });
      cleanTrack=()=>{track.style.height='';gsap.set(rail,{clearProps:'x'})};
    }
    const sticky=$('.imv-sticky');
    if(sticky){
      const items=$$('.imv-item'),lays=$$('.imv-stage .lay'),bar=$('.imv-stage .count i');
      let cur=-1;const set=i=>{if(i===cur)return;cur=i;items.forEach((el,k)=>el.classList.toggle('on',k===i));lays.forEach((el,k)=>el.classList.toggle('on',k===i))};
      set(0);
      ScrollTrigger.create({trigger:sticky,start:'top top',end:'bottom bottom',onUpdate:self=>{set(Math.min(items.length-1,Math.floor(self.progress*items.length)));bar&&bar.style.setProperty('--p',self.progress.toFixed(3))}});
    }
    return()=>{root.classList.remove('motion-desk');cleanTrack()};
  });

  /* página interna: foto larga que cresce até a borda */
  $$('.wide-ph').forEach(ph=>{
    gsap.fromTo(ph,{clipPath:'inset(0% 8% 0% 8%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:ph,start:'top 90%',end:'top 20%',scrub:.6}});
  });

  /* projetos: o título sai e a foto recua */
  const pjh=$('.ph-hero');
  if(pjh){
    gsap.to($('.ph img',pjh),{scale:1.12,yPercent:6,ease:'none',scrollTrigger:{trigger:pjh,start:'top top',end:'bottom top',scrub:.6}});
    gsap.to($('.in',pjh),{yPercent:-30,opacity:0,ease:'none',scrollTrigger:{trigger:pjh,start:'top top',end:'bottom 30%',scrub:.6}});
  }

  /* sobre: 2014 em parallax, texto acende palavra a palavra */
  $$('.year').forEach(y=>gsap.fromTo(y,{yPercent:-10},{yPercent:30,ease:'none',scrollTrigger:{trigger:y.parentElement,start:'top bottom',end:'bottom top',scrub:.8}}));
  if(hasSplit)$$('.reveal').forEach(r=>{
    const s=new SplitText(r,{type:'words'});
    gsap.fromTo(s.words,{opacity:.2},{opacity:1,ease:'none',stagger:.1,scrollTrigger:{trigger:r,start:'top 80%',end:'bottom 50%',scrub:.5}});
  });

  /* selo circular gira com o scroll */
  $$('.badge .ring').forEach(r=>gsap.to(r,{rotation:360,transformOrigin:'50% 50%',ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:.8}}));

  /* CTA: painel cresce de uma faixa estreita */
  $$('.cta').forEach(c=>{
    gsap.set($$('.cta-in > *',c),{opacity:0,y:30});
    // começa a crescer assim que o bloco entra na tela e termina quando ele chega ao topo
    gsap.timeline({scrollTrigger:{trigger:c,start:'top bottom',end:'bottom bottom',scrub:.6,invalidateOnRefresh:true}})
      .to($('.cta-panel',c),{width:()=>(document.documentElement.clientWidth-2*parseFloat(getComputedStyle($('.wrap')).paddingLeft))+'px',ease:'power1.out',duration:.5},0)
      .to($('.cta-panel .ph img',c),{scale:1,ease:'none',duration:.5},0)
      .to($$('.cta-in > *',c),{opacity:1,y:0,stagger:.08,ease:'none',duration:.25},.5)
      .to({},{duration:.1});
  });

  addEventListener('load',()=>ScrollTrigger.refresh());
  document.fonts&&document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();

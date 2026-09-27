
/* ===== META PIXEL + CAPI =====
   Pixel ID e Token ficam nas Secrets do projeto (META_PIXEL_ID / META_CAPI_TOKEN).
   O navegador só recebe o Pixel ID via /api/public/meta-capi. O token nunca sai do servidor. */
(function(){
  var API='/api/public/meta-capi', queue=[], ready=false;
  function uid(){return 'ev_'+Date.now()+'_'+Math.random().toString(36).slice(2,10);}
  function ck(n){var m=document.cookie.match(new RegExp('(?:^|; )'+n+'=([^;]*)'));return m?decodeURIComponent(m[1]):undefined;}
  function lead(){try{var k=Object.keys(localStorage).filter(function(x){return x.indexOf('lead_')===0;}).sort().pop();return k?JSON.parse(localStorage.getItem(k)):{};}catch(e){return {};}}
  // Função única: dispara no Browser (Pixel) e no servidor (CAPI) com o mesmo event_id
  window.trackMeta=function(name,data){
    var id=uid(); data=data||{};
    var fire=function(){ if(window.fbq) window.fbq('track',name,data,{eventID:id}); };
    ready?fire():queue.push(fire);
    var l=lead();
    try{fetch(API,{method:'POST',headers:{'content-type':'application/json'},keepalive:true,body:JSON.stringify({event_name:name,event_id:id,event_source_url:location.href,custom_data:data,user:{email:l.email,phone:l.whatsapp,name:l.nome,fbp:ck('_fbp'),fbc:ck('_fbc')}})}).catch(function(){});}catch(e){}
    return id;
  };
  fetch(API).then(function(r){return r.json();}).then(function(c){
    if(!c.pixelId) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];(s?s.parentNode.insertBefore(t,s):b.head.appendChild(t))}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init',c.pixelId); ready=true; queue.forEach(function(f){f();}); queue=[];
  }).catch(function(){});
  trackMeta('PageView');
  // Eventos observados sem alterar a lógica existente
  var ic=false;
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('button'); if(!b) return;
    var t=(b.textContent||'').trim().toLowerCase();
    if(!ic && t.indexOf('continuar')>-1){ic=true;trackMeta('InitiateCheckout',{value:29.90,currency:'BRL'});}
    if(t.indexOf('comprar agora')>-1) trackMeta('Purchase',{value:29.90,currency:'BRL'});
  },true);
})();

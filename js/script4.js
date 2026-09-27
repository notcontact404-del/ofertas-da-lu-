
/* ===== PIX PINGUPAG (clique em "Comprar agora") ===== */
(function(){
  var API='/api/public/pix', poll=null, busy=false;
  function lead(){try{var k=Object.keys(localStorage).filter(function(x){return x.indexOf('lead_')===0;}).sort().pop();return k?JSON.parse(localStorage.getItem(k)):{};}catch(e){return {};}}
  function frete(){var b=document.querySelectorAll('#frete-block [aria-pressed]');return (b[1]&&b[1].getAttribute('aria-pressed')==='true')?'expresso':'gratis';}
  function modal(html){
    var m=document.getElementById('pix-modal');
    if(!m){m=document.createElement('div');m.id='pix-modal';m.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:inherit';document.body.appendChild(m);
      m.addEventListener('click',function(e){if(e.target===m||e.target.id==='pix-close'){m.remove();if(poll)clearInterval(poll);}});}
    m.innerHTML='<div style="background:#fff;border-radius:16px;max-width:380px;width:100%;padding:24px;text-align:center;position:relative;color:#111"><button id="pix-close" style="position:absolute;top:10px;right:14px;border:0;background:none;font-size:22px;color:#6b7280;cursor:pointer">&times;</button>'+html+'</div>';
    return m;
  }
  function show(d){
    var img=d.image?(d.image.indexOf('data:')===0||d.image.indexOf('http')===0?d.image:'data:image/png;base64,'+d.image):'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data='+encodeURIComponent(d.code);
    var m=modal('<div style="font-weight:700;font-size:18px;margin-bottom:4px">Pague com Pix</div><div style="color:#6b7280;font-size:13px;margin-bottom:14px">Total: R$ '+(d.amount/100).toFixed(2).replace('.',',')+'</div><img src="'+img+'" alt="QR Code Pix" style="width:220px;height:220px;margin:0 auto 14px;display:block"><textarea readonly style="width:100%;height:64px;font-size:11px;border:1px solid #e5e7eb;border-radius:8px;padding:8px;resize:none">'+d.code.replace(/</g,'&lt;')+'</textarea><button id="pix-copy" style="margin-top:10px;width:100%;background:#10b981;color:#fff;border:0;border-radius:10px;padding:12px;font-weight:700;cursor:pointer">Copiar código Pix</button><div style="color:#6b7280;font-size:12px;margin-top:12px">Aguardando pagamento...</div>');
    m.querySelector('#pix-copy').onclick=function(){var t=m.querySelector('textarea');t.select();(navigator.clipboard?navigator.clipboard.writeText(d.code):Promise.resolve(document.execCommand('copy'))).then(function(){m.querySelector('#pix-copy').textContent='Copiado!';});};
    if(poll)clearInterval(poll);
    poll=setInterval(function(){
      fetch(API+'?hash='+encodeURIComponent(d.hash)).then(function(r){return r.json();}).then(function(s){
        if(s.status==='paid'){clearInterval(poll);
          if(s.redirect_url){var u=new URL(s.redirect_url);new URLSearchParams(location.search).forEach(function(v,k){u.searchParams.set(k,v);});window.location.href=u.toString();}
          else modal('<div style="font-weight:700;font-size:18px;color:#10b981">Pagamento confirmado!</div>');}
      }).catch(function(){});
    },3000);
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('button');
    if(!b||(b.textContent||'').trim().toLowerCase().indexOf('comprar agora')<0) return;
    e.preventDefault();
    if(busy) return; busy=true;
    var l=lead();
    modal('<div style="padding:20px 0;color:#6b7280">Gerando Pix...</div>');
    fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({frete:frete(),qty:window.__ckQty||1,customer:{name:l.nome||'',email:l.email||'',phone:l.whatsapp||''}})})
      .then(function(r){return r.json();}).then(function(d){ if(d.error) modal('<div style="color:#dc2626;padding:16px 0">'+d.error+'</div>'); else show(d); })
      .catch(function(){modal('<div style="color:#dc2626;padding:16px 0">Erro ao gerar o Pix. Tente novamente.</div>');})
      .then(function(){busy=false;});
  },true);
})();

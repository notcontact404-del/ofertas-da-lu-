
(function(){
  function qtyWrap(){
    var dec=document.querySelector('button[aria-label="Diminuir quantidade"]');
    if(!dec||!dec.parentElement||dec.parentElement.getAttribute('class')&&dec.parentElement.getAttribute('class').indexOf('select-none')<0) return null;
    return dec.parentElement;
  }
  function init(){
    var w=qtyWrap(); if(!w) return;
    var dec=w.querySelector('button[aria-label="Diminuir quantidade"]');
    var inc=w.querySelector('button[aria-label="Aumentar quantidade"]');
    var span=w.querySelector('span');
    var MIN=1,MAX=5;
    function set(v){
      v=Math.max(MIN,Math.min(MAX,v));
      span.textContent=String(v);
      dec.disabled=(v<=MIN);
      inc.disabled=(v>=MAX);
      window.__ckQty=v; upd();
    }
    var UNIT=2990,tracked=[];
    function fmt(c){return (c/100).toFixed(2).replace('.',',');}
    function scan(){
      var tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),n;
      while(n=tw.nextNode()){
        if(n.__ck) continue;
        var t=n.nodeValue;
        if(t.indexOf('29,90')>=0||/\b1 item\b/.test(t)){ if(n.parentElement&&n.parentElement.closest('#pix-modal,[data-pix-modal]')) continue; n.__ck=t; tracked.push(n); }
      }
    }
    function upd(){
      scan(); var q=window.__ckQty||1;
      tracked.forEach(function(n){ n.nodeValue=n.__ck.replace('29,90',fmt(UNIT*q)).replace(/\b1 item\b/,q+(q>1?' itens':' item')); });
    }
    new MutationObserver(function(){ if(tracked.some(function(n){return !document.contains(n);})) tracked=tracked.filter(function(n){return document.contains(n);}); var b=tracked.length; scan(); if(tracked.length!==b) upd(); }).observe(document.body,{childList:true,subtree:true});
    dec.addEventListener('click',function(){ set((parseInt(span.textContent,10)||MIN)-1); });
    inc.addEventListener('click',function(){ set((parseInt(span.textContent,10)||MIN)+1); });
    set(parseInt(span.textContent,10)||MIN);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();

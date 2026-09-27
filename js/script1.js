
(function(){
  function ready(fn){ if(document.readyState!='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    /* CSS extra apenas para o card ENTREGA (classes ausentes) + animacao discreta */
    var st=document.createElement('style');
    st.textContent='#entrega-card .space-y-4>:not([hidden])~:not([hidden]){margin-top:calc(var(--spacing,4px)*4)}#entrega-card .grid{display:grid}#entrega-card .grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}#entrega-card .mt-5{margin-top:calc(var(--spacing,4px)*5)}#entrega-card .bg-green-50{background-color:#f0fdf4}.delivery-enter{animation:deliveryEnter .25s ease-out}@keyframes deliveryEnter{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(st);

    function findBtn(){
      return Array.from(document.querySelectorAll('button')).find(function(b){ return (b.textContent||'').trim().toLowerCase()==='continuar'; });
    }
    var tries=0;
    var iv=setInterval(function(){
      var btn=findBtn(); tries++;
      if(btn){
        clearInterval(iv);
        var step='email';
        var identificationCompleted=false;
        var emailBlock=null, nameBlock=null, waBlock=null, link=null, emailInput=null;
        var entregaCard=null;

        var leadSummary=null, editBtn=null;

        var currentStep=1;
        function setStep(n){
          if(n<currentStep) return;
          currentStep=n;
          var root=document.querySelector('main .max-w-xs');
          if(!root) return;
          var items=root.children;
          for(var i=0;i<items.length;i++){
            var st=i+1, on=st<=n;
            var c=items[i].querySelector('.w-9.h-9'), lb=items[i].querySelector('span'), bar=items[i].querySelector('.absolute.inset-y-0');
            if(c){ c.classList.toggle('bg-gray-300',!on); c.classList.toggle('text-gray-500',!on); c.classList.toggle('text-white',on); c.style.background=on?'var(--ck-primary,#3b82f6)':''; c.style.color=on?'#fff':''; }
            if(lb){ lb.classList.toggle('text-gray-400',!on); lb.classList.toggle('text-gray-900',on); lb.style.color=on?'#111827':''; }
            if(bar) bar.style.width=(st<n)?'100%':'0%';
          }
        }
        function collapseIdent(card){
          var nome=card.querySelector('input[name=nome]');
          var emailVal=emailInput?emailInput.value.trim():'';
          var head=card.querySelector('h2');
          if(head && !document.getElementById('ident-check')){
            var chk=document.createElement('span');
            chk.id='ident-check';
            chk.setAttribute('aria-label','Conclu\u00eddo');
            chk.style.cssText='width:18px;height:18px;border-radius:50%;background:#10b981;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0';
            chk.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
            head.parentNode.insertBefore(chk, head.nextSibling);
            editBtn=document.createElement('button');
            editBtn.type='button';
            editBtn.id='ident-edit';
            editBtn.setAttribute('aria-label','Editar identifica\u00e7\u00e3o');
            editBtn.style.cssText='margin-left:auto;width:32px;height:32px;border-radius:50%;background:#f3f4f6;border:0;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0';
            editBtn.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>';
            head.parentNode.appendChild(editBtn);
            editBtn.addEventListener('click', function(ev){
              ev.preventDefault(); ev.stopPropagation();
              step='dados';
              if(leadSummary) leadSummary.style.display='none';
              if(nameBlock) nameBlock.style.display='';
              if(waBlock) waBlock.style.display='';
              if(link) link.style.display='';
              btn.style.display='';
              var nf=card.querySelector('input[name=nome]');
              if(nf) nf.focus();
            });
          }
          if(!leadSummary){
            leadSummary=document.createElement('div');
            leadSummary.id='ident-summary';
            leadSummary.style.cssText='padding-left:40px;margin:-2px 0 4px';
            leadSummary.innerHTML='<div id="ident-sum-nome" style="font-size:14px;font-weight:600;color:#111;line-height:1.4"></div><div id="ident-sum-email" style="font-size:12px;color:#9ca3af;line-height:1.4;margin-top:2px;word-break:break-all"></div>';
            card.insertBefore(leadSummary, head.parentNode.nextSibling);
          }
          card.querySelector('#ident-sum-nome').textContent=nome?nome.value.trim():'';
          card.querySelector('#ident-sum-email').textContent=emailVal;
          var p=card.querySelector('p');
          if(p) p.style.display='none';
          if(emailBlock) emailBlock.style.display='none';
          if(nameBlock) nameBlock.style.display='none';
          if(waBlock) waBlock.style.display='none';
          if(link) link.style.display='none';
          leadSummary.style.display='';
          btn.style.display='none';
        }

        function revealEntrega(card){
          var n=card.nextElementSibling;
          while(n){
            if((n.textContent||'').indexOf('ENTREGA')>=0){ n.style.display='none'; break; }
            n=n.nextElementSibling;
          }
          if(!entregaCard){
            entregaCard=document.createElement('div');
            entregaCard.id='entrega-card';
            entregaCard.className='delivery-enter';
            entregaCard.innerHTML='<div class="bg-white rounded-2xl shadow-sm p-5 mx-4">'
              +'<div class="flex items-center gap-2 mb-1"><div class="w-8 h-8 rounded-full flex items-center justify-center" style="background:var(--ck-primary,#3b82f6)"><span class="text-white font-bold text-sm">2</span></div><h2 class="text-base font-black uppercase tracking-wide text-gray-900">ENTREGA</h2></div>'
              +'<p class="text-xs text-gray-400 mb-5 pl-10">Cadastre ou selecione um endere\u00e7o</p>'
              +'<div class="space-y-4">'
              +'<div class="space-y-1.5"><label class="text-sm font-medium text-gray-700">CEP</label><input name="cep" placeholder="12345-000" inputmode="numeric" autocomplete="postal-code" type="text" class="ck-input w-full rounded-xl px-4 py-3 text-sm bg-gray-100" /></div>'
              +'<div class="grid grid-cols-2 gap-3"><div class="space-y-1.5"><label class="text-sm font-medium text-gray-700">Estado</label><input name="estado" autocomplete="address-level1" type="text" class="ck-input w-full rounded-xl px-4 py-3 text-sm bg-gray-100" /></div><div class="space-y-1.5"><label class="text-sm font-medium text-gray-700">Cidade</label><input name="cidade" autocomplete="address-level2" type="text" class="ck-input w-full rounded-xl px-4 py-3 text-sm bg-gray-100" /></div></div>'
              +'<div class="space-y-1.5"><label class="text-sm font-medium text-gray-700">Rua</label><input name="rua" autocomplete="street-address" type="text" class="ck-input w-full rounded-xl px-4 py-3 text-sm bg-gray-100" /></div>'
              +'<div class="grid grid-cols-2 gap-3"><div class="space-y-1.5"><label class="text-sm font-medium text-gray-700">N\u00famero</label><input name="numero" inputmode="numeric" type="text" class="ck-input w-full rounded-xl px-4 py-3 text-sm bg-gray-100" /></div><div class="space-y-1.5"><label class="text-sm font-medium text-gray-700">Bairro</label><input name="bairro" type="text" class="ck-input w-full rounded-xl px-4 py-3 text-sm bg-gray-100" /></div></div>'
              +'<div class="space-y-1.5"><label class="text-sm font-medium text-gray-700">Complemento <span class="text-gray-400 font-normal">(opcional)</span></label><input name="complemento" placeholder="Apto, bloco, refer\u00eancia..." type="text" class="ck-input w-full rounded-xl px-4 py-3 text-sm bg-gray-100" /></div>'
              +'</div>'
              +'<button type="button" class="ck-btn w-full font-bold py-3.5 rounded-full text-sm shadow-sm mt-5">Continuar</button>'
              +'<div class="mt-4 bg-green-50 rounded-xl" style="border:1px solid #dcfce7;padding:14px"><p class="text-xs text-gray-500 leading-relaxed">Por favor, certifique-se de colocar corretamente os seus dados para que seu pedido chegue o quanto antes em sua resid\u00eancia.</p></div>'
              +'</div>';
            var freteBlock=document.createElement('div');
            freteBlock.id='frete-block';
            freteBlock.style.display='none';
                        var freteHtml='<div style="margin-top:20px;font-family:Inter,Arial,sans-serif;width:100%;box-sizing:border-box;"><p style="font-size:14px;line-height:20px;font-weight:500;color:#4b5563;margin:0 0 8px 0;">Escolha uma forma de entrega:</p><div style="display:flex;flex-direction:column;gap:8px;width:100%;"><button type="button" aria-pressed="true" onclick=" const buttons=this.parentElement.querySelectorAll(&#39;button&#39;); buttons.forEach((b,i)=>{ const selected=b===this; b.setAttribute(&#39;aria-pressed&#39;,selected?&#39;true&#39;:&#39;false&#39;); b.style.borderColor=selected?&#39;#3b82f6&#39;:&#39;#e5e7eb&#39;; b.style.background=selected?&#39;rgba(59,130,246,.08)&#39;:&#39;#ffffff&#39;; b.querySelector(&#39;[data-radio]&#39;).style.borderColor=selected?&#39;#3b82f6&#39;:&#39;#d1d5db&#39;; b.querySelector(&#39;[data-dot]&#39;).style.display=selected?&#39;block&#39;:&#39;none&#39;; }); " style=" width:100%; border-radius:12px; padding:14px; display:flex; align-items:center; gap:12px; border:2px solid #3b82f6; background:rgba(59,130,246,.08); cursor:pointer; font-family:Inter,Arial,sans-serif; box-sizing:border-box; text-align:left; transition:border-color .18s ease,background-color .18s ease; "><div data-radio style=" width:20px; height:20px; min-width:20px; border-radius:50%; border:2px solid #3b82f6; display:flex; align-items:center; justify-content:center; box-sizing:border-box; transition:border-color .18s ease; "><div data-dot style=" width:10px; height:10px; border-radius:50%; background:#3b82f6; display:block; "></div></div><div style="flex:1;min-width:0;text-align:left;"><p style="margin:0;font-size:14px;line-height:20px;font-weight:700;color:#111827;">Frete Grátis</p><p style="margin:0;font-size:12px;line-height:16px;font-weight:400;color:#6b7280;">Receba em até 4 a 5 dias</p></div><span style=" display:inline-flex; align-items:center; justify-content:center; padding:2px 6px; border-radius:4px; background:#10b981; color:#ffffff; font-size:10px; line-height:14px; font-weight:900; letter-spacing:.025em; white-space:nowrap; flex-shrink:0; ">GRÁTIS</span><span style=" font-size:14px; line-height:20px; font-weight:700; color:#16a34a; white-space:nowrap; flex-shrink:0; ">R$&nbsp;0,00</span></button><button type="button" aria-pressed="false" onclick=" const buttons=this.parentElement.querySelectorAll(&#39;button&#39;); buttons.forEach((b,i)=>{ const selected=b===this; b.setAttribute(&#39;aria-pressed&#39;,selected?&#39;true&#39;:&#39;false&#39;); b.style.borderColor=selected?&#39;#3b82f6&#39;:&#39;#e5e7eb&#39;; b.style.background=selected?&#39;rgba(59,130,246,.08)&#39;:&#39;#ffffff&#39;; b.querySelector(&#39;[data-radio]&#39;).style.borderColor=selected?&#39;#3b82f6&#39;:&#39;#d1d5db&#39;; b.querySelector(&#39;[data-dot]&#39;).style.display=selected?&#39;block&#39;:&#39;none&#39;; }); " style=" width:100%; border-radius:12px; padding:14px; display:flex; align-items:center; gap:12px; border:2px solid #e5e7eb; background:#ffffff; cursor:pointer; font-family:Inter,Arial,sans-serif; box-sizing:border-box; text-align:left; transition:border-color .18s ease,background-color .18s ease; "><div data-radio style=" width:20px; height:20px; min-width:20px; border-radius:50%; border:2px solid #d1d5db; display:flex; align-items:center; justify-content:center; box-sizing:border-box; transition:border-color .18s ease; "><div data-dot style=" width:10px; height:10px; border-radius:50%; background:#3b82f6; display:none; "></div></div><div style="flex:1;min-width:0;text-align:left;"><p style="margin:0;font-size:14px;line-height:20px;font-weight:700;color:#111827;">Frete Expresso</p><p style="margin:0;font-size:12px;line-height:16px;font-weight:400;color:#6b7280;">Receba em até 1 a 2 dias</p></div><div style=" display:flex; align-items:center; gap:4px; flex-shrink:0; color:#16a34a; "><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#16a34a" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;flex-shrink:0;"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg><span style=" font-size:12px; line-height:16px; font-weight:900; color:#16a34a; text-transform:uppercase; letter-spacing:.025em; white-space:nowrap; ">FULL</span></div><span style=" font-size:14px; line-height:20px; font-weight:700; color:#16a34a; white-space:nowrap; flex-shrink:0; ">R$&nbsp;9,04</span></button></div></div>';
            freteBlock.innerHTML=freteHtml;
            var compWrap=entregaCard.querySelector('input[name=complemento]').closest('.space-y-1\\.5');
            if(compWrap && compWrap.parentNode){ compWrap.parentNode.insertBefore(freteBlock, compWrap.nextSibling); }
            else { entregaCard.querySelector('div.bg-white').appendChild(freteBlock); }
            var btnE=entregaCard.querySelector('button.ck-btn');
            btnE.addEventListener('click', function(ev){
              ev.preventDefault(); ev.stopPropagation();
              var inputs=entregaCard.querySelectorAll('input');
              var cepEl=entregaCard.querySelector('input[name=cep]'), numEl=entregaCard.querySelector('input[name=numero]');
              if(cepEl.value.replace(/\D/g,'').length!==8){ cepEl.focus(); return; }
              if(!numEl.value.trim()){ numEl.focus(); return; }
              var obj={};
              for(var j=0;j<inputs.length;j++){ obj[inputs[j].name]=inputs[j].value.trim(); }
              try { localStorage.setItem('entrega_'+Date.now(), JSON.stringify(obj)); } catch(err){}
              (function(){
                var box=entregaCard.querySelector('div.bg-white');
                var head=box.querySelector('h2');
                var sub=box.querySelector(':scope > p');
                var fields=box.querySelector(':scope > .space-y-4');
                var note=box.querySelector(':scope > .bg-green-50');
                var sum=document.getElementById('entrega-summary');
                if(!document.getElementById('entrega-check')){
                  var chk=document.createElement('span'); chk.id='entrega-check';
                  chk.style.cssText='width:18px;height:18px;border-radius:50%;background:#10b981;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0';
                  chk.innerHTML='<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
                  head.parentNode.insertBefore(chk, head.nextSibling);
                  var eb=document.createElement('button'); eb.type='button'; eb.id='entrega-edit';
                  eb.setAttribute('aria-label','Editar entrega');
                  eb.style.cssText='margin-left:auto;width:32px;height:32px;border-radius:50%;background:#f3f4f6;border:0;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0';
                  eb.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>';
                  head.parentNode.appendChild(eb);
                  eb.addEventListener('click', function(ev){
                    ev.preventDefault(); ev.stopPropagation();
                    document.getElementById('entrega-summary').style.display='none';
                    if(sub) sub.style.display=''; if(fields) fields.style.display=''; if(note) note.style.display='';
                    btnE.style.display='';
                    var ce=entregaCard.querySelector('input[name=cep]'); if(ce) ce.focus();
                  });
                }
                if(!sum){
                  sum=document.createElement('div'); sum.id='entrega-summary';
                  sum.style.cssText='padding-left:40px;margin:-2px 0 4px';
                  sum.innerHTML='<div id="entrega-sum-rua" style="font-size:14px;font-weight:600;color:#111;line-height:1.4"></div><div id="entrega-sum-cidade" style="font-size:12px;color:#9ca3af;line-height:1.4;margin-top:2px"></div>';
                  box.insertBefore(sum, head.parentNode.nextSibling);
                }
                var linha1=[obj.rua, obj.numero].filter(Boolean).join(', ') + (obj.complemento?' - '+obj.complemento:'');
                var linha2=[obj.bairro, [obj.cidade, obj.estado].filter(Boolean).join('/'), obj.cep].filter(Boolean).join(' - ');
                document.getElementById('entrega-sum-rua').textContent=linha1;
                document.getElementById('entrega-sum-cidade').textContent=linha2;
                if(sub) sub.style.display='none'; if(fields) fields.style.display='none'; if(note) note.style.display='none';
                btnE.style.display='none';
                sum.style.display='';
              })();
              setStep(3);
              if(!document.getElementById('pagamento-card')){
                var tmp=document.createElement('div'); tmp.innerHTML=" <div id=\"pagamento-card\" class=\"mx-4 delivery-enter\" style=\"font-family:Inter,Arial,Helvetica,sans-serif;--ck-primary:#3b82f6; background:#ffffff; border-radius:16px; padding:20px; box-sizing:border-box; box-shadow: 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px -1px rgba(0,0,0,0.10); \" > <!-- CABE\u00c7ALHO --> <div style=\" display:flex; align-items:center; gap:8px; margin-bottom:16px; box-sizing:border-box; \" > <div style=\" width:32px; height:32px; min-width:32px; border-radius:9999px; display:flex; align-items:center; justify-content:center; background:var(--ck-primary,#3b82f6); box-sizing:border-box; \" > <span style=\" color:#ffffff; font-size:14px; line-height:20px; font-weight:700; \" > 3 <\/span> <\/div> <h2 style=\" margin:0; color:#111827; font-size:16px; line-height:24px; font-weight:900; text-transform:uppercase; letter-spacing:0.025em; \" > PAGAMENTO <\/h2> <\/div> <!-- PIX --> <div style=\" border:1px solid #e5e7eb; border-radius:12px; padding:16px; box-sizing:border-box; \" > <div style=\" display:flex; align-items:center; gap:12px; margin-bottom:12px; \" > <div style=\" width:20px; height:20px; min-width:20px; border-radius:50%; border:2px solid var(--ck-primary,#3b82f6); display:flex; align-items:center; justify-content:center; box-sizing:border-box; \" > <div style=\" width:10px; height:10px; border-radius:50%; background:var(--ck-primary,#3b82f6); \" ><\/div> <\/div> <span style=\" color:#111827; font-size:14px; line-height:20px; font-weight:700; \" > Pix <\/span> <\/div> <p style=\" margin:0 0 12px 32px; color:#6b7280; font-size:14px; line-height:1.625; font-weight:400; \" > A confirma\u00e7\u00e3o de pagamento \u00e9 realizada em poucos minutos. Utilize o aplicativo do seu banco para pagar. <\/p> <p style=\" margin:0 0 0 32px; color:#374151; font-size:14px; line-height:20px; font-weight:700; \" > Valor no pix: <span style=\" color:var(--ck-primary,#3b82f6); font-size:16px; line-height:24px; font-weight:700; white-space:nowrap; \" > R$&nbsp;29,90 <\/span> <\/p> <\/div> <!-- BOT\u00c3O --> <button type=\"button\" onmouseover=\"this.style.background='#059669'\" onmouseout=\"this.style.background='#10b981'\" onmousedown=\"this.style.background='#047857';this.style.transform='scale(0.99)'\" onmouseup=\"this.style.background='#059669';this.style.transform='scale(1)'\" style=\" width:100%; margin-top:16px; padding:16px; border:0; border-radius:9999px; background:var(--ck-button,#10b981); color:#ffffff; font-family:Inter,Arial,Helvetica,sans-serif; font-size:16px; line-height:24px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:12px; box-sizing:border-box; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.10), 0 2px 4px -2px rgba(0,0,0,0.10); transition: background-color .18s ease, transform .08s ease, box-shadow .18s ease; \" > Comprar agora <\/button> <\/div>";
                var pg=tmp.firstElementChild;
                var hs=document.querySelectorAll('h2');
                for(var q=0;q<hs.length;q++){ if(hs[q].textContent.trim()==='PAGAMENTO' && hs[q].className.indexOf('text-gray-400')>=0){ var ph=hs[q].closest('.bg-white'); if(ph) ph.style.display='none'; } }
                entregaCard.parentNode.insertBefore(pg, entregaCard.nextSibling);
                setTimeout(function(){ pg.scrollIntoView({behavior:'smooth',block:'start'}); },50);
              }
            }, true);
          }
          card.parentNode.insertBefore(entregaCard, card.nextSibling);
        var cepInput=entregaCard.querySelector('input[name=cep]');
          var ufInput=entregaCard.querySelector('input[name=estado]');
          var cidInput=entregaCard.querySelector('input[name=cidade]');
          var ruaInput=entregaCard.querySelector('input[name=rua]');
          var bairroInput=entregaCard.querySelector('input[name=bairro]');
          var cepLast='';
          cepInput.addEventListener('input', function(){
            var d=cepInput.value.replace(/\D/g,'').slice(0,8);
            cepInput.value = d.length>5 ? d.slice(0,5)+'-'+d.slice(5) : d;
            if(d.length===8 && d!==cepLast){
              cepLast=d;
              if(freteBlock) freteBlock.style.display='';
              if(freteBlock) freteBlock.style.display='';
              fetch('https://viacep.com.br/ws/'+d+'/json/').then(function(r){ return r.json(); }).then(function(j){
                if(j && !j.erro){
                  ufInput.value=j.uf||'';
                  cidInput.value=j.localidade||'';
                  ruaInput.value=j.logradouro||'';
                  bairroInput.value=j.bairro||'';
                }
              }).catch(function(){});
            }
          });
        
        }

        btn.addEventListener('click', function(e){
          e.preventDefault(); e.stopPropagation();
          var card = btn.closest('div.bg-white') || btn.parentElement;
          if(step==='email'){
            emailInput = card.querySelector('input[type=email]');
            if(!emailInput || !emailInput.value.trim() || emailInput.value.indexOf('@')<0){
              if(emailInput) emailInput.focus();
              return;
            }
            if(!nameBlock){
              emailBlock = emailInput.closest('.space-y-1\\.5') || emailInput.parentElement;
              nameBlock=document.createElement('div');
              nameBlock.className='space-y-1.5 mb-4';
              nameBlock.style.display='none';
              nameBlock.innerHTML='<label class="text-sm font-medium text-gray-700">Nome Completo</label><input name="nome" type="text" required placeholder="Seu nome completo" autocomplete="name" class="ck-input w-full bg-gray-100 rounded-xl px-4 py-3 text-sm placeholder:text-gray-400" />';
              waBlock=document.createElement('div');
              waBlock.className='space-y-1.5 mb-4';
              waBlock.style.display='none';
              waBlock.innerHTML='<label class="text-sm font-medium text-gray-700">Celular / Whatsapp</label><div class="flex items-center w-full bg-gray-100 rounded-xl px-4 py-3 text-sm"><span class="text-xs font-bold text-gray-800" style="margin-right:8px">BR</span><span class="text-gray-400" style="padding-right:10px;margin-right:10px;border-right:1px solid #d1d5db;user-select:none">+55</span><input name="whatsapp" type="tel" required inputmode="numeric" maxlength="14" placeholder="(11) 9999-9999" autocomplete="tel-national" class="flex-1 bg-transparent placeholder:text-gray-400" style="outline:none;border:0;min-width:0" /></div>';
              link=document.createElement('div');
              link.style.cssText='text-align:center;margin-bottom:12px;display:none';
              link.innerHTML='<a href="#" id="trocar-email" style="font-size:11px;font-weight:500;color:#64748b;text-decoration:underline">&#8249; TROCAR E-MAIL</a>';
              var waInput=waBlock.querySelector('input[name=whatsapp]');
              waInput.addEventListener('input', function(){
                var v=waInput.value.replace(/\D/g,'').slice(0,10);
                if(v.length>6) waInput.value='('+v.slice(0,2)+') '+v.slice(2,6)+'-'+v.slice(6);
                else if(v.length>2) waInput.value='('+v.slice(0,2)+') '+v.slice(2);
                else waInput.value=v;
              });
              btn.parentNode.insertBefore(link, btn);
              btn.parentNode.insertBefore(nameBlock, btn);
              btn.parentNode.insertBefore(waBlock, btn);
              link.querySelector('a').addEventListener('click', function(ev){
                ev.preventDefault();
                step='email';
                nameBlock.style.display='none';
                waBlock.style.display='none';
                link.style.display='none';
                if(emailBlock) emailBlock.style.display='';
                if(emailInput) emailInput.focus();
              });
            }
            if(emailBlock) emailBlock.style.display='none';
            nameBlock.style.display='';
            waBlock.style.display='';
            link.style.display='';
            step='dados';
            return;
          }
          var nome=card.querySelector('input[name=nome]');
          var wa=card.querySelector('input[name=whatsapp]');
          if(!nome || !nome.value.trim() || !wa || !wa.value.trim()){
            if(nome && !nome.value.trim()) nome.focus();
            else if(wa && !wa.value.trim()) wa.focus();
            return;
          }
          try { localStorage.setItem('lead_'+Date.now(), JSON.stringify({ nome: nome.value.trim(), whatsapp: wa.value.trim(), email: emailInput?emailInput.value.trim():'', ts: new Date().toISOString() })); } catch(err){}
          var first=!identificationCompleted;
          identificationCompleted=true; setStep(2);
          collapseIdent(card);
          if(first){
            revealEntrega(card);
            try { entregaCard.scrollIntoView({ behavior:'smooth', block:'start' }); } catch(err){}
          }
        }, true);
      } else if(tries>40){ clearInterval(iv); }
    }, 150);
  });
})();


(function(){
  var KEY='checkout_timer_end';
  var now=Date.now();
  var end=parseInt(localStorage.getItem(KEY),10);
  if(!end || isNaN(end) || end - now > 10*60*1000){
    end=now + 10*60*1000;
    try{ localStorage.setItem(KEY, String(end)); }catch(err){}
  }
  function pad(n){ return (n<10?'0':'')+n; }
  function tick(){
    var span=document.getElementById('ck-timer');
    if(!span) return;
    var left=end - Date.now();
    if(left<0) left=0;
    var total=Math.floor(left/1000);
    var mm=Math.floor(total/60), ss=total%60;
    span.textContent=pad(mm)+':'+pad(ss);
    if(left<=0){ clearInterval(iv); }
  }
  tick();
  var iv=setInterval(tick,1000);
})();

const lessonSources = {
 phaseTheory: ['OpenStax · Phasenübergänge', 'https://openstax.org/books/chemistry-atoms-first-2e/pages/10-3-phase-transitions'],
 eqTheory: ['OpenStax · Reaktionsgleichungen', 'https://openstax.org/books/chemistry-2e/pages/4-1-writing-and-balancing-chemical-equations'],
 atomTheory: ['OpenStax · Atombau', 'https://openstax.org/books/chemistry-2e/pages/2-3-atomic-structure-and-symbolism'],
};
const sourceLink = key => '<a href="'+lessonSources[key][1]+'">'+lessonSources[key][0]+'</a>';
const simNumber = (n, digits=1) => new Intl.NumberFormat('de-AT',{maximumFractionDigits:digits}).format(n);
const simOptions = entries => entries.map(([value,label])=>'<option value="'+value+'">'+label+'</option>').join('');
const simSelect = (id,label,entries) => '<label for="'+id+'">'+label+'</label><select id="'+id+'">'+simOptions(entries)+'</select>';
const simRange = (id,label,min,max,value,step=1) => '<label for="'+id+'">'+label+' <output id="'+id+'-value" for="'+id+'"></output></label><input id="'+id+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'">';
const simTip = (title,text) => '<details class="model-note"><summary>'+title+'</summary><p>'+text+'</p></details>';
const power10 = n => '10'+String(n).replace(/[−\-0123456789]/g,c=>({'-':'⁻','−':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'})[c]);
const exercises = {
 phase:['Was geschieht, wenn Eis bei 0 °C weiter Energie aufnimmt?',['Die Temperatur steigt sofort.','Ein Teil des Eises schmilzt bei etwa gleicher Temperatur.','Die H₂O-Moleküle zerfallen.'],1,'Die Energie ermöglicht die Änderung der Anordnung und Wechselwirkungen. Solange Eis und Wasser im Gleichgewicht koexistieren, bleibt die Temperatur etwa gleich.'],
 ph:['Probe A hat pH 3, Probe B pH 5. Wie groß ist die Wasserstoffionenaktivität in A im Vergleich zu B?',['2-mal so groß','10-mal so groß','100-mal so groß'],2,'Zwei pH-Einheiten entsprechen 10 × 10. Der kleinere pH-Wert hat die größere Wasserstoffionenaktivität.'],
 equation:['Du hast auf beiden Seiten zu wenige O-Atome. Was darfst du beim Ausgleichen verändern?',['Die tiefgestellten Zahlen in einer Stoffformel.','Die Zahlen vor den Stoffformeln.','Die Symbole der Elemente.'],1,'Die Zahl vor einer Formel verändert die Anzahl der dargestellten Teilchen. Die Formel des Stoffs bleibt gleich.'],
 atom:['Du änderst bei Kohlenstoff-12 die Neutronenzahl von 6 auf 7. Was entsteht?',['Ein Stickstoffatom','Ein Kohlenstoffion','Kohlenstoff-13'],2,'Das Element bleibt Kohlenstoff, weil es weiterhin 6 Protonen besitzt. Ein zusätzliches Neutron erhöht die Massenzahl auf 13.'],
};
function mountLab(panel,key,intro,controls,visual,model){
 const [question,choices]=exercises[key];
 panel.innerHTML='<div class="lab"><p class="lab-intro">'+intro+'</p><div class="lab-grid"><section class="lab-controls" aria-label="Simulation steuern">'+controls+'</section><section class="lab-visual" aria-label="Simulation beobachten">'+visual+'</section></div>'+model+'<details class="lab-task"><summary>Vermuten und überprüfen</summary><fieldset><legend>'+question+'</legend>'+choices.map((choice,i)=>'<label><input type="radio" name="prediction" value="'+i+'"> '+choice+'</label>').join('')+'</fieldset><button class="secondary" data-check-prediction>Antwort prüfen</button><p class="lab-feedback" role="status"></p></details></div>';
 const feedback=panel.querySelector('.lab-feedback');
 panel.querySelector('[data-check-prediction]').addEventListener('click',()=>{
  const checked=panel.querySelector('[name=prediction]:checked');
  const correct=Number(checked?.value)===exercises[key][2];
  feedback.textContent=!checked?'Wähle zuerst eine Antwort.':correct?'Richtig. '+exercises[key][3]:'Noch ein Versuch. Prüfe deine Vermutung an der Simulation.';
  feedback.dataset.result=correct?'yes':'';
 });
 const get=id=>panel.querySelector('#'+id);
 return get;
}

// Energy in J/g relative to ice at −20 °C, using constant heat capacities.
const heatPoints = [[0,-20],[42,0],[376,0],[794,100],[3051,100],[3091,120]];
function waterState(heat){
 heat=Math.min(3091,Math.max(0,heat));
 const i=heatPoints.findIndex(([energy],index)=>index>0&&heat<=energy)-1;
 const [x0,t0]=heatPoints[i], [x1,t1]=heatPoints[i+1];
 const fraction=(heat-x0)/(x1-x0);
 const names=['Eis','Eis und Wasser','Flüssiges Wasser','Wasser und Wasserdampf','Wasserdampf'];
 return {i,temperature:t0+(t1-t0)*fraction,fraction,name:names[i]};
}
const point = (ctx,x,y,r,fill) => {
 ctx.fillStyle=fill;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
};
const line = (ctx,x0,y0,x1,y1) => {
 ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
};
function phaseLab(panel){
 const get=mountLab(panel,'phase','Führe einer Probe von 1 g Wasser Energie zu. Beobachte, wie sich Temperatur, Phasenanteile und Teilchenbild verändern.',
  simRange('heat','Zugeführte Energie',0,3091,460)+simSelect('heat-jump','Beispielzustand',[['','Auswählen'],[21,'Eis bei −10 °C'],[209,'Schmelzen bei 0 °C'],[460,'Wasser bei 20 °C'],[1923,'Sieden bei 100 °C'],[3071,'Dampf bei 110 °C']])+
  '<div class="lab-actions"><button class="secondary" id="heat-play">Abspielen</button><button class="secondary" id="heat-reset">Von vorne</button><button class="secondary" id="heat-motion" aria-pressed="false">Teilchenbewegung aus</button></div>',
  '<div class="lab-stat" id="heat-state"></div><div class="water-grid"><figure><canvas id="water-particles" width="390" height="228" role="img" aria-label="Teilchenbild"></canvas><figcaption>Teilchenbild · Jeder Punkt steht für ein H₂O-Molekül.</figcaption></figure><figure><canvas id="heating-curve" width="440" height="228" role="img" aria-label="Heizkurve mit Plateaus bei 0 und 100 Grad Celsius"></canvas><figcaption>Heizkurve · Der Punkt zeigt den gewählten Zustand.</figcaption></figure></div>',
  simTip('Annahmen des Modells','Modell für reines Wasser bei Normaldruck (rund 1 atm). Die Wärmekapazitäten sind näherungsweise konstant. Bei 0 und 100 °C zeigt die Energiemenge den Anteil der jeweils neu gebildeten Phase. Teilchenzahl, Abstände und Volumen sind schematisch. Verdunstung unterhalb des Siedepunkts ist ausgeblendet. '+sourceLink('phaseTheory')));
 const energy=get('heat'), jump=get('heat-jump'), play=get('heat-play'), motion=get('heat-motion');
 const particles=get('water-particles'), curve=get('heating-curve');
 const ctx=particles.getContext('2d'), graph=curve.getContext('2d');
 let state, playing=false, moving=!matchMedia('(prefers-reduced-motion: reduce)').matches, frame=0, last=0, accumulated=0, motionTime=0;
 function drawCurve(heat){
  const x=e=>52+e/3091*364, y=t=>188-(t+20)/140*161;
  graph.clearRect(0,0,440,228);graph.font='13px system-ui';graph.lineWidth=1;
  for(const t of [0,50,100]){
   graph.strokeStyle='#d9e3f4';line(graph,x(0),y(t),x(3091),y(t));
   graph.fillStyle='#435a7c';graph.fillText(t+'°',16,y(t)+4);
  }
  graph.strokeStyle='#6b82ab';line(graph,x(0),y(-20),x(3091),y(-20));line(graph,x(0),y(-20),x(0),y(120));
  graph.fillStyle='#435a7c';graph.fillText('T in °C',12,15);graph.fillText('Energie in J/g',321,219);
  for(const tick of [0,1000,2000,3000])graph.fillText(String(tick),x(tick)-9,206);
  graph.lineWidth=4;
  heatPoints.slice(1).forEach(([a,b],i)=>{
   const [p,q]=heatPoints[i];
   graph.strokeStyle=b===q?'#148166':'#3459cc';line(graph,x(p),y(q),x(a),y(b));
  });
  point(graph,x(heat),y(state.temperature),6,'#e57831');
 }
 function drawParticles(){
  ctx.clearRect(0,0,390,228);
  ctx.strokeStyle='#4a648e';ctx.lineWidth=2;
  line(ctx,17,21,17,208);line(ctx,17,208,373,208);line(ctx,373,208,373,21);
  const n=32, t=motionTime/1000, k=Math.round(n*state.fraction);
  const speed=Math.max(.35,(state.temperature+36)/75);
  const wrap=(v,width)=>width-Math.abs(((v%(2*width))+2*width)%(2*width)-width);
  for(let i=0;i<n;i++){
   const solid=state.i===0||(state.i===1&&i>=k);
   const gas=state.i===4||(state.i===3&&i<k);
   let x,y;
   if(solid){
    x=(state.i===1?33:114)+(i%8)*19+Math.sin(t*8+i)*speed*2;
    y=135+Math.floor(i/8)*18+Math.cos(t*8+i)*speed*2;
   }else if(gas){
    x=28+wrap((i*79)%327+t*speed*(25+i%13),333);
    y=22+wrap((i*53)%172+t*speed*(17+i%11),state.i===3?104:176);
   }else{
    x=(state.i===1?198:45)+wrap((i*53)%153+t*speed*(17+i%7),state.i===1?153:293);
    y=136+wrap((i*31)%58+t*speed*(11+i%9),60);
   }
   point(ctx,x,y,5.2,'#a8d6ff');
  }
 }
 function update(){
  const heat=Number(energy.value);
  state=waterState(heat);
  get('heat-value').textContent=simNumber(heat,0)+' J/g';
  const mix=state.i===1||state.i===3?' · '+simNumber(state.fraction*100,0)+' % '+(state.i===1?'flüssig':'gasförmig'):'';
  get('heat-state').textContent=state.name+' · '+simNumber(state.temperature)+' °C'+mix;
  particles.setAttribute('aria-label',state.name+mix);
  drawCurve(heat);drawParticles();
 }
 function stop(){
  playing=false;play.textContent='Abspielen';
 }
 function tick(now){
  frame=0;
  const dt=last?Math.min(100,now-last):0;
  last=now;
  if(playing){
   accumulated+=dt;
   if(accumulated>=40){
    energy.value=Math.min(3091,Number(energy.value)+Math.round(accumulated*.17));accumulated=0;
    update();if(Number(energy.value)===3091)stop();
   }
  }
  if(moving){motionTime+=dt;drawParticles();}
  if(playing||moving)frame=requestAnimationFrame(tick);
 }
 function run(){
  if(!frame&&(playing||moving)){last=0;frame=requestAnimationFrame(tick);}
 }
 energy.addEventListener('input',()=>{stop();jump.value='';update();});
 jump.addEventListener('change',()=>{if(jump.value==='')return;stop();energy.value=jump.value;update();});
 get('heat-reset').addEventListener('click',()=>{stop();energy.value=0;jump.value='';update();});
 play.addEventListener('click',()=>{
  if(playing){stop();return;}
  if(Number(energy.value)===3091)energy.value=0;
  jump.value='';playing=true;accumulated=0;play.textContent='Pausieren';run();
 });
 function motionLabel(){
  motion.textContent=moving?'Teilchenbewegung aus':'Teilchenbewegung an';
  motion.setAttribute('aria-pressed',String(!moving));
 }
 motion.addEventListener('click',()=>{moving=!moving;motionLabel();drawParticles();run();});
 motionLabel();update();run();
 return ()=>cancelAnimationFrame(frame);
}

const reactions=[
 {label:'Wasserbildung',left:[['H₂',{H:2}],['O₂',{O:2}]],right:[['H₂O',{H:2,O:1}]],solution:[2,1,2]},
 {label:'Vollständige Methanverbrennung',left:[['CH₄',{C:1,H:4}],['O₂',{O:2}]],right:[['CO₂',{C:1,O:2}],['H₂O',{H:2,O:1}]],solution:[1,2,1,2]},
 {label:'Magnesiumoxidbildung',left:[['Mg',{Mg:1}],['O₂',{O:2}]],right:[['MgO',{Mg:1,O:1}]],solution:[2,1,2]},
 {label:'Bildung von Eisen(III)-oxid',left:[['Fe',{Fe:1}],['O₂',{O:2}]],right:[['Fe₂O₃',{Fe:2,O:3}]],solution:[4,3,2]},
];
function atomBalance(reaction,values){
 const all=[...reaction.left,...reaction.right];
 return [...new Set(all.flatMap(([,counts])=>Object.keys(counts)))].map(element=>{
  const totals=[0,0];
  all.forEach(([,atoms],i)=>{totals[i<reaction.left.length?0:1]+=(atoms[element]||0)*values[i];});
  return [element,...totals];
 });
}
const atomDots=atoms=>Object.entries(atoms).flatMap(([element,count])=>Array.from({length:count},()=>'<span class="atom-dot el-'+element+'">'+element+'</span>')).join('');
function equationLab(panel){
 const get=mountLab(panel,'equation','Verändere die Koeffizienten. Auf jeder Seite muss von jeder Atomsorte dieselbe Anzahl stehen.',
  simSelect('reaction','Reaktion',reactions.map((r,i)=>[i,r.label]))+'<div id="coefficients"></div><div class="lab-actions"><button class="secondary" id="eq-reset">Zurücksetzen</button></div>',
  '<div class="lab-stat eq-formula" id="formula"></div><div class="eq-model" id="eq-model"></div><table class="eq-table"><thead><tr><th scope="col">Atomsorte</th><th scope="col">Links</th><th scope="col">Rechts</th><th scope="col">Vergleich</th></tr></thead><tbody id="atom-counts"></tbody></table><p class="lab-stat" id="eq-status" aria-live="polite"></p>',
  simTip('Was bedeuten die Teilchenbilder?','Jede Gruppe steht für ein Molekül oder eine Formeleinheit. Die Punkte zeigen die enthaltenen Atome. Bindungen, Kristallstrukturen und die räumliche Gestalt sind ausgeblendet. Die Beispiele sind für die Arbeit am Modell vorgesehen. '+sourceLink('eqTheory')));
 const select=get('reaction'), controls=get('coefficients');
 const current=()=>reactions[Number(select.value)];
 function reset(){
  const r=current();
  controls.innerHTML=[...r.left,...r.right].map(([formula],i)=>simSelect('co'+i,(i<r.left.length?'Edukt ':'Produkt ')+formula,[1,2,3,4,5,6,7,8].map(n=>[n,n]))).join('');
  update();
 }
 function update(){
  const r=current(), all=[...r.left,...r.right], values=[...controls.querySelectorAll('select')].map(s=>Number(s.value));
  const pretty=all.map(([formula],i)=>(values[i]===1?'':values[i]+' ')+formula);
  get('formula').textContent=pretty.slice(0,r.left.length).join(' + ')+' → '+pretty.slice(r.left.length).join(' + ');
  function groups(terms,offset,title){
   return '<section><h4>'+title+'</h4>'+terms.map(([formula,atoms],i)=>'<div class="eq-term"><b>'+values[offset+i]+' × '+formula+'</b><div class="eq-groups" aria-hidden="true">'+Array.from({length:values[offset+i]},()=>'<span class="eq-group">'+atomDots(atoms)+'</span>').join('')+'</div></div>').join('')+'</section>';
  }
  get('eq-model').innerHTML=groups(r.left,0,'Edukte')+groups(r.right,r.left.length,'Produkte');
  const counts=atomBalance(r,values);
  get('atom-counts').innerHTML=counts.map(([element,l,right])=>'<tr><th scope="row"><span class="atom-dot el-'+element+'">'+element+'</span></th><td>'+l+'</td><td>'+right+'</td><td class="'+(l===right?'balanced':'unbalanced')+'">'+(l===right?'Gleich':Math.abs(l-right)+' mehr '+(l>right?'links':'rechts'))+'</td></tr>').join('');
  const balanced=counts.every(([,l,right])=>l===right);
  const simplest=values.every((v,i)=>v===r.solution[i]);
  get('eq-status').textContent=!balanced?'Noch nicht ausgeglichen.':simplest?'Ausgeglichen · kleinste ganze Zahlen.':'Ausgeglichen. Kürze die Koeffizienten.';
  get('eq-status').dataset.result=balanced?'yes':'';
 }
 controls.addEventListener('change',update);
 select.addEventListener('change',reset);
 get('eq-reset').addEventListener('click',reset);
 reset();
}

const elements=[['H','Wasserstoff'],['He','Helium'],['Li','Lithium'],['Be','Beryllium'],['B','Bor'],['C','Kohlenstoff'],['N','Stickstoff'],['O','Sauerstoff'],['F','Fluor'],['Ne','Neon'],['Na','Natrium'],['Mg','Magnesium'],['Al','Aluminium'],['Si','Silicium'],['P','Phosphor'],['S','Schwefel'],['Cl','Chlor'],['Ar','Argon'],['K','Kalium'],['Ca','Calcium']];
const atomPresets=[['','Eigene Kombination'],['6,6,6','Kohlenstoff-12'],['6,7,6','Kohlenstoff-13'],['11,12,11','Natrium-23'],['11,12,10','Natriumion Na⁺'],['17,18,18','Chloridion Cl⁻'],['20,20,20','Calcium-40']];
function atomState(p,n,e){
 const [symbol,name]=elements[p-1];
 const charge=p-e;
 return {symbol,name,mass:p+n,charge,shells:p===e?[Math.min(2,e),Math.min(8,Math.max(0,e-2)),Math.min(8,Math.max(0,e-10)),Math.max(0,e-18)].filter(Boolean):[]};
}
function atomLab(panel){
 const controls=[['proton','Protonen',1,20],['neutron','Neutronen',0,24],['electron','Elektronen',0,22]];
 const get=mountLab(panel,'atom','Baue ein Atom oder Ion. Verändere jeweils nur einen Regler und beobachte, was mit Element, Massenzahl und Ladung geschieht.',
  simSelect('atom-preset','Beispiel',atomPresets)+controls.map(([id,label,min,max])=>simRange(id,label,min,max,6)).join('')+'<div class="lab-actions"><button id="atom-reset" class="secondary">Kohlenstoff-12 laden</button></div>',
  '<div class="atom-display"><canvas id="atom-view" width="360" height="255" role="img" aria-label="Atommodell"></canvas><div class="nucleus-info"><div id="isotope-symbol" class="isotope-symbol"></div><div id="element-name"></div><p id="atom-count"></p><p id="shell-count"></p></div></div><p class="atom-legend"><span><i class="dot proton"></i> Proton</span><span><i class="dot neutron"></i> Neutron</span><span><i class="dot electron"></i> Elektron</span></p><p id="atom-compare" class="lab-stat" aria-live="polite"></p><div class="element-strip" id="element-strip" aria-label="Elemente mit Ordnungszahl 1 bis 20"></div>',
  simTip('Was zeigt das Atommodell?','Die erste Zahl am Symbol links oben ist die Massenzahl A, links unten steht die Ordnungszahl Z. Rechts oben steht bei Ionen die Ladung. Für neutrale Atome zeigt das vereinfachte Modell die Schalenbelegung im Grundzustand. Bei Ionen zeigen die blauen Punkte nur die Elektronenzahl. Größen und Abstände sind schematisch, Elektronen haben keine festen Kreisbahnen. Mit den Reglern sind auch Kombinationen möglich, die kein stabiles Atom oder Ion bilden. '+sourceLink('atomTheory')));
 const preset=get('atom-preset'), canvas=get('atom-view'), ctx=canvas.getContext('2d'), input=controls.map(([id])=>get(id));
 let previous=null;
 const strip=get('element-strip');
 strip.innerHTML=elements.map(([symbol,name],i)=>'<button type="button" data-z="'+(i+1)+'" aria-label="'+name+', Ordnungszahl '+(i+1)+'" aria-pressed="false"><small>'+(i+1)+'</small>'+symbol+'</button>').join('');
 function draw(p,n,e,shells){
  ctx.clearRect(0,0,360,255);
  const centerX=180, centerY=126;
  const tau=Math.PI*2, ring=(radius)=>{ctx.beginPath();ctx.arc(centerX,centerY,radius,0,tau);ctx.stroke();};
  ctx.strokeStyle='#46638d';ctx.lineWidth=1.5;
  if(shells.length){
   shells.forEach((count,i)=>{
    const r=49+i*21;
    ring(r);
    for(let j=0;j<count;j++){
     const angle=j*tau/count-i*.37-.8;
     point(ctx,centerX+r*Math.cos(angle),centerY+r*Math.sin(angle),5.2,'#82caff');
    }
   });
  }else{
   for(let i=0;i<e;i++)point(ctx,29+(i%11)*30,221+Math.floor(i/11)*17,4.4,'#82caff');
  }
  const total=p+n;
  for(let i=0;i<total;i++){
   const radius=Math.sqrt(i)*5.15;
   const angle=i*2.399963;
   point(ctx,centerX+radius*Math.cos(angle),centerY+radius*Math.sin(angle),4.4,i*p%total<p?'#f4a471':'#c4aaff');
  }
 }
 function update(){
  const [p,n,e]=input.map((field,i)=>{
   get(controls[i][0]+'-value').textContent=field.value;
   return Number(field.value);
  });
  const {symbol,name,mass,charge,shells}=atomState(p,n,e);
  const ion=charge===0?'':(Math.abs(charge)===1?'':Math.abs(charge))+(charge>0?'+':'−');
  const notation=name+'-'+mass+(ion?', Ladung '+ion:'');
  get('isotope-symbol').innerHTML='<span class="nuclide-left"><sup>'+mass+'</sup><sub>'+p+'</sub></span><b>'+symbol+'</b><sup class="nuclide-charge">'+ion+'</sup>';
  get('isotope-symbol').setAttribute('aria-label',notation);
  get('element-name').textContent=notation;
  get('atom-count').textContent=p+' Protonen · '+n+' Neutronen · '+e+' Elektronen';
  get('shell-count').textContent=shells.length?'Elektronen pro Schale · '+shells.join(' | '):'Elektronen als Zählpunkte';
  canvas.setAttribute('aria-label',notation+'. '+get('atom-count').textContent);
  const reference=!previous?'Vorschlag: Vergleiche Kohlenstoff-12 mit Kohlenstoff-13.':
   p!==previous[0]?'Die Protonenzahl hat sich geändert. Du hast ein anderes Element gewählt.':
   n!==previous[1]&&e!==previous[2]?'Massenzahl und Ladung haben sich geändert. Das Element bleibt gleich.':
   n!==previous[1]?'Die Massenzahl hat sich geändert. Das Element bleibt gleich.':
   e!==previous[2]?'Die Ladung hat sich geändert. Das Element bleibt gleich.':get('atom-compare').textContent;
  get('atom-compare').textContent=reference;
  previous=[p,n,e];
  strip.querySelectorAll('[data-z]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.z)===p)));
  draw(p,n,e,shells);
 }
 function load(values){
  values.forEach((value,i)=>{input[i].value=value;});
  update();
 }
 input.forEach(field=>field.addEventListener('input',()=>{preset.value='';update();}));
 preset.addEventListener('change',()=>{if(preset.value)load(preset.value.split(','));});
 get('atom-reset').addEventListener('click',()=>{preset.value='6,6,6';load([6,6,6]);});
 strip.addEventListener('click',event=>{
  const button=event.target.closest('[data-z]');
  if(!button)return;
  input[0].value=button.dataset.z;
  preset.value='';update();
 });
 preset.value='6,6,6';update();
}
const simulations={phase:phaseLab,equation:equationLab,atom:atomLab};


const host=document.querySelector('[data-lab]');
if(host) simulations[host.dataset.lab](host);
const plan=document.querySelector('.print-target');
const preview=plan.querySelector('.paper-preview');
function savePlan(){
 preview.open=true;
 window.print();
}
plan.querySelector('[data-print-plan]').addEventListener('click',savePlan);
const storagePrefix='chemie-plan-'+host.dataset.lab+'-';
for(const box of plan.querySelectorAll('[data-step]')){
 const key=storagePrefix+box.dataset.step;
 try {box.checked=localStorage.getItem(key)==='true';} catch {}
 box.addEventListener('change',()=>{try{localStorage.setItem(key,String(box.checked));}catch{}});
}

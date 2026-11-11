'use strict';
const steps=[
 {action:'dissolve',caption:'Ausgangsgemisch im Becher',alt:'In einem Becher liegen helles Salz und braune Sandkörner.',sand:'Fest, mit dem Salz im Becher.',salt:'Fest, mit dem Sand im Becher.',water:'Noch nicht zugegeben.',hint:'Wasser kann einen der beiden Feststoffe lösen. Dadurch lassen sich die Bestandteile leichter trennen.'},
 {action:'filter',caption:'Nach dem Rühren: Sand unter der Salzlösung',alt:'Brauner Sand liegt unten im Becher, darüber ist klare Salzlösung.',sand:'Ungelöst als Körner im Becher.',salt:'Gelöst im Wasser.',water:'Flüssig im Becher.',hint:'Filterpapier hält ausreichend große ungelöste Körner zurück. Gelöste Ionen gelangen mit dem Wasser hindurch.'},
 {action:'evaporate',caption:'Nach dem Filtrieren: Sand im Filter, Salzlösung im Becher',alt:'Sand bleibt im Filterpapier. Darunter sammelt sich klare Salzlösung im Auffangbecher.',sand:'Als Filterrückstand im Filterpapier.',salt:'Gelöst im Filtrat (Auffangbecher).',water:'Flüssig im Filtrat (Auffangbecher).',hint:'Um das Salz zurückzugewinnen, kannst du Wasser aus der Lösung an die Luft abgeben lassen.'},
 {action:null,caption:'Nach dem Verdunsten: festes Salz in der Schale',alt:'Im Filter bleibt der Sand. In einer flachen Schale liegen weiße Salzkristalle.',sand:'Weiterhin im Filterpapier.',salt:'Fest als Kristalle in der Schale.',water:'Als Wasserdampf in der Umgebungsluft.',hint:'Du hast Sand und Salz getrennt. Erkläre, welche Stoffeigenschaft bei welchem Schritt wichtig war.'},
];
const success={
 dissolve:'Das Speisesalz löst sich im Wasser. Sand bleibt als Feststoff zurück.',
 filter:'Der Sand bleibt im Filterpapier. Gelöstes Salz passiert den Filter mit dem Wasser.',
 evaporate:'Wasser geht in die Luft über. Das Salz bleibt als Kristalle in der Schale zurück.',
};
const guidance={
 '0-filter':'Beide Stoffe liegen noch als Körner vor. Wie kannst du einen Stoff in eine Form bringen, die durch das Filterpapier gelangt?',
 '0-evaporate':'Im trockenen Gemisch gibt es noch kein Wasser, das verdunsten kann.',
 '1-dissolve':'Das Salz ist bereits gelöst. Jetzt möchtest du den ungelösten Sand von der Lösung trennen.',
 '1-evaporate':'Wenn das Wasser jetzt verdunstet, bleibt das Salz wieder beim Sand. Trenne erst den ungelösten Sand ab.',
 '2-dissolve':'Das Salz ist schon in der Flüssigkeit gelöst. Mehr Wasser würde den nächsten Schritt verlängern.',
 '2-filter':'Der Sand ist bereits im Filter. Ein weiterer Filter entfernt das gelöste Salz aus dem Filtrat nicht.',
};
function transition(state,action){
 if(steps[state].action===action&&action)return {state:state+1,message:success[action],good:true};
 return {state,message:guidance[state+'-'+action]??'Das Gemisch ist bereits getrennt.',good:false};
}
const ink='#26496e', water='#92c9f7',sand='#c68b43',salt='#fff',ion='#7450b4';
function shape(ctx,coordinates,fill,stroke=ink,width=3){
 ctx.beginPath();
 coordinates.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));
 if(fill){ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
 if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}
}
function disk(ctx,x,y,r,color){
 ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
}
function grains(ctx,x,y,w,h,count,color,crystals=false){
 for(let i=0;i<count;i++){
  const u=x+((i*157+13)%997)/997*w;
  const v=y+((i*173+41)%991)/991*h;
  if(crystals)shape(ctx,[[u-3,v],[u,v-5],[u+4,v],[u,v+3]],color,'#7587a0',.8);
  else disk(ctx,u,v,2.3+(i%3)*.5,color);
 }
}
function beaker(ctx,x,y,w,h,liquid,solids,ions){
 const floor=y+h;
 if(liquid)shape(ctx,[[x+11,floor-4],[x+6,y+h*.4],[x+w-6,y+h*.4],[x+w-11,floor-4]],water,null);
 shape(ctx,[[x,y],[x+9,floor],[x+w-9,floor],[x+w,y]],null);
 shape(ctx,[[x-5,y],[x+27,y]],null);
 for(let j=1;j<=3;j++)shape(ctx,[[x+w-26,y+30+j*21],[x+w-14,y+30+j*21]],null,'#6f90b0',1.2);
 if(solids)grains(ctx,x+18,floor-21,w-36,14,42,sand);
 if(solids==='mixed')grains(ctx,x+20,floor-31,w-44,22,21,salt,true);
 if(liquid&&ions)grains(ctx,x+25,y+h*.5,w-50,h*.29,22,ion);
}
function funnel(ctx,x,y,w,hasSand){
 shape(ctx,[[x,y],[x+w,y],[x+w*.54,y+80],[x+w*.54,y+118],[x+w*.46,y+118],[x+w*.46,y+80]],'#d9e9fa');
 shape(ctx,[[x+w*.10,y+8],[x+w*.90,y+8],[x+w*.50,y+75]],'#fff','#5f7698',2);
 if(hasSand)grains(ctx,x+w*.30,y+19,w*.40,12,15,sand);
}
function drawPicture(canvas,state,showIons=false){
 const ctx=canvas.getContext('2d');
 ctx.save();ctx.scale(canvas.width/640,canvas.height/390);
 ctx.fillStyle='#eaf1fd';ctx.fillRect(0,0,640,390);
 shape(ctx,[[45,323],[595,323]],null,'#b6c6dd',3);
 if(state<2){
  beaker(ctx,215,84,210,230,state===1,state===0?'mixed':'sand',showIons);
 }else if(state===2){
  funnel(ctx,230,41,180,true);
  disk(ctx,320,172,4,water);
  beaker(ctx,247,184,146,131,true,false,showIons);
 }else{
  funnel(ctx,115,131,110,true);
  shape(ctx,[[91,277],[242,277]],null,'#7589a3',5);
  shape(ctx,[[312,241],[568,241],[535,303],[346,303]],'#d6e7f6');
  shape(ctx,[[319,243],[561,243]],null,'#7594b8',2);
  grains(ctx,359,264,163,22,38,salt,true);
 }
 ctx.restore();
}
const byId=id=>document.getElementById(id);
const picture=byId('separation-picture'), toggle=byId('particles');
let state=0;
function render(){
 const current=steps[state], visibleIons=toggle.checked&&(state===1||state===2);
 drawPicture(picture,state,visibleIons);
 picture.setAttribute('aria-label',current.alt+(visibleIons?' Violette Punkte zeigen gelöste Ionen im Wasser.':''));
 byId('picture-caption').textContent=current.caption;
 byId('hint-text').textContent=current.hint;
 byId('ion-legend').hidden=!visibleIons;
 for(const material of ['sand','salt','water'])byId('where-'+material).textContent=current[material];
}
const actions=[...document.querySelectorAll('[data-action]')];
const feedback=byId('step-feedback');
for(const button of actions)button.addEventListener('click',()=>{
 const result=transition(state,button.dataset.action);
 state=result.state;
 feedback.textContent=result.message+(state===3?' Trennung abgeschlossen.':'');
 feedback.dataset.good=String(result.good);
 render();
});
toggle.addEventListener('change',render);
byId('start-over').addEventListener('click',()=>{
 state=0;
 toggle.checked=false;
 feedback.textContent='Das trockene Gemisch ist wieder im Becher.';
 delete feedback.dataset.good;
 byId('step-hint').open=false;
 render();
});
for(const canvas of document.querySelectorAll('[data-protocol-state]'))drawPicture(canvas,Number(canvas.dataset.protocolState));
byId('separation-print').addEventListener('click',()=>{document.querySelector('.paper-preview').open=true;window.print();});
byId('separation-check').addEventListener('click',()=>{
 const value=document.querySelector('[name=result]:checked')?.value;
 const status=byId('check-feedback');
 status.dataset.correct=String(value==='water');
 status.textContent=!value?'Wähle zuerst eine Antwort.':value==='water'?'Richtig. Das gelöste Salz gelangt mit dem Wasser durch den Filter.':'Überlege, ob das Salz beim Filtrieren fest oder gelöst ist.';
});
for(const box of document.querySelectorAll('[data-step]')){
 const key='chemie-trennlabor-'+box.dataset.step;
 try{box.checked=localStorage.getItem(key)==='true';}catch{}
 box.addEventListener('change',()=>{try{localStorage.setItem(key,String(box.checked));}catch{}});
}
feedback.textContent='Beginne mit dem trockenen Sand-Salz-Gemisch.';
render();

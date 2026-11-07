import { buildActivities, localDate, dateLabel, dayDistance, describeWeather, weatherPrompt, formatTemperature, normalizePlaces, locationLabel, parseForecast, geocodingURL, forecastURL } from './core.mjs';
const $ = id => document.getElementById(id);
const SVG = 'http://www.w3.org/2000/svg';
let model = null, weather = null, places = [], request = null, sequence = 0;
$('date').value = localDate();
for (let i=0; i<26; i++) { const o = document.createElement('option'); o.value=o.textContent=String.fromCharCode(65+i); $('letter').append(o); }
function el(tag, text, cls) { const e=document.createElement(tag); if(text!==undefined)e.textContent=text; if(cls)e.className=cls; return e; }
function vector(tag, attrs={}) { const e=document.createElementNS(SVG,tag); for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v)); return e; }
function svg(w,h,label,cls) { const e=vector('svg',{viewBox:`0 0 ${w} ${h}`,role:'img','aria-label':label}); if(cls)e.setAttribute('class',cls); return e; }
function shape(type,x,y,r=8) {
  const attrs={fill:'none',stroke:'currentColor','stroke-width':1.4};
  if(type==='circle')return vector('circle',{cx:x,cy:y,r,...attrs});
  if(type==='triangle')return vector('path',{d:`M${x} ${y-r} L${x+r} ${y+r} L${x-r} ${y+r} Z`,...attrs});
  return vector('rect',{x:x-r,y:y-r,width:r*2,height:r*2,...attrs});
}
function cloud(x,y,scale=1) { const g=vector('g',{transform:`translate(${x},${y}) scale(${scale})`,fill:'none',stroke:'currentColor','stroke-width':1.4}); g.append(vector('path',{d:'M-20 8 C-34 8 -34 -10 -20 -10 C-16 -29 13 -29 17 -9 C35 -13 38 8 21 8 Z'})); return g; }
function star(x,y,r=10) { let d=''; for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.43:r;d+=`${i?'L':'M'}${x+Math.cos(a)*rr} ${y+Math.sin(a)*rr} `;} return vector('path',{d:d+'Z',fill:'none',stroke:'currentColor','stroke-width':1.3}); }
function illustration(theme) {
  const s=svg(130,85,'A whimsical floating garden','hero-art');
  s.append(cloud(66,39,.9),star(23,20,7),star(110,18,5));
  s.append(vector('path',{d:'M49 48 Q43 70 32 71 M83 47 Q91 68 104 64 M63 47 L60 73 M76 48 L78 69',fill:'none',stroke:'currentColor','stroke-width':1.4}));
  for(const [x,y] of [[32,71],[60,73],[78,69],[104,64]]) s.append(shape('circle',x,y,3));
  for(const x of [59,75])s.append(vector('circle',{cx:x,cy:29,r:1.5,fill:'currentColor'}));
  s.append(vector('path',{d:'M62 36 Q67 40 72 35',fill:'none',stroke:'currentColor','stroke-width':1.3}));
  if(theme.noun==='star')s.append(star(66,6,6));
  return s;
}
function mazeSvg(maze,answer=false) {
  const {cols,rows,cells,solution}=maze, size=20, ox=12, oy=8, w=cols*size+24, h=rows*size+16;
  const s=svg(w,h,answer?'Maze solution':'Find a path from the left entrance to the right exit',answer?'answer-maze':'maze');
  let d=`M${ox} ${oy} H${ox+cols*size} M${ox} ${oy+rows*size} H${ox+cols*size}`;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++) { const i=r*cols+c,x=ox+c*size,y=oy+r*size;
    if(c===0&&r!==0)d+=` M${x} ${y} v${size}`;
    if(c===cols-1&&r!==rows-1)d+=` M${x+size} ${y} v${size}`;
    if(c<cols-1&&!cells[i].includes(i+1))d+=` M${x+size} ${y} v${size}`;
    if(r<rows-1&&!cells[i].includes(i+cols))d+=` M${x} ${y+size} h${size}`;
  }
  s.append(vector('path',{d,fill:'none',stroke:'currentColor','stroke-width':1.1}));
  s.append(vector('path',{d:`M0 ${oy+10} H9 M5 ${oy+6} L9 ${oy+10} L5 ${oy+14}`,fill:'none',stroke:'currentColor'}));
  s.append(star(w-6,oy+(rows-.5)*size,4.5));
  if(answer){ const points=solution.map(i=>`${ox+(i%cols+.5)*size},${oy+(Math.floor(i/cols)+.5)*size}`).join(' ');s.append(vector('polyline',{points,fill:'none',stroke:'#b96538','stroke-width':2,'stroke-linecap':'round','stroke-linejoin':'round'})); }
  return s;
}
function panel(title) { const p=el('section',undefined,'activity');p.append(el('h2',title));return p; }
function line(parent,n=1) { for(let i=0;i<n;i++)parent.append(el('div',undefined,'write-line')); }
function weatherPanel() {
  const p=panel('1. Weather detective');
  if(weather&&weather.date===model.date){p.append(el('p',weather.place,'location'));p.append(el('p',describeWeather(weather.code),'forecast'));p.append(el('p',`High ${formatTemperature(weather.high,$('units').value)} · Low ${formatTemperature(weather.low,$('units').value)}`,'small'));if(weather.rain!==null)p.append(el('p',`Rain chance: ${weather.rain}%`,'small'));}
  else p.append(el('p','No forecast added. Look out the window. What do you notice?'));
  const s=svg(230,50,'Circle what you see: sun, clouds, rain or snow','weather-doodles');
  s.append(shape('circle',26,22,9));for(let i=0;i<8;i++){let a=i*Math.PI/4;s.append(vector('path',{d:`M${26+13*Math.cos(a)} ${22+13*Math.sin(a)} L${26+18*Math.cos(a)} ${22+18*Math.sin(a)}`,stroke:'currentColor'}));}
  for(const x of [86,145,202])s.append(cloud(x,24,.52));
  for(const dx of [-7,0,7])s.append(vector('path',{d:`M${145+dx} 31 l-3 8`,stroke:'currentColor'}));
  for(const dx of [-8,1,10])s.append(star(202+dx,37,2.7));p.append(s,el('div','sun   clouds   rain   snow','weather-choices'));
  p.append(el('p',weather&&weather.date===model.date?weatherPrompt(weather.code,weather.high):'What would you wear or bring outside? Why?','small'));line(p);
  return p;
}
function letterPanel() {
  const p=panel('2. A little letter play');p.append(el('p','Trace big and small. Then try your own.'));
  const s=svg(240,68,`Trace ${model.letter} and ${model.letter.toLowerCase()} three times each`,'trace');
  for(const y of [9,34,59])s.append(vector('line',{x1:0,x2:240,y1:y,y2:y,stroke:'#b6c2bc','stroke-width':.7,'stroke-dasharray':y===34?'2 3':'none'}));
  for(let i=0;i<6;i++){const t=vector('text',{x:4+i*40,y:54,'font-size':44,'font-family':'sans-serif',fill:'none',stroke:'#81938c','stroke-width':.7,'stroke-dasharray':'1.5 2'});t.textContent=i%2?model.letter.toLowerCase():model.letter;s.append(t);}p.append(s);line(p);
  p.append(el('p',model.profile.max<=4?'Can you spot this letter in a book?':model.profile.max<=6?'Draw or name something that starts with this letter.':'Write a silly sentence using three words that start with this letter.','small'));line(p,2);return p;
}
function mazePanel() { const p=panel('3. Follow your curiosity');p.append(el('p','Find your way to the star. Start with a finger.'));p.append(mazeSvg(model.maze));return p; }
function countingPanel() {
  const p=panel('4. Count & discover');p.append(el('p',model.profile.prompt));
  const s=svg(240,95,`${model.profile.count} ${model.theme.plural} to count`,'count-art');
  const n=model.profile.count,cols=n>12?6:n>6?4:n,rows=Math.ceil(n/cols);
  for(let i=0;i<n;i++){const x=20+i%cols*(200/Math.max(cols-1,1)),y=18+Math.floor(i/cols)*(62/Math.max(rows-1,1)); if(model.theme.noun==='cloud')s.append(cloud(x,y,.33));else if(model.theme.noun==='leaf')s.append(vector('path',{d:`M${x-6} ${y+8} Q${x-16} ${y-9} ${x+9} ${y-10} Q${x+14} ${y+9} ${x-6} ${y+8} M${x-6} ${y+8} L${x+6} ${y-7}`,fill:'none',stroke:'currentColor','stroke-width':1.2}));else s.append(star(x,y,9));}
  p.append(s,el('p','My discovery:','small'));line(p,2);return p;
}
function patternPanel() {
  const p=panel('5. What comes next?');p.append(el('p','Find the repeating group. Draw the two missing shapes.'));
  const s=svg(240,58,`Pattern: ${model.pattern.slice(0,6).join(', ')}, blank, blank`,'pattern-art');
  model.pattern.forEach((type,i)=>{if(type)s.append(shape(type,14+i*30,25,8));else s.append(vector('line',{x1:5+i*30,x2:24+i*30,y1:36,y2:36,stroke:'currentColor','stroke-dasharray':'2 2'}));});p.append(s);
  p.append(el('p',model.profile.max<=4?'Make a pattern with claps and taps.':'Invent a pattern of your own. Tell someone the rule.','small'));line(p,2);return p;
}
function storyPanel() {
  const p=panel('6. A kind little story');p.append(el('p',model.theme.story));p.append(el('p',model.profile.feeling));p.append(el('div',undefined,'draw-space'));p.append(el('p',model.profile.stretch,'small'));return p;
}
function settingsMatch() { return model && model.profile.max >= Number($('age').value) && model.date===$('date').value && model.edition===$('edition').value && model.letter===$('letter').value && generatedAge===$('age').value; }
let generatedAge = '';
function render() {
  if(!model)return;
  const sheet=$('placemat');sheet.replaceChildren();const head=el('header',undefined,'sheet-heading');const h=el('div');h.append(el('h1',model.theme.name,'sheet-title'));h.append(el('div',`${dateLabel(model.date)} · ${model.edition==='morning'?'Morning discoveries':'Afternoon adventures'}`,'sheet-meta'));head.append(h,illustration(model.theme));sheet.append(head);
  const grid=el('div',undefined,'sheet-grid');grid.append(weatherPanel(),letterPanel(),mazePanel(),countingPanel(),patternPanel(),storyPanel());sheet.append(grid);
  const foot=el('footer',undefined,'sheet-footer');foot.append(el('span','Placemat Explorers · Listen. Wonder. Try.'));foot.append(el('span',weather&&weather.date===model.date?`Forecast: Open-Meteo · CC BY 4.0 · checked ${weather.fetchedAt.slice(0,10)} UTC`:'Observe the weather with a grown-up.'));sheet.append(foot);
  $('empty').hidden=true;sheet.hidden=false;$('print').disabled=!settingsMatch();$('answers').hidden=false;
  const answers=$('answer-content');answers.replaceChildren(el('p',`Activity level: ${model.profile.label}. Age is used only to choose activities and is not printed.`),el('p',`Count: ${model.answers.count}. Pattern: ${model.answers.pattern.join(', ')}. Creative questions have many good answers.`),el('p','Maze solution:'),mazeSvg(model.maze,true),el('p','Read aloud as needed. Skip, adapt or stop any activity. These broad age bands are not a developmental assessment.'));
}
function status(id,text,error=false){$(id).textContent=text;$(id).classList.toggle('error',error);}
function cancelRequest(){sequence++;request?.abort();request=null;$('search').disabled=false;$('forecast').disabled=false;}
function clearWeather({ city=false, message='Forecast removed. The placemat now uses observation prompts.' }={}) {
  cancelRequest();weather=null;if(city){places=[];$('city').value='';$('place').replaceChildren();$('city-picker').hidden=true;}$('clear-weather').hidden=true;status('weather-status',message);render();
}
async function fetchJSON(url,signal){const response=await fetch(url,{signal,credentials:'omit',referrerPolicy:'no-referrer',cache:'no-store'});if(!response.ok)throw new Error(`Weather service unavailable (${response.status}). Try again later.`);return response.json();}
function startRequest(){cancelRequest();request=new AbortController();return {id:sequence,controller:request};}
$('settings').addEventListener('submit',e=>{e.preventDefault();try{model=buildActivities({age:$('age').value,date:$('date').value,edition:$('edition').value,letter:$('letter').value});generatedAge=$('age').value;render();status('app-status','Your placemat is ready. Preview it, then print or save as PDF.');}catch(err){status('app-status',err.message,true);}});
for(const id of ['age','edition','letter'])$(id).addEventListener('change',()=>{if(model){$('print').disabled=true;status('app-status','Settings changed. Choose “Make my placemat” to update the preview.');}});
$('date').addEventListener('change',()=>{clearWeather({message:'Date changed. Add a fresh forecast for the new date if you want one.'});if(model){$('print').disabled=true;status('app-status','Date changed. Choose “Make my placemat” to update the preview.');}});
$('units').addEventListener('change',render);
$('city').addEventListener('input',()=>{ places=[]; $('place').replaceChildren(); $('city-picker').hidden=true; clearWeather({message:'Search for a city to add its forecast.'}); });
$('place').addEventListener('change',()=>clearWeather({message:'City changed. Choose “Add local forecast” to load this city.'}));
$('clear-weather').addEventListener('click',()=>clearWeather({city:true}));
$('search').addEventListener('click',async()=>{
  clearWeather({message:''});places=[];$('city-picker').hidden=true;$('place').replaceChildren();
  let url;try{url=geocodingURL($('city').value);}catch(err){status('weather-status',err.message,true);return;}
  const {id,controller}=startRequest();$('search').disabled=true;status('weather-status','Searching cities…');const timer=setTimeout(()=>controller.abort(),12000);
  try{const data=await fetchJSON(url,controller.signal);if(id!==sequence)return;places=normalizePlaces(data);if(!places.length)throw new Error('No cities found. Try a nearby town or another spelling.');for(const [i,p] of places.entries()){const o=el('option',locationLabel(p));o.value=String(i);$('place').append(o);}$('city-picker').hidden=false;$('clear-weather').hidden=false;status('weather-status','Choose the matching city, then add its forecast.');}
  catch(err){if(id===sequence)status('weather-status',err.name==='AbortError'?'Search timed out. You can still make a placemat without weather.':err.message,true);}
  finally{clearTimeout(timer);if(id===sequence)$('search').disabled=false;}
});
$('forecast').addEventListener('click',async()=>{
  const place=places[Number($('place').value)],date=$('date').value;weather=null;render();
  try{const distance=dayDistance(localDate(),date);if(distance < 0 || distance > 15)throw new Error('Choose today or one of the next 15 days for a forecast.');if(!place)throw new Error('Search for a city first.');}catch(err){status('weather-status',err.message,true);return;}
  const {id,controller}=startRequest();$('forecast').disabled=true;status('weather-status','Loading local forecast…');const timer=setTimeout(()=>controller.abort(),12000);
  try{const data=await fetchJSON(forecastURL(place),controller.signal);if(id!==sequence)return;weather=parseForecast(data,date,place);$('clear-weather').hidden=false;render();status('weather-status',`Forecast added for ${weather.place}, ${dateLabel(date)}. ${model?'':'Create your placemat to see it.'}`);}
  catch(err){if(id===sequence){weather=null;render();status('weather-status',err.name==='AbortError'?'Forecast timed out. Observation prompts are still available.':err.message,true);}}
  finally{clearTimeout(timer);if(id===sequence)$('forecast').disabled=false;}
});
$('print').addEventListener('click',()=>{if(!model||$('print').disabled)return;window.print();});

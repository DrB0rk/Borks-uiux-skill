import '../skills/b0rks-uiux/assets/components/switch.js';
import '../skills/b0rks-uiux/assets/components/segmented-control.js';
import '../skills/b0rks-uiux/assets/components/select.js';
import '../skills/b0rks-uiux/assets/components/dropdown-menu.js';
import '../skills/b0rks-uiux/assets/components/disclosure.js';

const byId = <T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const sw=byId<HTMLElement&{checked:boolean;label:string;disabled:boolean}>('sw');
const seg=byId<HTMLElement&{options:{value:string;label:string}[];value:string;label:string;disabled:boolean}>('seg');
const sel=byId<HTMLElement&{options:{value:string;label:string}[];value:string;label:string;disabled:boolean}>('sel');
const menu=byId<HTMLElement&{items:{id:string;label:string;destructive?:boolean}[];label:string;disabled:boolean}>('menu');
const disc=byId<HTMLElement&{open:boolean;label:string}>('disc');
seg.options=[{value:'day',label:'Daily'},{value:'week',label:'Weekly'},{value:'month',label:'Monthly'}];
sel.options=[{value:'low',label:'Low'},{value:'medium',label:'Medium'},{value:'high',label:'High'}];
menu.items=[{id:'copy',label:'Duplicate project'},{id:'share',label:'Share project'},{id:'archive',label:'Archive',destructive:true}];
const names:Record<string,HTMLElement>={sw,seg,sel,menu,disc};
const eventLog=byId<HTMLOListElement>('log');
for(const [id,event] of Object.entries({sw:'checked-change',seg:'value-change',sel:'value-change',menu:'action',disc:'open-change'})){
 names[id].addEventListener(event,e=>{
  const detail=(e as CustomEvent).detail;
  byId<HTMLOutputElement>('state-'+id).textContent=JSON.stringify(detail);
  const li=document.createElement('li');li.textContent=id+' '+event+' '+JSON.stringify(detail);eventLog.prepend(li);
  while(eventLog.children.length>8)eventLog.lastChild?.remove();
 });
}
const target=byId<HTMLSelectElement>('target'),label=byId<HTMLInputElement>('label'),disabled=byId<HTMLInputElement>('disabled');
function sync(){const el=names[target.value] as HTMLElement&{label:string;disabled?:boolean};label.value=el.label;disabled.checked=!!el.disabled;disabled.disabled=!('disabled'in el);}
target.addEventListener('change',sync);
label.addEventListener('input',()=>{(names[target.value] as typeof sw).label=label.value});
disabled.addEventListener('change',()=>{(names[target.value] as typeof sw).disabled=disabled.checked});
byId<HTMLInputElement>('accent').addEventListener('input',e=>document.documentElement.style.setProperty('--b0x-accent',(e.target as HTMLInputElement).value));
byId<HTMLInputElement>('radius').addEventListener('input',e=>document.documentElement.style.setProperty('--b0x-radius',(e.target as HTMLInputElement).value+'px'));
byId<HTMLButtonElement>('theme').addEventListener('click',()=>document.documentElement.classList.toggle('dark'));
byId<HTMLButtonElement>('density').addEventListener('click',()=>document.documentElement.classList.toggle('compact'));
byId<HTMLButtonElement>('clear').addEventListener('click',()=>eventLog.replaceChildren());
sync();
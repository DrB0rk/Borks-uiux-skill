/** Native select interaction example. Set .options array; event value-change. Not form-associated. */
export type SelectOption={value:string;label:string;disabled?:boolean};
export class B0xSelect extends HTMLElement{
 static observedAttributes=['value','label','placeholder','disabled','required'];private control:HTMLSelectElement;private text:HTMLElement;private data:SelectOption[]=[];
 constructor(){super();const r=this.attachShadow({mode:'open'});r.innerHTML=`<style>:host{display:inline-block;font:inherit;color:var(--b0x-fg,inherit)}label{display:grid;gap:6px}span{font-weight:600;font-size:.85em}select{font:inherit;min-height:44px;min-width:170px;border:1px solid var(--b0x-border,#bdc6d2);border-radius:var(--b0x-radius,10px);padding:8px 12px;background:var(--b0x-surface,white);color:inherit}select:focus-visible{outline:3px solid var(--b0x-focus,#2868d9)}</style><label><span></span><select part="select"></select></label>`;this.control=r.querySelector('select')!;this.text=r.querySelector('span')!;this.control.addEventListener('change',()=>{this.value=this.control.value;this.dispatchEvent(new CustomEvent('value-change',{detail:{value:this.value},bubbles:true,composed:true}))});this.sync()}
 get options(){return this.data.map(o=>({...o}))}set options(v:SelectOption[]){this.data=v.map(o=>({...o}));this.render()}
 get value(){return this.getAttribute('value')??''}set value(v:string){this.setAttribute('value',v)}
 get label(){return this.getAttribute('label')??'Choose an option'}set label(v:string){this.setAttribute('label',v)}
 get placeholder(){return this.getAttribute('placeholder')??'Choose…'}set placeholder(v:string){this.setAttribute('placeholder',v)}
 get disabled(){return this.hasAttribute('disabled')}set disabled(v:boolean){this.toggleAttribute('disabled',v)}
 get required(){return this.hasAttribute('required')}set required(v:boolean){this.toggleAttribute('required',v)}
 attributeChangedCallback(name:string){if(name==='placeholder')this.render();else this.sync()}
 private render(){const items=[{value:'',label:this.placeholder},...this.data];this.control.replaceChildren(...items.map(o=>{const e=document.createElement('option');e.value=o.value;e.textContent=o.label;e.disabled=!!('disabled'in o&&o.disabled);return e}));this.sync()}
 private sync(){this.text.textContent=this.label;this.control.disabled=this.disabled;this.control.required=this.required;this.control.value=this.value}
}
if(!customElements.get('b0x-select'))customElements.define('b0x-select',B0xSelect);

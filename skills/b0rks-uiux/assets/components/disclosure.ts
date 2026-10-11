/** Native <details> disclosure. Attributes: label/open; event open-change. */
export class B0xDisclosure extends HTMLElement {
 static observedAttributes=['label','open'];private details:HTMLDetailsElement;private title:HTMLElement;
 constructor(){super();const r=this.attachShadow({mode:'open'});r.innerHTML=`<style>:host{display:block;font:inherit;color:var(--b0x-fg,inherit)}details{border:1px solid var(--b0x-border,#bbc5d2);border-radius:var(--b0x-radius,10px);background:var(--b0x-surface,white)}summary{min-height:44px;box-sizing:border-box;padding:12px 15px;cursor:pointer;font-weight:600}summary:focus-visible{outline:3px solid var(--b0x-focus,#2868d9)}.body{padding:0 15px 12px}@media(forced-colors:active){summary:focus-visible{outline-color:Highlight}}</style><details><summary part="trigger"></summary><div part="content" class="body"><slot></slot></div></details>`;this.details=r.querySelector('details')!;this.title=r.querySelector('summary')!;this.details.addEventListener('toggle',()=>{if(this.open===this.details.open)return;this.open=this.details.open;this.dispatchEvent(new CustomEvent('open-change',{detail:{open:this.open},bubbles:true,composed:true}))});this.sync()}
 get open(){return this.hasAttribute('open')}set open(v:boolean){this.toggleAttribute('open',v)}
 get label(){return this.getAttribute('label')??'Details'}set label(v:string){this.setAttribute('label',v)}
 attributeChangedCallback(){this.sync()}private sync(){this.details.open=this.open;this.title.textContent=this.label}
}
if(!customElements.get('b0x-disclosure'))customElements.define('b0x-disclosure',B0xDisclosure);

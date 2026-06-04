
(function(){
const DATA = window.ASM_DATA;
const state = { cards:{}, modal:{}, galleries:{} };
const $ = (s, r=document)=>r.querySelector(s);
const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));}

function productById(id){return DATA.products.find(p=>p.id===id);}
function themeClass(t){return t;}
function renderCard(p){
 const opt = p.cardOptions[0]; state.cards[p.id]=opt.id;
 return `<article class="product-card" data-id="${p.id}" data-cat="${p.category}" data-theme="${p.theme}">
 <span class="badge">${esc(p.badge)}</span>
 <h3 class="card-title">${esc(p.title)}<br>${esc(p.subtitle)}</h3>
 <div class="cover">${p.cover?`<img src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy">`:""}</div>
 <div class="card-copy">${p.summary.map(x=>`<p>${x}</p>`).join("")}</div>
 <div class="purchase-zone">
 <div class="selector-title">${esc(p.selectorLabel)}</div>
 <div class="option-buttons">${p.cardOptions.map((o,i)=>`<button class="${i===0?'active':''}" ${o.disabled?'disabled':''} onclick="ASM.selectCard('${p.id}','${o.id}')">${esc(o.label)}</button>`).join("")}</div>
 <div class="price" id="price-${p.id}">${esc(opt.price)} <span style="font-size:10px">MXN</span></div>
 <div class="note" id="note-${p.id}">${esc(opt.note)}</div>
 <div class="card-actions"><button class="btn" onclick="ASM.openModal('${p.id}')">VER DETALLES</button><a class="btn" id="wa-${p.id}" href="${opt.wa}" target="_blank">PEDIR AHORA</a></div>
 </div></article>`;
}
function galleryImages(p){
 if(p.sizeSelector?.type==="dynamic"){
   const first = Object.keys(p.sizeSelector.options)[0];
   return p.sizeSelector.options[first].gallery || [];
 }
 return p.gallery || [];
}
function selectorHTML(p){
 if(p.sizeSelector?.type==="fixed"){
   return `<div class="selector-box"><p>${esc(p.sizeSelector.label)}</p><div class="option-buttons">${p.sizeSelector.buttons.map(b=>`<button class="${b.active?'active':''}" ${b.disabled?'disabled':''}>${esc(b.label)}</button>`).join("")}</div><div class="desc-box"><strong>${esc(p.sizeSelector.title)}</strong><p>${esc(p.sizeSelector.desc)}</p></div></div>`;
 }
 if(p.sizeSelector?.type==="dynamic"){
   const keys=Object.keys(p.sizeSelector.options); const first=keys[0]; state.modal[p.id]=first;
   const info=p.sizeSelector.options[first];
   return `<div class="selector-box"><p>${esc(p.sizeSelector.label)}</p><div class="option-buttons">${keys.map((k,i)=>`<button class="${i===0?'active':''}" onclick="ASM.selectModal('${p.id}','${k}')">${esc(p.sizeSelector.options[k].label)}</button>`).join("")}</div><div class="desc-box"><strong id="mdesc-title-${p.id}">${esc(info.title)}</strong><p id="mdesc-text-${p.id}">${esc(info.desc)}</p></div></div>`;
 }
 if(p.optionSelector){
   const keys=Object.keys(p.optionSelector.options); const first=keys[0]; state.modal[p.id]=first;
   const info=p.optionSelector.options[first];
   return `<div class="selector-box"><p>${esc(p.optionSelector.label)}</p><div class="option-buttons">${keys.map((k,i)=>`<button class="${i===0?'active':''}" onclick="ASM.selectModal('${p.id}','${k}')">${esc(p.optionSelector.options[k].label)}</button>`).join("")}</div><div class="desc-box"><strong id="mdesc-title-${p.id}">${esc(info.title)}</strong><p id="mdesc-text-${p.id}">${esc(info.desc)}</p></div></div>`;
 }
 return "";
}
function renderModal(p){
 const imgs = galleryImages(p); state.galleries[p.id]=0;
 return `<div class="modal-overlay" id="modal-${p.id}"><div class="modal-box" data-theme="${p.theme}">
 <button class="btn close" onclick="ASM.closeModal()">✕ CERRAR</button>
 <span class="modal-badge">${esc(p.badge)}</span><h2 class="modal-title">${esc(p.title)}<br>${esc(p.subtitle)}</h2>
 ${selectorHTML(p)}
 <div class="gallery" id="gallery-${p.id}">
   <div class="gallery-view">${imgs[0]?`<img id="gimg-${p.id}" src="${esc(imgs[0])}" alt="${esc(p.title)}" onclick="ASM.openLightbox(this.src)">`:""}</div>
   <button class="gbtn gprev" onclick="ASM.prevImg('${p.id}')">◀</button><button class="gbtn gnext" onclick="ASM.nextImg('${p.id}')">▶</button>
 </div><div class="dots" id="dots-${p.id}">${imgs.map((_,i)=>`<button class="dot ${i===0?'active':''}" onclick="ASM.goImg('${p.id}',${i})"></button>`).join("")}</div>
 ${p.modalIntro?`<p class="modal-intro-copy">${esc(p.modalIntro)}</p>`:""}
 <div class="modal-grid">${p.sections.map(s=>`<section class="modal-section"><h4>${esc(s.title)}</h4><ul>${s.items.map(i=>`<li>${esc(i)}</li>`).join("")}</ul></section>`).join("")}</div>
 <div class="price-cards">${p.priceCards.map(c=>`<div class="price-card" data-option="${esc(c.id||'')}"><h4>${esc(c.title)}</h4><p>${esc(c.desc)}</p><strong>${esc(c.price)}</strong><a class="btn" href="${c.wa}" target="_blank">${esc(c.button)}</a></div>`).join("")}</div>
 </div></div>`;
}
function currentImages(id){
 const p=productById(id);
 if(p.sizeSelector?.type==="dynamic"){
   const key=state.modal[id] || Object.keys(p.sizeSelector.options)[0];
   return p.sizeSelector.options[key].gallery || [];
 }
 return p.gallery || [];
}
function refreshGallery(id){
 const imgs=currentImages(id); let idx=state.galleries[id]||0; if(idx>=imgs.length) idx=0; state.galleries[id]=idx;
 const img=$(`#gimg-${id}`); if(img&&imgs[idx]) img.src=imgs[idx];
 const dots=$$(`#dots-${id} .dot`); dots.forEach((d,i)=>d.classList.toggle("active",i===idx));
}
window.ASM={
 init(){
  $("#productsGrid").innerHTML=DATA.products.map(renderCard).join("");
  $("#modalRoot").innerHTML=DATA.products.map(renderModal).join("");
  function applyFilter(f){
    $$(".product-card").forEach(c=>c.style.display=(c.dataset.cat===f)?"flex":"none");
  }
  $$(".tab").forEach(b=>b.addEventListener("click",()=>{if(b.disabled)return; $$(".tab").forEach(x=>x.classList.remove("active")); b.classList.add("active"); applyFilter(b.dataset.filter);}));
  applyFilter("pedestales");
 },
 selectCard(id,optId){
  const p=productById(id); const opt=p.cardOptions.find(o=>o.id===optId); if(!opt)return; state.cards[id]=optId;
  const card=$(`.product-card[data-id="${id}"]`); $$(".option-buttons button",card).forEach((b,i)=>b.classList.toggle("active",p.cardOptions[i].id===optId));
  $(`#price-${id}`).innerHTML=esc(opt.price)+' <span style="font-size:10px">MXN</span>'; $(`#note-${id}`).textContent=opt.note; $(`#wa-${id}`).href=opt.wa;
 },
 selectModal(id,optId){
  const p=productById(id); state.modal[id]=optId; state.galleries[id]=0;
  const modal=$(`#modal-${id}`); $$(".selector-box .option-buttons button",modal).forEach(b=>b.classList.remove("active")); const buttons=$$(".selector-box .option-buttons button",modal); const keys=p.sizeSelector?.type==="dynamic"?Object.keys(p.sizeSelector.options):p.optionSelector?Object.keys(p.optionSelector.options):[]; buttons.forEach((b,i)=>b.classList.toggle("active",keys[i]===optId));
  const info=p.sizeSelector?.type==="dynamic"?p.sizeSelector.options[optId]:p.optionSelector?p.optionSelector.options[optId]:null;
  if(info){$(`#mdesc-title-${id}`).textContent=info.title;$(`#mdesc-text-${id}`).textContent=info.desc;}
  if(p.sizeSelector?.type==="dynamic"){ const dots=$(`#dots-${id}`); dots.innerHTML=currentImages(id).map((_,i)=>`<button class="dot ${i===0?'active':''}" onclick="ASM.goImg('${id}',${i})"></button>`).join(""); refreshGallery(id);}
 },
 openModal(id){$(`#modal-${id}`).classList.add("open");document.body.style.overflow="hidden";},
 closeModal(){$$(".modal-overlay").forEach(m=>m.classList.remove("open"));document.body.style.overflow="";},
 goImg(id,i){state.galleries[id]=i;refreshGallery(id);},
 nextImg(id){const imgs=currentImages(id);state.galleries[id]=((state.galleries[id]||0)+1)%Math.max(imgs.length,1);refreshGallery(id);},
 prevImg(id){const imgs=currentImages(id);state.galleries[id]=((state.galleries[id]||0)-1+Math.max(imgs.length,1))%Math.max(imgs.length,1);refreshGallery(id);},
 openLightbox(src){const lb=$("#lightbox");$("img",lb).src=src;lb.hidden=false;},
 closeLightbox(){$("#lightbox").hidden=true;}
};
document.addEventListener("DOMContentLoaded",ASM.init);
document.addEventListener("click",e=>{if(e.target.classList.contains("modal-overlay")) ASM.closeModal();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){ASM.closeModal();ASM.closeLightbox();}});
})();

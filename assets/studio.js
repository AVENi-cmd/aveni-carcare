'use strict';
const serviceData = {
  ppf: {name:'حماية PPF',icon:'shield'},
  tint: {name:'عازل حراري',icon:'window'},
  ceramic: {name:'نانو سيراميك',icon:'drop'}
};
const brand = (new URLSearchParams(location.search).get('brand') || '').trim().slice(0,60);
if(brand){document.querySelectorAll('[data-brand]').forEach(el=>el.textContent=brand);document.title=brand+' | حماية وعناية السيارات';}
const menu = document.querySelector('.menu');
const navigation = document.getElementById('navigation');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','فتح القائمة');navigation.classList.remove('open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'إغلاق القائمة':'فتح القائمة');navigation.classList.toggle('open',open);});
navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{
 if(e.key==='Escape' && menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}
});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
const desktopNavigation=window.matchMedia('(min-width:1001px)');
desktopNavigation.addEventListener('change',()=>closeMenu());
const header=document.querySelector('.site-header');
function updateHeaderOffset(){document.documentElement.style.setProperty('--header-height',header.getBoundingClientRect().height+'px');}
updateHeaderOffset();
if('ResizeObserver' in window)new ResizeObserver(updateHeaderOffset).observe(header);
else window.addEventListener('resize',updateHeaderOffset);
const coverage={
 partial:{title:'حماية الواجهة الجزئية',text:'٥٠ سم على الكبوت، الصدام الأمامي كامل، نصف الرفارف الأمامية، حواف الأبواب وتحت المقابض.'},
 front:{title:'حماية الواجهة الكاملة',text:'الكبوت كامل، الصدام الأمامي كامل، الرفارف الأمامية كاملة، حواف الأبواب وتحت المقابض.'},
 full:{title:'حماية كاملة للسيارة',text:'حماية شاملة لجميع أجزاء السيارة الخارجية بالكامل، بما فيها الكبوت والسقف والشنطة والصدامات والرفارف والأبواب والمرايا وبقية التفاصيل الخارجية.'}
};
document.querySelectorAll('[data-coverage]').forEach(button=>button.addEventListener('click',()=>{
 const mode=button.dataset.coverage;
 document.querySelectorAll('[data-coverage]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.getElementById('coverageCar').dataset.mode=mode;
 document.getElementById('coverageTitle').textContent=coverage[mode].title;
 document.getElementById('coverageText').textContent=coverage[mode].text;
 document.getElementById('diagramTitle').textContent='مثال تغطية حماية PPF: '+coverage[mode].title;
 updatePackageSummary();
}));
const radios=[...document.querySelectorAll('input[name="service"]')];
function updatePackageSummary(){
 const summary=document.getElementById('selectedPackage');
 summary.hidden=!radios.find(input=>input.checked && input.value==='ppf');
 summary.textContent=coverage[document.getElementById('coverageCar').dataset.mode].title;
}
function selectService(key){
 if(!serviceData[key])return;
 radios.forEach(input=>input.checked=input.value===key);
 document.getElementById('selectedName').textContent=serviceData[key].name;
 document.querySelector('#selectedIcon use').setAttribute('href','#icon-'+serviceData[key].icon);
 updatePackageSummary();
}
radios.forEach(input=>input.addEventListener('change',()=>selectService(input.value)));
document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>selectService(a.dataset.service)));
const dateField=document.getElementById('date');
function updateDateMinimum(){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const part=type=>parts.find(x=>x.type===type).value;
 dateField.min=`${part('year')}-${part('month')}-${part('day')}`;
}
updateDateMinimum();
dateField.addEventListener('focus',updateDateMinimum);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateDateMinimum();});
window.addEventListener('pageshow',()=>{
 updateDateMinimum();
 selectService(radios.find(input=>input.checked)?.value||'ppf');
});
const form=document.getElementById('bookingForm');
const vehicle=document.getElementById('vehicle');
vehicle.addEventListener('input',()=>vehicle.setCustomValidity(''));
const dialog=document.getElementById('messageDialog');
form.addEventListener('submit',event=>{
 event.preventDefault();
 updateDateMinimum();
 vehicle.setCustomValidity(vehicle.value.trim()?'':'اكتب نوع السيارة والموديل.');
 if(!form.reportValidity())return;
 const key=radios.find(input=>input.checked).value;
 const priority=document.getElementById('priority').value.trim();
 const time=document.getElementById('time').value;
 const lines=[`السلام عليكم، أرغب بطلب موعد لدى ${brand||'مركزكم'}.`,`الخدمة: ${serviceData[key].name}`,`السيارة: ${vehicle.value.trim()}`];
 if(key==='ppf')lines.push('الباقة: '+coverage[document.getElementById('coverageCar').dataset.mode].title);
 if(dateField.value){const [year,month,day]=dateField.value.split('-');lines.push(`التاريخ المقترح: ${day}/${month}/${year}`);}
 if(time)lines.push('الفترة: '+time);
 if(priority)lines.push('تفاصيل إضافية: '+priority);
 lines.push('أرجو توضيح الخامات المتاحة ونطاق الخدمة والسعر وتأكيد التوفر. شكرًا.');
 document.getElementById('messagePreview').textContent=lines.join('\n');
 document.getElementById('copyStatus').textContent='';
 dialog.showModal();
 document.body.classList.add('dialog-open');
});
dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
document.getElementById('copyRequest').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(document.getElementById('messagePreview').textContent);document.getElementById('copyStatus').textContent='تم نسخ الطلب.';}
 catch{document.getElementById('copyStatus').textContent='تعذر النسخ التلقائي. اضغط مطولًا على الرسالة لنسخها.';}
});

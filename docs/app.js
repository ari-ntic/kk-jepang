(()=>{
const form=document.querySelector('#kk-form'),members=document.querySelector('#members');let current=0,serial=0,timer,pdfNumber=0;
const household=[['kk','Nomor KK','text',true,'16 digit sesuai KK'],['head','Nama kepala keluarga','text',true,'Nama Latin sesuai KK'],['address','Alamat','text',true,'Jangan menerjemahkan nama jalan',true],['rt','RT / RW','text',true,'Contoh: 001/002'],['postcode','Kode pos','text',true,'5 digit'],['village','Desa / Kelurahan','text',true],['district','Kecamatan','text',true],['city','Kabupaten / Kota','text',true],['province','Provinsi','text',true]];
const issue = [
  ['issuedate','Tanggal dikeluarkan','date',true],
  ['official','Nama pejabat','text',false,'Opsional, salin jika tercantum'],
  ['nip','NIP pejabat','text',false,'Opsional, simpan angka nol di depan']
];
const defs=[['relationship','Hubungan dalam keluarga','select',true,'Pilih dahulu agar isian otomatis mengikuti hubungan.',true],['name','Nama lengkap','text',true],['nik','NIK','text',true,'16 digit'],['sex','Jenis kelamin','select',true],['birthplace','Tempat lahir','text',true],['birthdate','Tanggal lahir','date',true],['religion','Agama','select',true],['education','Pendidikan','select',true],['job','Jenis pekerjaan','select',true],['blood','Golongan darah','select',true],['marital','Status perkawinan','select',true],['marriagedate','Tanggal perkawinan','date',false,'Kosongkan jika sumber berisi tanda —'],['citizenship','Kewarganegaraan','select',true],['country','Negara kewarganegaraan','text',false,'Wajib untuk WNA'],['passport','Nomor paspor','text',false],['kitap','Nomor KITAP','text',false],['father','Nama ayah','text',false,'Sesuai KK; boleh kosong jika —'],['mother','Nama ibu','text',false,'Sesuai KK; boleh kosong jika —']];
function field(def,prefix){const [key,label,type,req,hint,wide]=def,el=document.createElement('label');el.className='field'+(wide?' wide':'');const caption=document.createElement('span');caption.textContent=label;if(req){const a=document.createElement('span');a.className='required';a.textContent=' *';caption.append(a);}el.append(caption);const input=document.createElement(type==='select'?'select':'input');input.name=key;input.id=`${prefix}-${key}`;input.required=!!req;if(type==='select'){input.add(new Option('Pilih sesuai KK',''));for(const [id] of KK_TERMS[key])input.add(new Option(id,id));if(['job','religion','education'].includes(key))input.add(new Option('Istilah lain / terjemahan manual','__other'));}else{input.type=type;input.maxLength=key==='address'?180:80;}
if(['kk','nik'].includes(key)){input.inputMode='numeric';input.pattern='[0-9]{16}';input.maxLength=16;input.title='Masukkan tepat 16 digit angka.';}if(key==='postcode'){input.inputMode='numeric';input.pattern='[0-9]{5}';input.maxLength=5;}if(type==='date')input.max=new Date().toLocaleDateString('sv-SE');el.append(input);if(type==='date')KKDates.attach(input);if(key==='province')input.setAttribute('list','province-suggestions');const small=document.createElement('small');small.dataset.hint=hint||' ';small.textContent=hint||' ';el.append(small);if(type==='select')input.addEventListener('change',()=>{small.textContent=input.value==='__other'?'Isi istilah sumber dan padanan Jepang di bawah.':input.value?`Bahasa Jepang: ${kkTranslate(key,input.value)}`:' ';const extra=el.parentElement.querySelector(`[data-custom="${key}"]`);if(extra){extra.hidden=input.value!=='__other';for(const n of extra.querySelectorAll('input'))n.required=input.value==='__other';}if(key==='citizenship'){const country=el.parentElement.querySelector('[name="country"]');country.required=input.value==='WNA';country.closest('label').hidden=input.value!=='WNA';}});return el;}
for(const d of household)document.querySelector('#household-fields').append(field(d,'h'));for(const d of issue)document.querySelector('#issue-fields').append(field(d,'h'));
function addMember(values={}){if(members.children.length>=10)return;if(!members.children.length&&!values.relationship)values={...values,relationship:'Kepala Keluarga'};const id=++serial,card=document.createElement('details');card.className='member-card';card.open=true;const sum=document.createElement('summary');card.append(sum);const body=document.createElement('div');body.className='member-body';const fs=document.createElement('div');fs.className='fields';for(const d of defs){fs.append(field(d,`m${id}`));if(['job','religion','education'].includes(d[0])){const extra=document.createElement('div');extra.className='fields field wide';extra.dataset.custom=d[0];extra.hidden=true;extra.append(field([d[0]+'Original','Istilah Indonesia pada KK','text',false],`m${id}`),field([d[0]+'Japanese','Padanan bahasa Jepang','text',false,'Isi terjemahan yang sudah diperiksa'],`m${id}`));fs.append(extra);}}body.append(fs);const actions=document.createElement('div');actions.className='member-actions';const remove=document.createElement('button');remove.type='button';remove.className='text-button remove';remove.textContent='Hapus anggota';remove.onclick=()=>{if(members.children.length===1){message('Minimal satu anggota keluarga.');return;}if(confirm('Hapus anggota ini dari form?')){card.remove();syncFamily();}};actions.append(remove);body.append(actions);card.append(body);members.append(card);for(const el of card.querySelectorAll('input,select')){if(values[el.name]!==undefined)el.value=values[el.name];if(el.tagName==='SELECT')el.dispatchEvent(new Event('change'));}card.querySelector('[name="country"]').closest('label').hidden=values.citizenship!=='WNA';syncFamily();}
function updateCount(){[...members.children].forEach((card,i)=>{card.querySelector('summary').textContent=`${String(i+1).padStart(2,'0')} · ${card.querySelector('[name="relationship"]').value||'Pilih hubungan'} — ${card.querySelector('[name="name"]').value||'Anggota keluarga'}`;});document.querySelector('#member-count').textContent=`${members.children.length} / 10 anggota`;document.querySelector('#add-member').disabled=members.children.length>=10;}
function message(s){const box=document.querySelector('#message');box.textContent=s;box.hidden=false;clearTimeout(timer);timer=setTimeout(()=>box.hidden=true,6500);}
function valid(section){for(const el of section.querySelectorAll('input,select')){if(el.closest('[hidden]')||el.dataset.datePart)continue;if(el.required&&!el.value.trim())el.setCustomValidity('Kolom ini wajib diisi.');if(!el.checkValidity()){const card=el.closest('details');if(card)card.open=true;el.reportValidity();return false;}}return true;}
function rawCollect(){const h={};for(const el of document.querySelector('#step-0').querySelectorAll('input'))if(el.name)h[el.name]=el.value.trim();const list=[...members.children].map(card=>{const m={};for(const el of card.querySelectorAll('input,select'))if(el.name)m[el.name]=el.value.trim();return m;});return {household:h,members:list};}
// Nama orang tua anak diisi sebagai saran; perubahan manual dipertahankan.
for (const event of ['input', 'change']) {
 members.addEventListener(event, e => {
  if (e.isTrusted && ['father', 'mother'].includes(e.target.name)) {
   e.target.dataset.parentManual = 'true';
  }
 });
}
function suggestChildParents() {
 const cards = [...members.children];
 const value = (card, key) => card.querySelector(`[name="${key}"]`).value.trim();
 const heads = cards.filter(card => value(card, 'relationship') === 'Kepala Keluarga');
 const partners = cards.filter(card => ['Suami', 'Istri'].includes(value(card, 'relationship')));
 if (heads.length !== 1 || partners.length !== 1) return;
 const head = heads[0], partner = partners[0];
 const headName = document.querySelector('#h-head').value.trim();
 const partnerName = value(partner, 'name');
 let father = '', mother = '';
 if (value(head, 'sex') === 'Laki-laki' && value(partner, 'relationship') === 'Istri' && value(partner, 'sex') === 'Perempuan') {
  father = headName; mother = partnerName;
 } else if (value(head, 'sex') === 'Perempuan' && value(partner, 'relationship') === 'Suami' && value(partner, 'sex') === 'Laki-laki') {
  father = partnerName; mother = headName;
 } else return;
 for (const card of cards) {
  if (value(card, 'relationship') !== 'Anak') continue;
  for (const [key, suggestion] of [['father', father], ['mother', mother]]) {
   const input = card.querySelector(`[name="${key}"]`);
   if (input.dataset.parentManual === 'true') continue;
   if (input.value && input.dataset.parentAuto !== 'true') continue;
   input.value = suggestion;
   input.dataset.parentAuto = 'true';
  }
 }
}
function syncFamily(){
 suggestChildParents();
 const data=rawCollect(),state=KKFamily.reconcile(data.household,data.members);
 for(const el of form.querySelectorAll('input,select'))el.setCustomValidity('');
 for(const error of members.querySelectorAll('.field-error'))error.remove();
 [...members.children].forEach((card,i)=>{
  for(const key of ['name','marital','marriagedate','country']){
   const input=card.querySelector(`[name="${key}"]`),locked=!!state.locks[i][key];
   const automaticValue=key==='name'?locked:key==='country'?state.members[i].citizenship!=='WNA':true;
   if(automaticValue&&input.value!==state.members[i][key])input.value=state.members[i][key]||'';
   if(input.tagName==='SELECT')input.disabled=locked;else input.readOnly=locked;
   input.classList.toggle('auto-field',locked);
   const small=input.closest('label').querySelector('small');
   small.textContent=state.notes[i][key]||(input.tagName==='SELECT'&&input.value?`Bahasa Jepang: ${kkTranslate(key,input.value)}`:small.dataset.hint);
   small.classList.toggle('auto-hint',locked);
  }
  const role=card.querySelector('[name="relationship"]');
  role.querySelector('option[value="Kepala Keluarga"]').disabled=state.headIndex>=0&&state.headIndex!==i;
  role.closest('label').querySelector('small').textContent=(role.value?`Bahasa Jepang: ${kkTranslate('relationship',role.value)}`:' ')+(role.value!=='Kepala Keluarga'&&state.headIndex>=0?'. Kepala Keluarga sudah dipilih pada anggota lain.':'');
 });
 for(const issue of state.issues){const input=members.children[issue.index].querySelector(`[name="${issue.key}"]`);input.setCustomValidity(issue.message);const error=document.createElement('small');error.className='field-error';error.textContent=issue.message;input.closest('label').append(error);}
 KKDates.refresh(form);updateCount();return {household:data.household,...state};
}
function collect(){const state=syncFamily();return {household:state.household,members:state.members};}
function validateMembers(){const state=syncFamily();if(!valid(document.querySelector('#step-1')))return false;
 if(state.headCount!==1){message('Pilih tepat satu anggota sebagai Kepala Keluarga, sesuai KK.');return false;}
 if(state.issues.length){const issue=state.issues[0],card=members.children[issue.index];card.open=true;card.querySelector(`[name="${issue.key}"]`).focus();message(`Anggota ${issue.index+1}: ${issue.message}`);return false;}
 for(const [i,m] of state.members.entries())for(const k of ['job','religion','education'])if(m[k]==='__other'&&!/[\u3040-\u30ff\u3400-\u9fff]/.test(m[k+'Japanese'])){message(`Padanan ${k==='job'?'pekerjaan':k==='religion'?'agama':'pendidikan'} anggota ${i+1} harus berisi teks Jepang.`);return false;}
 return true;}
async function go(step){if(step>0&&!valid(document.querySelector('#step-0')))return;if(step===2&&!validateMembers()){if(current!==1)show(1);return;}if(step===2){try{pdfNumber++;await KKVocabulary.ready();await document.fonts.ready;KKPreview.render(collect());KKDocument.render(document.querySelector('#preview'),collect());document.querySelector('#reviewed').checked=false;document.querySelector('#download').disabled=true;document.querySelector('#download-status').textContent='';}catch(e){message(e.message);return;}}show(step);}
function show(step){current=step;for(let i=0;i<3;i++)document.querySelector(`#step-${i}`).hidden=i!==step;for(const b of document.querySelectorAll('[data-step]')){b.classList.toggle('active',Number(b.dataset.step)===step);b.setAttribute('aria-current',Number(b.dataset.step)===step?'step':'false');}document.querySelector('.steps').scrollIntoView({behavior:'smooth',block:'start'});}
form.addEventListener('submit',e=>e.preventDefault());for(const event of ['input','change'])form.addEventListener(event,e=>{if(e.target.closest('#step-0, #members')){pdfNumber++;syncFamily();document.querySelector('#reviewed').checked=false;document.querySelector('#download').disabled=true;}});document.querySelector('#add-member').onclick=()=>addMember();document.querySelector('#next-household').onclick=()=>{syncFamily();go(1);};document.querySelector('#next-members').onclick=()=>go(2);for(const b of document.querySelectorAll('[data-step]'))b.onclick=()=>go(Number(b.dataset.step));for(const b of document.querySelectorAll('[data-back]'))b.onclick=()=>show(Number(b.dataset.back));document.querySelector('#reviewed').onchange=e=>document.querySelector('#download').disabled=!e.target.checked;
document.querySelector('#download').onclick=()=>{if(!document.querySelector('#reviewed').checked)return;const generation=++pdfNumber;try{const data=collect();KKDocument.render(document.querySelector('#preview'),data);const blob=KKDocument.pdf(document.querySelector('#preview')),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`Terjemahan_KK_${data.household.head.replace(/[^a-zA-Z0-9_-]/g,'_')}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);document.querySelector('#download-status').textContent='PDF berhasil dibuat. Periksa folder Unduhan.';KKVocabulary.afterPdf(data).then(result=>{if(result.failed&&generation===pdfNumber)document.querySelector('#download-status').textContent='PDF berhasil dibuat. Pencatatan istilah manual belum berhasil.';}).catch(()=>{});}catch(e){message(e.message);}};
document.querySelector('#reset').onclick=()=>{if(confirm('Kosongkan semua data pada form?')){form.reset();KKVocabulary.newDocument();pdfNumber++;KKDates.clear(form);members.replaceChildren();addMember();show(0);}};
document.querySelector('#demo').onclick=()=>{if(collect().household.kk&&!confirm('Ganti data saat ini dengan contoh fiktif?'))return;const demo={kk:'0000000000000001',head:'BUDI CONTOH',address:'JL. CONTOH NO. 10',rt:'001/002',postcode:'12345',village:'CONTOH',district:'CONTOH',city:'KOTA CONTOH',province:'PROVINSI CONTOH',issuedate:'2023-03-04',official:'PEJABAT CONTOH',nip:''};for(const [k,v] of Object.entries(demo))document.querySelector(`#h-${k}`).value=v;KKVocabulary.newDocument();members.replaceChildren();addMember({name:'BUDI CONTOH',nik:'0000000000000001',sex:'Laki-laki',birthplace:'KOTA CONTOH',birthdate:'1988-07-16',religion:'Islam',education:'SLTA / Sederajat',job:'Karyawan Swasta',blood:'O',marital:'Kawin Tercatat',marriagedate:'2012-05-20',relationship:'Kepala Keluarga',citizenship:'WNI',father:'AYAH CONTOH',mother:'IBU CONTOH'});addMember({name:'SITI CONTOH',nik:'0000000000000002',sex:'Perempuan',birthplace:'KOTA CONTOH',birthdate:'1990-09-08',religion:'Islam',education:'Diploma IV / Strata I',job:'Mengurus Rumah Tangga',blood:'Tidak Tahu',marital:'Kawin Tercatat',marriagedate:'2012-05-20',relationship:'Istri',citizenship:'WNI',father:'AYAH SITI CONTOH',mother:'IBU SITI CONTOH'});message('Contoh fiktif diisi. Jangan gunakan sebagai data KK asli.');};
addMember();KKPreview.init();KKVocabulary.init();
})();

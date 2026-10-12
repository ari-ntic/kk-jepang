(()=>{
const form=document.querySelector('#kk-form'),members=document.querySelector('#members');let current=0,serial=0,timer,pdfNumber=0;
const household=[['kk','Nomor KK','text',true,'16 digit sesuai KK'],['head','Nama kepala keluarga','text',true,'Nama Latin sesuai KK'],['address','Alamat','text',true,'Jangan menerjemahkan nama jalan',true],['rt','RT / RW','text',true,'Contoh: 001/002'],['postcode','Kode pos','text',true,'5 digit'],['village','Desa / Kelurahan','text',true],['district','Kecamatan','text',true],['city','Kabupaten / Kota','text',true],['province','Provinsi','text',true]];
const issue = [
  ['issuedate','Tanggal dikeluarkan','date',true],
  ['official','Nama pejabat','text',true],
  ['nip','NIP pejabat','text',true,'Simpan angka nol di depan']
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
// Tiga keluarga fiktif untuk menguji tampilan; bukan data penduduk nyata.
const kkDemoCases = [
  {
    "label": "Contoh 1",
    "household": {
      "kk": "4417728909964217",
      "head": "Ahmad Fauzi",
      "address": "Jl. Melati Raya No. 27, Perumahan Taman Cibinong Blok B-8",
      "rt": "003/007",
      "postcode": "16916",
      "village": "Pabuaran",
      "district": "Cibinong",
      "city": "Kabupaten Bogor",
      "province": "Jawa Barat",
      "issuedate": "2025-08-12",
      "official": "Dwi Ratna Puspitasari",
      "nip": "197604152002122003"
    },
    "members": [
      {
        "name": "Ahmad Fauzi",
        "nik": "2829492001475773",
        "sex": "Laki-laki",
        "relationship": "Kepala Keluarga",
        "birthplace": "Bogor",
        "birthdate": "1978-04-17",
        "religion": "Islam",
        "education": "Strata II",
        "job": "Pegawai Negeri Sipil",
        "blood": "O",
        "marital": "Kawin Tercatat",
        "marriagedate": "2001-05-20",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Hasan Basri",
        "mother": "Aminah"
      },
      {
        "name": "Siti Nurhayati",
        "nik": "2034663985901691",
        "sex": "Perempuan",
        "relationship": "Istri",
        "birthplace": "Bandung",
        "birthdate": "1981-09-23",
        "religion": "Islam",
        "education": "Diploma IV / Strata I",
        "job": "Guru",
        "blood": "A",
        "marital": "Kawin Tercatat",
        "marriagedate": "2001-05-20",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Bambang Setiawan",
        "mother": "Dewi Lestari"
      },
      {
        "name": "Muhammad Ilham Fauzi",
        "nik": "4829629444726250",
        "sex": "Laki-laki",
        "relationship": "Anak",
        "birthplace": "Surabaya",
        "birthdate": "2003-06-12",
        "religion": "Islam",
        "education": "Akademi / Diploma III / Sarjana Muda",
        "job": "Karyawan Swasta",
        "blood": "B",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Ahmad Fauzi",
        "mother": "Siti Nurhayati"
      },
      {
        "name": "Aulia Rahma Fauzi",
        "nik": "3603741170446299",
        "sex": "Perempuan",
        "relationship": "Anak",
        "birthplace": "Semarang",
        "birthdate": "2007-02-08",
        "religion": "Islam",
        "education": "SLTA / Sederajat",
        "job": "Pelajar / Mahasiswa",
        "blood": "AB",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Ahmad Fauzi",
        "mother": "Siti Nurhayati"
      },
      {
        "name": "Rizky Maulana Fauzi",
        "nik": "8285878811914759",
        "sex": "Laki-laki",
        "relationship": "Anak",
        "birthplace": "Yogyakarta",
        "birthdate": "2012-11-19",
        "religion": "Islam",
        "education": "SLTP / Sederajat",
        "job": "Pelajar / Mahasiswa",
        "blood": "Tidak Tahu",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Ahmad Fauzi",
        "mother": "Siti Nurhayati"
      },
      {
        "name": "Nadia Putri Fauzi",
        "nik": "4007001113769388",
        "sex": "Perempuan",
        "relationship": "Anak",
        "birthplace": "Medan",
        "birthdate": "2018-07-04",
        "religion": "Islam",
        "education": "Belum Tamat SD / Sederajat",
        "job": "Pelajar / Mahasiswa",
        "blood": "A+",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Ahmad Fauzi",
        "mother": "Siti Nurhayati"
      },
      {
        "name": "Hasan Basri",
        "nik": "5317425826365988",
        "sex": "Laki-laki",
        "relationship": "Orangtua",
        "birthplace": "Madiun",
        "birthdate": "1952-01-26",
        "religion": "Islam",
        "education": "Tamat SD / Sederajat",
        "job": "Pensiunan",
        "blood": "B-",
        "marital": "Cerai Mati",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Hasan Basri",
        "mother": "Aminah"
      },
      {
        "name": "Aminah",
        "nik": "9700896725087303",
        "sex": "Perempuan",
        "relationship": "Orangtua",
        "birthplace": "Surakarta",
        "birthdate": "1955-08-14",
        "religion": "Islam",
        "education": "Tidak / Belum Sekolah",
        "job": "Mengurus Rumah Tangga",
        "blood": "AB+",
        "marital": "Cerai Hidup",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Bambang Setiawan",
        "mother": "Dewi Lestari"
      },
      {
        "name": "Rudi Hartono",
        "nik": "9580424147521010",
        "sex": "Laki-laki",
        "relationship": "Famili Lain",
        "birthplace": "Denpasar",
        "birthdate": "1994-03-09",
        "religion": "Islam",
        "education": "Diploma I / II",
        "job": "Perawat",
        "blood": "O-",
        "marital": "Kawin Belum Tercatat",
        "marriagedate": "2021-04-18",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Sutrisno",
        "mother": "Sri Wahyuni"
      },
      {
        "name": "Dewi Anggraini",
        "nik": "6053322935178297",
        "sex": "Perempuan",
        "relationship": "Famili Lain",
        "birthplace": "Pontianak",
        "birthdate": "1997-12-21",
        "religion": "Islam",
        "education": "Strata III",
        "job": "Wiraswasta",
        "blood": "AB-",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Yohanes Wijaya",
        "mother": "Theresia Rahayu"
      }
    ]
  },
  {
    "label": "Contoh 2",
    "household": {
      "kk": "4382468572304945",
      "head": "Maria Fransiska Lestari",
      "address": "Jl. Anggrek Selatan Gang II No. 14B",
      "rt": "004/002",
      "postcode": "85111",
      "village": "Oebobo",
      "district": "Oebobo",
      "city": "Kota Kupang",
      "province": "Nusa Tenggara Timur",
      "issuedate": "2025-08-12",
      "official": "Yuliana Widyastuti",
      "nip": "197908232006042002"
    },
    "members": [
      {
        "name": "Maria Fransiska Lestari",
        "nik": "6793278697312215",
        "sex": "Perempuan",
        "relationship": "Kepala Keluarga",
        "birthplace": "Bandung",
        "birthdate": "1980-10-09",
        "religion": "Katolik",
        "education": "Strata III",
        "job": "Dosen",
        "blood": "A",
        "marital": "Kawin Tercatat",
        "marriagedate": "2003-06-18",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Hasan Basri",
        "mother": "Aminah"
      },
      {
        "name": "Yohanes Budi Santoso",
        "nik": "1180413872307896",
        "sex": "Laki-laki",
        "relationship": "Suami",
        "birthplace": "Surabaya",
        "birthdate": "1978-02-24",
        "religion": "Katolik",
        "education": "Strata II",
        "job": "Dokter",
        "blood": "B",
        "marital": "Kawin Tercatat",
        "marriagedate": "2003-06-18",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Bambang Setiawan",
        "mother": "Dewi Lestari"
      },
      {
        "name": "Clara Regina Santoso",
        "nik": "1192318910422067",
        "sex": "Perempuan",
        "relationship": "Anak",
        "birthplace": "Semarang",
        "birthdate": "2005-05-21",
        "religion": "Katolik",
        "education": "SLTA / Sederajat",
        "job": "Karyawan Swasta",
        "blood": "AB",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Yohanes Budi Santoso",
        "mother": "Maria Fransiska Lestari"
      },
      {
        "name": "Gabriel Aditya Santoso",
        "nik": "2510624827923870",
        "sex": "Laki-laki",
        "relationship": "Anak",
        "birthplace": "Yogyakarta",
        "birthdate": "2009-07-03",
        "religion": "Katolik",
        "education": "SLTA / Sederajat",
        "job": "Pelajar / Mahasiswa",
        "blood": "Tidak Tahu",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Yohanes Budi Santoso",
        "mother": "Maria Fransiska Lestari"
      },
      {
        "name": "Agnes Felicia Santoso",
        "nik": "2242642381345861",
        "sex": "Perempuan",
        "relationship": "Anak",
        "birthplace": "Medan",
        "birthdate": "2014-03-18",
        "religion": "Katolik",
        "education": "SLTP / Sederajat",
        "job": "Pelajar / Mahasiswa",
        "blood": "A+",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Yohanes Budi Santoso",
        "mother": "Maria Fransiska Lestari"
      },
      {
        "name": "Petrus Rafael Santoso",
        "nik": "2642819291776703",
        "sex": "Laki-laki",
        "relationship": "Anak",
        "birthplace": "Madiun",
        "birthdate": "2019-12-11",
        "religion": "Katolik",
        "education": "Belum Tamat SD / Sederajat",
        "job": "Pelajar / Mahasiswa",
        "blood": "B-",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Yohanes Budi Santoso",
        "mother": "Maria Fransiska Lestari"
      },
      {
        "name": "Theresia Wati",
        "nik": "9671256771166984",
        "sex": "Perempuan",
        "relationship": "Orangtua",
        "birthplace": "Surakarta",
        "birthdate": "1954-11-18",
        "religion": "Katolik",
        "education": "Tidak / Belum Sekolah",
        "job": "Pensiunan",
        "blood": "AB+",
        "marital": "Cerai Mati",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Hasan Basri",
        "mother": "Aminah"
      },
      {
        "name": "Antonius Wijaya",
        "nik": "9157132439468374",
        "sex": "Laki-laki",
        "relationship": "Mertua",
        "birthplace": "Denpasar",
        "birthdate": "1951-06-27",
        "religion": "Katolik",
        "education": "Diploma I / II",
        "job": "Mengurus Rumah Tangga",
        "blood": "O-",
        "marital": "Cerai Hidup",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Bambang Setiawan",
        "mother": "Dewi Lestari"
      },
      {
        "name": "Meliana Kusuma Dewi",
        "nik": "8598558404765260",
        "sex": "Perempuan",
        "relationship": "Famili Lain",
        "birthplace": "Pontianak",
        "birthdate": "1996-08-16",
        "religion": "Kristen",
        "education": "Strata III",
        "job": "Perawat",
        "blood": "AB-",
        "marital": "Kawin Belum Tercatat",
        "marriagedate": "2021-04-18",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Sutrisno",
        "mother": "Sri Wahyuni"
      },
      {
        "name": "Daniel Alexander Wijaya",
        "nik": "8396172268561542",
        "sex": "Laki-laki",
        "relationship": "Famili Lain",
        "birthplace": "Kupang",
        "birthdate": "1993-01-30",
        "religion": "Buddha",
        "education": "Strata II",
        "job": "Wiraswasta",
        "blood": "O",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Yohanes Wijaya",
        "mother": "Theresia Rahayu"
      }
    ]
  },
  {
    "label": "Contoh 3",
    "household": {
      "kk": "5350592290074022",
      "head": "Muhammad Rizky Aditya Pratama",
      "address": "Jl. Pangeran Diponegoro No. 128A, Perumahan Griya Nusantara Indah Blok C-12",
      "rt": "012/005",
      "postcode": "75126",
      "village": "Karang Asam Ulu",
      "district": "Sungai Kunjang",
      "city": "Kota Samarinda",
      "province": "Kalimantan Timur",
      "issuedate": "2025-08-12",
      "official": "Agus Setiawan",
      "nip": "197203181998031004"
    },
    "members": [
      {
        "name": "Muhammad Rizky Aditya Pratama",
        "nik": "2521427157572555",
        "sex": "Laki-laki",
        "relationship": "Kepala Keluarga",
        "birthplace": "Surabaya",
        "birthdate": "1978-01-15",
        "religion": "Islam",
        "education": "Akademi / Diploma III / Sarjana Muda",
        "job": "Wiraswasta",
        "blood": "B",
        "marital": "Kawin Tercatat",
        "marriagedate": "2004-05-16",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Hasan Basri",
        "mother": "Aminah"
      },
      {
        "name": "Nur Aisyah Puspita Maharani",
        "nik": "5475741833457664",
        "sex": "Perempuan",
        "relationship": "Istri",
        "birthplace": "Semarang",
        "birthdate": "1981-06-27",
        "religion": "Islam",
        "education": "SLTA / Sederajat",
        "job": "Mengurus Rumah Tangga",
        "blood": "AB",
        "marital": "Kawin Tercatat",
        "marriagedate": "2004-05-16",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Bambang Setiawan",
        "mother": "Dewi Lestari"
      },
      {
        "name": "Muhammad Farhan Alif Ramadhan",
        "nik": "2610576182638156",
        "sex": "Laki-laki",
        "relationship": "Anak",
        "birthplace": "Yogyakarta",
        "birthdate": "2006-03-10",
        "religion": "Islam",
        "education": "SLTP / Sederajat",
        "job": "Karyawan Swasta",
        "blood": "Tidak Tahu",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Muhammad Rizky Aditya Pratama",
        "mother": "Nur Aisyah Puspita Maharani"
      },
      {
        "name": "Nabila Zahra Putri Pratama",
        "nik": "6861200616486124",
        "sex": "Perempuan",
        "relationship": "Anak",
        "birthplace": "Medan",
        "birthdate": "2009-12-21",
        "religion": "Islam",
        "education": "SLTA / Sederajat",
        "job": "Pelajar / Mahasiswa",
        "blood": "A+",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Muhammad Rizky Aditya Pratama",
        "mother": "Nur Aisyah Puspita Maharani"
      },
      {
        "name": "Ahmad Rayhan Fathurrahman",
        "nik": "2317925919749965",
        "sex": "Laki-laki",
        "relationship": "Anak",
        "birthplace": "Madiun",
        "birthdate": "2013-08-06",
        "religion": "Islam",
        "education": "SLTP / Sederajat",
        "job": "Pelajar / Mahasiswa",
        "blood": "B-",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Muhammad Rizky Aditya Pratama",
        "mother": "Nur Aisyah Puspita Maharani"
      },
      {
        "name": "Salsabila Kirana Ayu Pratama",
        "nik": "9829691553684225",
        "sex": "Perempuan",
        "relationship": "Anak",
        "birthplace": "Surakarta",
        "birthdate": "2018-11-30",
        "religion": "Islam",
        "education": "Belum Tamat SD / Sederajat",
        "job": "Pelajar / Mahasiswa",
        "blood": "AB+",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Muhammad Rizky Aditya Pratama",
        "mother": "Nur Aisyah Puspita Maharani"
      },
      {
        "name": "Bambang Soedjatmiko",
        "nik": "2564303341348566",
        "sex": "Laki-laki",
        "relationship": "Orangtua",
        "birthplace": "Denpasar",
        "birthdate": "1951-02-17",
        "religion": "Islam",
        "education": "Diploma I / II",
        "job": "Petani / Pekebun",
        "blood": "O-",
        "marital": "Cerai Mati",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Hasan Basri",
        "mother": "Aminah"
      },
      {
        "name": "Sri Endang Widyastuti",
        "nik": "1262491095993845",
        "sex": "Perempuan",
        "relationship": "Orangtua",
        "birthplace": "Pontianak",
        "birthdate": "1954-05-09",
        "religion": "Islam",
        "education": "Strata III",
        "job": "Mengurus Rumah Tangga",
        "blood": "AB-",
        "marital": "Cerai Hidup",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Bambang Setiawan",
        "mother": "Dewi Lestari"
      },
      {
        "name": "Ni Kadek Ayu Wulandari",
        "nik": "9401866022612225",
        "sex": "Perempuan",
        "relationship": "Lainnya",
        "birthplace": "Samarinda",
        "birthdate": "1998-09-13",
        "religion": "Hindu",
        "education": "Strata II",
        "job": "Bidan",
        "blood": "O",
        "marital": "Kawin Belum Tercatat",
        "marriagedate": "2021-04-18",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Sutrisno",
        "mother": "Sri Wahyuni"
      },
      {
        "name": "Liem Mei Ling",
        "nik": "5212618711833446",
        "sex": "Perempuan",
        "relationship": "Lainnya",
        "birthplace": "Bandung",
        "birthdate": "1995-07-25",
        "religion": "Konghucu",
        "education": "Diploma IV / Strata I",
        "job": "Pedagang",
        "blood": "A",
        "marital": "Belum Kawin",
        "marriagedate": "",
        "citizenship": "WNI",
        "passport": "",
        "kitap": "",
        "father": "Yohanes Wijaya",
        "mother": "Theresia Rahayu"
      }
    ]
  }
];
const demoButton = document.querySelector('#demo');
const demoChoices = document.querySelector('#demo-choices');
function closeDemoChoices() {
 demoChoices.hidden = true;
 demoButton.setAttribute('aria-expanded', 'false');
}
demoButton.onclick = () => {
 demoChoices.hidden = !demoChoices.hidden;
 demoButton.setAttribute('aria-expanded', String(!demoChoices.hidden));
};
for (const button of demoChoices.querySelectorAll('[data-demo-case]')) {
 button.onclick = () => {
  const example = kkDemoCases[Number(button.dataset.demoCase)];
  if (collect().household.kk && !confirm('Ganti data saat ini dengan ' + example.label + ' (fiktif)?')) return;
  for (const [key, value] of Object.entries(example.household)) {
   const input = document.querySelector(`#h-${key}`);
   if (input) input.value = value;
  }
  KKVocabulary.newDocument();
  pdfNumber++;
  members.replaceChildren();
  for (const values of example.members) addMember(values);
  KKDates.refresh(form);
  document.querySelector('#reviewed').checked = false;
  document.querySelector('#download').disabled = true;
  document.querySelector('#download-status').textContent = '';
  closeDemoChoices();
  demoButton.focus();
  message(example.label + ' diisi: 10 anggota fiktif. Jangan gunakan sebagai KK asli.');
 };
}
document.addEventListener('click', e => {
 if (!e.target.closest('.demo-picker')) closeDemoChoices();
});
document.addEventListener('keydown', e => {
 if (e.key === 'Escape' && !demoChoices.hidden) {
  closeDemoChoices();
  demoButton.focus();
 }
});
addMember();KKPreview.init();KKVocabulary.init();KKWilayah.init();
})();

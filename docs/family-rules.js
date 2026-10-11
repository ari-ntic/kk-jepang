/* Data yang sama mempunyai satu sumber. Hubungan Suami/Istri mengacu pada
   kepala keluarga, bukan pada setiap anggota berstatus kawin. */
(function(root){
 const married=value=>['Kawin','Kawin Tercatat','Kawin Belum Tercatat','Kawin Tidak Tercatat'].includes(value);
 function reconcile(household,input){
  const members=input.map(member=>({...member}));
  const locks=members.map(()=>({})),issues=[],notes=members.map(()=>({}));
  const heads=members.map((m,i)=>m.relationship==='Kepala Keluarga'?i:-1).filter(i=>i>=0);
  const headIndex=heads.length===1?heads[0]:-1;
  const spouses=members.map((m,i)=>['Suami','Istri'].includes(m.relationship)?i:-1).filter(i=>i>=0);
  let pair=null;
  if(headIndex>=0){
   const head=members[headIndex];head.name=(household.head||'').trim();
   locks[headIndex].name=true;notes[headIndex].name='Otomatis dari nama kepala keluarga di langkah 1. Ubah nama di sana.';
   if(spouses.length===1&&(!head.marital||married(head.marital))){
    const partnerIndex=spouses[0],partner=members[partnerIndex];
    partner.marital=head.marital||'';partner.marriagedate=head.marriagedate||'';
    locks[partnerIndex].marital=true;locks[partnerIndex].marriagedate=true;
    notes[partnerIndex].marital='Otomatis mengikuti status perkawinan kepala keluarga.';
    notes[partnerIndex].marriagedate='Otomatis mengikuti tanggal perkawinan kepala keluarga. Isi atau ubah tanggal pada kepala keluarga.';
    notes[headIndex].marriagedate='Isi satu kali di sini. Tanggal pasangan diperbarui otomatis; kosongkan jika KK berisi tanda —.';
    pair=[headIndex,partnerIndex];
   }else if(spouses.length>1){
    for(const i of spouses)notes[i].marriagedate='Ada lebih dari satu pasangan. Isi tanggal masing-masing sesuai KK; tanggal tidak disamakan otomatis.';
   }
  }
  for(const [i,m] of members.entries()){
   if(m.marital==='Belum Kawin'){
    m.marriagedate='';locks[i].marriagedate=true;
    notes[i].marriagedate='Tidak berlaku untuk Belum Kawin; otomatis kosong.';
   }
   if(m.citizenship!=='WNA')m.country='';
   if(m.marriagedate&&m.birthdate&&m.marriagedate<m.birthdate)issues.push({index:i,key:'marriagedate',message:'Tanggal perkawinan tidak boleh lebih awal daripada tanggal lahir.'});
   if(household.issuedate&&m.birthdate>household.issuedate)issues.push({index:i,key:'birthdate',message:'Tanggal lahir lebih baru daripada tanggal KK diterbitkan. Periksa tanggal pada sumber.'});
   if(household.issuedate&&m.marriagedate>household.issuedate)issues.push({index:i,key:'marriagedate',message:'Tanggal perkawinan lebih baru daripada tanggal KK diterbitkan. Periksa tanggal pada sumber.'});
   if(m.relationship==='Suami'&&m.sex&&m.sex!=='Laki-laki')issues.push({index:i,key:'sex',message:'Hubungan Suami harus sesuai dengan jenis kelamin Laki-laki pada KK.'});
   if(m.relationship==='Istri'&&m.sex&&m.sex!=='Perempuan')issues.push({index:i,key:'sex',message:'Hubungan Istri harus sesuai dengan jenis kelamin Perempuan pada KK.'});
   if(['Suami','Istri'].includes(m.relationship)&&headIndex>=0){
    const head=members[headIndex];
    if(head.marital&&!married(head.marital))issues.push({index:i,key:'relationship',message:'Hubungan Suami/Istri tidak sesuai dengan status kepala keluarga. Periksa hubungan atau status perkawinan pada KK.'});
    if(head.sex&&m.sex&&head.sex===m.sex)issues.push({index:i,key:'relationship',message:'Jenis kelamin pasangan dan kepala keluarga tidak sesuai dengan hubungan Suami/Istri. Periksa KK.'});
   }
  }
  const seen=new Map();for(const [i,m] of members.entries())if(m.nik){if(seen.has(m.nik))issues.push({index:i,key:'nik',message:`NIK sama dengan anggota ${seen.get(m.nik)+1}.`});else seen.set(m.nik,i);}
  return {members,locks,notes,issues,headIndex,headCount:heads.length,pair};
 }
 const api={reconcile,married};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.KKFamily=api;
})(typeof window==='undefined'?globalThis:window);

/* Padanan terkendali. Kode dan nomor identitas selalu dipertahankan sebagai teks. */
window.KK_TERMS={
 sex:[['Laki-laki','男性'],['Perempuan','女性']],
 religion:[['Islam','イスラム教'],['Kristen','プロテスタント'],['Katolik','カトリック'],['Hindu','ヒンドゥー教'],['Buddha','仏教'],['Konghucu','儒教'],['Kepercayaan terhadap Tuhan Yang Maha Esa','唯一神への信仰']],
 education:[['Tidak / Belum Sekolah','学歴なし'],['Belum Tamat SD / Sederajat','小学校未卒'],['Tamat SD / Sederajat','小学校卒業'],['SLTP / Sederajat','中学校卒業'],['SLTA / Sederajat','高校卒業'],['Diploma I / II','ディプロマI・II'],['Akademi / Diploma III / Sarjana Muda','ディプロマIII等'],['Diploma IV / Strata I','学士（S1）'],['Strata II','修士（S2）'],['Strata III','博士（S3）']],
 job:[['Belum / Tidak Bekerja','無職'],['Mengurus Rumah Tangga','家事'],['Pelajar / Mahasiswa','学生'],['Pensiunan','退職者'],['Pegawai Negeri Sipil','公務員'],['Tentara Nasional Indonesia','軍人'],['Kepolisian RI','警察官'],['Karyawan Swasta','会社員'],['Karyawan BUMN','国営企業社員'],['Karyawan BUMD','地方公営企業社員'],['Karyawan Honorer','非正規職員'],['Wiraswasta','自営業'],['Pedagang','商人'],['Petani / Pekebun','農業'],['Peternak','畜産'],['Nelayan / Perikanan','漁業'],['Buruh Harian Lepas','日雇労働者'],['Buruh Tani / Perkebunan','農業労働者'],['Buruh Nelayan / Perikanan','漁業労働者'],['Buruh Peternakan','畜産業労働者'],['Pembantu Rumah Tangga','家事使用人'],['Guru','教員'],['Dosen','大学教員'],['Dokter','医師'],['Perawat','看護師'],['Bidan','助産師'],['Sopir','運転手'],['Tukang Cukur','理容師'],['Tukang Listrik','電気工'],['Tukang Batu','石工'],['Tukang Kayu','大工'],['Tukang Jahit','仕立職人'],['Mekanik','整備士'],['Wartawan','記者'],['Ustadz / Mubaligh','イスラム教指導者'],['Pendeta','牧師'],['Pastor','司祭'],['Perangkat Desa','村役場職員'],['Kepala Desa','村長']],
 marital:[['Belum Kawin','未婚'],['Kawin','既婚'],['Kawin Tercatat','既婚'],['Kawin Belum Tercatat','既婚'],['Kawin Tidak Tercatat','既婚'],['Cerai Hidup','離婚'],['Cerai Mati','死別']],
 relationship:[['Kepala Keluarga','世帯主'],['Suami','夫'],['Istri','妻'],['Anak','子'],['Menantu','子の配偶者'],['Cucu','孫'],['Orangtua','親'],['Mertua','配偶者の親'],['Famili Lain','その他の親族'],['Pembantu','家事使用人'],['Lainnya','その他']],
 citizenship:[['WNI','インドネシア'],['WNA','外国籍']],
 blood:[['A','A'],['B','B'],['AB','AB'],['O','O'],['A+','A+'],['A-','A-'],['B+','B+'],['B-','B-'],['AB+','AB+'],['AB-','AB-'],['O+','O+'],['O-','O-'],['Tidak Tahu','−']]
};
window.kkTranslate = (key, value) => {
  if (key === 'blood' && (!value || value === '-' || value === 'Tidak Tahu')) {
    return '-';
  }
  return value === '-'
    ? '—'
    : (KK_TERMS[key]?.find(pair => pair[0] === value)?.[1] || value || '—');
};
window.kkUpper = value =>
  String(value ?? '').toLocaleUpperCase('id-ID');

window.kkTitle = value =>
  String(value ?? '')
    .toLocaleLowerCase('id-ID')
    .replace(/\p{L}[\p{L}\p{M}]*/gu, word =>
      word[0].toLocaleUpperCase('id-ID') + word.slice(1)
    );

window.kkFormatData = data => {
  const result = {
    household: { ...data.household },
    members: data.members.map(member => ({ ...member }))
  };

  // Nama orang: huruf kapital seluruhnya.
  for (const key of ['head', 'official']) {
    result.household[key] = kkUpper(result.household[key]);
  }

  // Data alamat: huruf awal setiap kata kapital.
  for (const key of [
    'address', 'village', 'district', 'city', 'province'
  ]) {
    result.household[key] = kkTitle(result.household[key]);
  }

  for (const member of result.members) {
    for (const key of ['name', 'father', 'mother']) {
      member[key] = kkUpper(member[key]);
    }

    for (const key of ['birthplace', 'country']) {
      member[key] = kkTitle(member[key]);
    }

    // Istilah Indonesia yang diketik manual.
    for (const key of [
      'jobOriginal', 'religionOriginal', 'educationOriginal'
    ]) {
      if (member[key]) member[key] = kkTitle(member[key]);
    }
  }

  return result;
};

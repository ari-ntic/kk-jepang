/* PDF dibuat lokal dari gambar dokumen beresolusi tinggi.
   Karakter Jepang dirasterisasi di browser, sehingga PDF tidak bergantung pada font pembaca. */
(function(){
const W=1123,H=794,FONT='"Yu Gothic", "Meiryo", "Hiragino Kaku Gothic ProN", "Noto Sans CJK JP", sans-serif';
const safe=v=>String(v||'-');
function date(v){if(!v)return '-';const [y,m,d]=v.split('-');return `${y}年${Number(m)}月${Number(d)}日`;}
function text(ctx,value,x,y,w,h,size=9,bold=false,align='left'){
 const content=safe(value);let lines=[];
 for(let s=size;s>=5;s-=.5){ctx.font=`${bold?'600':'400'} ${s}px ${FONT}`;lines=[];for(const para of content.split('\n')){let row='';for(const c of para){if(row&&ctx.measureText(row+c).width>w-8){lines.push(row);row=c;}else row+=c;}lines.push(row);}if(lines.length*s*1.25<=h-4)break;}
 const fontSize=parseFloat(ctx.font.match(/([\d.]+)px/)[1]);if(lines.length*fontSize*1.25>h-4)throw new Error('Teks terlalu panjang untuk PDF. Pendekkan keterangan atau nama jabatan.');
 ctx.fillStyle='#172322';ctx.textAlign=align;ctx.textBaseline='middle';const tx=align==='center'?x+w/2:x+4;let yy=y+h/2-(lines.length-1)*fontSize*1.25/2;for(const line of lines){ctx.fillText(line,tx,yy);yy+=fontSize*1.25;}
}
function cell(ctx,s,x,y,w,h,bold=false,size=8){ctx.strokeStyle='#5b6661';ctx.lineWidth=.6;ctx.strokeRect(x,y,w,h);text(ctx,s,x,y,w,h,size,bold,'center');}
function grid(ctx,y,widths,labels,numbers,data){let x=40;const hh=32,nh=12,rh=18;for(let i=0;i<widths.length;i++){cell(ctx,labels[i],x,y,widths[i],hh,true);cell(ctx,numbers[i],x,y+hh,widths[i],nh,false,7);for(let r=0;r<10;r++)cell(ctx,data[r]?.[i]??(i===0?String(r+1):'-'),x,y+hh+nh+r*rh,widths[i],rh,false,i===2?8:9);x+=widths[i];}}
function render(canvas,data){canvas.width=W*3;canvas.height=H*3;const ctx=canvas.getContext('2d');ctx.scale(3,3);ctx.fillStyle='white';ctx.fillRect(0,0,W,H);text(ctx,'日本語訳',40,22,125,25,16,true);text(ctx,'Terjemahan Kartu Keluarga',40,48,220,14,8);text(ctx,'家族カード（KARTU KELUARGA）',230,17,670,35,25,true,'center');text(ctx,`No. ${data.household.kk}`,250,54,630,23,17,false,'center');
 const h=data.household;const left=[['世帯主氏名',h.head],['住所',h.address],['RT / RW',h.rt],['郵便番号',h.postcode]];const right=[['村・行政区',h.village],['郡',h.district],['県・市',h.city],['州',h.province]];
 for(let i=0;i<4;i++){text(ctx,left[i][0],40,78+i*12,110,12,8);text(ctx,`: ${left[i][1]||'-'}`,150,78+i*12,440,12,8);text(ctx,right[i][0],670,78+i*12,100,12,8);text(ctx,`: ${right[i][1]||'-'}`,770,78+i*12,310,12,8);}
 const translated=(m,k)=>m[k]==='__other'?m[k+'Japanese']:kkTranslate(k,m[k]);
 const first=data.members.map((m,i)=>[String(i+1),m.name,m.nik,translated(m,'sex'),m.birthplace,date(m.birthdate),translated(m,'religion'),translated(m,'education'),translated(m,'job'),translated(m,'blood')]);
 grid(ctx,134,[24,198,102,50,126,65,95,134,193,56],['番号','氏名','住民識別番号\nNIK','性別','出生地','生年月日','宗教','学歴','職業','血液型'],['','(1)','(2)','(3)','(4)','(5)','(6)','(7)','(8)','(9)'],first);
 const second=data.members.map((m,i)=>[String(i+1),translated(m,'marital'),date(m.marriagedate),translated(m,'relationship'),m.citizenship==='WNA'?m.country:translated(m,'citizenship'),m.passport,m.kitap,m.father,m.mother]);
 const y=368,ws=[24,143,73,129,101,81,85,203,204];let x=40;
 // Kelompok Dokumen Imigrasi dan Nama Orang Tua mengikuti header gabungan sumber.
 const labels=['番号','婚姻状況','婚姻日','世帯主との続柄','国籍'];for(let i=0;i<5;i++){cell(ctx,labels[i],x,y,ws[i],32,true);x+=ws[i];}cell(ctx,'出入国関係書類',x,y,ws[5]+ws[6],14,true);cell(ctx,'旅券番号',x,y+14,ws[5],18,true);cell(ctx,'KITAP 番号',x+ws[5],y+14,ws[6],18,true);x+=ws[5]+ws[6];cell(ctx,'父母の氏名',x,y,ws[7]+ws[8],14,true);cell(ctx,'父',x,y+14,ws[7],18,true);cell(ctx,'母',x+ws[7],y+14,ws[8],18,true);x=40;for(let i=0;i<ws.length;i++){cell(ctx,i===0?'':`(${i+9})`,x,y+32,ws[i],12,false,7);for(let r=0;r<10;r++)cell(ctx,second[r]?.[i]??(i===0?String(r+1):'-'),x,y+44+r*18,ws[i],18,false,9);x+=ws[i];}
 text(ctx,`発行日：${date(h.issuedate)}`,40,622,330,20,10);text(ctx,'世帯主',405,622,260,20,11,true,'center');text(ctx,'民事登録事務官',742,622,338,20,11,true,'center');text(ctx,h.head,405,704,260,24,10,false,'center');text(ctx,h.official||'-',742,727,338,28,10,false,'center');text(ctx,`公務員番号（NIP）：${h.nip||'-'}`,742,758,338,16,8,false,'center');
 text(ctx,'日本語訳 / Terjemahan bahasa Jepang',40,772,690,16,8);return canvas;
}
function pdf(canvas){const jpeg=canvas.toDataURL('image/jpeg',.97).split(',')[1];const binary=atob(jpeg),jpg=Uint8Array.from(binary,c=>c.charCodeAt(0)),enc=new TextEncoder();const chunks=[],offsets=[0];let length=0;function add(v){const b=typeof v==='string'?enc.encode(v):v;chunks.push(b);length+=b.length;}function obj(id,body){offsets[id]=length;add(`${id} 0 obj\n${body}\nendobj\n`);}add('%PDF-1.4\n');obj(1,'<< /Type /Catalog /Pages 2 0 R >>');obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');obj(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');offsets[4]=length;add(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);add(jpg);add('\nendstream\nendobj\n');const draw='q\n841.89 0 0 595.28 0 0 cm\n/Im0 Do\nQ\n';obj(5,`<< /Length ${enc.encode(draw).length} >>\nstream\n${draw}endstream`);const start=length;add('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<=5;i++)add(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);add(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`);return new Blob(chunks,{type:'application/pdf'});}
window.KKDocument={render,pdf,date};
})();

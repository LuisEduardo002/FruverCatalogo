const fs=require('fs'), path=require('path');
function readEnvValue(key){
  try{ const env=fs.readFileSync(path.join(__dirname,'..','..','.env'),'utf8'); const m=env.match(new RegExp(`^${key}=(.*)$`,'m')); return m?m[1].trim():null;}catch{return null;}
}
const SITE_URL=(process.env.VITE_SITE_URL||readEnvValue('VITE_SITE_URL')||'https://fruverelgranjero.store').replace(/\/+$/,'');
const SITE_NAME='Fruver El Granjero';
const SITE_ALTERNATE_NAME='Fruver El Granjero';
const SITE_FULL_NAME='Fruver El Granjero';
const NAP={
  name:SITE_NAME, alternateName:SITE_ALTERNATE_NAME, fullName:SITE_FULL_NAME, url:SITE_URL,
  email:'fruverelgranjero@gmail.com', telephone:'+57 320 7141222', telephoneDigits:'573207141222', whatsapp:'573207141222',
  address:{ streetAddress:'Cra. 14 #55d-148', reference:'Frente al Mallplaza, al lado de Concentrados del Centro', addressLocality:'Manizales', addressRegion:'Caldas', postalCode:'170001', addressCountry:'CO', full:'Cra. 14 #55d-148, frente al Mallplaza, al lado de Concentrados del Centro, Manizales, Caldas, Colombia' },
  geo:{ latitude:5.055, longitude:-75.484 },
  hours:{ days:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], opens:'08:00', closes:'21:00' },
  sunday:{ days:['Sunday'], opens:'08:00', closes:'20:00' },
  schedule:'Lunes a sábado 8:00 a.m. – 9:00 p.m. · Domingos 8:00 a.m. – 8:00 p.m.',
};
const SOCIAL={
  whatsapp:'https://wa.me/573207141222',
};
const INDEXNOW_KEY=process.env.INDEXNOW_KEY||'6db2ccb300575995b1ab6ee52d751c3c';
const PH_SERVICE={
  name:'Frutas y verduras frescas todos los días en Manizales',
  steps:['Eliges en el catálogo','Confirmas por WhatsApp','Alistamos tu mercado','Recibes fresco en casa o en tienda'],
  cost:'Sin costo de alistamiento',
  schedule:'Lunes a sábado 8:00–21:00 · Domingos 8:00–20:00',
};
module.exports={ SITE_URL, SITE_NAME, SITE_ALTERNATE_NAME, SITE_FULL_NAME, NAP, SOCIAL, INDEXNOW_KEY, PH_SERVICE, CURRENCY:'COP', PRICE_TTL_DAYS:30 };

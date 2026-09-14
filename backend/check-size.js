const http = require('http');
http.get('http://127.0.0.1:4000/api/home/sections?limit=12', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const d = JSON.parse(data);
    
    // Check each seller size
    let totalSellerBytes = 0;
    d.data.sellers.forEach((s, i) => {
      const len = JSON.stringify(s).length;
      totalSellerBytes += len;
      if (len > 1000) console.log('BIG seller:', i, s.boutiqueName, len, 'bytes');
    });
    console.log('Sum of individual sellers:', totalSellerBytes, 'bytes =', Math.round(totalSellerBytes/1024), 'KB');
    console.log('Stringify sellers[]:', JSON.stringify(d.data.sellers).length, 'bytes');
    
    // Check the raw JSON for anomalies
    const sellersIdx = data.indexOf('"sellers":[');
    const catsIdx = data.indexOf('"categories":[');
    console.log('Raw sellers section:', catsIdx - sellersIdx, 'bytes =', Math.round((catsIdx - sellersIdx)/1024), 'KB');
    
    // Check if there's extra data after the sellers array
    const lastSellerEnd = data.lastIndexOf('}');
    const catsStart = data.indexOf('"categories"', sellersIdx);
    console.log('Gap between sellers end and categories:', catsStart - lastSellerEnd);
  });
});

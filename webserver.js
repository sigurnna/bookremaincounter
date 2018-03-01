let express = require('express');
let util = require('util');
let Iconv = require('iconv').Iconv;
let cheerio = require('cheerio');

let app = express();


// 서점 검색
// 모바일 위치 기반 + isbn에 해당하는 책의 재고를 보여줄 수 있어야 함.
app.get('/bookstore/:isbn&:lat&:lon', (req, res) => {

	// 서울 교보문고 위치
	// 37.514583, 127.100950

	let http = require('http');
	let remainBooksURL = util.format('http://www.kyobobook.co.kr/prom/2013/general/StoreStockTable.jsp?barcode=%s&ejkgb=KOR', req.params.isbn); // 일단 교보문고 url을 넣음.

	// 서점 사이트에 http 요청하여 데이터를 긁어옴
	http.get(remainBooksURL, (res2) => {

		let iconv = new Iconv('euc-kr', 'utf-8//translit//ignore');
		let rawData;

		res2.on('data', (chunk) => {
			rawData += iconv.convert(chunk);
		});

		// Parsing raw data
		res2.on('end', () => {
			res.send(rawData);
		});
		
	});

});

app.listen(3000, () => {
	console.log('Example app listening on port 3,000 port');
});


import * as fs from "fs";

export default (express, bodyParser, createReadStream, writeFileSync, moment, crypto, http, https, User, m, puppeteer, NodeRSA,
                multer, sizeOf, sharp) => {

    const author = 'itmo337560';

    const CORS = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS,DELETE',
        'Access-Control-Allow-Headers': 'x-test, Content-Type, Access-Control-Allow-Headers'
    };

    const upload = multer({
        dest: 'uploads/'
    });

    const type = upload.fields([
        {name: 'key', maxCount: 1},
        {name: 'secret', maxCount: 1}
    ]);

    const app = express();

    app.set("view engine", "pug");
    const parseUrlEncodedBody = bodyParser.urlencoded({extended: false})
    app.use(bodyParser.json());
    app.use(parseUrlEncodedBody)


    app
        .use((req, res, next) => {
            res
                .status(200)
                .set(CORS)
                .set({'X-Author': author})
            next();
        })

        .get('/login', (req, res) => {
            res
                .set({'Content-Type': 'text/html; charset=utf-8'})
                .send(author);

        })

        .get('/hour', (req, res) => {
            let now = moment().utcOffset('+0300').hour().toString()
            res
                .set({'Content-Type': 'text/html; charset=utf-8'})
                .send(now);

        })

        .get('/sample', (req, res) => {
            res.send('function task(x) { return x*this**2; }');
        })

        .get('/promise',(req,res) =>{
            res.send('function task(x){\n' +
                '    return new Promise ((res, rej) => x < 18  ? res(\'yes\') : rej(\'no\'));\n' +
                '  }')
        })

        .get('/fetch',(req,res) =>{
            res.set({'Content-Type': 'text/html; charset=utf-8'})
                .send('<!DOCTYPE html>\n' +
                '<html lang="ru">\n' +
                '  <head>\n' +
                '    <meta charset="UTF-8" />\n' +
                '    <title>ITMOUniversity-NODEJS-week3</title>\n' +
                '  </head>\n' +
                '\n' +
                '  <body>\n' +
                '    <form id="form" action="#">\n' +
                '      <input id="inp" type="url" placeholder="Input URL" />\n' +
                '      <input id="bt" type="submit" value="Send" onClick="sendURL();" />\n' +
                '    </form>\n' +
                '\n' +
                '    <script>\n' +
                '      /*Получение элемента c указанными id:*/\n' +
                '      const InputField = document.getElementById("inp");\n' +
                '      function sendURL() {\n' +
                '        /*У каждого элемента <input> есть атрибут value, который задает значение поля ввода по умолчанию.*/\n' +
                '        /*Вызов функции fetch(), в качестве одного аргумента передается адрес страницы из поля ввода:*/\n' +
                '        fetch(InputField.value)\n' +
                '          /*В объекте response, который вернула функция Fetch, вызывается метод then() и в него передается результат ответа, который затем декодируется в текст:*/\n' +
                '          .then((response) => response.text())\n' +
                '          /*В атрибут value поля ввода inp вместо того значения, что в нем было ранее, помещается декодированный текст:*/\n' +
                '          .then((data) => (InputField.value = data));\n' +
                '      }\n' +
                '    </script>\n' +
                '  </body>\n' +
                '</html>')
        })

        .get('/id/:input', async ({params}, res) => {
            const {input} = params

            https.get(`https://nd.kodaktor.ru/users/${input}`, httpRes => {
                httpRes.setEncoding('utf8')

                let data = ''

                httpRes.on('data', chunk => {
                    data += chunk
                })

                httpRes.on('end', () => {
                    res.send(data)
                })
            })
        })

        .get('/code', (req, res) => {
            let filePath = import.meta.url.replace(/^file:\/+/, '')

            if (!filePath.includes(':')) {
                filePath = `/${filePath}`
            }

            createReadStream(filePath).pipe(res)
        })

        .get('/sha1/:input', ({params}, res) => {
            const {input} = params

            const hash = crypto.createHash('sha1').update(input).digest('hex')

            res.send(hash);
        })


        .get('/req/', ({query}, res) => {
            const {addr} = query

            http.get(addr, httpRes => {
                httpRes.setEncoding('utf8')

                let data = ''

                httpRes.on('data', chunk => {
                    data += chunk
                })

                httpRes.on('end', () => {
                    res.send(data)
                })
            })
        })

        .post('/result4/',(req, res) => {
            let body = ''

            req.on('data' , chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                let result = {
                    'message': author,
                    'x-result': req?.headers?.['x-test'],
                    'x-body': body
                }

                res.writeHead(200,{...CORS, 'Content-Type': 'application/json'})
                res.end(JSON.stringify(result))
            });
        })

        .post('/size2json', upload.single("image"), async (r) => {
            const tmpPath = r.file.path;
            sizeOf(tmpPath, function (err, dimensions) {
                r.res.send({
                    width: dimensions.width,
                    height: dimensions.height,
                })
            })
        })

        .get("/makeimage?", (r) => {
            const width = parseInt(r.query.width);
            const height = parseInt(r.query.height);
            sharp("img/ALX_ICON.png").resize(width, height).toFile("img/output.png",
                (err, info) => {
                    r.res.download("img/output.png");
                });
        })

        .post('/insert/', async (req, res) => {
            const {login, password, URL} = req.body
            let newUser = new User({login, password})
            try {
                await m.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true})
                try {
                    await newUser.save()
                    res.status(201).json({'Added: ': login})
                } catch (e) {
                    res.status(400).json({'Error: ': 'No password entered'})
                }
            } catch (e) {
                console.log(e.codeName)
            }
        })

        .post('/decypher', type, (req, res) => {
            const keyPath = req.files['key'][0].path
            const secretPath = req.files['secret'][0].path

            fs.readFile(keyPath, (err, privateKeyBuffer) => {
                if (err) throw err;

                const privateKey = new NodeRSA(privateKeyBuffer, "private");

                fs.readFile(secretPath, (err, encryptedDataBuffer) => {
                    if (err) throw err;

                    res.end(privateKey.decrypt(encryptedDataBuffer, 'utf8'))
                });
            });
        });


    app.set('view engine', 'pug')
        .get('/wordpress/wp-json/wp/v2/posts/1', (req, res) => {
            res.json({
                id: 1,
                title: {rendered: 'itmo337560'}
            })
        })

        .post('/render/', (req, res) => {
            const {random2, random3} = req.body

            http.get(req.query.addr, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS,DELETE'
                }
            }, (resFrom) => {
                const {statusCode} = resFrom;
                let error;

                if (statusCode !== 200) {
                    error = new Error('Request Failed.\n' +
                        `Status Code: ${statusCode}`);
                    console.log(e);
                    resFrom.resume();
                    return;
                }

                resFrom.setEncoding('utf8');
                let rawData = '';
                resFrom.on('data', (chunk) => {
                    rawData += chunk;
                });
                resFrom.on('end', () => {
                    console.log(rawData);
                    try {
                        writeFileSync('views/template.pug', rawData, function (err) {
                            if (err) throw err;
                            console.log('Saved!');
                        });
                        res.render('template.pug', {random2, random3})
                    } catch (e) {
                        console.log(e)
                        res.status(500)
                    }
                });
            }).on('error', (e) => {
                console.log(e)
                res.status(500)
            }).end();
        })

        .all('/test/', async (req, res) => {
            try {
                let {URL} = req.query
                const browser = await puppeteer.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                })
                let page = await browser.newPage()
                await page.goto(URL)
                await page.waitForSelector('#inp')
                await page.click('#bt')
                let got = await page.$eval('#inp', el => el.value)
                await browser.close()
                res.send(got)

            } catch (e) {
                console.log(e.message)
            }
        })


        .all('*', (req, res) => {
            res.send(author)
        });

    return app

}
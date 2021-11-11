import cors from 'cors'

const login = 'itmo337560'

export default function initApp(express, bodyParser, fs, crypto, http) {
    const app = express();
    app
        .use(bodyParser.urlencoded({extended: true}))
        .use(cors())
        .all('/login/', r => {
            r.res.send(login);
        })
        .all('/code/', r => {
            fs.readFile(import.meta.url.substring(7), (err, data) => {
                if (err) throw err;
                r.res.end(data);
            });
        })
        .all('/sha1/:input/', r => {
            r.res.send(crypto.createHash('sha1').update(r.params.input).digest('hex'))
        })
        .get('/req/', (req, res) => {
            let data = '';
            http.get(req.query.addr, async function (response) {
                await response.on('data', function (chunk) {
                    data += chunk;

                }).on('end', () => {
                })
                res.send(data)

            })
        })
        .post('/req/', r => {
            const {addr} = req.body;
            r.res.send(addr);
        })
        .all('*', r => r.res.send(login))
    return app;
}
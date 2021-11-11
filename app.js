import cors from 'cors'

const login = 'itmo337560'

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS,DELETE'
}

export default function initApp(express, bodyParser, fs, crypto, http) {
    const app = express()
    app
        .use(bodyParser.urlencoded({extended: true}))
        .all('/login/', r => {
            r.res.set(headers).send(login)
        })
        .all('/code/', r => {
            r.res.set(headers)
            fs.readFile(import.meta.url.substring(7), (err, data) => {
                if (err) throw err
                r.res.end(data)
            })
        })
        .all('/sha1/:input/', r => {
            r.res.set(headers).send(crypto.createHash('sha1').update(r.params.input).digest('hex'))
        })
        .get('/req/', (req, res) => {
            res.set(headers)
            let data = ''
            http.get(req.query.addr, async function (response) {
                await response.on('data', function (chunk) {
                    data += chunk
                }).on('end', () => {
                })
                res.send(data)
            })
        })
        .post('/req/', r => {
            r.res.set(headers)
            const {addr} = req.body
            r.res.send(addr)
        })
        .all('*', r => r.res.send(login))
        .use(({res: r}) => r.status(404).send(login))
    return app
}
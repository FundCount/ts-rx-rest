import * as express from "express";
import Rest from '../../src/Rest';
import {XMLHttpRequest} from  'xmlhttprequest';
import {errorInterceptor} from '../../src/Rest';
import {jsonInterceptor} from '../../src/Rest';
import * as bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
app.get('/test', (req, res) => res.json({value: 1234}));
app.post('/testPost', (req, res) => res.json({value: req.body.value + 1}));
app.put('/testPut', (req, res) => res.json({value: req.body.value + 1}));
app.delete('/testDelete', (req, res) => res.json({status: 'ok'}));

let server;

beforeAll(() => {
    server = app.listen(3000, function () {
        console.log('Example app listening on port 3000!')
    });
});

afterAll(() => {
    server.close();
});

interface TestObject {
    value: number;
}

const rest = new Rest(XMLHttpRequest).wrap(jsonInterceptor);

it('Should call GET', () => {
    return rest.doGet<TestObject>('http://localhost:3000/test')
        .map(value => expect(value.value).toBe(1234))
        .toPromise();
});

it('Should call POST', () => {
    return rest.doPost<TestObject, TestObject>('http://localhost:3000/testPost', {value: 1234})
        .map(value => expect(value.value).toBe(1235))
        .toPromise();
});

it('Should call PUT', () => {
    return rest.doPut<TestObject, TestObject>('http://localhost:3000/testPut',  {value: 1234})
        .map(value => expect(value.value).toBe(1235))
        .toPromise();
});

it('Should call DELETE', () => {
    return new Rest(XMLHttpRequest).doDelete('http://localhost:3000/testDelete')
        .map(res => expect(res.status).toBe(200))
        .toPromise();
});

it('Should handle an error', () => {
    return new Rest(XMLHttpRequest).wrap(errorInterceptor).doGet<TestObject>('http://localhost:3000/404')
        .toPromise()
        .then(() => {}, (val) => expect(val.message).toBe('Cannot GET /404\n'));
});
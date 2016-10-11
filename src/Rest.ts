/// <reference types="rest" />
import {Observable} from 'rx';
import * as rest from 'rest';
import * as mime from 'rest/interceptor/mime';
import * as errorCode from 'rest/interceptor/errorCode';

export default class Rest {
    client: rest.Client;

    constructor(client: rest.Client = rest.wrap(mime, {mime: 'application/json'}).wrap(errorCode)) {
        this.client = client;
    }

    wrap<T>(interceptor: rest.Interceptor<T>, config?: T): Rest {
        return new Rest(this.client.wrap(interceptor, config));
    }

    doGet<T>(path: string): Observable<T> {
        return Observable.fromPromise(this.client(path)).map(response => response.entity);
    }

    doPut<T, R>(path: string, entity: T): Observable<R> {
        return Observable.fromPromise(this.client({
            path,
            method: 'PUT',
            entity
        })).map(response => response.entity);
    }

    doPost<T, R>(path: string, entity: T): Observable<R> {
        return Observable.fromPromise(this.client({
            path,
            method: 'POST',
            entity
        })).map(response => response.entity);
    }

    doDelete(path: string): Observable<any> {
        return Observable.fromPromise(this.client({
            path,
            method: 'DELETE'
        }));
    }
}

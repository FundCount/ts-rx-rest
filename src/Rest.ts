import {Observable} from 'rx';
import * as Client from 'rest';
import * as mime from 'rest/interceptor/mime';
import * as errorCode from 'rest/interceptor/errorCode';

const rest = Client.wrap(mime, {mime: 'application/json'}).wrap(errorCode);

export default class Rest {

    static doGet<T>(path: string): Observable<T> {
        return Observable.fromPromise(rest(path)).map(response => response.entity);
    }

    static doPut<T, R>(path: string, entity: T): Observable<R> {
        return Observable.fromPromise(rest({
            path,
            method: 'PUT',
            entity
        })).map(response => response.entity);
    }

    static doPost<T, R>(path: string, entity: T): Observable<R> {
        return Observable.fromPromise(rest({
            path,
            method: 'POST',
            entity
        })).map(response => response.entity);
    }

    static doDelete(path: string): Observable<any> {
        return Observable.fromPromise(rest({
            path,
            method: 'DELETE'
        }));
    }
}
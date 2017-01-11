import {Observable} from 'rx';

export const jsonInterceptor = (o: Observable<any>) => o.map(v => JSON.parse(v.responseText));

export class RestError extends Error {
    constructor(public message: string, public entity: any) {
        super(message);
    }
}

export const errorInterceptor = (o: Observable<any>) =>
    o.flatMap(v => {
        if (v.status >= 200 && v.status < 300) {
            return Observable.just(v);
        } else {
            let entity;
            try {
                const jsonContentType = "application/json";
                if (v.getResponseHeader("Content-Type").substring(0, jsonContentType.length) === jsonContentType) {
                    entity = JSON.parse(v.responseText);
                }
            } catch (e) {

            }
            return Observable.throw(new RestError(!!v.statusText ? v.statusText : v.responseText, entity))
        }
    });

export default class Rest {

    interceptors: Array<(o: Observable<any>) => Observable<any>> = [];

    wrap(interceptor: (o: Observable<any>) => Observable<any>) {
        this.interceptors.push(interceptor);
        return this;
    }

    constructor(private httpRequestConstructor?: new () => XMLHttpRequest) {
    }

    ajax<T>(url: string, method: string, data?: any): Observable<T> {
        const result = Observable.create<any>(observer => {
            try {
                const x = (this.httpRequestConstructor) ? new this.httpRequestConstructor : new XMLHttpRequest();
                x.open(method, url, true);
                x.setRequestHeader('Content-Type', 'application/json');
                x.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        observer.onNext(this);
                        observer.onCompleted();
                    }
                };
                x.send(data ? JSON.stringify(data) : undefined);
            } catch (e) {
                observer.onError(e);
                observer.onCompleted();
            }
        });


        return this.interceptors.reduce((acc, interceptor) => interceptor(acc), result);
    }

    doGet<T>(path: string): Observable<T> {
        return this.ajax<T>(path, 'GET');
    }

    doPut<T, R>(path: string, entity: T): Observable<R> {
        return this.ajax<R>(path, 'PUT', entity);
    }

    doPost<T, R>(path: string, entity: T): Observable<R> {
        return this.ajax<R>(path, 'POST', entity);
    }

    doDelete(path: string): Observable<any> {
        return this.ajax<any>(path, 'DELETE');
    }
}

import {Observable} from 'rx';

export const jsonInterceptor = (o: Observable<any>) => o.map(v => JSON.parse(v.responseText));
export const errorInterceptor = (o: Observable<any>) =>
    o.flatMap(v => v.status >= 200 && v.status < 300 ? Observable.just(v) : Observable.throw(new Error(v.responseText)));


export default class Rest {

    interceptors: Array<(o: Observable<any>) => Observable<any>> = [];

    wrap(interceptor: (o: Observable<any>) => Observable<any>) {
        this.interceptors.push(interceptor);
        return this;
    }

    constructor(private httpRequestConsturtor?: new () => XMLHttpRequest) {
    }

    ajax<T>(url: string, method: string, data: any): Observable<T> {
        const result = Observable.create<any>(observer => {
            try {
                const x = (this.httpRequestConsturtor) ? new this.httpRequestConsturtor : new XMLHttpRequest();
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
        return this.ajax<T>(path, 'GET', undefined);
    }

    doPut<T, R>(path: string, entity: T): Observable<R> {
        return this.ajax<R>(path, 'PUT', entity);
    }

    doPost<T, R>(path: string, entity: T): Observable<R> {
        return this.ajax<R>(path, 'POST', entity);
    }

    doDelete(path: string): Observable<any> {
        return this.ajax<any>(path, 'DELETE', undefined);
    }
}

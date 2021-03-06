import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

export const jsonInterceptor = (o: Observable<XMLHttpRequest>) =>
    o.pipe(
        map(v => v.status === 204 ? undefined : JSON.parse(v.responseText)),
        catchError(e => {
            let entity;
            try {
                const jsonContentType = 'application/json';
                if (e.response.getResponseHeader('Content-Type').substring(0, jsonContentType.length) === jsonContentType) {
                    entity = JSON.parse(e.response.responseText);
                }
            } catch (e) {
            }
            return throwError(new RestError(e.message, e.response, entity));
        })
    );

export class RestError extends Error {
    constructor(public message: string, public response: XMLHttpRequest, public entity: any) {
        super(message);
    }
}

export const errorInterceptor = (o: Observable<XMLHttpRequest>) =>
    o.pipe(map(v => {
        if (v.status < 400) {
            return v;
        } else {
            throw new RestError(!!v.statusText ? v.statusText : v.responseText, v, undefined);
        }
    }));

export const withCredentialsInterceptor = (r: XMLHttpRequest) => {
    r.withCredentials = true;
    return r;
};

export default class Rest {

    interceptors: Array<(o: Observable<any>) => Observable<any>> = [];
    requestInterceptors: Array<(r: XMLHttpRequest) => XMLHttpRequest> = [];

    wrap(interceptor: (o: Observable<any>) => Observable<any>): Rest {
        this.interceptors.push(interceptor);
        return this;
    }

    wrapRequest(requestInterceptor: (r: XMLHttpRequest) => XMLHttpRequest): Rest {
        this.requestInterceptors.push(requestInterceptor);
        return this;
    }

    withCredentials(): Rest {
        return this.wrapRequest(withCredentialsInterceptor);
    }

    constructor(private httpRequestConstructor?: new () => XMLHttpRequest) {
    }

    ajax<T>(url: string, method: string, data?: any, onUploadProgress?: (e: ProgressEvent) => any): Observable<T> {
        const result = new Observable<XMLHttpRequest>(observer => {
            try {
                const x = (this.httpRequestConstructor) ? new this.httpRequestConstructor : new XMLHttpRequest();
                x.open(method, url, true);
                x.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        observer.next(this);
                        observer.complete();
                    }
                };
                if (onUploadProgress) {
                    x.upload.addEventListener('progress', onUploadProgress);
                }
                const updatedRequest = this.requestInterceptors.reduce((acc, interceptor) => interceptor(acc), x);
                if (data instanceof FormData) {
                    updatedRequest.send(data);
                } else {
                    updatedRequest.setRequestHeader('Content-Type', 'application/json');
                    updatedRequest.send(data ? JSON.stringify(data) : undefined);
                }
            } catch (e) {
                observer.error(e);
                observer.complete();
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

    doPost<T, R>(path: string, entity: T, onUploadProgress?: (e: ProgressEvent) => any): Observable<R> {
        return this.ajax<R>(path, 'POST', entity, onUploadProgress);
    }

    doDelete(path: string): Observable<any> {
        return this.ajax<any>(path, 'DELETE');
    }
}

import {Observable} from 'rx';
import * as Client from 'rest/client/xhr';

export default class Rest {

    static doGet<T>(url: string): Observable<T> {
        return Observable.create<T>(observer => {
            Client({
                method: 'GET',
                path: url,
                headers: {'Accept': 'application/json'}
            }).then(
                (res) => {
                    observer.onNext(JSON.parse(res.entity));
                    observer.onCompleted();
                },
                (err) => {
                    observer.onError(err);
                    observer.onCompleted();
                })
        });
    }
}
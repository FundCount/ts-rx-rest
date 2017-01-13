# ts-rx-rest
RxJs Http client for Typescript.

Provides convenient typed wrappers for http verbs:

* doGet
* doPost
* doPut
* doDelete

### Install
```
$ npm install --save ts-rx-rest
```
Since rx 4.* doesn't have @types, you have to manually install rx and define correct typings as follows:
```
$ npm install --save rx
```
Create file `index.d.ts` along with `package.json` with the following content:
```
/// <reference path="node_modules/rx/ts/rx.all.d.ts" />
```

### Usage


```typescript
import Rest, {errorInterceptor, jsonInterceptor} from 'ts-rx-rest';

const rest = new Rest()
    .wrap(errorInterceptor) // forwards an XMLHttpRequest object to an error branch of the observable
    .wrap(jsonInterceptor); // converts text representation of the response to json

rest.doGet<Array<User>>('/users').subscribe(users => console.log(users));
```

#### Custom interceptors

```typescript
const accessDenied = (observable: Observable<any>) =>
    observable.doOnError(err => {
        if (err.response.status === 403 || err.response.status === 401) {
            // Do some stuff
        }
    });
```
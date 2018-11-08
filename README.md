# ts-rx-rest
RxJs Http client for Typescript.

[![npm version](https://badge.fury.io/js/ts-rx-rest.svg)](https://badge.fury.io/js/ts-rx-rest)

Provides convenient typed wrappers for http verbs:

* doGet
* doPost
* doPut
* doDelete

### Install
```
$ npm install --save ts-rx-rest
```

### Usage


```typescript
import Rest, {errorInterceptor, jsonInterceptor, withCredentialsInterceptors} from 'ts-rx-rest';

const rest = new Rest()
    .wrapRequest(withCredentialsInterceptors) // or .withCredentials()
    .wrap(errorInterceptor) // forwards an XMLHttpRequest object to an error branch of the observable
    .wrap(jsonInterceptor); // converts text representation of the response to json

rest.doGet<Array<User>>('/users').subscribe(users => console.log(users));
```

#### Custom interceptors

#### Request interceptors

```typescript
const withCredentialsInterceptors = (r: XMLHttpRequest) => {
    r.withCredentials = true;
    return r;
};
```

#### Response interceptors

```typescript
const accessDenied = (observable: Observable<any>) =>
    observable.doOnError(err => {
        if (err.response.status === 403 || err.response.status === 401) {
            // Do some stuff
        }
    });
```

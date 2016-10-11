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


```
import Rest from 'ts-rx-rest';

const rest = new Rest();

rest.doGet<Array<User>>('/users').subscribe(users => console.log(users));
```

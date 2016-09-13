# ts-rx-rest
RxJs Http client for Typescript.


### Install
```
$ npm install --save ts-rx-rest
```


### Usage

```
import Rest from 'ts-rx-rest';

Rest.doGet<Array<User>>('/users').subscribe(users => console.log(users));
```
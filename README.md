# express-dummy-server

![GitHub Workflow Status (with event)](https://img.shields.io/github/actions/workflow/status/doppelganger113/express-dummy-server/release.yaml)
[![npm version](https://badge.fury.io/js/express-dummy-server.svg)](https://badge.fury.io/js/express-dummy-server)

Dummy server used for integration testing built on top of [express.js](https://expressjs.com).

Spins up an express server on a random available port and provides basic utility functions to easy testing
against a real HTTP server.

```bash
npm install express-dummy-server
```

## Usage

It's easier to create a standalone file that will have the dummy http service which can be re-used with
different values across tests.

`dummy-user-server.ts`
```typescript
import {createDummyServer, DummyServer, RequestSnapshot} from "express-dummy-server";
import {RequestHandler} from "express";

// Enum is used for mapping handlers so that we can change handlers later on
export enum DummyUserServiceHook {
    getUser = 'getUser'
}

export const createDummyUserService = async (
    requestHooks?: Map<DummyUserServiceHook, RequestHandler | undefined>
): Promise<DummyServer> =>
    createDummyServer(async (app) => {
        app.get('/users/:id', (req, res, next) => {
            const {id} = req.params;
            // Here we check if there is a new mapped handler that we should use
            const getUserHook = requestHooks?.get(DummyUserServiceHook.getUser);
            if (getUserHook) {
                return getUserHook(req, res, next)
            }
            res.json({id: Number(id), name: 'John'})
        });
    });
```

```typescript
import axios from "axios";
import {RequestSnapshot} from "express-dummy-server";
import {RequestHandler} from "express";
import {DummyUserServiceHook} from './dummy-user-server';


describe('DummyServer', () => {
    let server: DummyServer;
    let hooks = new Map<DummyUserServiceHook, RequestHandler | undefined>();

    beforeAll(async () => {
        server = await createDummyUserService(hooks);
    });

    afterAll(() => {
        server.close();
    });

    beforeEach(() => {
       server.requestStore.clear();
       hooks.clear();
    });

    it('should return a dummy server response', async () => {
        const res = await axios.get(`${server.url}/users/2`);
        expect(res.data).toEqual({id: 2, name: 'John'});

        const requestSnapshots = server.requestStore.get('/users/2');
        expect(requestSnapshots).toHaveLength(1);
        const {body, headers, method, params, query} = (requestSnapshots as RequestSnapshot[])[0];

        expect(method).toBe('GET');
        expect(body).toEqual({});
    });
})
```

## Mocking during tests

When we want to have a different behaviour for a different test, we can use the hook to select the handler
and re-map it's functionality. Note that these hooks need to be created in the dummy server first.

```typescript
it('should return a mocked dummy server response', async () => {
    hooks.set(DummyUserServiceHook.getUser, (req, res) => {
        const {id} = req.params;
        res.json({id: Number(id), name: 'Hello Mike'});
    })
    const res = await axios.get(`${server.url}/users/2`);
    expect(res.data).toEqual({id: 2, name: 'Hello Mike'})

    const requestSnapshots = server.requestStore.get('/users/2');
    expect(requestSnapshots).toHaveLength(1);
    const {body, headers, method, params, query} = (requestSnapshots as RequestSnapshot[])[0];
    expect(method).toBe('GET');
    expect(body).toEqual({});
});
```
This allows us high level of flexibility especially since `express` is familiar to everyone.

## Utilities

There are some utility functions in the library that speed up writing certain hooks, like:
```typescript
import {respondJson} from "./request-handler-utils";

// respondJson
hooks.set(DummyUserServiceHook.getUser, respondJson({id: Number(id), name: 'Hello Mike'}));

// Which is identical to
hooks.set(DummyUserServiceHook.getUser, (req, res) => {
    const {id} = req.params;
    res.json({id: Number(id), name: 'Hello Mike'});
})
```

## Debugging

If you want to debug requests and responses made against the server you can turn on the debug mode 
to console log them and (if needed) pass the logger to it.

```typescript
import {DummyServerOptions, createDummyServer} from "express-dummy-server";

const options: DummyServerOptions = {debug: true};

const dummyUserServer = await createDummyServer(async (app) => {
    app.get('/users/:id', respondJson({id: 1, name: 'John'}));
}, options);
```

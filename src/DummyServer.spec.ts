import axios from "axios";
import {createDummyServer, DummyServer, RequestSnapshot} from "./DummyServer";
import {RequestHandler} from "express";

enum DummyUserServiceHook {
    getUser = 'getUser'
}

const createDummyUserService = async (
    requestHooks?: Map<DummyUserServiceHook, RequestHandler | undefined>
): Promise<DummyServer> =>
    createDummyServer(async (app) => {
        app.get('/users/:id', (req, res, next) => {
            const {id} = req.params;
            const getUserHook = requestHooks?.get(DummyUserServiceHook.getUser);
            if (getUserHook) {
                return getUserHook(req, res, next)
            }
            res.json({id: Number(id), name: 'John'})
        });
    });

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
})
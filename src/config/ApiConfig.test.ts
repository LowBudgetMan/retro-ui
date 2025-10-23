import '@jest/globals';

import {ApiConfig} from "./ApiConfig.ts";

describe('API Config', () => {
    it('should do a thing', () => {
        expect(ApiConfig.baseApiUrl()).toEqual('http://localhost:8080');
    });
})


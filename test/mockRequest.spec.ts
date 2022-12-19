import { createAlova } from 'alova';
import VueHook from 'alova/vue';
import createAlovaMockAdapter from '../src/createAlovaMockAdapter';
import defineMock from '../src/defineMock';

describe('mock request', () => {
	test('response with plain body data', async () => {
		const mocks = defineMock({
			'[POST]/detail': () => {
				return {
					id: 1
				};
			}
		});

		// 模拟数据请求适配器
		const mockRequestAdapter = createAlovaMockAdapter([mocks], {
			delay: 50,
			onMockResponse: data => data.body,
			mockRequestLogger: false
		});

		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			statesHook: VueHook,
			requestAdapter: mockRequestAdapter
		});

		alovaInst.Post('/detail');
	});
});

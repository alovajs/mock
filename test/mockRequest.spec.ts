import { createAlova } from 'alova';
import VueHook from 'alova/vue';
import createAlovaMockAdapter from '../src/createAlovaMockAdapter';
import defineMock from '../src/defineMock';

describe('mock request', () => {
	test('response with plain body data', async () => {
		const mockApi = jest.fn();
		const mocks = defineMock({
			'[POST]/detail': ({ query, params, data, headers }) => {
				mockApi();
				expect(query).toStrictEqual({ a: '1', b: '2', c: '3' });
				expect(params).toStrictEqual({});
				expect(data).toStrictEqual({ p1: 'p1', p2: 'p2' });
				expect(headers).toStrictEqual({ h1: 'h1' });
				return {
					id: 1
				};
			}
		});

		// 模拟数据请求适配器
		const mockResponse = jest.fn();
		const mockRequestAdapter = createAlovaMockAdapter([mocks], {
			delay: 10,
			onMockResponse: ({ status, statusText, body }, { params, query, data, headers }) => {
				mockResponse();
				expect(status).toBe(200);
				expect(statusText).toBe('ok');
				expect(body).toStrictEqual({ id: 1 });
				expect(query).toStrictEqual({ a: '1', b: '2', c: '3' });
				expect(params).toStrictEqual({});
				expect(data).toStrictEqual({ p1: 'p1', p2: 'p2' });
				expect(headers).toStrictEqual({ h1: 'h1' });

				if (status >= 300) {
					const err = new Error(statusText);
					err.name = status.toString();
					throw err;
				}
				return {
					response: body,
					headers: {}
				};
			},
			mockRequestLogger: false
		});

		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			statesHook: VueHook,
			requestAdapter: mockRequestAdapter
		});
		const payload = await alovaInst
			.Post(
				'/detail?a=1&b=2',
				{ p1: 'p1', p2: 'p2' },
				{
					params: {
						c: 3
					},
					headers: {
						h1: 'h1'
					}
				}
			)
			.send();
		expect(payload).toStrictEqual({ id: 1 });
		expect(mockApi).toBeCalled();
		expect(mockResponse).toBeCalled();
	});

	test('should receive all request data', async () => {
		const mocks = defineMock({
			'[POST]/detail': () => {
				return {
					id: 1
				};
			}
		});

		const mockFn = jest.fn();
		// 模拟数据请求适配器
		const mockRequestAdapter = createAlovaMockAdapter([mocks], {
			delay: 10,
			onMockResponse: responseData => {
				return {
					response: responseData.body,
					headers: {}
				};
			},
			mockRequestLogger: ({ isMock, url, method, headers, query, data, responseHeaders, response }) => {
				mockFn();
				expect(isMock).toBeTruthy();
				expect(url).toBe('http://xxx/detail?aa=1&bb=2');
				expect(method).toBe('POST');
				expect(headers).toStrictEqual({
					customHeader: 1
				});
				expect(query).toStrictEqual({
					aa: '1',
					bb: '2'
				});
				expect(data).toStrictEqual({});
				expect(responseHeaders).toStrictEqual({});
				expect(response).toStrictEqual({
					id: 1
				});
			}
		});

		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			statesHook: VueHook,
			requestAdapter: mockRequestAdapter
		});
		const payload = await alovaInst
			.Post(
				'/detail?aa=1&bb=2',
				{},
				{
					headers: {
						customHeader: 1
					}
				}
			)
			.send();
		expect(payload).toStrictEqual({ id: 1 });
		expect(mockFn).toBeCalled();
	});

	test('response with status and statusText', async () => {
		const mocks = defineMock({
			'[POST]/detail': () => {
				return {
					status: 403,
					statusText: 'customer error',
					responseHeaders: {
						rh1: 'rh1'
					}
				};
			}
		});

		// 模拟数据请求适配器
		const mockRequestAdapter = createAlovaMockAdapter([mocks], {
			delay: 10,
			onMockResponse: ({ status, statusText, responseHeaders, body }) => {
				expect(responseHeaders).toStrictEqual({ rh1: 'rh1' });
				if (status >= 300) {
					const err = new Error(statusText);
					err.name = status.toString();
					throw err;
				}
				return body;
			}
		});

		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			statesHook: VueHook,
			requestAdapter: mockRequestAdapter
		});

		const mockFn = jest.fn();
		try {
			await alovaInst.Post('/detail').send();
		} catch (err: any) {
			mockFn();
			expect(err.name).toBe('403');
			expect(err.message).toBe('customer error');
		}
		expect(mockFn).toBeCalledTimes(1);
	});

	test('should receive error when throw it in mock function', async () => {
		const mocks = defineMock({
			'[POST]/detail': () => {
				throw new Error('network error');
			}
		});

		// 模拟数据请求适配器
		const mockRequestAdapter = createAlovaMockAdapter([mocks], {
			delay: 10,
			onMockResponse: ({ status, statusText, body }) => {
				if (status >= 300) {
					const err = new Error(statusText);
					err.name = status.toString();
					throw err;
				}
				return {
					response: body,
					headers: {}
				};
			},
			onMockError: error => new Error('new error:' + error.message)
		});

		const alovaInst = createAlova({
			baseURL: 'http://xxx',
			statesHook: VueHook,
			requestAdapter: mockRequestAdapter
		});

		const mockFn = jest.fn();
		try {
			await alovaInst.Post('/detail').send();
		} catch (err: any) {
			mockFn();
			expect(err.message).toBe('new error:network error');
		}
		expect(mockFn).toBeCalledTimes(1);
	});
});

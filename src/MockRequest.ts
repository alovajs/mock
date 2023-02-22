import { Method, RequestElements } from 'alova';
import { Mock, MockRequestInit, MockResponse } from '../typings';
import consoleRequestInfo from './consoleRequestInfo';
import { falseValue, isFn, isNumber, isString, parseUrl, trueValue, undefinedValue } from './helper';

const defaultOnMockResponse = ({ status = 200, statusText = 'ok', body }: MockResponse) =>
	new Response(JSON.stringify(body), {
		status,
		statusText
	});
type MockRequestInitWithMock<R, T, RC, RE, RH> = MockRequestInit<R, T, RC, RE, RH> & { mock: Mock };
export default function MockRequest<RC, RE, RH>(
	{
		// 此enable为总开关
		enable = trueValue,
		delay = 2000,
		httpAdapter,
		mockRequestLogger = consoleRequestInfo,
		mock,
		onMockResponse = defaultOnMockResponse as (response: MockResponse) => any
	}: MockRequestInitWithMock<any, any, RC, RE, RH> = { mock: {} }
) {
	return (elements: RequestElements, method: Method<any, any, any, any, RC, RE, RH>) => {
		// 获取当前请求的模拟数据集合，如果enable为false，则不返回模拟数据
		mock = (enable && mock) || {};

		const { url, data, type, headers: requestHeaders } = elements;
		const { pathname, query } = parseUrl(url);
		const params: Record<string, string> = {};
		const pathnameSplited = pathname.split('/');
		const foundMockDataKeys = Object.keys(mock).filter(key => {
			// 如果key的前面是-，表示忽略此模拟数据，此时也返回false
			if (key.startsWith('-')) {
				return falseValue;
			}

			// 匹配请求方法
			let method = 'GET';
			key = key.replace(/^\[(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|TRACE|CONNECT)\]/i, (_, $1) => {
				method = $1.toUpperCase();
				return '';
			});

			// 请求方法不匹配，返回false
			if (method !== type.toUpperCase()) {
				return falseValue;
			}

			const keySplited = key.split('/');
			if (keySplited.length !== pathnameSplited.length) {
				return falseValue;
			}

			// 通过相同下标匹配来判断是否匹配该路径
			// 如果遇到通配符则直接通过
			for (const i in keySplited) {
				const keySplitedItem = keySplited[i];
				const matchedParamKey = (keySplitedItem.match(/^\{(.*)\}$/) || ['', ''])[1];
				if (!matchedParamKey) {
					if (keySplitedItem !== pathnameSplited[i]) {
						return falseValue;
					}
				} else {
					params[matchedParamKey] = pathnameSplited[i];
				}
			}
			return trueValue;
		});

		// 如果匹配了多个，则优先使用没有通配符的，如果都有通配符则使用第一个匹配到的
		let finalKey = foundMockDataKeys.find(key => !/\{.*\}/.test(key));
		finalKey = finalKey || foundMockDataKeys.shift();
		const mockDataRaw = finalKey ? mock[finalKey] : undefinedValue;

		// 如果没有匹配到模拟数据，则表示要发起请求使用httpAdapter来发送请求
		if (mockDataRaw === undefinedValue) {
			if (httpAdapter) {
				isFn(mockRequestLogger) && mockRequestLogger(falseValue, url, type, requestHeaders, query);
				return httpAdapter(elements, method);
			} else {
				throw new Error(`could not find the httpAdapter which send request.\n[url]${url}`);
			}
		}

		let timer: NodeJS.Timeout;
		return {
			response: () =>
				new Promise<RE>((resolve, reject) => {
					timer = setTimeout(() => {
						try {
							// response支持返回promise对象
							Promise.resolve(
								isFn(mockDataRaw)
									? mockDataRaw({
											query,
											params,
											data
									  })
									: mockDataRaw
							)
								.then(response => {
									let status = 200,
										statusText = 'ok',
										body = undefinedValue;

									// 如果没有返回值则认为404
									if (response === undefinedValue) {
										status = 404;
										statusText = 'api not found';
									} else if (isNumber(response.status) && isString(response.statusText)) {
										// 返回了自定义状态码和状态文本，将它作为响应信息
										status = response.status;
										statusText = response.statusText;
										body = response.body;
									} else {
										// 否则，直接将response作为响应数据
										body = response;
									}

									// 打印模拟数据请求信息
									isFn(mockRequestLogger) && mockRequestLogger(trueValue, url, type, requestHeaders, query, data, body);
									resolve(onMockResponse({ status, statusText, body }));
								})
								.catch(error => reject(error));
						} catch (error: any) {
							reject(error);
						}
					}, delay);
				}),
			headers: () => Promise.resolve<Headers>(new Headers()),
			abort: () => {
				clearTimeout(timer);
			}
		};
	};
}

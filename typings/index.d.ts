import { AlovaRequestAdapter, Method, RequestBody } from 'alova';

interface MockServerRequest {
	headers: Record<string, any>;
	query: Record<string, any>;
	params: Record<string, any>;
	data?: RequestBody;
}

interface ResponseHeaders {
	[x: string]: any;
}
interface LoggerMockRequestResponse extends MockServerRequest {
	isMock: boolean;
	url: string;
	method: string;
	responseHeaders: ResponseHeaders;
	response?: any;
}
interface MockRequestLoggerAdapter {
	(loggerData: LoggerMockRequestResponse): void;
}
/**
 * 模拟响应函数
 */
interface MockResponse<RC = any, RE = any, RH = any> {
	(
		response: {
			status: number;
			statusText: string;
			responseHeaders: ResponseHeaders;
			body: any;
		},
		request: MockServerRequest,
		currentMethod: Method<any, any, any, any, RC, RE, RH>
	): {
		response: RE;
		headers: RH;
	};
}
interface MockError {
	(error: Error, currentMethod: Method): any;
}
interface MockRequestInit<R, T, RC, RE, RH> {
	enable?: boolean;
	delay?: number;
	httpAdapter?: AlovaRequestAdapter<R, T, RC, RE, RH>;
	mockRequestLogger?: boolean | MockRequestLoggerAdapter; // 是否打印模拟请求信息，便于调试
	onMockResponse?: MockResponse<RC, RE, RH>;
	onMockError?: MockError;
}

interface StatusResponse {
	status: number;
	statusText: string;
	responseHeaders?: ResponseHeaders;
	body?: any;
}
type MockFunction = (request: MockServerRequest) => StatusResponse | any;
type Mock = Record<string, MockFunction | string | number | Record<string, any> | any[]>;

interface MockWrapper {
	enable: boolean;
	data: Mock;
}

export declare function createAlovaMockAdapter<R = any, T = any, RC = any, RE = any, RH = any>(
	mockWrapper: MockWrapper[],
	options?: MockRequestInit<R, T, RC, RE, RH>
): AlovaRequestAdapter<R, T, RC, RE, RH>;

export declare function defineMock(mock: Mock, enable?: boolean): MockWrapper;

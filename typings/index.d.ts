import { AlovaRequestAdapter } from 'alova';

interface MockServerRequest {
	headers: Record<string, any>;
	query: Record<string, any>;
	params: Record<string, any>;
	data: Record<string, any>;
}

interface LoggerMockRequestResponse extends MockServerRequest {
	isMock: boolean;
	url: string;
	method: string;
	response?: any;
}
interface MockRequestLoggerAdapter {
	(loggerData: LoggerMockRequestResponse): void;
}
interface MockResponse {
	status?: number;
	statusText?: string;
	body?: any;
}
interface MockRequestInit<R, T, RC, RE, RH> {
	enable?: boolean;
	delay?: number;
	httpAdapter?: AlovaRequestAdapter<R, T, RC, RE, RH>;
	mockRequestLogger?: boolean | MockRequestLoggerAdapter; // 是否打印模拟请求信息，便于调试
	onMockResponse?: (response: Required<MockResponse>, request: MockServerRequest) => any;
}

type MockFunction = (request: MockServerRequest) => any;
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

import { MockRequestLoggerAdapter } from '../typings';

// 预定义的样式和固定文本
const mockLabel = 'Mock';
const mockLabelColor = '#64E8D6';
const realRequestLabel = 'Realtime';
const realRequestLabelColor = '#999999';
const labelStyle = (bgColor: string, borderColor = '') => {
	let style = `padding: 2px 6px; background: ${bgColor}; color: white;`;
	if (borderColor) {
		style += `border: solid 1px ${borderColor}`;
	}
	return style;
};
const titleStyle = () => 'color: black; font-size: 12px; font-weight: bolder';
const transform2TableData = (obj: AnyObject) => {
	const tableData = {} as AnyObject;
	for (const key in obj) {
		tableData[key] = { value: obj[key] };
	}
	return tableData;
};

type AnyObject = Record<string, any>;
// 打印请求信息，模拟数据请求专用
const consoleRequestInfo: MockRequestLoggerAdapter = ({
	isMock,
	url,
	method,
	headers,
	query,
	data,
	responseHeaders,
	response
}) => {
	console.groupCollapsed(
		`%c${isMock ? mockLabel : realRequestLabel}`,
		labelStyle(isMock ? mockLabelColor : realRequestLabelColor),
		url
	);

	// 请求方法
	console.log('%c[Method]', titleStyle(), method.toUpperCase());

	// 输出Request Headers
	console.log('%c[Request Headers]', titleStyle());
	console.table(transform2TableData(headers));

	// 输出Query String Parameters
	console.log('%c[Query String Parameters]', titleStyle());
	console.table(transform2TableData(query));

	// 输出request body
	console.log('%c[Request Body]', titleStyle(), data || '');

	// 输出response body
	if (isMock) {
		// 响应头有数据时，输出Response Headers
		if (Object.keys(responseHeaders).length > 0) {
			console.log('%c[Response Headers]', titleStyle());
			console.table(transform2TableData(responseHeaders));
		}
		console.log('%c[Response Body]', titleStyle(), response || '');
	}
	console.groupEnd();
};

export default consoleRequestInfo;

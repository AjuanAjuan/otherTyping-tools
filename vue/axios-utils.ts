import { AxiosInstance } from "axios";
import { HttpClient, ApiConfig } from "@/http-client/http-client";
import { ElMessageBox, ElMessage } from "element-plus";
// import router from "@/router";
// import NProgress from "nprogress";
import $TOOL from '@/utils/tool'
// const BaseAPI = "";
const BASE_PATH = "";

// const isProd = import.meta.env.PROD;
/**
 * 接口服务器配置
 */
export const serveConfig: ApiConfig = {
	// 如果是 Angular 项目，则取消下面注释，并删除 process.env.NODE_ENV !== "production"
	// basePath: !environment.production
	baseURL: import.meta.env.VITE_GLOB_API_URL,//"https://localhost:44332",
};

// token 键定义
export const accessTokenKey = "TOKEN";//"access-token";
export const refreshAccessTokenKey = `x-${accessTokenKey}`;

// 清除 token
export const clearAccessTokens = () => {
	// window.localStorage.removeItem(accessTokenKey);
	// window.localStorage.removeItem(refreshAccessTokenKey);
	$TOOL.data.remove(accessTokenKey)
	$TOOL.data.remove(refreshAccessTokenKey)

	// 这里可以添加清除更多 Key =========================================
};

// 错误处理
export const throwError = (message: string) => {
	throw new Error(message);
};

// /**
//  * axios 默认实例
//  */
// export const axiosInstance: AxiosInstance = globalAxios;

// 这里可以配置 axios 更多选项 =========================================
//设置拦截器
const setInterceptors = (
	axiosInstance: AxiosInstance,
	dealLoading: (isLoading: boolean) => void
) => {
	// axios 请求拦截
	axiosInstance.interceptors.request.use(
		(conf) => {
			conf.headers!["ui"] = 'woow'
			// 获取本地的 token
			const accessToken = $TOOL.data.get(accessTokenKey)//window.localStorage.getItem(accessTokenKey);
			if (accessToken) {
				// 将 token 添加到请求报文头中
				conf.headers!["Authorization"] = `Bearer ${accessToken}`;

				// // 判断 accessToken 是否过期
				// const jwt: any = decryptJWT(accessToken);
				// const exp = getJWTDate(jwt.exp as number);

				// // token 已经过期
				// if (new Date() >= exp) {
				// 	// 获取刷新 token
				// 	// const refreshAccessToken = window.localStorage.getItem(
				// 	// 	refreshAccessTokenKey
				// 	// );
				// 	const refreshAccessToken = $TOOL.data.get(refreshAccessTokenKey)
				// 	// 携带刷新 token
				// 	if (refreshAccessToken) {
				// 		conf.headers![
				// 			"X-Authorization"
				// 		] = `Bearer ${refreshAccessToken}`;
				// 	}
				// }
			}
			dealLoading(true);
			// 这里编写请求拦截代码 =========================================
			return conf;
		},
		(error) => {
			//  // 处理请求错误
			//  if (error.request) {
			//  }
			//  // 这里编写请求错误代码
			return Promise.reject(error);
		}
	);

	// axios 响应拦截
	axiosInstance.interceptors.response.use(
		(response) => {
			// // 检查并存储授权信息
			// checkAndStoreAuthentication(response);

			//  // 处理规范化结果错误
			//  const serve = response.data;
			//  if (serve && serve.hasOwnProperty("errors") && serve.errors) {
			//    // 处理规范化 401 授权问题
			//    if (serve.errors === "401 Unauthorized") {
			// 	 clearAccessTokens();
			//    }

			//    throwError(
			// 	 !serve.errors
			// 	   ? "Request Error."
			// 	   : typeof serve.errors === "string"
			// 	   ? serve.errors
			// 	   : JSON.stringify(serve.errors)
			//    );
			//    return;
			//  }

			dealLoading(false);


			if (response.status == 200 && response.headers['content-disposition']) {//文件下载
				let filename =
					window.decodeURI(
						(response.headers['content-disposition'].split('=').pop() ?? '').split("'").pop() ??
						'',
					);
				const blob = new Blob([response.data], {
					type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8`,
				});
				// 获取heads中的filename文件名
				const downloadElement = document.createElement('a');
				// 创建下载的链接
				const href = window.URL.createObjectURL(blob);
				downloadElement.href = href;
				// 下载后文件名
				downloadElement.download = filename;
				document.body.appendChild(downloadElement);
				// 点击下载
				downloadElement.click(); // 下载完成移除元素
				document.body.removeChild(downloadElement);
				// 释放掉blob对象
				window.URL.revokeObjectURL(href);
				return response;
			}

			if (
				response &&
				response.data &&
				(response.data.code == 200 || response.data.code == 204)
			)
				return response;

			customHandleErr(
				response && response.data && response.data.code,
				response && response.data && response.data.message
					? response.data.message
					: response.data.type,
				response && response.data && response.data.message
					? JSON.parse(response.data.message)
					: {},
				response && response.data && response.data.message
			);

			return Promise.reject({
				status: response && response.data && response.data.code,
				data: response && response.data,
			});
			// return Promise.reject(response && response.data);

			// 这里编写响应拦截代码 =========================================

			//  return res;
		},
		(error) => {
			dealLoading(false);
			// 处理响应错误
			if (error.response) {
				// 获取响应对象并解析状态码
				const res = error.response;
				// const status: number = res.status;

				// 检查并存储授权信息
				checkAndStoreAuthentication(res);

				// // 检查 401 权限
				// if (status === 401) {
				// 	clearAccessTokens();
				// }
			}

			// 这里编写响应错误代码
			let response = error && error.response;
			customHandleErr(
				response && response.status,
				response && response.data && response.data.message
					? response.data.message
					: error && error.message,
				response && response.data && response.data.errors
					? response.data.errors
					: response && response.data && response.data.data,
				response && response.statusText
			);

			return Promise.reject(error);
		}
	);
};

/**
 * 检查并存储授权信息
 * @param res 响应对象
 */
export function checkAndStoreAuthentication(res: any): void {
	// // 读取响应报文头 token 信息
	// var accessToken = res.headers["access-token"]//res.headers[accessTokenKey];
	// var refreshAccessToken = res.headers[refreshAccessTokenKey];

	// // 判断是否是无效 token
	// if (accessToken === "invalid_token") {
	// 	clearAccessTokens();
	// }
	// // 判断是否存在刷新 token，如果存在则存储在本地
	// else if (
	// 	refreshAccessToken &&
	// 	accessToken &&
	// 	accessToken !== "invalid_token"
	// ) {
	// 	// window.localStorage.setItem(accessTokenKey, accessToken);
	// 	// window.localStorage.setItem(refreshAccessTokenKey, refreshAccessToken);
	// 	$TOOL.data.set(
	// 		accessTokenKey,
	// 		accessToken,
	// 		4 * 60 * 60
	// 	);
	// }
}

/**
 * 包装 Promise 并返回 [Error, any]
 * @param promise Promise 方法
 * @param errorExt 自定义错误信息（拓展）
 * @returns [Error, any]
 */
export function feature<T, U = Error>(
	promise: Promise<T>,
	errorExt?: object
): Promise<[U, undefined] | [null, T]> {
	return promise
		.then<[null, T]>((data: T) => [null, data])
		.catch<[U, undefined]>((err: U) => {
			if (errorExt) {
				const parsedError = Object.assign({}, err, errorExt);
				return [parsedError, undefined];
			}

			return [err, undefined];
		});
}

export const showNProgress = (isLoading: boolean): void => {
	// if (isLoading) NProgress.start();
	// else NProgress.done();
};

/**
 * 获取/创建服务 API 实例
 * @param apiType BaseAPI 派生类型
 * @param configuration 服务器配置对象
 * @param basePath 服务器地址
 * @param axiosObject axios 实例
 * @returns 服务API 实例
 */
export function getAPI<T extends HttpClient>(
	apiType: new (
		configuration?: ApiConfig,
		basePath?: string
		// axiosInstance?: AxiosInstance
	) => T,
	dealLoading: (isLoading: boolean) => void = showNProgress,
	configuration: ApiConfig = serveConfig,
	basePath: string = BASE_PATH
	// axiosObject: AxiosInstance = axiosInstance
) {
	let api = new apiType(configuration, basePath); //, axiosObject
	setInterceptors(api.instance, dealLoading);
	return api;
}

/**
 * 解密 JWT token 的信息
 * @param token jwt token 字符串
 * @returns <any>object
 */
export function decryptJWT(token: string): any {
	token = token.replace(/_/g, "/").replace(/-/g, "+");
	var json = decodeURIComponent(escape(window.atob(token.split(".")[1])));
	return JSON.parse(json);
}

/**
 * 将 JWT 时间戳转换成 Date
 * @description 主要针对 `exp`，`iat`，`nbf`
 * @param timestamp 时间戳
 * @returns Date 对象
 */
export function getJWTDate(timestamp: number): Date {
	return new Date(timestamp * 1000);
}

const customHandleErr = (
	code: number,
	serverMessage: string,
	notVerifyData: any,
	statusText: string
) => {
	const message = {
		error: (msg: string) => {
			ElMessage.error(msg);
			// uni.showToast({
			// 	title: msg,
			// 	icon: 'none',
			// });
		},
	};
	if (code == 400) {
		if (notVerifyData) {
			for (let k in notVerifyData) {
				if (Array.isArray(notVerifyData[k])) {
					notVerifyData[k].map((msg: string) => message.error(msg));
				} else {
					message.error(notVerifyData[k]);
				}
			}
		} else {
			message.error(serverMessage || "请求失败");
		}
	} else if (code == 401) {
		// message.error("未登录，请先登录");
		console.log("axios-utils", code)
		ElMessageBox.confirm(
			"当前用户已被登出或无权限访问当前资源，请尝试重新登录后再操作。",
			"无权限访问",
			{
				type: "error",
				closeOnClickModal: false,
				center: true,
				confirmButtonText: "重新登录",
			}
		)
			.then(async () => {
				const router = ((await import('@/router')) as any)['default']
				const useGoLogin = ((await import('@/hooks/web/usePage')) as any)['useGoLogin']
				let goLogin = useGoLogin(router)
				goLogin()
				// router.push({ path: "/login"});
				//window.location.href = router.resolve({ path: "/login" }).href + "?returnUrl=" + window.location.href
			})
			.catch(() => { });
		//可以调用登陆方法 // window.location.href = '/account/login';
	} else if (code == 403) {
		message.error(serverMessage || "权限不足,请联系管理员!");
	} else if (code == 404) {
		message.error("404，正在请求不存在的服务器记录！");
	} else if (code == 405) {
		message.error("调用方式不正确!");
	} else if (code == 410) {
		message.error("参数调用错误!");
	} else if (code == 422) {
		//参数校验失败
		// const notVerifyData = e.data?.data;
		if (notVerifyData) {
			let s = "";
			for (let k in notVerifyData) {
				// console.log("422", k, notVerifyData[k]);
				let item = notVerifyData[k];
				if (Array.isArray(item)) {
					for (let msg of item) {
						s += msg + ";\n";
						// message.error(msg);
					}
				} else {
					s += item + ";\n";
					// message.error(item);
				}
			}
			message.error(s);
		}
	} else if (code == 432) {
		message.error("访问人太多了，请稍后访问!");
	} else if (code == 433) {
		message.error("服务响应超时，请稍后访问!");
	} else if (code == 434) {
		message.error("服务器繁忙，请稍后访问!");
	} else if (code == 500) {
		message.error(serverMessage || "服务器开小差，请稍后访问!");
	} else if (code == 501) {
		message.error(statusText);
	} else {
		message.error(serverMessage);
	}
};

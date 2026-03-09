// ApiView.tsx
import { isFunction, isPromise } from '@/src/tool/is';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface ApiViewProps<T> {
    api: (params?: any) => Promise<T | undefined>;
    params?: any;
    onFinish?: (data?: T) => void;
    // 关键：children 是一个函数，接收状态并返回UI
    children: ((state: {
        data: T | undefined;
        loading: boolean;
        isFinish: boolean;
        err: any;
        reload: () => Promise<T | undefined>;
    }) => React.ReactNode) | React.ReactNode;
}

function ApiView<T>({ api, params, onFinish, children }: ApiViewProps<T>) {
    const [data, setData] = useState<T | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [isFinish, setIsFinish] = useState<boolean>(false);
    const [err, setErr] = useState<any>(null);

    const apiRef = useRef(api);
    const paramsRef = useRef(params);

    const handleApi = useCallback(async () => {
        try {
            setErr(null); // 开始新请求，清空旧错误
            setLoading(true);
            setIsFinish(false);

            let p = paramsRef.current; // 从 ref 中读取最新值
            if (isPromise(params)) {
                p = await params;
            }
            else if (isFunction(params)) {
                p = params()
            }

            // 状态变更
            setLoading(true)
            const result = await apiRef.current(p)
            setData(
                result
            )
            onFinish?.(result)
            setIsFinish(true);
            setLoading(false);

            return result

        } catch (error) {
            // 请求失败，更新错误状态
            setErr(error);
            setLoading(false);
            setIsFinish(false);
        }
    }, [])

    useEffect(() => {
        apiRef.current = api;
        paramsRef.current = params;
    }, [api, params]);

    useEffect(() => {
        handleApi();
    }, []);


    // 将内部状态和方法作为参数传递给 children 函数
    return <>{
        isFunction(children) ?
            children({ data, loading, isFinish, err, reload: handleApi })
            : children
    }</>;
}

export default ApiView;
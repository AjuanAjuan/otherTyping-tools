import { useConstDictStore } from '@/src/store/constDict';
import { isFunction } from '@/src/tool/is';

// interface Props {
//   modelValue?: string | number | null
//   code: string
// }

import React, { useState, useEffect } from 'react';
import { /* View, */ Text, /* StyleSheet */ } from 'react-native';

type ConstViewProps = {
  value: any,
  code: string,
  children?: React.ReactNode | (({ result }: { result: string }) => React.ReactNode)
}

const ConstView = ({ value, code, children }: ConstViewProps) => {

  const [result, setResult] = useState<string>('')
  const { initConstDict, getDictByCode } = useConstDictStore()


  useEffect(() => {
    // 初始化
    initConstDict();
  }, []);

  useEffect(() => {
    // 监听
    const r = getDictByCode(code);
    setResult(r.find(t => t.code === value)?.name || (value !== undefined && value !== null && value !== '' ? `(${value})` : ""));
  }, [value, code]);

  return (
    <Text className="ConstDictView" >
      {isFunction(children) ?
        children?.({ result }) : (children || result)}
    </Text >

  );
};

export default ConstView;

// const styles = StyleSheet.create({
// });


import React from 'react';
import { Text } from 'react-native';

type BooleanViewProps = {
  value?: boolean | null;
}

const BooleanView = (props: BooleanViewProps) => {
  return (
    <Text>{props.value ? '是' : '否'}</Text>
  );
};

export default BooleanView;
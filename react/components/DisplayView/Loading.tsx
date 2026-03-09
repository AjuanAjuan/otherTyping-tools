import { baseButtonColor } from '@/src/css/colorCss';
import React, { useEffect } from 'react';
import { View, Text,/*  StyleSheet, */ ActivityIndicator } from 'react-native';

type BaseLoadingProps = {
}

const BaseLoading = (props: BaseLoadingProps) => {

  useEffect(() => {
    return () => {
    };
  }, []);

  return (
    <View className="items-center justify-center py-4">
      <ActivityIndicator size="small" color={baseButtonColor.primary} />
      <Text className="mt-2 text-base text-gray-400">加载中...</Text>
    </View>
  );
};

export default BaseLoading;

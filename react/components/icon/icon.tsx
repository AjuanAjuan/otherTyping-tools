import React, { Suspense } from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';

export type IconType =
  | 'AntDesign'
  | 'FontAwesome'
  | 'MaterialIcons'
  | 'Ionicons'
  | 'FontAwesome6'
  | 'MaterialCommunityIcons'
  | 'Entypo'
  | 'EvilIcons'
  | 'Feather'
  | 'Fontisto'
  | 'Foundation'
  | 'SimpleLineIcons'
  | 'Octicons'
  | 'Zocial';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  type?: IconType;
  style?: StyleProp<ViewStyle>;
}

const iconMap: Record<IconType, React.LazyExoticComponent<any>> = {
  AntDesign: React.lazy(() => import('@expo/vector-icons/AntDesign')),
  FontAwesome: React.lazy(() => import('@expo/vector-icons/FontAwesome')),
  MaterialIcons: React.lazy(() => import('@expo/vector-icons/MaterialIcons')),
  Ionicons: React.lazy(() => import('@expo/vector-icons/Ionicons')),
  FontAwesome6: React.lazy(() => import('@expo/vector-icons/FontAwesome6')),
  MaterialCommunityIcons: React.lazy(() => import('@expo/vector-icons/MaterialCommunityIcons')),
  Entypo: React.lazy(() => import('@expo/vector-icons/Entypo')),
  EvilIcons: React.lazy(() => import('@expo/vector-icons/EvilIcons')),
  Feather: React.lazy(() => import('@expo/vector-icons/Feather')),
  Fontisto: React.lazy(() => import('@expo/vector-icons/Fontisto')),
  Foundation: React.lazy(() => import('@expo/vector-icons/Foundation')),
  SimpleLineIcons: React.lazy(() => import('@expo/vector-icons/SimpleLineIcons')),
  Octicons: React.lazy(() => import('@expo/vector-icons/Octicons')),
  Zocial: React.lazy(() => import('@expo/vector-icons/Zocial')),
};

export default function Icon({ name, size = 16, color, type = 'AntDesign', style }: IconProps) {
  const IconComponent = iconMap[type];

  const iconColor = color === 'auto' ? undefined : color;

  return (
    <View style={[styles.container, style]}>
      <Suspense fallback={<View style={{ width: size, height: size }} />}>{/* @ts-ignore */}
        {IconComponent && <IconComponent name={name} size={size} color={iconColor} />}
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
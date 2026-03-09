import AntDesign from '@expo/vector-icons/AntDesign';
import { StyleSheet, View } from 'react-native';

interface IconProps {
  name: string,
  size?: number,
  color?: string,
  type?: 'AntDesign' | 'FontAwesome' | 'MaterialIcons' | 'Ionicons' | 'FontAwesome5' | 'MaterialCommunityIcons' | 'Entypo' | 'EvilIcons' | 'Feather' | 'Fontisto' | 'Foundation' | 'SimpleLineIcons' | 'Octicons' | 'Zocial' | 'MaterialCommunityIcons'
}

export default function AntIcon({ name, size = 16, color = 'auto', type = 'AntDesign' }: IconProps) {
  // 按需引入icon

  return (
    <View style={styles.container}/* @ts-ignore */ >
      <AntDesign name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
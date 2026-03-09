import { View, ViewProps } from 'react-native';
import { useTheme } from 'react-native-paper';

export type PaperViewProps = ViewProps

export default function PaperView({...otherProps}: ViewProps) {
    const theme = useTheme();

    return <View style={{ backgroundColor: theme.colors.primary }} {...otherProps}/>;
}
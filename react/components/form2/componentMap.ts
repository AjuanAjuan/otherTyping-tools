import { Checkbox, RadioButton, Switch, TextInput } from 'react-native-paper';
import ApiSelect from '../ApiComponents/ApiSelect';
import ConstSelect from '../ApiComponents/ConstSelect';
import ApiSelectMulti from '../ApiComponents/ApiSelectMulti';
import DatePicker from '../ApiComponents/DatePicker';
import ApiRadioButton from '../ApiComponents/ApiRadioButton';


const defaultComponentsMap = {
  Input: TextInput,
  Password: TextInput,
  Switch,
  //   Editor: Editor,
  Radio: RadioButton,
  Checkbox,
  ApiSelect: ApiSelect, // Select 使用 TextInput 作为基础，通过 Menu 实现下拉选择
  ConstSelect: ConstSelect,
  MultiSelect: ApiSelectMulti,
  DatePicker: DatePicker,
  ApiRadio: ApiRadioButton,
} as const;

export { defaultComponentsMap };

// 导出组件类型，从 defaultComponentsMap 的键中获取
export type ComponentType = keyof typeof defaultComponentsMap;


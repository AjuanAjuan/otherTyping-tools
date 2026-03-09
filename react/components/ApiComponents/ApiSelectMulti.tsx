import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Modal, Pressable, Text, View, TouchableOpacity } from 'react-native';
import { FormFieldApiProps, TreeNode } from '../form2/type';
import { selectStyles as styles } from './select-style';

interface ApiSelectMultiProps<T> {
  value: any;
  onValueChange: (value: any) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  style?: any;
  formModel: T;
  multipleApi: (props: FormFieldApiProps<T>) => Promise<TreeNode[]>;
  dependencies?: (keyof T)[];
}

const ApiSelectMultiInner = <T,>({
  value,
  onValueChange,
  placeholder = '请选择...',
  disabled = false,
  error = false,
  style,
  multipleApi,
  formModel,
  dependencies,
}: ApiSelectMultiProps<T>) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // temp 修复picker动画延迟问题
  const [tempState, setTempState] = useState<{ l1: any, l2: any }>({ l1: null, l2: null });

  // Helper: Find path to value in the tree
  const findPath = (nodes: TreeNode[], targetValue: any): TreeNode[] | null => {
    for (const node of nodes) {
      if (String(node.value) === String(targetValue)) return [node];
      if (node.children && node.children.length > 0) {
        const path = findPath(node.children, targetValue);
        if (path) return [node, ...path];
      }
    }
    return null;
  };

  const currentPath = useMemo(() => findPath(treeData, value) || [], [value, treeData]);

  const isFirstRender = React.useRef(true);

  // Load Tree Data
  useEffect(() => {
    // 只有在非首次渲染（即依赖项变化）时才清空值
    if (!isFirstRender.current) {
      setTempState({ l1: null, l2: null });
      onValueChange(null);
    }
    isFirstRender.current = false;

    const getItems = async () => {
      if (multipleApi) {
        try {
          const result = await multipleApi({ formModel });
          const list = Array.isArray(result) ? result : [];
          setTreeData(list);
          setIsLoaded(true);
        } catch (e) {
          console.error("ApiSelectMulti Load Fail", e);
          setTreeData([]);
          setIsLoaded(true);
        }
      }
    };
    getItems();
  }, [...(dependencies?.map((dep) => formModel[dep]) || [])]);

  /**
   * 打开弹窗初始化过程
   */
  const handleOpen = useCallback(() => {
    if (disabled) return;
    const path = findPath(treeData, value);
    // 如果有值，设置临时状态
    if (path && path.length > 0) {
      setTempState({ l1: path[0]?.value, l2: path[1]?.value || null });
    } else {
      // 如果没有值，设置默认值
      const firstL1 = treeData[0];
      setTempState({
        l1: firstL1?.value || null,
        l2: firstL1?.children?.[0]?.value || null
      });
    }
    setIsVisible(true);
  }, [disabled, value, treeData]);

  const handleConfirm = useCallback(() => {
    onValueChange(tempState.l2 || tempState.l1);
    setIsVisible(false);
  }, [onValueChange, tempState]);

  const handleL1Change = (val: any) => {
    const node = treeData.find(n => String(n.value) === String(val));
    setTempState({
      l1: val,
      l2: node?.children?.[0]?.value || null
    });
  };

  const handleClear = useCallback(() => {
    onValueChange(null);
  }, [onValueChange]);

  const displayText = useMemo(() => {
    if (value === undefined || value === null || value === '') return placeholder;
    if (currentPath.length === 0) return String(value);
    return currentPath.map(p => p.label).join(' / ');
  }, [value, currentPath, placeholder]);

  const level2Items = useMemo(() => {
    return treeData.find(n => String(n.value) === String(tempState.l1))?.children || [];
  }, [tempState.l1, treeData]);

  if (!isLoaded) {
    return <View style={[styles.container, style]}><Text style={styles.loadingText}>加载中...</Text></View>;
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={handleOpen} disabled={disabled} activeOpacity={0.7}>
        <View style={[styles.textWrapper, error && styles.borderError, disabled && { opacity: 0.5 }]}>
          <Text style={[styles.text, (value === undefined || value === null || value === '') && styles.placeholderText, { flex: 1 }]} numberOfLines={1}>
            {displayText}
          </Text>
          {value !== undefined && value !== null && value !== '' && !disabled && (
            <TouchableOpacity
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.clearButton}
            >
              <MaterialCommunityIcons name="close-circle" size={14} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalWrapper}>
          <Pressable style={styles.backdrop} onPress={() => setIsVisible(false)} />

          <View style={styles.modalContent}>
            {/* Toolbar */}
            <View style={styles.toolbar}>
              <TouchableOpacity onPress={() => setIsVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
                <Text style={styles.toolbarFont}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
                <Text style={styles.toolbarFont}>确定</Text>
              </TouchableOpacity>
            </View>

            {/* Native Wheel Pickers side-by-side */}
            <View style={styles.pickerRow}>
              {/* Column 1 (Parent) */}
              <Picker
                selectedValue={tempState.l1}
                onValueChange={handleL1Change}
                style={styles.pickerColumn}
                itemStyle={styles.pickerItem}
              >
                {treeData.map(item => (
                  <Picker.Item key={String(item.value)} label={String(item.label)} value={item.value} />
                ))}
              </Picker>

              {/* Column 2 (Child) */}
              <Picker
                selectedValue={tempState.l2}
                onValueChange={(val) => setTempState(s => ({ ...s, l2: val }))}
                style={styles.pickerColumn}
                itemStyle={styles.pickerItem}
              >
                {level2Items.length > 0 ? (
                  level2Items.map(item => (
                    <Picker.Item key={String(item.value)} label={String(item.label)} value={item.value} />
                  ))
                ) : (
                  <Picker.Item label=" " value={null} />
                )}
              </Picker>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const arePropsEqual = (p: any, n: any) => {
  if (p.value !== n.value || p.disabled !== n.disabled || p.error !== n.error) return false;
  const pd = p.dependencies || [], nd = n.dependencies || [];
  if (pd.length !== nd.length) return false;
  for (let i = 0; i < nd.length; i++) {
    if (p.formModel[nd[i]] !== n.formModel[nd[i]]) return false;
  }
  return true;
};

export const ApiSelectMulti = React.memo(ApiSelectMultiInner, arePropsEqual) as typeof ApiSelectMultiInner;

export default ApiSelectMulti;

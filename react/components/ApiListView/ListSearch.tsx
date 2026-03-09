import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Keyboard, Pressable } from 'react-native';
import ApiButton from '../ApiComponents/ApiButton';
import { Field, Form, FormMethods } from '../form2';

type ListSearchProps = {
  onClose?: () => void;

  /** searchForm */
  searchForm?: Field<Record<string, any>>[];

  /** searchApi */
  searchApi?: (...params: any) => Promise<any>;
};

/**
 * 列表搜索,筛选组件  20260112 暂用于筛选,无搜索功能
 * @param props
 * @returns
 */
const ListSearch = (props: ListSearchProps) => {
  const searchFormRef = useRef<FormMethods>(null);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>筛选条件</Text>
        <ApiButton
          api={async () => {
            searchFormRef.current?.reset();
            searchFormRef.current?.submit();
            props.onClose?.();
          }}
        >
          清除
        </ApiButton>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined}>
          <View style={{ flex: 1 }}>
            {props.searchForm && props.searchApi && (
              <Form
                ref={searchFormRef}
                fields={props.searchForm}
                onSubmit={props.searchApi}
                hideCancel
                onFinishSubmit={props.onClose}
              />
            )}
          </View>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ListSearch;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
});
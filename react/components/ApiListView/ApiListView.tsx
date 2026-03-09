import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { ApiList, ApiListRef } from '../ApiList';
import { ApiListProps } from '../ApiList/type';
import { Drawer } from 'react-native-drawer-layout';
import { styles } from '@/components/ApiListView/css';
import ListSearch from './ListSearch';
import ApiButton from '../ApiComponents/ApiButton';
import Icon from '../icon/icon';
import { Field } from '../form2';
import { baseButtonColor } from '@/src/css/colorCss';

export interface ApiListViewProps<T> extends ApiListProps<T> {
  /**
   * 列表标题
   */
  listTitle: React.ReactNode;
  /**
   * 顶部工具栏额外内容
   */
  listHeaderToolbox?: React.ReactNode;
  /**
   * 隐藏search
   */
  hideSearch?: boolean;

  /**
   * searchForm, 返回search参数的表单，用于筛选
   */
  searchForm?: Field<Record<string, any>>[];
}

const ApiListViewInner = <T extends Record<string, any>>(
  props: ApiListViewProps<T>,
  ref: React.ForwardedRef<ApiListRef>
) => {
  const { listTitle, listHeaderToolbox, ...apiListProps } = props;
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  const handleSearch = useCallback(async (params: any) => {
    const hasFilter = params && Object.keys(params).length > 0;
    setIsFiltered(hasFilter);

    if (ref && typeof ref !== 'function' && ref.current) {
      await ref.current.filter(params);
    }
  }, [ref]);

  const openSearch = useCallback(async () => {
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  const handleScrollToTop = useCallback(async () => {
    if (ref && typeof ref !== 'function' && ref.current) {
      ref.current.scrollToTop();
    }
  }, [ref]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (ref && typeof ref !== 'function' && ref.current) {
        const scrollOffset = ref.current.getScrollOffset();
        // 当滚动超过200像素时显示回到顶部按钮
        setShowScrollTop(scrollOffset > 200);
      }
    }, 100); // 100ms检查一次 

    return () => clearInterval(interval);
  }, []);

  return (
    <Drawer
      open={searchOpen}
      onOpen={openSearch}
      onClose={closeSearch}
      drawerPosition="right"
      renderDrawerContent={() =>
        <ListSearch searchForm={props.searchForm}
          searchApi={handleSearch}
          onClose={closeSearch} />}
    >
      <View style={styles.pageWrapper} className='h-full'>
        <View style={styles.listHeader} className='flex flex-row'>
          {typeof listTitle === 'string' ? (
            <Text style={styles.listTitle}>{listTitle}</Text>
          ) : (
            listTitle
          )}
          <View style={styles.listHeaderToolbox}>
            <>
              {listHeaderToolbox}
              {!props.hideSearch && (
                <ApiButton mode={isFiltered ? 'elevated' : 'contained'} type={isFiltered ? undefined : "info"}
                  api={openSearch} size='small'>
                  <View className='flex h-full' style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name='filter' size={14} color={isFiltered ? baseButtonColor.textOnPrimary : 'auto'} />
                  </View>
                </ApiButton>
              )}
            </>
          </View>
        </View>
        <ApiList<T> ref={ref} {...apiListProps} />
        {showScrollTop && (
          <ApiButton mode='contained' type='primary' api={handleScrollToTop}
            style={styles.fixedButton}
            circle
          >
            <Icon name='arrow-up' size={18} color='white' style={{ height: '100%' }} />
          </ApiButton>
        )}
      </View>
    </Drawer>
  );
};

// 使用 forwardRef 包装以支持泛型和 ref 传递
export const ApiListView = forwardRef(ApiListViewInner) as <T extends Record<string, any>>(
  props: ApiListViewProps<T> & { ref?: React.ForwardedRef<ApiListRef> }
) => React.ReactElement;

export default ApiListView;

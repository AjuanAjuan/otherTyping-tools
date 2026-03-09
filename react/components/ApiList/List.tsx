import useToast from '@/src/hook/useToast';
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { ApiListMethods, ApiListProps, ApiListRef } from './type';
import { baseButtonColor } from '@/src/css/colorCss';

/**
 * ApiList 组件 - 用于展示分页数据的列表组件
 * 支持列表模式和网格模式
 */
const ApiList = forwardRef(<T,>(
  props: ApiListProps<T>,
  ref: React.Ref<ApiListRef>
) => {
  const {
    api,
    searchParams = { pageSize: 10 },
    layoutType = 'list',
    pageSize = 10,
    allowLayoutSwitch = true,
    children,
    editApi,
    deleteApi,
    addApi,
    showApiFeedback = true,
  } = props;

  // 状态管理
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // @ts-ignore
  const [total, setTotal] = useState<number>(0);
  // @ts-ignore
  const [totalPage, setTotalPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [scrollOffset, setScrollOffset] = useState<number>(0);

  // 使用 ref 存储参数，避免闭包问题
  const apiRef = useRef(api);
  const searchParamsRef = useRef(searchParams);
  const pageSizeRef = useRef(pageSize);
  const flatListRef = useRef<FlatList>(null);

  // toast
  const toast = useToast();

  // 更新 ref 的值
  useEffect(() => {
    apiRef.current = api;
    searchParamsRef.current = searchParams;
    pageSizeRef.current = pageSize;
  }, [api, searchParams, pageSize]);

  // 暴露方法
  useImperativeHandle(ref, () => ({
    refresh: async () => {
      setCurrentPage(1);
      await fetchData(1);
      setScrollOffset(0);
    },
    /** 搜索功能暂不启用 */
    search: async (keyword: any) => {
      searchParamsRef.current = { ...searchParamsRef.current, ...keyword };
      setCurrentPage(1);
      await fetchData(1);
    },
    filter: async (params: { [key: string]: any }) => {
      searchParamsRef.current = { ...searchParamsRef.current, ...params };
      setCurrentPage(1);
      await fetchData(1);
    },
    scrollToTop: () => {
      flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
      setScrollOffset(0);
    },
    getScrollOffset: () => {
      return scrollOffset;
    },
    addItem,
    editItem,
    deleteItem,
  }));

  // 获取数据的函数
  const fetchData = useCallback(async (page: number) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const params = {
        page,
        pageSize: pageSizeRef.current,
        ...searchParamsRef.current,
      };

      const result = await apiRef.current(params);

      if (result) {
        setTotal(result.total ?? 0);
        setTotalPage(result.totalPages ?? 0);
        // 处理 items 为 null 或 undefined 的情况
        const items = result.items ?? [];
        const newData = page === 1 ? items : [...data, ...items];
        setData(newData as T[]);
        setHasMore(!!result.hasNextPage);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
      console.error('ApiList error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [data]);

  const addItem = async (params: any) => {
    await addApi?.(params);
    setCurrentPage(1);
    await fetchData(1);
    setScrollOffset(0);
    showApiFeedback && toast.success('操作成功')
  }

  const editItem = async (params: any) => {
    await editApi?.(params);
    setCurrentPage(1);
    await fetchData(1);
    setScrollOffset(0);
    showApiFeedback && toast.success('操作成功')
  }

  const deleteItem = async (params: any) => {
    await deleteApi?.(params);
    setCurrentPage(1);
    await fetchData(1);
    setScrollOffset(0);
    showApiFeedback && toast.success('操作成功')
  }

  // 首次渲染时加载数据
  useEffect(() => {
    fetchData(1);
  }, []);

  // 渲染列表项
  const renderItem = ({ item, index, methods }: { item: T, index: number, methods?: ApiListMethods }) => {
    return (
      <View style={styles.listItem}>
        {children?.(item, index, methods)}
      </View>
    );
  };

  // 处理滚动事件
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollOffset(offsetY);
  };

  // 处理上拉加载更多
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchData(nextPage);
    }
  };

  // 下拉刷新
  const onRefresh = () => {
    setCurrentPage(1);
    fetchData(1);
  };

  // 渲染页脚（加载更多指示器）
  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>-- 已加载全部 --</Text>
        </View>
      );
    }
    if (loading && currentPage > 1) {
      return (
        <View className="items-center justify-center py-4">
          <ActivityIndicator size="small" color={baseButtonColor.primary} />
          <Text className="mt-2 text-base text-gray-400">加载中...</Text>
        </View>
      );
    }
    return null;
  };

  // 渲染加载状态
  const renderLoading = () => {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={baseButtonColor.primary} />
        <Text className="mt-4 text-gray-400">加载中...</Text>
      </View>
    );
  };

  // 渲染错误状态
  const renderError = () => {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>错误: {error}</Text>
        <IconButton
          icon="refresh"
          size={24}
          onPress={onRefresh}
        />
      </View>
    );
  };



  // 如果没有 children，则不渲染任何内容
  if (!children) {
    return null;
  }

  // 如果正在加载且数据为空，显示加载状态
  if (loading && data.length === 0) {
    return renderLoading();
  }

  // 如果有错误且数据为空，显示错误状态
  if (error && data.length === 0) {
    return renderError();
  }

  // 确定最终的布局类型
  const finalLayoutType = allowLayoutSwitch ? layoutType : 'list';

  // 如果最终布局类型是列表，则渲染列表布局
  if (finalLayoutType === 'list') {
    return (
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={data}
          renderItem={({ item, index }: { item: T, index: number }) => renderItem({ item, index, methods: { addItem, editItem, deleteItem } })}
          keyExtractor={(_, index) => index.toString()}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />
      </View>
    );
  }

  // 渲染网格布局
  // 将数据按每两个一组分组
  const groupedData = [];
  for (let i = 0; i < data.length; i += 2) {
    groupedData.push(data.slice(i, i + 2));
  }

  // 网格布局也需要检查空数据状态
  if (groupedData.length === 0 && !loading && !error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.footerText}>暂无数据</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={groupedData}
        renderItem={({ item: group, index: groupIndex }) => (
          <View style={styles.gridRow}>
            {group.map((item: T, itemIndex: number) => (
              <View key={`${groupIndex}-${itemIndex}`} style={styles.gridItemInRow}>
                {children(item, groupIndex * 2 + itemIndex)}
              </View>
            ))}
          </View>
        )}
        keyExtractor={(_, index) => `group-${index}`}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
  /* @ts-ignore */
}) as <T>(props: ApiListProps<T> & { ref?: React.Ref<ApiListRef> }) => JSX.Element;

// // 为组件添加 displayName，以便调试
// ApiList.displayName = 'ApiList';

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflowY: 'auto',
    // borderWidth: 1,
    // borderColor: '#cccccc',

  },
  listItem: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  gridRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  gridItemInRow: {
    flex: 1,
    marginHorizontal: 4,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#f44336',
    marginBottom: 8,
  },
});

export default ApiList;
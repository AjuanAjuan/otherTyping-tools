import { StyleSheet } from "react-native";

/**
 * list公用样式
 */
export const styles = StyleSheet.create({
  pageWrapper: {
    padding: 3,
    display: 'flex',
    flexDirection: 'column',
  },
  listHeader: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listHeaderToolbox: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listItem: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  listItemContent: {
    fontSize: 14,
  },
  /**
   * 回到顶部按钮,位于屏幕右侧靠下
   */
  fixedButton: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    zIndex: 999,
    elevation: 10, // Necessary for Android
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});
import { Platform, StyleSheet } from "react-native";
import { baseButtonColor } from "../../src/css/colorCss";

export const selectStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    minWidth: 50,
    height: 40,
  },
  textWrapper: {
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#8a8590',
    borderRadius: 4,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 36,
    minWidth: 40,
  },
  clearButton: {
    marginLeft: 4,
    height: '100%',
  },
  borderError: {
    borderColor: '#ba1a1a',
    borderWidth: 2,
  },
  text: {
    fontSize: 14,
    color: '#000',
    // paddingVertical: 8,
  },
  placeholderText: {
    color: '#9EA0A4',
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
    paddingVertical: 8,
  },
  inputIOS: {
    fontSize: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
  childPickerWrapper: {
    marginTop: 8,
    marginLeft: 16, // Indent child pickers for visual hierarchy
  },
  //  iOS Modal Styles
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  modalContent: {
    backgroundColor: '#caced6',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CCCCCC',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  toolbar: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d1d1d6',
  },
  toolbarFont: {
    color: baseButtonColor.primary,
    fontSize: 17,
    fontWeight: '600',
  },
  pickerRow: {
    flexDirection: 'row',
    height: 216,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerItem: {
    fontSize: 20,
    color: '#000000',
  },
});

export const inputStyles = StyleSheet.create({
  input: {
    backgroundColor: 'transparent',
    height: 40,
  },
})
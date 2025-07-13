import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  scroll: {
    paddingRight: 16,
  },
  chip: {
    marginRight: 12,
    borderRadius: 25,
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  chipTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import Colors from '../styles/colors';
import { fontSizes } from '../styles/typography';

const MapboxBottomTabBar = ({ state, descriptors, navigation }) => {
  const tabIcons = [
    'https://cdn-icons-png.flaticon.com/128/1946/1946436.png',
    'https://cdn-icons-png.flaticon.com/128/2277/2277956.png',
    'https://cdn-icons-png.flaticon.com/128/9610/9610500.png',
    'https://cdn-icons-png.flaticon.com/128/17/17004.png',
  ];
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={[styles.tab, isFocused && styles.tabActive]}
          >
            <Image source={{ uri: tabIcons[index] }} style={[{ width: 25, height: 25 }, isFocused ? styles.imgActive : styles.imgInActive]} />
            {/* <Text style={[styles.label, isFocused && styles.labelActive]}>
              {label}
            </Text> */}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#05030A',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: Colors.cardActive,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: fontSizes.sm,
  },
  labelActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  imgActive: {
    tintColor: Colors.textPrimary
  },
  imgInActive: {
    tintColor: Colors.textSecondary
  }
});

export default MapboxBottomTabBar;






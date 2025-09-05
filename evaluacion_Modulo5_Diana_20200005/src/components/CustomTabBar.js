import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();

    const tabs = [
        {
            name: 'Home',
            icon: '🏠',
            label: 'Inicio',
        },
        {
            name: 'EditProfile',
            icon: '✏️',
            label: 'Editar',
        }
    ];

    return (
        <View style={[
            styles.container,
            {
                // Respeta la safe area o mínimo 10
                paddingBottom: Math.max(insets.bottom, 10),
                // Para pantallas con notch lateral
                paddingLeft: Math.max(insets.left, 20),
                // Para pantallas con notch lateral
                paddingRight: Math.max(insets.right, 20),
            }
        ]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                // Buscar el tab correspondiente
                const tab = tabs.find(t => t.name === route.name);
                if (!tab) return null;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={[
                            styles.tab,
                            isFocused && styles.activeTab
                        ]}
                    >
                        <Text style={[
                            styles.icon,
                            isFocused && styles.activeIcon
                        ]}>
                            {tab.icon}
                        </Text>
                        <Text style={[
                            styles.label,
                            isFocused && styles.activeLabel
                        ]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        // Este será sobrescrito por los insets
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        // Removemos position absolute para que no interfiera con el scroll
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 12,
        marginHorizontal: 5,
    },
    activeTab: {
        backgroundColor: '#E3F2FD',
    },
    icon: {
        fontSize: 24,
        marginBottom: 4,
    },
    activeIcon: {
        transform: [{ scale: 1.1 }],
    },
    label: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    activeLabel: {
        color: '#2196F3',
        fontWeight: 'bold',
    },
});
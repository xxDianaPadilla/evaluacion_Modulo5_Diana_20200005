import React, { useEffect } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    // Animación para el texto
    const fadeAnim = new Animated.Value(0);
    const scaleAnim = new Animated.Value(0.5);

    useEffect(() => {
        // Iniciamos animaciones
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <Text style={styles.logo}>📚</Text>
                <Text style={styles.title}>EduApp</Text>
                <Text style={styles.subtitle}>Tu perfil académico</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2196F3',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logo: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#E3F2FD',
        textAlign: 'center',
    },
});
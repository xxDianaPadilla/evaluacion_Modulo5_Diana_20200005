import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Función para manejar el inicio de sesión
    const handleLogin = async () => {
        // Validación de campos vacíos
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Por favor, complete todos los campos');
            return;
        }

        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Por favor, ingrese un email válido');
            return;
        }

        setIsLoading(true);

        try {
            // Intentamos iniciar sesión con Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Usuario logueado: ', userCredential.user.email);
            // La navegación se maneja automáticamente por el onAuthStateChanged en App.js
        } catch (error) {
            console.error('Error en login: ', error);

            // Manejamos diferentes tipos de errores
            let errorMessage = 'Error al iniciar sesión';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Usuario deshabilitado';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'Usuario no encontrado';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Contraseña incorrecta';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Credenciales inválidas';
                    break;
                default:
                    errorMessage = error.message;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.logo}>📚</Text>
                    <Text style={styles.title}>EduApp</Text>
                    <Text style={styles.subtitle}>Iniciar Sesión</Text>
                </View>

                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <TouchableOpacity
                        style={[styles.loginButton, isLoading && styles.disabledButton]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>¿No tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Regístrate aquí</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logo: {
        fontSize: 60,
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    loginButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#BBBBBB',
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    registerText: {
        color: '#666',
        fontSize: 14,
    },
    registerLink: {
        color: '#2196F3',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
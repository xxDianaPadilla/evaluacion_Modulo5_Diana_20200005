import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';

export default function RegisterScreen({ navigation }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        degree: '',
        graduationYear: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // Función para actualizar los campos del formulario
    const updateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Función para validar los datos del formulario
    const validateForm = () => {
        const { name, email, password, degree, graduationYear } = formData;

        // Verificamos campos vacíos
        if (!name.trim() || !email.trim() || !password.trim() || !degree.trim() || !graduationYear.trim()) {
            Alert.alert('Error', 'Por favor, complete todos los campos');
            return false;
        }

        // Validamos email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Por favor, ingrese un email válido');
            return false;
        }

        // Validamos contraseña (mínimo 6 caracteres)
        if (password.length < 6) {
            Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        // Validamos año de graduación
        const currentYear = new Date().getFullYear();
        const year = parseInt(graduationYear);
        if (isNaN(year) || year < 1950 || year > currentYear + 10) {
            Alert.alert('Error', 'Por favor, ingrese un año de graduación válido');
            return false;
        }
        return true;
    };

    // Función para manejar el registro
    const handleRegister = async () => {
        // Validamos formulario
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Creamos usuario con Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            const user = userCredential.user;
            console.log('Usuario creado: ', user.uid);

            // Guardamos información adicional en Firestore
            await setDoc(doc(database, 'users', user.uid), {
                name: formData.name.trim(),
                email: formData.email.toLowerCase(),
                degree: formData.degree.trim(),
                graduationYear: parseInt(formData.graduationYear),
                createdAt: new Date().toISOString(),
            });

            console.log('Datos del usuario guardados en Firebase');

            Alert.alert(
                'Éxito',
                'Usuario registrado correctamente',
                // Eliminamos la navegación manual
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Error en registro: ', error);

            // Manejamos diferentes tipos de errores
            let errorMessage = 'Error al registrar usuario';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este email ya está registrado';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email inválido';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Operación no permitida';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La contraseña es muy débil';
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
                    <Text style={styles.title}>Crear Cuenta</Text>
                    <Text style={styles.subtitle}>Registra tu información académica</Text>
                </View>

                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre completo"
                        value={formData.name}
                        onChangeText={(value) => updateField('name', value)}
                        autoCapitalize="words"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Correo electrónico"
                        value={formData.email}
                        onChangeText={(value) => updateField('email', value)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Contraseña (mínimo 6 caracteres)"
                        value={formData.password}
                        onChangeText={(value) => updateField('password', value)}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Título universitario"
                        value={formData.degree}
                        onChangeText={(value) => updateField('degree', value)}
                        autoCapitalize="words"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Año de graduación"
                        value={formData.graduationYear}
                        onChangeText={(value) => updateField('graduationYear', value)}
                        keyboardType="numeric"
                        maxLength={4}
                    />

                    <TouchableOpacity
                        style={[styles.registerButton, isLoading && styles.disabledButton]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.registerButtonText}>Registrarse</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Inicia sesión aquí</Text>
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
        bottom: 25,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logo: {
        fontSize: 50,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
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
    registerButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#BBBBBB',
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    loginText: {
        color: '#666',
        fontSize: 14,
    },
    loginLink: {
        color: '#2196F3',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, database } from '../config/firebase';

export default function EditProfileScreen({ navigation, route }) {
    const [formData, setFormData] = useState({
        name: '',
        degree: '',
        graduationYear: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    // Cargamos información actual del usuario
    useEffect(() => {
        const loadUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDoc(doc(database, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setFormData({
                            name: userData.name || '',
                            degree: userData.degree || '',
                            graduationYear: userData.graduationYear ? userData.graduationYear.toString() : ''
                        });
                    }
                }
            } catch (error) {
                console.error('Error al cargar datos del usuario: ', error);
                Alert.alert('Error', 'No se pudo cargar la información del usuario');
            }
        };

        loadUserData();
    }, []);

    // Función para actualizar los campos del formulario
    const updateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Función para actualizar los campos de contraseña
    const updatePasswordField = (field, value) => {
        setPasswordData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Función para validar el formulario de información personal
    const validateProfileForm = () => {
        const { name, degree, graduationYear } = formData;

        if (!name.trim() || !degree.trim() || !graduationYear.trim()) {
            Alert.alert('Error', 'Por favor, complete todos los campos');
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

    // Función para validar el formulario de contraseña
    const validatePasswordForm = () => {
        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Por favor, complete todos los campos de contraseña');
            return false;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return false;
        }

        return true;
    };

    // Función para actualizar la información del perfil
    const handleUpdateProfile = async () => {
        if (!validateProfileForm()) return;

        setIsLoading(true);

        try {
            const user = auth.currentUser;
            if (user) {
                await updateDoc(doc(database, 'users', user.uid), {
                    name: formData.name.trim(),
                    degree: formData.degree.trim(),
                    graduationYear: parseInt(formData.graduationYear),
                    updatedAt: new Date().toISOString(),
                });

                Alert.alert(
                    'Éxito',
                    'Perfil actualizado correctamente',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error) {
            console.error('Error al actualizar perfil: ', error);
            Alert.alert('Error', 'No se pudo actualizar el perfil');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para cambiar contraseña
    const handleChangePassword = async () => {
        if (!validatePasswordForm()) return;

        setIsLoading(true);

        try {
            const user = auth.currentUser;
            if (user) {
                // Re-autenticamos usuario con contraseña actual
                const credential = EmailAuthProvider.credential(
                    user.email,
                    passwordData.currentPassword
                );

                await reauthenticateWithCredential(user, credential);

                // Actualizamos contraseña
                await updatePassword(user, passwordData.newPassword);

                // Limpiamos campos de contraseña
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
                setShowPasswordForm(false);

                Alert.alert('Éxito', 'Contraseña actualizada correctamente');
            }
        } catch (error) {
            console.error('Error al cambiar contraseña: ', error);

            let errorMessage = 'Error al cambiar la contraseña';
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'La contraseña actual es incorrecta';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'La nueva contraseña es muy débil';
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

                {/* Formulario de información personal */}
                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>Información Personal</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Nombre completo"
                        value={formData.name}
                        onChangeText={(value) => updateField('name', value)}
                        autoCapitalize="words"
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
                        style={[styles.updateButton, isLoading && styles.disabledButton]}
                        onPress={handleUpdateProfile}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.updateButtonText}>Actualizar Información</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Sección de cambio de contraseña */}
                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>Seguridad</Text>

                    <TouchableOpacity
                        style={styles.passwordToggleButton}
                        onPress={() => setShowPasswordForm(!showPasswordForm)}
                    >
                        <Text style={styles.passwordToggleText}>
                            {showPasswordForm ? '🔒 Ocultar cambio de contraseña' : '🔓 Cambiar contraseña'}
                        </Text>
                    </TouchableOpacity>

                    {showPasswordForm && (
                        <View style={styles.passwordForm}>
                            <TextInput
                                style={styles.input}
                                placeholder="Contraseña actual"
                                value={passwordData.currentPassword}
                                onChangeText={(value) => updatePasswordField('currentPassword', value)}
                                secureTextEntry
                                autoCapitalize="none"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Nueva contraseña (mínimo 6 caracteres)"
                                value={passwordData.newPassword}
                                onChangeText={(value) => updatePasswordField('newPassword', value)}
                                secureTextEntry
                                autoCapitalize="none"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Confirmar nueva contraseña"
                                value={passwordData.confirmPassword}
                                onChangeText={(value) => updatePasswordField('confirmPassword', value)}
                                secureTextEntry
                                autoCapitalize="none"
                            />

                            <TouchableOpacity
                                style={[styles.passwordButton, isLoading && styles.disabledButton]}
                                onPress={handleChangePassword}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.passwordButtonText}>Cambiar Contraseña</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Botón para cancelar */}
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

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
        padding: 20,
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
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
    updateButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    passwordToggleButton: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
    },
    passwordToggleText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    passwordForm: {
        marginTop: 10,
    },
    passwordButton: {
        backgroundColor: '#FF9800',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    passwordButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#BBBBBB',
    },
    cancelButton: {
        backgroundColor: '#F44336',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
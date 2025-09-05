import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';

export default function HomeScreen({ navigation }) {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Función para obtener la información del usuario desde Firestore
    const fetchUserInfo = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(database, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserInfo(userDoc.data());
                } else {
                    console.log('No se encontró información del usuario');
                    // Si no existe el documento, usar información básica del auth
                    setUserInfo({
                        name: user.displayName || 'Usuario',
                        email: user.email,
                        degree: 'No especificado',
                        graduationYear: 'No especificado'
                    });
                }
            }
        } catch (error) {
            console.error('Error al obtener información del usuario: ', error);
            Alert.alert('Error', 'No se pudo cargar la información del usuario');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para refrescar los datos
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchUserInfo();
        setRefreshing(false);
    };

    // Obtenemos información del usuario al cargar la pantalla
    useEffect(() => {
        fetchUserInfo();
    }, []);

    // Función para cerrar sesión
    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿estpas seguro que deseas cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar Sesión',
                    onPress: async () => {
                        try {
                            await signOut(auth);
                            console.log('Usuario deslogueado');
                            // La navegación se maneja automáticamente por el onAuthStateChanged en App.js
                        } catch (error) {
                            console.error('Error al cerrar sesión: ', error);
                            Alert.alert('Error', 'No se pudo cerrar sesión');
                        }
                    },
                },
            ],
        );
    };

    // Función para navegar a editar perfil
    const handleEditProfile = () => {
        navigation.navigate('EditProfile', { userInfo });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Cargando información...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.headerContainer}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>
                        {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : '👤'}
                    </Text>
                </View>
                <Text style={styles.welcomeText}>¡Bienvenid@!</Text>
                <Text style={styles.nameText}>{userInfo?.name || 'Usuario'}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Información Personal</Text>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nombre:</Text>
                    <Text style={styles.infoValue}>{userInfo?.name || 'No especificado'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{userInfo?.email || 'No especificado'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Título:</Text>
                    <Text style={styles.infoValue}>{userInfo?.degree || 'No especificado'}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Año de graduación:</Text>
                    <Text style={styles.infoValue}>
                        {userInfo?.graduationYear ? userInfo.graduationYear.toString() : 'No especificado'}
                    </Text>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditProfile}
                >
                    <Text style={styles.editButtonText}>✏️ Editar Perfil</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    headerContainer: {
        backgroundColor: '#2196F3',
        padding: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    welcomeText: {
        fontSize: 18,
        color: '#E3F2FD',
        marginBottom: 5,
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        margin: 20,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    infoLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'right',
    },
    actionsContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    editButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#F44336',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    statsContainer: {
        backgroundColor: '#FFFFFF',
        margin: 20,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
});
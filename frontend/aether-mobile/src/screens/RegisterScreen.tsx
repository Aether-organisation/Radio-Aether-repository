import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';

export const RegisterScreen = ({ navigation }: any) => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [confirmarEmail, setConfirmarEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmarPassword, setConfirmarPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        nombre?: string;
        email?: string;
        confirmarEmail?: string;
        password?: string;
        confirmarPassword?: string;
    }>({});

    const validateFields = () => {
        const newErrors: typeof errors = {};
        let isValid = true;

        if (!nombre.trim()) {
            newErrors.nombre = 'El nombre es obligatorio';
            isValid = false;
        } else if (nombre.length < 3) {
            newErrors.nombre = 'Mínimo 3 caracteres';
            isValid = false;
        }

        if (!email.trim()) {
            newErrors.email = 'El email es obligatorio';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email inválido';
            isValid = false;
        }

        if (email !== confirmarEmail) {
            newErrors.confirmarEmail = 'Los emails no coinciden';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'La contraseña es obligatoria';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Mínimo 6 caracteres';
            isValid = false;
        }

        if (password !== confirmarPassword) {
            newErrors.confirmarPassword = 'Las contraseñas no coinciden';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleRegister = async () => {
        if (!validateFields()) return;

        setLoading(true);
        try {
            const response = await api.post('/auth/register', {
                nombre,
                email,
                password
            });

            await SecureStore.setItemAsync('jwt_token', response.data.token);

            navigation.replace('Player');
        } catch (error: any) {
            console.log('Error completo:', JSON.stringify(error.response?.data));
            
            const errorMessage = (error.response?.data?.message || 
                                 error.response?.data?.error || 
                                 error.response?.data ||
                                 'Error al registrar. Inténtalo de nuevo.').toLowerCase();
            
            console.log('Mensaje de error:', errorMessage);
            
            if (errorMessage.includes('email')) {
                setErrors(prev => ({ ...prev, email: 'Este email ya está registrado. Usa otro diferente.' }));
            } else if (errorMessage.includes('nombre') || errorMessage.includes('usuario')) {
                setErrors(prev => ({ ...prev, nombre: 'Este nombre de usuario ya está en uso. Prueba otro.' }));
            } else {
                setErrors(prev => ({ ...prev, nombre: 'Error al crear la cuenta. Inténtalo de nuevo.' }));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.content}>
                <Text style={styles.title}>🌌 AETHER</Text>
                <Text style={styles.subtitle}>Crear cuenta</Text>

                <TextInput
                    style={[styles.input, errors.nombre && styles.inputError]}
                    placeholder="Nombre de usuario"
                    placeholderTextColor="#888"
                    value={nombre}
                    onChangeText={(text) => {
                        setNombre(text);
                        if (errors.nombre) setErrors(prev => ({ ...prev, nombre: undefined }));
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}

                <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Email"
                    placeholderTextColor="#888"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                <TextInput
                    style={[styles.input, errors.confirmarEmail && styles.inputError]}
                    placeholder="Repetir email"
                    placeholderTextColor="#888"
                    value={confirmarEmail}
                    onChangeText={setConfirmarEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                />
                {errors.confirmarEmail && <Text style={styles.errorText}>{errors.confirmarEmail}</Text>}

                <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Contraseña"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                <TextInput
                    style={[styles.input, errors.confirmarPassword && styles.inputError]}
                    placeholder="Repetir contraseña"
                    placeholderTextColor="#888"
                    value={confirmarPassword}
                    onChangeText={setConfirmarPassword}
                    secureTextEntry={true}
                />
                {errors.confirmarPassword && <Text style={styles.errorText}>{errors.confirmarPassword}</Text>}

                <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Creando cuenta...' : 'CREAR CUENTA'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.linkButton} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#121212' 
    },
    content: { 
        flex: 1, 
        justifyContent: 'center', 
        padding: 20 
    },
    title: { 
        fontSize: 32, 
        color: '#fff', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: 5 
    },
    subtitle: { 
        fontSize: 18, 
        color: '#888', 
        textAlign: 'center', 
        marginBottom: 30 
    },
    input: { 
        backgroundColor: '#1E1E1E', 
        color: '#fff', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 5 
    },
    inputError: { 
        borderWidth: 1, 
        borderColor: '#ff4444' 
    },
    errorText: { 
        color: '#ff4444', 
        fontSize: 12, 
        marginBottom: 10, 
        marginLeft: 5 
    },
    button: { 
        backgroundColor: '#646cff', 
        padding: 15, 
        borderRadius: 8, 
        alignItems: 'center', 
        marginTop: 10 
    },
    buttonDisabled: { 
        opacity: 0.7 
    },
    buttonText: { 
        color: '#fff', 
        fontWeight: 'bold' 
    },
    linkButton: { 
        marginTop: 20, 
        alignItems: 'center' 
    },
    linkText: { 
        color: '#646cff', 
        fontSize: 14 
    },
});


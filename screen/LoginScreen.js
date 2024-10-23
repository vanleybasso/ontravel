import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { database } from '../firebaseConfig'; 
import { ref, get, child } from 'firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome'; 

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false); 
  const handleLogin = async () => {
    const normalizedEmail = email.toLowerCase();
    const emailKey = normalizedEmail.replace('.', ',');
    const userRef = ref(database, 'users/');

    if (!normalizedEmail || !password) {
      setMessage('Por favor, insira seu e-mail e senha.');
      setMessageType('error');
      return;
    }

    try {
      const snapshot = await get(child(userRef, emailKey));

      if (snapshot.exists()) {
        const userData = snapshot.val();

        if (userData.password === password) {
          setMessage('Login realizado com sucesso!');
          setMessageType('success');
          navigation.navigate('Trips', { userName: userData.name });
        } else {
          setMessage('Senha incorreta.');
          setMessageType('error');
        }
      } else {
        setMessage('Email não encontrado. Cadastre-se primeiro.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Erro ao realizar o login: ' + error.message);
      setMessageType('error');
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/logo.png')} 
        style={styles.logo}
      />
      <Text style={styles.subtitle}>Faça seu login abaixo:</Text>

      <Text style={styles.label}>Email:</Text>
      <TextInput
        placeholder="Digite seu email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Senha:</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible} 
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
          <Icon name={passwordVisible ? "eye" : "eye-slash"} size={20} color="#A31A84" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      {message ? (
        <Text
          style={[styles.message, messageType === 'success' ? styles.successMessage : styles.errorMessage]}
        >
          {message}
        </Text>
      ) : null}

      <Text style={styles.registerPrompt}>
        Não possui cadastro ainda?{' '}
        <Text
          style={styles.registerLink}
          onPress={() => navigation.navigate('Signup')}
        >
          Faça agora
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#A31A84',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#A31A84',
  },
  input: {
    height: 40,
    borderColor: '#A31A84',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    color: '#A31A84',
    borderRadius: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    paddingRight: 40,
  },
  passwordContainer: {
    position: 'relative', 
    marginBottom: 20,
  },
  eyeIcon: {
    position: 'absolute',
    right: 10, 
    top: 10, 
  },
  button: {
    backgroundColor: '#A31A84',
    borderRadius: 30, 
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  message: {
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  successMessage: {
    color: 'green',
  },
  errorMessage: {
    color: 'red',
  },
  registerPrompt: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#A31A84',
  },
  registerLink: {
    color: '#A31A84',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

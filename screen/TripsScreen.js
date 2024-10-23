// tripsScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 

export default function TripsScreen({ route, navigation }) {
  const { userName } = route.params;

  const handleLogout = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.welcomeText}>Seja bem-vindo, {userName}!</Text>

      {/* Navegar para a tela de viagens do usuário */}
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UserTrips', { userName })}>
        <Text style={styles.buttonText}>Acessar Minhas Viagens</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('NewTrip', { userName })}>
        <Text style={styles.buttonText}>Nova Viagem</Text>
      </TouchableOpacity>

      {/* Botão de Logout com ícone */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="sign-out" size={20} color="#A31A84" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#A31A84',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#A31A84',
    borderRadius: 30, 
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
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
  logoutButton: {
    flexDirection: 'row', 
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 10, 
  },
  logoutText: {
    fontSize: 18,
    color: '#A31A84',
    textDecorationLine: 'underline',
  },
});

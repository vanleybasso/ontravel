import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ref, push } from 'firebase/database';
import { database } from '../firebaseConfig';

export default function NewTripScreen({ navigation, route }) {
  const { userName } = route.params;
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [image, setImage] = useState(null);

  const handleLocationPress = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permissão para acessar a localização foi negada.');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = currentLocation.coords;

    const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
    const city = reverseGeocode[0]?.city || reverseGeocode[0]?.subregion || 'Localização desconhecida';
    const state = reverseGeocode[0]?.region || ''; 

    setLocation(`${city}, ${state}`);
  };

  const handleImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permissão para acessar a câmera é necessária!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleImageOptions = () => {
    Alert.alert(
      "Selecione a origem da imagem",
      "Escolha entre tirar uma foto ou selecionar da galeria",
      [
        {
          text: "Galeria",
          onPress: handleImagePicker,
        },
        {
          text: "Câmera",
          onPress: handleTakePhoto,
        },
        {
          text: "Cancelar",
          style: "cancel"
        }
      ]
    );
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(false);
    setDate(currentDate);
  };

  const showDatePicker = () => {
    setShowPicker(true);
  };

  const handleSubmit = async () => {
    if (!description || !date || !location || !image) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const tripsRef = ref(database, 'trips/');
      await push(tripsRef, {
        userName,
        description,
        date: date.toISOString(),
        location,
        image,
      });

      Alert.alert('Sucesso', 'Nova viagem cadastrada com sucesso!');
      navigation.navigate('Trips', { userName });
    } catch (error) {
      Alert.alert('Erro', 'Erro ao cadastrar nova viagem: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Insira sua nova viagem:</Text>

      {/* Descrição */}
      <Text style={styles.label}>Descrição da viagem:</Text>
      <TextInput
        placeholder="Descrição da viagem"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      {/* Data */}
      <Text style={styles.label}>Data da viagem:</Text>
      <TouchableOpacity onPress={showDatePicker} style={styles.datePicker}>
        <Text style={{ color: date ? '#000' : '#888' }}>{date.toLocaleDateString()}</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Obter localização */}
      <TouchableOpacity style={styles.locationButton} onPress={handleLocationPress}>
        <Icon name="location-arrow" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>{location || 'Obter minha localização'}</Text>
      </TouchableOpacity>

      {/* Botão único para adicionar imagem */}
      <TouchableOpacity style={styles.imageButton} onPress={handleImageOptions}>
        <Icon 
          name={image ? 'check' : 'camera'}
          size={20} 
          color="#fff" 
          style={styles.icon} 
        />
        <Text style={styles.buttonText}>
          {image ? 'Imagem selecionada' : 'Adicionar foto da viagem'}
        </Text>
      </TouchableOpacity>

      {/* Cadastrar nova viagem */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Cadastrar nova trip</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 20,
    marginVertical: 20,
    textAlign: 'center',
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
  },
  datePicker: {
    height: 40,
    borderColor: '#A31A84',
    borderWidth: 1,
    marginBottom: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  locationButton: {
    backgroundColor: '#A31A84',
    borderRadius: 30,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  imageButton: {
    backgroundColor: '#A31A84',
    borderRadius: 30,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: '#A31A84',
    borderRadius: 30,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 40,
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
  icon: {
    marginRight: 10,
  },
});

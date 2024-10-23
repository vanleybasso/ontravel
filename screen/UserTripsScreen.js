import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { ref, child, get, remove, update } from 'firebase/database';
import { database } from '../firebaseConfig'; 
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker'; 

export default function UserTripsScreen({ route, navigation }) {
  const { userName } = route.params;
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [image, setImage] = useState(null); 

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const tripsRef = ref(database, 'trips/');
        const snapshot = await get(tripsRef);

        if (snapshot.exists()) {
          const tripsData = snapshot.val();
          const userTrips = Object.entries(tripsData).filter(([key, trip]) => trip.userName === userName);
          setTrips(userTrips);
        } else {
          Alert.alert('Nenhuma viagem encontrada para este usuário.');
        }
      } catch (error) {
        Alert.alert('Erro', 'Erro ao buscar as viagens: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [userName]);

  const handleDeleteTrip = (tripId) => {
    Alert.alert(
      'Confirmação de Exclusão',
      'Você tem certeza de que deseja excluir esta viagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', onPress: async () => {
            try {
              const tripRef = ref(database, `trips/${tripId}`);
              await remove(tripRef);
              Alert.alert('Sucesso', 'Viagem excluída com sucesso.');
              setTrips(trips.filter(([id]) => id !== tripId));
            } catch (error) {
              Alert.alert('Erro', 'Erro ao excluir a viagem: ' + error.message);
            }
          }
        },
      ]
    );
  };

  const handleEditTrip = (tripId, trip) => {
    setCurrentTrip(tripId);
    setDescription(trip.description);
    setLocation(trip.location);
    setDate(new Date(trip.date));
    setImage(trip.image); 
    setModalVisible(true);
  };

  const handleUpdateTrip = async () => {
    if (!description || !location) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const tripRef = ref(database, `trips/${currentTrip}`);
      await update(tripRef, {
        description,
        location,
        date: date.toISOString(),
        image, 
      });

      Alert.alert('Sucesso', 'Viagem atualizada com sucesso.');
      setModalVisible(false);
      setTrips(trips.map(([id, trip]) => (id === currentTrip ? [id, { ...trip, description, location, date: date.toISOString(), image }] : [id, trip])));

    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar a viagem: ' + error.message);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'É necessário permitir o acesso à localização.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverseGeocode.length > 0) {
        const { city, region } = reverseGeocode[0];
        const stateAbbreviation = region; // Ajuste conforme necessário
        setLocation(`${city}, ${stateAbbreviation}`);
      } else {
        Alert.alert('Erro', 'Não foi possível encontrar a localização.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao obter a localização: ' + error.message);
    }
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

  const renderTripItem = ({ item }) => {
    const [tripId, trip] = item;
    return (
      <View style={styles.tripContainer}>
        <Image source={{ uri: trip.image }} style={styles.tripImage} />
        <View style={styles.tripDetails}>
          <Text style={styles.tripDescription}>Descrição: {trip.description}</Text>
          <Text style={styles.tripDate}>
            Data: {new Date(trip.date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </Text>
          <Text style={styles.tripLocation}>Localização: {trip.location}</Text>
        </View>

        <TouchableOpacity style={styles.deleteIcon} onPress={() => handleDeleteTrip(tripId)}>
          <Icon name="trash" size={24} color="#FF4B4B" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.editIcon} onPress={() => handleEditTrip(tripId, trip)}>
          <Icon name="pencil" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Viagens</Text>
      {loading ? (
        <Text>Carregando...</Text>
      ) : trips.length > 0 ? (
        <FlatList
          data={trips}
          keyExtractor={(item) => item[0]}
          renderItem={renderTripItem}
        />
      ) : (
        <Text>Nenhuma viagem encontrada.</Text>
      )}
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('NewTrip', { userName })}
      >
        <Text style={styles.addButtonText}>Adicionar Nova Viagem</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}
>
  <View style={styles.modalContainer}>
    <View style={styles.modalView}>
      <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
        <Icon name="times" size={24} color="#A31A84" />
      </TouchableOpacity>
      <Text style={[styles.modalTitle, { fontWeight: 'bold' }]}>Editar Viagem</Text>
            
            <Text style={styles.label}>Descrição:</Text>
            <TextInput
              placeholder="Descrição"
              value={description}
              onChangeText={setDescription}
              style={styles.modalInput}
            />

            <Text style={styles.label}>Data:</Text>
            <TextInput
              placeholder="Data"
              value={date.toLocaleDateString('pt-BR')}
              editable={false}
              style={styles.modalInput}
            />

<TouchableOpacity style={styles.locationButton} onPress={() => setShowDatePicker(true)}>
  <View style={styles.row}>
    <Icon name="pencil" size={16} color="#FFFFFF" style={styles.icon} />
    <Text style={styles.buttonText}>Editar Data</Text>
  </View>
</TouchableOpacity>


            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || date;
                  setShowDatePicker(false);
                  setDate(currentDate);
                }}
              />
            )}
            
            <Text style={styles.label}>Localização:</Text>
            <TextInput
              placeholder="Localização"
              value={location}
              onChangeText={setLocation}
              style={styles.modalInput}
            />

<TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
  <View style={styles.row}>
    <Icon name="pencil" size={16} color="#FFFFFF" style={styles.icon} />
    <Text style={styles.buttonText}>Editar Localização Atual</Text>
  </View>
</TouchableOpacity>

{/* Botão para editar imagem */}
<TouchableOpacity style={styles.locationButton} onPress={handleImageOptions}>
  <View style={styles.row}>
    <Icon name="pencil" size={16} color="#FFFFFF" style={styles.icon} />
    <Text style={styles.buttonText}>Editar Imagem</Text>
  </View>
</TouchableOpacity>

<View style={styles.buttonContainer}>
  <TouchableOpacity style={styles.saveButton} onPress={handleUpdateTrip}>
    <Text style={styles.saveButtonText}>Salvar</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
    <Text style={styles.cancelButtonText}>Cancelar</Text>
  </TouchableOpacity>
  
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#FFFFFF',
    },
    title: {
      fontSize: 22,
      color: '#A31A84',
      textAlign: 'center',
      marginBottom: 20,
    },
    tripContainer: {
      flexDirection: 'row',
      marginBottom: 20,
      borderColor: '#A31A84',
      borderWidth: 1,
      borderRadius: 15, 
      overflow: 'hidden',
      position: 'relative',
    },
  
    icon: {
      marginRight: 8,
    },
  
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
    },
  
    tripImage: {
      width: 100,
      height: 100,
      marginRight: 10,
      borderRadius: 10, 
    },
    tripDetails: {
      flex: 1,
      justifyContent: 'center',
    },
    tripDescription: {
      fontSize: 16,
      color: '#A31A84',
    },
    tripDate: {
      fontSize: 14,
      color: '#777',
      marginTop: 5,
    },
    tripLocation: {
      fontSize: 14,
      color: '#777',
      marginTop: 5,
    },
    deleteIcon: {
      position: 'absolute',
      bottom: 10,
      right: 10,
    },
    editIcon: {
      position: 'absolute',
      bottom: 10,
      right: 50,
    },
    backButton: {
      marginTop: 20,
      backgroundColor: '#A31A84',
      padding: 15,
      borderRadius: 20, 
      alignItems: 'center',
    },
  
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  
    backButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
    },
    addButton: {
      marginTop: 20,
      backgroundColor: '#A31A84',
      padding: 15,
      borderRadius: 20, 
      alignItems: 'center',
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      width: '80%',
      backgroundColor: '#FFFFFF',
      borderRadius: 20, 
      padding: 20,
      alignItems: 'center',
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      marginBottom: 20,
      color: '#A31A84',
    },
    label: {
      alignSelf: 'flex-start',
      marginBottom: 5,
      color: '#A31A84',
    },
    modalInput: {
      width: '100%',
      borderColor: '#A31A84',
      borderWidth: 1,
      borderRadius: 15, 
      padding: 10,
      marginBottom: 15,
      backgroundColor: '#FFFFFF',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 20,
    },
  
    saveButton: {
      backgroundColor: '#4CAF50',
      padding: 10,
      borderRadius: 20, 
      width: '48%',
      alignItems: 'center',
    },
  
    cancelButton: {
      backgroundColor: '#FF4B4B',
      padding: 10,
      borderRadius: 20, 
      width: '48%',
      alignItems: 'center',
    },
  
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    cancelButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    locationButton: {
      backgroundColor: '#A31A84',
      padding: 10,
      borderRadius: 20, 
      marginBottom: 10,
      alignItems: 'center',
      width: '100%',
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
    },
  });
  
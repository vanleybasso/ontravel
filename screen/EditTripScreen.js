import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { ref, update } from 'firebase/database';
import { database } from '../firebaseConfig';

export default function EditTripScreen({ route, navigation }) {
  const { tripId, trip } = route.params;
  const [description, setDescription] = useState(trip.description);
  const [location, setLocation] = useState(trip.location);
  const [date, setDate] = useState(new Date(trip.date).toISOString().split('T')[0]);

  const handleUpdateTrip = async () => {
    const tripRef = ref(database, `trips/${tripId}`);
    try {
      await update(tripRef, {
        description,
        location,
        date,
      });
      Alert.alert('Sucesso', 'Viagem atualizada com sucesso.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar a viagem: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Viagem</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Descrição"
      />
      <TextInput
        style={styles.input}
        value={location}
        onChangeText={setLocation}
        placeholder="Localização"
      />
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="Data (AAAA-MM-DD)"
      />
      <Button title="Atualizar Viagem" onPress={handleUpdateTrip} />
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
  input: {
    borderWidth: 1,
    borderColor: '#A31A84',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});

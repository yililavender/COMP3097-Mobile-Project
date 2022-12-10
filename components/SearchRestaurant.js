import React from 'react'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { ActivityIndicator } from 'react-native-paper'
import { Button, Text, TextInput } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'

const RestaurantDetails = ({id}) => {
  return(
    <TouchableOpacity>
      <Text>{id}</Text>
    </TouchableOpacity>  
)}


const RestaurantFetchDetails = ({name, address, rating, id, onPress, navigation}) => {
  return(
      <TouchableOpacity onPress={onPress} >
        <Text>Restaurant: {name}</Text>
        <Text>Rating: {rating}</Text>
        <Text>Address: {address}</Text>
      </TouchableOpacity>  
  )}

export default function SearchRestaurant( {navigation} ) {
  const [refresh, setRefresh] = React.useState(0);
  const [isLoading, setLoading] = React.useState(true);
  const [restaurantList, setRestaurants] = React.useState([])
  const [searchText, setText] = React.useState("")
  const [show, setShow] = React.useState(false)
  const [id, setID] = React.useState(null)

  const toggleText = () => setShow(show => !show)



  const getRestaurantList = async () => {
    const query = searchText.toLowerCase()
    const data = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=Toronto%${query}&type=restaurant&location=43.6532%2c79.3832&radius=10000&key=AIzaSyAYUSjjwuGFc39sHx0iQs9oGcETmzAEesk`)
    const json = await data.json()
    setRestaurants(json.results)
    setLoading(false)
  }
  
  React.useEffect(() => {
    getRestaurantList().catch(console.error)
  },[getRestaurantList])

  return (
    <SafeAreaView>
      { isLoading ? <ActivityIndicator/> : (
        <>
      <TextInput
        onChangeText={text => setText(text)}
        value={searchText}
        style={{height:40,margin:20}}
      />
      <Button
        title="Go to Details"
        onPress={toggleText}>Search</Button>
            <FlatList
            data={restaurantList}
            renderItem={({item}) => (
              <RestaurantFetchDetails 
                name={item.name}
                address={item.formatted_address}
                rating={item.rating}
                id={item.place_id}
                onPress={() => {
                  navigation.navigate('Test', { id: item.place_id })
                }}
              />
            )}
            keyExtractor={item=>item.place_id}
            extraData={refresh}
          />
        </>
      )}
    </SafeAreaView>
  )}
import * as React from 'react';
import { Text, View, StyleSheet, Button, ImageBackground , ActivityIndicator, Image} from 'react-native';
import qs from 'qs';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


async function sendEmail(to, subject, body, options = {}) {
    const { cc, bcc } = options;

    let url = `mailto:${to}`;

    // Create email link query
    const query = qs.stringify({
        subject: subject,
        body: body,
        cc: cc,
        bcc: bcc
    });

    if (query.length) {
        url += `?${query}`;
    }

    // check if we can use this link
    const canOpen = await Linking.canOpenURL(url);

    if (!canOpen) {
        throw new Error('Provided URL can not be handled');
    }

    return Linking.openURL(url);
}

export default function DetailScreen({navigation, route}) {
  const [isLoading, setLoading] = React.useState(true);
  const [restaurant, setRestaurant] = React.useState({})
  const [openHrs, setOpenHrs] = React.useState({})
  const [restaurantList, setRestaurants] = React.useState([])
  const [inList, setInList] = React.useState(false)

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('data')
      return jsonValue !== null ? setRestaurants(JSON.parse(jsonValue)) : 
      setRestaurants();
    } catch(e) {
      console.log(e)
    }
  }

  const isInList = async () => {
    try{
        if (restaurantList.length > 0) {
          restaurantList.map(restaurant => {
            if (restaurant.place_id === route.params.item.place_id){
              setInList(true)
            }
          })
        }
    } catch(e) {
      console.log(e)
    }
  }

  const getRestaurantDetail = async () => {
    try{
      const getID = route.params.item.place_id
      const data = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${getID}&key=AIzaSyAYUSjjwuGFc39sHx0iQs9oGcETmzAEesk`)
      const json = await data.json()
      setRestaurant(json.result)
      setOpenHrs(json.result.current_opening_hours.weekday_text)
    } catch (e) {
      console.error(e)
    }finally {
      setLoading(false)
    }
  } 

  React.useEffect(() => {
    getRestaurantDetail()
    getData()
    isInList()
    })

  return (
    <ImageBackground source={require('../assets/background.jpg')} style={styles.backgroundImage} imageStyle={{opacity: 0.4}}>
      <View style={styles.container}>
      {
      isLoading ? <ActivityIndicator/> :
      <>
        {!inList &&
        <Button title='Add Restaurant' 
        onPress={() => navigation.navigate("Add", 
        { name: restaurant.name,
          address: restaurant.formatted_address,
          phone: restaurant.formatted_phone_number,
          place_id: route.params.item.place_id})}/>}
        <Text style={styles.title}>{restaurant.name}</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Image style={{height: 30, width: 30}} source={require('../assets/location.png')} />
          <Text style={styles.paragraph}>{restaurant.formatted_address}</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Image style={styles.logo} source={require('../assets/call.png')} />
          <Text style={styles.paragraph}>{restaurant.formatted_phone_number}</Text>
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Image style={styles.logo} source={require('../assets/tag.png')} />
        </View>
        <Text style={styles.paragraph}>{restaurant["editorial_summary"] === undefined? 
        "" : restaurant.editorial_summary.overview}</Text>
        <Text style={styles.paragraph}>Opening Hours:</Text>
        <Text style={styles.paragraph}>{openHrs[0]}</Text>
        <Text style={styles.paragraph}>{openHrs[1]}</Text>
        <Text style={styles.paragraph}>{openHrs[2]}</Text>
        <Text style={styles.paragraph}>{openHrs[3]}</Text>
        <Text style={styles.paragraph}>{openHrs[4]}</Text>
        <Text style={styles.paragraph}>{openHrs[5]}</Text>
        <Text style={styles.paragraph}>{openHrs[6]}</Text>
        <Text style={styles.share}>Share with Friends and Family</Text>
        <Image style={{height: 25, width: 25}} source={require('../assets/mail.png')} />
        </>
      }
      </View>
    </ImageBackground>
  ); 
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  paragraph: {
    margin: 5,
    marginTop: 0,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logo: {
    height: 20,
    width: 20,
  },
  backgroundImage: {
      flex: 1,
      resizeMode: 'cover',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      backgroundPosition: 'center',
  },
  title: {
    margin: 24,
    marginTop: 0,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  share: {
    margin: 24,
    marginTop: 0,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
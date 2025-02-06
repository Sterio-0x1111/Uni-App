import { defineStore, StoreDefinition } from 'pinia';
import * as geolib from 'geolib';

interface DistanceWrapper { 
    location: string, 
    distance: number
}

interface Location {
  latitude: number;
  longitude: number;
}

const universityLocations: { [key: string]: Location } = {
  "Iserlohn":     { latitude: 51.36833327365097, longitude: 7.687424370598792 },
  "Soest":        { latitude: 51.56199805254962, longitude: 8.113431427758739 },
  "Hagen":        { latitude: 51.36652513985188, longitude: 7.497639741477852 },
  "Meschede":     { latitude: 51.36216487349944, longitude: 8.295251412925401 },
  "Lüdenscheid":  { latitude: 51.221819170670535, longitude: 7.630204529517563 }
};

function getGeolocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject(new Error('Geolocation is not supported by your browser'));
      }
    });
}

export const useLocationStore = defineStore('loc', {
    state: () => ({
        nextLocation: '' as string,
        nextLocationDistance: -1 as number,
        alternateLocation: '' as string,
        alternateLocationDistance: -1 as number, 
        latitude: 0.0 as number,
        longtitude: 0.0 as number
        
    }), 
    /*actions: {
        async locateClient() {
            console.log('Entered locateClient()');
            const success = (position : GeolocationPosition) => {
                console.log('Entered success()');
                
                interface Location {
                    latitude: number;
                    longitude: number;
                }

                // Typisierung des Objekts mit einer Index-Signatur
                const universityLocations: { [key: string]: Location } = {
                    "Hagen":        { latitude: 51.36652513985188, longitude: 7.497639741477852 },
                    "Iserlohn":     { latitude: 51.36833327365097, longitude: 7.687424370598792 },
                    "Meschede":     { latitude: 51.36216487349944, longitude: 8.295251412925401 },
                    "Soest":        { latitude: 51.56199805254962, longitude: 8.113431427758739 },
                    "Lüdenscheid":  { latitude: 51.221819170670535, longitude: 7.630204529517563 }
                };
                
                const currentPosition : Location = {
                    latitude:   position.coords.latitude,
                    longitude:  position.coords.longitude
                };
                
                const distances : DistanceWrapper[] = [];
                Object.keys(universityLocations).forEach(key => {
                    const university = universityLocations[key as keyof typeof universityLocations];  // Type Assertion
                    distances.push({
                        location: key,
                        distance: geolib.getDistance(currentPosition, university)
                    });
                });

                const minimalDistance : DistanceWrapper = distances.reduce((min, loc) => loc.distance < min.distance ? loc : min)
                this.nextLocation = minimalDistance.location;
                this.nextLocationDistance = minimalDistance.distance;

                console.log(this.nextLocation, this.nextLocationDistance);
                
            }
        
            const error = () => {
                console.log('Unable to retrieve your location');
                this.nextLocation = '';
                this.nextLocationDistance = -1;
            }
        
            if (!navigator.geolocation) {
                console.log('Geolocation is not supported by your browser');
            } else {
                console.log('Locating...');
                navigator.geolocation.getCurrentPosition(success, error);
            }
        }
    },*/
    actions: {
        async locateClient() : Promise<boolean> {
          try {
            const position = await getGeolocation(); // wartet auf das Ergebnis der Geolokalisierung
      
            const currentPosition: Location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
      
            const distances: DistanceWrapper[] = [];
            Object.keys(universityLocations).forEach(key => {
              const university = universityLocations[key as keyof typeof universityLocations];
              distances.push({
                location: key,
                distance: geolib.getDistance(currentPosition, university)
              });

            });
      
            //const minimalDistance: DistanceWrapper = distances.reduce((min, loc) => loc.distance < min.distance ? loc : min);
            distances.sort((a, b) => a.distance - b.distance);
            
            // Aktualisiere den Zustand
            this.$patch({
              nextLocation: distances[0].location,//minimalDistance.location,
              nextLocationDistance: Math.round(distances[0].distance / 10) / 100, // Umwandlung von m in km und runden auf 2 Nachkommastellen
              alternateLocation: distances[1].location,
              alternateLocationDistance: Math.round(distances[1].distance / 10) / 100,
            });
      
            console.log(this.nextLocation, this.nextLocationDistance, this.alternateLocation);
            return true;
            
          } catch (error) {
            console.log('Unable to retrieve your location', error);
            this.$patch({
              nextLocation: '',
              nextLocationDistance: -1
            });
            return false;
          }
        }, 
        async getLocation() {
          try {
            if(this.nextLocation.length === 0 && this.nextLocationDistance === -1){
              await this.locateClient();
            }

            const result : DistanceWrapper = {
              location: this.nextLocation,
              distance: this.nextLocationDistance,
            }

            return result;
          } catch(error){

          }
        },
        /*locateClient2() : boolean {
          try {
            const success = (position: GeolocationPosition) => {
              const currentPosition: Location = {
                latitude:   position.coords.latitude,
                longitude:  position.coords.longitude
              };
        
              const distances: DistanceWrapper[] = [];
              Object.keys(universityLocations).forEach(key => {
                const university = universityLocations[key as keyof typeof universityLocations];
                distances.push({
                  location: key,
                  distance: geolib.getDistance(currentPosition, university)
                });
              });
        
              const minimalDistance: DistanceWrapper = distances.reduce((min, loc) => loc.distance < min.distance ? loc : min);
              console.log(minimalDistance.distance);
              console.log(minimalDistance.location);

              this.$patch({
                nextLocation: minimalDistance.location,
                nextLocationDistance: minimalDistance.distance
              });
            }

            const failure = () => {
              console.log('Failure');
            }

            if(navigator.geolocation && !this.nextLocation){
              navigator.geolocation.getCurrentPosition(success, failure);
            }
            return true;
          } catch(error){
            return false;
          }
        }*/
      },
    
    persist: {
        storage: sessionStorage,
    }
})



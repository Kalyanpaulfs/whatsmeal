import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp,
  type Unsubscribe 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { RestaurantStatus } from '../store/restaurantStore';

export interface RestaurantStatusData {
  status: RestaurantStatus;
  message: string;
  deliveryAvailable: boolean;
  lastUpdated: any; // Firebase timestamp
  updatedBy?: string; // Admin user email
}

const RESTAURANT_STATUS_DOC = 'restaurant/status';

export class RestaurantService {
  // Save restaurant status to Firebase
  static async saveRestaurantStatus(
    status: RestaurantStatus, 
    message: string, 
    deliveryAvailable: boolean,
    updatedBy?: string
  ): Promise<void> {
    try {
      await setDoc(doc(db, RESTAURANT_STATUS_DOC), {
        status,
        message,
        deliveryAvailable,
        lastUpdated: serverTimestamp(),
        updatedBy: updatedBy || 'admin'
      }, { merge: true }); // Use merge to avoid overwriting
      console.log('Restaurant status saved to Firebase');
    } catch (error) {
      console.error('Error saving restaurant status:', error);
      // Fallback to local storage if Firebase fails
      localStorage.setItem('restaurant-status-fallback', JSON.stringify({
        status,
        message,
        deliveryAvailable,
        lastUpdated: new Date().toISOString(),
        updatedBy: updatedBy || 'admin'
      }));
      throw error;
    }
  }

  // Get restaurant status from Firebase
  static async getRestaurantStatus(): Promise<RestaurantStatusData | null> {
    try {
      const docRef = doc(db, RESTAURANT_STATUS_DOC);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as RestaurantStatusData;
      } else {
        console.log('No restaurant status document found');
        return null;
      }
    } catch (error) {
      // Don't log error to console to avoid spam
      console.warn('Firebase get failed, using local storage fallback');
      
      // Fallback to local storage if Firebase fails
      const fallbackData = localStorage.getItem('restaurant-status-fallback');
      if (fallbackData) {
        try {
          const parsed = JSON.parse(fallbackData);
          return {
            ...parsed,
            lastUpdated: { seconds: Math.floor(new Date(parsed.lastUpdated).getTime() / 1000) }
          };
        } catch (parseError) {
          console.error('Error parsing fallback data:', parseError);
        }
      }
      
      // Return default values if no fallback data
      return {
        status: 'open' as RestaurantStatus,
        message: 'We are open and ready to serve you!',
        deliveryAvailable: true,
        lastUpdated: { seconds: Math.floor(Date.now() / 1000) },
        updatedBy: 'system'
      };
    }
  }

  // Listen to real-time restaurant status changes
  static subscribeToRestaurantStatus(
    callback: (data: RestaurantStatusData | null) => void
  ): Unsubscribe {
    const docRef = doc(db, RESTAURANT_STATUS_DOC);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as RestaurantStatusData;
        console.log('Restaurant status updated from Firebase:', data);
        callback(data);
      } else {
        console.log('No restaurant status document found');
        callback(null);
      }
    }, () => {
      // Don't log error to console to avoid spam
      console.warn('Firebase listener failed, using local storage fallback');
      
      // Fallback to local storage if Firebase fails
      const fallbackData = localStorage.getItem('restaurant-status-fallback');
      if (fallbackData) {
        try {
          const parsed = JSON.parse(fallbackData);
          const data = {
            ...parsed,
            lastUpdated: { seconds: Math.floor(new Date(parsed.lastUpdated).getTime() / 1000) }
          };
          callback(data);
        } catch (parseError) {
          console.error('Error parsing fallback data:', parseError);
          callback(null);
        }
      } else {
        // Initialize with default values if no fallback data
        const defaultData = {
          status: 'open' as RestaurantStatus,
          message: 'We are open and ready to serve you!',
          deliveryAvailable: true,
          lastUpdated: { seconds: Math.floor(Date.now() / 1000) },
          updatedBy: 'system'
        };
        callback(defaultData);
      }
    });
  }

  // Initialize default restaurant status if none exists
  static async initializeDefaultStatus(): Promise<void> {
    try {
      const existingStatus = await this.getRestaurantStatus();
      
      if (!existingStatus) {
        // Try to save to Firebase, but don't fail if permissions are denied
        try {
          await this.saveRestaurantStatus(
            'open',
            'We are open and ready to serve you!',
            true,
            'system'
          );
          console.log('Default restaurant status initialized in Firebase');
        } catch (firebaseError) {
          console.warn('Firebase permissions denied, using local storage fallback');
          // Initialize in local storage as fallback
          localStorage.setItem('restaurant-status-fallback', JSON.stringify({
            status: 'open',
            message: 'We are open and ready to serve you!',
            deliveryAvailable: true,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'system'
          }));
        }
      }
    } catch (error) {
      // Don't log error to console to avoid spam
      console.warn('Using local storage fallback for restaurant status');
      
      // Ensure we have fallback data
      const fallbackData = localStorage.getItem('restaurant-status-fallback');
      if (!fallbackData) {
        localStorage.setItem('restaurant-status-fallback', JSON.stringify({
          status: 'open',
          message: 'We are open and ready to serve you!',
          deliveryAvailable: true,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'system'
        }));
      }
    }
  }
}

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { DeliverySettings, DeliverySettingsFormData, LocationValidationResult } from '../types/deliverySettings';
import { calculateDistance } from '../utils/locationUtils';

const COLLECTION_NAME = 'deliverySettings';

export class DeliverySettingsService {
  // Get all delivery settings
  static async getDeliverySettings(): Promise<DeliverySettings[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as DeliverySettings[];
    } catch (error) {
      console.error('DeliverySettingsService: Error fetching delivery settings:', error);
      throw error;
    }
  }

  // Get active delivery settings
  static async getActiveDeliverySettings(): Promise<DeliverySettings | null> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      const settings = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as DeliverySettings;
      
      return settings;
    } catch (error) {
      console.error('DeliverySettingsService: Error fetching active delivery settings:', error);
      throw error;
    }
  }

  // Get delivery settings by ID
  static async getDeliverySettingsById(id: string): Promise<DeliverySettings | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        } as DeliverySettings;
      }
      return null;
    } catch (error) {
      console.error('DeliverySettingsService: Error fetching delivery settings by ID:', error);
      throw error;
    }
  }

  // Add new delivery settings
  static async addDeliverySettings(settingsData: DeliverySettingsFormData): Promise<string> {
    try {
      // Clean the data to remove undefined values
      const cleanSettingsData = Object.fromEntries(
        Object.entries(settingsData).filter(([_, value]) => value !== undefined)
      );

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...cleanSettingsData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('DeliverySettingsService: Error adding delivery settings:', error);
      throw error;
    }
  }

  // Update delivery settings
  static async updateDeliverySettings(id: string, settingsData: Partial<DeliverySettingsFormData>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      
      // Clean the data to remove undefined values
      const cleanSettingsData = Object.fromEntries(
        Object.entries(settingsData).filter(([_, value]) => value !== undefined)
      );

      await updateDoc(docRef, {
        ...cleanSettingsData,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('DeliverySettingsService: Error updating delivery settings:', error);
      throw error;
    }
  }

  // Delete delivery settings
  static async deleteDeliverySettings(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('DeliverySettingsService: Error deleting delivery settings:', error);
      throw error;
    }
  }

  // Toggle delivery settings status
  static async toggleDeliverySettingsStatus(id: string, isActive: boolean): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        isActive,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('DeliverySettingsService: Error toggling delivery settings status:', error);
      throw error;
    }
  }

  // Validate location against delivery radius
  static validateLocation(
    userLatitude: number,
    userLongitude: number,
    restaurantLatitude: number,
    restaurantLongitude: number,
    deliveryRadius: number
  ): LocationValidationResult {
    try {
      console.log('DeliverySettingsService: validateLocation called with:');
      console.log('User:', { userLatitude, userLongitude });
      console.log('Restaurant:', { restaurantLatitude, restaurantLongitude });
      console.log('Radius:', deliveryRadius);
      
      const distance = calculateDistance(
        userLatitude,
        userLongitude,
        restaurantLatitude,
        restaurantLongitude
      );
      
      console.log('Calculated distance:', distance, 'km');

      if (distance <= deliveryRadius) {
        return {
          isValid: true,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
        };
      } else {
        return {
          isValid: false,
          error: `Sorry, you are ${Math.round(distance * 10) / 10}km away. We only deliver within ${deliveryRadius}km radius.`,
          distance: Math.round(distance * 10) / 10,
        };
      }
    } catch (error) {
      console.error('DeliverySettingsService: Error validating location:', error);
      return {
        isValid: false,
        error: 'Unable to calculate distance. Please try again.',
      };
    }
  }

  // Subscribe to delivery settings changes
  static subscribeToDeliverySettings(callback: (settings: DeliverySettings[]) => void): () => void {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const settings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as DeliverySettings[];
      
      callback(settings);
    });
  }

  // Subscribe to active delivery settings changes
  static subscribeToActiveDeliverySettings(callback: (settings: DeliverySettings | null) => void): () => void {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('isActive', '==', true)
    );

    return onSnapshot(q, (querySnapshot) => {
      if (querySnapshot.empty) {
        callback(null);
        return;
      }
      
      const doc = querySnapshot.docs[0];
      const settings = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      } as DeliverySettings;
      
      callback(settings);
    });
  }
}

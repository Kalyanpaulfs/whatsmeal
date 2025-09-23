import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../lib/cloudinary';
import type { MenuSection, Dish, DishFormData, SectionFormData } from '../types/menu';

const SECTIONS_COLLECTION = 'menuSections';
const DISHES_COLLECTION = 'dishes';

export class MenuService {
  // ===== MENU SECTIONS =====
  
  // Get all menu sections
  static async getSections(): Promise<MenuSection[]> {
    try {
      const sectionsRef = collection(db, SECTIONS_COLLECTION);
      const querySnapshot = await getDocs(sectionsRef);
      
      const sections = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MenuSection));
      
      // Sort in memory to avoid index requirements
      return sections.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
      console.error('Error fetching sections:', error);
      throw error;
    }
  }

  // Add new menu section
  static async addSection(sectionData: SectionFormData): Promise<string> {
    try {
      console.log('MenuService: Adding section with data:', sectionData);
      const sectionsRef = collection(db, SECTIONS_COLLECTION);
      
      // Get current max order
      const existingSections = await this.getSections();
      const maxOrder = existingSections.reduce((max, section) => 
        Math.max(max, section.order), 0
      );
      
      const newSection = {
        ...sectionData,
        order: maxOrder + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('MenuService: New section data:', newSection);
      const docRef = await addDoc(sectionsRef, newSection);
      console.log('MenuService: Section added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('MenuService: Error adding section:', error);
      throw error;
    }
  }

  // Update menu section
  static async updateSection(sectionId: string, sectionData: Partial<SectionFormData>): Promise<void> {
    try {
      const sectionRef = doc(db, SECTIONS_COLLECTION, sectionId);
      await updateDoc(sectionRef, {
        ...sectionData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  }

  // Delete menu section
  static async deleteSection(sectionId: string): Promise<void> {
    try {
      // First, delete all dishes in this section
      const dishesInSection = await this.getDishesBySection(sectionId);
      await Promise.all(dishesInSection.map(dish => this.deleteDish(dish.id)));
      
      // Then delete the section
      const sectionRef = doc(db, SECTIONS_COLLECTION, sectionId);
      await deleteDoc(sectionRef);
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  }

  // ===== DISHES =====
  
  // Get all dishes
  static async getDishes(): Promise<Dish[]> {
    try {
      const dishesRef = collection(db, DISHES_COLLECTION);
      const querySnapshot = await getDocs(dishesRef);
      
      const dishes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Dish));
      
      // Sort in memory to avoid index requirements
      return dishes.sort((a, b) => {
        if (a.order !== b.order) {
          return (a.order || 0) - (b.order || 0);
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error fetching dishes:', error);
      throw error;
    }
  }

  // Get dishes by section
  static async getDishesBySection(sectionId: string): Promise<Dish[]> {
    try {
      const dishesRef = collection(db, DISHES_COLLECTION);
      const q = query(
        dishesRef,
        where('sectionId', '==', sectionId)
      );
      const querySnapshot = await getDocs(q);
      
      const dishes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Dish));
      
      // Sort in memory to avoid index requirements
      return dishes.sort((a, b) => {
        if (a.order !== b.order) {
          return (a.order || 0) - (b.order || 0);
        }
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      console.error('Error fetching dishes by section:', error);
      throw error;
    }
  }

  // Add new dish
  static async addDish(dishData: DishFormData): Promise<string> {
    try {
      console.log('MenuService: Adding dish with data:', dishData);
      let imageUrl = '';
      let imagePublicId = '';
      
      // Upload image to Cloudinary if provided
      if (dishData.image) {
        console.log('MenuService: Uploading image to Cloudinary...');
        const uploadResult = await uploadImageToCloudinary(dishData.image);
        if (!uploadResult.success) {
          console.warn('MenuService: Image upload failed, continuing without image:', uploadResult.error);
          // Continue without image instead of throwing error
          imageUrl = '';
          imagePublicId = '';
        } else {
          imageUrl = uploadResult.url!;
          imagePublicId = uploadResult.publicId!;
          console.log('MenuService: Image uploaded successfully:', imageUrl);
        }
      }
      
      // Get current max order for this section (simplified approach)
      const maxOrder = 0; // Start with 0, Firebase will handle ordering
      
      const dishesRef = collection(db, DISHES_COLLECTION);
      const newDish = {
        name: dishData.name,
        description: dishData.description,
        price: dishData.price,
        image: imageUrl,
        imagePublicId: imagePublicId,
        sectionId: dishData.sectionId,
        isAvailable: dishData.isAvailable,
        isPopular: dishData.isPopular,
        isVegetarian: dishData.isVegetarian,
        isVegan: dishData.isVegan,
        isSpicy: dishData.isSpicy,
        allergens: dishData.allergens,
        preparationTime: dishData.preparationTime,
        calories: dishData.calories,
        rating: 0, // New dishes start with 0 rating
        order: maxOrder + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log('MenuService: New dish data:', newDish);
      const docRef = await addDoc(dishesRef, newDish);
      console.log('MenuService: Dish added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('MenuService: Error adding dish:', error);
      throw error;
    }
  }

  // Update dish
  static async updateDish(dishId: string, dishData: Partial<DishFormData>): Promise<void> {
    try {
      const dishRef = doc(db, DISHES_COLLECTION, dishId);
      const updateData: any = {
        ...dishData,
        updatedAt: serverTimestamp(),
      };
      
      // Handle image upload if new image provided
      if (dishData.image) {
        // Get current dish to delete old image
        const currentDish = await getDoc(dishRef);
        if (currentDish.exists()) {
          const currentData = currentDish.data() as Dish;
          if (currentData.imagePublicId) {
            await deleteImageFromCloudinary(currentData.imagePublicId);
          }
        }
        
        // Upload new image
        const uploadResult = await uploadImageToCloudinary(dishData.image);
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Image upload failed');
        }
        
        updateData.image = uploadResult.url;
        updateData.imagePublicId = uploadResult.publicId;
      }
      
      // Remove image field if no new image provided
      if (!dishData.image) {
        delete updateData.image;
      }
      
      await updateDoc(dishRef, updateData);
    } catch (error) {
      console.error('Error updating dish:', error);
      throw error;
    }
  }

  // Delete dish
  static async deleteDish(dishId: string): Promise<void> {
    try {
      // Get dish data to delete image from Cloudinary
      const dishRef = doc(db, DISHES_COLLECTION, dishId);
      const dishDoc = await getDoc(dishRef);
      
      if (dishDoc.exists()) {
        const dishData = dishDoc.data() as Dish;
        if (dishData.imagePublicId) {
          await deleteImageFromCloudinary(dishData.imagePublicId);
        }
      }
      
      // Delete dish from Firestore
      await deleteDoc(dishRef);
    } catch (error) {
      console.error('Error deleting dish:', error);
      throw error;
    }
  }

  // Toggle dish availability
  static async toggleDishAvailability(dishId: string): Promise<void> {
    try {
      const dishRef = doc(db, DISHES_COLLECTION, dishId);
      const dishDoc = await getDoc(dishRef);
      
      if (dishDoc.exists()) {
        const currentData = dishDoc.data() as Dish;
        await updateDoc(dishRef, {
          isAvailable: !currentData.isAvailable,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error toggling dish availability:', error);
      throw error;
    }
  }

  // ===== REAL-TIME LISTENERS =====
  
  // Listen to sections changes
  static subscribeToSections(callback: (sections: MenuSection[]) => void): Unsubscribe {
    const sectionsRef = collection(db, SECTIONS_COLLECTION);
    
    return onSnapshot(sectionsRef, (querySnapshot) => {
      const sections = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as MenuSection));
      
      // Sort in memory to avoid index requirements
      const sortedSections = sections.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(sortedSections);
    });
  }

  // Listen to dishes changes
  static subscribeToDishes(callback: (dishes: Dish[]) => void): Unsubscribe {
    const dishesRef = collection(db, DISHES_COLLECTION);
    
    return onSnapshot(dishesRef, (querySnapshot) => {
      const dishes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Dish));
      
      // Sort in memory to avoid index requirements
      const sortedDishes = dishes.sort((a, b) => {
        if (a.order !== b.order) {
          return (a.order || 0) - (b.order || 0);
        }
        return a.name.localeCompare(b.name);
      });
      callback(sortedDishes);
    });
  }

  // Listen to dishes by section changes
  static subscribeToDishesBySection(
    sectionId: string, 
    callback: (dishes: Dish[]) => void
  ): Unsubscribe {
    const dishesRef = collection(db, DISHES_COLLECTION);
    const q = query(
      dishesRef,
      where('sectionId', '==', sectionId)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const dishes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Dish));
      
      // Sort in memory to avoid index requirements
      const sortedDishes = dishes.sort((a, b) => {
        if (a.order !== b.order) {
          return (a.order || 0) - (b.order || 0);
        }
        return a.name.localeCompare(b.name);
      });
      callback(sortedDishes);
    });
  }
}

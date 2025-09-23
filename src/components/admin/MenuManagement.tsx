import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star,
  Flame,
  Leaf,
  Database
} from 'lucide-react';
import { useMenuStore } from '../../store/menuStore';
import { useToastStore } from '../../store/toastStore';
import { ALLERGEN_OPTIONS } from '../../types/menu';
import { initializeSampleData } from '../../utils/initializeSampleData';
import { cleanupDuplicateSections } from '../../utils/cleanupDuplicateSections';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { Dish, MenuSection, DishFormData, SectionFormData } from '../../types/menu';

const MenuManagement: React.FC = () => {
  const {
    sections,
    dishes,
    isLoading,
    error,
    fetchSections,
    fetchDishes,
    addSection,
    updateSection,
    deleteSection,
    addDish,
    updateDish,
    deleteDish,
    toggleDishAvailability,
    getDishesBySection,
    getSectionById,
  } = useMenuStore();

  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = useState<'sections' | 'dishes'>('sections');
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showDishForm, setShowDishForm] = useState(false);
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [nameError, setNameError] = useState('');
  
  // Confirmation modal states
  const [showDeleteSectionModal, setShowDeleteSectionModal] = useState(false);
  const [showDeleteDishModal, setShowDeleteDishModal] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<MenuSection | null>(null);
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);

  // Form states
  const [sectionForm, setSectionForm] = useState<SectionFormData>({
    name: '',
    description: '',
    isActive: true,
  });

  const [dishForm, setDishForm] = useState<DishFormData>({
    name: '',
    description: '',
    price: 0,
    sectionId: '',
    isAvailable: true,
    isPopular: false,
    isVegetarian: false,
    isVegan: false,
    isSpicy: false,
    allergens: [],
    preparationTime: 15,
    calories: 0,
  });

  // Load data on mount
  useEffect(() => {
    fetchSections();
    fetchDishes();
  }, [fetchSections, fetchDishes]);

  // Validate section name
  const validateSectionName = (name: string) => {
    if (!editingSection && name.trim()) {
      const sectionName = name.trim().toLowerCase();
      const existingSection = sections.find(section => 
        section.name.toLowerCase() === sectionName
      );
      
      if (existingSection) {
        setNameError(`Section "${name}" already exists!`);
        return false;
      } else {
        setNameError('');
        return true;
      }
    }
    setNameError('');
    return true;
  };

  // Handle section name change
  const handleSectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setSectionForm(prev => ({ ...prev, name }));
    validateSectionName(name);
  };

  // Handle section form
  const handleSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Section form submitted:', sectionForm);
    
    // Check for duplicate section names (case-insensitive)
    if (!editingSection && !validateSectionName(sectionForm.name)) {
      return; // Validation failed, error message already shown
    }
    
    try {
      if (editingSection) {
        console.log('Updating section:', editingSection.id);
        await updateSection(editingSection.id, sectionForm);
        
        // Success toast for update
        addToast({
          type: 'success',
          title: 'Section Updated!',
          message: `"${sectionForm.name}" section has been updated successfully.`,
          duration: 4000
        });
      } else {
        console.log('Adding new section');
        await addSection(sectionForm);
        
        // Success toast for creation
        addToast({
          type: 'success',
          title: 'Section Created!',
          message: `"${sectionForm.name}" section has been created successfully.`,
          duration: 4000
        });
      }
      console.log('Section saved successfully');
      resetSectionForm();
      setShowSectionForm(false);
    } catch (error) {
      console.error('Error saving section:', error);
      
      // Error toast
      addToast({
        type: 'error',
        title: 'Operation Failed',
        message: `Failed to ${editingSection ? 'update' : 'create'} section. Please try again.`,
        duration: 5000
      });
    }
  };

  const resetSectionForm = () => {
    setSectionForm({
      name: '',
      description: '',
      isActive: true,
    });
    setEditingSection(null);
    setNameError(''); // Clear any validation errors
    // Don't set showSectionForm to false here - let the form handle it
  };

  // Handle dish form
  const handleDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dish form submitted:', dishForm);
    try {
      if (editingDish) {
        console.log('Updating dish:', editingDish.id);
        await updateDish(editingDish.id, dishForm);
        
        // Success toast for update
        addToast({
          type: 'success',
          title: 'Dish Updated!',
          message: `"${dishForm.name}" has been updated successfully.`,
          duration: 4000
        });
      } else {
        console.log('Adding new dish');
        await addDish(dishForm);
        
        // Success toast for creation
        addToast({
          type: 'success',
          title: 'Dish Created!',
          message: `"${dishForm.name}" has been added to the menu successfully.`,
          duration: 4000
        });
      }
      console.log('Dish saved successfully');
      resetDishForm();
      setShowDishForm(false);
    } catch (error) {
      console.error('Error saving dish:', error);
      
      // Error toast
      addToast({
        type: 'error',
        title: 'Operation Failed',
        message: `Failed to ${editingDish ? 'update' : 'create'} dish. Please try again.`,
        duration: 5000
      });
    }
  };

  const resetDishForm = () => {
    setDishForm({
      name: '',
      description: '',
      price: 0,
      sectionId: '',
      isAvailable: true,
      isPopular: false,
      isVegetarian: false,
      isVegan: false,
      isSpicy: false,
      allergens: [],
      preparationTime: 15,
      calories: 0,
    });
    setEditingDish(null);
    // Don't set showDishForm to false here - let the form handle it
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDishForm(prev => ({ ...prev, image: file }));
    }
  };

  // Handle allergen toggle
  const toggleAllergen = (allergen: string) => {
    setDishForm(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  // Handle sample data initialization
  const handleInitializeSampleData = async () => {
    if (sections.length > 0 || dishes.length > 0) {
      const confirmed = window.confirm(
        'This will add sample data to your database. Existing data will not be affected. Continue?'
      );
      if (!confirmed) return;
    }

    setIsInitializing(true);
    try {
      const success = await initializeSampleData();
      if (success) {
        // Success toast
        addToast({
          type: 'success',
          title: 'Sample Data Loaded!',
          message: 'Sample menu data has been initialized successfully.',
          duration: 5000
        });
        
        // Refresh data
        await fetchSections();
        await fetchDishes();
      } else {
        // Warning toast
        addToast({
          type: 'warning',
          title: 'Initialization Failed',
          message: 'Failed to initialize sample data. Please check the console for errors.',
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
      
      // Error toast
      addToast({
        type: 'error',
        title: 'Initialization Error',
        message: 'Error initializing sample data. Please check the console for details.',
        duration: 6000
      });
    } finally {
      setIsInitializing(false);
    }
  };

  // Handle cleanup of duplicate sections
  const handleCleanupDuplicates = async () => {
    const confirmed = window.confirm(
      'This will remove duplicate sections and merge their dishes. This action cannot be undone. Continue?'
    );
    if (!confirmed) return;

    setIsCleaning(true);
    try {
      const success = await cleanupDuplicateSections();
      if (success) {
        // Success toast
        addToast({
          type: 'success',
          title: 'Cleanup Complete!',
          message: 'Duplicate sections have been cleaned up successfully.',
          duration: 5000
        });
        
        // Refresh data
        await fetchSections();
        await fetchDishes();
      } else {
        // Warning toast
        addToast({
          type: 'warning',
          title: 'Cleanup Failed',
          message: 'Failed to cleanup duplicate sections. Please check the console for errors.',
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Error cleaning up duplicates:', error);
      
      // Error toast
      addToast({
        type: 'error',
        title: 'Cleanup Error',
        message: 'Error cleaning up duplicates. Please check the console for details.',
        duration: 6000
      });
    } finally {
      setIsCleaning(false);
    }
  };

  // Handle section deletion with modal
  const handleDeleteSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setSectionToDelete(section);
    setShowDeleteSectionModal(true);
  };

  // Confirm section deletion
  const confirmDeleteSection = async () => {
    if (!sectionToDelete) return;

    try {
      await deleteSection(sectionToDelete.id);
      
      // Success toast
      addToast({
        type: 'success',
        title: 'Section Deleted!',
        message: `"${sectionToDelete.name}" section and its dishes have been deleted successfully.`,
        duration: 4000
      });
      
      // Close modal
      setShowDeleteSectionModal(false);
      setSectionToDelete(null);
    } catch (error) {
      console.error('Error deleting section:', error);
      
      // Error toast
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete section. Please try again.',
        duration: 5000
      });
    }
  };

  // Cancel section deletion
  const cancelDeleteSection = () => {
    setShowDeleteSectionModal(false);
    setSectionToDelete(null);
  };

  // Handle dish deletion with modal
  const handleDeleteDish = (dishId: string) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return;

    setDishToDelete(dish);
    setShowDeleteDishModal(true);
  };

  // Confirm dish deletion
  const confirmDeleteDish = async () => {
    if (!dishToDelete) return;

    try {
      await deleteDish(dishToDelete.id);
      
      // Success toast
      addToast({
        type: 'success',
        title: 'Dish Deleted!',
        message: `"${dishToDelete.name}" has been removed from the menu.`,
        duration: 4000
      });
      
      // Close modal
      setShowDeleteDishModal(false);
      setDishToDelete(null);
    } catch (error) {
      console.error('Error deleting dish:', error);
      
      // Error toast
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: 'Failed to delete dish. Please try again.',
        duration: 5000
      });
    }
  };

  // Cancel dish deletion
  const cancelDeleteDish = () => {
    setShowDeleteDishModal(false);
    setDishToDelete(null);
  };

  // Handle dish availability toggle with toast
  const handleToggleDishAvailability = async (dishId: string) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return;

    try {
      await toggleDishAvailability(dishId);
      
      // Info toast
      addToast({
        type: 'info',
        title: 'Availability Updated!',
        message: `"${dish.name}" is now ${!dish.isAvailable ? 'available' : 'unavailable'}.`,
        duration: 3000
      });
    } catch (error) {
      console.error('Error toggling dish availability:', error);
      
      // Error toast
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update dish availability. Please try again.',
        duration: 5000
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-sm sm:text-base text-gray-600">Manage your restaurant's menu sections and dishes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            className="px-3 py-2 sm:px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer text-sm sm:text-base"
            onClick={() => {
              console.log('Add Section button clicked!');
              setActiveTab('sections');
              setShowSectionForm(true);
              resetSectionForm();
            }}
          >
            + Add Section
          </button>
          <button
            className="px-3 py-2 sm:px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer text-sm sm:text-base"
            onClick={() => {
              console.log('Add Dish button clicked!');
              setActiveTab('dishes');
              setShowDishForm(true);
              resetDishForm();
            }}
          >
            + Add Dish
          </button>
          <button
            className="px-3 py-2 sm:px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer text-sm sm:text-base flex items-center gap-2"
            onClick={handleInitializeSampleData}
            disabled={isInitializing}
          >
            <Database className="w-4 h-4" />
            {isInitializing ? 'Initializing...' : 'Add Sample Data'}
          </button>
          <button
            className="px-3 py-2 sm:px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors cursor-pointer text-sm sm:text-base flex items-center gap-2"
            onClick={handleCleanupDuplicates}
            disabled={isCleaning}
          >
            <Trash2 className="w-4 h-4" />
            {isCleaning ? 'Cleaning...' : 'Clean Duplicates'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'sections'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sections ({sections.length})
        </button>
        <button
          onClick={() => setActiveTab('dishes')}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === 'dishes'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Dishes ({dishes.length})
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          {/* Sections List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {sections.map((section) => (
              <motion.div
                key={section.id}
                className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      section.isActive ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <span className={`text-xs sm:text-sm ${
                        section.isActive ? 'text-purple-600' : 'text-gray-400'
                      }`}>📋</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-semibold text-sm sm:text-base truncate ${
                        section.isActive ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {section.name}
                        {!section.isActive && ' (Inactive)'}
                      </h3>
                      {section.description && (
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingSection(section);
                        setSectionForm({
                          name: section.name,
                          description: section.description,
                          isActive: section.isActive,
                        });
                        setShowSectionForm(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{section.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{getDishesBySection(section.id).length} dishes</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      section.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {section.isActive ? 'Active' : 'Hidden from Menu'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Section Form Modal */}
          {showSectionForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    {editingSection ? 'Edit Section' : 'Add New Section'}
                  </h3>
                  <button
                    onClick={() => setShowSectionForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl p-1"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleSectionSubmit} className="space-y-4">
                  <div>
                    <Input
                      label="Section Name"
                      value={sectionForm.name}
                      onChange={handleSectionNameChange}
                      required
                      className={nameError ? 'border-red-500' : ''}
                    />
                    {nameError && (
                      <p className="text-red-500 text-sm mt-1">{nameError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={sectionForm.description}
                      onChange={(e) => setSectionForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={sectionForm.isActive}
                      onChange={(e) => setSectionForm(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      className="flex-1"
                      disabled={!!nameError}
                    >
                      {editingSection ? 'Update' : 'Create'} Section
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      resetSectionForm();
                      setShowSectionForm(false);
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* Dishes Tab */}
      {activeTab === 'dishes' && (
        <div className="space-y-4">
          {/* Section Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by section:</label>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="">All Sections</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>{section.name}</option>
              ))}
            </select>
          </div>

          {/* Dishes List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {(selectedSection ? getDishesBySection(selectedSection) : dishes).map((dish) => (
              <motion.div
                key={dish.id}
                className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow"
                whileHover={{ scale: 1.02 }}
              >
                {/* Dish Image */}
                <div className="mb-3">
                  {dish.image ? (
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{dish.name}</h3>
                      {dish.isPopular && <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current flex-shrink-0" />}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{dish.description}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>₹{dish.price}</span>
                      <span>•</span>
                      <span>{dish.preparationTime} min</span>
                      {dish.isVegetarian && <Leaf className="w-3 h-3 text-green-500" />}
                      {dish.isSpicy && <Flame className="w-3 h-3 text-red-500" />}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleToggleDishAvailability(dish.id)}
                      className={`p-1 rounded transition-colors ${
                        dish.isAvailable 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {dish.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => {
                        setEditingDish(dish);
                        setDishForm({
                          name: dish.name,
                          description: dish.description,
                          price: dish.price,
                          sectionId: dish.sectionId || '',
                          isAvailable: dish.isAvailable,
                          isPopular: dish.isPopular || false,
                          isVegetarian: dish.isVegetarian,
                          isVegan: dish.isVegan,
                          isSpicy: dish.isSpicy || false,
                          allergens: dish.allergens || [],
                          preparationTime: dish.preparationTime,
                          calories: dish.calories || 0,
                        });
                        setShowDishForm(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDish(dish.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    dish.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {dish.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <span className="text-gray-500">
                    {getSectionById(dish.sectionId || '')?.name || 'Unknown Section'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dish Form Modal */}
          {showDishForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl mx-4 my-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    {editingDish ? 'Edit Dish' : 'Add New Dish'}
                  </h3>
                  <button
                    onClick={() => setShowDishForm(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl p-1"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleDishSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Dish Name"
                      value={dishForm.name}
                      onChange={(e) => setDishForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                    <Input
                      label="Price (₹)"
                      type="number"
                      value={dishForm.price}
                      onChange={(e) => setDishForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={dishForm.description}
                      onChange={(e) => setDishForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section
                      </label>
                      <select
                        value={dishForm.sectionId}
                        onChange={(e) => setDishForm(prev => ({ ...prev, sectionId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        required
                      >
                        <option value="">Select Section</option>
                        {sections.map(section => (
                          <option key={section.id} value={section.id}>{section.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Input
                      label="Prep Time (min)"
                      type="number"
                      value={dishForm.preparationTime}
                      onChange={(e) => setDishForm(prev => ({ ...prev, preparationTime: Number(e.target.value) }))}
                    />
                    <Input
                      label="Calories"
                      type="number"
                      value={dishForm.calories}
                      onChange={(e) => setDishForm(prev => ({ ...prev, calories: Number(e.target.value) }))}
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={dishForm.isAvailable}
                        onChange={(e) => setDishForm(prev => ({ ...prev, isAvailable: e.target.checked }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Available</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={dishForm.isPopular}
                        onChange={(e) => setDishForm(prev => ({ ...prev, isPopular: e.target.checked }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Popular</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={dishForm.isVegetarian}
                        onChange={(e) => setDishForm(prev => ({ ...prev, isVegetarian: e.target.checked }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Vegetarian</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={dishForm.isSpicy}
                        onChange={(e) => setDishForm(prev => ({ ...prev, isSpicy: e.target.checked }))}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Spicy</span>
                    </label>
                  </div>

                  {/* Allergens */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergens
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ALLERGEN_OPTIONS.map(allergen => (
                        <button
                          key={allergen}
                          type="button"
                          onClick={() => toggleAllergen(allergen)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            dishForm.allergens.includes(allergen)
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {allergen}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-4">
                    <Button type="submit" variant="primary" className="flex-1">
                      {editingDish ? 'Update' : 'Create'} Dish
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      resetDishForm();
                      setShowDishForm(false);
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* Loading State - Inline */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="text-gray-700">Loading menu data...</span>
          </div>
        </div>
      )}

      {/* Section Delete Confirmation Modal */}
      {showDeleteSectionModal && sectionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">Delete Section</h3>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete the <strong>"{sectionToDelete.name}"</strong> section?
              </p>
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                ⚠️ This will also delete all dishes in this section ({getDishesBySection(sectionToDelete.id).length} dishes).
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={cancelDeleteSection}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSection}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dish Delete Confirmation Modal */}
      {showDeleteDishModal && dishToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900">Delete Dish</h3>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete <strong>"{dishToDelete.name}"</strong>?
              </p>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Dish Details:</p>
                <p>• Price: ₹{dishToDelete.price}</p>
                <p>• Section: {dishToDelete.sectionId ? getSectionById(dishToDelete.sectionId)?.name || 'Unknown' : 'Unknown'}</p>
                <p>• Status: {dishToDelete.isAvailable ? 'Available' : 'Unavailable'}</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={cancelDeleteDish}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDish}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Delete Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MenuManagement;

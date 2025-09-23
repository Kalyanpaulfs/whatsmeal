import { MenuService } from '../services/menuService';

export const cleanupDuplicateSections = async () => {
  try {
    console.log('Starting cleanup of duplicate sections...');
    
    // Get all sections
    const sections = await MenuService.getSections();
    console.log(`Found ${sections.length} sections`);
    
    // Group sections by name
    const sectionsByName = new Map<string, any[]>();
    
    sections.forEach(section => {
      const name = section.name.toLowerCase().trim();
      if (!sectionsByName.has(name)) {
        sectionsByName.set(name, []);
      }
      sectionsByName.get(name)!.push(section);
    });
    
    // Find duplicates (case-insensitive)
    const duplicates = Array.from(sectionsByName.entries())
      .filter(([, sections]) => sections.length > 1);
    
    console.log(`Found ${duplicates.length} duplicate section groups:`);
    duplicates.forEach(([name, sections]) => {
      console.log(`- "${name}": ${sections.length} duplicates`);
    });
    
    if (duplicates.length === 0) {
      console.log('No duplicates found. Database is clean.');
      return true;
    }
    
    // Process each duplicate group
    for (const [name, duplicateSections] of duplicates) {
      console.log(`Processing duplicates for "${name}": ${duplicateSections.length} sections`);
      
      // Keep the first section (oldest by creation date)
      const sectionsToKeep = duplicateSections[0];
      const sectionsToDelete = duplicateSections.slice(1);
      
      console.log(`Keeping section: ${sectionsToKeep.id} (${sectionsToKeep.name})`);
      
      // Move all dishes from duplicate sections to the kept section
      for (const sectionToDelete of sectionsToDelete) {
        console.log(`Moving dishes from section ${sectionToDelete.id} to ${sectionsToKeep.id}`);
        
        // Get dishes from the section to be deleted
        const dishesToMove = await MenuService.getDishesBySection(sectionToDelete.id);
        
        // Update each dish to point to the kept section
        for (const dish of dishesToMove) {
          try {
            await MenuService.updateDish(dish.id, {
              sectionId: sectionsToKeep.id
            });
            console.log(`Moved dish "${dish.name}" to section "${sectionsToKeep.name}"`);
          } catch (error) {
            console.error(`Failed to move dish "${dish.name}":`, error);
          }
        }
        
        // Delete the duplicate section
        try {
          await MenuService.deleteSection(sectionToDelete.id);
          console.log(`Deleted duplicate section: ${sectionToDelete.id} (${sectionToDelete.name})`);
        } catch (error) {
          console.error(`Failed to delete section ${sectionToDelete.id}:`, error);
        }
      }
    }
    
    console.log('Cleanup completed successfully!');
    return true;
  } catch (error) {
    console.error('Failed to cleanup duplicate sections:', error);
    return false;
  }
};

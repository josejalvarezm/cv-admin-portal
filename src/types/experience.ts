// Experience and Education domain types

/**
 * Achievement within an experience category
 */
export interface ExperienceAchievement {
  title: string;
  description: string;
}

/**
 * Category of achievements within an experience
 */
export interface ExperienceCategory {
  title: string;
  achievements: ExperienceAchievement[];
}

/**
 * Work experience entry
 */
export interface Experience {
  id?: number;
  company: string;
  location: string;
  period: string;
  role: string;
  reporting?: string;
  operatingLevel?: string;
  description: string;
  categories: ExperienceCategory[];
  technologies: string;
  display_order?: number;
  is_active?: boolean;
}

/**
 * API response for experience list
 */
export interface ExperienceResponse {
  experiences: Experience[];
}

/**
 * Focus area within education
 */
export interface EducationFocusArea {
  name: string;
}

/**
 * Education entry
 */
export interface Education {
  id?: number;
  institution: string;
  degree: string;
  location: string;
  focusAreas: string[];
  description: string;
  start_year?: string;
  end_year?: string;
  display_order?: number;
  is_active?: boolean;
}

/**
 * API response for education
 */
export interface EducationResponse {
  education: Education | null;
}

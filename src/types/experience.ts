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

/**
 * Contact information
 */
export interface ContactInfo {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  location?: string;
  work_authorization?: string;
  availability?: string;
  work_preference?: string;
}

/**
 * Profile with achievements
 */
export interface ProfileInfo {
  id?: number;
  title?: string;
  summary?: string;
  keyAchievements?: string[];
  portfolioProject?: {
    title: string;
    url: string;
    period: string;
    description: string;
    architecturalHighlights: string[];
    technicalImplementation: string[];
    businessValue: string[];
  };
}

/**
 * Content section (home, achievements - JSON blob)
 */
export interface ContentSection {
  id?: number;
  section_type: string;
  section_name?: string;
  json_content: Record<string, unknown>;
  display_order?: number;
  is_active?: boolean;
}
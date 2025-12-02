export type EmploymentType = "intern" | "part-time" | "full-time" | "remote";

export interface Job {
  id: string;
  title: string;
  company: string;
  city: string;
  salaryMin: number;
  salaryMax: number;
  postedAt: string;       // '2025-11-23'
  description: string;
  employmentType: EmploymentType;
  link: string;
  isFavorite: boolean;
}

export interface JobsState {
  id: "main";
  jobs: Job[];
}

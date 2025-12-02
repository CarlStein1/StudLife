import { useEffect, useState } from "react";
import type { JobsState, Job } from "./types";
import { loadJobs, saveJobs } from "./jobsStorage";

export function useJobs() {
  const [jobsState, setJobsState] = useState<JobsState | null>(null);
  const isLoading = jobsState === null;

  useEffect(() => {
    loadJobs().then(setJobsState);
  }, []);

  useEffect(() => {
    if (!jobsState) return;
    saveJobs(jobsState).catch(() => {});
  }, [jobsState]);

  const toggleFavorite = (id: string) => {
    setJobsState((prev) =>
      prev
        ? {
            ...prev,
            jobs: prev.jobs.map((job) =>
              job.id === id ? { ...job, isFavorite: !job.isFavorite } : job
            ),
          }
        : prev
    );
  };

  // при желании: добавление/обновление вакансий
  const addJob = (job: Job) => {
    setJobsState((prev) =>
      prev ? { ...prev, jobs: [...prev.jobs, job] } : prev
    );
  };

  return { jobsState, isLoading, toggleFavorite, addJob };
}

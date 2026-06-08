export type Category = "Fitness" | "Health" | "Learning";

export type ScoringBucket =
  | "strength_training"
  | "cardio"
  | "sports"
  | "nutrition"
  | "study"
  | "career";

export type Tag = {
  tag: string;
  category: Category;
  scoringBucket: ScoringBucket;
  basePoints: number;
};

export const tagsList: Tag[] = [
  {
    tag: "Weightlifting",
    category: "Fitness",
    scoringBucket: "strength_training",
    basePoints: 40,
  },
  {
    tag: "Running",
    category: "Fitness",
    scoringBucket: "cardio",
    basePoints: 38,
  },
  {
    tag: "Swimming",
    category: "Fitness",
    scoringBucket: "cardio",
    basePoints: 38,
  },
  {
    tag: "Cycling",
    category: "Fitness",
    scoringBucket: "cardio",
    basePoints: 35,
  },
  {
    tag: "Hiking",
    category: "Fitness",
    scoringBucket: "cardio",
    basePoints: 35,
  },
  {
    tag: "Yoga",
    category: "Fitness",
    scoringBucket: "cardio",
    basePoints: 28,
  },
  {
    tag: "Basketball",
    category: "Fitness",
    scoringBucket: "sports",
    basePoints: 35,
  },
  {
    tag: "Football",
    category: "Fitness",
    scoringBucket: "sports",
    basePoints: 35,
  },
  {
    tag: "Soccer",
    category: "Fitness",
    scoringBucket: "sports",
    basePoints: 35,
  },
  {
    tag: "Baseball",
    category: "Fitness",
    scoringBucket: "sports",
    basePoints: 30,
  },
  {
    tag: "Tennis",
    category: "Fitness",
    scoringBucket: "sports",
    basePoints: 35,
  },
  {
    tag: "Volleyball",
    category: "Fitness",
    scoringBucket: "sports",
    basePoints: 32,
  },
  {
    tag: "Martial Arts",
    category: "Fitness",
    scoringBucket: "sports",
    basePoints: 38,
  },
  {
    tag: "Other Sport",
    category: "Fitness",
    scoringBucket: "sports",
    basePoints: 32,
  },
  {
    tag: "Healthy Meal",
    category: "Health",
    scoringBucket: "nutrition",
    basePoints: 20,
  },
  {
    tag: "Meal Prep",
    category: "Health",
    scoringBucket: "nutrition",
    basePoints: 25,
  },
  {
    tag: "Cooking at Home",
    category: "Health",
    scoringBucket: "nutrition",
    basePoints: 22,
  },
  {
    tag: "Studying",
    category: "Learning",
    scoringBucket: "study",
    basePoints: 35,
  },
  {
    tag: "Reading",
    category: "Learning",
    scoringBucket: "study",
    basePoints: 28,
  },
  {
    tag: "Online Course",
    category: "Learning",
    scoringBucket: "study",
    basePoints: 32,
  },
  {
    tag: "Programming",
    category: "Learning",
    scoringBucket: "study",
    basePoints: 35,
  },
  {
    tag: "Writing",
    category: "Learning",
    scoringBucket: "study",
    basePoints: 30,
  },
  {
    tag: "Job Application",
    category: "Learning",
    scoringBucket: "career",
    basePoints: 30,
  },
  {
    tag: "Resume Work",
    category: "Learning",
    scoringBucket: "career",
    basePoints: 28,
  },
  {
    tag: "Interview Prep",
    category: "Learning",
    scoringBucket: "career",
    basePoints: 32,
  },
  {
    tag: "Research",
    category: "Learning",
    scoringBucket: "study",
    basePoints: 28,
  },
  {
    tag: "Skill Practice",
    category: "Learning",
    scoringBucket: "study",
    basePoints: 28,
  },
] as const;

import { Activity } from "../itinerary-activity/activity.types";

export interface ThingToDo {
  id?: string;
  title: string;
  activities: Activity[];
}

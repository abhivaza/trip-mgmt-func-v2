import { ThingToDo } from "../itinerary-things-todo/things-todo.types";

export interface ItineraryDay {
  dayNumber: number;
  place: string;
  title: string;
  description: string;
  thingsToDo?: ThingToDo[];
}

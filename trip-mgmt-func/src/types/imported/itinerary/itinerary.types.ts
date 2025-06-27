import { ItineraryDay } from "../itinerary-day/itinerary-day.types";

export interface ItineraryDocument {
  id?: string;
  createdBy?: string;
  sharedWith?: string[];
  status: string;
  city: string;
  fromDate: Date;
  tripDuration: number;
  country: string;
  popularityRank: number;
  tags: string[];
  itineraryDays: ItineraryDay[];
  imageURL?: string;
}

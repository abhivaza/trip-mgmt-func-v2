# Trip Mgmt Types

This package provides types for trip management domain.

## Type Hierarchy

The main type hierarchy is as follows:

- `Itinerary`: The plan of the trip.
  - `ItineraryDay`: A day of the trip.
    - `ItineraryDayThingsToDo`: A thing to do in a day of the trip.
      - `ItineraryDayActivity`: A activity for things to do in a day of the trip.


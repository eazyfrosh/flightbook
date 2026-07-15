export type CabinClass = "economy" | "premium_economy" | "business" | "first";

export type TripType = "one_way" | "round_trip" | "multi_city";

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
}

export interface Airline {
  id: string;
  name: string;
  code: string;
  logoColor: string;
  rating: number;
  baggageAllowance: {
    carryOn: string;
    checked: string;
  };
  aircraftTypes: string[];
  cabins: CabinClass[];
  founded: number;
  hubAirport: string;
}

export interface FlightSegment {
  id: string;
  airline: Airline;
  flightNumber: string;
  originCode: string;
  destinationCode: string;
  departureTime: string; // ISO
  arrivalTime: string; // ISO
  durationMinutes: number;
  aircraft: string;
}

export interface Flight {
  id: string;
  segments: FlightSegment[];
  stops: number;
  totalDurationMinutes: number;
  cabin: CabinClass;
  price: number;
  currency: string;
  availableSeats: number;
  refundable: boolean;
  baggageIncluded: string;
}

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface FlightSearchParams {
  tripType: TripType;
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  multiCitySegments?: { from: string; to: string; date: string }[];
  passengers: PassengerCounts;
  cabin: CabinClass;
}

export interface PassengerInfo {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  gender: "male" | "female" | "other";
  email: string;
  phone: string;
  type: "adult" | "child" | "infant";
}

export interface ExtrasSelection {
  extraBaggage: boolean;
  seatSelection: string | null;
  meal: string | null;
  travelInsurance: boolean;
  priorityBoarding: boolean;
}

export type PaymentMethodType =
  | "credit_card"
  | "debit_card"
  | "paypal"
  | "apple_pay"
  | "google_pay";

export interface SavedPaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  last4?: string;
  expiry?: string;
}

export type BookingStatus = "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  flights: Flight[];
  passengers: PassengerInfo[];
  extras: ExtrasSelection;
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  createdAt: string;
  paymentMethod: PaymentMethodType;
  seatAssignment: string | null;
}

export type UserRole = "user" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  nationality?: string;
  createdAt: string;
  savedPassengers: PassengerInfo[];
  savedPaymentMethods: SavedPaymentMethod[];
  favoriteDestinations: string[];
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageGradient: string;
  discountPercent: number;
  code: string;
  validUntil: string;
  active: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  percentOff: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiresAt: string;
}

export interface RecentSearch {
  from: string;
  to: string;
  departureDate: string;
  cabin: CabinClass;
  tripType: TripType;
  timestamp: number;
}

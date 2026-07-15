"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ExtrasSelection,
  Flight,
  FlightSearchParams,
  PassengerInfo,
  PaymentMethodType,
} from "@/types";

interface BookingState {
  searchParams: FlightSearchParams | null;
  selectedFlight: Flight | null;
  returnFlight: Flight | null;
  passengers: PassengerInfo[];
  extras: ExtrasSelection;
  paymentMethod: PaymentMethodType | null;
  setSearchParams: (params: FlightSearchParams) => void;
  selectFlight: (flight: Flight) => void;
  setPassengers: (passengers: PassengerInfo[]) => void;
  setExtras: (extras: ExtrasSelection) => void;
  setPaymentMethod: (method: PaymentMethodType) => void;
  reset: () => void;
}

const defaultExtras: ExtrasSelection = {
  extraBaggage: false,
  seatSelection: null,
  meal: null,
  travelInsurance: false,
  priorityBoarding: false,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      searchParams: null,
      selectedFlight: null,
      returnFlight: null,
      passengers: [],
      extras: defaultExtras,
      paymentMethod: null,
      setSearchParams: (params) => set({ searchParams: params }),
      selectFlight: (flight) => set({ selectedFlight: flight }),
      setPassengers: (passengers) => set({ passengers }),
      setExtras: (extras) => set({ extras }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      reset: () =>
        set({
          selectedFlight: null,
          returnFlight: null,
          passengers: [],
          extras: defaultExtras,
          paymentMethod: null,
        }),
    }),
    { name: "skybook-booking-draft" }
  )
);

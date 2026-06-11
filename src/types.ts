/**
 * Success Above Dreams (SAD) PMS Types
 */

// User Roles according to specifications
export enum UserRole {
  ADMIN = "Admin",
  FRONT_DESK = "Front Desk",
  HOUSEKEEPER = "Housekeeper",
  ACCOUNTANT = "Accountant",
}

// Room Statuses
export enum RoomStatus {
  AVAILABLE = "Available",
  OCCUPIED = "Occupied",
  RESERVED = "Reserved",
  UNDER_MAINTENANCE = "Under Maintenance",
}

// Housekeeping Statuses separate from Room Statuses
export enum HousekeepingStatus {
  CLEAN = "Clean",
  DIRTY = "Dirty",
  IN_PROGRESS = "In Progress",
  INSPECTED = "Inspected",
}

// Reservation Statuses
export enum ReservationStatus {
  CONFIRMED = "Confirmed",
  CHECKED_IN = "Checked-in",
  CHECKED_OUT = "Checked-out",
  CANCELLED = "Cancelled",
  NO_SHOW = "No-show",
}

// Payment Methods
export enum PaymentMethod {
  CASH = "Cash",
  MTN_MOMO = "MTN MoMo",
  VODAFONE_CASH = "Vodafone Cash",
  AIRTELTIGO_MONEY = "AirtelTigo Money",
  BANK_TRANSFER = "Bank Transfer",
}

// Hotel Configuration
export interface PropertyProfile {
  name: string;
  logo?: string; // Optional image URL or Base64
  phone: string;
  address: string;
  checkInTime: string; // e.g., "14:00"
  checkOutTime: string; // e.g., "12:00"
  vatRate: number; // e.g., 15 (15%)
  setupComplete: boolean;
}

// Room Type
export interface RoomType {
  id: string; // UUID / Code
  name: string; // Standard, Deluxe, Suite, etc.
  basePricePesewas: number; // Price per night in Pesewas (GHS x 100)
}

// Room Representation
export interface Room {
  id: string; // UUID
  roomNumber: string;
  roomTypeId: string;
  floor?: string; // Optional floor
  pricePesewas: number; // Set per room or defaults to type price
  status: RoomStatus;
  housekeepingStatus: HousekeepingStatus;
  notes?: string;
  assignedHousekeeperId?: string; // Reference to staff list
}

// Guest Representation
export interface Guest {
  id: string; // UUID
  fullName: string;
  phone: string;
  email?: string;
  nationality: string;
  idType: string; // e.g., "Ghana Card", "Passport"
  idNumber: string;
  notes?: string;
  vip: boolean; // VIP Flag
}

// Extra Charge
export interface ExtraCharge {
  id: string;
  label: string;
  amountPesewas: number;
  createdAt: string;
}

// Reservation Representation
export interface Reservation {
  id: string; // INN-YYYYMMDD-XXXX
  guestId: string;
  roomId: string; // Primary reserved room
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  adults: number;
  specialRequests?: string;
  depositAmountPesewas: number; // Optional deposit paid
  status: ReservationStatus;
  createdAt: string; // Date created
  cancellationFeePesewas?: number;
  // Recorded Guest ID on check in
  checkedInIdType?: string;
  checkedInIdNumber?: string;
  // Extra charges accumulated
  extraCharges: ExtraCharge[];
}

// Staff Representation
export interface Staff {
  id: string;
  fullName: string;
  role: UserRole;
  phone: string;
  username: string;
  psw: string;
  status: "Active" | "Deactivated";
  photo?: string; // Base64 or image URL
}

// Settle Folio / Bill representation
export interface Bill {
  id: string;
  reservationId: string;
  roomChargesPesewas: number; // Calculated nights * rate
  extrasChargesPesewas: number; // Sum of extra charges
  discountPesewas: number; // Fix discount
  vatPesewas: number; // Auto calculated VAT
  totalPesewas: number; // Final payable sum
  paid: boolean;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  settledAt?: string;
}

// Toast indicator type
export interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

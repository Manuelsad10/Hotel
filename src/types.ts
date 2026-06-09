/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Property Modes
export enum PropertyMode {
  GUESTHOUSE = "GUESTHOUSE",
  MIDSIZE_HOTEL = "MIDSIZE_HOTEL",
  LARGE_HOTEL = "LARGE_HOTEL",
}

// User Roles
export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN_MANAGER = "ADMIN_MANAGER",
  FRONT_DESK_AGENT = "FRONT_DESK_AGENT",
  HOUSEKEEPER = "HOUSEKEEPER",
  HOUSEKEEPING_SUPERVISOR = "HOUSEKEEPING_SUPERVISOR",
  RESTAURANT_STAFF = "RESTAURANT_STAFF",
  ACCOUNTANT = "ACCOUNTANT",
  INVENTORY_MANAGER = "INVENTORY_MANAGER",
  CONFERENCE_COORDINATOR = "CONFERENCE_COORDINATOR",
}

// Room Statuses
export enum RoomStatus {
  AVAILABLE = "Available",
  OCCUPIED = "Occupied",
  RESERVED = "Reserved",
  UNDER_MAINTENANCE = "Under Maintenance",
  OUT_OF_ORDER = "Out of Order",
}

// Housekeeping Statuses
export enum HousekeepingStatus {
  CLEAN = "Clean",
  DIRTY = "Dirty",
  INSPECTING = "Inspecting",
  INSPECTED = "Inspected",
}

// Housekeeping Task Statuses
export enum HousekeepingTaskStatus {
  PENDING = "Pending",
  IN_PROGRESS = "In Progress",
  DONE = "Done",
  INSPECTED = "Inspected",
}

// Reservation Statuses
export enum ReservationStatus {
  ENQUIRY = "Enquiry",
  CONFIRMED = "Confirmed",
  CHECKED_IN = "Checked-in",
  CHECKED_OUT = "Checked-out",
  CANCELLED = "Cancelled",
  NO_SHOW = "No-show",
}

// Reservation Sources
export enum ReservationSource {
  WALK_IN = "Walk-in",
  PHONE = "Phone",
  DIRECT_BOOKING = "Direct Booking",
  ONLINE_OTA = "Online Booking",
}

// Payment Methods
export enum PaymentMethod {
  CASH = "Cash",
  MTN_MOMO = "MTN MoMo",
  VODAFONE_CASH = "Vodafone Cash",
  AIRTELTIGO_MONEY = "AirtelTigo Money",
  BANK_TRANSFER = "Bank Transfer",
  CORPORATE_ACCOUNT = "Corporate Account",
  CARD = "Visa/Mastercard",
}

// Folio Charge Types
export enum ChargeType {
  ROOM_REVENUE = "Room rate × nights",
  RESTAURANT = "Restaurant & Bar",
  CONFERENCE = "Conference booking",
  AMENITY = "Amenity / Spa",
  MINIBAR = "Minibar",
  LAUNDRY = "Laundry",
  EXTRA_BED = "Extra Bed",
  OTHER = "Other extras",
}

// Property Configuration
export interface PropertyProfile {
  name: string;
  logo: string; // Base64 or object URL description
  address: string;
  phone: string;
  email: string;
  gtaLicense?: string;
  approxRooms: number;
  checkInTime: string; // e.g. "14:00"
  checkOutTime: string; // e.g. "12:00"
  currency: string; // e.g. "GHS ₵"
  taxEnabled: boolean;
  taxRate: number; // e.g. 15 for 15%
  cityLevyEnabled: boolean;
  cityLevyRate: number; // e.g. 1%
  mode: PropertyMode;
  setupComplete: boolean;
}

// Standard Room Type
export interface RoomType {
  id: string; // UUID
  name: string; // Standard, Deluxe, Suite, Executive, Family, Presidential
  description: string;
  maxOccupancy: number;
  basePricePesewas: number; // GHS * 100
  amenities: string[]; // AC, WiFi, TV, Hot Water, Balcony, Sea view, etc.
}

// Room definition
export interface Room {
  id: string;
  roomNumber: string;
  floor: string;
  building?: string; // Large mode only
  roomTypeId: string;
  status: RoomStatus;
  housekeepingStatus: HousekeepingStatus;
  extraBedAdded: boolean;
  extraBedPricePesewas: number;
}

// Guest definition
export interface Guest {
  id: string;
  fullName: string;
  gender: "Male" | "Female" | "Other";
  nationality: string;
  idType: "Ghana Card" | "Passport" | "Voter ID" | "Driver's License";
  idNumber: string;
  phone: string;
  email: string;
  address: string;
  company?: string;
  vip: boolean;
  blacklist: boolean;
  blacklistReason?: string;
}

// Stay Record
export interface StayHistory {
  reservationId: string;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
  totalSpentPesewas: number;
}

// Guest Folio Charges
export interface FolioCharge {
  id: string;
  description: string;
  amountPesewas: number;
  type: ChargeType;
  createdAt: string; // ISO string
  postedQuantity: number;
}

// Settle Folio Record
export interface FolioSettle {
  charges: FolioCharge[];
  payments: Array<{
    amountPesewas: number;
    method: PaymentMethod;
    reference?: string;
    timestamp: string;
  }>;
  settled: boolean;
  discountPesewas: number;
}

// Reservation
export interface Reservation {
  id: string; // RES-YYYYMMDD-XXXX
  guestId: string;
  roomTypeId: string;
  roomId?: string; // Opt before checkin
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  adults: number;
  children: number;
  specialRequests?: string;
  source: ReservationSource;
  status: ReservationStatus;
  depositAmountPesewas: number;
  cancellationFeePesewas: number;
  createdAt: string;
}

// Group Reservation
export interface GroupReservation {
  id: string;
  groupName: string;
  contactName: string;
  phone: string;
  reservationIds: string[];
}

// Housekeeping Assignment
export interface HousekeepingTask {
  id: string;
  roomId: string;
  housekeeperId: string; // Staff ID
  status: HousekeepingTaskStatus;
  notes?: string;
  checklist: Array<{ label: string; completed: boolean }>;
  inspectionNotes?: string;
  updatedAt: string;
}

// Lost & found logs
export interface LostAndFoundLog {
  id: string;
  date: string; // YYYY-MM-DD
  roomId: string;
  description: string;
  status: "In Custody" | "Returned" | "Discarded";
  finderName: string;
  returnedToName?: string;
  notes?: string;
}

// Laundry Linen tracker
export interface LinenLog {
  id: string;
  date: string;
  item: string; // "Sheets", "Towels", "Pillowcases"
  qtySent: number;
  qtyReturned: number;
  status: "Pending" | "Partially Returned" | "Completed";
}

// Restaurant Categories
export type MenuCategory = "Starters" | "Local Dishes" | "Continental" | "Desserts" | "Soft Drinks" | "Alcoholic Beverages" | "Kids Menu";

// Menu Item
export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  pricePesewas: number;
  modifiers?: string[]; // e.g. "Extra Spicy", "No Ice"
  available: boolean;
}

// Restaurant Order & Bar tab
export interface RestaurantOrder {
  id: string;
  orderNumber: string; // RST-XXXX
  roomNumber?: string; // If charge to room, else standalone
  orderType: "Room Service" | "Table" | "Bar Tab";
  tableNumber?: string;
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    pricePesewas: number;
    modifier?: string;
  }>;
  status: "Pending" | "In Kitchen" | "Served" | "Paid" | "Charged to Room";
  paymentMethod?: PaymentMethod;
  totalPesewas: number;
  timestamp: string;
}

// Conference Room
export interface ConferenceRoom {
  id: string;
  name: string;
  capacity: number;
  layoutOptions: Array<"Theatre" | "Boardroom" | "U-shape" | "Classroom">;
  amenities: string[]; // Projector, PA, Whiteboard, etc
  halfDayRatePesewas: number;
  fullDayRatePesewas: number;
}

// Conference Booking
export interface ConferenceBooking {
  id: string; // CNF-YYYYMMDD-XXXX
  clientName: string;
  phone: string;
  email: string;
  conferenceRoomId: string;
  bookingDate: string; // YYYY-MM-DD
  durationSlot: "Half-Day" | "Full-Day";
  layoutChoice: "Theatre" | "Boardroom" | "U-shape" | "Classroom";
  attendeesCount: number;
  cateringRequired: boolean;
  cateringTotalPesewas: number;
  equipmentItemsChecked: string[];
  status: "Enquiry" | "Confirmed" | "In Progress" | "Completed" | "Cancelled";
  totalPricePesewas: number;
  depositAmountPesewas: number;
}

// Spa & Amenity Booking (Large only)
export interface AmenitySetup {
  id: string;
  name: "Pool" | "Spa" | "Gym" | "Tennis Court" | "Boat Ride" | "Game Room";
  pricePesewas: number;
  durationMinutes: number;
}

export interface AmenityBooking {
  id: string;
  guestName: string;
  roomNumber?: string; // standard or room guest
  amenityId: string;
  bookingDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:00 AM"
  status: "Confirmed" | "Completed" | "Cancelled";
  amountPesewas: number;
  paid: boolean;
  chargedToRoom: boolean;
}

// Staff management
export interface Staff {
  id: string;
  fullName: string;
  gender: "Male" | "Female" | "Other";
  role: UserRole;
  department: string;
  phone: string;
  email: string;
  hireDate: string;
  status: "Active" | "Inactive" | "On Leave";
  shift?: "Morning" | "Afternoon" | "Night";
  clockedIn?: boolean;
  clockInTime?: string;
  clockOutTime?: string;
}

// Inventory Catalog Item
export interface InventoryItem {
  id: string;
  name: string;
  category: "Linen" | "Toiletries" | "Cleaning" | "Kitchen" | "Stationery" | "Maintenance";
  unit: string; // pieces, liters, packs, etc.
  reorderLevel: number;
  stockLevel: number;
  baseCostPesewas: number;
  supplierName?: string;
}

// Stock Transaction
export interface StockTransaction {
  id: string;
  itemId: string;
  type: "IN" | "OUT";
  quantity: number;
  costPesewas?: number;
  department?: string; // For "OUT"
  timestamp: string;
}

// Low Inventory Alert
export interface InventoryAlert {
  itemId: string;
  itemName: string;
  currentStock: number;
  reorderLevel: number;
}

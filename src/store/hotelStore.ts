import { create } from "zustand";
import {
  PropertyMode,
  PropertyProfile,
  RoomType,
  Room,
  RoomStatus,
  HousekeepingStatus,
  HousekeepingTaskStatus,
  ReservationStatus,
  ReservationSource,
  PaymentMethod,
  ChargeType,
  Guest,
  Reservation,
  HousekeepingTask,
  LostAndFoundLog,
  MenuItem,
  RestaurantOrder,
  ConferenceRoom,
  ConferenceBooking,
  AmenitySetup,
  AmenityBooking,
  Staff,
  InventoryItem,
  StockTransaction,
  FolioCharge,
  FolioSettle,
  UserRole,
} from "../types";

// Base interface for our entire state
interface HotelState {
  // Config & Administration
  propertyProfile: PropertyProfile | null;
  currentUser: { username: string; fullName: string; role: UserRole } | null;

  // DB Collections
  roomTypes: RoomType[];
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  housekeepingTasks: HousekeepingTask[];
  lostAndFound: LostAndFoundLog[];
  menuItems: MenuItem[];
  restaurantOrders: RestaurantOrder[];
  conferenceRooms: ConferenceRoom[];
  conferenceBookings: ConferenceBooking[];
  amenities: AmenitySetup[];
  amenityBookings: AmenityBooking[];
  staffList: Staff[];
  inventoryList: InventoryItem[];
  stockTransactions: StockTransaction[];

  // Folio Database [ReservationId -> FolioSettle]
  folios: Record<string, FolioSettle>;

  // Alerts & Notifications (Toasts)
  toasts: Array<{ id: string; message: string; type: "success" | "error" | "info" }>;

  // --- ACTIONS ---
  // Configuration
  initializeSetup: (profile: Omit<PropertyProfile, "setupComplete">, adminUser: { fullName: string; username: string; psw: string }) => void;
  resetAllData: () => void;
  loginUser: (username: string, role: UserRole) => boolean;
  logoutUser: () => void;

  // Toast controls
  addToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;

  // Room & Types
  addRoom: (room: Omit<Room, "id" | "status" | "housekeepingStatus" | "extraBedAdded" | "extraBedPricePesewas">) => void;
  bulkCreateRooms: (start: number, end: number, floor: string, roomTypeId: string, building?: string) => void;
  updateRoomStatus: (roomId: string, status: RoomStatus) => void;
  updateRoomHousekeeping: (roomId: string, status: HousekeepingStatus) => void;
  toggleExtraBed: (roomId: string, active: boolean, pricePesewas: number) => void;
  addRoomType: (roomType: RoomType) => void;

  // Guests
  addGuest: (guest: Omit<Guest, "id">) => Guest;
  updateGuest: (guest: Guest) => void;

  // Reservations
  createReservation: (res: Omit<Reservation, "id" | "createdAt" | "cancellationFeePesewas">) => Reservation;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  modifyReservation: (updated: Reservation) => void;
  cancelReservation: (id: string) => void;

  // Folio Billing & Adjustment
  getOrCreateFolio: (reservationId: string) => FolioSettle;
  addFolioCharge: (reservationId: string, charge: Omit<FolioCharge, "id" | "createdAt">) => void;
  removeFolioCharge: (reservationId: string, chargeId: string) => void;
  recordFolioPayment: (reservationId: string, amountPesewas: number, method: PaymentMethod, reference?: string) => void;
  applyFolioDiscount: (reservationId: string, discountPesewas: number) => void;
  settleFolio: (reservationId: string) => void;

  // Housekeeping
  assignHousekeepingTask: (roomId: string, housekeeperId: string, notes?: string) => void;
  updateHousekeepingTask: (taskId: string, status: HousekeepingTaskStatus, notes?: string, checklist?: Array<{ label: string; completed: boolean }>) => void;
  addLostAndFoundItem: (item: Omit<LostAndFoundLog, "id">) => void;
  updateLostAndFoundStatus: (id: string, status: "In Custody" | "Returned" | "Discarded", notes?: string, returnedTo?: string) => void;

  // Restaurant
  addMenuItem: (item: MenuItem) => void;
  updateMenuItemAvailability: (id: string, available: boolean) => void;
  placeRestaurantOrder: (order: Omit<RestaurantOrder, "id" | "orderNumber" | "timestamp">) => RestaurantOrder;
  updateOrderStatus: (id: string, status: RestaurantOrder["status"]) => void;

  // Conference Bookings
  addConferenceRoom: (croom: ConferenceRoom) => void;
  bookConferenceRoom: (booking: Omit<ConferenceBooking, "id" | "status">) => ConferenceBooking;
  updateConferenceStatus: (id: string, status: ConferenceBooking["status"]) => void;

  // Amenities
  bookAmenity: (booking: Omit<AmenityBooking, "id" | "status">) => AmenityBooking;
  completeAmenityBooking: (id: string) => void;

  // Staff
  addStaff: (staff: Omit<Staff, "id">) => void;
  updateStaffStatus: (id: string, status: Staff["status"]) => void;
  clockStaff: (id: string, clockIn: boolean) => void;

  // Inventory
  addInventoryItem: (item: Omit<InventoryItem, "stockLevel">) => void;
  recordStockTransaction: (trans: Omit<StockTransaction, "id" | "timestamp">) => void;

  // Nightly trigger
  triggerNightlyRoomCharges: () => void;
}

// Internal default Room Types config
const DEFAULT_ROOM_TYPES: RoomType[] = [
  { id: "rt-standard", name: "Standard Room", description: "Comfortable standard room with basic amenities.", maxOccupancy: 2, basePricePesewas: 45000, amenities: ["AC", "WiFi", "TV", "Hot Water"] },
  { id: "rt-deluxe", name: "Deluxe Room", description: "Spacious luxury room with enhanced view and private balcony.", maxOccupancy: 2, basePricePesewas: 75000, amenities: ["AC", "WiFi", "TV", "Hot Water", "Balcony", "Sea view"] },
  { id: "rt-suite", name: "Executive Suite", description: "Grand suite with a separate private parlor and workspace.", maxOccupancy: 4, basePricePesewas: 150000, amenities: ["AC", "WiFi", "TV", "Hot Water", "Balcony", "Sea view", "Minibar", "Kitchenette"] },
  { id: "rt-presidential", name: "Presidential Villa", description: "Ultra-luxury multiple room villa with private infinity pool.", maxOccupancy: 6, basePricePesewas: 350000, amenities: ["AC", "WiFi", "TV", "Hot Water", "Balcony", "Sea view", "Minibar", "Kitchenette", "Private pool"] },
];

// Seed Helper Data
const SEED_GUESTS: Guest[] = [
  { id: "gst-1", fullName: "Kwesi Mensah", gender: "Male", nationality: "Ghanaian", idType: "Ghana Card", idNumber: "GHA-102948293-1", phone: "+233 24 412 3456", email: "kwesi@gmail.com", address: "Airport Residential, Accra", company: "MTN Ghana", vip: true, blacklist: false },
  { id: "gst-2", fullName: "Abena Osei", gender: "Female", nationality: "Ghanaian", idType: "Voter ID", idNumber: "VOT-999332211", phone: "+233 20 543 2109", email: "abena.osei@yahoo.com", address: "East Legon, Accra", vip: false, blacklist: false },
  { id: "gst-3", fullName: "John Smith", gender: "Male", nationality: "US Citizen", idType: "Passport", idNumber: "USA-49204910", phone: "+1 555-019-2834", email: "johnsmith@gmail.com", address: "Boston, MA", company: "USAID", vip: false, blacklist: false },
  { id: "gst-4", fullName: "Kofi Boateng", gender: "Male", nationality: "Ghanaian", idType: "Driver's License", idNumber: "DL-392019A", phone: "+233 50 111 2222", email: "kofiboat@gmail.com", address: "Kumasi", vip: false, blacklist: true, blacklistReason: "Property damage during last stay, refused to fully pay room tab." },
];

const SEED_STAFF: Staff[] = [
  { id: "stf-1", fullName: "Yao Azia", gender: "Male", role: UserRole.FRONT_DESK_AGENT, department: "Front Desk", phone: "+233 24 100 2001", email: "yao@staycore.com", hireDate: "01/01/2025", status: "Active" },
  { id: "stf-2", fullName: "Comfort Mensah", gender: "Female", role: UserRole.HOUSEKEEPER, department: "Housekeeping", phone: "+233 24 100 2002", email: "comfort@staycore.com", hireDate: "15/01/2025", status: "Active" },
  { id: "stf-3", fullName: "Kofi Appiah", gender: "Male", role: UserRole.HOUSEKEEPING_SUPERVISOR, department: "Housekeeping", phone: "+233 24 100 2003", email: "kappiah@staycore.com", hireDate: "10/02/2025", status: "Active" },
  { id: "stf-4", fullName: "Chef Amara", gender: "Female", role: UserRole.RESTAURANT_STAFF, department: "F&B Kitchen", phone: "+233 24 100 2004", email: "amara@staycore.com", hireDate: "20/02/2025", status: "Active" },
  { id: "stf-5", fullName: "David Mensah", gender: "Male", role: UserRole.ACCOUNTANT, department: "Finance", phone: "+233 24 100 2005", email: "david@staycore.com", hireDate: "01/03/2025", status: "Active" },
];

const SEED_INVENTORY: InventoryItem[] = [
  { id: "inv-1", name: "Premium Bath Towel", category: "Linen", unit: "pieces", reorderLevel: 40, stockLevel: 45, baseCostPesewas: 7500, supplierName: "Accra Linen Co." },
  { id: "inv-2", name: "Mini Toiletry Kit (Shampoo/Soap)", category: "Toiletries", unit: "packs", reorderLevel: 100, stockLevel: 120, baseCostPesewas: 450, supplierName: "Vivaldi Cosmetics" },
  { id: "inv-3", name: "Heavy Duty Multi-Surface Cleaner", category: "Cleaning", unit: "liters", reorderLevel: 25, stockLevel: 18, baseCostPesewas: 3500, supplierName: "Ghana Chemicals Ltd" }, // Low Stock!
  { id: "inv-4", name: "Basmati Rice 25kg", category: "Kitchen", unit: "bags", reorderLevel: 10, stockLevel: 12, baseCostPesewas: 38000, supplierName: "Kingdom Foods" },
  { id: "inv-5", name: "Double Bed Linen Sheet", category: "Linen", unit: "pieces", reorderLevel: 50, stockLevel: 62, baseCostPesewas: 12000, supplierName: "Accra Linen Co." },
];

const SEED_MENU: MenuItem[] = [
  // Starters
  { id: "mn-1", name: "Crispy Spring Rolls (Veg/Beef)", category: "Starters", pricePesewas: 4500, available: true },
  { id: "mn-2", name: "Spicy Samosas with Dip", category: "Starters", pricePesewas: 3500, available: true },
  // Local
  { id: "mn-3", name: "Ghanaian Jollof Rice with Grilled Chicken", category: "Local Dishes", pricePesewas: 9500, available: true, modifiers: ["Extra Spicy", "Mild", "Coleslaw on side"] },
  { id: "mn-4", name: "Special Goat Waakye Supreme", category: "Local Dishes", pricePesewas: 11000, available: true, modifiers: ["Wele", "Fried Fish", "Avocado"] },
  { id: "mn-5", name: "Pound Fufu with Fresh Goat Light Soup", category: "Local Dishes", pricePesewas: 12500, available: true },
  { id: "mn-6", name: "Spicy Kelewele with Peanuts", category: "Local Dishes", pricePesewas: 4500, available: true },
  // Continental
  { id: "mn-7", name: "Sizzling Beef Ribeye Steak & Fries", category: "Continental", pricePesewas: 28000, available: true, modifiers: ["Medium Rare", "Well Done", "Mushroom Sauce"] },
  { id: "mn-8", name: "Classic StayCore Club Sandwich", category: "Continental", pricePesewas: 7500, available: true },
  // Drinks
  { id: "mn-9", name: "Fresh Pineapple & Ginger Juice", category: "Soft Drinks", pricePesewas: 3500, available: true },
  { id: "mn-10", name: "Chilled Club Premium Lager Beer", category: "Alcoholic Beverages", pricePesewas: 4000, available: true },
  { id: "mn-11", name: "South African Shiraz (Glass)", category: "Alcoholic Beverages", pricePesewas: 7000, available: true },
];

const SEED_CONFERENCE_ROOMS: ConferenceRoom[] = [
  { id: "cr-1", name: "Freedom Hall Grand Ballroom", capacity: 250, layoutOptions: ["Theatre", "Classroom", "U-shape"], amenities: ["Projector", "Large Screen", "PA Sound System", "High-speed WiFi", "Lectern"], halfDayRatePesewas: 180000, fullDayRatePesewas: 320000 },
  { id: "cr-2", name: "Kwame Nkrumah Boardroom", capacity: 20, layoutOptions: ["Boardroom"], amenities: ["Interactive TV screen", "Conference phone", "Whiteboard", "Espresso machine"], halfDayRatePesewas: 80000, fullDayRatePesewas: 150000 },
];

const SEED_AMENITIES: AmenitySetup[] = [
  { id: "am-1", name: "Pool", pricePesewas: 5000, durationMinutes: 180 },
  { id: "am-2", name: "Spa", pricePesewas: 25000, durationMinutes: 60 },
  { id: "am-3", name: "Gym", pricePesewas: 3500, durationMinutes: 120 },
  { id: "am-4", name: "Boat Ride", pricePesewas: 18000, durationMinutes: 45 },
];

// Helper to generate UUID-like IDs
const uuid = () => Math.random().toString(36).substring(2, 15);

// Get default calendar dates for horizontal calendar: e.g. 15 dates starting from today minus 3 days
const todayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

// Safe localStorage helper
const getInitialState = () => {
  let parsed: any = null;
  try {
    const saved = localStorage.getItem("SAD_HOTEL_PERSISTENT_STATE");
    if (saved) {
      parsed = JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load state from localStorage:", e);
  }

  // Pre-seed default collections (Rooms, Reservations, etc)
  const seedRooms: Room[] = [];
  // Build rooms for standard floors
  const floorRoomsNum = [
    { floor: "Floor 1", start: 101, end: 106, type: "rt-standard" },
    { floor: "Floor 2", start: 201, end: 205, type: "rt-deluxe" },
    { floor: "Floor 3", start: 301, end: 303, type: "rt-suite" },
    { floor: "Penthouse", start: 401, end: 401, type: "rt-presidential" },
  ];

  floorRoomsNum.forEach(({ floor, start, end, type }) => {
    for (let r = start; r <= end; r++) {
      seedRooms.push({
        id: `rm-${r}`,
        roomNumber: r.toString(),
        floor,
        building: "Main Building Block",
        roomTypeId: type,
        status: RoomStatus.AVAILABLE,
        housekeepingStatus: HousekeepingStatus.CLEAN,
        extraBedAdded: false,
        extraBedPricePesewas: 12000,
      });
    }
  });

  // Seed standard active and past reservations
  const seedReservations: Reservation[] = [
    // 1. Past completed stay
    {
      id: "RES-20260601-3921",
      guestId: "gst-1",
      roomTypeId: "rt-standard",
      roomId: "rm-101",
      checkInDate: todayString(-8),
      checkOutDate: todayString(-5),
      adults: 2,
      children: 0,
      source: ReservationSource.ONLINE_OTA,
      status: ReservationStatus.CHECKED_OUT,
      depositAmountPesewas: 45000,
      cancellationFeePesewas: 0,
      createdAt: todayString(-10),
    },
    // 2. Currently checked-in stay (Occupied)
    {
      id: "RES-20260605-8420",
      guestId: "gst-2",
      roomTypeId: "rt-deluxe",
      roomId: "rm-201",
      checkInDate: todayString(-3),
      checkOutDate: todayString(2),
      adults: 2,
      children: 1,
      source: ReservationSource.WALK_IN,
      status: ReservationStatus.CHECKED_IN,
      depositAmountPesewas: 75000,
      cancellationFeePesewas: 0,
      createdAt: todayString(-5),
    },
    // 3. Confirmed arrival for today / tomorrow
    {
      id: "RES-20260609-1229",
      guestId: "gst-3",
      roomTypeId: "rt-suite",
      roomId: "rm-301",
      checkInDate: todayString(0),
      checkOutDate: todayString(4),
      adults: 1,
      children: 0,
      source: ReservationSource.DIRECT_BOOKING,
      status: ReservationStatus.CONFIRMED,
      depositAmountPesewas: 150000,
      cancellationFeePesewas: 0,
      createdAt: todayString(-3),
    },
  ];

  // Map the status of rooms based on active bookings
  seedRooms.find(r => r.id === "rm-201")!.status = RoomStatus.OCCUPIED;
  seedRooms.find(r => r.id === "rm-301")!.status = RoomStatus.RESERVED;

  // Let's create preseeded folios for these
  const folios: Record<string, FolioSettle> = {};

  // For Checked-out Reservation
  folios["RES-20260601-3921"] = {
    charges: [
      { id: "chg-1", description: "Standard Room Rate (3 nights)", amountPesewas: 135000, type: ChargeType.ROOM_REVENUE, createdAt: todayString(-8), postedQuantity: 3 },
      { id: "chg-2", description: "Mini Bar consumables", amountPesewas: 8500, type: ChargeType.MINIBAR, createdAt: todayString(-6), postedQuantity: 1 },
      { id: "chg-3", description: "Laundry service (Pressing)", amountPesewas: 4000, type: ChargeType.LAUNDRY, createdAt: todayString(-7), postedQuantity: 1 },
    ],
    payments: [
      { amountPesewas: 45000, method: PaymentMethod.MTN_MOMO, reference: "TXN-MOMO-8329482", timestamp: todayString(-10) + "T12:00:00.000Z" },
      { amountPesewas: 102500, method: PaymentMethod.CARD, reference: "VISA-AUTH-92049", timestamp: todayString(-5) + "T10:00:00.000Z" },
    ],
    settled: true,
    discountPesewas: 0,
  };

  // For active Checked-In Reservation
  folios["RES-20260605-8420"] = {
    charges: [
      { id: "chg-4", description: "Deluxe Room Rate (3 nights so far)", amountPesewas: 225000, type: ChargeType.ROOM_REVENUE, createdAt: todayString(-3), postedQuantity: 3 },
      { id: "chg-5", description: "Jollof Rice (Restaurant/Bar)", amountPesewas: 9500, type: ChargeType.RESTAURANT, createdAt: todayString(-2), postedQuantity: 1 },
      { id: "chg-6", description: "Club Lager Beer (Restaurant/Bar)", amountPesewas: 4000, type: ChargeType.RESTAURANT, createdAt: todayString(-2), postedQuantity: 1 },
    ],
    payments: [
      { amountPesewas: 75000, method: PaymentMethod.VODAFONE_CASH, reference: "TXN-VOD-10294", timestamp: todayString(-5) + "T14:30:00.000Z" },
    ],
    settled: false,
    discountPesewas: 0,
  };

  // For Confirmed Reservation
  folios["RES-20260609-1229"] = {
    charges: [
      { id: "chg-7", description: "Prepaid Booking Deposit", amountPesewas: 150000, type: ChargeType.ROOM_REVENUE, createdAt: todayString(-3), postedQuantity: 1 },
    ],
    payments: [
      { amountPesewas: 150000, method: PaymentMethod.BANK_TRANSFER, reference: "BANK-CORE-38294", timestamp: todayString(-3) + "T09:12:00.000Z" },
    ],
    settled: false,
    discountPesewas: 0,
  };

  // Pre-seed housekeeping tasks
  const seedHousekeepingTasks: HousekeepingTask[] = [
    {
      id: "hk-task-1",
      roomId: "rm-102",
      housekeeperId: "stf-2",
      status: HousekeepingTaskStatus.IN_PROGRESS,
      notes: "Guest requested extra towels and early make-up",
      checklist: [
        { label: "Change sheets", completed: true },
        { label: "Replenish toiletries", completed: false },
        { label: "Vaccuum / Sweep floor", completed: true },
        { label: "Check electronics", completed: false },
      ],
      updatedAt: todayString(0) + "T09:00:00.000Z",
    },
    {
      id: "hk-task-2",
      roomId: "rm-201",
      housekeeperId: "stf-2",
      status: HousekeepingTaskStatus.PENDING,
      notes: "Daily refresh",
      checklist: [
        { label: "Change sheets", completed: false },
        { label: "Replenish toiletries", completed: false },
        { label: "Vaccuum / Sweep floor", completed: false },
        { label: "Check electronics", completed: false },
      ],
      updatedAt: todayString(0) + "T08:00:00.000Z",
    },
  ];

  // Low preseeded Lost and found
  const seedLostAndFound: LostAndFoundLog[] = [
    { id: "lf-1", date: todayString(-6), roomId: "rm-101", description: "Bose Wireless Earbuds (Black)", status: "In Custody", finderName: "Comfort Mensah", notes: "Found resting near headboard" },
  ];

  const defaults = {
    propertyProfile: null, // Forces Setup wizard first!
    currentUser: null,
    roomTypes: DEFAULT_ROOM_TYPES,
    rooms: seedRooms,
    guests: SEED_GUESTS,
    reservations: seedReservations,
    housekeepingTasks: seedHousekeepingTasks,
    lostAndFound: seedLostAndFound,
    menuItems: SEED_MENU,
    restaurantOrders: [],
    conferenceRooms: SEED_CONFERENCE_ROOMS,
    conferenceBookings: [],
    amenities: SEED_AMENITIES,
    amenityBookings: [],
    staffList: SEED_STAFF,
    inventoryList: SEED_INVENTORY,
    stockTransactions: [],
    folios,
    toasts: [],
  };

  if (parsed) {
    parsed.toasts = [];
    return {
      ...defaults,
      ...parsed,
    };
  }

  return defaults;
};

// Create state helper to persist on changes
const saveState = (state: Record<string, any>) => {
  try {
    localStorage.setItem("SAD_HOTEL_PERSISTENT_STATE", JSON.stringify(state));
  } catch (e) {
    console.error("Failed to persist state:", e);
  }
};

export const useHotelStore = create<HotelState>((set, get) => ({
  ...getInitialState(),

  // Actions
  initializeSetup: (profile, adminUser) => {
    const fullProfile: PropertyProfile = {
      ...profile,
      setupComplete: true,
    };
    const defaultUser = {
      username: adminUser.username,
      fullName: adminUser.fullName,
      role: UserRole.SUPER_ADMIN,
    };

    set({
      propertyProfile: fullProfile,
      currentUser: defaultUser,
    });
    saveState(get());
    get().addToast(`SUCCESS ABOVE DREAMS application initialized successfully. Mode: ${profile.mode}!`, "success");
  },

  resetAllData: () => {
    localStorage.removeItem("SAD_HOTEL_PERSISTENT_STATE");
    const freshState = getInitialState();
    set({
      ...freshState,
    });
    get().addToast("System state reset completely. Returning to first-launch setup.", "info");
  },

  loginUser: (username, role) => {
    // Find staff or assign name
    const staff = get().staffList.find(s => s.fullName.toLowerCase().includes(username.toLowerCase()) || s.email.toLowerCase().includes(username.toLowerCase()));
    const fullName = staff ? staff.fullName : username;

    set({
      currentUser: { username, fullName, role },
    });
    get().addToast(`Logged in as ${fullName} (${role})`, "success");
    return true;
  },

  logoutUser: () => {
    set({ currentUser: null });
    get().addToast("Logged out successfully", "info");
  },

  addToast: (message, type = "success") => {
    const id = uuid();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Auto-remove after 4 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  addRoom: (roomData) => {
    const newRoom: Room = {
      ...roomData,
      id: `rm-${uuid()}`,
      status: RoomStatus.AVAILABLE,
      housekeepingStatus: HousekeepingStatus.CLEAN,
      extraBedAdded: false,
      extraBedPricePesewas: 12000,
    };

    set((state) => {
      const nextRooms = [...state.rooms, newRoom];
      const next = { ...state, rooms: nextRooms };
      saveState(next);
      return next;
    });

    get().addToast(`Room ${roomData.roomNumber} added to floor plan.`, "success");
  },

  bulkCreateRooms: (start, end, floor, roomTypeId, building) => {
    const added: Room[] = [];
    for (let r = start; r <= end; r++) {
      // Check if room number already exists
      const exists = get().rooms.some(rm => rm.roomNumber === r.toString());
      if (!exists) {
        added.push({
          id: `rm-${uuid()}`,
          roomNumber: r.toString(),
          floor,
          building: building || "Main Building Block",
          roomTypeId,
          status: RoomStatus.AVAILABLE,
          housekeepingStatus: HousekeepingStatus.CLEAN,
          extraBedAdded: false,
          extraBedPricePesewas: 12000,
        });
      }
    }

    set((state) => {
      const nextRooms = [...state.rooms, ...added];
      const next = { ...state, rooms: nextRooms };
      saveState(next);
      return next;
    });

    get().addToast(`Successfully batch created ${added.length} rooms for ${floor}.`, "success");
  },

  updateRoomStatus: (roomId, status) => {
    set((state) => {
      const nextRooms = state.rooms.map((rm) =>
        rm.id === roomId ? { ...rm, status } : rm
      );
      const next = { ...state, rooms: nextRooms };
      saveState(next);
      return next;
    });
  },

  updateRoomHousekeeping: (roomId, status) => {
    set((state) => {
      const nextRooms = state.rooms.map((rm) =>
        rm.id === roomId ? { ...rm, housekeepingStatus: status } : rm
      );
      const next = { ...state, rooms: nextRooms };
      saveState(next);
      return next;
    });
  },

  toggleExtraBed: (roomId, active, pricePesewas) => {
    set((state) => {
      const nextRooms = state.rooms.map((rm) =>
        rm.id === roomId
          ? { ...rm, extraBedAdded: active, extraBedPricePesewas: pricePesewas }
          : rm
      );
      // If checked in, auto-add or modify folio charge
      const targetRoom = state.rooms.find(r => r.id === roomId);
      if (targetRoom && targetRoom.status === RoomStatus.OCCUPIED) {
        // Find checked-in reservation
        const activeRes = state.reservations.find(re => re.roomId === roomId && re.status === ReservationStatus.CHECKED_IN);
        if (activeRes) {
          if (active) {
            // Add extra bed charge
            const newCharge: FolioCharge = {
              id: `chg-${uuid()}`,
              description: `Extra Bed Setup charge on Room ${targetRoom.roomNumber}`,
              amountPesewas: pricePesewas,
              type: ChargeType.EXTRA_BED,
              createdAt: new Date().toISOString(),
              postedQuantity: 1,
            };
            const currentFolio = state.folios[activeRes.id] || { charges: [], payments: [], settled: false, discountPesewas: 0 };
            state.folios[activeRes.id] = {
              ...currentFolio,
              charges: [...currentFolio.charges, newCharge],
            };
          } else {
            // Remove extra bed charge
            const currentFolio = state.folios[activeRes.id];
            if (currentFolio) {
              currentFolio.charges = currentFolio.charges.filter(ch => ch.type !== ChargeType.EXTRA_BED);
            }
          }
        }
      }
      const next = { ...state, rooms: nextRooms };
      saveState(next);
      return next;
    });
    get().addToast(`Extra Bed ${active ? "added" : "removed"} for Room`, "info");
  },

  addRoomType: (roomType) => {
    set((state) => {
      const nextTypes = [...state.roomTypes, roomType];
      const next = { ...state, roomTypes: nextTypes };
      saveState(next);
      return next;
    });
    get().addToast(`Created room type ${roomType.name}`, "success");
  },

  addGuest: (guestData) => {
    const newGuest: Guest = {
      ...guestData,
      id: `gst-${uuid()}`,
    };
    set((state) => {
      const nextGuests = [...state.guests, newGuest];
      const next = { ...state, guests: nextGuests };
      saveState(next);
      return next;
    });
    get().addToast(`Guest Profile for ${newGuest.fullName} established.`, "success");
    return newGuest;
  },

  updateGuest: (guest) => {
    set((state) => {
      const nextGuests = state.guests.map((g) => (g.id === guest.id ? guest : g));
      const next = { ...state, guests: nextGuests };
      saveState(next);
      return next;
    });
    get().addToast(`Profile for ${guest.fullName} updated.`, "success");
  },

  createReservation: (resData) => {
    const defaultResId = `RES-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRes: Reservation = {
      ...resData,
      id: defaultResId,
      cancellationFeePesewas: 0,
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const nextReservations = [...state.reservations, newRes];
      // Create associated folio with immediate deposit recorded if there is one
      const folioCharges: FolioCharge[] = [];
      const folioPayments: Array<{ amountPesewas: number; method: PaymentMethod; timestamp: string }> = [];

      if (newRes.depositAmountPesewas > 0) {
        folioCharges.push({
          id: `chg-${uuid()}`,
          description: "Advance Deposit Paid",
          amountPesewas: newRes.depositAmountPesewas,
          type: ChargeType.ROOM_REVENUE,
          createdAt: new Date().toISOString(),
          postedQuantity: 1,
        });
        folioPayments.push({
          amountPesewas: newRes.depositAmountPesewas,
          method: PaymentMethod.CASH, // Default Cash or based on user details
          timestamp: new Date().toISOString(),
        });
      }

      state.folios[defaultResId] = {
        charges: folioCharges,
        payments: folioPayments,
        settled: false,
        discountPesewas: 0,
      };

      // update Room availability status to Reserved if roomId is preassigned and status confirms
      let updatedRooms = state.rooms;
      if (newRes.roomId && newRes.status === ReservationStatus.CONFIRMED) {
        updatedRooms = state.rooms.map(rm =>
          rm.id === newRes.roomId ? { ...rm, status: RoomStatus.RESERVED } : rm
        );
      }

      const next = { ...state, reservations: nextReservations, rooms: updatedRooms };
      saveState(next);
      return next;
    });

    get().addToast(`Reservation ${defaultResId} confirmed!`, "success");
    return newRes;
  },

  updateReservationStatus: (id, status) => {
    set((state) => {
      const activeRes = state.reservations.find(re => re.id === id);
      if (!activeRes) return state;

      const nextReservations = state.reservations.map((re) =>
        re.id === id ? { ...re, status } : re
      );

      let nextRooms = state.rooms;
      const rId = activeRes.roomId;

      if (rId) {
        if (status === ReservationStatus.CHECKED_IN) {
          nextRooms = state.rooms.map(rm =>
            rm.id === rId ? { ...rm, status: RoomStatus.OCCUPIED, housekeepingStatus: HousekeepingStatus.CLEAN } : rm
          );
          // Post the initial room charge right away
          const charges = state.folios[id]?.charges || [];
          const roomType = state.roomTypes.find(rt => rt.id === activeRes.roomTypeId);
          const roomObj = state.rooms.find(r => r.id === rId);

          const daysCount = Math.max(1, Math.ceil((new Date(activeRes.checkOutDate).getTime() - new Date(activeRes.checkInDate).getTime()) / (1000 * 60 * 60 * 24)));
          const totalCost = (roomType?.basePricePesewas || 0) * daysCount;

          const existsRoomCharge = charges.some(ch => ch.type === ChargeType.ROOM_REVENUE && ch.description.includes("Room Rate"));
          if (!existsRoomCharge) {
            const newCharge: FolioCharge = {
              id: `chg-${uuid()}`,
              description: `Room Rate (${roomType?.name || "Suite"}) - ${daysCount} nights`,
              amountPesewas: totalCost,
              type: ChargeType.ROOM_REVENUE,
              createdAt: new Date().toISOString(),
              postedQuantity: daysCount,
            };
            const currentFolio = state.folios[id] || { charges: [], payments: [], settled: false, discountPesewas: 0 };
            state.folios[id] = {
              ...currentFolio,
              charges: [...currentFolio.charges, newCharge],
            };
          }
        } else if (status === ReservationStatus.CHECKED_OUT) {
          nextRooms = state.rooms.map(rm =>
            rm.id === rId
              ? { ...rm, status: RoomStatus.AVAILABLE, housekeepingStatus: HousekeepingStatus.DIRTY }
              : rm
          );
        } else if (status === ReservationStatus.CANCELLED || status === ReservationStatus.NO_SHOW) {
          nextRooms = state.rooms.map(rm =>
            rm.id === rId ? { ...rm, status: RoomStatus.AVAILABLE } : rm
          );
        }
      }

      const next = { ...state, reservations: nextReservations, rooms: nextRooms };
      saveState(next);
      return next;
    });
    get().addToast(`Booking status updated to ${status}`, "info");
  },

  modifyReservation: (updated) => {
    set((state) => {
      const nextReservations = state.reservations.map(r => r.id === updated.id ? updated : r);
      const next = { ...state, reservations: nextReservations };
      saveState(next);
      return next;
    });
    get().addToast(`Booking ${updated.id} modified successfully.`, "success");
  },

  cancelReservation: (id) => {
    set((state) => {
      const res = state.reservations.find(r => r.id === id);
      if (!res) return state;

      // Cancellation Policy auto-calculation:
      // Free cancellation 48 hours before check-in date. Otherwise, charge 50% of the room booking value as cancellation fee.
      const checkInTime = new Date(res.checkInDate).getTime();
      const cancelTime = new Date().getTime();
      const diffHrs = (checkInTime - cancelTime) / (1000 * 60 * 60);

      let cancelFee = 0;
      if (diffHrs < 48) {
        const roomType = state.roomTypes.find(rt => rt.id === res.roomTypeId);
        const nights = Math.max(1, Math.ceil((new Date(res.checkOutDate).getTime() - new Date(res.checkInDate).getTime()) / (1000 * 60 * 60 * 24)));
        const basePrice = roomType ? roomType.basePricePesewas : 50000;
        cancelFee = Math.floor(0.5 * basePrice * nights);
      }

      const nextReservations = state.reservations.map(r =>
        r.id === id
          ? { ...r, status: ReservationStatus.CANCELLED, cancellationFeePesewas: cancelFee }
          : r
      );

      // Re-avail room
      let nextRooms = state.rooms;
      if (res.roomId) {
        nextRooms = state.rooms.map(rm => rm.id === res.roomId ? { ...rm, status: RoomStatus.AVAILABLE } : rm);
      }

      // Record charge to folio for cancellation fee if applicable
      if (cancelFee > 0) {
        const currentFolio = state.folios[id] || { charges: [], payments: [], settled: false, discountPesewas: 0 };
        currentFolio.charges.push({
          id: `chg-${uuid()}`,
          description: "Reservation Cancellation Fee (Under 48 Hours Policy)",
          amountPesewas: cancelFee,
          type: ChargeType.OTHER,
          createdAt: new Date().toISOString(),
          postedQuantity: 1,
        });
        state.folios[id] = currentFolio;
      }

      const next = { ...state, reservations: nextReservations, rooms: nextRooms };
      saveState(next);
      return next;
    });
    get().addToast("Reservation cancelled according to property terms.", "info");
  },

  getOrCreateFolio: (reservationId) => {
    const state = get();
    if (!state.folios[reservationId]) {
      // Create empty
      state.folios[reservationId] = {
        charges: [],
        payments: [],
        settled: false,
        discountPesewas: 0,
      };
    }
    return state.folios[reservationId];
  },

  addFolioCharge: (reservationId, chargeData) => {
    set((state) => {
      const folio = state.folios[reservationId] || { charges: [], payments: [], settled: false, discountPesewas: 0 };
      const newCharge: FolioCharge = {
        ...chargeData,
        id: `chg-${uuid()}`,
        createdAt: new Date().toISOString(),
      };

      const nextFolios = {
        ...state.folios,
        [reservationId]: {
          ...folio,
          charges: [...folio.charges, newCharge],
        },
      };

      const next = { ...state, folios: nextFolios };
      saveState(next);
      return next;
    });
    get().addToast(`Added: ${chargeData.description} to folio.`, "success");
  },

  removeFolioCharge: (reservationId, chargeId) => {
    set((state) => {
      const folio = state.folios[reservationId];
      if (!folio) return state;

      const nextFolios = {
        ...state.folios,
        [reservationId]: {
          ...folio,
          charges: folio.charges.filter((ch) => ch.id !== chargeId),
        },
      };
      const next = { ...state, folios: nextFolios };
      saveState(next);
      return next;
    });
    get().addToast("Charge removed from running folio.", "info");
  },

  recordFolioPayment: (reservationId, amountPesewas, method, reference) => {
    set((state) => {
      const folio = state.folios[reservationId] || { charges: [], payments: [], settled: false, discountPesewas: 0 };
      const newPayment = {
        amountPesewas,
        method,
        reference,
        timestamp: new Date().toISOString(),
      };

      const nextFolios = {
        ...state.folios,
        [reservationId]: {
          ...folio,
          payments: [...folio.payments, newPayment],
        },
      };
      const next = { ...state, folios: nextFolios };
      saveState(next);
      return next;
    });
    get().addToast(`Received payment of ₵${(amountPesewas / 100).toFixed(2)} via ${method}`, "success");
  },

  applyFolioDiscount: (reservationId, discountPesewas) => {
    set((state) => {
      const folio = state.folios[reservationId] || { charges: [], payments: [], settled: false, discountPesewas: 0 };
      const nextFolios = {
        ...state.folios,
        [reservationId]: {
          ...folio,
          discountPesewas,
        },
      };
      const next = { ...state, folios: nextFolios };
      saveState(next);
      return next;
    });
    get().addToast(`Applied manager discount of ₵${(discountPesewas / 100).toFixed(2)}`, "success");
  },

  settleFolio: (reservationId) => {
    set((state) => {
      const folio = state.folios[reservationId];
      if (!folio) return state;

      const nextFolios = {
        ...state.folios,
        [reservationId]: {
          ...folio,
          settled: true,
        },
      };
      const next = { ...state, folios: nextFolios };
      saveState(next);
      return next;
    });
    get().addToast("Guest Folio settled and marked Closed.", "success");
  },

  // Housekeeping Task actions
  assignHousekeepingTask: (roomId, housekeeperId, notes) => {
    const newTask: HousekeepingTask = {
      id: `task-${uuid()}`,
      roomId,
      housekeeperId,
      status: HousekeepingTaskStatus.PENDING,
      notes,
      checklist: [
        { label: "Change bed linens & sheets", completed: false },
        { label: "Empty dustbins & trash", completed: false },
        { label: "Replenish toiletries & details", completed: false },
        { label: "Vacuum, sweep & wash floors", completed: false },
        { label: "Inspect AC and TV remote buttons", completed: false },
      ],
      updatedAt: new Date().toISOString(),
    };

    set((state) => {
      const nextTasks = [newTask, ...state.housekeepingTasks.filter(t => t.roomId !== roomId || t.status === HousekeepingTaskStatus.INSPECTED)];
      const nextRooms = state.rooms.map(rm => rm.id === roomId ? { ...rm, housekeepingStatus: HousekeepingStatus.DIRTY } : rm);
      const next = { ...state, housekeepingTasks: nextTasks, rooms: nextRooms };
      saveState(next);
      return next;
    });
    get().addToast(`Room assigned for cleaning.`, "success");
  },

  updateHousekeepingTask: (taskId, status, notes, checklist) => {
    set((state) => {
      const nextTasks = state.housekeepingTasks.map((t) => {
        if (t.id === taskId) {
          const uTask = {
            ...t,
            status,
            notes: notes !== undefined ? notes : t.notes,
            checklist: checklist || t.checklist,
            updatedAt: new Date().toISOString(),
          };
          return uTask;
        }
        return t;
      });

      // Synchronize Room Status
      const task = state.housekeepingTasks.find(ts => ts.id === taskId);
      let nextRooms = state.rooms;
      if (task) {
        if (status === HousekeepingTaskStatus.DONE) {
          nextRooms = state.rooms.map(rm => rm.id === task.roomId ? { ...rm, housekeepingStatus: HousekeepingStatus.INSPECTING } : rm);
        } else if (status === HousekeepingTaskStatus.IN_PROGRESS) {
          nextRooms = state.rooms.map(rm => rm.id === task.roomId ? { ...rm, housekeepingStatus: HousekeepingStatus.DIRTY } : rm);
        } else if (status === HousekeepingTaskStatus.INSPECTED) {
          nextRooms = state.rooms.map(rm => rm.id === task.roomId ? { ...rm, housekeepingStatus: HousekeepingStatus.INSPECTED } : rm);
        }
      }

      const next = { ...state, housekeepingTasks: nextTasks, rooms: nextRooms };
      saveState(next);
      return next;
    });
    get().addToast(`Housekeeping status updated to: ${status}`, "success");
  },

  addLostAndFoundItem: (item) => {
    const newItem: LostAndFoundLog = {
      ...item,
      id: `lf-${uuid()}`,
    };
    set((state) => {
      const next = { ...state, lostAndFound: [newItem, ...state.lostAndFound] };
      saveState(next);
      return next;
    });
    get().addToast("Item registered to Lost & Found Registry", "success");
  },

  updateLostAndFoundStatus: (id, status, notes, returnedTo) => {
    set((state) => {
      const mList = state.lostAndFound.map((i) =>
        i.id === id ? { ...i, status, notes: notes || i.notes, returnedToName: returnedTo } : i
      );
      const next = { ...state, lostAndFound: mList };
      saveState(next);
      return next;
    });
    get().addToast(`Lost & Found status is now: ${status}`, "success");
  },

  addMenuItem: (item) => {
    set((state) => {
      const next = { ...state, menuItems: [...state.menuItems, item] };
      saveState(next);
      return next;
    });
    get().addToast(`${item.name} added to Restaurant Menu`, "success");
  },

  updateMenuItemAvailability: (id, available) => {
    set((state) => {
      const mList = state.menuItems.map((it) => it.id === id ? { ...it, available } : it);
      const next = { ...state, menuItems: mList };
      saveState(next);
      return next;
    });
  },

  placeRestaurantOrder: (orderData) => {
    const orderNo = `RST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: RestaurantOrder = {
      ...orderData,
      id: `ord-${uuid()}`,
      orderNumber: orderNo,
      timestamp: new Date().toISOString(),
    };

    set((state) => {
      const updatedOrders = [newOrder, ...state.restaurantOrders];

      // If active guest room - post charge to guest folio
      if (newOrder.roomNumber && newOrder.status === "Charged to Room") {
        // Find checked-in guest in that room
        const activeRes = state.reservations.find(re => {
          const rm = state.rooms.find(r => r.id === re.roomId);
          return rm?.roomNumber === newOrder.roomNumber && re.status === ReservationStatus.CHECKED_IN;
        });

        if (activeRes) {
          const folio = state.folios[activeRes.id] || { charges: [], payments: [], settled: false, discountPesewas: 0 };
          const restCharge: FolioCharge = {
            id: `chg-${uuid()}`,
            description: `Restaurant Order ${orderNo} - Charged to Room`,
            amountPesewas: newOrder.totalPesewas,
            type: ChargeType.RESTAURANT,
            createdAt: new Date().toISOString(),
            postedQuantity: 1,
          };
          state.folios[activeRes.id] = {
            ...folio,
            charges: [...folio.charges, restCharge],
          };
        }
      }

      const next = { ...state, restaurantOrders: updatedOrders };
      saveState(next);
      return next;
    });

    get().addToast(`Restaurant Order ${orderNo} created.`, "success");
    return newOrder;
  },

  updateOrderStatus: (id, status) => {
    set((state) => {
      const updatedOrders = state.restaurantOrders.map((ord) => {
        if (ord.id === id) {
          const updated = { ...ord, status };
          // If charged to room on this transition
          if (status === "Charged to Room" && ord.roomNumber && ord.status !== "Charged to Room") {
            const activeRes = state.reservations.find(re => {
              const rm = state.rooms.find(r => r.id === re.roomId);
              return rm?.roomNumber === ord.roomNumber && re.status === ReservationStatus.CHECKED_IN;
            });
            if (activeRes) {
              const folio = state.folios[activeRes.id] || { charges: [], payments: [], settled: false, discountPesewas: 0 };
              folio.charges.push({
                id: `chg-${uuid()}`,
                description: `Restaurant Bill Order ${ord.orderNumber}`,
                amountPesewas: ord.totalPesewas,
                type: ChargeType.RESTAURANT,
                createdAt: new Date().toISOString(),
                postedQuantity: 1,
              });
              state.folios[activeRes.id] = folio;
            }
          }
          return updated;
        }
        return ord;
      });

      const next = { ...state, restaurantOrders: updatedOrders };
      saveState(next);
      return next;
    });
    get().addToast(`Restaurant order status is now: ${status}`, "success");
  },

  addConferenceRoom: (croom) => {
    set((state) => {
      const next = { ...state, conferenceRooms: [...state.conferenceRooms, croom] };
      saveState(next);
      return next;
    });
    get().addToast(`Conference room '${croom.name}' created.`, "success");
  },

  bookConferenceRoom: (bookingData) => {
    const bookingId = `CNF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: ConferenceBooking = {
      ...bookingData,
      id: bookingId,
      status: "Confirmed",
    };

    set((state) => {
      // Create associated folio/charges for guest if assigned to room, or standalone invoice
      const nextBookings = [newBooking, ...state.conferenceBookings];
      // Check if client is staying in-house
      const inHouseGuest = state.guests.find(g => g.fullName.toLowerCase() === newBooking.clientName.toLowerCase());
      if (inHouseGuest) {
        // Look for checked in res
        const activeRes = state.reservations.find(r => r.guestId === inHouseGuest.id && r.status === ReservationStatus.CHECKED_IN);
        if (activeRes) {
          // charge to that room folio
          const folio = state.folios[activeRes.id] || { charges: [], payments: [], settled: false, discountPesewas: 0 };
          folio.charges.push({
            id: `chg-${uuid()}`,
            description: `Conference Booking (${newBooking.durationSlot}) - ${newBooking.layoutChoice}`,
            amountPesewas: newBooking.totalPricePesewas,
            type: ChargeType.CONFERENCE,
            createdAt: new Date().toISOString(),
            postedQuantity: 1,
          });
          state.folios[activeRes.id] = folio;
          get().addToast("Conference fee posted to running Room Folio", "info");
        }
      }

      const next = { ...state, conferenceBookings: nextBookings };
      saveState(next);
      return next;
    });

    get().addToast(`Conference reservation confirmed ${bookingId}`, "success");
    return newBooking;
  },

  updateConferenceStatus: (id, status) => {
    set((state) => {
      const next = {
        ...state,
        conferenceBookings: state.conferenceBookings.map((b) => b.id === id ? { ...b, status } : b),
      };
      saveState(next);
      return next;
    });
  },

  bookAmenity: (bookingData) => {
    const id = `AMN-${uuid()}`;
    const newBooking: AmenityBooking = {
      ...bookingData,
      id,
      status: "Confirmed",
    };

    set((state) => {
      const updated = [newBooking, ...state.amenityBookings];

      // Post charge to room if requested
      if (newBooking.chargedToRoom && newBooking.roomNumber) {
        const activeRes = state.reservations.find(re => {
          const rm = state.rooms.find(r => r.id === re.roomId);
          return rm?.roomNumber === newBooking.roomNumber && re.status === ReservationStatus.CHECKED_IN;
        });

        if (activeRes) {
          const amenityObj = state.amenities.find(a => a.id === newBooking.amenityId);
          const folio = state.folios[activeRes.id] || { charges: [], payments: [], settled: false, discountPesewas: 0 };
          const amenityCharge: FolioCharge = {
            id: `chg-${uuid()}`,
            description: `Amenity Session Booking: ${amenityObj?.name || "Spa/Pool"}`,
            amountPesewas: newBooking.amountPesewas,
            type: ChargeType.AMENITY,
            createdAt: new Date().toISOString(),
            postedQuantity: 1,
          };
          state.folios[activeRes.id] = {
            ...folio,
            charges: [...folio.charges, amenityCharge],
          };
        }
      }

      const next = { ...state, amenityBookings: updated };
      saveState(next);
      return next;
    });

    get().addToast("Spa/Amenity reservation secured.", "success");
    return newBooking;
  },

  completeAmenityBooking: (id) => {
    set((state) => {
      const updated = state.amenityBookings.map((b) => b.id === id ? { ...b, status: "Completed" as const, paid: b.chargedToRoom ? b.paid : true } : b);
      const next = { ...state, amenityBookings: updated };
      saveState(next);
      return next;
    });
    get().addToast("Session marked completed.", "success");
  },

  addStaff: (staffData) => {
    const newStaff: Staff = {
      ...staffData,
      id: `stf-${uuid()}`,
      clockedIn: false,
    };
    set((state) => {
      const next = { ...state, staffList: [...state.staffList, newStaff] };
      saveState(next);
      return next;
    });
    get().addToast(`Employee records established for ${staffData.fullName}`, "success");
  },

  updateStaffStatus: (id, status) => {
    set((state) => {
      const next = {
        ...state,
        staffList: state.staffList.map((s) => s.id === id ? { ...s, status } : s),
      };
      saveState(next);
      return next;
    });
  },

  clockStaff: (id, clockIn) => {
    set((state) => {
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      const nextList = state.staffList.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            clockedIn: clockIn,
            clockInTime: clockIn ? time : s.clockInTime,
            clockOutTime: clockIn ? undefined : time,
          };
        }
        return s;
      });
      const next = { ...state, staffList: nextList };
      saveState(next);
      return next;
    });
    get().addToast(`Employee status clocked ${clockIn ? "IN" : "OUT"}`, "info");
  },

  addInventoryItem: (item) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${uuid()}`,
      stockLevel: 0,
    };
    set((state) => {
      const next = { ...state, inventoryList: [...state.inventoryList, newItem] };
      saveState(next);
      return next;
    });
    get().addToast(`Item [${item.name}] cataloged.`, "success");
  },

  recordStockTransaction: (transData) => {
    const newTrans: StockTransaction = {
      ...transData,
      id: `trn-${uuid()}`,
      timestamp: new Date().toISOString(),
    };

    set((state) => {
      const activeItem = state.inventoryList.find((i) => i.id === transData.itemId);
      if (!activeItem) return state;

      const qtyDelta = transData.type === "IN" ? transData.quantity : -transData.quantity;
      const nextStockLevel = Math.max(0, activeItem.stockLevel + qtyDelta);

      // Low Stock checks on subtract
      if (transData.type === "OUT" && nextStockLevel <= activeItem.reorderLevel) {
        // Register instant warning!
        setTimeout(() => {
          get().addToast(`LOW STOCK WARNING: [${activeItem.name}] stock fallen to ${nextStockLevel}!`, "error");
        }, 100);
      }

      const nextInventory = state.inventoryList.map((it) =>
        it.id === transData.itemId ? { ...it, stockLevel: nextStockLevel } : it
      );

      const next = {
        ...state,
        inventoryList: nextInventory,
        stockTransactions: [newTrans, ...state.stockTransactions],
      };
      saveState(next);
      return next;
    });

    get().addToast(`Stock Transaction registered successfully`, "success");
  },

  // Auto-posting nightly room charges background emulation
  triggerNightlyRoomCharges: () => {
    set((state) => {
      let postedCount = 0;
      // Get all checked-in reservations
      const inHouseBookings = state.reservations.filter(r => r.status === ReservationStatus.CHECKED_IN);

      const updatedFolios = { ...state.folios };

      inHouseBookings.forEach((booking) => {
        const roomObj = state.rooms.find(rm => rm.id === booking.roomId);
        const roomType = state.roomTypes.find(rt => rt.id === booking.roomTypeId);
        if (!roomObj || !roomType) return;

        const baseDailyRate = roomType.basePricePesewas;
        const extraBedDaily = roomObj.extraBedAdded ? roomObj.extraBedPricePesewas : 0;

        const folio = updatedFolios[booking.id] || { charges: [], payments: [], settled: false, discountPesewas: 0 };

        // Post regular nightly rate
        const dateToday = new Date().toLocaleDateString("en-GB");
        folio.charges.push({
          id: `chg-${uuid()}`,
          description: `Nightly Room Charge (${roomObj.roomNumber}) - Auto posted ${dateToday}`,
          amountPesewas: baseDailyRate,
          type: ChargeType.ROOM_REVENUE,
          createdAt: new Date().toISOString(),
          postedQuantity: 1,
        });

        // Extra bed rates if active
        if (roomObj.extraBedAdded) {
          folio.charges.push({
            id: `chg-${uuid()}`,
            description: `Extra Bed Daily Rate Charge - Auto posted ${dateToday}`,
            amountPesewas: extraBedDaily,
            type: ChargeType.EXTRA_BED,
            createdAt: new Date().toISOString(),
            postedQuantity: 1,
          });
        }

        updatedFolios[booking.id] = folio;
        postedCount++;
      });

      const next = { ...state, folios: updatedFolios };
      saveState(next);

      // Show toast
      setTimeout(() => {
        get().addToast(`SUCCESS ABOVE DREAMS Nightly Scheduler Ran: Room charges posted to ${postedCount} active in-house guest folios.`, "success");
      }, 100);

      return next;
    });
  },
}));

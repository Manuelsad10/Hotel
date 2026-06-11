import { create } from "zustand";
import {
  UserRole,
  RoomStatus,
  HousekeepingStatus,
  ReservationStatus,
  PaymentMethod,
  PropertyProfile,
  RoomType,
  Room,
  Guest,
  ExtraCharge,
  Reservation,
  Staff,
  Bill,
  Toast,
} from "../types";

// Base State Store for Success Above Dreams (SAD) PMS
interface InnCoreStore {
  // Config & Auth
  propertyProfile: PropertyProfile | null;
  currentUser: { fullName: string; role: UserRole } | null;

  // Database Collections
  roomTypes: RoomType[];
  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  staffList: Staff[];
  bills: Record<string, Bill>; // Key: reservationId -> Bill

  // System Notifications
  toasts: Toast[];

  // ACTIONS
  // Setup & Auth
  initializeSetup: (profile: PropertyProfile, adminUser: { fullName: string; username: string; psw: string }, withSampleData: boolean) => void;
  resetAllData: () => void;
  loginUser: (fullName: string, role: UserRole) => void;
  logoutUser: () => void;

  // Toasts
  addToast: (message: string, type?: "success" | "error") => void;
  removeToast: (id: string) => void;

  // Room Types
  addRoomType: (roomType: RoomType) => void;
  editRoomType: (id: string, name: string, basePricePesewas: number) => void;
  deleteRoomType: (id: string) => void;

  // Rooms
  addRoom: (room: Omit<Room, "id" | "status" | "housekeepingStatus">) => void;
  editRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  bulkUpdateRooms: (ids: string[], updates: Partial<Room>) => void;
  bulkDeleteRooms: (ids: string[]) => void;

  // Guests
  addGuest: (guest: Omit<Guest, "id">) => Guest;
  updateGuest: (guest: Guest) => void;
  editGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;

  // Reservations
  createReservation: (res: Omit<Reservation, "id" | "createdAt" | "status" | "extraCharges" | "cancellationFeePesewas">) => Reservation;
  updateReservationStatus: (id: string, status: ReservationStatus, cancelFeePesewas?: number) => void;
  editReservation: (id: string, checkInDate: string, checkOutDate: string, roomId: string, adults: number, specialRequests?: string) => void;
  addExtraCharge: (reservationId: string, label: string, amountPesewas: number) => void;
  removeExtraCharge: (reservationId: string, chargeId: string) => void;

  // Housekeeping
  assignRoomCleaning: (roomId: string, housekeeperId: string) => void;
  updateCleaningStatus: (roomId: string, status: HousekeepingStatus, notes?: string) => void;
  markRoomMaintenance: (roomId: string, notes: string) => void;

  // Billing
  calculateBill: (reservationId: string, discountPesewas?: number) => Bill;
  recordPayment: (reservationId: string, method: PaymentMethod, reference?: string) => void;
  applyDiscount: (reservationId: string, amountPesewas: number) => void;

  // Staff
  addStaff: (staff: Omit<Staff, "id">) => void;
  editStaff: (id: string, updates: Partial<Staff>) => void;

  // Property Profile
  updatePropertyProfile: (updates: Partial<PropertyProfile>) => void;
}

// Generate serial numbers for bookings: INN-YYYYMMDD-XXXX
const generateReservationNumber = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `INN-${yyyy}${mm}${dd}-${rand}`;
};

// Initial empty state values
const emptyState = {
  propertyProfile: null,
  currentUser: null,
  roomTypes: [],
  rooms: [],
  guests: [],
  reservations: [],
  staffList: [],
  bills: {},
  toasts: [],
};

// Local storage key helper
const STORAGE_KEY = "SAD_PMS_PERSISTENT_STATE";

const getSavedState = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Ensure defaults exist for loaded properties
      return {
        propertyProfile: parsed.propertyProfile || null,
        currentUser: parsed.currentUser || null,
        roomTypes: parsed.roomTypes || [],
        rooms: parsed.rooms || [],
        guests: parsed.guests || [],
        reservations: parsed.reservations || [],
        staffList: parsed.staffList || [],
        bills: parsed.bills || {},
        toasts: [],
      };
    }
  } catch (error) {
    console.error("Failed parsing localStorage store database state for Success Above Dreams (SAD)", error);
  }
  return emptyState;
};

export const useHotelStore = create<InnCoreStore>((set, get) => {
  const initialState = getSavedState();

  const persist = (nextState: Partial<InnCoreStore>) => {
    const updated = { ...get(), ...nextState };
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          propertyProfile: updated.propertyProfile,
          currentUser: updated.currentUser,
          roomTypes: updated.roomTypes,
          rooms: updated.rooms,
          guests: updated.guests,
          reservations: updated.reservations,
          staffList: updated.staffList,
          bills: updated.bills,
        })
      );
    } catch (e) {
      console.error("Failsafe: State writing error in localStorage key saving for Success Above Dreams (SAD)", e);
    }
    set(nextState as any);
  };

  return {
    ...initialState,

    initializeSetup: (profile, adminUser, withSampleData) => {
      // Create admin user matching role
      const rootAdmin = {
        fullName: adminUser.fullName,
        role: UserRole.ADMIN,
      };

      if (!withSampleData) {
        persist({
          propertyProfile: { ...profile, setupComplete: true },
          currentUser: rootAdmin,
          roomTypes: [
            { id: "rt-std", name: "Standard Room", basePricePesewas: 45000 },
            { id: "rt-dlx", name: "Deluxe Room", basePricePesewas: 75000 },
          ],
          rooms: [
            { id: "rm-101", roomNumber: "101", roomTypeId: "rt-std", floor: "Floor 1", pricePesewas: 45000, status: RoomStatus.AVAILABLE, housekeepingStatus: HousekeepingStatus.CLEAN },
            { id: "rm-102", roomNumber: "102", roomTypeId: "rt-dlx", floor: "Floor 1", pricePesewas: 75000, status: RoomStatus.AVAILABLE, housekeepingStatus: HousekeepingStatus.CLEAN },
          ],
          guests: [],
          reservations: [],
          staffList: [
            { id: "st-admin", fullName: adminUser.fullName, role: UserRole.ADMIN, phone: profile.phone, username: "admin", psw: "admin123", status: "Active" },
          ],
          bills: {},
        });
        get().addToast(`Welcome to Success Above Dreams (SAD) PMS! Hotel ${profile.name} configured successfully.`, "success");
        return;
      }

      // Populate Seed Mock-Data (for professional demonstration)
      const seedTypes: RoomType[] = [
        { id: "rt-std", name: "Standard Room", basePricePesewas: 45000 }, // GHS 450.00
        { id: "rt-dlx", name: "Deluxe Room", basePricePesewas: 75000 },  // GHS 750.00
        { id: "rt-ste", name: "Executive Suite", basePricePesewas: 150000 }, // GHS 1,500.00
      ];

      const seedRooms: Room[] = [
        { id: "rm-101", roomNumber: "101", roomTypeId: "rt-std", floor: "Floor 1", pricePesewas: 45000, status: RoomStatus.AVAILABLE, housekeepingStatus: HousekeepingStatus.CLEAN },
        { id: "rm-102", roomNumber: "102", roomTypeId: "rt-std", floor: "Floor 1", pricePesewas: 45000, status: RoomStatus.OCCUPIED, housekeepingStatus: HousekeepingStatus.CLEAN, assignedHousekeeperId: "st-comfort" },
        { id: "rm-201", roomNumber: "201", roomTypeId: "rt-dlx", floor: "Floor 2", pricePesewas: 75000, status: RoomStatus.RESERVED, housekeepingStatus: HousekeepingStatus.CLEAN },
        { id: "rm-202", roomNumber: "202", roomTypeId: "rt-dlx", floor: "Floor 2", pricePesewas: 75000, status: RoomStatus.AVAILABLE, housekeepingStatus: HousekeepingStatus.DIRTY },
        { id: "rm-301", roomNumber: "301", roomTypeId: "rt-ste", floor: "Floor 3", pricePesewas: 150000, status: RoomStatus.UNDER_MAINTENANCE, housekeepingStatus: HousekeepingStatus.DIRTY, notes: "AC coolant leakage on floor carpet" },
      ];

      const seedGuests: Guest[] = [
        { id: "gst-1", fullName: "Kofi Mensah", phone: "+233 24 100 2001", email: "kofi.mensah@gmail.com", nationality: "Ghanaian", idType: "Ghana Card", idNumber: "GHA-123456789-0", notes: "Prefers tea over coffee.", vip: true },
        { id: "gst-2", fullName: "Sarah Connor", phone: "+233 20 987 6543", email: "sarah@connor.com", nationality: "American", idType: "Passport", idNumber: "USA-99887766", vip: false },
        { id: "gst-3", fullName: "Yao Azia", phone: "+233 55 555 1209", email: "yao@azia.com", nationality: "Togolese", idType: "Passport", idNumber: "TOG-492810", vip: false },
      ];

      // 3 seed reservations representing past stay, current stay, and upcoming stay
      const res1_id = "INN-20260601-8392";
      const res2_id = "INN-20260605-4920";
      const res3_id = "INN-20260609-1123";

      const seedReservations: Reservation[] = [
        {
          id: res1_id,
          guestId: "gst-1",
          roomId: "rm-101",
          checkInDate: "2026-06-01",
          checkOutDate: "2026-06-04",
          adults: 2,
          specialRequests: "Anniversary setup - fruit platter",
          depositAmountPesewas: 20000,
          status: ReservationStatus.CHECKED_OUT,
          createdAt: "2026-05-25T14:20:00Z",
          extraCharges: [
            { id: "ex-1", label: "Laundry dry cleaning", amountPesewas: 6500, createdAt: "2026-06-02T11:00:00Z" }
          ],
        },
        {
          id: res2_id,
          guestId: "gst-2",
          roomId: "rm-102",
          checkInDate: "2026-06-05",
          checkOutDate: "2026-06-12",
          adults: 1,
          specialRequests: "Quiet corner room, high floor if available",
          depositAmountPesewas: 0,
          status: ReservationStatus.CHECKED_IN,
          createdAt: "2026-06-01T09:00:00Z",
          extraCharges: [
            { id: "ex-2", label: "Minibar drinks", amountPesewas: 4500, createdAt: "2026-06-06T18:30:00Z" }
          ],
        },
        {
          id: res3_id,
          guestId: "gst-3",
          roomId: "rm-201",
          checkInDate: "2026-06-09",
          checkOutDate: "2026-06-11",
          adults: 1,
          depositAmountPesewas: 50000,
          status: ReservationStatus.CONFIRMED,
          createdAt: "2026-06-05T10:15:00Z",
          extraCharges: [],
        }
      ];

      const seedStaff: Staff[] = [
        { id: "st-admin", fullName: adminUser.fullName, role: UserRole.ADMIN, phone: profile.phone, username: "admin", psw: "admin123", status: "Active" },
        { id: "st-front", fullName: "Yao Azia", role: UserRole.FRONT_DESK, phone: "+233 24 999 5001", username: "kwame", psw: "kwame123", status: "Active" },
        { id: "st-comfort", fullName: "Comfort Mensah", role: UserRole.HOUSEKEEPER, phone: "+233 20 888 1202", username: "comfort", psw: "comfort123", status: "Active" },
        { id: "st-david", fullName: "David Accountant", role: UserRole.ACCOUNTANT, phone: "+233 24 777 9102", username: "david", psw: "david123", status: "Active" },
      ];

      // Setup initial bills for checked-out and checked-in ones
      const seedBills: Record<string, Bill> = {
        [res1_id]: {
          id: "Bill-res1",
          reservationId: res1_id,
          roomChargesPesewas: 3 * 45000, // 3 nights @ 450
          extrasChargesPesewas: 6500,
          discountPesewas: 0,
          vatPesewas: Math.round(((3 * 45000) + 6500) * (profile.vatRate / 100)),
          totalPesewas: Math.round(((3 * 45000) + 6500) * (1 + profile.vatRate / 100)),
          paid: true,
          paymentMethod: PaymentMethod.CASH,
          paymentReference: "CASH_REC_Y_AZIA",
          settledAt: "2026-06-04T11:05:00Z",
        },
        [res2_id]: {
          id: "Bill-res2",
          reservationId: res2_id,
          roomChargesPesewas: 7 * 45000, // 7 nights @ 450
          extrasChargesPesewas: 4500,
          discountPesewas: 0,
          vatPesewas: Math.round(((7 * 45000) + 4500) * (profile.vatRate / 100)),
          totalPesewas: Math.round(((7 * 45000) + 4500) * (1 + profile.vatRate / 100)),
          paid: false,
        }
      };

      persist({
        propertyProfile: { ...profile, setupComplete: true },
        currentUser: rootAdmin,
        roomTypes: seedTypes,
        rooms: seedRooms,
        guests: seedGuests,
        reservations: seedReservations,
        staffList: seedStaff,
        bills: seedBills,
      });

      get().addToast(`Welcome to Success Above Dreams (SAD)! Model data loaded successfully for testing.`, "success");
    },

    resetAllData: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({
        propertyProfile: null,
        currentUser: null,
        roomTypes: [],
        rooms: [],
        guests: [],
        reservations: [],
        staffList: [],
        bills: {},
        toasts: [{ id: Math.random().toString(), message: "Hotel PMS Factoring Reset successfully completed.", type: "success" }],
      });
    },

    loginUser: (fullName, role) => {
      persist({
        currentUser: { fullName, role },
      });
      get().addToast(`Logged in successfully as ${fullName} (${role})`, "success");
    },

    logoutUser: () => {
      persist({
        currentUser: null,
      });
      get().addToast("Signed out successfully.", "success");
    },

    // Toasts
    addToast: (message, type = "success") => {
      const id = String(Math.random());
      set((state) => ({
        toasts: [...state.toasts, { id, message, type }],
      }));
      // Auto-expire
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, 4000);
    },

    removeToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    },

    // Room Types
    addRoomType: (roomType) => {
      persist({
        roomTypes: [...get().roomTypes, roomType],
      });
      get().addToast(`Created room type: ${roomType.name}`, "success");
    },

    editRoomType: (id, name, basePricePesewas) => {
      const updatedTypes = get().roomTypes.map((rt) =>
        rt.id === id ? { ...rt, name, basePricePesewas } : rt
      );
      // Also update base price in rooms of this type
      const updatedRooms = get().rooms.map((rm) =>
        rm.roomTypeId === id ? { ...rm, pricePesewas: basePricePesewas } : rm
      );
      persist({
        roomTypes: updatedTypes,
        rooms: updatedRooms,
      });
      get().addToast(`Updated room type details`, "success");
    },

    deleteRoomType: (id) => {
      if (get().roomTypes.length <= 1) {
        get().addToast("Cannot delete the last remaining room type classification.", "error");
        return;
      }
      const filteredTypes = get().roomTypes.filter((t) => t.id !== id);
      const filteredRooms = get().rooms.filter((r) => r.roomTypeId !== id);
      persist({
        roomTypes: filteredTypes,
        rooms: filteredRooms,
      });
      get().addToast("Room type classification deleted successfully", "success");
    },

    // Rooms
    addRoom: (roomData) => {
      const id = "rm-" + Math.random().toString(36).substring(2, 6);
      const newRoom: Room = {
        ...roomData,
        id,
        status: RoomStatus.AVAILABLE,
        housekeepingStatus: HousekeepingStatus.CLEAN,
      };
      persist({
        rooms: [...get().rooms, newRoom],
      });
      get().addToast(`Room #${newRoom.roomNumber} created successfully`, "success");
    },

    editRoom: (id, updates) => {
      const updated = get().rooms.map((r) => (r.id === id ? { ...r, ...updates } : r));
      persist({ rooms: updated });
      get().addToast(`Room configuration updated`, "success");
    },

    deleteRoom: (id) => {
      const filtered = get().rooms.filter((r) => r.id !== id);
      persist({ rooms: filtered });
      get().addToast("Room deleted from records", "success");
    },

    bulkUpdateRooms: (ids, updates) => {
      const updated = get().rooms.map((r) => (ids.includes(r.id) ? { ...r, ...updates } : r));
      persist({ rooms: updated });
      get().addToast(`Updated ${ids.length} rooms in bulk successfully`, "success");
    },

    bulkDeleteRooms: (ids) => {
      const filtered = get().rooms.filter((r) => !ids.includes(r.id));
      persist({ rooms: filtered });
      get().addToast(`Deleted ${ids.length} rooms from records in bulk`, "success");
    },

    // Guests
    addGuest: (guestData) => {
      const id = "gst-" + Math.random().toString(36).substring(2, 6);
      const guestObj: Guest = { ...guestData, id };
      persist({
        guests: [...get().guests, guestObj],
      });
      get().addToast(`Registered guest: ${guestObj.fullName}`, "success");
      return guestObj;
    },

    updateGuest: (guest) => {
      const updated = get().guests.map((g) => (g.id === guest.id ? guest : g));
      persist({ guests: updated });
      get().addToast(`Updated details for ${guest.fullName}`, "success");
    },

    editGuest: (id, updates) => {
      const updated = get().guests.map((g) => {
        if (g.id === id) {
          const guestObj = { ...g, ...updates };
          return guestObj;
        }
        return g;
      });
      persist({ guests: updated });
      get().addToast(`Updated guest information successfully.`, "success");
    },

    deleteGuest: (id) => {
      const guestObj = get().guests.find((g) => g.id === id);
      const name = guestObj ? guestObj.fullName : "";
      const updated = get().guests.filter((g) => g.id !== id);
      persist({ guests: updated });
      get().addToast(`Deleted guest record for ${name || "user"}.`, "success");
    },

    // Reservations
    createReservation: (resData) => {
      const id = generateReservationNumber();
      const status = (resData as any).status || ReservationStatus.CONFIRMED;

      const newRes: Reservation = {
        ...resData,
        id,
        status,
        createdAt: new Date().toISOString(),
        extraCharges: [],
      } as any;

      // Update room status is Occupied if checked-in instantly, or Reserved if confirmed
      const updatedRooms = get().rooms.map((rm) => {
        if (rm.id === resData.roomId) {
          return {
            ...rm,
            status: status === ReservationStatus.CHECKED_IN ? RoomStatus.OCCUPIED : RoomStatus.RESERVED,
          };
        }
        return rm;
      });

      persist({
        reservations: [...get().reservations, newRes],
        rooms: updatedRooms,
      });

      get().addToast(`Booking ${id} entered successfully.`, "success");
      return newRes;
    },

    updateReservationStatus: (id, status, cancelFeePesewas = 0) => {
      const reservation = get().reservations.find((r) => r.id === id);
      if (!reservation) return;

      const originalRoomId = reservation.roomId;

      const updatedReservations = get().reservations.map((res) => {
        if (res.id === id) {
          const u: Partial<Reservation> = { status };
          if (cancelFeePesewas > 0) {
            u.cancellationFeePesewas = cancelFeePesewas;
          }
          return { ...res, ...u };
        }
        return res;
      });

      // Update Rooms
      const updatedRooms = get().rooms.map((rm) => {
        if (rm.id === originalRoomId) {
          if (status === ReservationStatus.CHECKED_IN) {
            return { ...rm, status: RoomStatus.OCCUPIED };
          } else if (status === ReservationStatus.CHECKED_OUT) {
            // Becomes Available but DIRTY upon checklist checkout rules!
            return { ...rm, status: RoomStatus.AVAILABLE, housekeepingStatus: HousekeepingStatus.DIRTY };
          } else if (status === ReservationStatus.CANCELLED || status === ReservationStatus.NO_SHOW) {
            return { ...rm, status: RoomStatus.AVAILABLE };
          }
        }
        return rm;
      });

      // Calculate checkout dynamic billing if setting checked-out
      const updatedBills = { ...get().bills };
      if (status === ReservationStatus.CHECKED_OUT) {
        // Build/save default bill
        const dIn = new Date(reservation.checkInDate);
        const dOut = new Date(reservation.checkOutDate);
        let nights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 3600 * 24)));
        const targetRoom = get().rooms.find((r) => r.id === originalRoomId);
        const ratePerNight = targetRoom?.pricePesewas || 45000;
        const accommodationSum = nights * ratePerNight;
        const extraChargesSum = reservation.extraCharges.reduce((acc, current) => acc + current.amountPesewas, 0);

        const vatRate = get().propertyProfile?.vatRate || 15;
        const sumBeforeVatAndDisc = accommodationSum + extraChargesSum;
        const disc = updatedBills[id]?.discountPesewas || 0;
        const subtotalWithDisc = Math.max(0, sumBeforeVatAndDisc - disc);
        const calculatedVat = Math.round(subtotalWithDisc * (vatRate / 100));
        const grandTotal = subtotalWithDisc + calculatedVat;

        updatedBills[id] = {
          id: `Bill-${id}`,
          reservationId: id,
          roomChargesPesewas: accommodationSum,
          extrasChargesPesewas: extraChargesSum,
          discountPesewas: disc,
          vatPesewas: calculatedVat,
          totalPesewas: grandTotal,
          paid: updatedBills[id]?.paid || false,
          paymentMethod: updatedBills[id]?.paymentMethod,
          paymentReference: updatedBills[id]?.paymentReference,
          settledAt: updatedBills[id]?.settledAt,
        };
      }

      persist({
        reservations: updatedReservations,
        rooms: updatedRooms,
        bills: updatedBills,
      });

      get().addToast(`Booking status updated to ${status}`, "success");
    },

    editReservation: (id, checkInDate, checkOutDate, roomId, adults, specialRequests) => {
      const prevRes = get().reservations.find(r => r.id === id);
      if (!prevRes) return;

      const previousRoomId = prevRes.roomId;

      const updatedReservations = get().reservations.map((res) => {
        if (res.id === id) {
          return {
            ...res,
            checkInDate,
            checkOutDate,
            roomId,
            adults,
            specialRequests,
          };
        }
        return res;
      });

      // Free previous room, book the new one
      const updatedRooms = get().rooms.map((rm) => {
        if (rm.id === previousRoomId && previousRoomId !== roomId) {
          return { ...rm, status: RoomStatus.AVAILABLE };
        }
        if (rm.id === roomId) {
          return {
            ...rm,
            status: prevRes.status === ReservationStatus.CHECKED_IN ? RoomStatus.OCCUPIED : RoomStatus.RESERVED,
          };
        }
        return rm;
      });

      persist({
        reservations: updatedReservations,
        rooms: updatedRooms,
      });

      get().addToast("Booking modified successfully.", "success");
    },

    addExtraCharge: (reservationId, label, amountPesewas) => {
      const updatedResList = get().reservations.map((res) => {
        if (res.id === reservationId) {
          const newChg: ExtraCharge = {
            id: "ex-" + Math.random().toString(36).substring(2, 6),
            label,
            amountPesewas,
            createdAt: new Date().toISOString(),
          };
          return {
            ...res,
            extraCharges: [...res.extraCharges, newChg],
          };
        }
        return res;
      });

      persist({ reservations: updatedResList });
      // Recalculate bill for that booking if it is checked out
      const bill = get().bills[reservationId];
      if (bill) {
        get().calculateBill(reservationId, bill.discountPesewas);
      }
      get().addToast(`Charge "${label}" added to bill`, "success");
    },

    removeExtraCharge: (reservationId, chargeId) => {
      const updatedResList = get().reservations.map((res) => {
        if (res.id === reservationId) {
          return {
            ...res,
            extraCharges: res.extraCharges.filter((c) => c.id !== chargeId),
          };
        }
        return res;
      });

      persist({ reservations: updatedResList });
      const bill = get().bills[reservationId];
      if (bill) {
        get().calculateBill(reservationId, bill.discountPesewas);
      }
      get().addToast(`Extra charge removed`, "success");
    },

    // Housekeeping
    assignRoomCleaning: (roomId, housekeeperId) => {
      const updatedRooms = get().rooms.map((rm) => {
        if (rm.id === roomId) {
          return {
            ...rm,
            assignedHousekeeperId: housekeeperId,
          };
        }
        return rm;
      });
      persist({ rooms: updatedRooms });
      const housekeeper = get().staffList.find((s) => s.id === housekeeperId);
      get().addToast(`Room assigned to ${housekeeper?.fullName || "staff"}`, "success");
    },

    updateCleaningStatus: (roomId, status, notes) => {
      const updatedRooms = get().rooms.map((rm) => {
        if (rm.id === roomId) {
          const u: Partial<Room> = { housekeepingStatus: status };
          if (notes !== undefined) {
            u.notes = notes;
          }
          // If status is inspected or clean, housekeeper task is wrapped
          return { ...rm, ...u };
        }
        return rm;
      });
      persist({ rooms: updatedRooms });
      get().addToast(`Room cleaning updated to: ${status}`, "success");
    },

    markRoomMaintenance: (roomId, notes) => {
      const updatedRooms = get().rooms.map((rm) => {
        if (rm.id === roomId) {
          return {
            ...rm,
            status: RoomStatus.UNDER_MAINTENANCE,
            notes,
          };
        }
        return rm;
      });
      persist({ rooms: updatedRooms });
      get().addToast(`Room marked for Repair & Maintenance`, "success");
    },

    // Billing
    calculateBill: (resId, discountPesewas = 0) => {
      const reservation = get().reservations.find((r) => r.id === resId);
      if (!reservation) {
        throw new Error("Target booking details not found for calculation");
      }

      const dIn = new Date(reservation.checkInDate);
      const dOut = new Date(reservation.checkOutDate);
      let nights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 3600 * 24)));
      const targetRoom = get().rooms.find((r) => r.id === reservation.roomId);
      const ratePerNight = targetRoom?.pricePesewas || 45000;
      const roomCharges = nights * ratePerNight;
      const extrasCharges = reservation.extraCharges.reduce((acc, c) => acc + c.amountPesewas, 0);

      const vatRate = get().propertyProfile?.vatRate || 15;
      const totalBeforeVAT = Math.max(0, (roomCharges + extrasCharges) - discountPesewas);
      const calculatedVat = Math.round(totalBeforeVAT * (vatRate / 100));
      const grandTotal = totalBeforeVAT + calculatedVat;

      const computedBill: Bill = {
        id: `Bill-${resId}`,
        reservationId: resId,
        roomChargesPesewas: roomCharges,
        extrasChargesPesewas: extrasCharges,
        discountPesewas,
        vatPesewas: calculatedVat,
        totalPesewas: grandTotal,
        paid: get().bills[resId]?.paid || false,
        paymentMethod: get().bills[resId]?.paymentMethod,
        paymentReference: get().bills[resId]?.paymentReference,
        settledAt: get().bills[resId]?.settledAt,
      };

      const updatedBills = { ...get().bills, [resId]: computedBill };
      persist({ bills: updatedBills });
      return computedBill;
    },

    recordPayment: (resId, method, reference) => {
      const currentBill = get().bills[resId];
      if (!currentBill) return;

      const updatedBills = {
        ...get().bills,
        [resId]: {
          ...currentBill,
          paid: true,
          paymentMethod: method,
          paymentReference: reference || `REF_${Date.now()}`,
          settledAt: new Date().toISOString(),
        },
      };

      persist({ bills: updatedBills });
      get().addToast(`Bill fully paid with ${method}!`, "success");
    },

    applyDiscount: (resId, amountPesewas) => {
      const currentBill = get().bills[resId];
      if (!currentBill) return;

      // Recalculate bill
      const accommodation = currentBill.roomChargesPesewas;
      const extras = currentBill.extrasChargesPesewas;
      const vatRate = get().propertyProfile?.vatRate || 15;
      const totalBeforeVAT = Math.max(0, (accommodation + extras) - amountPesewas);
      const calculatedVat = Math.round(totalBeforeVAT * (vatRate / 100));
      const grandTotal = totalBeforeVAT + calculatedVat;

      const updatedBills = {
        ...get().bills,
        [resId]: {
          ...currentBill,
          discountPesewas: amountPesewas,
          vatPesewas: calculatedVat,
          totalPesewas: grandTotal,
        },
      };

      persist({ bills: updatedBills });
      get().addToast(`Applied discount of GHS ₵${(amountPesewas / 100).toFixed(2)}`, "success");
    },

    // Staff
    addStaff: (staffData) => {
      const id = "st-" + Math.random().toString(36).substring(2, 6);
      const newStaff: Staff = { ...staffData, id };
      persist({
        staffList: [...get().staffList, newStaff],
      });
      get().addToast(`Staff profile registered for ${newStaff.fullName}`, "success");
    },

    editStaff: (id, updates) => {
      const updated = get().staffList.map((s) => (s.id === id ? { ...s, ...updates } : s));
      persist({ staffList: updated });
      get().addToast("Staff profile updated", "success");
    },

    updatePropertyProfile: (updates) => {
      const current = get().propertyProfile;
      if (current) {
        const nextProfile = { ...current, ...updates };
        persist({ propertyProfile: nextProfile });
        get().addToast("Hotel operations configurations updated successfully", "success");
      }
    },
  };
});

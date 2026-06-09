/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Utensils, ShoppingCart, Send, Clipboard, RotateCcw, CheckSquare, Plus, Trash2 } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { ChargeType } from "../../types";
import { Card, Badge, Button, Input, Select } from "../../components/ui/design";

export const RestaurantModule: React.FC = () => {
  const store = useHotelStore();
  const reservations = store.reservations.filter(r => r.status === "Checked-in");
  const guests = store.guests;
  const rooms = store.rooms;

  // Local POS items Catalog
  const restaurantCatalog = [
    { id: "fd-1", name: "Ghanaian Jollof Rice with Chicken", price: 110, cat: "Meals" },
    { id: "fd-2", name: "Fufu with Goat Soup & Tripe", price: 125, cat: "Local Special" },
    { id: "fd-3", name: "Kelewele (Spiced Plantains)", price: 65, cat: "Sides" },
    { id: "fd-4", name: "Club Sandwich with Fries", price: 90, cat: "Meals" },
    { id: "fd-5", name: "Assorted Banku with Tilapia", price: 140, cat: "Local Special" },
    { id: "fd-6", name: "Alvaro Ginger Mocktail", price: 30, cat: "Drinks" },
    { id: "fd-7", name: "Chilled Club Beer (600ml)", price: 40, cat: "Drinks" },
    { id: "fd-8", name: "Premium mineral water (Accra Pure)", price: 15, cat: "Drinks" },
  ];

  // Tabs: Order Desk, Kitchen Display System (KDS)
  const [restTab, setRestTab] = useState<"pos" | "kds">("pos");

  // Basket order states
  const [basket, setBasket] = useState<Array<{ itemId: string; name: string; price: number; qty: number }>>([]);
  const [orderDest, setOrderDest] = useState<"table" | "room">("table");
  const [tableNo, setTableNo] = useState("Table 5");
  const [targetReservationId, setTargetReservationId] = useState(reservations[0]?.id || "");

  // Simulated kitchen tickets
  const [kdsTickets, setKdsTickets] = useState([
    { id: "tk-829", time: "12:14 PM", dest: "Table 4", items: "1x Jollof Rice, 1x Alvaro", status: "Cooking" },
    { id: "tk-830", time: "12:20 PM", dest: "Room Service (Rm 102)", items: "2x Club Sandwich, 2x Club Beer", status: "Pending Cook" },
    { id: "tk-831", time: "11:50 AM", dest: "Table 1", items: "1x Fufu with Goat Soup", status: "Served" },
  ]);

  // Handlers
  const handleAddToBasket = (item: any) => {
    const existing = basket.find((b) => b.itemId === item.id);
    if (existing) {
      setBasket(
        basket.map((b) => (b.itemId === item.id ? { ...b, qty: b.qty + 1 } : b))
      );
    } else {
      setBasket([...basket, { itemId: item.id, name: item.name, price: item.price, qty: 1 }]);
    }
  };

  const handleUpdateBasketQty = (itemId: string, q: number) => {
    if (q <= 0) {
      setBasket(basket.filter((b) => b.itemId !== itemId));
    } else {
      setBasket(basket.map((b) => (b.itemId === itemId ? { ...b, qty: q } : b)));
    }
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  const handleCalculateTotal = () => {
    return basket.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  // Dispatch Checkout order to KDS or Guest Folio Room service!
  const handleDispatchOrder = (chargeMethod: "cash" | "room-folio") => {
    if (basket.length === 0) {
      store.addToast("Add items to restaurant basket first", "error");
      return;
    }

    const totalCost = handleCalculateTotal();
    const destLabel =
      orderDest === "table" ? tableNo : `Room Service (Rm ${rooms.find(rm => rm.id === reservations.find(r => r.id === targetReservationId)?.roomId)?.roomNumber || "N/A"})`;

    // 1. If Post to Room service, insert charges directly into the guest folio list
    if (chargeMethod === "room-folio") {
      if (!targetReservationId) {
        store.addToast("Please select active checked-in guest to route folio charges!", "error");
        return;
      }

      store.addFolioCharge(targetReservationId, {
        type: ChargeType.RESTAURANT,
        description: `Restaurant Bill: ${basket.map((b) => `${b.qty}x ${b.name}`).join(", ")}`,
        amountPesewas: Math.round(totalCost * 100),
        postedQuantity: 1,
      });

      store.addToast(`₵${totalCost.toFixed(2)} posted directly onto theGuest's room bill!`, "success");
    } else {
      store.addToast(`Receipt printed. GHS ₵${totalCost.toFixed(2)} collected successfully at checkout.`, "success");
    }

    // 2. Append to kitchen display tickets board
    const d = new Date();
    const timeNow = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setKdsTickets([
      {
        id: `tk-${Math.floor(100 + Math.random() * 900)}`,
        time: timeNow,
        dest: destLabel,
        items: basket.map((b) => `${b.qty}x ${b.name.replace("Ghanaian ", "")}`).join(", "),
        status: "Pending Cook",
      },
      ...kdsTickets,
    ]);

    setBasket([]);
  };

  const handleCycleKds = (id: string, currentSt: string) => {
    let nextSt = "Cooking";
    if (currentSt === "Pending Cook") nextSt = "Cooking";
    else if (currentSt === "Cooking") nextSt = "Served";
    else return;

    setKdsTickets(kdsTickets.map((t) => (t.id === id ? { ...t, status: nextSt } : t)));
    store.addToast(`Kitchen Ticket ${id} transitioned to: ${nextSt}`, "info");
  };

  const handleDeleteTicket = (id: string) => {
    setKdsTickets(kdsTickets.filter((t) => t.id !== id));
    store.addToast("Kitchen order ticket cleared.", "info");
  };

  return (
    <div className="space-y-6">
      
      {/* Visual head navigation tab switch */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-72">
        <button
          onClick={() => setRestTab("pos")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
            restTab === "pos" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Restaurant POS Desk
        </button>
        <button
          onClick={() => setRestTab("kds")}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
            restTab === "kds" ? "bg-white text-slate-850 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Kitchen Monitor Board
        </button>
      </div>

      {/* 1. POS segment */}
      {restTab === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 animate-in fade-in duration-200">
          
          {/* Left catalogue list - spans 8 columns */}
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              In-Hotel Food & Drink Catalogue
            </span>

            <div className="grid grid-cols-2 gap-3">
              {restaurantCatalog.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => handleAddToBasket(item)}
                  className="p-4 flex flex-col justify-between cursor-pointer border border-slate-100 hover:border-brand-teal/30 hover:bg-slate-50/20 hover:shadow-md transition-all active:scale-[0.99] min-h-[110px]"
                >
                  <div>
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">
                      {item.cat}
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight mt-1.5 font-display line-clamp-2">
                      {item.name}
                    </h4>
                  </div>
                  <div className="flex justify-between items-center mt-3 text-sm font-black font-mono text-cyan-800">
                    <span>₵{item.price.toFixed(2)}</span>
                    <span className="text-[10px] text-brand-teal font-extrabold bg-brand-teal/5 px-2 py-0.5 rounded">
                      Add to desk +
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Right order basket panel - spans 5 columns */}
          <Card className="lg:col-span-5 p-5 flex flex-col justify-between min-h-[480px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4.5 h-4.5 text-brand-teal" />
                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Basket Order Ticket
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleClearBasket}
                  className="text-[10px] text-red-500 font-bold uppercase hover:underline cursor-pointer"
                >
                  Empty basket
                </button>
              </div>

              {/* Basket list items scrolling */}
              {basket.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs italic bg-slate-50/40 border border-dashed border-slate-150 rounded-xl my-4">
                  Basket is currently empty. Click on catalogue items to construct bills.
                </div>
              ) : (
                <div className="space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar my-4">
                  {basket.map((b) => (
                    <div key={b.itemId} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="max-w-[190px] overflow-hidden">
                        <span className="font-bold text-slate-700 block uppercase truncate">{b.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">₵{b.price.toFixed(2)} each</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={b.qty}
                          onChange={(e) => handleUpdateBasketQty(b.itemId, parseInt(e.target.value) || 0)}
                          className="w-12 py-1 text-center bg-white border border-slate-200 outline-none text-xs rounded font-bold"
                          min={0}
                        />
                        <button
                          onClick={() => handleUpdateBasketQty(b.itemId, 0)}
                          className="p-1 hover:text-red-650 hover:bg-white text-slate-350 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Destination settings segment */}
              <div className="space-y-3 pt-3.5 border-t border-slate-100 mt-4 text-xs font-semibold">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Delivery Destination Route
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOrderDest("table")}
                    className={`py-2 border rounded-lg text-center cursor-pointer transition-all ${
                      orderDest === "table"
                        ? "bg-brand-teal text-white border-brand-teal font-extrabold"
                        : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    Dine-In Table
                  </button>
                  <button
                    onClick={() => setOrderDest("room")}
                    className={`py-2 border rounded-lg text-center cursor-pointer transition-all ${
                      orderDest === "room"
                        ? "bg-brand-teal text-white border-brand-teal font-extrabold"
                        : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    Room Service Post
                  </button>
                </div>

                {orderDest === "table" ? (
                  <Select
                    label="Table Selection"
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                    options={[
                      { value: "Table 1", label: "Table 1" },
                      { value: "Table 2", label: "Table 2" },
                      { value: "Table 5", label: "Table 5" },
                      { value: "Poolside 2", label: "Poolside 2" },
                      { value: "Terrace Bar", label: "Terrace Bar" },
                    ]}
                  />
                ) : (
                  <Select
                    label="Active In-House Target Room Folio"
                    value={targetReservationId}
                    onChange={(e) => setTargetReservationId(e.target.value)}
                    options={reservations.map((r) => {
                      const guest = guests.find((g) => g.id === r.guestId);
                      const roomNo = rooms.find((rm) => rm.id === r.roomId)?.roomNumber || "N/A";
                      return {
                        value: r.id,
                        label: `Rm ${roomNo} - ${guest?.fullName}`,
                      };
                    })}
                  />
                )}
              </div>
            </div>

            {/* Price Calculations and dispatch triggers */}
            <div className="pt-4 border-t border-slate-100 mt-6 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-slate-650">Total Bill Cost:</span>
                <span className="text-xl font-bold font-mono text-emerald-600">₵{handleCalculateTotal().toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="py-2.5 uppercase font-bold text-[10px]" onClick={() => handleDispatchOrder("cash")} disabled={basket.length === 0}>
                  Pay POS Cash
                </Button>
                <Button variant="primary" className="py-2.5 uppercase font-bold text-[10px]" onClick={() => handleDispatchOrder("room-folio")} disabled={basket.length === 0 || reservations.length === 0}>
                  Post to Room Bill
                </Button>
              </div>
            </div>

          </Card>

        </div>
      )}

      {/* 2. KDS Monitor screen */}
      {restTab === "kds" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
          {kdsTickets.map((tc) => {
            let stateStyle = "bg-rose-50 border-rose-100 text-rose-800";
            if (tc.status === "Cooking") stateStyle = "bg-amber-50 border-amber-100 text-amber-800";
            else if (tc.status === "Served") stateStyle = "bg-zinc-100 border-zinc-200 text-zinc-550";

            return (
              <Card key={tc.id} className="p-4 flex flex-col justify-between min-h-[160px]">
                <div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-55 mt-1">
                    <span className="font-mono font-bold text-slate-400">Order Ref: {tc.id}</span>
                    <span className="text-[10px] font-mono text-slate-400">{tc.time}</span>
                  </div>

                  <span className="text-[11px] font-extrabold text-brand-teal block uppercase tracking-wide mt-2">
                    {tc.dest}
                  </span>

                  <p className="text-xs font-semibold text-slate-700 leading-normal mt-2">
                    {tc.items}
                  </p>
                </div>

                <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between gap-2.5">
                  <span className={`text-[9px] px-2 py-0.5 font-bold uppercase rounded ${stateStyle}`}>
                    {tc.status}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {tc.status === "Served" ? (
                      <button
                        onClick={() => handleDeleteTicket(tc.id)}
                        className="text-[10px] text-red-500 font-bold uppercase hover:underline cursor-pointer"
                      >
                        Archived
                      </button>
                    ) : (
                      <Button variant="outline" className="py-0.5 px-2 text-[10px] font-bold" onClick={() => handleCycleKds(tc.id, tc.status)}>
                        {tc.status === "Pending Cook" ? "Start Prep" : tc.status === "Cooking" ? "Mark Served" : "Served"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
};

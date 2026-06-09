/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Package, Search, Plus, AlertTriangle, Play, RefreshCw } from "lucide-react";
import { useHotelStore } from "../../store/hotelStore";
import { Card, Badge, Button, Input, Select, Modal } from "../../components/ui/design";

export const InventoryModule: React.FC = () => {
  const store = useHotelStore();
  const inventory = store.inventoryList;

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add Item states
  const [itemName, setItemName] = useState("");
  const [itemCat, setItemCat] = useState("Cleaning");
  const [itemUnit, setItemUnit] = useState("pieces");
  const [itemStock, setItemStock] = useState<number>(100);
  const [itemReorder, setItemReorder] = useState<number>(30);

  // Stock Inflow modal state
  const [inflowTarget, setInflowTarget] = useState<any | null>(null);
  const [inflowQty, setInflowQty] = useState<number>(10);

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    store.addInventoryItem({
      id: "",
      name: itemName,
      category: itemCat as any,
      unit: itemUnit,
      reorderLevel: itemReorder,
      baseCostPesewas: 3500,
      supplierName: "StayCore Distributors",
    });

    setIsAddOpen(false);
    setItemName("");
  };

  const handleProcessInflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inflowTarget) return;

    store.recordStockTransaction({
      itemId: inflowTarget.id,
      quantity: inflowQty,
      type: "IN",
      department: "Inventory Desk",
    });
    setInflowTarget(null);
  };

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Upper search panel */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider font-display flex items-center gap-2">
          <Package className="w-5 h-5 text-brand-teal" /> Materials Supplies Inventory
        </h3>

        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search catalog stocks..."
              className="pl-8.5 pr-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-teal transition-colors w-48"
            />
          </div>

          <Button variant="primary" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4" /> Add supply item
          </Button>
        </div>
      </div>

      {/* Main inventory list */}
      <Card className="p-5">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider text-[10px] pb-2">
                <th className="py-2.5">Item Registered Name</th>
                <th>Category Division</th>
                <th>Current Stock Level</th>
                <th>Alert Limit</th>
                <th>Status State</th>
                <th className="text-right">Action Settle</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => {
                const isUnder = item.stockLevel <= item.reorderLevel;
                const percentLeft = Math.min(100, Math.round((item.stockLevel / (item.reorderLevel * 3)) * 100));

                return (
                  <tr key={item.id} className="border-b border-slate-55 hover:bg-slate-50/50">
                    <td className="py-4 font-bold text-slate-800">{item.name}</td>
                    <td>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 py-0.5 px-2 rounded uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3.5">
                        <span className="font-mono font-extrabold text-[12px]">{item.stockLevel} {item.unit}</span>
                        
                        {/* Miniature progress bar left */}
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden md:block">
                          <div
                            style={{ width: `${percentLeft}%` }}
                            className={`h-full rounded-full ${isUnder ? "bg-red-500 animate-pulse" : "bg-emerald-505"}`}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-slate-500 font-bold">Reorder level: {item.reorderLevel}</td>
                    <td>
                      <Badge variant={isUnder ? "danger" : "success"}>
                        {isUnder ? "CRITICAL OUT" : "STOCK STABLE"}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <Button variant="outline" className="py-1 px-2.5 text-[10px]" onClick={() => setInflowTarget(item)}>
                        <RefreshCw className="w-3 h-3" /> + Stock Inflow
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Item Add Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add supply item catalog record"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateItem}>
              Register Catalog Item
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <Input
            label="Supply Product Title"
            value={itemName}
            required
            placeholder="e.g. VIP Room Shampoo premium shampoo"
            onChange={(e) => setItemName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3.5">
            <Select
              label="Inventory Category Division"
              value={itemCat}
              onChange={(e) => setItemCat(e.target.value)}
              options={[
                { value: "Cleaning", label: "Housekeeping cleaning" },
                { value: "Kitchen", label: "F&B Bar & Kitchen stocks" },
                { value: "Linen", label: "Linen Closet units" },
                { value: "Stationery", label: "Reception Office Stationery" },
                { value: "Toiletries", label: "Guest Toiletries kit" },
                { value: "Maintenance", label: "Property Maintenance gears" },
              ]}
            />
            <Input
              label="Standard Unit Measurement"
              placeholder="pieces, bags, cases, litres"
              value={itemUnit}
              required
              onChange={(e) => setItemUnit(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <Input
              label="Initial Stock Inventory Level"
              type="number"
              value={itemStock}
              required
              onChange={(e) => setItemStock(parseInt(e.target.value) || 0)}
            />
            <Input
              label="Reorder Stock Threshold warning limit"
              type="number"
              value={itemReorder}
              required
              onChange={(e) => setItemReorder(parseInt(e.target.value) || 0)}
            />
          </div>
        </form>
      </Modal>

      {/* Stock Inflow modal */}
      <Modal
        isOpen={!!inflowTarget}
        onClose={() => setInflowTarget(null)}
        title={inflowTarget ? `Add Stock Inflow: ${inflowTarget.name}` : ""}
        footer={
          <>
            <Button variant="outline" onClick={() => setInflowTarget(null)}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleProcessInflow}>
              Record Stock Addition
            </Button>
          </>
        }
      >
        {inflowTarget && (
          <form onSubmit={handleProcessInflow} className="space-y-4">
            <p className="text-xs text-slate-500 leading-normal">
              Enter the incoming volume. This will be added directly to the existing inventory index.
            </p>

            <Input
              label={`Quantity of Incoming Stock (${inflowTarget.unit})`}
              type="number"
              required
              min={1}
              value={inflowQty}
              onChange={(e) => setInflowQty(parseInt(e.target.value) || 10)}
            />
          </form>
        )}
      </Modal>

    </div>
  );
};

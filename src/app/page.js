"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [urgentItems, setUrgentItems] = useState([]);
  const [canWaitItems, setCanWaitItems] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState("canWait");

  const [editItem, setEditItem] = useState(null);

  const [code, setCode] = useState("");
  const [entered, setEntered] = useState(false);

  const sortItems = (items) => {
    const notBought = items.filter((i) => !i.isBought);
    const bought = items.filter((i) => i.isBought);
    return [...notBought, ...bought];
  };

  const fetchItems = async (familyCode) => {
    if (!familyCode) return;

    const res = await fetch(`/api/items?code=${familyCode}&t=${Date.now()}`);
    const data = await res.json();

    setUrgentItems(sortItems(data.filter((i) => i.type === "urgent")));
    setCanWaitItems(sortItems(data.filter((i) => i.type === "canWait")));
  };

  useEffect(() => {
    if (!entered) return;
    fetchItems(code);
  }, [entered]);

  const isEmpty = urgentItems.length === 0 && canWaitItems.length === 0;

  const handleAddItem = async () => {
    if (!name.trim() || !code) return;

    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        name,
        quantity,
        type,
        isBought: false,
      }),
    });

    await fetchItems(code);

    setName("");
    setQuantity("");
    setType("canWait");
    setShowForm(false);
  };

  const toggleItem = async (item) => {
    await fetch("/api/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...item,
        isBought: !item.isBought,
      }),
    });

    fetchItems(code);
  };

  const deleteItem = async (id) => {
    await fetch(`/api/items?id=${id}`, {
      method: "DELETE",
    });

    fetchItems(code);
  };

  const saveEdit = async () => {
    if (!editItem?.name?.trim()) return;

    await fetch("/api/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editItem),
    });

    setEditItem(null);
    fetchItems(code);
  };

  const renderItem = (item) => (
    <div
      key={item._id}
      className={`bg-white text-neutral-900 p-4 rounded-2xl border border-neutral-200 flex justify-between items-center transition ${
        item.isBought ? "opacity-40" : "hover:shadow-md"
      }`}
    >
      <div
        onClick={() => toggleItem(item)}
        className="flex justify-between w-full cursor-pointer"
      >
        <span
          className={`text-neutral-900 ${
            item.isBought ? "line-through" : ""
          }`}
        >
          {item.name}
        </span>

        {item.quantity && (
          <span
            className={`text-neutral-600 text-sm ${
              item.isBought ? "line-through" : ""
            }`}
          >
            {item.quantity}
          </span>
        )}
      </div>

      <div className="flex gap-3 ml-3 text-neutral-600">
        <button onClick={() => setEditItem(item)}>✎</button>
        <button onClick={() => deleteItem(item._id)}>✕</button>
      </div>
    </div>
  );

  if (!entered) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <div className="bg-white p-6 rounded-2xl shadow-md w-80">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Enter Family Code
          </h2>

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. home123"
            className="w-full mb-4 p-3 border border-neutral-300 rounded text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            onClick={() => setEntered(true)}
            className="w-full bg-black text-white py-2 rounded"
          >
            Continue
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-5 py-6">
      <h1 className="text-2xl font-semibold mb-6 text-neutral-900">
        Shared Grocery List
      </h1>

      {isEmpty ? (
        <div className="text-center mt-40 text-neutral-500">
          No items yet. Add your first item ➕
        </div>
      ) : (
        <>
          <h2 className="mb-3 text-neutral-700 font-medium">Urgent</h2>
          <div className="space-y-3 mb-8">
            {urgentItems.map(renderItem)}
          </div>

          <h2 className="mb-3 text-neutral-700 font-medium">Can Wait</h2>
          <div className="space-y-3">
            {canWaitItems.map(renderItem)}
          </div>
        </>
      )}

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 bg-black text-white w-14 h-14 rounded-full shadow-lg text-xl"
      >
        +
      </button>

      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          className="fixed inset-0 bg-black/30 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-2xl w-80 shadow-xl"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
              className="w-full mb-3 p-2 border rounded text-neutral-900"
            />

            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity (optional)"
              className="w-full mb-3 p-2 border rounded text-neutral-900"
            />

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full mb-4 p-2 border rounded bg-white text-neutral-900"
            >
              <option value="canWait">Can Wait</option>
              <option value="urgent">Urgent</option>
            </select>

            <button
              onClick={handleAddItem}
              className="w-full bg-black text-white py-2 rounded"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {editItem && (
        <div
          onClick={() => setEditItem(null)}
          className="fixed inset-0 bg-black/30 flex items-center justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-2xl w-80 shadow-xl"
          >
            <input
              value={editItem.name}
              onChange={(e) =>
                setEditItem({ ...editItem, name: e.target.value })
              }
              placeholder="Item name"
              className="w-full mb-3 p-2 border rounded text-neutral-900"
            />

            <input
              value={editItem.quantity || ""}
              onChange={(e) =>
                setEditItem({ ...editItem, quantity: e.target.value })
              }
              placeholder="Quantity (optional)"
              className="w-full mb-3 p-2 border rounded text-neutral-900"
            />

            <select
              value={editItem.type}
              onChange={(e) =>
                setEditItem({ ...editItem, type: e.target.value })
              }
              className="w-full mb-4 p-2 border rounded bg-white text-neutral-900"
            >
              <option value="canWait">Can Wait</option>
              <option value="urgent">Urgent</option>
            </select>

            <button
              onClick={saveEdit}
              className="w-full bg-black text-white py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
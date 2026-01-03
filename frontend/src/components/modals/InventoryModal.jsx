import React from "react";
import { X, Plus, Edit2 } from "lucide-react";

const InventoryModal = ({ 
  isOpen, 
  onClose, 
  isEditing, 
  currentItem, 
  setCurrentItem, 
  onSubmit 
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isEditing ? (
              <Edit2 className="w-6 h-6 text-purple-400" />
            ) : (
              <Plus className="w-6 h-6 text-green-400" />
            )}
            <h3 className="text-2xl font-semibold text-white">
              {isEditing ? "Edit Item" : "Add New Item"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Help Section */}
          {!isEditing && (
            <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                <span>ℹ️</span> Quick Guide
              </h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• <strong>SKU</strong>: Unique code (e.g., LAP-001, DESK-WOOD-01)</li>
                <li>• <strong>Price</strong>: Add price to display in e-commerce store</li>
                <li>• <strong>Image</strong>: Upload product photo for better presentation</li>
                <li>• Fields marked with * are required</li>
              </ul>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                value={currentItem.name}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, name: e.target.value })
                }
                required
                placeholder="e.g., Dell XPS 15 Laptop"
                minLength={2}
                maxLength={100}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-slate-500 mt-1">2-100 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                SKU * <span className="text-xs text-slate-500">(Stock Keeping Unit)</span>
              </label>
              <input
                type="text"
                value={currentItem.sku}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, sku: e.target.value })
                }
                required
                placeholder="e.g., LAP-DELL-XPS15"
                pattern="[A-Za-z0-9-_]{3,20}"
                minLength={3}
                maxLength={20}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-slate-500 mt-1">3-20 characters: letters, numbers, hyphens, underscores only</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Category *
              </label>
              <input
                type="text"
                value={currentItem.category}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, category: e.target.value })
                }
                required
                placeholder="e.g., Electronics"
                list="category-suggestions"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <datalist id="category-suggestions">
                <option value="Electronics" />
                <option value="Furniture" />
                <option value="Office Supplies" />
                <option value="Accessories" />
                <option value="Clothing" />
                <option value="Food & Beverage" />
              </datalist>
              <p className="text-xs text-slate-500 mt-1">Product category (e.g., Electronics, Furniture)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={currentItem.quantity}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                required
                placeholder="0"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-slate-500 mt-1">Current stock quantity (whole numbers only)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Price ($) <span className="text-xs text-yellow-400">(Recommended for E-Commerce)</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={currentItem.price || ""}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <p className="text-xs text-slate-500 mt-1">Product price for e-commerce display</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Product Image (Optional)
              </label>
              
              {/* Image Preview */}
              {currentItem.imageUrl && (
                <div className="mb-3 relative">
                  <img
                    src={currentItem.imageUrl.startsWith('/uploads/') 
                      ? `http://localhost:8000${currentItem.imageUrl}`
                      : currentItem.imageUrl}
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-lg border border-slate-600"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setCurrentItem({ ...currentItem, imageUrl: "" })}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {/* File Upload */}
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append("image", file);
                      
                      try {
                        const response = await fetch("http://localhost:8000/api/upload/image", {
                          method: "POST",
                          body: formData,
                        });
                        const data = await response.json();
                        if (response.ok) {
                          setCurrentItem({ ...currentItem, imageUrl: data.imageUrl });
                        } else {
                          alert("Failed to upload image: " + data.error);
                        }
                      } catch (error) {
                        alert("Error uploading image: " + error.message);
                      }
                    }
                  }}
                  className="flex-1 bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Upload an image file (JPG, PNG, GIF, WebP - Max 5MB)
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Description
              </label>
              <textarea
                value={currentItem.description}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, description: e.target.value })
                }
                rows="4"
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                isEditing
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              {isEditing ? (
                <>
                  <Edit2 className="w-4 h-4" />
                  Update Item
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Item
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-red-700 hover:bg-red-600 rounded-lg font-medium transition-colors text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;
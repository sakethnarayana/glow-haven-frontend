// src/components/ProductCard.jsx
import React, { useEffect, useState } from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { toast } from "react-hot-toast";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg font-semibold transition-all duration-150";

const ProductCard = ({
  item,
  clickable = true,
  quantity,
  onAddToCart,
  onUpdateQuantity,
  isAddingToCart,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const cartContext = useCart?.();
  const cartItems = cartContext?.cartItems || [];
  const addItem = cartContext?.addItem;
  const updateQuantity = cartContext?.updateQuantity;
  const removeItem = cartContext?.removeItem;

  // Derive quantity from global cart if not passed
  const findInCart = cartItems.find((c) => c._id === item._id || c.productId === item._id);
  const qtyFromCart = findInCart ? findInCart.quantity || 0 : 0;
  const [localQty, setLocalQty] = useState(quantity || qtyFromCart);

  useEffect(() => {
    setLocalQty(quantity || qtyFromCart);
  }, [quantity, qtyFromCart]);

  // 👇 Handle navigation to product details
  const onCardClick = (e) => {
    e?.stopPropagation();
    if (!clickable) return;
    
    // Only navigate if clicking on the card itself, not on buttons
    if (e.target.closest("button")) return;
    
    toast.loading("Opening product...", { id: "open-product" });
    navigate(`/products/${item._id}`);
    setTimeout(() => toast.dismiss("open-product"), 900);
  };

  const openAuth = () => window.dispatchEvent(new Event("app:openAuth"));

  const handleAdd = (e) => {
    e?.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      openAuth();
      return;
    }

    try {
      if (onAddToCart) {
        onAddToCart(item);
      } else if (addItem) {
        addItem(item, 1);
        setLocalQty(1);
        toast.success(`${item.name} added to cart! 🛒`);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  const handleChangeQty = (e, newQty) => {
    e?.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Please login to manage cart");
      openAuth();
      return;
    }

    const final = Math.max(0, Math.floor(newQty));
    
    try {
      if (onUpdateQuantity) {
        onUpdateQuantity(item._id, final);
      } else if (updateQuantity) {
        if (final === 0 && removeItem) {
          removeItem(item._id);
        } else {
          updateQuantity(item._id, final);
        }
        setLocalQty(final);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  return (
    <div
      onClick={onCardClick}
      className={`group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 flex flex-col h-[360px] md:h-[420px] ${
        clickable ? "cursor-pointer hover:scale-[1.01]" : ""
      }`}
    >
      {/* Product Image */}
      <div className="relative h-44 md:h-56 overflow-hidden bg-gray-100">
        <img
          src={item.image || "/placeholder.jpg"}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) =>
            (e.currentTarget.src =
              "https://via.placeholder.com/400x300?text=Product+Image")
          }
        />
        {typeof item.stock !== "undefined" && (
          <div className="absolute top-3 left-3">
            {item.stock > 0 ? (
              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                In Stock
              </span>
            ) : (
              <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                Out of Stock
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 md:p-5 flex flex-col flex-1">
        <div className="mb-2">
          {item.category && (
            <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full mb-2">
              {item.category}
            </span>
          )}
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description ||
              "Premium quality product for your beauty needs"}
          </p>
        </div>

        {/* Price + Cart Buttons */}
        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-lg md:text-2xl font-bold text-gray-900">
              ₹{item.price?.toLocaleString("en-IN")}
            </p>
            {typeof item.stock !== "undefined" && (
              <p className="text-xs text-gray-500">{item.stock} left</p>
            )}
          </div>

          {/* Add / Quantity */}
          <div className="flex items-center">
            {localQty <= 0 ? (
              <button
                onClick={handleAdd}
                disabled={isAddingToCart}
                className={`${BUTTON_BASE} bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:from-purple-700 hover:to-pink-700 disabled:opacity-60 disabled:cursor-not-allowed`}
                aria-label="Add to cart"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm hidden md:inline">
                  {isAddingToCart ? "Adding..." : "Add"}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                <button
                  onClick={(e) => handleChangeQty(e, localQty - 1)}
                  className="p-1 rounded hover:bg-gray-200 active:scale-95 transition-all"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="min-w-[36px] text-center font-semibold text-gray-800">
                  {localQty}
                </div>
                <button
                  onClick={(e) => handleChangeQty(e, localQty + 1)}
                  className="p-1 rounded hover:bg-gray-200 active:scale-95 transition-all"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
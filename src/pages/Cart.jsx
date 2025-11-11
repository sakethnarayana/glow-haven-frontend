
import React, { useEffect, useState } from "react";
import api from "../config/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-hot-toast";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  Check,
  X,
  ChevronDown,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";


const Cart = ({ cartItems: propCartItems, setCartItems: propSetCartItems }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Cart source: either props or CartContext
  const cartContext = useCart?.();
  const ctxCartItems = cartContext?.cartItems;
  const ctxAddItem = cartContext?.addItem;
  const ctxUpdateQuantity = cartContext?.updateQuantity;
  const ctxRemoveItem = cartContext?.removeItem;
  const ctxClearCart = cartContext?.clearCart;

  // Use prop cart if provided, otherwise context cart
  const cartItems = propCartItems ?? ctxCartItems ?? [];
  const setCartItems =
    propSetCartItems ??
    ((next) => {
      if (Array.isArray(next)) {
        localStorage.setItem("cart", JSON.stringify(next));
      }
    });

  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(false);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [formData, setFormData] = useState({
    label: "",
    recipientName: user?.name || "",
    phone: user?.phone || "",
    addressLine: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
    isDefault: false,
  });

  useEffect(() => {
    fetchCartAndAddresses();
  }, []);

  const fetchCartAndAddresses = async () => {
    try {
      setLoading(true);

      try {
        const addressRes = await api.get("/addresses/my-addresses?limit=100");
        const addressList = addressRes.data?.data?.addresses || [];
        setAddresses(addressList);

        if (addressList.length > 0) {
          const defaultAddr = addressList.find((a) => a.isDefault);
          setSelectedAddressId(defaultAddr?._id || addressList[0]._id);
        }
      } catch (addrErr) {
        console.warn("Address fetch failed", addrErr);
      }

      if (
        (!propCartItems && !ctxCartItems) ||
        (Array.isArray(cartItems) && cartItems.length === 0)
      ) {
        try {
          const saved = JSON.parse(localStorage.getItem("cart") || "[]");
          if (propSetCartItems) {
            propSetCartItems(saved);
          } else if (ctxAddItem && ctxCartItems && ctxCartItems.length === 0) {
            saved.forEach((it) => {
              const prodId = it.productId || it._id || it.id;
              const product = it.product ? it.product : { ...it, _id: prodId };
              ctxAddItem(product, it.quantity || 1);
            });
          } else {
            localStorage.setItem("cart", JSON.stringify(saved));
          }
        } catch (e) {
          console.warn("Failed to parse saved cart", e);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cart & addresses:", error);
      toast.error("Failed to load cart data");
    } finally {
      setLoading(false);
    }
  };

  const normalizeItem = (item) => {
    const productId =
      item.productId ||
      item._id ||
      item.id ||
      item.product?._id ||
      item.product?._id;
    const quantity = item.quantity ?? item.qty ?? 0;
    const price = item.price ?? item.product?.price ?? 0;
    const name = item.name ?? item.product?.name ?? "Product";
    const image =
      item.image ??
      item.product?.image ??
      item.product?.images?.[0] ??
      "/placeholder.jpg";

    return {
      productId,
      quantity,
      price: Number(price),
      name,
      image,
      raw: item,
    };
  };

  const persistCart = (nextCart) => {
    try {
      localStorage.setItem("cart", JSON.stringify(nextCart));
    } catch {}
    if (typeof propSetCartItems === "function") {
      propSetCartItems(nextCart);
      return;
    }
    if (ctxClearCart && ctxAddItem) {
      ctxClearCart();
      nextCart.forEach((it) => {
        const n = normalizeItem(it);
        ctxAddItem(
          { _id: n.productId, name: n.name, price: n.price, image: n.image },
          n.quantity
        );
      });
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }

    if (typeof ctxUpdateQuantity === "function" && !propSetCartItems) {
      ctxUpdateQuantity(productId, newQuantity);
      return;
    }

    const updated = (cartItems || []).map((rawItem) => {
      const n = normalizeItem(rawItem);
      if (n.productId === productId) {
        return { ...rawItem, quantity: newQuantity };
      }
      return rawItem;
    });
    persistCart(updated);
    setCartItems(updated);
  };

  const removeItem = (productId) => {
    if (typeof ctxRemoveItem === "function" && !propSetCartItems) {
      ctxRemoveItem(productId);
      return;
    }

    const updated = (cartItems || []).filter((rawItem) => {
      const n = normalizeItem(rawItem);
      return n.productId !== productId;
    });
    persistCart(updated);
    setCartItems(updated);
    toast.success("Item removed from cart");
  };

  const calculateTotal = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((sum, it) => {
      const { price, quantity } = normalizeItem(it);
      return sum + Number(price || 0) * Number(quantity || 0);
    }, 0);
  };

  const calculateSubtotal = () => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((sum, it) => {
      const { price, quantity } = normalizeItem(it);
      return sum + Number(price || 0) * Number(quantity || 0);
    }, 0);
  };

  const shipping = 0;
  const tax = 0;
  const subtotal = calculateSubtotal();
  const total = subtotal + shipping + tax;

  const resetAddressForm = () => {
    setFormData({
      label: "",
      recipientName: user?.name || "",
      phone: user?.phone || "",
      addressLine: "",
      landmark: "",
      pincode: "",
      city: "",
      state: "",
      isDefault: addresses.length === 0,
    });
  };

  const validateAddressForm = () => {
    if (!formData.recipientName.trim()) {
      toast.error("Please enter recipient name");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Please enter phone number");
      return false;
    }
    if (
      !formData.addressLine.trim() ||
      formData.addressLine.trim().length < 5
    ) {
      toast.error("Please enter a valid address");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("Please enter city");
      return false;
    }
    if (!formData.state.trim()) {
      toast.error("Please enter state");
      return false;
    }
    if (!formData.pincode.trim() || !/^\d{5,10}$/.test(formData.pincode)) {
      toast.error("Please enter a valid pincode");
      return false;
    }
    return true;
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;
    try {
      setAddingAddress(true);
      const response = await api.post("/addresses", formData);
      const newAddress = response.data.data;
      setAddresses((prev) => [...prev, newAddress]);
      setSelectedAddressId(newAddress._id);
      resetAddressForm();
      setShowAddressForm(false);
      toast.success("Address added successfully! ✅");
    } catch (error) {
      console.error("Failed to add address:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add address";
      toast.error(errorMessage);
    } finally {
      setAddingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      setIsPlacingOrder(true);

      const items = cartItems.map((it) => {
        const n = normalizeItem(it);
        return {
          productId: n.productId,
          quantity: n.quantity,
          price: n.price,
        };
      });

      const response = await api.post("/orders", {
        userId: user._id,
        addressId: selectedAddressId,
        items,
        paymentMethod,
      });

      toast.success("Order placed successfully! 🎉");

      if (ctxClearCart) ctxClearCart();
      persistCart([]);
      setCartItems([]);

      setTimeout(() => navigate("/orders"), 1200);
    } catch (error) {
      console.error("Failed to place order:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to place order";
      toast.error(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-3 sm:px-6 md:px-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">
          Shopping Cart
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {Array.isArray(cartItems) && cartItems.length > 0
            ? `${cartItems.length} item${cartItems.length !== 1 ? "s" : ""} in your cart`
            : "Your cart is empty"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left: Cart Items */}
        <div className="lg:col-span-2">
          {/* Cart Items Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {Array.isArray(cartItems) && cartItems.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {cartItems.map((rawItem) => {
                  const n = normalizeItem(rawItem);
                  const itemTotal = n.price * n.quantity;
                  return (
                    <div
                      key={n.productId}
                      className="p-4 sm:p-5 md:p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-4 md:gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={n.image}
                            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-lg"
                            alt={n.name}
                            onError={(e) =>
                              (e.currentTarget.src =
                                "https://via.placeholder.com/100?text=Product")
                            }
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {n.name}
                          </h3>

                          {/* Price */}
                          <p className="text-sm md:text-base text-gray-600 mb-3">
                            <span className="font-semibold">₹</span>
                            <span className="font-bold text-gray-900">
                              {n.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-gray-500 ml-2">per item</span>
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-1.5 border border-gray-200">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    n.productId,
                                    Math.max(1, n.quantity - 1)
                                  )
                                }
                                className="p-1.5 hover:bg-white rounded transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-4 h-4 text-gray-700" />
                              </button>

                              <span className="px-4 py-1 font-bold text-gray-900 text-center min-w-[48px]">
                                {n.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(n.productId, n.quantity + 1)
                                }
                                className="p-1.5 hover:bg-white rounded transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-4 h-4 text-gray-700" />
                              </button>
                            </div>

                            {/* Item Total */}
                            <div className="ml-auto text-right">
                              <p className="text-xs text-gray-500 mb-1">
                                Subtotal
                              </p>
                              <p className="text-lg md:text-xl font-bold text-purple-600">
                                ₹{itemTotal.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(n.productId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 sm:p-12 text-center">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-semibold text-gray-600 mb-2">
                  Your cart is empty
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Add some products to get started!
                </p>
                <button
                  onClick={() => navigate("/products")}
                  className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>

          {/* Delivery Address Section */}
          {Array.isArray(cartItems) && cartItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6 mt-4 md:mt-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <h2 className="text-lg md:text-2xl font-semibold text-gray-900">
                  Delivery Address
                </h2>
              </div>

              {addresses.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddressId(address._id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedAddressId === address._id
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center flex-shrink-0 ${
                            selectedAddressId === address._id
                              ? "border-purple-600 bg-purple-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAddressId === address._id && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                              {address.label || "Address"}
                            </h3>
                            {address.isDefault && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                                Default
                              </span>
                            )}
                          </div>

                          <p className="text-xs md:text-sm text-gray-600">
                            {address.recipientName}
                          </p>
                          <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                            {address.addressLine}
                          </p>
                          {address.landmark && (
                            <p className="text-xs md:text-sm text-gray-600">
                              Landmark: {address.landmark}
                            </p>
                          )}
                          <p className="text-xs md:text-sm text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-xs md:text-sm text-gray-600">
                            📞 {address.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs md:text-sm text-gray-600 mb-4">
                  No addresses found. Please add a delivery address.
                </p>
              )}

              {!showAddressForm ? (
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="w-full py-3 border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Plus className="w-5 h-5" /> Add New Address
                </button>
              ) : (
                <form
                  onSubmit={handleAddAddress}
                  className="space-y-3 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                      Add New Address
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        resetAddressForm();
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Label (Home, Office, etc.)"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Recipient Name *"
                    value={formData.recipientName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        recipientName: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  />

                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  />

                  <textarea
                    placeholder="Address Line *"
                    value={formData.addressLine}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        addressLine: e.target.value,
                      }))
                    }
                    required
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  />

                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={formData.landmark}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        landmark: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="City *"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      required
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs md:text-sm"
                    />
                    <input
                      type="text"
                      placeholder="State *"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      required
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs md:text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Pincode *"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pincode: e.target.value,
                        }))
                      }
                      required
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs md:text-sm"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs md:text-sm">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isDefault: e.target.checked,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">
                      Set as default address
                    </span>
                  </label>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(false);
                        resetAddressForm();
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-xs md:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addingAddress}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-all text-xs md:text-sm"
                    >
                      {addingAddress ? "Adding..." : "Add Address"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right: Order Summary - Sticky on Desktop */}
        {Array.isArray(cartItems) && cartItems.length > 0 && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-20 md:top-24">
              {/* Summary Header - Collapsible on Mobile */}
              <button
                onClick={() => setExpandedSummary(!expandedSummary)}
                className="w-full flex items-center justify-between p-4 sm:p-5 md:p-6 hover:bg-gray-50 transition-colors lg:cursor-default lg:pointer-events-none"
              >
                <h2 className="text-lg md:text-xl font-bold text-gray-900">
                  Order Summary
                </h2>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform lg:hidden ${
                    expandedSummary ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Summary Content */}
              <div
                className={`px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6 space-y-4 border-t border-gray-100 lg:block ${
                  expandedSummary ? "block" : "hidden"
                }`}
              >
                {/* Cart Items Breakdown */}
                <div className="space-y-2 pb-4 border-b border-gray-100">
                  <p className="text-xs md:text-sm text-gray-600">
                    Items ({cartItems.length})
                  </p>
                  <div className="space-y-1">
                    {cartItems.map((rawItem) => {
                      const n = normalizeItem(rawItem);
                      const itemTotal = n.price * n.quantity;
                      return (
                        <div
                          key={n.productId}
                          className="flex items-center justify-between text-xs md:text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-700 line-clamp-1">
                              {n.name}
                            </p>
                            <p className="text-gray-500 text-xs">
                              x{n.quantity}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900 ml-2 flex-shrink-0">
                            ₹{itemTotal.toLocaleString("en-IN")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pb-4 border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold text-gray-900">₹0</span>
                  </div>
                </div>

                {/* Total - Highlighted */}
                <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-xs text-purple-600 mb-2 uppercase font-semibold tracking-wide">
                    Total Amount
                  </p>
                  <p className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    ₹{total.toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                  >
                    <option value="cod">Cash on Delivery</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500 italic">
                    💸 Pay when your order arrives
                  </p>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    isPlacingOrder || cartItems.length === 0 || !selectedAddressId
                  }
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all text-sm md:text-base shadow-lg hover:shadow-xl"
                >
                  {isPlacingOrder ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Placing Order...
                    </span>
                  ) : (
                    "Place Order"
                  )}
                </button>

                {!selectedAddressId && (
                  <p className="text-xs text-red-600 text-center font-medium">
                    ⚠️ Please select a delivery address
                  </p>
                )}

                <p className="text-xs text-gray-500 text-center">
                  By placing an order, you agree to our<br />
                  <span className="text-gray-400">terms and conditions</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
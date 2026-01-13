// src/pages/ServiceDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../config/api";
import LoadingSpinner from "../components/LoadingSpinner";
import BookingModal from "../components/BookingModal";
import AuthModal from "../components/AuthModal";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { Star, Clock, ArrowLeft } from "lucide-react";

// 🎥 Helper to convert YouTube link to embed URL
const getYouTubeEmbed = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host.includes("youtube.com") || host.includes("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.includes("/embed/")) return url;
      if (u.pathname.includes("/shorts/")) {
        const id = u.pathname.split("/").pop();
        return `https://www.youtube.com/embed/${id}`;
      }
    }
  } catch {}
  return null;
};

// ⭐️ Star rating renderer
const StarRating = ({ value }) => (
  <div className="flex items-center gap-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`w-5 h-5 ${value >= i ? "text-yellow-400" : "text-gray-300"}`} />
    ))}
  </div>
);

const FILTERS = [
  { label: "All 5★", value: "very-positive" },
  { label: "Avg / Mixed", value: "average" },
  { label: "Others", value: "others" }
];

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  // review UI
  const [reviewFilter, setReviewFilter] = useState("very-positive");
  const [showAllReviews, setShowAllReviews] = useState(false);

  // pending action state so we can resume after auth (OTP)
  const [pendingBookRequest, setPendingBookRequest] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchService = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/services/${id}`);
        if (!mounted) return;
        setService(res.data?.service || res.data);
      } catch (err) {
        console.error("Service fetch error", err);
        toast.error("Failed to load service");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const res = await api.get(`/services/${id}/reviews?page=1&limit=50`);
        if (!mounted) return;
        setReviews(res.data.reviews || res.data || []);
      } catch (err) {
        console.info("Reviews fetch error", err?.response?.status || err);
        if (!mounted) return;
        setReviews([]);
      }
    };

    fetchService();
    fetchReviews();

    return () => { mounted = false; };
  }, [id]);

  // listen for auth success (AuthModal should dispatch an 'authSuccess' CustomEvent)
  useEffect(() => {
    const handler = (e) => {
      // AuthModal in your app should dispatch new CustomEvent('authSuccess') on successful OTP login.
      // Accept both event types: e.type or e.detail for flexibility.
      const ok = e?.type === "authSuccess" || e?.detail === "authSuccess";
      if (ok) {
        setAuthModalOpen(false);
        // If user had requested booking before login, open booking modal now
        if (pendingBookRequest) {
          setPendingBookRequest(false);
          setBookingOpen(true);
        }
        // refresh user-specific data if needed (reviews auth, etc)
      }
    };
    window.addEventListener("authSuccess", handler);
    return () => window.removeEventListener("authSuccess", handler);
  }, [pendingBookRequest]);

  useEffect(() => {
    if (reviews.length > 0) {
      const avg =
        reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) /
        reviews.length;
      setAvgRating(Math.round(avg * 10) / 10);
    } else setAvgRating(0);
  }, [reviews]);

  if (loading || !service) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LoadingSpinner />
      </div>
    );
  }

  // Price / discount calculations
  const rawPrice = Number(service.price || 0);
  const discountPct = Number(service.discount || 0);
  const discountedPrice = discountPct > 0
    ? +(rawPrice * (1 - discountPct / 100)).toFixed(2)
    : rawPrice;
  const savings = Math.max(0, rawPrice - discountedPrice);

  // Indian currency formatting (readable for older users)
  const formatPrice = (num, showDecimals = false) => {
    if (num === undefined || num === null) return "—";
    return num.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    });
  };

  const ytUrl = getYouTubeEmbed(service.videoUrl);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // open auth modal for OTP
      setAuthModalOpen(true);
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    setSubmittingReview(true);
    try {
      await api.post(`/services/${id}/reviews`, { rating, comment });
      toast.success("Review posted successfully");
      setComment("");
      setRating(5);
      // reload reviews
      const r = await api.get(`/services/${id}/reviews?page=1&limit=50`);
      setReviews(r.data.reviews || r.data || []);
    } catch (err) {
      console.error("submit review err", err);
      toast.error(err.response?.data?.message || "Failed to post review");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Book handler — now opens AuthModal OTP when not authed and resumes booking on success
  const handleBookClick = () => {
    if (!isAuthenticated) {
      setPendingBookRequest(true);
      setAuthModalOpen(true);
      return;
    }
    setBookingOpen(true);
  };

  // filtering logic
  const filterReviews = (list, filter) => {
    if (!list || list.length === 0) return [];
    if (filter === "very-positive") return list.filter(r => Number(r.rating) === 5);
    if (filter === "average") return list.filter(r => Number(r.rating) === 3);
    return list; // "others" -> return all
  };

  const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filteredReviews = filterReviews(sortedReviews, reviewFilter);
  const displayReviews = showAllReviews ? filteredReviews : filteredReviews.slice(0, 5);

  // Accessible, large CTA for older users
  const bookingButtonClass = "w-full text-lg md:text-base py-3 md:py-3 rounded-lg font-semibold shadow focus:ring-4 focus:ring-pink-200 transition";

  return (
    <div className="max-w-3xl md:max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate("/services")}
        className="flex items-center gap-2 text-gray-800 hover:text-pink-600 font-medium mb-2"
        aria-label="Back to services"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm md:text-base">Back to Services</span>
      </button>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        {/* Always show image (prominent). Video (if any) shown in its own clear section below */}
        <div className="relative w-full h-64 md:h-80">
          <img
            src={service.image || "/placeholder-600x400.png"}
            alt={service.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/800x600?text=No+Image"; }}
          />

          {/* Price panel: large, high-contrast for readability */}
          <div className="absolute bottom-4 left-4 bg-white/95 rounded-xl px-4 py-3 shadow flex items-center gap-4">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-rose-600 leading-none">
                {formatPrice(discountedPrice)}
              </div>
              {discountPct > 0 ? (
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-sm line-through text-gray-500">{formatPrice(rawPrice)}</div>
                  <div className="px-2 py-1 bg-emerald-100 text-emerald-800 text-sm rounded font-semibold">
                    Save {formatPrice(savings)} • {discountPct}% off
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600 mt-1">Inclusive of taxes</div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 space-y-4">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{service.name}</h1>

          <div className="flex items-center gap-3 flex-wrap">
            <Star className="w-5 h-5 text-yellow-400" />
            <div className="font-semibold text-gray-800">{avgRating || "0.0"}</div>
            <div className="text-sm text-gray-500">({reviews.length} reviews)</div>

            <div className="flex items-center gap-2 text-gray-700 ml-2">
              <Clock className="w-4 h-4 text-pink-500" />
              <div className="text-sm">{service.duration} mins</div>
            </div>

            {service.category && (
              <div className="ml-auto">
                <span className="px-3 py-1 text-sm bg-gray-100 rounded-full text-gray-800">{service.category}</span>
              </div>
            )}
          </div>

          <p className="text-gray-700 text-sm leading-relaxed md:text-base">
            {service.description || "No description available."}
          </p>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <button
              onClick={handleBookClick}
              className={`${bookingButtonClass} bg-gradient-to-r from-pink-600 to-rose-600 text-white`}
            >
              Book Appointment
            </button>

            <button
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
              className={`${bookingButtonClass} border border-gray-200 bg-white text-gray-900`}
            >
              Read Reviews
            </button>
          </div>
        </div>
      </div>

      {/* Video (if present) - shown after hero image so the image remains primary */}
      {ytUrl && (
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Watch: Service Demo</h3>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              title="service-video"
              className="w-full h-full"
              src={ytUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
            <p className="text-sm text-gray-500">Real feedback from our customers</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Average</div>
            <div className="text-lg font-bold">{avgRating || "0.0"}</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mt-2 mb-2">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => { setReviewFilter(f.value); setShowAllReviews(false); }}
              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                reviewFilter === f.value ? "bg-pink-600 text-white shadow" : "bg-gray-100 text-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredReviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet for this filter.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-100">
              {displayReviews.map(r => (
                <li key={r._id} className="py-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 text-white flex items-center justify-center font-semibold text-lg">
                      {(r.user?.name || "U")[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="font-medium text-gray-800">{r.user?.name || "User"}</p>
                          <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating value={r.rating} />
                          <div className="text-sm font-semibold text-gray-700">{r.rating}</div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm mt-2">{r.comment}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {filteredReviews.length > 5 && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={() => setShowAllReviews(prev => !prev)}
                  className="px-5 py-2 rounded-md bg-white border text-pink-600 font-semibold hover:bg-pink-600 hover:text-white transition"
                >
                  {showAllReviews ? "Show Top 5" : `Show All (${filteredReviews.length})`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Leave a review */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="font-semibold mb-2">Leave a Review</h4>
          {!isAuthenticated ? (
            <div className="text-sm text-gray-600">
              Please{" "}
              <button onClick={() => setAuthModalOpen(true)} className="text-pink-600 font-semibold underline">
                login
              </button>{" "}
              to leave a review.
            </div>
          ) : (
            <form onSubmit={submitReview} className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700">Your rating:</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="px-3 py-2 border border-gray-200 rounded">
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-700">Comment</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} className="w-full mt-2 px-3 py-2 border border-gray-200 rounded focus:outline-none" placeholder="Share your experience..." />
              </div>

              <div className="flex gap-2">
                <button type="submit" disabled={submittingReview} className="px-4 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded font-semibold disabled:opacity-60">
                  {submittingReview ? "Posting..." : "Post review"}
                </button>
                <button type="button" onClick={() => { setComment(""); setRating(5); }} className="px-4 py-2 border rounded text-gray-700">Reset</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingOpen && <BookingModal service={service} onClose={() => setBookingOpen(false)} />}

      {/* Auth Modal (OTP) — uses your central AuthModal component */}
      <AuthModal isOpen={authModalOpen} onClose={() => { setAuthModalOpen(false); setPendingBookRequest(false); }} />
    </div>
  );
};

export default ServiceDetail;

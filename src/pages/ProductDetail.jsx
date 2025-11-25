


// src/pages/ProductDetail.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../config/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthModal from '../components/AuthModal';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Star, ArrowLeft, Loader } from 'lucide-react';

const getYouTubeEmbed = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (host.includes('youtu.be')) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    if (host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.includes('/embed/')) return url;
      if (u.pathname.includes('/shorts/')) {
        const id = u.pathname.split('/').pop();
        return `https://www.youtube.com/embed/${id}`;
      }
    }
  } catch {}
  return null;
};

const formatINR = (num) =>
  Number(num ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const SmallSimilarCard = ({ s, onAdd, onView, adding }) => {
  const rawPrice = Number(s.price || 0);
  const discount = Number(s.discount || 0);
  const discounted = discount > 0 ? Math.round(rawPrice * (1 - discount / 100)) : rawPrice;

  return (
    <div className="w-56 bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden flex-shrink-0">
      <div className="h-32 bg-gray-100 overflow-hidden">
        <img src={s.image || '/placeholder.jpg'} alt={s.name} className="w-full h-full object-cover" onError={(e)=>e.currentTarget.src='https://via.placeholder.com/400x300?text=Product'} />
      </div>
      <div className="p-3">
        <div className="text-sm font-medium line-clamp-2">{s.name}</div>
        <div className="flex items-baseline gap-2 mt-1">
          <div className="text-sm font-semibold text-rose-600">{formatINR(discounted)}</div>
          {discount > 0 && <div className="text-xs line-through text-gray-400">{formatINR(rawPrice)}</div>}
        </div>
        <div className="mt-3 flex gap-2">
          <button disabled={adding} onClick={() => onAdd(s)} className="flex-1 text-xs py-2 rounded bg-gray-100 font-semibold">
            {adding ? (<><Loader className="w-4 h-4 animate-spin inline-block mr-2" />Adding</>) : 'Add'}
          </button>
          <button onClick={() => onView(s)} className="flex-1 text-xs py-2 rounded bg-blue-600 text-white font-semibold">
            View
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [authOpen, setAuthOpen] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [postingReview, setPostingReview] = useState(false);

  // action states
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [similarAddingMap, setSimilarAddingMap] = useState({});

  const similarRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/products/${id}`);
        const body = res.data || {};
        // support a couple of shapes
        const p = body.data || body.product || body;
        if (!mounted) return;
        setProduct(p);
      } catch (err) {
        console.error('Product fetch err', err);
        toast.error('Failed to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const r = await api.get(`/products/${id}/reviews?page=1&limit=50`);
        if (!mounted) return;
        setReviews(r.data.reviews || r.data || []);
      } catch (err) {
        console.info('No reviews or endpoint missing', err?.response?.status);
        if (!mounted) return;
        setReviews([]);
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    };

    fetchProduct();
    fetchReviews();

    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    // fetch similar products (improved layout)
    const fetchSimilar = async () => {
      if (!product?.category) return setSimilar([]);
      try {
        const res = await api.get(`/products?page=1&limit=30`);
        const all = res.data?.data?.products || res.data?.products || [];
        const filtered = all.filter(p => p._id !== product._id && p.category === product.category).slice(0, 8);
        setSimilar(filtered);
      } catch (err) {
        console.error('Similar fetch err', err);
        setSimilar([]);
      }
    };
    fetchSimilar();
  }, [product]);

  const rawPrice = Number(product?.price || 0);
  const discount = Number(product?.discount || 0);
  const discountedPrice = discount > 0 ? +(rawPrice * (1 - discount / 100)).toFixed(0) : rawPrice;
  const yt = getYouTubeEmbed(product?.videoUrl);

  const handleAddToCart = async (qty = 1) => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    if (!product) return;
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error('Out of stock');
      return;
    }

    try {
      setAdding(true);
      // use your cart API
      addItem(
        { _id: product._id, name: product.name, price: discountedPrice, image: product.image },
        qty
      );
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success(`${product.name} added to cart`);
      // encourage add-ons — scroll to similar
      setTimeout(() => similarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350);
    } catch (err) {
      console.error('Add to cart err', err);
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    if (!product) return;
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error('Out of stock');
      return;
    }

    try {
      setBuying(true);
      addItem({ _id: product._id, name: product.name, price: discountedPrice, image: product.image }, 1);
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Added to cart — redirecting to checkout');
      setTimeout(() => navigate('/cart'), 350);
    } catch (err) {
      console.error('Buy now err', err);
      toast.error('Failed to proceed');
    } finally {
      setBuying(false);
    }
  };

  const handleAddSimilar = async (s) => {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    try {
      setSimilarAddingMap(prev => ({ ...prev, [s._id]: true }));
      addItem({ _id: s._id, name: s.name, price: (s.discount && s.discount>0 ? Math.round(s.price * (1 - s.discount/100)) : s.price), image: s.image }, 1);
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success(`${s.name} added to cart`);
    } catch (err) {
      console.error('Add similar err', err);
      toast.error('Failed to add item');
    } finally {
      setTimeout(() => setSimilarAddingMap(prev => ({ ...prev, [s._id]: false })), 400);
    }
  };

  const handleViewSimilar = (s) => {
    navigate(`/products/${s._id}`);
    window.scrollTo(0,0);
  };

  const postReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    setPostingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      toast.success('Review posted');
      setComment('');
      setRating(5);
      const r = await api.get(`/products/${id}/reviews?page=1&limit=50`);
      setReviews(r.data.reviews || r.data || []);
    } catch (err) {
      console.error('post review err', err);
      toast.error(err?.response?.data?.message || 'Failed to post review');
    } finally {
      setPostingReview(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-gray-800 hover:text-blue-600 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to products
      </button>

      {/* Product card */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 w-full bg-gray-100 h-64 md:h-auto overflow-hidden">
            <img src={product.image || '/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" onError={(e)=>e.currentTarget.src='https://via.placeholder.com/800x600?text=No+Image'} />
          </div>

          <div className="md:w-1/2 w-full p-5 flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
              <p className="text-sm text-gray-500 mt-1 line-clamp-3">{product.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-3xl font-extrabold text-rose-600">{formatINR(discountedPrice)}</div>
              {discount > 0 && (
                <>
                  <div className="text-sm line-through text-gray-400">{formatINR(rawPrice)}</div>
                  <div className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs font-semibold">{discount}% off</div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div>Category: <span className="font-medium capitalize">{product.category}</span></div>
          
              <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400" /> <span className="font-semibold">{(reviews.length ? (reviews.reduce((s,r)=>s+(Number(r.rating)||0),0)/reviews.length).toFixed(1) : '0.0')}</span></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
              <button onClick={handleBuyNow} disabled={buying} className={`w-full py-3 rounded-lg text-white font-semibold ${buying ? 'bg-blue-400 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-[1.01]'}`}>
                {buying ? (<><Loader className="w-4 h-4 animate-spin inline-block mr-2" /> Redirecting...</>) : 'Buy Now'}
              </button>
              <button onClick={() => handleAddToCart(1)} disabled={adding} className={`w-full py-3 rounded-lg border ${adding ? 'bg-gray-100 cursor-wait' : 'bg-white hover:bg-gray-50'}`}>
                {adding ? (<><Loader className="w-4 h-4 animate-spin inline-block mr-2" /> Adding...</>) : 'Add to cart'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video */}
      {yt && (
        <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
          <h3 className="text-lg font-semibold mb-3">Product video</h3>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe title="product-video" className="w-full h-full" src={yt} allowFullScreen loading="lazy" />
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Customer reviews</h3>
          <div className="text-sm text-gray-500">{reviews.length} reviews</div>
        </div>

        {reviewsLoading ? (
          <div className="py-6"><LoadingSpinner /></div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-gray-500">No reviews yet — be the first to review.</div>
        ) : (
          <ul className="space-y-3">
            {reviews.map(r => (
              <li key={r._id} className="p-3 bg-gray-50 rounded border border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-white flex items-center justify-center font-semibold">
                    {(r.user?.name || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.user?.name || 'User'}</div>
                        <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="font-semibold text-gray-700">{r.rating}★</div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* leave a review */}
        <div className="pt-3 border-t border-gray-100">
          {!isAuthenticated ? (
            <div className="text-sm text-gray-600">
              Please <button onClick={() => setAuthOpen(true)} className="text-blue-600 font-semibold underline">login</button> to leave a review.
            </div>
          ) : (
            <form onSubmit={postReview} className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm">Your rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="px-2 py-1 border rounded">
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Write your review..." className="w-full px-3 py-2 border rounded" />
              <div className="flex gap-2">
                <button type="submit" disabled={postingReview} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {postingReview ? (<><Loader className="w-4 h-4 animate-spin inline-block mr-2" />Posting...</>) : 'Post review'}
                </button>
                <button type="button" onClick={() => { setComment(''); setRating(5); }} className="px-4 py-2 border rounded">Reset</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Similar products carousel */}
      <div ref={similarRef} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Similar products</h3>
          <div className="text-sm text-gray-500">You may also like</div>
        </div>

        {similar.length === 0 ? (
          <div className="text-sm text-gray-500">No similar products found.</div>
        ) : (
          <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide">
            {similar.map(s => (
              <SmallSimilarCard
                key={s._id}
                s={s}
                adding={!!similarAddingMap[s._id]}
                onAdd={handleAddSimilar}
                onView={handleViewSimilar}
              />
            ))}
          </div>
        )}
      </div>

      {/* auth modal */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
};

export default ProductDetail;

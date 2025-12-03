import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronLeft, Heart, ShoppingCart, Truck } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  doc,
  getDoc,
  query,
  where,
  getDocs,
  collection,
} from 'firebase/firestore';
import { db } from '../../../firebase';

export default function MegaComboBanner({ title = 'Mega Combo Packs', limit = 20 }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollerRef = useRef(null);
  const params = new URLSearchParams(location.search);
  const categoryQuery = params.get("category"); 
  const priceQuery = params.get("price");      

  const getCategoryId = async (name) => {
    const q = query(
      collection(db, "categories"),
      where("name", "==", name)
    );

    const snap = await getDocs(q);
    if (snap.empty) return null;

    return snap.docs[0].id;
  };

  // -----------------------------------------------------
  // 3️⃣ Fetch products of category safely
  // -----------------------------------------------------
  const getCategoryProducts = async (categoryId) => {
    const q = query(
      collection(db, "products"),
      where("categoryId", "==", categoryId)
    );

    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      if (!categoryQuery) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const categoryId = await getCategoryId(categoryQuery);
      if (!categoryId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      let fetchedProducts = await getCategoryProducts(categoryId);

      // Apply price filter if exists
      if (priceQuery) {
        const priceNum = Number(priceQuery);
        fetchedProducts = fetchedProducts.filter((p) => {
          const price =
            p.variants?.[0]?.discountPrice ??
            p.variants?.[0]?.price ??
            p.price ??
            0;

          return price <= priceNum;
        });
      }

      setProducts(fetchedProducts.slice(0, limit));
      setLoading(false);
    };

    load();
  }, [categoryQuery, priceQuery]);

  const scrollBy = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = 260; 
    el.scrollBy({ left: cardWidth * dir, behavior: "smooth" });
  };

  const goToProduct = (id) => navigate(`/product/${id}`);

  if (loading)
    return <div className="text-center py-10">Loading combos…</div>;

  return (
    <section className="w-full p-6 max-w-7xl mx-auto">
      <style>{`
        .mc-card:hover img { transform: scale(1.05); }
        .mega-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="relative mega-banner bg-gradient-to-br from-[#57ba40] via-[#4fa838] to-[#43942f] p-6 md:p-8 shadow-2xl rounded-3xl">

        {/* Header */}
        <div className="flex items-center justify-between text-white mb-4">
          <div>
            <h3 className="text-4xl font-extrabold">{title}</h3>
            <p className="opacity-90">Swipe to explore the best combos.</p>
          </div>

          {/* <div className="flex gap-3">
            <button onClick={() => scrollBy(-1)} className="bg-white/90 p-3 rounded-full shadow">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scrollBy(1)} className="bg-white/90 p-3 rounded-full shadow">
              <ChevronRight size={18} />
            </button>
          </div> */}
        </div>

        {/* Product Slider */}
        <div ref={scrollerRef} className="mega-scroll flex gap-4 overflow-x-auto py-2 snap-x snap-mandatory">

          {products.length === 0 && (
            <div className="text-white/80 py-10 px-4">
             Coming Soon.......
            </div>
          )}

          {products.map((p) => {
            const price =
              p.variants?.[0]?.discountPrice ??
              p.variants?.[0]?.price ??
              p.price ??
              0;

            return (
              <div
                key={p.id}
                className="mc-card min-w-[240px] max-w-[260px] bg-white rounded-2xl p-4 shadow-xl cursor-pointer transition"
              >
                <div onClick={() => goToProduct(p.id)}>
                  <img
                    src={p.images?.[0]}
                    className="w-full h-40 object-contain rounded-xl"
                  />

                  <h4 className="font-semibold mt-3 line-clamp-2">{p.name}</h4>

                  <div className="mt-2">
                    <div className="text-xl font-bold">₹{price}</div>
                  </div>
                </div>

                <button
                  onClick={() => goToProduct(p.id)}
                  className="w-full mt-3 bg-[#57ba40] text-white py-2 rounded-lg font-semibold"
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

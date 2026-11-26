import { useState } from "react";
import { useQuery } from "react-query";
import { menuAPI, feedbackAPI } from "../services/api";
import { useCart } from "../contexts/CartContext";
import { useScrollLock } from "../hooks/useScrollLock";
import logoImg from "../assets/logo.png";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  PlusIcon,
  PencilIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import RatingModal from "../components/orders/RatingModal";
import ReviewsList from "../components/reviews/ReviewsList";
import toast from "react-hot-toast";

const Menu = () => {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    dietary: "",
    priceRange: "",
    sortBy: "name",
    sortOrder: "asc",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState(null);
  const { addItem } = useCart();

  const buildQueryParams = (values) => {
    const params = {
      search: values.search || undefined,
      category: values.category || undefined,
      sortBy: values.sortBy || "name",
      sortOrder: values.sortOrder || "asc",
    };

    if (values.dietary) {
      params.dietary = values.dietary;
    }

    if (values.priceRange) {
      const [min, max] = values.priceRange.split("-");
      if (min) params.priceMin = min;
      if (max) params.priceMax = max;
    }

    return params;
  };

  const {
    data: menuData,
    isLoading,
    error,
  } = useQuery(
    ["menu", filters],
    () => menuAPI.getMenu(buildQueryParams(filters)),
    {
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  );

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = (menuItem, customization = []) => {
    addItem(menuItem, 1, customization);
    toast.success("Added to cart", {
      icon: "🛒",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff",
      },
    });
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      await feedbackAPI.submitMenuItemFeedback(
        reviewingItem._id,
        reviewData.rating,
        reviewData.comment,
      );
      toast.success("Review submitted successfully!");
      setReviewModalOpen(false);
      setReviewingItem(null);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to submit review";
      const errorDetail = error.response?.data?.error || "";
      toast.error(message + (errorDetail ? `: ${errorDetail}` : ""));
      console.error(error);
    }
  };

  const openReviewModal = (item) => {
    setReviewingItem(item);
    setReviewModalOpen(true);
  };

  const openModal = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  const categories = [
    { value: "", label: "All Categories" },
    { value: "appetizers", label: "Appetizers" },
    { value: "main-course", label: "Main Course" },
    { value: "desserts", label: "Desserts" },
    { value: "beverages", label: "Beverages" },
    { value: "salads", label: "Salads" },
    { value: "soups", label: "Soups" },
    { value: "specials", label: "Specials" },
  ];

  const dietaryOptions = [
    { value: "", label: "All Dietary" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "gluten-free", label: "Gluten-Free" },
  ];

  const priceRanges = [
    { value: "", label: "All Prices" },
    { value: "0-200", label: "Under ₹200" },
    { value: "200-500", label: "₹200 - ₹500" },
    { value: "500-1000", label: "₹500 - ₹1000" },
    { value: "1000-", label: "Above ₹1000" },
  ];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl text-dark-slate">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 font-heading text-red-400">
            Error Loading Menu
          </h2>
          <p className="text-gray-400">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center space-x-2 mb-4 px-4 py-2 glass-panel rounded-full border border-warm-gold/30">
            <img src={logoImg} alt="Garden Grains" className="w-8 h-8 animate-bounce object-contain" />
            <span className="text-sm font-medium text-warm-gold uppercase tracking-widest">100% Pure Vegetarian</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-dark-slate mb-4 font-heading">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-gold to-organic-green">Menu</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
            Discover our carefully crafted selection of fresh, healthy, and
            delicious vegetarian meals made with organic ingredients.
          </p>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-slide-up">
          {[
            { label: "🌿 All", value: "" },
            { label: "🥗 Starters", value: "appetizers" },
            { label: "🍛 Main Course", value: "main-course" },
            { label: "🍰 Desserts", value: "desserts" },
            { label: "🥤 Beverages", value: "beverages" },
            { label: "🥙 Salads", value: "salads" },
            { label: "🍲 Soups", value: "soups" },
            { label: "⭐ Specials", value: "specials" },
          ].map((c) => (
            <button
              key={c.value || "all"}
              onClick={() => handleFilterChange("category", c.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                filters.category === c.value 
                  ? "bg-warm-gold text-deep-black border-warm-gold shadow-soft-gold transform scale-105" 
                  : "bg-dark-slate/5 text-gray-600 border-dark-slate/10 hover:bg-dark-slate/10 hover:border-warm-gold/50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="glass-panel rounded-2xl p-6 mb-8 border border-dark-slate/10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-warm-gold transition-colors" />
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-pearl/50 border border-dark-slate/10 rounded-xl text-dark-slate placeholder-gray-500 focus:outline-none focus:border-warm-gold/50 focus:ring-1 focus:ring-warm-gold/50 transition-all"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-dark-slate/10 rounded-xl text-gray-600 hover:bg-dark-slate/5 hover:text-warm-gold hover:border-warm-gold/30 transition-all duration-200"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-dark-slate/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full px-3 py-2 bg-pearl/50 border border-dark-slate/10 rounded-xl text-dark-slate focus:outline-none focus:border-warm-gold/50"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value} className="bg-pearl text-dark-slate">
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dietary Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Dietary</label>
                <select
                  value={filters.dietary}
                  onChange={(e) => handleFilterChange("dietary", e.target.value)}
                  className="w-full px-3 py-2 bg-pearl/50 border border-dark-slate/10 rounded-xl text-dark-slate focus:outline-none focus:border-warm-gold/50"
                >
                  {dietaryOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-pearl text-dark-slate">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange("priceRange", e.target.value)}
                  className="w-full px-3 py-2 bg-pearl/50 border border-dark-slate/10 rounded-xl text-dark-slate focus:outline-none focus:border-warm-gold/50"
                >
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value} className="bg-pearl text-dark-slate">
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    handleFilterChange("sortBy", sortBy);
                    handleFilterChange("sortOrder", sortOrder);
                  }}
                  className="w-full px-3 py-2 bg-pearl/50 border border-dark-slate/10 rounded-xl text-dark-slate focus:outline-none focus:border-warm-gold/50"
                >
                  <option value="name-asc" className="bg-pearl text-dark-slate">Name A-Z</option>
                  <option value="name-desc" className="bg-pearl text-dark-slate">Name Z-A</option>
                  <option value="price-asc" className="bg-pearl text-dark-slate">Price Low-High</option>
                  <option value="price-desc" className="bg-pearl text-dark-slate">Price High-Low</option>
                  <option value="ratings.average-desc" className="bg-pearl text-dark-slate">Rating High-Low</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        {isLoading && !menuData?.data?.menuItems?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="glass-panel h-96 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-400 text-sm">
                Showing <span className="text-dark-slate font-bold">{menuData?.data?.menuItems?.length || 0}</span> items
              </p>
            </div>

            {menuData?.data?.menuItems?.length === 0 ? (
              <div className="text-center py-20 glass-panel rounded-2xl border border-dark-slate/5">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-dark-slate mb-2 font-heading">
                  No items found
                </h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      search: "",
                      category: "",
                      dietary: "",
                      priceRange: "",
                      sortBy: "name",
                      sortOrder: "asc",
                    })
                  }
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {menuData?.data?.menuItems?.map((item) => (
                  <div
                    key={item._id}
                    className="glass-panel rounded-2xl overflow-hidden group border border-dark-slate/5 hover:border-warm-gold/30 transition-all duration-300 hover:shadow-soft-gold"
                    onClick={() => openModal(item)}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={item.images?.[0]?.url || "/api/placeholder/300/200"}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-pearl via-transparent to-transparent opacity-80"></div>
                      
                      <div className="absolute top-4 right-4">
                        <div className="bg-pearl/80 backdrop-blur-md rounded-full px-3 py-1 flex items-center space-x-1 border border-warm-gold/30">
                          <StarSolidIcon className="h-3 w-3 text-warm-gold" />
                          <span className="text-xs font-bold text-dark-slate">
                            {item.ratings.average.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      {item.isPopular && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-warm-gold text-deep-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                            Popular
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 relative">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-dark-slate group-hover:text-warm-gold transition-colors font-heading">
                          {item.name}
                        </h3>
                        <span className="text-2xl font-bold text-organic-green">
                          ₹{item.price}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 mb-4 text-sm line-clamp-2">
                        {item.description}
                      </p>

                      {/* Dietary Info */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.dietaryInfo.isVegetarian && (
                          <span className="text-[10px] bg-organic-green/10 text-organic-green px-2 py-0.5 rounded border border-organic-green/20">Veg</span>
                        )}
                        {item.dietaryInfo.isVegan && (
                          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">Vegan</span>
                        )}
                        {item.dietaryInfo.isGlutenFree && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">GF</span>
                        )}
                        {item.dietaryInfo.isSpicy && (
                          <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">Spicy</span>
                        )}
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item);
                          }}
                          className="flex-1 btn-primary py-2 text-sm flex items-center justify-center space-x-2 group/btn"
                        >
                          <PlusIcon className="h-4 w-4 group-hover/btn:scale-125 transition-transform" />
                          <span>Add</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openReviewModal(item);
                          }}
                          className="px-3 py-2 border border-dark-slate/20 rounded-xl text-gray-400 hover:text-dark-slate hover:bg-dark-slate/10 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {/* Modal */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          onClose={closeModal}
          onAdd={handleAddToCart}
          onReview={openReviewModal}
        />
      )}

      {/* Review Modal */}
      <RatingModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setReviewingItem(null);
        }}
        onSubmit={handleReviewSubmit}
        menuItem={reviewingItem}
      />
    </div>
  );
};

export default Menu;

// Modal for menu item details
const MenuItemModal = ({ item, onClose, onAdd, onReview }) => {
  useScrollLock(!!item);
  if (!item) return null;

  const [showReviews, setShowReviews] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState([]);

  const toggleAddOn = (addon) => {
    if (selectedAddOns.find((a) => a.name === addon.name)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.name !== addon.name));
    } else {
      setSelectedAddOns([...selectedAddOns, addon]);
    }
  };

  const handleAddToCart = () => {
    let customization = [];
    if (selectedAddOns.length > 0) {
      customization = [
        {
          optionName: "Add-ons",
          selectedChoices: selectedAddOns.map((addon) => ({
            name: addon.name,
            price: addon.price,
          })),
        },
      ];
    }
    onAdd(item, customization);
    onClose();
  };

  const currentTotal = item.price + selectedAddOns.reduce((sum, a) => sum + a.price, 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-pearl w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl border border-dark-slate/10 flex flex-col md:flex-row relative animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-dark-slate/10 text-dark-slate/70 hover:text-dark-slate hover:bg-dark-slate/20 transition-all border border-dark-slate/10 backdrop-blur-md group shadow-xl"
        >
          <XMarkIcon className="h-6 w-6 group-hover:rotate-90 transition-transform" />
        </button>

        {/* Left Side - Image (45% width on desktop) */}
        <div className="w-full md:w-[45%] h-64 md:h-full relative">
          <img
            src={item.images?.[0]?.url || "/api/placeholder/800/800"}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pearl/90 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-pearl/20"></div>
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
             {item.isPopular && (
                <span className="bg-warm-gold text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  Bestseller
                </span>
             )}
             <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-dark-slate/10 w-fit">
                <StarSolidIcon className="h-3 w-3 text-warm-gold" />
                <span className="text-dark-slate text-xs font-bold">{item.ratings.average.toFixed(1)}</span>
                <span className="text-gray-400 text-[10px]">({item.ratings.count})</span>
             </div>
          </div>
        </div>

        {/* Right Side - Content (55% width on desktop) */}
        <div className="w-full md:w-[55%] flex flex-col h-full bg-pearl relative">
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-6">
            
            {/* Header Info */}
            <div>
              <div className="flex items-start justify-between gap-4 pr-12">
                <h2 className="text-3xl md:text-4xl font-bold text-dark-slate font-heading leading-tight">
                  {item.name}
                </h2>
                <div className="text-2xl md:text-3xl font-bold text-organic-green shrink-0">
                  ₹{item.price}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {item.dietaryInfo?.isVegetarian && (
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-organic-green/10 text-organic-green border border-organic-green/20">Vegetarian</span>
                )}
                {item.dietaryInfo?.isVegan && (
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Vegan</span>
                )}
                {item.dietaryInfo?.isGlutenFree && (
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">Gluten-Free</span>
                )}
                {item.dietaryInfo?.isSpicy && (
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Spicy</span>
                )}
              </div>

              <p className="text-gray-400 mt-4 leading-relaxed text-sm md:text-base border-l-2 border-warm-gold/30 pl-4">
                {item.description}
              </p>
            </div>

            {/* Add-ons Section */}
            {item.addOns && item.addOns.length > 0 && (
              <div className="bg-dark-slate/5 rounded-2xl p-5 border border-dark-slate/5">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-warm-gold rounded-full"></span>
                  Customize Your Meal
                </h3>
                <div className="space-y-3">
                  {item.addOns.map((addon, index) => {
                    const isSelected = selectedAddOns.some((a) => a.name === addon.name);
                    return (
                      <div
                        key={index}
                        onClick={() => toggleAddOn(addon)}
                        className={`group relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? "bg-warm-gold/10 border-warm-gold shadow-[0_0_15px_-3px_rgba(212,175,55,0.3)]"
                            : "bg-black/40 border-dark-slate/10 hover:border-dark-slate/30 hover:bg-dark-slate/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                             isSelected ? "bg-warm-gold border-warm-gold" : "border-gray-500 group-hover:border-warm-gold"
                          }`}>
                             {isSelected && <CheckIcon className="w-3.5 h-3.5 text-black stroke-[3]" />}
                          </div>
                          <span className={`font-medium transition-colors ${isSelected ? "text-dark-slate" : "text-gray-400 group-hover:text-gray-200"}`}>
                            {addon.name}
                          </span>
                        </div>
                        <span className={`font-mono font-bold ${isSelected ? "text-warm-gold" : "text-gray-400"}`}>
                          +₹{addon.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews Toggle */}
            <div className="pt-2">
               <button 
                  onClick={() => setShowReviews(!showReviews)}
                  className="flex items-center justify-between w-full p-4 rounded-xl bg-dark-slate/5 hover:bg-dark-slate/10 border border-dark-slate/5 transition-all group"
               >
                  <span className="font-medium text-gray-600 group-hover:text-dark-slate">Customer Reviews</span>
                  <div className="flex items-center gap-2">
                     <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                           <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border border-black profile-placeholder"></div>
                        ))}
                     </div>
                     <span className="text-xs text-warm-gold group-hover:underline">
                        {showReviews ? "Hide" : "Show All"}
                     </span>
                  </div>
               </button>
               
               {showReviews && (
                  <div className="mt-4 animate-fade-in">
                     <ReviewsList itemId={item._id} />
                  </div>
               )}
            </div>

            {/* Spacer for scroll */}
            <div className="h-20 md:h-0"></div>
          </div>

          {/* Fixed Footer Action Area */}
          <div className="p-6 border-t border-dark-slate/10 bg-pearl/95 backdrop-blur-xl z-20 shrink-0">
             <div className="flex items-center gap-4">
                <button
                   onClick={handleAddToCart}
                   className="flex-1 btn-primary py-4 text-lg shadow-soft-gold hover:shadow-soft-gold"
                >
                   <div className="flex flex-col items-start leading-none">
                      <span className="text-[10px] opacity-80 font-normal uppercase tracking-wider">Total Amount</span>
                      <span className="font-bold">₹{currentTotal}</span>
                   </div>
                   <div className="h-6 w-px bg-black/20 mx-4"></div>
                   <div className="flex items-center gap-2 flex-1 justify-center">
                      <span>Add to Cart</span>
                      <PlusIcon className="h-5 w-5 stroke-[2.5]" />
                   </div>
                </button>
                
                <button
                    onClick={() => onReview(item)}
                    className="p-4 rounded-full border border-dark-slate/10 hover:border-warm-gold/50 hover:bg-dark-slate/5 hover:text-warm-gold transition-all text-gray-400"
                    title="Write a Review"
                >
                   <PencilIcon className="h-6 w-6" />
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

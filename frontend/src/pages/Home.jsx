import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "react-query";
import { menuAPI, feedbackAPI } from "../services/api";
import { useCart } from "../contexts/CartContext";
import Hero3D from "../components/home/Hero3D";
import logoImg from "../assets/logo.png";
import {
  StarIcon,
  ClockIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

const Home = () => {
  const { addItem } = useCart();
  const queryClient = useQueryClient();
  const [featuredItems, setFeaturedItems] = useState([]);

  // Fetch featured menu items
  const { data: menuData, isLoading } = useQuery(
    "featured-menu",
    () => menuAPI.getMenu({ isFeatured: "true", limit: 6 }),
    {
      onSuccess: (data) => {
        setFeaturedItems(data.data.menuItems);
      },
    },
  );

  // Prefetch full menu for faster navigation
  useEffect(() => {
    queryClient.prefetchQuery(
      ["menu", {
        search: "",
        category: "",
        dietary: "",
        priceRange: "",
        sortBy: "name",
        sortOrder: "asc",
      }],
      () => menuAPI.getMenu({ sortBy: "name", sortOrder: "asc" })
    );
  }, [queryClient]);

  const { data: reviewsData, isLoading: isLoadingReviews, error: reviewsError } = useQuery(
    "restaurant-reviews",
    () => feedbackAPI.getRestaurantReviews(),
    {
      select: (data) => data.data.reviews
    }
  );

  const reviews = reviewsData || [];

  const features = [
    {
      icon: ClockIcon,
      title: "Fast Service",
      description: "Fresh meals prepared and served within 15-20 minutes",
    },
    {
      icon: TruckIcon,
      title: "Free Delivery",
      description: "Complimentary delivery for orders above ₹500",
    },
    {
      icon: ShieldCheckIcon,
      title: "Quality Assured",
      description: "100% organic ingredients sourced from local farms",
    },
    {
      icon: HeartIcon,
      title: "Healthy Options",
      description: "Nutritious meals for every dietary preference",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Food Blogger",
      content:
        "The freshest ingredients and most flavorful dishes I've ever tasted. Garden Grains has become my go-to restaurant!",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Michael Chen",
      role: "Regular Customer",
      content:
        "Excellent service and amazing food. The online ordering system is so convenient and user-friendly.",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    {
      name: "Emily Rodriguez",
      role: "Health Enthusiast",
      content:
        "Finally found a restaurant that understands healthy eating without compromising on taste!",
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    },
  ];

  const handleAddToCart = (menuItem) => {
    addItem(menuItem, 1);
  };

  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* 3D Background */}
        <Hero3D />
        
        {/* Content Overlay */}
        <div className="relative z-10 text-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="inline-flex items-center space-x-3 mb-8 px-6 py-2 glass-panel rounded-full animate-fade-in border border-warm-gold/30">
            <img src={logoImg} alt="Garden Grains" className="w-8 h-8 animate-bounce object-contain" />
            <span className="text-sm font-medium text-warm-gold uppercase tracking-widest">100% Pure Vegetarian • Organic</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 font-heading text-white leading-tight animate-slide-up">
            Fresh. Pure. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-warm-gold to-organic-green">
              Plant-Powered.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto text-gray-300 leading-relaxed font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Experience farm-to-table dining with our carefully crafted menu of
            organic, nutritious, and absolutely delicious vegetarian meals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Link to="/menu" className="btn-primary group">
              <span>Order Now</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              to="/menu"
              className="btn-secondary"
            >
              View Menu
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">
              Why Choose <span className="text-warm-gold">Garden Grains</span>?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              We're committed to providing you with the best vegetarian dining experience
              through quality, service, and innovation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-panel p-8 rounded-2xl group hover:bg-white/5 transition-all duration-300 border border-white/5 hover:border-warm-gold/30">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warm-gold/20 to-transparent flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 border border-warm-gold/20">
                  <feature.icon className="h-8 w-8 text-warm-gold" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-heading">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="py-24 relative z-10">
        {/* Background glow */}
        <div className="absolute top-1/2 left-0 w-full h-full bg-gradient-to-b from-transparent via-warm-gold/5 to-transparent pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">Featured <span className="text-organic-green">Dishes</span></h2>
              <p className="text-lg text-gray-400 max-w-xl">
                Discover our most popular and highly-rated vegetarian menu items.
              </p>
            </div>
            <Link to="/menu" className="hidden md:flex items-center space-x-2 text-warm-gold hover:text-white transition-colors group">
              <span>View Full Menu</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="glass-panel h-96 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredItems.map((item) => (
                <div key={item._id} className="glass-panel rounded-2xl overflow-hidden group card-3d border border-white/5 hover:border-warm-gold/30">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.images?.[0]?.url || "/api/placeholder/400/300"}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent opacity-60"></div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-deep-black/80 backdrop-blur-md rounded-full px-3 py-1 flex items-center space-x-1 border border-warm-gold/30">
                        <StarSolidIcon className="h-3 w-3 text-warm-gold" />
                        <span className="text-xs font-bold text-white">
                          {item.ratings.average.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 relative">
                    <h3 className="text-xl font-bold text-white mb-2 font-heading group-hover:text-warm-gold transition-colors">{item.name}</h3>
                    <p className="text-gray-400 mb-6 text-sm line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-organic-green">
                        ₹{item.price}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="p-3 rounded-full bg-white/10 hover:bg-warm-gold text-white hover:text-deep-black transition-all duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link to="/menu" className="btn-secondary w-full">
              View Full Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-warm-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 font-heading">What Our <span className="text-warm-gold">Guests</span> Say</h2>
          </div>
          
          {isLoadingReviews ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="glass-panel h-64 rounded-2xl animate-pulse"></div>
                  ))}
               </div>
          ) : reviewsError || !reviews || reviews.length === 0 ? (
                <div className="text-center text-gray-400">
                    <p>No reviews yet. Be the first to share your experience!</p>
                </div>
          ) : (
            <div className="relative overflow-hidden group/marquee">
              <div className="animate-marquee py-10 flex gap-8">
                {/* Double the items for seamless loop */}
                {[...reviews, ...reviews, ...reviews].map((testimonial, index) => (
                  <div 
                    key={`${testimonial._id}-${index}`} 
                    className="glass-panel p-8 rounded-2xl relative w-[400px] flex-shrink-0 border border-white/5 hover:border-warm-gold/40 transition-all duration-300"
                  >
                    <div className="absolute -top-4 -left-4 text-6xl text-warm-gold/20 font-serif">"</div>
                    <div className="flex mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarSolidIcon
                          key={i}
                          className="h-4 w-4 text-warm-gold"
                        />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-8 italic text-lg leading-relaxed relative z-10 line-clamp-4">
                      {testimonial.comment}
                    </p>
                    <div className="flex items-center space-x-4 border-t border-white/10 pt-6">
                       <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-warm-gold/50 bg-gray-800 flex-shrink-0">
                         {testimonial.user?.avatar ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${testimonial.user.avatar}`}
                              alt={testimonial.user.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${testimonial.user.name}&background=random`;
                              }}
                            />
                         ) : (
                            <div className="w-full h-full bg-warm-gold/20 flex items-center justify-center text-warm-gold font-bold">
                                {testimonial.user?.name?.charAt(0) || 'U'}
                            </div>
                         )}
                       </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{testimonial.user?.name || 'Anonymous'}</h4>
                        <p className="text-xs text-warm-gold capitalize">
                            {testimonial.user?.role === 'admin' ? 'Admin' : 'Verified Customer'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Fade gradients for smooth entry/exit */}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-deep-black to-transparent z-10 pointer-events-none"></div>
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-deep-black to-transparent z-10 pointer-events-none"></div>
            </div>
          )}

        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-warm-gold/10 to-transparent opacity-50"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading">
                Join the <span className="text-organic-green">Garden</span> Community
              </h2>
              <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">
                Subscribe to our newsletter for exclusive offers, new menu launches, and healthy living tips.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="input-field rounded-full bg-deep-black/50 border-white/10"
                />
                <button className="btn-primary whitespace-nowrap px-8">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 font-heading">
            Ready for a <span className="text-warm-gold">Premium</span> Experience?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/menu" className="btn-primary px-10 py-4 text-lg shadow-neon">
              Start Ordering
            </Link>
            <Link
              to="/reservations"
              className="btn-secondary px-10 py-4 text-lg"
            >
              Book a Table
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

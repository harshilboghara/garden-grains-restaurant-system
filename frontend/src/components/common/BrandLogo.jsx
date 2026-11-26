import logoImg from "../../assets/logo.png";

const BrandLogo = ({ showText = true, size = "text-xl" }) => {
  return (
    <div className="flex items-center space-x-3">
      <img
        src={logoImg}
        alt="Garden Grains logo"
        className="object-contain w-12 h-12 rounded-full shadow-md"
      />
      {showText && (
        <div>
          <span className={`${size} font-bold text-dark-slate font-heading block tracking-wide`}>
            Garden<span className="text-warm-gold">Grains</span>
          </span>
          <span className="text-xs text-organic-green font-medium tracking-wider uppercase">
            Pure Veg • Organic
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;


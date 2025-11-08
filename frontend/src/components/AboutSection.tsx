import React, { useEffect, useRef, useState } from "react";

const AboutSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: "🏥",
      title: "Medicine Collection",
      description: "Collect unused medicines from individuals, pharmacies, and companies",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🔍",
      title: "AI Verification",
      description: "Advanced AI and pharmacist validation ensures medicine safety",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "🚚",
      title: "Smart Distribution",
      description: "Efficient redistribution to NGOs, hospitals, and patients in need",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "♻️",
      title: "Safe Disposal",
      description: "Environmentally responsible disposal of expired medicines",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Medicines Redistributed", icon: "💊" },
    { number: "500+", label: "Lives Impacted", icon: "❤️" },
    { number: "50+", label: "Partner Organizations", icon: "🤝" },
    { number: "95%", label: "Waste Reduction", icon: "🌱" }
  ];

  return (
    <section ref={sectionRef} id="about" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800 mb-4">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            How It Works
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
            Revolutionizing Healthcare
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              One Medicine at a Time
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            PharmaRevo creates a sustainable ecosystem where unused medicines find new purpose, 
            reducing waste while ensuring healthcare accessibility for all.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group transition-all duration-700 delay-${index * 100} ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100">
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className={`bg-white rounded-3xl p-8 lg:p-12 shadow-2xl transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Our Impact in Numbers
            </h3>
            <p className="text-lg text-gray-600">
              Making a difference in healthcare accessibility and environmental sustainability
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group cursor-pointer"
              >
                <div className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Flow */}
        <div className={`mt-20 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Simple 4-Step Process
            </h3>
            <p className="text-lg text-gray-600">
              From donation to distribution, we make it seamless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Donate", desc: "Upload medicine details", icon: "📤" },
              { step: "02", title: "Verify", desc: "AI & expert validation", icon: "✅" },
              { step: "03", title: "Match", desc: "Connect with recipients", icon: "🎯" },
              { step: "04", title: "Deliver", desc: "Safe & tracked delivery", icon: "🚚" }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <div className="text-sm font-bold text-blue-600 mb-2">STEP {item.step}</div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h4>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-2xl text-blue-400">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
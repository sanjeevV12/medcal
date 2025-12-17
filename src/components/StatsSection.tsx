import { Users, Ambulance, Clock, MapPin } from "lucide-react";

const stats = [
  {
    icon: Clock,
    value: "8 min",
    label: "Avg Response Time",
    description: "Faster than industry standard",
  },
  {
    icon: Users,
    value: "50,000+",
    label: "Lives Saved",
    description: "And counting every day",
  },
  {
    icon: Ambulance,
    value: "500+",
    label: "Ambulances",
    description: "Across major cities",
  },
  {
    icon: MapPin,
    value: "100+",
    label: "Cities Covered",
    description: "Pan-India presence",
  },
];

const StatsSection = () => {
  return (
    <section id="coverage" className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Trusted Across India
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Medcal is revolutionizing emergency medical response with cutting-edge technology and dedicated healthcare professionals.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-2xl p-6 text-center hover:bg-primary-foreground/15 transition-all duration-300"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-foreground/20 flex items-center justify-center mb-4">
                <stat.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-4xl font-bold text-primary-foreground mb-1">{stat.value}</div>
              <div className="text-lg font-medium text-primary-foreground mb-1">{stat.label}</div>
              <div className="text-sm text-primary-foreground/70">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;

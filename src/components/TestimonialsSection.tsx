import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "Emergency Physician",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    quote: "Medcal has revolutionized emergency response. The 12-minute guarantee saves countless lives. I've seen patients arrive stabilized because treatment began in the ambulance.",
    rating: 5,
    category: "doctor"
  },
  {
    name: "Amit Patel",
    role: "Ambulance Driver - 500+ Rescues",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote: "The real-time navigation and hospital coordination helps me reach patients faster. Every second counts, and Medcal's system ensures we never waste time.",
    rating: 5,
    category: "driver"
  },
  {
    name: "Sunita Devi",
    role: "Accident Survivor",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    quote: "After my accident, Medcal reached me in just 9 minutes. The EMI option meant I didn't have to worry about money during recovery. They truly saved my life.",
    rating: 5,
    category: "patient"
  },
  {
    name: "Dr. Rajesh Kumar",
    role: "Paramedic Team Lead",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    quote: "Our team is equipped with advanced life support equipment. Medcal's platform coordinates everything - from dispatch to hospital admission. It's seamless.",
    rating: 5,
    category: "team"
  },
  {
    name: "Meera Krishnan",
    role: "Mother of Accident Victim",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
    quote: "When my son had an accident, I was panicked. Medcal's team was calm, professional, and incredibly fast. The health insurance plan covers our family now.",
    rating: 5,
    category: "patient"
  },
  {
    name: "Vikram Singh",
    role: "Senior Nurse",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
    quote: "The medical assistance program - providing nurses and helpers at home - has helped so many patients recover faster. Medcal thinks beyond just emergencies.",
    rating: 5,
    category: "team"
  }
];

const categoryColors = {
  doctor: "from-primary to-primary/70",
  driver: "from-emergency to-emergency/70",
  patient: "from-accent to-accent/70",
  team: "from-primary to-accent"
};

const categoryLabels = {
  doctor: "Medical Expert",
  driver: "Rescue Hero",
  patient: "Life Saved",
  team: "Care Team"
};

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Heroes & Lives Saved
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real stories from doctors, drivers, team members, and patients whose lives have been touched by Medcal's 12-minute promise.
          </p>
        </div>

        {/* Stats banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16">
          {[
            { number: "50+", label: "Expert Doctors" },
            { number: "200+", label: "Trained Drivers" },
            { number: "10,000+", label: "Lives Saved" },
            { number: "4.9★", label: "Average Rating" }
          ].map((stat, i) => (
            <div key={i} className="bg-card rounded-2xl p-4 text-center shadow-card">
              <div className="text-2xl md:text-3xl font-bold text-primary">{stat.number}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Category badge */}
              <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl bg-gradient-to-r ${categoryColors[testimonial.category as keyof typeof categoryColors]} text-white text-xs font-medium`}>
                {categoryLabels[testimonial.category as keyof typeof categoryLabels]}
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/10" />
                <p className="text-muted-foreground text-sm leading-relaxed pl-4">
                  "{testimonial.quote}"
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Join thousands of satisfied patients and healthcare heroes
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex -space-x-2">
              {testimonials.slice(0, 4).map((t, i) => (
                <img
                  key={i}
                  src={t.image}
                  alt=""
                  className="w-8 h-8 rounded-full border-2 border-background"
                />
              ))}
            </div>
            <span className="text-foreground font-medium">+10,000 lives saved</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

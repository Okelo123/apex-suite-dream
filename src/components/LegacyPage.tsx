import heroImg from '@/assets/hero-estate.jpg';
import { useReviews } from '@/hooks/useReviews';
import { Star } from 'lucide-react';

export default function LegacyPage() {
  const { data: reviews = [], isLoading } = useReviews();

  return (
    <div className="animate-fade-in space-y-10">
      {/* Hero */}
      <div className="relative rounded-lg overflow-hidden h-64 md:h-96">
        <img src={heroImg} alt="Mileshi Horizon Estate" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gradient-gold">The Legacy</h1>
          <p className="text-sm text-foreground/80 mt-2 max-w-xl">
            Mileshi Horizon stands as a testament to sovereign luxury — where heritage meets modern opulence. 
            Nestled among pristine landscapes, our estate offers an unparalleled sanctuary for the discerning traveller.
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-gradient-gold">Our Heritage</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Founded on the principles of uncompromising excellence, Mileshi Horizon has been the premier destination 
            for distinguished guests seeking privacy, elegance, and world-class hospitality. Every detail — from the 
            hand-carved marble in our suites to the curated art collection in our galleries — reflects our commitment 
            to the extraordinary.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Our estate spans over 200 acres of manicured gardens, championship golf courses, and pristine waterways. 
            Each season brings new experiences, from sunset galas in the Grand Ballroom to intimate garden soirées 
            under starlit skies.
          </p>
        </div>
        <div className="space-y-4">
          <h2 className="font-display text-2xl text-gradient-gold">The Experience</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Suites', value: '12' },
              { label: 'Acres', value: '200+' },
              { label: 'Staff', value: '150' },
              { label: 'Years', value: '25' },
            ].map(s => (
              <div key={s.label} className="bg-gradient-card border border-border rounded-lg p-4 text-center">
                <p className="font-display text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div>
        <h2 className="font-display text-2xl text-gradient-gold mb-4">Guest Testimonials</h2>
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-gradient-card border border-border rounded-lg p-4 h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {reviews.map((r: any) => (
              <div key={r.id} className="bg-gradient-card border border-border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 italic">"{r.text}"</p>
                <p className="text-xs text-muted-foreground">— {r.guest_name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

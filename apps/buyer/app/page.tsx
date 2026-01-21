import { BrandHero } from '@/components/home/BrandHero';
import { VisualCategorySection } from '@/components/home/VisualCategorySection';
import { FeaturedServices } from '@/components/home/FeaturedServices';
import { PremiumAgencies } from '@/components/home/PremiumAgencies';
import { TrendingServices } from '@/components/home/TrendingServices';
import { AcademicSpotlight } from '@/components/home/AcademicSpotlight';
import { ShortsPreview } from '@/components/home/ShortsPreview';
import { CTASection } from '@/components/home/CTASection';
import { PromoCarousel } from '@/components/home/PromoCarousel';
import { SponsoredCarousel } from '@/components/home/SponsoredCarousel';
import { fetchHomepageSections } from '@/lib/data-service';

// Component Map for Dynamic Rendering
const SECTION_COMPONENTS: Record<string, React.FC<any>> = {
    'HERO': BrandHero,
    'PROMO_CAROUSEL': PromoCarousel,
    'SPONSORED_CAROUSEL': SponsoredCarousel,
    'CATEGORIES': VisualCategorySection,
    'FEATURED_SERVICES': FeaturedServices,
    'TOP_AGENCIES': PremiumAgencies,
    'TRENDING_SERVICES': TrendingServices,
    'ACADEMIC_SPOTLIGHT': AcademicSpotlight,
    'SHORTS': ShortsPreview,
    'CTA': CTASection,
    // Add more mappings as needed (e.g. TESTIMONIALS)
};

export default async function HomePage() {
    // 1. Fetch dynamic sections from DB (Already sorted by 'order')
    const sections = await fetchHomepageSections();

    // 2. If no sections exist (e.g. fresh DB), fallback to default layout
    if (!sections || sections.length === 0) {
        return (
            <>
                <BrandHero />
                <PromoCarousel />
                <SponsoredCarousel />
                <VisualCategorySection />
                <FeaturedServices />
                <PremiumAgencies />
                <TrendingServices />
                <AcademicSpotlight />
                <ShortsPreview />
                <CTASection />
            </>
        );
    }

    // 3. Render dynamic sections based on DB order
    return (
        <>
            {sections.map((section: any) => {
                const Component = SECTION_COMPONENTS[section.type];
                if (!Component) {
                    console.warn(`Unknown section type: ${section.type}`);
                    return null;
                }
                return <Component key={section.id} content={section} />;
            })}
        </>
    );
}

// Ensure the page revalidates frequently to show Admin updates
export const revalidate = 60; // Revalidate every 60 seconds

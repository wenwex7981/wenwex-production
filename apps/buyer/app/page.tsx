import { BrandHero } from '@/components/home/BrandHero';
import { VisualCategorySection } from '@/components/home/VisualCategorySection';
import { FeaturedServices } from '@/components/home/FeaturedServices';
import { PremiumAgencies } from '@/components/home/PremiumAgencies';
import { TrendingServices } from '@/components/home/TrendingServices';
import { ShortsPreview } from '@/components/home/ShortsPreview';
import { TeamSection } from '@/components/home/TeamSection';
import { PromoCarousel } from '@/components/home/PromoCarousel';
import { SponsoredCarousel } from '@/components/home/SponsoredCarousel';
import { fetchHomepageSections } from '@/lib/data-service';

export default async function HomePage() {
    const sections = await fetchHomepageSections();

    // Track which sections are present in the DB
    const sectionTypes = new Set(sections?.map((s: any) => s.type) || []);

    // Helper to render a section from DB data or use default
    const renderSection = (type: string, Component: React.FC<any>, key: string) => {
        const section = sections?.find((s: any) => s.type === type);
        if (section) {
            return <Component key={section.id} content={section} />;
        }
        return null;
    };

    // If no sections at all, show full default layout
    if (!sections || sections.length === 0) {
        return (
            <>
                <BrandHero />
                <PromoCarousel />
                <SponsoredCarousel />
                <VisualCategorySection mode="tech" />
                <FeaturedServices />
                <PremiumAgencies />
                <TrendingServices />
                <ShortsPreview />
                <TeamSection />
            </>
        );
    }

    // Render sections from DB + ensure critical sections always appear
    return (
        <>
            {/* HERO - from DB or default */}
            {sectionTypes.has('HERO') ? renderSection('HERO', BrandHero, 'hero') : <BrandHero />}

            {/* PROMO CAROUSEL - from DB or default */}
            {sectionTypes.has('PROMO_CAROUSEL') ? renderSection('PROMO_CAROUSEL', PromoCarousel, 'promo') : <PromoCarousel />}

            {/* SPONSORED CAROUSEL - from DB or default */}
            {sectionTypes.has('SPONSORED_CAROUSEL') ? renderSection('SPONSORED_CAROUSEL', SponsoredCarousel, 'sponsored') : <SponsoredCarousel />}

            {/* CATEGORIES - from DB or default */}
            {sectionTypes.has('CATEGORIES') ? renderSection('CATEGORIES', VisualCategorySection, 'categories') : <VisualCategorySection mode="tech" />}

            {/* FEATURED SERVICES - from DB or default */}
            {sectionTypes.has('FEATURED_SERVICES') ? renderSection('FEATURED_SERVICES', FeaturedServices, 'featured') : <FeaturedServices />}

            {/* TOP AGENCIES - from DB or default */}
            {sectionTypes.has('TOP_AGENCIES') ? renderSection('TOP_AGENCIES', PremiumAgencies, 'agencies') : <PremiumAgencies />}

            {/* TRENDING SERVICES - from DB or default */}
            {sectionTypes.has('TRENDING_SERVICES') ? renderSection('TRENDING_SERVICES', TrendingServices, 'trending') : <TrendingServices />}



            {/* SHORTS PREVIEW - ALWAYS SHOW (from DB or default) */}
            {sectionTypes.has('SHORTS') ? renderSection('SHORTS', ShortsPreview, 'shorts') : <ShortsPreview />}

            {/* TEAM - from DB or default */}
            {sectionTypes.has('TEAM') ? renderSection('TEAM', TeamSection, 'team') : <TeamSection />}
        </>
    );
}

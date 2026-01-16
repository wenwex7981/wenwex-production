import { BrandHero } from '@/components/home/BrandHero';
import { VisualCategorySection } from '@/components/home/VisualCategorySection';
import { FeaturedServices } from '@/components/home/FeaturedServices';
import { PremiumAgencies } from '@/components/home/PremiumAgencies';
import { TrendingServices } from '@/components/home/TrendingServices';
import { AcademicSpotlight } from '@/components/home/AcademicSpotlight';
import { ShortsPreview } from '@/components/home/ShortsPreview';
import { CTASection } from '@/components/home/CTASection';
import { PromoCarousel } from '@/components/home/PromoCarousel';
import { fetchHomepageSections } from '@/lib/data-service';

export default async function HomePage() {
    const sections = await fetchHomepageSections();

    if (!sections || sections.length === 0) {
        return (
            <>
                <BrandHero />
                <PromoCarousel />
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

    return (
        <>
            {sections.map((section: any) => {
                switch (section.type) {
                    case 'HERO':
                        return <BrandHero key={section.id} />;
                    case 'CATEGORIES':
                        return <VisualCategorySection key={section.id} content={section} />;
                    case 'FEATURED_SERVICES':
                        return <FeaturedServices key={section.id} content={section} />;
                    case 'TOP_AGENCIES':
                        return <PremiumAgencies key={section.id} content={section} />;
                    case 'TRENDING_SERVICES':
                        return <TrendingServices key={section.id} content={section} />;
                    case 'ACADEMIC_SPOTLIGHT':
                        return <AcademicSpotlight key={section.id} content={section} />;
                    case 'SHORTS':
                        return <ShortsPreview key={section.id} content={section} />;
                    case 'CTA':
                        return <CTASection key={section.id} content={section} />;
                    case 'PROMO_CAROUSEL':
                        return <PromoCarousel key={section.id} />;
                    default:
                        return null;
                }
            })}
        </>
    );
}

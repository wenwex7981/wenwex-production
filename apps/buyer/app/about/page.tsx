import { Metadata } from 'next';
import { fetchPageContent } from '@/lib/data-service';
import AboutPageClient from './AboutPageClient';

export async function generateMetadata(): Promise<Metadata> {
    const pageData = await fetchPageContent('about');
    return {
        title: pageData?.metaTitle || 'About Us | WENWEX',
        description: pageData?.metaDesc || 'Learn about WENWEX - the premier global marketplace for technology services.',
    };
}

export default async function AboutPage() {
    const pageData = await fetchPageContent('about');
    return <AboutPageClient pageData={pageData} />;
}

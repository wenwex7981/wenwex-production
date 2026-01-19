import { Metadata } from 'next';
import { fetchPageContent } from '@/lib/data-service';
import ContactPageClient from './ContactPageClient';

export async function generateMetadata(): Promise<Metadata> {
    const pageData = await fetchPageContent('contact');
    return {
        title: pageData?.metaTitle || 'Contact Us | WENWEX',
        description: pageData?.metaDesc || 'Get in touch with WENWEX. We\'re here to help with your technology needs.',
    };
}

export default async function ContactPage() {
    const pageData = await fetchPageContent('contact');
    return <ContactPageClient pageData={pageData} />;
}

import Link from 'next/link';
import {
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    ArrowRight
} from 'lucide-react';

const footerLinks = {
    services: [
        { label: 'Web Development', href: '/categories/web-application-development' },
        { label: 'Mobile Apps', href: '/categories/mobile-app-development' },
        { label: 'UI/UX Design', href: '/categories/ui-ux-product-design' },
        { label: 'AI Solutions', href: '/categories/ai-data-solutions' },
        { label: 'Cloud & DevOps', href: '/categories/cloud-devops' },
    ],
    academic: [
        { label: 'Mini Projects', href: '/categories/mini-projects' },
        { label: 'Major Projects', href: '/categories/major-projects' },
        { label: 'Research Papers', href: '/categories/research-papers' },
        { label: 'Assignments', href: '/categories/assignments' },
        { label: 'Internship Help', href: '/categories/internship-assistance' },
    ],
    company: [
        { label: 'About Us', href: '/about' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'For Agencies', href: '/become-vendor' },
        { label: 'Careers', href: '/careers' },
        { label: 'Contact', href: '/contact' },
    ],
    support: [
        { label: 'Help Center', href: '/help' },
        { label: 'FAQs', href: '/faqs' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Refund Policy', href: '/refund' },
    ],
};

const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
];

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Newsletter Section */}
            <div className="border-b border-gray-800">
                <div className="container-custom py-12">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <div className="text-center lg:text-left">
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Subscribe to our newsletter
                            </h3>
                            <p className="text-gray-400">
                                Get the latest updates on new services and special offers
                            </p>
                        </div>
                        <form className="flex w-full max-w-md gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                            />
                            <button type="submit" className="btn-primary whitespace-nowrap">
                                Subscribe
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="container-custom py-16">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-6 group">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-black/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden bg-white">
                                <img src="/logo.png" alt="WENWEX" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col leading-none">
                                <span className="text-xl font-black text-white tracking-tighter">
                                    WENWEX
                                </span>
                                <span className="text-[8px] font-bold text-primary-500 tracking-[0.2em] ml-0.5 uppercase">PLATFORM</span>
                            </div>
                        </Link>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Global tech-commerce marketplace where verified agencies and academic
                            service providers sell services as structured products.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <a
                                href="mailto:wenvex19@gmail.com"
                                className="flex items-center gap-3 text-gray-400 hover:text-primary-400 transition-colors"
                            >
                                <Mail className="w-5 h-5" />
                                <span>wenvex19@gmail.com</span>
                            </a>
                            <a
                                href="tel:+917981994870"
                                className="flex items-center gap-3 text-gray-400 hover:text-primary-400 transition-colors"
                            >
                                <Phone className="w-5 h-5" />
                                <span>+91 7981994870</span>
                            </a>
                        </div>

                        {/* Social Links */}
                        <div className="flex gap-3 mt-6">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:bg-primary-500 hover:text-white transition-all"
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* IT Services */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">IT Services</h4>
                        <ul className="space-y-3">
                            {footerLinks.services.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Academic */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Academic</h4>
                        <ul className="space-y-3">
                            {footerLinks.academic.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="container-custom py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-500 text-sm text-center md:text-left">
                            © {new Date().getFullYear()} WENVEX. All rights reserved.
                            A product of{' '}
                            <span className="text-gray-400 font-medium">
                                Project Genie Tech Solutions
                            </span>
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                            <Link href="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">
                                Terms
                            </Link>
                            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">
                                Privacy
                            </Link>
                            <Link href="/cookies" className="text-gray-500 hover:text-gray-300 transition-colors">
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

'use client';

import { motion } from 'framer-motion';
import { Users, Linkedin, Github, Twitter } from 'lucide-react';

interface TeamMember {
    name: string;
    role: string;
    image: string;
    linkedin?: string;
    github?: string;
}

interface TeamSectionProps {
    content?: {
        title?: string;
        subtitle?: string;
        config?: {
            members?: TeamMember[];
        }
    }
}

const defaultMembers: TeamMember[] = [
    {
        name: "Appala Nithin",
        role: "Founder & CEO",
        image: "https://ui-avatars.com/api/?name=Appala+Nithin&background=0c8bff&color=fff&size=400",
        linkedin: "#",
    },
    {
        name: "Sarah Chen",
        role: "Head of Technology",
        image: "https://ui-avatars.com/api/?name=Sarah+Chen&background=6366f1&color=fff&size=400",
        linkedin: "#",
    },
    {
        name: "Marcus Rodriguez",
        role: "Product Strategy",
        image: "https://ui-avatars.com/api/?name=Marcus+Rodriguez&background=10b981&color=fff&size=400",
    },
    {
        name: "Aman Gupta",
        role: "Global Operations",
        image: "https://ui-avatars.com/api/?name=Aman+Gupta&background=f59e0b&color=fff&size=400",
    },
    {
        name: "Elena Petrov",
        role: "Lead Architect",
        image: "https://ui-avatars.com/api/?name=Elena+Petrov&background=ec4899&color=fff&size=400",
    }
];

export function TeamSection({ content }: TeamSectionProps) {
    const title = content?.title || "Our Visionary Leadership & Team";
    const subtitle = content?.subtitle || "Meet the experts building the future of global tech commerce at WENWEX.";
    const members = content?.config?.members || defaultMembers;

    // Triple the members for a seamless loop
    const scrollMembers = [...members, ...members, ...members];

    return (
        <section className="py-20 bg-[#0a0a0b] relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            </div>

            <div className="container-custom relative z-10 mb-12">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-primary-500" />
                        <span className="text-primary-500 font-bold uppercase tracking-widest text-xs">The People Behind WENWEX</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        {title}
                    </h2>
                    <p className="text-gray-400 text-lg">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Horizontal Auto-Scrolling Marquee */}
            <div className="relative flex overflow-hidden">
                <motion.div
                    className="flex gap-6 py-4"
                    animate={{ x: [0, -100 * members.length + "%"] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30, // Adjust speed here
                            ease: "linear",
                        },
                    }}
                    style={{ width: "fit-content" }}
                >
                    {scrollMembers.map((member, idx) => (
                        <div
                            key={`${member.name}-${idx}`}
                            className="w-72 md:w-80 flex-shrink-0 group"
                        >
                            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-3xl overflow-hidden hover:border-primary-500/50 transition-all duration-500 p-4">
                                <div className="aspect-square rounded-2xl overflow-hidden mb-6 relative">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                                    />
                                    {/* Social Links Overlay */}
                                    <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button className="w-10 h-10 rounded-full bg-white text-primary-600 flex items-center justify-center hover:scale-110 transition-transform">
                                            <Linkedin className="w-5 h-5" />
                                        </button>
                                        <button className="w-10 h-10 rounded-full bg-white text-primary-600 flex items-center justify-center hover:scale-110 transition-transform">
                                            <Github className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="px-2 pb-2">
                                    <h4 className="text-xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">
                                        {member.name}
                                    </h4>
                                    <p className="text-gray-500 font-medium">
                                        {member.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Gradient Mask for Fade Effect */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0a0a0b] to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0a0a0b] to-transparent z-10 pointer-events-none" />
        </section>
    );
}

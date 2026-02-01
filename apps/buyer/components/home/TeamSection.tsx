'use client';
// Deployment Trigger: 2026-01-27 12:51 (GMT+5:30)

import { useState, useEffect } from 'react';
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
        name: "Appala Nithin Patel",
        role: "Founder & CEO",
        image: "/founder-profile.jpg",
        linkedin: "#",
    },
    {
        name: "Sarah Chen",
        role: "Head of Technology",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        linkedin: "#",
    },
    {
        name: "Marcus Rodriguez",
        role: "Product Strategy",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    },
    {
        name: "Aman Gupta",
        role: "Global Operations",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    },
    {
        name: "Elena Petrov",
        role: "Lead Architect",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    }
];

export function TeamSection({ content }: TeamSectionProps) {
    const title = content?.title || "Our Visionary Leadership & Team";
    const subtitle = content?.subtitle || "Meet the experts building the future of global tech commerce at WENWEX.";
    const [members, setMembers] = useState<TeamMember[]>(content?.config?.members || defaultMembers);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch team members from database
    useEffect(() => {
        async function fetchTeamMembers() {
            try {
                const response = await fetch('/api/team-members');
                if (response.ok) {
                    const result = await response.json();
                    if (result.data && result.data.length > 0) {
                        // Map database fields to component interface
                        const dbMembers: TeamMember[] = result.data.map((member: any) => ({
                            name: member.name,
                            role: member.role,
                            image: member.image_url,
                            linkedin: member.linkedin_url,
                            github: member.github_url
                        }));
                        setMembers(dbMembers);
                    }
                }
            } catch (error) {
                console.error('Error fetching team members:', error);
                // Keep default members on error
            } finally {
                setIsLoading(false);
            }
        }

        // Only fetch if not using custom content members
        if (!content?.config?.members) {
            fetchTeamMembers();
        } else {
            setIsLoading(false);
        }
    }, [content?.config?.members]);

    // We need at least 10 items to fill the screen for a smooth loop usually, or just double it and use % animate
    const scrollMembers = [...members, ...members, ...members, ...members];

    return (
        <section className="py-24 bg-[#0a0a0b] relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container-custom relative z-10 mb-16">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-2 mb-4"
                    >
                        <div className="w-8 h-[1px] bg-primary-500" />
                        <span className="text-primary-500 font-bold uppercase tracking-[0.2em] text-[10px]">The People Behind WENWEX</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
                    >
                        {title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed"
                    >
                        {subtitle}
                    </motion.p>
                </div>
            </div>

            {/* Horizontal Auto-Scrolling Marquee */}
            <div className="relative flex overflow-hidden select-none">
                <motion.div
                    className="flex gap-8 py-8"
                    animate={{ x: [0, "-50%"] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 60, // Very slow and premium
                            ease: "linear",
                        },
                    }}
                    style={{ width: "max-content" }}
                >
                    {scrollMembers.map((member, idx) => (
                        <div
                            key={`${member.name}-${idx}`}
                            className="w-72 md:w-80 flex-shrink-0 group"
                        >
                            <div className="bg-gray-900/40 backdrop-blur-md border border-gray-800/50 rounded-[2.5rem] overflow-hidden hover:border-primary-500/40 transition-all duration-700 p-5 relative">
                                {/* Subtle card glow */}
                                <div className="absolute -inset-1 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur" />

                                <div className="aspect-square rounded-[2rem] overflow-hidden mb-8 relative z-10">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
                                    />
                                    {/* Glass Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                                        <div className="flex gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-primary-500 hover:border-primary-500 transition-all">
                                                <Linkedin className="w-5 h-5" />
                                            </button>
                                            <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-gray-800 hover:border-gray-700 transition-all">
                                                <Github className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-2 pb-2 relative z-10 text-center">
                                    <h4 className="text-2xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors duration-500">
                                        {member.name}
                                    </h4>
                                    <p className="text-gray-500 font-medium tracking-wide text-sm uppercase">
                                        {member.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Side Fades */}
                <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/80 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#0a0a0b] via-[#0a0a0b]/80 to-transparent z-10" />
            </div>
        </section>
    );
}

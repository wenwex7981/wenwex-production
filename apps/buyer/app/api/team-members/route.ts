// API Route for Team Members Management
// Path: apps/buyer/app/api/team-members/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client on-demand to avoid build-time issues
function getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase credentials not configured');
    }

    return createClient(supabaseUrl, supabaseKey);
}

// GET - Fetch all active team members
export async function GET() {
    try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('team_members')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching team members:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: data || [] });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new team member (Admin only)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, role, image_url, linkedin_url, github_url, twitter_url, display_order } = body;

        if (!name || !role || !image_url) {
            return NextResponse.json(
                { error: 'Name, role, and image_url are required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseClient();
        const { data, error } = await supabase
            .from('team_members')
            .insert([{
                name,
                role,
                image_url,
                linkedin_url,
                github_url,
                twitter_url,
                display_order: display_order || 0,
                is_active: true
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating team member:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
